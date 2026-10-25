<?php
/**
 * ACID Transactions Empirical Stress Test Harness
 * 
 * Injects failures into compound database operations to verify rollback guarantees.
 */

require_once __DIR__ . '/../../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../../backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Domain\Auth\Enums\UserRole;
use App\Http\Controllers\Api\Admin\AdminStoreController;
use App\Http\Controllers\Api\Business\BusinessOfferController;
use App\Http\Controllers\Api\Business\BusinessStoreController;
use App\Http\Controllers\Api\StoreDirectoryController;
use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

echo "=================================================================\n";
echo "      ACID TRANSACTIONS EMPIRICAL STRESS TEST HARNESS            \n";
echo "=================================================================\n\n";

$results = [];

// --- SCENARIO 1: Store Registration with Branch Crash ---
echo "[ACID 1] Store Registration: Injected crash on Branch creation...\n";
try {
    $user1 = User::factory()->create(['role' => UserRole::STANDARD_USER, 'is_active' => true]);

    $req1 = Request::create('/api/v1/business/store/register', 'POST', [
        'store_name' => 'Farmacia Rollback Test 1',
        'whatsapp' => '+584149998877',
        'address' => 'Calle Principal 10',
        'city' => 'Caracas',
        'state' => 'Distrito Capital',
    ]);
    $req1->setUserResolver(fn() => $user1);

    // Inject listener on StoreBranch
    StoreBranch::saving(function () {
        throw new \RuntimeException("INJECTED_BRANCH_FAIL");
    });

    $controller = new BusinessStoreController();
    $caught = false;
    try {
        $controller->register($req1);
    } catch (\RuntimeException $e) {
        if ($e->getMessage() === 'INJECTED_BRANCH_FAIL') {
            $caught = true;
        }
    }

    // Reset model dispatcher
    StoreBranch::flushEventListeners();

    $storeExists = AffiliateStore::where('name', 'Farmacia Rollback Test 1')->exists();
    $roleUnchanged = $user1->fresh()->role === UserRole::STANDARD_USER;

    echo "  -> Exception Caught: " . ($caught ? "YES" : "NO") . "\n";
    echo "  -> Orphan Store Committed: " . ($storeExists ? "YES (FAILED)" : "NO (ROLLED BACK)") . "\n";
    echo "  -> User Role Tampered: " . ($roleUnchanged ? "NO (ROLLED BACK)" : "YES (FAILED)") . "\n";

    $pass1 = $caught && !$storeExists && $roleUnchanged;
    echo "  -> Verdict: " . ($pass1 ? "PASS [ACID ATOMIC]" : "FAIL") . "\n\n";
    $results['register_rollback'] = $pass1;

} catch (\Throwable $e) {
    echo "  -> UNHANDLED EXCEPTION: " . $e->getMessage() . "\n\n";
    $results['register_rollback'] = false;
}

// --- SCENARIO 2: Bulk Pricing: Price Tearing Deadlock Simulation ---
echo "[ACID 2] Bulk Price Update: Injected deadlock midway on second offer...\n";
try {
    $merchant = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
    $store2 = AffiliateStore::create([
        'owner_id' => $merchant->id,
        'name' => 'Farmacia Bulk ACID Test',
        'slug' => 'farmacia-bulk-acid-test',
        'website_url' => 'https://bulkacid.com',
        'store_type' => 'PHYSICAL',
        'country_code' => 'VE',
        'is_active' => true,
    ]);

    $brand = Brand::firstOrCreate(['slug' => 'test-brand'], ['name' => 'Test Brand', 'is_verified' => true]);
    $p1 = Product::create(['brand_id' => $brand->id, 'name' => 'Prod ACID 1', 'slug' => 'prod-acid-1', 'is_verified' => true]);
    $p2 = Product::create(['brand_id' => $brand->id, 'name' => 'Prod ACID 2', 'slug' => 'prod-acid-2', 'is_verified' => true]);

    $off1 = ProductStoreOffer::create([
        'store_id' => $store2->id,
        'product_id' => $p1->id,
        'product_url' => 'https://bulkacid.com/p1',
        'affiliate_url' => 'https://bulkacid.com/p1',
        'price' => 10.00,
        'price_ves' => 360.00,
        'currency' => 'USD',
        'in_stock' => true,
    ]);
    $off2 = ProductStoreOffer::create([
        'store_id' => $store2->id,
        'product_id' => $p2->id,
        'product_url' => 'https://bulkacid.com/p2',
        'affiliate_url' => 'https://bulkacid.com/p2',
        'price' => 20.00,
        'price_ves' => 720.00,
        'currency' => 'USD',
        'in_stock' => true,
    ]);

    ProductStoreOffer::updating(function ($offer) use ($off2) {
        if ($offer->id === $off2->id) {
            throw new \RuntimeException("INJECTED_PRICE_TEARING_FAIL");
        }
    });

    $req2 = Request::create('/api/v1/business/offers/bulk-prices', 'POST', [
        'exchange_rate' => 50.00,
    ]);
    $req2->setUserResolver(fn() => $merchant);

    $offerController = new BusinessOfferController();
    $caught2 = false;
    try {
        $offerController->bulkUpdatePrices($req2);
    } catch (\RuntimeException $e) {
        if ($e->getMessage() === 'INJECTED_PRICE_TEARING_FAIL') {
            $caught2 = true;
        }
    }

    ProductStoreOffer::flushEventListeners();

    $off1Fresh = $off1->fresh();
    $off2Fresh = $off2->fresh();

    $price1Unchanged = (float)$off1Fresh->price_ves === 360.00;
    $price2Unchanged = (float)$off2Fresh->price_ves === 720.00;

    echo "  -> Exception Caught: " . ($caught2 ? "YES" : "NO") . "\n";
    echo "  -> Offer 1 Price Tearing Prevented: " . ($price1Unchanged ? "YES (360.00 VES preserved)" : "NO") . "\n";
    echo "  -> Offer 2 Price Preserved: " . ($price2Unchanged ? "YES (720.00 VES preserved)" : "NO") . "\n";

    $pass2 = $caught2 && $price1Unchanged && $price2Unchanged;
    echo "  -> Verdict: " . ($pass2 ? "PASS [NO PRICE TEARING]" : "FAIL") . "\n\n";
    $results['price_tearing_rollback'] = $pass2;

} catch (\Throwable $e) {
    echo "  -> UNHANDLED EXCEPTION: " . $e->getMessage() . "\n\n";
    $results['price_tearing_rollback'] = false;
}

// --- SCENARIO 3: Store Destruction Cascade Rollback ---
echo "[ACID 3] Admin Store Purge: Injected failure on Audit Log recording...\n";
try {
    $admin = User::factory()->create(['role' => UserRole::SUPER_ADMIN, 'is_active' => true]);
    $store3 = AffiliateStore::create([
        'name' => 'Tienda Purgable Test',
        'slug' => 'tienda-purgable-test',
        'website_url' => 'https://purge.com',
        'store_type' => 'PHYSICAL',
        'country_code' => 'VE',
        'is_active' => true,
    ]);
    $store3Id = $store3->id;

    \App\Models\SecurityAuditLog::creating(function () {
        throw new \RuntimeException("INJECTED_AUDIT_LOG_LOCK");
    });

    $adminController = new AdminStoreController();
    $req3 = Request::create("/api/v1/admin/stores/{$store3Id}", 'DELETE');
    $req3->setUserResolver(fn() => $admin);

    $caught3 = false;
    try {
        $adminController->destroy($req3, $store3Id);
    } catch (\RuntimeException $e) {
        if ($e->getMessage() === 'INJECTED_AUDIT_LOG_LOCK') {
            $caught3 = true;
        }
    }

    \App\Models\SecurityAuditLog::flushEventListeners();

    $storeStillExists = AffiliateStore::where('id', $store3Id)->exists();
    echo "  -> Exception Caught: " . ($caught3 ? "YES" : "NO") . "\n";
    echo "  -> Store Deletion Rolled Back: " . ($storeStillExists ? "YES (STILL EXISTS)" : "NO (PURGED)") . "\n";

    $pass3 = $caught3 && $storeStillExists;
    echo "  -> Verdict: " . ($pass3 ? "PASS [ATOMIC ROLLBACK ON AUDIT FAILURE]" : "FAIL") . "\n\n";
    $results['purge_rollback'] = $pass3;

} catch (\Throwable $e) {
    echo "  -> UNHANDLED EXCEPTION: " . $e->getMessage() . "\n\n";
    $results['purge_rollback'] = false;
}

echo "=================================================================\n";
$allAcidPassed = !in_array(false, $results, true);
if ($allAcidPassed) {
    echo "🎉 ALL ACID TRANSACTION EMPIRICAL STRESS TESTS PASSED!\n";
} else {
    echo "❌ SOME ACID TESTS FAILED!\n";
}
echo "=================================================================\n";

exit($allAcidPassed ? 0 : 1);
