<?php

namespace App\Domain\Lifecycle\Services;

use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\UserRoutineItem;
use Carbon\Carbon;

class ProductLifecycleService
{
    /**
     * Calculate lifecycle, remaining days, PAO status, and restock offers for a routine item.
     *
     * @param UserRoutineItem $item
     * @return array<string, mixed>
     */
    public function calculateItemLifecycle(UserRoutineItem $item): array
    {
        $product = $item->product;
        $openedAt = $item->opened_at ? Carbon::parse($item->opened_at) : null;
        $today = Carbon::today();

        $volume = $product ? $product->volume_amount : 30.0;
        $dosage = $product ? $product->dosage_per_application_ml : 0.5;
        $paoMonths = $product ? $product->pao_months : 12;

        // Daily frequency: 1 if AM or PM, 2 if used in both slots or everyday
        $frequencyPerDay = 1.0;
        if ($item->slot === 'AM' && UserRoutineItem::where('user_id', $item->user_id)->where('product_id', $item->product_id)->where('slot', 'PM')->exists()) {
            $frequencyPerDay = 2.0;
        }

        // Total expected duration in days
        $totalLifespanDays = (int) floor($volume / ($dosage * $frequencyPerDay));

        $daysUsed = $openedAt ? $today->diffInDays($openedAt) : 0;
        $daysRemaining = max(0, $totalLifespanDays - $daysUsed);
        $percentageRemaining = $totalLifespanDays > 0 ? round(($daysRemaining / $totalLifespanDays) * 100, 1) : 0;
        $estimatedEmptyDate = $openedAt ? $openedAt->copy()->addDays($totalLifespanDays)->toDateString() : null;

        // PAO expiration calculation
        $paoExpirationDate = $openedAt ? $openedAt->copy()->addMonths($paoMonths)->toDateString() : null;
        $isPaoExpired = $openedAt ? $today->greaterThanOrEqualTo($openedAt->copy()->addMonths($paoMonths)) : false;

        // Alert status
        $status = 'OPTIMAL';
        $alertMessage = null;

        if ($isPaoExpired) {
            $status = 'PAO_EXPIRED';
            $alertMessage = "El producto ha superado su período de apertura seguro (PAO: {$paoMonths}M). Se recomienda desechar para evitar contaminación o pérdida de estabilidad.";
        } elseif ($daysRemaining <= 0) {
            $status = 'DEPLETED';
            $alertMessage = 'El producto ha alcanzado su volumen estimado de agotamiento. ¡Momento de reponer!';
        } elseif ($daysRemaining <= 10) {
            $status = 'REORDER_RECOMMENDED';
            $alertMessage = "Te quedan aproximadamente {$daysRemaining} días de producto. Te sugerimos reordenar pronto para no interrumpir tu rutina.";
        }

        // Restock offers
        $restockOffers = $this->getRestockOffers($product);

        return [
            'product_name' => $product ? $product->name : ($item->custom_name ?? 'Producto sin registrar'),
            'brand' => $product?->brand?->name,
            'container_volume' => "{$volume} ml",
            'opened_at' => $openedAt?->toDateString(),
            'total_estimated_lifespan_days' => $totalLifespanDays,
            'days_in_use' => $daysUsed,
            'days_remaining' => $daysRemaining,
            'percentage_remaining' => $percentageRemaining,
            'estimated_depletion_date' => $estimatedEmptyDate,
            'pao_months' => $paoMonths,
            'pao_expiration_date' => $paoExpirationDate,
            'is_pao_expired' => $isPaoExpired,
            'status' => $status,
            'alert_message' => $alertMessage,
            'restock_offers' => $restockOffers,
        ];
    }

    /**
     * Fetch store affiliate offers for restock.
     */
    public function getRestockOffers(?Product $product): array
    {
        if (!$product) {
            return [];
        }

        return ProductStoreOffer::where('product_id', $product->id)
            ->where('in_stock', true)
            ->with('store')
            ->orderBy('price', 'asc')
            ->get()
            ->map(function (ProductStoreOffer $offer) {
                return [
                    'store_name' => $offer->store->name,
                    'store_logo' => $offer->store->logo_url,
                    'store_type' => $offer->store->store_type,
                    'price' => $offer->price,
                    'currency' => $offer->currency,
                    'affiliate_buy_url' => $offer->affiliate_url,
                    'in_stock' => $offer->in_stock,
                ];
            })->all();
    }
}
