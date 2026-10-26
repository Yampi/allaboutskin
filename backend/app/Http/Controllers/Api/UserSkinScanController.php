<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSkinScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserSkinScanController extends Controller
{
    /**
     * Listar las capturas de la persona autenticada y su evolución.
     */
    public function index(Request $request): JsonResponse
    {
        $scans = UserSkinScan::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'asc')
            ->get();

        $firstScan = $scans->first();
        $latestScan = $scans->last();

        // Solo se compara con métricas que existen en ambas capturas.
        $progressionDelta = null;
        if ($firstScan && $latestScan && $scans->count() > 1) {
            $diff = fn (string $field, int $sign = 1) => isset($firstScan->$field, $latestScan->$field)
                ? $sign * ($latestScan->$field - $firstScan->$field)
                : null;

            $progressionDelta = [
                'score_change' => $diff('overall_score'),
                'hydration_change' => $diff('hydration_score'),
                'elasticity_change' => $diff('elasticity_score'),
                'pores_reduction' => $diff('pores_score', -1), // positivo significa menos congestión
                'spots_reduction' => $diff('spots_score', -1),
                'days_tracked' => $firstScan->created_at->diffInDays($latestScan->created_at),
            ];
        }

        return response()->json([
            'total_scans' => $scans->count(),
            'progression_delta' => $progressionDelta,
            'latest_scan' => $latestScan,
            'scans' => $scans->reverse()->values(), // de más reciente a más antiguo
        ]);
    }

    /**
     * Registrar el resultado de un análisis. Los campos ausentes se guardan como null:
     * nunca se rellenan con valores por defecto.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_url' => 'nullable|string',
            'overall_score' => 'nullable|integer|min:0|max:100',
            'hydration_score' => 'nullable|integer|min:0|max:100',
            'elasticity_score' => 'nullable|integer|min:0|max:100',
            'pores_score' => 'nullable|integer|min:0|max:100',
            'spots_score' => 'nullable|integer|min:0|max:100',
            'fine_lines_score' => 'nullable|integer|min:0|max:100',
            'barrier_status' => 'nullable|string|max:50',
            'scan_mode' => 'nullable|string|in:face,product',
            'clinical_summary' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);

        $scan = UserSkinScan::create([
            'user_id' => $request->user()->id,
            'scan_mode' => $validated['scan_mode'] ?? 'face',
        ] + $validated);

        return response()->json([
            'message' => 'Captura registrada en tu historial.',
            'scan' => $scan,
        ], 201);
    }
}
