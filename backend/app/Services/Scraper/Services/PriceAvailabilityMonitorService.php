<?php

namespace App\Services\Scraper\Services;

use App\Models\ProductPriceHistory;
use App\Models\ProductStoreOffer;
use App\Services\Currency\ExchangeRateService;
use App\Services\Currency\PriceCurrencyParserService;
use App\Services\Scraper\Drivers\GenericWebPageScraper;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PriceAvailabilityMonitorService
{
    protected ExchangeRateService $exchangeRateService;
    protected GenericWebPageScraper $genericScraper;

    public function __construct(
        ?ExchangeRateService $exchangeRateService = null,
        ?GenericWebPageScraper $genericScraper = null
    ) {
        $this->exchangeRateService = $exchangeRateService ?? new ExchangeRateService();
        $this->genericScraper = $genericScraper ?? new GenericWebPageScraper($this->exchangeRateService);
    }

    /**
     * Monitorea un lote de ofertas ya registradas para verificar disponibilidad y cambios de precio.
     *
     * @param string|null $storeSlug
     * @param int $limit
     * @param int $staleHours
     * @param bool $forceAll
     * @param callable|null $progressCallback
     * @return array
     */
    public function checkBatch(
        ?string $storeSlug = null,
        int $limit = 50,
        int $staleHours = 2,
        bool $forceAll = false,
        ?callable $progressCallback = null
    ): array {
        $query = ProductStoreOffer::query()
            ->with(['store', 'product.brand', 'branch'])
            ->whereNotNull('product_url');

        if ($storeSlug && $storeSlug !== 'all') {
            $query->whereHas('store', fn($sq) => $sq->where('slug', $storeSlug));
        }

        if (!$forceAll && $staleHours > 0) {
            $threshold = now()->subHours($staleHours);
            $query->where(function ($q) use ($threshold) {
                $q->whereNull('last_checked_at')
                  ->orWhere('last_checked_at', '<=', $threshold);
            });
        }

        // Ordenar primero las que llevan más tiempo sin ser verificadas
        $offers = $query->orderBy('last_checked_at', 'asc')->limit($limit)->get();

        $stats = [
            'total_processed' => 0,
            'price_increases' => 0,
            'price_decreases' => 0,
            'restocked' => 0,
            'out_of_stock' => 0,
            'unchanged' => 0,
            'errors' => 0,
            'details' => [],
        ];

        foreach ($offers as $offer) {
            try {
                $result = $this->checkSingleOffer($offer);
                $stats['total_processed']++;

                switch ($result['change_type']) {
                    case 'INCREASE':
                        $stats['price_increases']++;
                        break;
                    case 'DECREASE':
                        $stats['price_decreases']++;
                        break;
                    case 'RESTOCKED':
                        $stats['restocked']++;
                        break;
                    case 'OUT_OF_STOCK':
                        $stats['out_of_stock']++;
                        break;
                    case 'UNCHANGED':
                    default:
                        $stats['unchanged']++;
                        break;
                }

                $stats['details'][] = $result;

                if ($progressCallback) {
                    $progressCallback($result, $stats);
                }

                // Pausa de cortesía para no saturar servidores (150ms)
                usleep(150000);
            } catch (\Throwable $e) {
                $stats['errors']++;
                Log::channel('single')->error("[PriceMonitor] Error al verificar oferta ID {$offer->id}: " . $e->getMessage());
                if ($progressCallback) {
                    $progressCallback([
                        'offer_id' => $offer->id,
                        'product_name' => $offer->product?->name ?? 'Desconocido',
                        'store_name' => $offer->store?->name ?? 'Tienda',
                        'status' => 'error',
                        'error' => $e->getMessage(),
                    ], $stats);
                }
            }
        }

        return $stats;
    }

    /**
     * Inspección ligera y precisa de una sola oferta registrada.
     */
    public function checkSingleOffer(ProductStoreOffer $offer): array
    {
        $url = $offer->product_url;
        $storeSlug = $offer->store?->slug ?? '';

        $scrapedData = null;

        // Optimización VTEX para Locatel (consulta ultra-rápida sin renderizar HTML pesado)
        if (str_contains($url, 'locatel.com.ve')) {
            $scrapedData = $this->checkLocatelQuick($url);
        }

        // Si no es VTEX o falló, utilizar el extractor genérico ligero pasando la tienda para contexto de país/moneda
        if (!$scrapedData) {
            $dto = $this->genericScraper->scrapeUrl($url, $offer->store);
            if ($dto) {
                $normalizer = app(\App\Services\Currency\PriceNormalizerService::class);
                $dto = $normalizer->normalizeProductOffer($dto, $offer->store);
                $scrapedData = [
                    'price_usd' => $dto->price,
                    'price_ves' => $dto->priceVes,
                    'price_local' => $dto->priceLocal,
                    'currency_local' => $dto->currencyLocal,
                    'in_stock' => (bool) $dto->inStock,
                ];
            }
        }

        if (!$scrapedData) {
            // Si la URL no respondió o dio 404, marcamos agotado preventivamente y actualizamos timestamp
            $offer->update(['last_checked_at' => now()]);
            return [
                'offer_id' => $offer->id,
                'product_name' => $offer->product?->name ?? 'Desconocido',
                'store_name' => $offer->store?->name ?? 'Tienda',
                'change_type' => 'UNCHANGED',
                'status' => 'unreachable',
                'old_price_usd' => (float) $offer->price,
                'new_price_usd' => (float) $offer->price,
                'difference_usd' => 0.00,
                'percentage_change' => 0.00,
            ];
        }

        $oldPriceUsd = (float) $offer->price;
        $oldPriceVes = (float) ($offer->price_ves ?? 0);
        $wasInStock = (bool) $offer->in_stock;

        $newPriceUsd = round((float) $scrapedData['price_usd'], 2);
        $newPriceVes = $scrapedData['price_ves'] !== null ? round((float) $scrapedData['price_ves'], 2) : null;
        $newPriceLocal = round((float) $scrapedData['price_local'], 2);
        $newCurrencyLocal = $scrapedData['currency_local'];
        $newInStock = (bool) $scrapedData['in_stock'];

        // Protección contra falsos positivos / anomalías de extracción:
        // Si el precio cae más del 85% de golpe a centavos (< $0.50), es probable distorsión cambiaria
        if ($oldPriceUsd >= 5.0 && $newPriceUsd < 0.50 && $newPriceUsd > 0) {
            Log::channel('single')->warning("[PriceMonitor] Cambio anómalo de precio rechazado por precaución: \${$oldPriceUsd} -> \${$newPriceUsd} en {$offer->store?->name} ({$offer->product?->name})");
            $offer->update(['last_checked_at' => now(), 'in_stock' => $newInStock]);
            return [
                'offer_id' => $offer->id,
                'product_name' => $offer->product?->name ?? 'Producto',
                'store_name' => $offer->store?->name ?? 'Tienda',
                'change_type' => 'UNCHANGED',
                'status' => 'anomalous_price_blocked',
                'old_price_usd' => $oldPriceUsd,
                'new_price_usd' => $oldPriceUsd,
                'difference_usd' => 0.00,
                'percentage_change' => 0.00,
            ];
        }

        $diffUsd = round($newPriceUsd - $oldPriceUsd, 2);
        $percentageChange = $oldPriceUsd > 0 ? round(($diffUsd / $oldPriceUsd) * 100, 2) : 0.00;

        // Determinar tipo de cambio
        $changeType = 'UNCHANGED';
        if ($wasInStock && !$newInStock) {
            $changeType = 'OUT_OF_STOCK';
        } elseif (!$wasInStock && $newInStock) {
            $changeType = 'RESTOCKED';
        } elseif ($diffUsd > 0.02) {
            $changeType = 'INCREASE';
        } elseif ($diffUsd < -0.02) {
            $changeType = 'DECREASE';
        }

        // Registrar en historial si hubo cambio relevante
        if ($changeType !== 'UNCHANGED') {
            ProductPriceHistory::create([
                'offer_id' => $offer->id,
                'product_id' => $offer->product_id,
                'store_id' => $offer->store_id,
                'old_price_usd' => $oldPriceUsd,
                'new_price_usd' => $newPriceUsd,
                'old_price_ves' => $oldPriceVes,
                'new_price_ves' => $newPriceVes ?? 0,
                'difference_usd' => $diffUsd,
                'percentage_change' => $percentageChange,
                'change_type' => $changeType,
                'was_in_stock' => $wasInStock,
                'is_in_stock' => $newInStock,
                'recorded_at' => now(),
            ]);
        }

        // Actualizar datos de la oferta en base de datos
        $offer->update([
            'price' => $newPriceUsd > 0 ? $newPriceUsd : $oldPriceUsd,
            'price_local' => $newPriceLocal > 0 ? $newPriceLocal : $offer->price_local,
            'currency_local' => $newCurrencyLocal ?: $offer->currency_local,
            'price_ves' => $newPriceVes,
            'in_stock' => $newInStock,
            'last_checked_at' => now(),
        ]);

        return [
            'offer_id' => $offer->id,
            'product_name' => $offer->product?->name ?? 'Producto',
            'store_name' => $offer->store?->name ?? 'Tienda',
            'branch_name' => $offer->branch?->name ?? 'General',
            'old_price_usd' => $oldPriceUsd,
            'new_price_usd' => $newPriceUsd,
            'old_price_ves' => $oldPriceVes,
            'new_price_ves' => $newPriceVes,
            'difference_usd' => $diffUsd,
            'percentage_change' => $percentageChange,
            'change_type' => $changeType,
            'was_in_stock' => $wasInStock,
            'is_in_stock' => $newInStock,
            'status' => 'success',
        ];
    }

    /**
     * Consulta rápida de precio y stock en Locatel vía API de catálogo VTEX.
     */
    protected function checkLocatelQuick(string $url): ?array
    {
        try {
            // Extraer el slug del producto: ej: https://www.locatel.com.ve/nombre_producto/p -> nombre_producto
            if (preg_match('#locatel\.com\.ve/([^/?#]+)/p#i', $url, $matches)) {
                $slug = $matches[1];
                $apiUrl = "https://www.locatel.com.ve/api/catalog_system/pub/products/search?ft=" . urlencode($slug);

                $response = Http::timeout(8)
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                        'Accept' => 'application/json',
                    ])
                    ->get($apiUrl);

                if ($response->successful()) {
                    $items = $response->json();
                    if (!empty($items) && isset($items[0]['items'][0]['sellers'][0]['commertialOffer'])) {
                        $offer = $items[0]['items'][0]['sellers'][0]['commertialOffer'];
                        $basePrice = (float) ($offer['Price'] ?? 0);
                        $tax = (float) ($offer['Tax'] ?? 0);
                        $priceVes = $basePrice + $tax;
                        $inStock = (int) ($offer['AvailableQuantity'] ?? 0) > 0;

                        $priceUsd = $priceVes > 0 ? $this->exchangeRateService->vesToUsd($priceVes) : 0.00;

                        return [
                            'price_usd' => $priceUsd,
                            'price_ves' => $priceVes,
                            'in_stock' => $inStock,
                        ];
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[PriceMonitor] Fallback en consulta VTEX rápida para {$url}: " . $e->getMessage());
        }

        return null;
    }
}
