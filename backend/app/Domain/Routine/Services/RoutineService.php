<?php

namespace App\Domain\Routine\Services;

use App\Models\RoutineAdherenceLog;
use App\Models\User;
use App\Models\UserRoutineItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RoutineService
{
    /**
     * Get the active routine items configured for the user, grouped by AM/PM and ordered by step hierarchy.
     *
     * @param User $user
     * @param Carbon|null $date
     * @return array<string, mixed>
     */
    public function getUserDailyRoutine(User $user, ?Carbon $date = null): array
    {
        $date = $date ?? Carbon::today();
        $items = UserRoutineItem::where('user_id', $user->id)
            ->with(['product.brand', 'product.ingredients'])
            ->orderBy('step_order', 'asc')
            ->get();

        $cyclePhase = $this->calculateSkinCyclingPhase($user, $date);

        $amItems = $items->filter(fn ($i) => $i->slot === 'AM');
        $pmItems = $items->filter(function ($i) use ($cyclePhase) {
            if ($i->slot !== 'PM') return false;

            // Skin Cycling filter
            if ($i->cycle_type === 'EVERYDAY') return true;
            if ($cyclePhase === 'EXFOLIATION' && $i->cycle_type === 'EXFOLIATION_NIGHT') return true;
            if ($cyclePhase === 'RETINOID' && $i->cycle_type === 'RETINOID_NIGHT') return true;
            if (in_array($cyclePhase, ['RECOVERY_1', 'RECOVERY_2']) && $i->cycle_type === 'RECOVERY_NIGHT') return true;

            return false;
        });

        // Check if user already completed AM / PM logs today
        $todayLogs = RoutineAdherenceLog::where('user_id', $user->id)
            ->whereDate('completed_date', $date->toDateString())
            ->get();

        $isAmCompleted = $todayLogs->contains('slot', 'AM');
        $isPmCompleted = $todayLogs->contains('slot', 'PM');

        return [
            'date' => $date->toDateString(),
            'day_of_week' => $date->translatedFormat('l'),
            'skin_cycling_phase' => $cyclePhase,
            'skin_cycling_label' => match ($cyclePhase) {
                'EXFOLIATION' => 'Noche 1: Exfoliación Química',
                'RETINOID' => 'Noche 2: Retinoide / Renovación Celular',
                'RECOVERY_1' => 'Noche 3: Recuperación de Barrera Cutánea',
                'RECOVERY_2' => 'Noche 4: Nutrición y Descanso',
                default => 'Rutina Estándar',
            },
            'am_routine' => [
                'is_completed' => $isAmCompleted,
                'items' => $amItems->values()->all(),
            ],
            'pm_routine' => [
                'is_completed' => $isPmCompleted,
                'items' => $pmItems->values()->all(),
            ],
        ];
    }

    /**
     * Determine current Skin Cycling phase (4-day cycle) based on user's calendar anchor.
     */
    public function calculateSkinCyclingPhase(User $user, Carbon $date): string
    {
        // 4-day modulus based on day of year
        $dayIndex = $date->dayOfYear % 4;

        return match ($dayIndex) {
            0 => 'EXFOLIATION',
            1 => 'RETINOID',
            2 => 'RECOVERY_1',
            3 => 'RECOVERY_2',
            default => 'RECOVERY_1',
        };
    }

    /**
     * Record adherence log for AM or PM routine.
     */
    public function logAdherence(
        User $user,
        string $slot,
        ?int $skinFeelingRating = null,
        ?string $photoUrl = null,
        ?string $notes = null,
        ?Carbon $date = null
    ): RoutineAdherenceLog {
        $date = $date ?? Carbon::today();

        return RoutineAdherenceLog::updateOrCreate(
            [
                'user_id' => $user->id,
                'completed_date' => $date->toDateString(),
                'slot' => $slot,
            ],
            [
                'skin_feeling_rating' => $skinFeelingRating,
                'photo_url' => $photoUrl,
                'notes' => $notes,
            ]
        );
    }

    /**
     * Calculate current adherence streak and 30-day compliance percentage.
     */
    public function getAdherenceStats(User $user): array
    {
        $logs = RoutineAdherenceLog::where('user_id', $user->id)
            ->where('completed_date', '>=', now()->subDays(30))
            ->get();

        $uniqueDays = $logs->pluck('completed_date')->unique()->count();
        $complianceRate = round(($uniqueDays / 30) * 100, 1);

        // Calculate consecutive streak
        $streak = 0;
        $checkDate = Carbon::today();

        for ($i = 0; $i < 60; $i++) {
            $hasLog = RoutineAdherenceLog::where('user_id', $user->id)
                ->whereDate('completed_date', $checkDate->toDateString())
                ->exists();

            if ($hasLog) {
                $streak++;
                $checkDate->subDay();
            } else {
                // If today is not logged yet, check yesterday before breaking streak
                if ($i === 0) {
                    $checkDate->subDay();
                    continue;
                }
                break;
            }
        }

        return [
            'current_streak_days' => $streak,
            'compliance_percentage_last_30_days' => $complianceRate,
            'total_routines_completed' => RoutineAdherenceLog::where('user_id', $user->id)->count(),
        ];
    }
}
