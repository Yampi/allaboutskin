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
        // 1. Primary Super Admin Account (Brian Baloa)
        $superAdminPassword = env('SEED_SUPERADMIN_PASSWORD');
        $brianAdmin = User::where('email', 'brian.baloa@gmail.com')->first();

        if ($brianAdmin) {
            $brianAdmin->role = UserRole::SUPER_ADMIN;
            $brianAdmin->is_active = true;
            $brianAdmin->save();
        } elseif (empty($superAdminPassword)) {
            if ($this->command) {
                $this->command->warn('Variable SEED_SUPERADMIN_PASSWORD no definida o vacía. Omitiendo creación de brian.baloa@gmail.com.');
            }
        } else {
            $brianAdmin = User::create([
                'name' => 'Brian Baloa',
                'email' => 'brian.baloa@gmail.com',
                'password' => Hash::make($superAdminPassword),
                'email_verified_at' => now(),
            ]);
            $brianAdmin->email_verified_at = now();
            $brianAdmin->role = UserRole::SUPER_ADMIN;
            $brianAdmin->is_active = true;
            $brianAdmin->save();
        }

        if ($brianAdmin && !$brianAdmin->skinProfile) {
            UserSkinProfile::create([
                'user_id' => $brianAdmin->id,
                'skin_type' => 'COMBINATION',
                'barrier_status' => 'HEALTHY',
            ]);
        }

        // 1.1 Legacy Super Admin Account
        $adminPassword = env('SEED_ADMIN_PASSWORD');
        $admin = User::where('email', 'admin@allaboutskin.com')->first();

        if ($admin) {
            $admin->role = UserRole::SUPER_ADMIN;
            $admin->is_active = true;
            $admin->save();
        } elseif (empty($adminPassword)) {
            if ($this->command) {
                $this->command->warn('Variable SEED_ADMIN_PASSWORD no definida o vacía. Omitiendo creación de admin@allaboutskin.com.');
            }
        } else {
            $admin = User::create([
                'name' => 'Super Administrador',
                'email' => 'admin@allaboutskin.com',
                'password' => Hash::make($adminPassword),
                'email_verified_at' => now(),
            ]);
            $admin->email_verified_at = now();
            $admin->role = UserRole::SUPER_ADMIN;
            $admin->is_active = true;
            $admin->save();
        }

        if ($admin && !$admin->skinProfile) {
            UserSkinProfile::create([
                'user_id' => $admin->id,
                'skin_type' => 'NORMAL',
                'barrier_status' => 'HEALTHY',
            ]);
        }

        // 2. Scientific Editor / Dermatologist Account
        $editorPassword = env('SEED_EDITOR_PASSWORD');
        $editor = User::where('email', 'dermatology@allaboutskin.com')->first();

        if ($editor) {
            $editor->role = UserRole::SCIENTIFIC_EDITOR;
            $editor->is_active = true;
            $editor->save();
        } elseif (empty($editorPassword)) {
            if ($this->command) {
                $this->command->warn('Variable SEED_EDITOR_PASSWORD no definida o vacía. Omitiendo creación de dermatology@allaboutskin.com.');
            }
        } else {
            $editor = User::create([
                'name' => 'Dra. Elena Vasquez (Dermatóloga)',
                'email' => 'dermatology@allaboutskin.com',
                'password' => Hash::make($editorPassword),
                'email_verified_at' => now(),
            ]);
            $editor->email_verified_at = now();
            $editor->role = UserRole::SCIENTIFIC_EDITOR;
            $editor->is_active = true;
            $editor->save();
        }

        if ($editor && !$editor->skinProfile) {
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
                'value' => 'gemini-2.5-flash',
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
