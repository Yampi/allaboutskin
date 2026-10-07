<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Services\Scraper\Discovery\WebStoreDiscoveryEngine;
use App\Services\Scraper\Services\CrawlerSummaryService;
use App\Services\Scraper\Services\StorePlatformDetectorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

class AdminScraperController extends Controller
{
    /**
     * Obtiene el estado actual del motor de scraping, métricas y últimos logs.
     */
    public function status(Request $request): JsonResponse
    {
        $logPath = storage_path('logs/scraper.log');
        $logContent = '';

        if (File::exists($logPath)) {
            // Leer las últimas 50 líneas del archivo de log
            $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                $lastLines = array_slice($lines, -50);
                $logContent = implode("\n", $lastLines);
            }
        }

        $totalOffers = ProductStoreOffer::count();
        $totalBranches = StoreBranch::count();
        $totalStores = AffiliateStore::count();

        $query = ProductStoreOffer::with(['store', 'product.brand', 'product.ingredients', 'branch'])
            ->latest('updated_at');

        $countryFilter = $request->query('country');
        if (!empty($countryFilter) && $countryFilter !== 'ALL') {
            $query->whereHas('store', function ($sq) use ($countryFilter) {
                $sq->where('country_code', strtoupper($countryFilter));
            });
        }

        $exchangeService = app(\App\Services\Currency\ExchangeRateService::class);

        $recentOffers = $query->take(30)
            ->get()
            ->map(function ($offer) use ($exchangeService) {
                $store = $offer->store;
                $countryCode = $store?->country_code ?? 'GLOBAL';
                $countryName = $store?->country_name ?? 'Internacional';
                $countryFlag = $store?->country_flag ?? '🌐';
                $currencyLocal = $offer->currency_local ?: $exchangeService->getCurrencyForCountry($countryCode);
                $priceLocal = (float) ($offer->price_local ?? $exchangeService->fromUsd((float) $offer->price, $currencyLocal));

                return [
                    'id' => $offer->id,
                    'store_name' => $store->name ?? 'Tienda',
                    'branch_name' => $offer->branch->name ?? 'Catálogo General',
                    'country_code' => $countryCode,
                    'country_name' => $countryName,
                    'country_flag' => $countryFlag,
                    'product_id' => $offer->product_id,
                    'product_name' => $offer->product->name ?? 'Producto',
                    'product_slug' => $offer->product->slug ?? null,
                    'category' => $offer->product->category ?? 'SKINCARE',
                    'volume_amount' => $offer->product->volume_amount ?? null,
                    'volume_unit' => $offer->product->volume_unit ?? 'ml',
                    'barcode_ean' => $offer->product->barcode_ean ?? null,
                    'brand_name' => $offer->product?->brand?->name ?? 'N/A',
                    'price' => (float) $offer->price,
                    'price_ves' => $offer->price_ves !== null ? (float) $offer->price_ves : null,
                    'price_local' => $priceLocal,
                    'currency' => $offer->currency ?: 'USD',
                    'currency_local' => $currencyLocal,
                    'formatted_price_usd' => '$' . number_format((float) $offer->price, 2, '.', ',') . ' USD',
                    'formatted_price_local' => $exchangeService->formatPrice($priceLocal, $currencyLocal),
                    'in_stock' => (bool) $offer->in_stock,
                    'product_url' => $offer->product_url,
                    'last_checked_at' => $offer->last_checked_at?->diffForHumans() ?? 'Reciente',
                    'ingredients' => $offer->product?->ingredients->map(function ($ing) {
                        return [
                            'name' => $ing->inci_name,
                            'safety_rating' => $ing->safety_rating,
                            'is_active' => (bool) ($ing->pivot->is_declared_active ?? false),
                        ];
                    }) ?? [],
                ];
            });

        $activeIngredients = \App\Models\Ingredient::where('is_active', true)
            ->withCount(['pubmedStudies', 'products'])
            ->orderByDesc('pubmed_studies_count')
            ->get()
            ->map(function ($ing) {
                return [
                    'id' => $ing->id,
                    'inci_name' => $ing->inci_name,
                    'common_name' => $ing->common_name,
                    'studies_count' => $ing->pubmed_studies_count,
                    'products_count' => $ing->products_count,
                ];
            });

        return response()->json([
            'status' => 'success',
            'metrics' => [
                'total_offers' => $totalOffers,
                'total_branches' => $totalBranches,
                'total_stores' => $totalStores,
                'cron_frequency' => 'Cada 2 horas (0 */2 * * *)',
            ],
            'active_ingredients' => $activeIngredients,
            'recent_offers' => $recentOffers,
            'logs' => $logContent ?: 'No hay registros recientes en storage/logs/scraper.log',
        ]);
    }

    /**
     * Obtiene el resumen ejecutivo, métricas y diagnóstico de salud del crawler.
     */
    public function summary(Request $request, CrawlerSummaryService $summaryService): JsonResponse
    {
        $hours = (int) $request->query('hours', 24);
        if ($hours <= 0) {
            $hours = 24;
        }

        $summary = $summaryService->generate($hours);

        return response()->json([
            'status' => 'success',
            'data' => $summary,
        ]);
    }

    /**
     * Ejecuta el rastreador bajo demanda desde la interfaz web de administración.
     */
    public function run(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store' => 'nullable|string|in:all,farmatodo,locatel,farmahorro',
            'city' => 'nullable|string|max:100',
            'url' => 'nullable|url|max:500',
            'social_text' => 'nullable|string|max:5000',
            'social_store' => 'nullable|string|max:100',
            'mode' => 'nullable|string|in:chain,url,ingredient,all_active_ingredients,refresh_prices,social_post',
            'ingredient_id' => 'nullable',
        ]);

        $params = [];
        $mode = $validated['mode'] ?? (!empty($validated['url']) ? 'url' : (!empty($validated['social_text']) ? 'social_post' : 'chain'));

        if ($mode === 'refresh_prices') {
            try {
                Artisan::call('offers:check-prices', [
                    '--limit' => 30,
                    '--force' => true,
                    '--store' => $validated['store'] ?? 'all',
                ]);
                $output = Artisan::output();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Auditoría ligera de precios y stock ejecutada exitosamente.',
                    'output' => $output,
                    'executed_at' => now()->toIso8601String(),
                ]);
            } catch (\Throwable $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al auditar precios: ' . $e->getMessage(),
                ], 500);
            }
        }

        if ($mode === 'social_post' && !empty($validated['social_text'])) {
            $params['--social-text'] = $validated['social_text'];
            if (!empty($validated['social_store'])) {
                $params['--social-store'] = $validated['social_store'];
            }
        } elseif ($mode === 'all_active_ingredients') {
            $params['--by-active-ingredients'] = true;
            if (!empty($validated['city'])) {
                $params['--city'] = $validated['city'];
            }
        } elseif ($mode === 'ingredient' && !empty($validated['ingredient_id'])) {
            $params['--ingredient'] = $validated['ingredient_id'];
            if (!empty($validated['city'])) {
                $params['--city'] = $validated['city'];
            }
        } elseif ($mode === 'url' && !empty($validated['url'])) {
            $params['--url'] = $validated['url'];
        } else {
            $params['--store'] = $validated['store'] ?? 'all';
            if (!empty($validated['city'])) {
                $params['--city'] = $validated['city'];
            }
        }

        try {
            // Ejecutar el comando Artisan y capturar la salida
            Artisan::call('scraper:run', $params);
            $output = Artisan::output();

            return response()->json([
                'status' => 'success',
                'message' => 'Rastreo ejecutado exitosamente.',
                'output' => $output,
                'executed_at' => now()->toIso8601String(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error durante la ejecución del rastreador: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Parsea un texto o caption de redes sociales (Instagram, WhatsApp) y persiste la oferta.
     */
    public function parseSocialPost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'caption' => 'required|string|min:5|max:10000',
            'store_name' => 'nullable|string|max:100',
            'post_date' => 'nullable|date',
            'account_bio' => 'nullable|string|max:1000',
            'sync' => 'nullable|boolean',
            'force' => 'nullable|boolean',
        ]);

        try {
            $parser = new \App\Services\Scraper\Services\SocialCommerceParserService();
            $result = $parser->parsePostText(
                $validated['caption'],
                $validated['store_name'] ?? null,
                $validated['post_date'] ?? null,
                $validated['account_bio'] ?? null
            );

            // Filtro Anti-Bot / Anti-Cuentas Foráneas o Inactivas
            if (!$result['is_valid'] && !$request->boolean('force', false)) {
                return response()->json([
                    'status' => 'rejected',
                    'message' => 'Post rechazado por el filtro de autenticidad y calidad de Allabout.skin.',
                    'authenticity' => $result['authenticity'],
                    'data' => $result['metadata'],
                ], 422);
            }

            $savedOffer = null;
            if ($request->boolean('sync', true)) {
                $geocodingService = new \App\Services\Scraper\Geocoding\NominatimGeocodingService();
                $syncService = new \App\Services\Scraper\Pipeline\OfferSyncService($geocodingService);
                $savedOffer = $syncService->syncOffer($result['dto']);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Post verificado, analizado y persistido con éxito.',
                'data' => $result['metadata'],
                'authenticity' => $result['authenticity'],
                'saved_offer_id' => $savedOffer?->id,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al analizar el post: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Detecta automáticamente la plataforma tecnológica de comercio electrónico (Shopify, WooCommerce, VTEX, etc.) para una URL dada.
     */
    public function detectPlatform(Request $request, StorePlatformDetectorService $detector): JsonResponse
    {
        $validated = $request->validate([
            'url' => 'required|url|max:500',
        ]);

        $result = $detector->detect($validated['url']);

        return response()->json([
            'status' => 'success',
            'data' => $result,
        ]);
    }

    /**
     * Dispara una ronda de descubrimiento web abierto para encontrar nuevas tiendas de cosméticos compatibles.
     */
    public function discoverWeb(Request $request, WebStoreDiscoveryEngine $discoveryEngine): JsonResponse
    {
        $validated = $request->validate([
            'term' => 'nullable|string|max:100',
            'limit' => 'nullable|integer|min:1|max:20',
            'crawl' => 'nullable|boolean',
        ]);

        $term = $validated['term'] ?? null;
        $limit = $validated['limit'] ?? 5;
        $crawl = $request->boolean('crawl', true);

        $results = $discoveryEngine->discover($term, $limit, $crawl);

        return response()->json([
            'status' => 'success',
            'message' => "Ronda de descubrimiento web completada. {$results['new_stores_registered']} nuevas tiendas registradas.",
            'data' => $results,
        ]);
    }
}
