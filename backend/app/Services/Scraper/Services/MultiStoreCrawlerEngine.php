<?php

namespace App\Services\Scraper\Services;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Models\ProductStoreOffer;
use App\Services\Scraper\Connectors\Contracts\StoreConnectorInterface;
use App\Services\Scraper\Connectors\SchemaOrgConnector;
use App\Services\Scraper\Connectors\ShopifyConnector;
use App\Services\Scraper\Connectors\VtexConnector;
use App\Services\Scraper\Connectors\WooCommerceConnector;
use App\Services\Scraper\Pipeline\OfferSyncService;
use App\Services\Scraper\Quality\ClinicalQualityGateService;
use Illuminate\Support\Facades\Log;

class MultiStoreCrawlerEngine
{
    /** @var array<string, StoreConnectorInterface> */
    protected array $connectors = [];

    public function __construct(
        protected OfferSyncService $syncService,
        protected ClinicalQualityGateService $qualityGate = new ClinicalQualityGateService(),
        ?VtexConnector $vtex = null,
        ?ShopifyConnector $shopify = null,
        ?WooCommerceConnector $woocommerce = null,
        ?SchemaOrgConnector $schemaOrg = null
    ) {
        $this->connectors = [
            'VTEX' => $vtex ?? new VtexConnector(),
            'SHOPIFY' => $shopify ?? new ShopifyConnector(),
            'WOOCOMMERCE' => $woocommerce ?? new WooCommerceConnector(),
            'SCHEMA_ORG' => $schemaOrg ?? new SchemaOrgConnector(),
        ];
    }

    /**
     * Rastrea múltiples tiendas de forma paralela o secuencial para un ingrediente activo específico.
     *
     * @param Ingredient $ingredient
     * @param bool $skipExisting
     * @param array<int>|null $storeIds Filtro opcional de tiendas específicas
     * @return array
     */
    public function crawlForIngredient(Ingredient $ingredient, bool $skipExisting = true, ?array $storeIds = null): array
    {
        $searchTerms = $this->buildSearchTerms($ingredient);

        $query = AffiliateStore::where('is_active', true);
        if (!empty($storeIds)) {
            $query->whereIn('id', $storeIds);
        } else {
            // Tiendas con crawler habilitado explícitamente o que tengan plataforma configurada (excluyendo MANUAL)
            $query->where(function ($q) {
                $q->where('crawler_enabled', true)
                  ->orWhereIn('slug', ['locatel', 'farmahorro-ve', 'farmahorro']);
            })->where('crawler_platform', '!=', 'MANUAL');
        }

        $stores = $query->get();

        $totalEvaluated = 0;
        $totalAccepted = 0;
        $totalRejected = 0;
        $totalSkippedExisting = 0;
        $newOffersSynced = 0;
        $totalErrors = 0;

        Log::channel('single')->info("[MultiStoreCrawler] Iniciando rastreo para: {$ingredient->inci_name} en " . $stores->count() . " tiendas activas.");

        try {
            foreach ($stores as $store) {
                $platform = strtoupper($store->crawler_platform ?: $this->deducePlatform($store));
                $connector = $this->connectors[$platform] ?? $this->connectors['SCHEMA_ORG'];

                foreach ($searchTerms as $term) {
                    try {
                        $rawOffers = $connector->search($store, $term, $ingredient);
                    } catch (\Throwable $e) {
                        $totalErrors++;
                        if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response?->status() === 429) {
                            $retryAfter = (int) $e->response->header('Retry-After');
                            $sleepSeconds = $retryAfter > 0 ? min($retryAfter, 10) : 2;
                            Log::channel('single')->warning("[MultiStoreCrawler] HTTP 429 Rate Limited en {$store->name} [{$term}]. Retry-After recibido: {$retryAfter}s. Aplicando backoff de {$sleepSeconds}s.");
                            if ($sleepSeconds > 0) {
                                sleep($sleepSeconds);
                            }
                        } else {
                            Log::channel('single')->warning("[MultiStoreCrawler] Error en búsqueda {$store->name} [{$term}]: " . $e->getMessage());
                        }
                        continue;
                    }

                    foreach ($rawOffers as $offerDto) {
                        $totalEvaluated++;

                        try {
                            // 1. Evaluación en el Clinical Quality Gate
                            $gateResult = $this->qualityGate->evaluate($offerDto, $ingredient);
                            $isAccepted = $gateResult->isAccepted();

                            // Guardar auditoría reciente para transparencia del admin
                            $this->recordQualityGateAudit(
                                $offerDto->productName,
                                $store->name,
                                $ingredient->inci_name,
                                $isAccepted,
                                $gateResult->confidenceScore,
                                $gateResult->primaryReasonCode,
                                $gateResult->reasons[0] ?? ($isAccepted ? 'Aprobado: pureza clínica comprobada' : 'Rechazado por filtro antibasura')
                            );

                            if (!$isAccepted) {
                                $totalRejected++;
                                continue;
                            }

                            $totalAccepted++;

                            // 2. Si ya existe en base de datos y skipExisting está activo
                            if ($skipExisting && !empty($offerDto->productUrl)) {
                                $existing = ProductStoreOffer::where('product_url', $offerDto->productUrl)->first();
                                if ($existing) {
                                    $totalSkippedExisting++;
                                    // Vinculación del ingrediente si no lo tenía
                                    if ($existing->product) {
                                        $existing->product->ingredients()->syncWithoutDetaching([
                                            $ingredient->id => ['position' => 1, 'is_declared_active' => true]
                                        ]);
                                    }
                                    continue;
                                }
                            }

                            // 3. Persistencia limpia mediante OfferSyncService
                            $savedOffer = $this->syncService->syncOffer($offerDto, $ingredient);
                            if ($savedOffer) {
                                $newOffersSynced++;
                            }
                        } catch (\Throwable $e) {
                            $totalErrors++;
                            Log::channel('single')->error("[MultiStoreCrawler] Error procesando oferta '{$offerDto->productName}': " . $e->getMessage());
                        }
                    }

                    // Pausa preventiva de 100ms para no saturar conexiones ni ancho de banda
                    usleep(100000);
                }

                // Actualizar timestamp de última consulta a la tienda
                try {
                    $store->last_crawled_at = now();
                    $store->save();
                } catch (\Throwable $e) {
                    Log::channel('single')->warning("[MultiStoreCrawler] Error guardando last_crawled_at para {$store->name}: " . $e->getMessage());
                }
            }
        } finally {
            // Actualizar siempre timestamp del ingrediente para garantizar rotación Round-Robin sin estancarse
            try {
                $ingredient->last_crawled_at = now();
                $ingredient->save();
            } catch (\Throwable $e) {
                Log::channel('single')->error("[MultiStoreCrawler] Error actualizando last_crawled_at para {$ingredient->inci_name}: " . $e->getMessage());
            }

            // Liberar memoria para garantizar estabilidad en ejecuciones continuas nocturnas
            gc_collect_cycles();
        }

        return [
            'ingredient_id' => $ingredient->id,
            'ingredient_name' => $ingredient->common_name ?? $ingredient->inci_name,
            'inci_name' => $ingredient->inci_name,
            'stores_count' => $stores->count(),
            'total_evaluated' => $totalEvaluated,
            'total_accepted' => $totalAccepted,
            'total_rejected' => $totalRejected,
            'skipped_existing' => $totalSkippedExisting,
            'new_offers_synced' => $newOffersSynced,
            'errors_count' => $totalErrors,
        ];
    }

    /**
     * Deduce la plataforma si no está explícitamente configurada.
     */
    protected function deducePlatform(AffiliateStore $store): string
    {
        $slug = strtolower($store->slug);
        if (str_contains($slug, 'locatel')) {
            return 'VTEX';
        }
        if (str_contains($slug, 'farmahorro')) {
            return 'WOOCOMMERCE';
        }

        return 'SCHEMA_ORG';
    }

    /**
     * Construye términos de búsqueda optimizados para buscadores comerciales.
     */
    protected function buildSearchTerms(Ingredient $ingredient): array
    {
        $terms = [];

        if (!empty($ingredient->common_name)) {
            $cleanCommon = trim(explode('(', $ingredient->common_name)[0]);
            if (strlen($cleanCommon) >= 3) {
                $terms[] = mb_strtolower($cleanCommon);
            }
        }

        if (!empty($ingredient->inci_name)) {
            $inciClean = trim(mb_strtolower($ingredient->inci_name));

            $map = [
                'salicylic acid' => 'acido salicilico',
                'sodium hyaluronate' => 'acido hialuronico',
                'glycolic acid' => 'acido glicolico',
                'ascorbic acid' => 'vitamina c',
                'ceramide np' => 'ceramidas',
                'niacinamide' => 'niacinamida',
                'retinol' => 'retinol',
                'zinc pca' => 'zinc',
            ];

            if (isset($map[$inciClean])) {
                $terms[] = $map[$inciClean];
            } else {
                $terms[] = $inciClean;
            }
        }

        return array_unique($terms);
    }

    /**
     * Registra una auditoría del Quality Gate en caché para transparencia del administrador.
     */
    protected function recordQualityGateAudit(
        string $productName,
        string $storeName,
        string $inciName,
        bool $isAccepted,
        int $score,
        ?string $reasonCode,
        string $reasonDescription
    ): void {
        try {
            $audits = \Illuminate\Support\Facades\Cache::get('quality_gate_recent_audits', []);
            array_unshift($audits, [
                'id' => uniqid('qg_'),
                'product_name' => $productName,
                'store_name' => $storeName,
                'inci_name' => $inciName,
                'status' => $isAccepted ? 'APPROVED' : 'REJECTED',
                'confidence_score' => $score,
                'reason_code' => $reasonCode ?: ($isAccepted ? 'APPROVED' : 'REJECTED'),
                'reason' => $reasonDescription,
                'timestamp' => now()->toIso8601String(),
                'time_human' => now()->diffForHumans(),
            ]);

            // Mantener un búfer de las últimas 50 auditorías
            $audits = array_slice($audits, 0, 50);
            \Illuminate\Support\Facades\Cache::put('quality_gate_recent_audits', $audits, 86400 * 7);

            // Incrementar contador por código de motivo
            $codeKey = 'qg_tally_' . ($reasonCode ?: ($isAccepted ? 'APPROVED' : 'REJECTED'));
            \Illuminate\Support\Facades\Cache::increment($codeKey);
        } catch (\Throwable) {
            // Silencioso para no interrumpir el rastreo principal
        }
    }
}
