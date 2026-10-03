<?php

namespace App\Services\Scraper\Services;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Models\ProductPriceHistory;
use App\Models\ProductStoreOffer;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;

class CrawlerSummaryService
{
    /**
     * Genera un resumen completo del estado y actividad del crawler.
     *
     * @param int $hours Ventana de tiempo hacia atrás a analizar (por defecto 24 horas)
     * @return array
     */
    public function generate(int $hours = 24): array
    {
        $since = Carbon::now()->subHours($hours);
        $now = Carbon::now();

        // 1. Métricas Globales del Catálogo de Ofertas
        $totalOffers = ProductStoreOffer::count();
        $inStockOffers = ProductStoreOffer::where('in_stock', true)->count();
        $outOfStockOffers = $totalOffers - $inStockOffers;
        $stockRate = $totalOffers > 0 ? round(($inStockOffers / $totalOffers) * 100, 1) : 0.0;

        // 2. Actividad de Ofertas en la Ventana de Tiempo
        $newOffersRecent = ProductStoreOffer::where('created_at', '>=', $since)->count();
        $updatedOffersRecent = ProductStoreOffer::where('updated_at', '>=', $since)->count();

        // 3. Variaciones de Precios en la Ventana
        $priceHistoriesQuery = ProductPriceHistory::with(['product.brand', 'store'])
            ->where('created_at', '>=', $since);
        
        $priceIncreases = (clone $priceHistoriesQuery)->where('difference_usd', '>', 0)->count();
        $priceDecreases = (clone $priceHistoriesQuery)->where('difference_usd', '<', 0)->count();
        $recentPriceChanges = (clone $priceHistoriesQuery)
            ->latest('created_at')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product?->name ?? 'Producto',
                    'brand' => $item->product?->brand?->name ?? 'N/A',
                    'store_name' => $item->store?->name ?? 'Tienda',
                    'old_price_usd' => (float) $item->old_price_usd,
                    'new_price_usd' => (float) $item->new_price_usd,
                    'difference_usd' => (float) $item->difference_usd,
                    'percentage_change' => (float) $item->percentage_change,
                    'is_discount' => $item->difference_usd < 0,
                    'recorded_at' => $item->created_at->diffForHumans(),
                ];
            })->values()->toArray();

        // 4. Cobertura de Ingredientes Clínicos
        $totalActiveIngredients = Ingredient::where('is_active', true)->count();
        $crawledRecentIngredients = Ingredient::where('is_active', true)
            ->where('last_crawled_at', '>=', $since)
            ->count();
        $coveragePercentage = $totalActiveIngredients > 0
            ? round(($crawledRecentIngredients / $totalActiveIngredients) * 100, 1)
            : 0.0;

        $nextIngredientsInQueue = Ingredient::where('is_active', true)
            ->orderByRaw('last_crawled_at ASC NULLS FIRST')
            ->take(5)
            ->get(['id', 'inci_name', 'common_name', 'last_crawled_at'])
            ->map(function ($ing) {
                return [
                    'id' => $ing->id,
                    'inci_name' => $ing->inci_name,
                    'common_name' => $ing->common_name,
                    'last_crawled_human' => $ing->last_crawled_at ? $ing->last_crawled_at->diffForHumans() : 'Nunca',
                ];
            })->values()->toArray();

        // 5. Desglose de Rendimiento por Tienda
        $stores = AffiliateStore::where('is_active', true)->get()->map(function ($s) use ($since) {
            $offersTotal = $s->productOffers()->count();
            $offersRecent = $s->productOffers()->where('created_at', '>=', $since)->count();
            $offersInStock = $s->productOffers()->where('in_stock', true)->count();

            return [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
                'website_url' => $s->website_url,
                'country_code' => $s->country_code,
                'country_name' => $s->country_name,
                'country_flag' => $s->country_flag,
                'platform' => $s->crawler_platform ?: 'MANUAL',
                'crawler_enabled' => (bool) $s->crawler_enabled,
                'last_crawled_at' => $s->last_crawled_at?->toIso8601String(),
                'last_crawled_human' => $s->last_crawled_at ? $s->last_crawled_at->diffForHumans() : 'Pendiente',
                'total_offers' => $offersTotal,
                'new_offers_period' => $offersRecent,
                'in_stock_offers' => $offersInStock,
            ];
        })->values()->toArray();

        // 6. Diagnóstico y Parseo de Logs Recientes
        $logDiagnostics = $this->parseCrawlerLogs($since);

        // 7. Cálculo de Salud y Recomendaciones Automáticas
        $health = $this->calculateHealthScore(
            $logDiagnostics,
            $newOffersRecent,
            $updatedOffersRecent,
            $coveragePercentage,
            $stores
        );

        return [
            'summary_meta' => [
                'generated_at' => $now->toIso8601String(),
                'generated_human' => $now->format('d/m/Y H:i:s'),
                'period_hours' => $hours,
                'period_since' => $since->toIso8601String(),
                'cron_schedule' => 'Cada 2 horas (0 */2 * * *)',
            ],
            'health' => [
                'status' => $health['status'], // 'OPERATIONAL', 'ATTENTION', 'CRITICAL'
                'score' => $health['score'], // 0 a 100
                'badge' => $health['badge'],
                'message' => $health['message'],
            ],
            'kpis' => [
                'total_offers' => $totalOffers,
                'in_stock_offers' => $inStockOffers,
                'out_of_stock_offers' => $outOfStockOffers,
                'stock_rate_percentage' => $stockRate,
                'new_offers_period' => $newOffersRecent,
                'updated_offers_period' => $updatedOffersRecent,
                'price_increases_period' => $priceIncreases,
                'price_decreases_period' => $priceDecreases,
                'total_active_ingredients' => $totalActiveIngredients,
                'crawled_ingredients_period' => $crawledRecentIngredients,
                'coverage_rate_percentage' => $coveragePercentage,
            ],
            'next_queue' => $nextIngredientsInQueue,
            'recent_price_changes' => $recentPriceChanges,
            'stores' => $stores,
            'execution_diagnostics' => $logDiagnostics,
            'recommendations' => $health['recommendations'],
        ];
    }

    /**
     * Parsea los logs del crawler para extraer ciclos recientes, métricas de calidad y errores.
     */
    protected function parseCrawlerLogs(Carbon $since): array
    {
        $logPath = storage_path('logs/crawler_cycle.log');
        $laravelLogPath = storage_path('logs/laravel.log');

        $cycles = [];
        $totalEvaluated = 0;
        $totalAccepted = 0;
        $totalRejected = 0;
        $totalNewSaved = 0;
        $totalErrors = 0;
        $detectedErrors = [];

        if (File::exists($logPath)) {
            $lines = file($logPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                $content = implode("\n", array_slice($lines, -300));

                // Buscar filas de la tabla ASCII: | Activo (INCI) | Tiendas | Evaluados | ... |
                preg_match_all('/\|\s*([^|]+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)?\s*\|\s*([0-9.]+s)\s*\|/i', $content, $matches, PREG_SET_ORDER);

                foreach ($matches as $m) {
                    $inci = trim($m[1]);
                    if ($inci === 'Activo (INCI)') {
                        continue;
                    }

                    $eval = (int) $m[3];
                    $acc = (int) $m[4];
                    $rej = (int) $m[5];
                    $saved = (int) $m[6];
                    $err = isset($m[7]) && is_numeric(trim($m[7])) ? (int) trim($m[7]) : 0;
                    $duration = trim($m[8]);

                    $totalEvaluated += $eval;
                    $totalAccepted += $acc;
                    $totalRejected += $rej;
                    $totalNewSaved += $saved;
                    $totalErrors += $err;

                    $cycles[] = [
                        'inci_name' => $inci,
                        'stores_queried' => (int) $m[2],
                        'evaluated' => $eval,
                        'accepted' => $acc,
                        'rejected' => $rej,
                        'new_saved' => $saved,
                        'errors' => $err,
                        'duration' => $duration,
                    ];
                }
            }
        }

        // Inspeccionar laravel.log para detectar errores o advertencias del Scraper
        if (File::exists($laravelLogPath)) {
            $larLines = file($laravelLogPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($larLines !== false) {
                $lastLarLines = array_slice($larLines, -150);
                foreach ($lastLarLines as $line) {
                    if (str_contains($line, '[MultiStoreCrawler]') || str_contains($line, '[VtexConnector]') || str_contains($line, '[WooCommerceConnector]')) {
                        if (str_contains($line, '.ERROR:') || str_contains($line, '.WARNING:')) {
                            // Limpiar timestamp largo para legibilidad
                            $cleaned = preg_replace('/^\[\d{4}-\d{2}-\d{2}[^\]]+\]\s*/', '', $line);
                            $detectedErrors[] = mb_strimwidth($cleaned, 0, 140, '...');
                        }
                    }
                }
            }
        }

        return [
            'recent_cycles_sample' => array_slice(array_reverse($cycles), 0, 8),
            'cycles_analyzed_count' => count($cycles),
            'total_evaluated_quality_gate' => $totalEvaluated,
            'total_accepted_quality_gate' => $totalAccepted,
            'total_rejected_quality_gate' => $totalRejected,
            'total_new_offers_synced' => $totalNewSaved,
            'logged_errors_count' => count($detectedErrors),
            'detected_anomalies' => array_slice(array_unique($detectedErrors), 0, 5),
        ];
    }

    /**
     * Evalúa el puntaje de salud (0 a 100) y genera recomendaciones automáticas.
     */
    protected function calculateHealthScore(
        array $logDiagnostics,
        int $newOffersRecent,
        int $updatedOffersRecent,
        float $coveragePercentage,
        $stores
    ): array {
        $score = 100;
        $recommendations = [];

        // Penalización si se detectaron errores en logs
        $errorCount = count($logDiagnostics['detected_anomalies']);
        if ($errorCount > 0) {
            $deduction = min(30, $errorCount * 10);
            $score -= $deduction;
            $recommendations[] = "Se detectaron {$errorCount} advertencias en logs de conexión. Revisa las anomalías detalladas.";
        }

        // Verificar si hay tiendas con crawler activo
        $enabledStores = collect($stores)->filter(fn($s) => $s['crawler_enabled'] && $s['platform'] !== 'MANUAL');
        if ($enabledStores->isEmpty()) {
            $score -= 20;
            $recommendations[] = "No hay tiendas automatizadas activas. Asegúrate de tener al menos Locatel o Farmahorro con crawler habilitado.";
        }

        // Evaluar tasa de rechazo del Quality Gate
        if ($logDiagnostics['total_evaluated_quality_gate'] > 0) {
            $acceptanceRate = ($logDiagnostics['total_accepted_quality_gate'] / $logDiagnostics['total_evaluated_quality_gate']) * 100;
            if ($acceptanceRate < 10 && $logDiagnostics['total_evaluated_quality_gate'] > 30) {
                $recommendations[] = "Alta tasa de rechazo antibasura (>90%). Esto es normal si las farmacias devuelven productos no cosméticos o suplementos orales.";
            }
        }

        // Optimizaciones estándar
        $recommendations[] = "Frecuencia de rastreo optimizada a cada 2 horas con pausas de 100ms para evitar bloqueos por rate-limiting.";
        $recommendations[] = "Filtro antibasura del Clinical Quality Gate protegiendo la base de datos contra suplementos y no tópicos.";

        $finalScore = max(0, min(100, $score));

        if ($finalScore >= 85) {
            $status = 'OPERATIONAL';
            $badge = '🟢 OPERACIONAL (EXCELENTE)';
            $message = 'El motor de crawling está funcionando óptimamente y sincronizando sin interrupciones.';
        } elseif ($finalScore >= 60) {
            $status = 'ATTENTION';
            $badge = '🟡 ATENCIÓN REQUERIDA';
            $message = 'El crawler está operativo pero se detectaron advertencias leves o tiendas con alta latencia.';
        } else {
            $status = 'CRITICAL';
            $badge = '🔴 DEGRADADO';
            $message = 'El crawler requiere intervención debido a errores repetidos de red o configuración.';
        }

        return [
            'status' => $status,
            'score' => $finalScore,
            'badge' => $badge,
            'message' => $message,
            'recommendations' => $recommendations,
        ];
    }
}
