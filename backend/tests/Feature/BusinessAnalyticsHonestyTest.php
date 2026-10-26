<?php

namespace Tests\Feature;

use App\Domain\Auth\Enums\UserRole;
use App\Models\AffiliateStore;
use App\Models\User;
use App\Models\UserSkinProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BusinessAnalyticsHonestyTest extends TestCase
{
    use RefreshDatabase;

    private function actingMerchant(): void
    {
        $merchant = User::factory()->create(['role' => UserRole::BUSINESS_OWNER, 'is_active' => true]);
        AffiliateStore::create([
            'owner_id' => $merchant->id,
            'name' => 'Tienda Analytics',
            'slug' => 'tienda-analytics',
            'website_url' => 'https://analytics.example.com',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'is_active' => true,
        ]);
        Sanctum::actingAs($merchant);
    }

    public function test_demographics_are_zero_without_skin_profiles(): void
    {
        $this->actingMerchant();

        $demo = $this->getJson('/api/v1/business/analytics')->assertOk()->json('anonymous_demographics');

        $this->assertSame(0, $demo['total_sample_size']);
        foreach (['oily', 'dry', 'combination', 'sensitive'] as $type) {
            $this->assertEquals(0, $demo["{$type}_skin_pct"]);
        }
    }

    public function test_demographics_reflect_real_profiles(): void
    {
        $this->actingMerchant();
        UserSkinProfile::create(['user_id' => User::factory()->create()->id, 'skin_type' => 'OILY']);
        UserSkinProfile::create(['user_id' => User::factory()->create()->id, 'skin_type' => 'DRY']);

        $demo = $this->getJson('/api/v1/business/analytics')->assertOk()->json('anonymous_demographics');

        $this->assertSame(2, $demo['total_sample_size']);
        $this->assertEquals(50, $demo['oily_skin_pct']);
        $this->assertEquals(50, $demo['dry_skin_pct']);
        $this->assertEquals(0, $demo['sensitive_skin_pct']);
    }
}
