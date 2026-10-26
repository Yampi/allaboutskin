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
        Sanctum::actingAs(User::factory()->create(['skin_cycle_started_on' => '2026-10-19']));

        $response = $this->getJson('/api/v1/routine/week?start=2026-10-19')->assertOk();
        $days = $response->json('data');

        $this->assertCount(7, $days);
        $this->assertSame('2026-10-19', $days[0]['date']);
        $this->assertSame('2026-10-25', $days[6]['date']);
        $this->assertSame(
            ['EXFOLIATION', 'RETINOID', 'RECOVERY_1', 'RECOVERY_2', 'EXFOLIATION', 'RETINOID', 'RECOVERY_1'],
            array_column($days, 'skin_cycling_phase')
        );
    }

    public function test_a_new_user_starts_on_night_one_the_day_they_sign_up(): void
    {
        Sanctum::actingAs(User::factory()->create(['created_at' => '2026-10-22 15:30:00']));

        $days = $this->getJson('/api/v1/routine/week?start=2026-10-19')->json('data');

        // Antes del alta no hay ciclo; el día del alta es la noche 1.
        $this->assertSame(['NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED'], array_column(array_slice($days, 0, 3), 'skin_cycling_phase'));
        $this->assertSame('EXFOLIATION', $days[3]['skin_cycling_phase']);
        $this->assertSame('2026-10-22', $days[3]['skin_cycle_started_on']);
    }

    public function test_the_cycle_continues_across_the_new_year(): void
    {
        Sanctum::actingAs(User::factory()->create(['skin_cycle_started_on' => '2026-12-28']));

        $days = $this->getJson('/api/v1/routine/week?start=2026-12-28')->json('data');

        // 28 dic noche 1 ... 1 ene noche 1 otra vez (antes el cálculo por día del año se descuadraba aquí).
        $this->assertSame('EXFOLIATION', $days[4]['skin_cycling_phase']);
        $this->assertSame('2027-01-01', $days[4]['date']);
    }

    public function test_restarting_the_cycle_makes_the_given_day_night_one(): void
    {
        $user = User::factory()->create(['skin_cycle_started_on' => '2026-10-01']);
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/routine/cycle/restart', ['date' => '2026-10-27'])
            ->assertOk()
            ->assertJsonPath('skin_cycle_started_on', '2026-10-27');

        $this->getJson('/api/v1/routine/today?date=2026-10-27')
            ->assertJsonPath('data.skin_cycling_phase', 'EXFOLIATION');
    }

    public function test_week_requires_start_date(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/routine/week')->assertStatus(422);
    }
}
