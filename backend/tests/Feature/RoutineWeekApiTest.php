<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoutineWeekApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_week_requires_authentication(): void
    {
        $this->getJson('/api/v1/routine/week?start=2026-10-19')->assertStatus(401);
    }

    public function test_week_returns_seven_consecutive_days_with_cycle_phase(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->getJson('/api/v1/routine/week?start=2026-10-19')->assertOk();
        $days = $response->json('data');

        $this->assertCount(7, $days);
        $this->assertSame('2026-10-19', $days[0]['date']);
        $this->assertSame('2026-10-25', $days[6]['date']);
        // Día del año 298 (25 oct 2026) % 4 = 2 => RECOVERY_1
        $this->assertSame('RECOVERY_1', $days[6]['skin_cycling_phase']);
    }

    public function test_week_requires_start_date(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/routine/week')->assertStatus(422);
    }
}
