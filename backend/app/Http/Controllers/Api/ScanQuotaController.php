<?php

namespace App\Http\Controllers\Api;

use App\Domain\Audit\Services\ScanQuotaService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScanQuotaController extends Controller
{
    /**
     * Consume una unidad de cuota del análisis de imagen con IA.
     * Lo llama el servidor Next.js antes de enviar la imagen a Gemini; reenvía el token
     * del usuario (si lo hay), la IP real del visitante y el contador de su cookie firmada.
     */
    public function consume(Request $request, ScanQuotaService $quota): JsonResponse
    {
        $validated = $request->validate([
            'ip' => 'required|ip',
            'device_count' => 'required|integer|min:0|max:999',
        ]);

        $user = $request->user('sanctum');

        return response()->json(
            $quota->consume($user?->id, $validated['ip'], (int) $validated['device_count'])
        );
    }
}
