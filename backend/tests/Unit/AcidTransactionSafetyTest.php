<?php

namespace Tests\Unit;

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
use App\Services\Scraper\Contracts\GeocodingServiceInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\Pipeline\OfferSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AcidTransactionSafetyTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        StoreBranch::flushEventListeners();
        User::flushEventListeners();
        ProductStoreOffer::flushEventListeners();
        AffiliateStore::flushEventListeners();
        \App\Models\SecurityAuditLog::flushEventListeners();
        parent::tearDown();
    }

    public function test_business_store_register_rolls_back_atomically_if_branch_fails(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        $request = Request::create('/api/v1/business/store/register', 'POST', [
            'store_name' => 'Farmacia El Triunfo',
            'whatsapp' => '+584141112233',
            'address' => 'Av. Principal Local 1',
            'city' => 'Valle de la Pascua',
            'state' => 'Guárico',
        ]);
        $request->setUserResolver(fn () => $user);

        // Inject model event failure on StoreBranch to simulate database exception during branch creation
        StoreBranch::saving(function () {
            throw new \RuntimeException("Simulated DB connection failure during StoreBranch insertion");
        });

        $controller = new BusinessStoreController();

        try {
            $controller->register($request);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated DB connection failure", $e->getMessage());
        }

        // Verify that AffiliateStore was NOT created (no orphaned store)
        $this->assertDatabaseMissing('affiliate_stores', [
            'name' => 'Farmacia El Triunfo',
        ]);

        // Verify that user role was NOT promoted (remains STANDARD_USER)
        $this->assertEquals(UserRole::STANDARD_USER, $user->fresh()->role);
    }

    public function test_store_directory_suggest_rolls_back_atomically_if_branch_fails(): void
    {
        $request = Request::create('/api/v1/stores/suggest', 'POST', [
            'store_name' => 'Perfumería La Guariqueña',
            'category' => 'BEAUTY_SHOP',
            'state' => 'Guárico',
            'city' => 'Calabozo',
            'address' => 'Carrera 12 con Calle 5',
        ]);

        StoreBranch::saving(function () {
            throw new \RuntimeException("Simulated crash during branch creation in suggest");
        });

        $controller = new StoreDirectoryController();

        try {
            $controller->suggest($request);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated crash during branch creation", $e->getMessage());
        }

        // Verify that no orphaned store was committed
        $this->assertDatabaseMissing('affiliate_stores', [
            'name' => 'Perfumería La Guariqueña (Calabozo)',
        ]);
    }

    public function test_business_store_claim_rolls_back_atomically_on_failure(): void
    {
        $store = AffiliateStore::create([
            'name' => 'Tienda Para Reclamar',
            'slug' => 'tienda-para-reclamar',
            'website_url' => 'https://test.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'owner_id' => null,
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        $request = Request::create('/api/v1/business/store/claim', 'POST', [
            'store_id' => $store->id,
            'whatsapp' => '+584145556677',
        ]);
        $request->setUserResolver(fn () => $user);

        // Simulate failure on User update
        User::saving(function ($model) use ($user) {
            if ($model->id === $user->id && $model->isDirty('role')) {
                throw new \RuntimeException("Simulated user role promotion DB constraint failure");
            }
        });

        $controller = new BusinessStoreController();

        try {
            $controller->claim($request);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated user role promotion", $e->getMessage());
        }

        // Verify that store ownership was rolled back
        $freshStore = $store->fresh();
        $this->assertNull($freshStore->owner_id);
        $this->assertNull($freshStore->whatsapp_contact);

        // Verify user role remains STANDARD_USER
        $this->assertEquals(UserRole::STANDARD_USER, $user->fresh()->role);
    }

    public function test_bulk_update_prices_rolls_back_atomically_on_failure(): void
    {
        $merchant = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        $store = AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'Tienda Precios Test',
            'slug' => 'tienda-precios-test',
            'website_url' => 'https://precios.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $brand = Brand::create(['name' => 'Brand Test', 'slug' => 'brand-test', 'is_verified' => true]);
        $product1 = Product::create(['brand_id' => $brand->id, 'name' => 'Prod 1', 'slug' => 'prod-1', 'is_verified' => true]);
        $product2 = Product::create(['brand_id' => $brand->id, 'name' => 'Prod 2', 'slug' => 'prod-2', 'is_verified' => true]);

        $offer1 = ProductStoreOffer::create([
            'store_id' => $store->id,
            'product_id' => $product1->id,
            'product_url' => 'https://precios.com/p1',
            'affiliate_url' => 'https://precios.com/p1',
            'price' => 10.00,
            'price_ves' => 360.00,
            'currency' => 'USD',
            'in_stock' => true,
        ]);

        $offer2 = ProductStoreOffer::create([
            'store_id' => $store->id,
            'product_id' => $product2->id,
            'product_url' => 'https://precios.com/p2',
            'affiliate_url' => 'https://precios.com/p2',
            'price' => 20.00,
            'price_ves' => 720.00,
            'currency' => 'USD',
            'in_stock' => true,
        ]);

        // Fail midway on offer2 update
        ProductStoreOffer::updating(function ($offer) use ($offer2) {
            if ($offer->id === $offer2->id) {
                throw new \RuntimeException("Simulated price tearing deadlock on offer 2");
            }
        });

        $request = Request::create('/api/v1/business/offers/bulk-prices', 'POST', [
            'exchange_rate' => 50.00,
        ]);
        $request->setUserResolver(fn () => $merchant);

        $controller = new BusinessOfferController();

        try {
            $controller->bulkUpdatePrices($request);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated price tearing deadlock", $e->getMessage());
        }

        // Verify offer1 was NOT updated (prevented price tearing)
        $this->assertEquals(360.00, $offer1->fresh()->price_ves);
        $this->assertEquals(720.00, $offer2->fresh()->price_ves);
    }

    public function test_admin_store_toggle_status_rolls_back_atomically_on_failure(): void
    {
        $admin = User::factory()->create(['role' => UserRole::SUPER_ADMIN, 'is_active' => true]);
        $store = AffiliateStore::create([
            'name' => 'Tienda Toggle Test',
            'slug' => 'tienda-toggle-test',
            'website_url' => 'https://toggle.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => 'Sede Toggle',
            'slug' => 'sede-toggle',
            'state' => 'Guárico',
            'city' => 'VLP',
            'address' => 'Calle 1',
            'latitude' => 9.2150,
            'longitude' => -66.0100,
            'is_active' => true,
        ]);

        // Throw error during audit log creation within the transaction
        \App\Models\SecurityAuditLog::creating(function () {
            throw new \RuntimeException("Simulated DB lock while recording security audit log");
        });

        $request = Request::create("/api/v1/admin/stores/{$store->id}/toggle-status", 'PATCH');
        $request->setUserResolver(fn () => $admin);

        $controller = new AdminStoreController();

        try {
            $controller->toggleStatus($request, $store->id);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated DB lock while recording security audit log", $e->getMessage());
        }

        // Store must remain active because transaction rolled back
        $this->assertTrue($store->fresh()->is_active);
        $this->assertTrue($branch->fresh()->is_active);
    }

    public function test_offer_sync_service_sync_offer_rolls_back_atomically_on_failure(): void
    {
        $store = AffiliateStore::create([
            'name' => 'Tienda Scraper Test',
            'slug' => 'tienda-scraper-test',
            'website_url' => 'https://scraper.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $geocodingMock = $this->createMock(GeocodingServiceInterface::class);
        $syncService = new OfferSyncService($geocodingMock);

        $dto = new ScrapedProductOfferDTO(
            storeSlug: 'tienda-scraper-test',
            productName: 'Producto Atómico Scraper',
            brandName: 'Marca Atómica Scraper',
            price: 25.00,
            currency: 'USD',
            barcodeEan: '9988776655443',
            inStock: true
        );

        // Fail when saving ProductStoreOffer
        ProductStoreOffer::saving(function () {
            throw new \RuntimeException("Simulated crash during ProductStoreOffer saving");
        });

        try {
            $syncService->syncOffer($dto);
            $this->fail("Expected RuntimeException was not thrown");
        } catch (\RuntimeException $e) {
            $this->assertStringContainsString("Simulated crash during ProductStoreOffer saving", $e->getMessage());
        }

        // The brand and product creations must have been rolled back cleanly
        $this->assertDatabaseMissing('products', [
            'barcode_ean' => '9988776655443',
        ]);
        $this->assertDatabaseMissing('brands', [
            'name' => 'Marca Atómica Scraper',
        ]);
    }
}
