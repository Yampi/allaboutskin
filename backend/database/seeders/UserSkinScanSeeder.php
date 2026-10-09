<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSkinScan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class UserSkinScanSeeder extends Seeder
{
    public function run(): void
    {
        $firstUser = User::first();
        $userId = $firstUser ? $firstUser->id : null;

        $scans = [
            [
                'user_id' => $userId,
                'session_token' => 'demo-session-user',
                'image_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                'overall_score' => 68,
                'hydration_score' => 64,
                'elasticity_score' => 70,
                'pores_score' => 52, // higher dilation / congestión
                'spots_score' => 58,
                'fine_lines_score' => 54,
                'barrier_status' => 'COMPROMISED',
                'scan_mode' => 'face',
                'clinical_summary' => 'Línea base inicial: Deshidratación moderada en estrato córneo, poros congestionados en zona T y reactividad transitoria.',
                'recommendations' => 'Iniciar protocolo de Skin Cycling con exfoliación química suave cada 4 días y refuerzo de ceramidas.',
                'created_at' => Carbon::now()->subMonths(3),
            ],
            [
                'user_id' => $userId,
                'session_token' => 'demo-session-user',
                'image_url' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
                'overall_score' => 73,
                'hydration_score' => 74,
                'elasticity_score' => 73,
                'pores_score' => 61,
                'spots_score' => 60,
                'fine_lines_score' => 56,
                'barrier_status' => 'NORMAL',
                'scan_mode' => 'face',
                'clinical_summary' => 'Progreso a las 6 semanas: Barrera cutánea estabilizada tras 10 ciclos completos. Mejor retención de humedad.',
                'recommendations' => 'Continuar con niacinamida al 5-10% y mantener protector solar SPF 50+ diario.',
                'created_at' => Carbon::now()->subWeeks(5),
            ],
            [
                'user_id' => $userId,
                'session_token' => 'demo-session-user',
                'image_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
                'overall_score' => 78,
                'hydration_score' => 82,
                'elasticity_score' => 76,
                'pores_score' => 68,
                'spots_score' => 62,
                'fine_lines_score' => 58,
                'barrier_status' => 'OPTIMAL',
                'scan_mode' => 'face',
                'clinical_summary' => 'Evaluación actual: Notable mejora en la luminosidad, hidratación profunda y textura dérmica homogénea.',
                'recommendations' => 'Fórmula bien tolerada. Consolidar fase de recuperación con cicaplast y sérum hialurónico.',
                'created_at' => Carbon::now()->subHours(4),
            ],
        ];

        foreach ($scans as $scan) {
            UserSkinScan::create($scan);
        }
    }
}
