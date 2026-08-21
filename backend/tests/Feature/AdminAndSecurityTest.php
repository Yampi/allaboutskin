<?php

namespace Tests\Feature;

use App\Domain\Auth\Enums\UserRole;
use App\Models\SecurityAuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Database\Seeders\AdminAndSecuritySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAndSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AdminAndSecuritySeeder::class);
    }

    /** @test */
    public function unauthenticated_requests_to_admin_are_unauthorized()
    {
        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(401);
    }

    /** @test */
    public function standard_user_cannot_access_admin_endpoints()
    {
        $user = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(403)
            ->assertJson(['message' => 'Acceso denegado. No tienes los permisos requeridos para esta sección.']);
    }

    /** @test */
    public function super_admin_and_admin_can_access_admin_endpoints()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/users');
        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'total', 'current_page']);
    }

    /** @test */
    public function admin_can_update_user_role_and_audit_log_is_created()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $targetUser = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/v1/admin/users/{$targetUser->id}/role", [
            'role' => UserRole::PREMIUM_USER->value,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.role', UserRole::PREMIUM_USER->value);

        $this->assertDatabaseHas('security_audit_logs', [
            'event_type' => 'ROLE_CHANGED',
            'severity' => 'CRITICAL',
            'resource_target' => (string) $targetUser->id,
        ]);
    }

    /** @test */
    public function admin_can_toggle_user_active_status()
    {
        $admin = User::where('email', 'admin@allaboutskin.com')->first();
        Sanctum::actingAs($admin);

        $targetUser = User::factory()->create([
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/v1/admin/users/{$targetUser->id}/toggle-status");
        $response->assertStatus(200);

        $this->assertFalse($targetUser->fresh()->is_active);
    }

    /** @test */
    public function login_throttling_triggers_on_repeated_failed_attempts()
    {
        $user = User::factory()->create([
            'email' => 'test_security@example.com',
            'password' => bcrypt('ValidPassword123!'),
            'role' => UserRole::STANDARD_USER,
            'is_active' => true,
        ]);

        // Attempt 5 bad logins
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'test_security@example.com',
                'password' => 'WrongPassword',
            ]);
        }

        // 6th attempt should be throttled / blocked
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test_security@example.com',
            'password' => 'WrongPassword',
        ]);

        $this->assertContains($response->status(), [423, 429]);
    }

    /** @test */
    public function registration_always_assigns_standard_user_role()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'SecureP@ssword123',
            'role' => 'super_admin', // Intruders trying to escalate
        ]);

        $response->assertStatus(201);
        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertEquals(UserRole::STANDARD_USER, $user->role);
    }

    /** @test */
    public function security_headers_are_present_in_responses()
    {
        $response = $this->getJson('/api/v1/catalog/products');

        $response->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
}
