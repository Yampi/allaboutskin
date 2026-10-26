<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserSkinScan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserSkinScanApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_scans_require_authentication(): void
    {
        $this->getJson('/api/v1/user/skin-scans')->assertStatus(401);
        $this->postJson('/api/v1/user/skin-scans', ['scan_mode' => 'face'])->assertStatus(401);
    }

    public function test_store_keeps_missing_metrics_as_null_instead_of_inventing_defaults(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/user/skin-scans', [
            'scan_mode' => 'face',
            'clinical_summary' => 'Resumen real del análisis.',
        ])->assertCreated()
          ->assertJsonPath('scan.overall_score', null)
          ->assertJsonPath('scan.hydration_score', null)
          ->assertJsonPath('scan.barrier_status', null)
          ->assertJsonPath('scan.clinical_summary', 'Resumen real del análisis.')
          ->assertJsonPath('scan.recommendations', null);
    }

    public function test_index_only_returns_the_authenticated_users_scans(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        UserSkinScan::create(['user_id' => $owner->id, 'overall_score' => 70, 'scan_mode' => 'face']);
        UserSkinScan::create(['user_id' => $other->id, 'overall_score' => 40, 'scan_mode' => 'face']);
        UserSkinScan::create(['user_id' => null, 'session_token' => 'demo-session-user', 'overall_score' => 99, 'scan_mode' => 'face']);

        Sanctum::actingAs($owner);

        $this->getJson('/api/v1/user/skin-scans')
            ->assertOk()
            ->assertJsonPath('total_scans', 1)
            ->assertJsonPath('latest_scan.overall_score', 70);
    }

    public function test_progression_delta_skips_metrics_missing_in_either_scan(): void
    {
        $user = User::factory()->create();
        UserSkinScan::create(['user_id' => $user->id, 'overall_score' => 60, 'scan_mode' => 'face', 'created_at' => now()->subDays(10)]);
        UserSkinScan::create(['user_id' => $user->id, 'overall_score' => 70, 'scan_mode' => 'face']);

        Sanctum::actingAs($user);

        $this->getJson('/api/v1/user/skin-scans')
            ->assertOk()
            ->assertJsonPath('progression_delta.score_change', 10)
            ->assertJsonPath('progression_delta.hydration_change', null);
    }
}
