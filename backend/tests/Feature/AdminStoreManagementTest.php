<?php

namespace Tests\Feature;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Store\Enums\StoreSubscriptionTier;
use App\Models\AffiliateStore;
use App\Models\StoreBranch;
use App\Models\User;
use Database\Seeders\AdminAndSecuritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminStoreManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminAndSecuritySeeder::class);
    }

    /** @test */
    public function unauthenticated_user_cannot_access_admin_stores()
    {
        $response = $this->getJson('/api/v1/admin/stores');
        $response->assertStatus(401);
    }

    /** @test */
    public function business_owner_or_standard_user_cannot_access_admin_stores()
    {
        $merchant = User::factory()->create([
            'role' => UserRole::BUSINESS_OWNER,
            'is_active' => true,
        ]);

        Sanctum::actingAs($merchant);

        $response = $this->getJson('/api/v1/admin/stores');
        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_list_stores_with_counts_and_filters()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        // Crear una tienda verificada y una pendiente
        AffiliateStore::create([
            'name' => 'Farmacia San Rafael',
            'slug' => 'farmacia-san-rafael',
            'website_url' => 'https://sanrafael.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_independent' => true,
            'verification_status' => 'PENDING_REVIEW',
            'is_active' => false,
        ]);

        AffiliateStore::create([
            'name' => 'DermoCenter',
            'slug' => 'dermocenter',
            'website_url' => 'https://dermocenter.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_independent' => true,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/admin/stores?verification_status=PENDING_REVIEW');
        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('summary.pending_review', 1)
            ->assertJsonCount(1, 'stores.data')
            ->assertJsonPath('stores.data.0.name', 'Farmacia San Rafael');
    }

    /** @test */
    public function admin_can_verify_and_approve_store()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $store = AffiliateStore::create([
            'name' => 'Farmacia Nueva Alianza',
            'slug' => 'farmacia-nueva-alianza',
            'website_url' => 'https://alianza.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_independent' => true,
            'verification_status' => 'PENDING_REVIEW',
            'is_active' => false,
        ]);

        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => 'Sede 1',
            'slug' => 'sede-1',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Calle Central',
            'latitude' => 9.21,
            'longitude' => -66.01,
            'is_active' => false,
        ]);

        $response = $this->patchJson("/api/v1/admin/stores/{$store->id}/verification", [
            'verification_status' => 'VERIFIED',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('store.verification_status', 'VERIFIED');

        $this->assertDatabaseHas('affiliate_stores', [
            'id' => $store->id,
            'verification_status' => 'VERIFIED',
            'is_active' => true,
        ]);

        $this->assertTrue($branch->fresh()->is_active);

        // Verificar log de auditoría
        $this->assertDatabaseHas('security_audit_logs', [
            'event_type' => 'STORE_VERIFICATION_UPDATED',
            'resource_target' => "store:{$store->id}",
        ]);
    }

    /** @test */
    public function admin_can_update_store_subscription_tier_and_featured_flag()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $store = AffiliateStore::create([
            'name' => 'Farmacia Pro Star',
            'slug' => 'farmacia-pro-star',
            'website_url' => 'https://prostar.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_independent' => true,
            'verification_status' => 'VERIFIED',
            'subscription_tier' => StoreSubscriptionTier::FREE->value,
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/v1/admin/stores/{$store->id}/subscription", [
            'subscription_tier' => 'PRO_LOCAL',
            'is_featured' => true,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('store.subscription_tier', 'PRO_LOCAL')
            ->assertJsonPath('store.is_featured', true);

        $this->assertDatabaseHas('affiliate_stores', [
            'id' => $store->id,
            'subscription_tier' => 'PRO_LOCAL',
            'is_featured' => true,
        ]);
    }

    /** @test */
    public function admin_can_toggle_store_active_status()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $store = AffiliateStore::create([
            'name' => 'Tienda Temporal',
            'slug' => 'tienda-temporal',
            'website_url' => 'https://temporal.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/v1/admin/stores/{$store->id}/toggle-status");
        $response->assertStatus(200)
            ->assertJsonPath('is_active', false);

        $this->assertFalse($store->fresh()->is_active);
    }
}
