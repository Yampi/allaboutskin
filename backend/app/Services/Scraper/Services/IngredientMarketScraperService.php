<?php

namespace App\Services\Scraper\Services;

use App\Models\Ingredient;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\DTOs\ScrapedStoreBranchDTO;
use App\Services\Scraper\Geocoding\NominatimGeocodingService;
use App\Services\Scraper\Pipeline\OfferSyncService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class IngredientMarketScraperService
{
    protected OfferSyncService $syncService;
    protected NominatimGeocodingService $geocodingService;
    protected \App\Services\Currency\ExchangeRateService $exchangeRateService;

    public function __construct(
        ?OfferSyncService $syncService = null,
        ?NominatimGeocodingService $geocodingService = null,
        ?\App\Services\Currency\ExchangeRateService $exchangeRateService = null
    ) {
        $this->geocodingService = $geocodingService ?? new NominatimGeocodingService();
        $this->syncService = $syncService ?? new OfferSyncService($this->geocodingService);
        $this->exchangeRateService = $exchangeRateService ?? new \App\Services\Currency\ExchangeRateService();
    }

    /**
     * Rastrea ofertas en el mercado para un ingrediente activo específico.
     *
     * @param Ingredient $ingredient
     * @param string|null $city
     * @param bool $skipExisting Si es true, omite URLs que ya están en la base de datos para buscar solo fuentes nuevas
     * @return array
     */
    public function scrapeForIngredient(Ingredient $ingredient, ?string $city = null, bool $skipExisting = true): array
    {
        $searchTerms = $this->buildSearchTerms($ingredient);
        $totalFound = 0;
        $totalSkipped = 0;
        $syncedOffers = [];

        Log::channel('single')->info("[IngredientScraper] Iniciando rastreo para: {$ingredient->inci_name} con términos: " . implode(', ', $searchTerms) . ($skipExisting ? ' (Omitiendo URLs ya registradas)' : ' (Re-escaneo forzado)'));

        foreach ($searchTerms as $term) {
            // 1. Rastreo en Locatel (API de Catálogo VTEX en tiempo real)
            $locatelProducts = $this->queryLocatelCatalog($term);
            foreach ($locatelProducts as $locatelItem) {
                $offer = $this->processLocatelItem($locatelItem, $ingredient, $city, $skipExisting, $totalSkipped);
                if ($offer) {
                    $syncedOffers[] = $offer;
                    $totalFound++;
                }
            }

            // Permitir descubrir hasta 40 productos reales nuevos por activo
            if ($totalFound >= 40) {
                break;
            }
        }

        return [
            'ingredient_id' => $ingredient->id,
            'ingredient_name' => $ingredient->common_name ?? $ingredient->inci_name,
            'inci_name' => $ingredient->inci_name,
            'studies_count' => $ingredient->pubmedStudies()->count(),
            'products_discovered' => $totalFound,
            'urls_skipped_existing' => $totalSkipped,
            'synced_offers' => count($syncedOffers),
            'offers' => array_slice($syncedOffers, 0, 5),
        ];
    }

    /**
     * Rastrea el mercado completo para todos los ingredientes activos con respaldo de estudios PubMed.
     *
     * @param string|null $city
     * @return array
     */
    public function scrapeAllActiveIngredients(?string $city = null, bool $skipExisting = true): array
    {
        $activeIngredients = Ingredient::where('is_active', true)
            ->withCount('pubmedStudies')
            ->orderByDesc('pubmed_studies_count')
            ->get();

        $results = [];
        $totalDiscovered = 0;
        $totalSkipped = 0;

        foreach ($activeIngredients as $ingredient) {
            $res = $this->scrapeForIngredient($ingredient, $city, $skipExisting);
            $results[] = $res;
            $totalDiscovered += $res['products_discovered'];
            $totalSkipped += $res['urls_skipped_existing'];
        }

        return [
            'total_ingredients_scanned' => count($activeIngredients),
            'total_market_products_discovered' => $totalDiscovered,
            'total_existing_urls_skipped' => $totalSkipped,
            'breakdown' => $results,
        ];
    }

    /**
     * Construye términos de búsqueda optimizados para buscadores comerciales.
     */
    protected function buildSearchTerms(Ingredient $ingredient): array
    {
        $terms = [];

        if (!empty($ingredient->common_name)) {
            // Limpiar paréntesis o notas extra: "Niacinamida (Vitamina B3)" -> "Niacinamida"
            $cleanCommon = trim(explode('(', $ingredient->common_name)[0]);
            if (strlen($cleanCommon) >= 3) {
                $terms[] = mb_strtolower($cleanCommon);
            }
        }

        if (!empty($ingredient->inci_name)) {
            $inciClean = trim(mb_strtolower($ingredient->inci_name));

            // Mapeos específicos comunes para mejorar relevancia en farmacias
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
     * Consulta el catálogo en vivo de Locatel vía VTEX.
     */
    protected function queryLocatelCatalog(string $keyword): array
    {
        try {
            $url = "https://www.locatel.com.ve/api/catalog_system/pub/products/search?ft=" . urlencode($keyword) . "&_from=0&_to=49";
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($url);

            if ($response->successful()) {
                $items = $response->json();
                return is_array($items) ? $items : [];
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[IngredientScraper] Error al consultar Locatel para '{$keyword}': " . $e->getMessage());
        }

        return [];
    }

    /**
     * Procesa un producto devuelto por la API y lo persiste en PostgreSQL vinculado al ingrediente.
     */
    protected function processLocatelItem(
        array $item,
        Ingredient $ingredient,
        ?string $city = null,
        bool $skipExisting = true,
        int &$skippedCounter = 0
    ): ?ProductStoreOffer {
        $productName = $item['productName'] ?? null;
        if (!$productName) {
            return null;
        }

        $brandName = $item['brand'] ?? 'Genérica';
        $productUrl = $item['link'] ?? 'https://www.locatel.com.ve';

        // Optimización de Descubrimiento: evitar re-scrapear URLs que ya fueron registradas previamente
        if ($skipExisting && !empty($productUrl) && $productUrl !== 'https://www.locatel.com.ve') {
            $existingOffer = ProductStoreOffer::where('product_url', $productUrl)->first();
            if ($existingOffer) {
                $skippedCounter++;
                // Si el producto existente no tiene este ingrediente vinculado, vincularlo sin re-descargar
                if ($ingredient && $existingOffer->product) {
                    $existingOffer->product->ingredients()->syncWithoutDetaching([
                        $ingredient->id => [
                            'position' => 1,
                            'is_declared_active' => true,
                        ]
                    ]);
                }
                return null;
            }
        }

        $skuItem = $item['items'][0] ?? [];
        $barcode = $skuItem['ean'] ?? null;

        // Extraer precio comercial: en Locatel viene en Bolívares (VES), Base + IVA (Tax)
        $seller = $skuItem['sellers'][0]['commertialOffer'] ?? [];
        $basePrice = (float) ($seller['Price'] ?? 0);
        $tax = (float) ($seller['Tax'] ?? 0);
        $priceVes = $basePrice + $tax;
        $inStock = (int) ($seller['AvailableQuantity'] ?? 0) > 0;

        // Convertir a USD usando la tasa oficial BCV viva obtenida de totoya.app (~857.89 VES/USD)
        $priceUsd = $priceVes > 0 ? $this->exchangeRateService->vesToUsd($priceVes) : 0.00;

        // Determinar categoría por palabras clave
        $category = $this->determineCategory($productName);

        // Detectar sucursal física asociada si está indicada en el vendedor
        $branchSlug = null;
        $merchantInstallments = $seller['Installments'][0]['sellerMerchantInstallments'][0]['id'] ?? null;
        if ($merchantInstallments) {
            $branchSlug = Str::slug($merchantInstallments);
        }

        // Crear DTO de oferta
        $dto = new ScrapedProductOfferDTO(
            storeSlug: 'locatel',
            productName: $productName,
            price: $priceUsd,
            currency: 'USD',
            inStock: $inStock,
            productUrl: $productUrl,
            brandName: $brandName,
            barcodeEan: !empty($barcode) && is_numeric($barcode) ? $barcode : null,
            category: $category,
            branchSlug: $branchSlug,
            priceVes: $priceVes
        );

        // Persistir en PostgreSQL y vincular con el ingrediente científico activo
        return $this->syncService->syncOffer($dto, $ingredient);
    }

    /**
     * Deduce la categoría cosmética a partir del nombre comercial.
     */
    protected function determineCategory(string $name): string
    {
        $lower = mb_strtolower($name);

        if (str_contains($lower, 'limpiador') || str_contains($lower, 'cleanser') || str_contains($lower, 'gel limpiador') || str_contains($lower, 'espuma')) {
            return 'CLEANSER';
        }
        if (str_contains($lower, 'fps') || str_contains($lower, 'spf') || str_contains($lower, 'solar') || str_contains($lower, 'sun')) {
            return 'SUNSCREEN';
        }
        if (str_contains($lower, 'serum') || str_contains($lower, 'suero') || str_contains($lower, 'gotero') || str_contains($lower, 'concentrado')) {
            return 'SERUM';
        }
        if (str_contains($lower, 'exfoliante') || str_contains($lower, 'peeling') || str_contains($lower, 'bha') || str_contains($lower, 'aha')) {
            return 'EXFOLIANT';
        }
        if (str_contains($lower, 'contorno') || str_contains($lower, 'ojos') || str_contains($lower, 'eye')) {
            return 'EYE_CARE';
        }
        if (str_contains($lower, 'tonico') || str_contains($lower, 'toner') || str_contains($lower, 'locion astringente')) {
            return 'TONER';
        }
        if (str_contains($lower, 'crema') || str_contains($lower, 'hidratante') || str_contains($lower, 'moisturizer') || str_contains($lower, 'gel')) {
            return 'MOISTURIZER';
        }

        return 'SKINCARE';
    }
}
