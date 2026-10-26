<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicEndpointThrottleTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_is_limited_per_ip(): void
    {
        // Datos inválidos: el límite se aplica antes de validar, así que también cuentan.
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/auth/register', [])->assertStatus(422);
        }

        $this->postJson('/api/v1/auth/register', [])
            ->assertStatus(429)
            ->assertJsonPath('error_type', 'TOO_MANY_REQUESTS');
    }

    public function test_store_suggestions_are_limited(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/stores/suggest', [])->assertStatus(422);
        }

        $this->postJson('/api/v1/stores/suggest', [])->assertStatus(429);
    }

    public function test_audit_endpoints_are_limited(): void
    {
        for ($i = 0; $i < 30; $i++) {
            $this->assertNotSame(429, $this->postJson('/api/v1/audit/compatibility', [])->status());
        }

        $this->postJson('/api/v1/audit/compatibility', [])->assertStatus(429);
    }

    public function test_limits_are_per_client_ip(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/stores/suggest', []);
        }

        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.20'])
            ->postJson('/api/v1/stores/suggest', [])
            ->assertStatus(422);
    }
}
