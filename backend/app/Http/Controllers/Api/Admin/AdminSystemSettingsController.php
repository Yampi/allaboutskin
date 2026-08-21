<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\SecurityAuditLog;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminSystemSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all()->groupBy('group');

        return response()->json([
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.group' => 'nullable|string',
            'settings.*.type' => 'nullable|string',
            'settings.*.description' => 'nullable|string',
        ]);

        $currentUser = $request->user();

        foreach ($validated['settings'] as $item) {
            SystemSetting::set(
                $item['key'],
                $item['value'],
                $item['group'] ?? 'general',
                $item['type'] ?? 'string',
                $item['description'] ?? null
            );
        }

        SecurityAuditLog::logEvent(
            'CONFIG_UPDATED',
            "Configuraciones del sistema actualizadas por {$currentUser->email}",
            $currentUser->id,
            'CRITICAL',
            'system_settings',
            ['keys' => array_column($validated['settings'], 'key')]
        );

        return response()->json([
            'message' => 'Configuraciones guardadas exitosamente.',
            'settings' => SystemSetting::all()->groupBy('group'),
        ]);
    }

    public function systemHealth(): JsonResponse
    {
        $dbConnected = true;
        try {
            DB::connection()->getPdo();
        } catch (\Throwable) {
            $dbConnected = false;
        }

        $stats = [
            'database_connected' => $dbConnected,
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'total_products' => Product::count(),
            'total_ingredients' => Ingredient::count(),
            'total_security_events' => SecurityAuditLog::count(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_time' => now()->toIso8601String(),
        ];

        return response()->json([
            'health' => $stats,
        ]);
    }
}
