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

        // 2. Interacciones y Leads Salientes (Últimos 30 días)
        $interactionsLast30Days = StoreLeadInteraction::where('store_id', $store->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('interaction_type, count(*) as count')
            ->groupBy('interaction_type')
            ->pluck('count', 'interaction_type')
            ->toArray();

        $whatsappLeadsCount = $interactionsLast30Days['WHATSAPP_CLICK'] ?? 0;
        $inStoreVisitsCount = $interactionsLast30Days['IN_STORE_VIEW'] ?? 0;
        $phoneClicksCount = $interactionsLast30Days['PHONE_CLICK'] ?? 0;
        $mapRoutesCount = $interactionsLast30Days['MAP_ROUTE'] ?? 0;
        $productClicksCount = $interactionsLast30Days['PRODUCT_CLICK'] ?? 0;
        $totalInteractionsCount = array_sum($interactionsLast30Days);

        // 3. Tasa de Inclusión en Rutinas de Usuarios
        $storeProductIds = ProductStoreOffer::where('store_id', $store->id)->pluck('product_id')->unique()->toArray();
        $routineInclusionsCount = !empty($storeProductIds) 
            ? \App\Models\UserRoutineItem::whereIn('product_id', $storeProductIds)->count() 
            : 0;
        $routineUniqueUsersCount = !empty($storeProductIds) 
            ? \App\Models\UserRoutineItem::whereIn('product_id', $storeProductIds)->distinct('user_id')->count('user_id') 
            : 0;

        // 4. Análisis de Brecha de Demanda (Demand Gap Report)
        // Detecta ingredientes con evidencia clínica alta (A o B) que la tienda AÚN NO ofrece en su catálogo
        $coveredIngredientIds = !empty($storeProductIds)
            ? \App\Models\Ingredient::whereHas('products', function ($q) use ($storeProductIds) {
                $q->whereIn('products.id', $storeProductIds);
            })->pluck('id')->toArray()
            : [];

        $demandGapIngredients = \App\Models\Ingredient::query()
            ->when(!empty($coveredIngredientIds), function ($q) use ($coveredIngredientIds) {
                $q->whereNotIn('id', $coveredIngredientIds);
            })
            ->where('is_active', true)
            ->whereIn('evidence_level', ['A', 'B'])
            ->orderBy('evidence_level', 'asc')
            ->limit(5)
            ->get(['id', 'inci_name', 'common_name', 'evidence_level', 'cosing_functions'])
            ->map(fn ($ing) => [
                'inci_name' => $ing->inci_name,
                'common_name' => $ing->common_name ?: $ing->inci_name,
                'evidence_level' => $ing->evidence_level,
                'benefit' => !empty($ing->cosing_functions) && is_array($ing->cosing_functions) ? implode(', ', array_slice($ing->cosing_functions, 0, 2)) : null,
            ]);

        // 5. Demografía Dermatológica Local (100% Anónima y Agregada)
        $totalProfiles = \App\Models\UserSkinProfile::count();
        $skinDistribution = \App\Models\UserSkinProfile::query()
            ->selectRaw('skin_type, count(*) as count')
            ->groupBy('skin_type')
            ->pluck('count', 'skin_type')
            ->toArray();

        // Sin perfiles no hay muestra: los porcentajes quedan en 0, nunca se inventan.
        $pct = fn (string $type) => $totalProfiles > 0
            ? round((($skinDistribution[$type] ?? 0) / $totalProfiles) * 100, 1)
            : 0;

        $demographicSummary = [
            'total_sample_size' => $totalProfiles,
            'oily_skin_pct' => $pct('OILY'),
            'dry_skin_pct' => $pct('DRY'),
            'combination_skin_pct' => $pct('COMBINATION'),
            'sensitive_skin_pct' => $pct('SENSITIVE'),
        ];

        // 6. Distribución por sucursales
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
                'map_routes' => $mapRoutesCount,
                'phone_clicks' => $phoneClicksCount,
                'in_store_views' => $inStoreVisitsCount,
                'product_clicks' => $productClicksCount,
            ],
            'routine_impact' => [
                'total_routine_items' => $routineInclusionsCount,
                'active_users_relying' => $routineUniqueUsersCount,
            ],
            'demand_gap_opportunities' => $demandGapIngredients,
            'anonymous_demographics' => $demographicSummary,
            'branches_performance' => $branchPerformance,
        ]);
    }
}
