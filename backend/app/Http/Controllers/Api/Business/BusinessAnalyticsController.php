<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Models\StoreLeadInteraction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BusinessAnalyticsController extends Controller
{
    /**
     * Resumen de analíticas y métricas de rendimiento para el dashboard de negocio.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $thirtyDaysAgo = now()->subDays(30);

        // 1. Métricas de Inventario
        $totalOffers = ProductStoreOffer::where('store_id', $store->id)->count();
        $inStockOffers = ProductStoreOffer::where('store_id', $store->id)->where('in_stock', true)->count();
        $outOfStockOffers = $totalOffers - $inStockOffers;
        $averagePriceUsd = (float) ProductStoreOffer::where('store_id', $store->id)->avg('price');
        $totalBranches = StoreBranch::where('store_id', $store->id)->count();

        // 2. Interacciones y Leads (Últimos 30 días)
        $interactionsLast30Days = StoreLeadInteraction::where('store_id', $store->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('interaction_type, count(*) as count')
            ->groupBy('interaction_type')
            ->pluck('count', 'interaction_type')
            ->toArray();

        $whatsappLeadsCount = $interactionsLast30Days['WHATSAPP_CLICK'] ?? 0;
        $inStoreVisitsCount = $interactionsLast30Days['IN_STORE_VIEW'] ?? 0;
        $phoneClicksCount = $interactionsLast30Days['PHONE_CLICK'] ?? 0;
        $totalInteractionsCount = array_sum($interactionsLast30Days);

        // 3. Distribución por sucursales
        $branchPerformance = StoreBranch::where('store_id', $store->id)
            ->withCount([
                'offers',
                'leadInteractions as leads_count' => function ($q) use ($thirtyDaysAgo) {
                    $q->where('created_at', '>=', $thirtyDaysAgo);
                }
            ])
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'name' => $b->name,
                'city' => $b->city,
                'offers_count' => $b->offers_count,
                'leads_count' => $b->leads_count,
            ]);

        return response()->json([
            'status' => 'success',
            'store_id' => $store->id,
            'plan' => [
                'tier' => $store->subscription_tier?->value ?? 'FREE',
                'is_featured' => $store->isFeaturedActive(),
            ],
            'inventory' => [
                'total_offers' => $totalOffers,
                'in_stock_offers' => $inStockOffers,
                'out_of_stock_offers' => $outOfStockOffers,
                'average_price_usd' => round($averagePriceUsd, 2),
                'total_branches' => $totalBranches,
            ],
            'leads_summary_30d' => [
                'total_leads' => $totalInteractionsCount,
                'whatsapp_clicks' => $whatsappLeadsCount,
                'phone_clicks' => $phoneClicksCount,
                'in_store_views' => $inStoreVisitsCount,
            ],
            'branches_performance' => $branchPerformance,
        ]);
    }
}
