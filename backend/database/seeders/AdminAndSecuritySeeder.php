<?php

namespace Database\Seeders;

use App\Domain\Auth\Enums\UserRole;
use App\Models\SystemSetting;
use App\Models\User;
use App\Models\UserSkinProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminAndSecuritySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin Account
        $admin = User::firstOrCreate(
            ['email' => 'admin@allaboutskin.com'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('Admin12345!'),
                'email_verified_at' => now(),
            ]
        );
        $admin->role = UserRole::SUPER_ADMIN;
        $admin->is_active = true;
        $admin->save();

        if (!$admin->skinProfile) {
            UserSkinProfile::create([
                'user_id' => $admin->id,
                'skin_type' => 'NORMAL',
                'barrier_status' => 'HEALTHY',
            ]);
        }

        // 2. Scientific Editor / Dermatologist Account
        $editor = User::firstOrCreate(
            ['email' => 'dermatology@allaboutskin.com'],
            [
                'name' => 'Dra. Elena Vasquez (Dermatóloga)',
                'password' => Hash::make('Editor12345!'),
                'email_verified_at' => now(),
            ]
        );
        $editor->role = UserRole::SCIENTIFIC_EDITOR;
        $editor->is_active = true;
        $editor->save();

        if (!$editor->skinProfile) {
            UserSkinProfile::create([
                'user_id' => $editor->id,
                'skin_type' => 'COMBINATION',
                'barrier_status' => 'HEALTHY',
            ]);
        }

        // 3. Default System Settings
        $defaultSettings = [
            [
                'key' => 'security.max_failed_logins',
                'group' => 'security',
                'value' => '5',
                'type' => 'integer',
                'description' => 'Número máximo de intentos fallidos antes del bloqueo temporal',
            ],
            [
                'key' => 'security.lockout_duration_minutes',
                'group' => 'security',
                'value' => '15',
                'type' => 'integer',
                'description' => 'Duración en minutos del bloqueo por fuerza bruta',
            ],
            [
                'key' => 'ai.primary_provider',
                'group' => 'ai',
                'value' => 'gemini-1.5-pro',
                'type' => 'string',
                'description' => 'Modelo de IA principal para copiloto dermatológico',
            ],
            [
                'key' => 'ai.daily_audit_limit_free',
                'group' => 'ai',
                'value' => '10',
                'type' => 'integer',
                'description' => 'Límite diario de auditorías de fórmulas para usuarios gratuitos',
            ],
            [
                'key' => 'general.maintenance_mode',
                'group' => 'general',
                'value' => '0',
                'type' => 'boolean',
                'description' => 'Activar/Desactivar modo mantenimiento global',
            ],
        ];

        foreach ($defaultSettings as $setting) {
            SystemSetting::set(
                $setting['key'],
                $setting['value'],
                $setting['group'],
                $setting['type'],
                $setting['description']
            );
        }
    }
}
