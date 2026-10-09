<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSkinScan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSkinScanController extends Controller
{
    /**
     * Listar capturas y trazabilidad del progreso dérmico.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();
        $sessionToken = $request->query('session_token', 'demo-session-user');

        $query = UserSkinScan::query();
        if ($user) {
            $query->where('user_id', $user->id);
        } else {
            $query->where(function ($q) use ($sessionToken) {
                $q->where('session_token', $sessionToken)
                  ->orWhereNull('user_id');
            });
        }

        $scans = $query->orderBy('created_at', 'asc')->get();

        // Calcular delta de progreso respecto a la primera captura
        $firstScan = $scans->first();
        $latestScan = $scans->last();

        $progressionDelta = null;
        if ($firstScan && $latestScan && $scans->count() > 1) {
            $progressionDelta = [
                'score_change' => $latestScan->overall_score - $firstScan->overall_score,
                'hydration_change' => $latestScan->hydration_score - $firstScan->hydration_score,
                'elasticity_change' => $latestScan->elasticity_score - $firstScan->elasticity_score,
                'pores_reduction' => $firstScan->pores_score - $latestScan->pores_score, // positivo significa menos congestión
                'spots_reduction' => $firstScan->spots_score - $latestScan->spots_score,
                'days_tracked' => $firstScan->created_at->diffInDays($latestScan->created_at),
            ];
        }

        return response()->json([
            'total_scans' => $scans->count(),
            'progression_delta' => $progressionDelta,
            'latest_scan' => $latestScan,
            'scans' => $scans->reverse()->values(), // Enviamos de más reciente a más antiguo para la galería
        ]);
    }

    /**
     * Registrar una nueva captura fotográfica de revisión dérmica.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_url' => 'required|string',
            'overall_score' => 'required|integer|min:0|max:100',
            'hydration_score' => 'nullable|integer|min:0|max:100',
            'elasticity_score' => 'nullable|integer|min:0|max:100',
            'pores_score' => 'nullable|integer|min:0|max:100',
            'spots_score' => 'nullable|integer|min:0|max:100',
            'fine_lines_score' => 'nullable|integer|min:0|max:100',
            'barrier_status' => 'nullable|string',
            'scan_mode' => 'nullable|string',
            'clinical_summary' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'session_token' => 'nullable|string',
        ]);

        $user = Auth::guard('sanctum')->user();

        $scan = UserSkinScan::create([
            'user_id' => $user?->id,
            'session_token' => $validated['session_token'] ?? ($request->header('X-Session-Token') ?? 'demo-session-user'),
            'image_url' => $validated['image_url'],
            'overall_score' => $validated['overall_score'],
            'hydration_score' => $validated['hydration_score'] ?? 80,
            'elasticity_score' => $validated['elasticity_score'] ?? 75,
            'pores_score' => $validated['pores_score'] ?? 65,
            'spots_score' => $validated['spots_score'] ?? 60,
            'fine_lines_score' => $validated['fine_lines_score'] ?? 55,
            'barrier_status' => $validated['barrier_status'] ?? 'NORMAL',
            'scan_mode' => $validated['scan_mode'] ?? 'face',
            'clinical_summary' => $validated['clinical_summary'] ?? 'Captura biométrica registrada con éxito.',
            'recommendations' => $validated['recommendations'] ?? 'Mantener hidratación y protección solar.',
        ]);

        return response()->json([
            'message' => '¡Captura de revisión dérmica registrada en tu progreso histórico!',
            'scan' => $scan,
        ], 201);
    }
}
