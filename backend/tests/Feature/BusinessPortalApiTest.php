<?php

namespace Tests\Feature;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Store\Enums\StoreSubscriptionTier;
use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Models\StoreLeadInteraction;
use App\Models\User;
use Database\Seeders\AdminAndSecuritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BusinessPortalApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminAndSecuritySeeder::class);
    }

    /** @test */
    public function unauthenticated_requests_to_business_endpoints_fail()
    {
        $response = $this->getJson('/api/v1/business/store');
        $response->assertStatus(401);
    }

    /** @test */
    public function standard_user_cannot_access_business_management_endpoints()
    {
        $user = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/business/store');
        $response->assertStatus(403);
    }

    /** @test */
    public function authenticated_user_can_register_a_business_store()
    {
        $user = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/business/store/register', [
            'store_name' => 'Farmacia Dermocosmética Central',
            'website_url' => 'https://dermocentral.com',
            'instagram_handle' => '@dermocentral',
            'whatsapp' => '+584121234567',
            'address' => 'Av. Rómulo Gallegos, Edif. Apolo, Local 1',
            'city' => 'Valle de la Pascua',
            'state' => 'Guárico',
            'latitude' => 9.2155,
            'longitude' => -66.0123,
            'phone' => '+582381234567',
            'opening_hours' => 'Lunes a Sábado: 8am - 6pm',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('store.name', 'Farmacia Dermocosmética Central')
            ->assertJsonPath('primary_branch.city', 'Valle de la Pascua');

        $this->assertDatabaseHas('affiliate_stores', [
            'owner_id' => $user->id,
            'name' => 'Farmacia Dermocosmética Central',
            'whatsapp_contact' => '+584121234567',
            'subscription_tier' => 'FREE',
        ]);

        // Verificar que el usuario fue promovido a BUSINESS_OWNER
        $this->assertEquals(UserRole::BUSINESS_OWNER, $user->fresh()->role);
    }

    /** @test */
    public function business_owner_can_view_and_update_their_own_store()
    {
        $merchant = User::factory()->create([
            'role' => UserRole::BUSINESS_OWNER,
            'is_active' => true,
        ]);

        $store = AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'Farmacia Bella Piel',
            'slug' => 'farmacia-bella-piel',
            'website_url' => 'https://bellapiel.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'whatsapp_contact' => '+584149999999',
            'is_independent' => true,
            'verification_status' => 'VERIFIED',
            'subscription_tier' => StoreSubscriptionTier::FREE->value,
            'is_active' => true,
        ]);

        Sanctum::actingAs($merchant);

        // 1. Ver perfil
        $showResponse = $this->getJson('/api/v1/business/store');
        $showResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('store.name', 'Farmacia Bella Piel')
            ->assertJsonPath('store.subscription_tier', 'FREE');

        // 2. Actualizar perfil
        $updateResponse = $this->putJson('/api/v1/business/store', [
            'name' => 'Farmacia Bella Piel & Spa',
            'instagram_handle' => '@bellapielspa',
            'whatsapp_contact' => '+584148888888',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('affiliate_stores', [
            'id' => $store->id,
            'name' => 'Farmacia Bella Piel & Spa',
            'instagram_handle' => '@bellapielspa',
            'whatsapp_contact' => '+584148888888',
        ]);
    }

    /** @test */
    public function business_owner_can_manage_branches_and_tier_limits_are_enforced()
    {
        $merchant = User::factory()->create([
            'role' => UserRole::BUSINESS_OWNER,
            'is_active' => true,
        ]);

        $store = AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'SkinStore Local',
            'slug' => 'skinstore-local',
            'website_url' => 'https://skinstore.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'whatsapp_contact' => '+584141111111',
            'subscription_tier' => StoreSubscriptionTier::FREE->value, // Free permite 1 sucursal
            'is_active' => true,
        ]);

        Sanctum::actingAs($merchant);

        // 1. Crear primera sucursal (permitida en plan Free)
        $branchResponse = $this->postJson('/api/v1/business/branches', [
            'name' => 'SkinStore - Sede Principal',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Calle Real #10',
            'latitude' => 9.2150,
            'longitude' => -66.0110,
        ]);

        $branchResponse->assertStatus(201)
            ->assertJsonPath('branch.name', 'SkinStore - Sede Principal');

        // 2. Intentar crear segunda sucursal sin haber hecho upgrade a Pro Local (debe bloquearse 403)
        $limitResponse = $this->postJson('/api/v1/business/branches', [
            'name' => 'SkinStore - Sede C.C. Traki',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'C.C. Traki Local 5',
            'latitude' => 9.2160,
            'longitude' => -66.0120,
        ]);

        $limitResponse->assertStatus(403)
            ->assertJsonPath('status', 'limit_reached');

        // 3. Simular upgrade a PRO_LOCAL y crear la segunda sede
        $store->update(['subscription_tier' => StoreSubscriptionTier::PRO_LOCAL->value]);

        $proBranchResponse = $this->postJson('/api/v1/business/branches', [
            'name' => 'SkinStore - Sede C.C. Traki',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'C.C. Traki Local 5',
            'latitude' => 9.2160,
            'longitude' => -66.0120,
        ]);

        $proBranchResponse->assertStatus(201)
            ->assertJsonPath('branch.name', 'SkinStore - Sede C.C. Traki');
    }

    /** @test */
    public function business_owner_cannot_modify_branches_of_another_store()
    {
        $merchantA = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        $storeA = AffiliateStore::create([
            'owner_id' => $merchantA->id,
            'name' => 'Tienda A',
            'slug' => 'tienda-a',
            'website_url' => 'https://a.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $merchantB = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        $storeB = AffiliateStore::create([
            'owner_id' => $merchantB->id,
            'name' => 'Tienda B',
            'slug' => 'tienda-b',
            'website_url' => 'https://b.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $branchB = StoreBranch::create([
            'store_id' => $storeB->id,
            'name' => 'Sucursal de B',
            'slug' => 'sucursal-b',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Calle B #20',
            'latitude' => 9.21,
            'longitude' => -66.01,
            'is_active' => true,
        ]);

        // Merchant A intenta modificar la sucursal de B
        Sanctum::actingAs($merchantA);

        $response = $this->putJson("/api/v1/business/branches/{$branchB->id}", [
            'name' => 'Nombre Malicioso Hackeado',
        ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function business_owner_can_add_offers_and_bulk_recalculate_ves_exchange_rate()
    {
        $merchant = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        $store = AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'Farmacia Exclusiva',
            'slug' => 'farmacia-exclusiva',
            'website_url' => 'https://exclusiva.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $brand = Brand::create(['name' => 'La Roche-Posay', 'slug' => 'la-roche-posay']);
        $product1 = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Hyalu B5 Serum',
            'slug' => 'hyalu-b5-serum',
            'category' => 'SERUM',
        ]);
        $product2 = Product::create([
            'brand_id' => $brand->id,
            'name' => 'Anthelios UV Mune 400',
            'slug' => 'anthelios-uv-mune-400',
            'category' => 'SUNSCREEN',
        ]);

        Sanctum::actingAs($merchant);

        // 1. Añadir Hyalu B5 a $35 USD
        $offer1Response = $this->postJson('/api/v1/business/offers', [
            'product_id' => $product1->id,
            'price' => 35.00,
            'price_ves' => 1260.00,
            'in_stock' => true,
        ]);
        $offer1Response->assertStatus(201);

        // 2. Añadir Anthelios a $25 USD
        $offer2Response = $this->postJson('/api/v1/business/offers', [
            'product_id' => $product2->id,
            'price' => 25.00,
            'price_ves' => 900.00,
            'in_stock' => true,
        ]);
        $offer2Response->assertStatus(201);

        // 3. Actualización masiva de precios VES por cambio de tasa (ej: tasa sube a 40.00 VES/USD)
        $bulkResponse = $this->postJson('/api/v1/business/offers/bulk-update', [
            'exchange_rate' => 40.00,
        ]);

        $bulkResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('updated_count', 2);

        // Verificar que los precios VES se recalcularon automáticamente:
        // Hyalu B5: $35 * 40 = 1400.00 VES
        // Anthelios: $25 * 40 = 1000.00 VES
        $this->assertDatabaseHas('product_store_offers', [
            'product_id' => $product1->id,
            'price_ves' => 1400.00,
        ]);
        $this->assertDatabaseHas('product_store_offers', [
            'product_id' => $product2->id,
            'price_ves' => 1000.00,
        ]);
    }

    /** @test */
    public function public_interaction_tracking_records_leads_and_powers_analytics()
    {
        $merchant = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        $store = AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'DermoMarket',
            'slug' => 'dermomarket',
            'website_url' => 'https://dermomarket.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);

        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => 'DermoMarket Sede Central',
            'slug' => 'dermomarket-sede-central',
            'state' => 'Guárico',
            'city' => 'Valle de la Pascua',
            'address' => 'Av. Las Industrias',
            'latitude' => 9.215,
            'longitude' => -66.01,
            'is_active' => true,
        ]);

        // 1. Un usuario público en la app hace clic en "Comprar por WhatsApp"
        $leadResponse = $this->postJson('/api/v1/stores/interactions', [
            'store_id' => $store->id,
            'branch_id' => $branch->id,
            'interaction_type' => 'WHATSAPP_CLICK',
            'metadata' => [
                'client_platform' => 'web_mobile',
                'source' => 'in_store_catalog',
            ],
        ]);

        $leadResponse->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('store_lead_interactions', [
            'store_id' => $store->id,
            'branch_id' => $branch->id,
            'interaction_type' => 'WHATSAPP_CLICK',
        ]);

        // 2. El dueño del comercio consulta su panel de analíticas
        Sanctum::actingAs($merchant);

        $analyticsResponse = $this->getJson('/api/v1/business/analytics');
        $analyticsResponse->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('leads_summary_30d.total_leads', 1)
            ->assertJsonPath('leads_summary_30d.whatsapp_clicks', 1);
    }
}
