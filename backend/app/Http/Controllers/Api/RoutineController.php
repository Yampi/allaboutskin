<?php

namespace App\Http\Controllers\Api;

use App\Domain\Routine\Services\RoutineService;
use App\Http\Controllers\Controller;
use App\Models\UserRoutineItem;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutineController extends Controller
{
    public function __construct(
        protected RoutineService $routineService
    ) {}

    /**
     * Get user's today routine schedule with Skin Cycling phase.
     */
    public function today(Request $request): JsonResponse
    {
        $date = $request->filled('date') ? Carbon::parse($request->date) : null;
        $routine = $this->routineService->getUserDailyRoutine($request->user(), $date);

        return response()->json([
            'status' => 'success',
            'data' => $routine,
        ]);
    }

    /**
     * Add product or custom item to routine.
     */
    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'nullable|exists:products,id',
            'custom_name' => 'nullable|string|max:255',
            'slot' => 'required|string|in:AM,PM',
            'cycle_type' => 'required|string|in:EVERYDAY,EXFOLIATION_NIGHT,RETINOID_NIGHT,RECOVERY_NIGHT,SPECIFIC_DAYS',
            'step_order' => 'nullable|integer',
            'opened_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $item = UserRoutineItem::create([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'] ?? null,
            'custom_name' => $validated['custom_name'] ?? null,
            'slot' => $validated['slot'],
            'cycle_type' => $validated['cycle_type'],
            'step_order' => $validated['step_order'] ?? 1,
            'opened_at' => $validated['opened_at'] ?? now()->toDateString(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Producto agregado a la rutina.',
            'data' => $item->load('product.brand'),
        ], 201);
    }

    /**
     * Remove item from routine.
     */
    public function deleteItem(Request $request, int $id): JsonResponse
    {
        $item = UserRoutineItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Producto eliminado de la rutina.',
        ]);
    }

    /**
     * Record AM/PM adherence log.
     */
    public function logAdherence(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slot' => 'required|string|in:AM,PM',
            'skin_feeling_rating' => 'nullable|integer|between:1,5',
            'photo_url' => 'nullable|string',
            'notes' => 'nullable|string',
            'date' => 'nullable|date',
        ]);

        $log = $this->routineService->logAdherence(
            user: $request->user(),
            slot: $validated['slot'],
            skinFeelingRating: $validated['skin_feeling_rating'] ?? null,
            photoUrl: $validated['photo_url'] ?? null,
            notes: $validated['notes'] ?? null,
            date: isset($validated['date']) ? Carbon::parse($validated['date']) : null
        );

        $stats = $this->routineService->getAdherenceStats($request->user());

        return response()->json([
            'status' => 'success',
            'message' => 'Cumplimiento registrado con éxito.',
            'data' => [
                'log' => $log,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Get user adherence stats & streak count.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = $this->routineService->getAdherenceStats($request->user());

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }
}
