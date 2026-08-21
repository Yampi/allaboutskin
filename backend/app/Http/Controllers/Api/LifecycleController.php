<?php

namespace App\Http\Controllers\Api;

use App\Domain\Lifecycle\Services\ProductLifecycleService;
use App\Http\Controllers\Controller;
use App\Models\UserRoutineItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LifecycleController extends Controller
{
    public function __construct(
        protected ProductLifecycleService $lifecycleService
    ) {}

    /**
     * Get lifecycle, remaining days, PAO status, and restock offers for all products in user's routine.
     */
    public function items(Request $request): JsonResponse
    {
        $items = UserRoutineItem::where('user_id', $request->user()->id)
            ->with(['product.brand'])
            ->get();

        $lifecycles = $items->map(function (UserRoutineItem $item) {
            $analysis = $this->lifecycleService->calculateItemLifecycle($item);
            $analysis['routine_item_id'] = $item->id;
            return $analysis;
        });

        // Summary counts
        $reorderNeeded = $lifecycles->filter(fn ($i) => in_array($i['status'], ['REORDER_RECOMMENDED', 'DEPLETED', 'PAO_EXPIRED']))->count();

        return response()->json([
            'status' => 'success',
            'summary' => [
                'total_tracked_products' => $lifecycles->count(),
                'products_requiring_attention' => $reorderNeeded,
            ],
            'data' => $lifecycles->values()->all(),
        ]);
    }
}
