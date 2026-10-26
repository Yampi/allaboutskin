<?php

namespace Tests\Feature;

use App\Models\SecurityAuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UnauthenticatedApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_protected_endpoint_without_token_returns_401_json_even_without_accept_header(): void
    {
        $response = $this->get('/api/v1/admin/users');

        $response->assertStatus(401)
            ->assertJsonPath('error_type', 'UNAUTHENTICATED');
    }

    public function test_protected_endpoint_without_token_returns_401_json_with_accept_header(): void
    {
        $this->getJson('/api/v1/business/store')
            ->assertStatus(401)
            ->assertJsonPath('error_type', 'UNAUTHENTICATED');
    }

    public function test_unauthenticated_request_does_not_log_a_system_exception(): void
    {
        $this->get('/api/v1/admin/users');

        $this->assertDatabaseMissing((new SecurityAuditLog)->getTable(), [
            'event_type' => 'SYSTEM_UNHANDLED_EXCEPTION',
        ]);
    }
}
