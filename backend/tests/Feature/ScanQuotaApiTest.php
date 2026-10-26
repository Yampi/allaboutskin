<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ScanQuotaApiTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'secreto-de-prueba';

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'services.internal.secret' => self::SECRET,
            'services.scan_quota' => [
                'device_free' => 2,
                'ip_per_day' => 3,
                'user_per_day' => 2,
                'global_per_day' => 500,
                'ip_per_minute' => 100,
            ],
        ]);
    }

    private function consume(array $body = [], ?string $secret = self::SECRET)
    {
        return $this->postJson(
            '/api/v1/internal/scan-quota',
            array_merge(['ip' => '203.0.113.7', 'device_count' => 0], $body),
            $secret === null ? [] : ['X-Internal-Secret' => $secret]
        );
    }

    public function test_route_is_closed_without_a_configured_secret(): void
    {
        config(['services.internal.secret' => null]);

        $this->consume()->assertStatus(503);
    }

    public function test_route_rejects_a_wrong_or_missing_secret(): void
    {
        $this->consume([], 'otro-secreto')->assertStatus(403);
        $this->consume([], null)->assertStatus(403);
    }

    public function test_anonymous_device_that_used_its_free_scans_must_create_an_account(): void
    {
        $this->consume(['device_count' => 1])->assertJson(['allowed' => true, 'tier' => 'anonymous']);
        $this->consume(['device_count' => 2])->assertJson(['allowed' => false, 'reason' => 'ACCOUNT_REQUIRED']);
    }

    public function test_anonymous_ip_quota_persists_across_requests(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $this->consume()->assertJson(['allowed' => true]);
        }

        // Aunque borre la cookie (device_count = 0), la IP ya agotó su cupo diario.
        $this->consume()->assertJson(['allowed' => false, 'reason' => 'ACCOUNT_REQUIRED']);
        $this->consume(['ip' => '198.51.100.9'])->assertJson(['allowed' => true]);
    }

    public function test_authenticated_user_gets_a_daily_quota_resolved_by_the_backend(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->consume(['device_count' => 50])->assertJson(['allowed' => true, 'tier' => 'user']);
        $this->consume()->assertJson(['allowed' => true, 'tier' => 'user']);
        $this->consume()->assertJson(['allowed' => false, 'reason' => 'USER_LIMIT']);
    }

    public function test_global_daily_cap_stops_everyone(): void
    {
        config(['services.scan_quota.global_per_day' => 1]);

        $this->consume()->assertJson(['allowed' => true]);
        $this->consume(['ip' => '198.51.100.9'])->assertJson(['allowed' => false, 'reason' => 'GLOBAL_LIMIT']);
    }

    public function test_a_denied_request_does_not_consume_quota(): void
    {
        config(['services.scan_quota.global_per_day' => 1]);

        $this->consume(['device_count' => 2])->assertJson(['allowed' => false, 'reason' => 'ACCOUNT_REQUIRED']);
        $this->consume()->assertJson(['allowed' => true]);
    }

    public function test_invalid_ip_is_rejected(): void
    {
        $this->consume(['ip' => 'no-es-una-ip'])->assertStatus(422);
    }
}
