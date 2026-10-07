<?php

namespace App\Services\Scraper\Discovery;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Scraper\Discovery\Contracts\WebSearchProviderInterface;
use App\Services\Scraper\Discovery\Providers\DuckDuckGoSearchProvider;
use App\Services\Scraper\Services\MultiStoreCrawlerEngine;
use App\Services\Scraper\Services\StoreCountryDetectorService;
use App\Services\Scraper\Services\StorePlatformDetectorService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WebStoreDiscoveryEngine
{
    /** @var array<string> Dominios no deseados (redes sociales, buscadores, marketplaces gigantes, enciclopedias) */
    protected array $blacklistedDomains = [
        'google.',
        'duckduckgo.',
        'bing.',
        'yahoo.',
        'facebook.',
        'instagram.',
        'tiktok.',
        'twitter.',
        'x.com',
        'youtube.',
        'pinterest.',
        'linkedin.',
        'wikipedia.',
        'mercadolibre.',
        'mercadolibre.com.ve',
        'amazon.',
        'ebay.',
        'aliexpress.',
        'temu.',
        'shein.',
        'microsoft.',
        'apple.',
        'reddit.',
        'support.google.',
        'quora.',
        'github.',
    ];

    /** @var array<string> Plantillas de búsqueda enfocadas en intención de compra y e-commerce de cosmética */
    protected array $discoveryTemplates = [
        '{term} serum comprar tienda venezuela',
        '{term} crema comprar tienda caracas',
        '{term} tienda online venezuela cosméticos',
        '{term} comprar online venezuela',
        'skincare venezuela {term} tienda',
        'tienda cosméticos {term} venezuela',
        '{term} cuidado facial tienda venezuela',
    ];

    public function __construct(
        protected ?WebSearchProviderInterface $searchProvider = null,
        protected ?StorePlatformDetectorService $detector = null,
        protected ?MultiStoreCrawlerEngine $crawlerEngine = null,
        protected ?StoreCountryDetectorService $countryDetector = null
    ) {
        $this->searchProvider = $searchProvider ?? app(WebSearchProviderInterface::class);
        $this->detector = $detector ?? new StorePlatformDetectorService();
        $this->crawlerEngine = $crawlerEngine ?? app(MultiStoreCrawlerEngine::class);
        $this->countryDetector = $countryDetector ?? new StoreCountryDetectorService();
    }

    /**
     * Ejecuta una ronda de descubrimiento web para un término específico o para ingredientes activos.
     *
     * @param string|null $specificTerm
     * @param int $maxQueries
     * @param bool $crawlImmediately Si se debe rastrear de inmediato el catálogo de las tiendas descubiertas
     * @return array
     */
    public function discover(?string $specificTerm = null, int $maxQueries = 5, bool $crawlImmediately = true): array
    {
        $stats = [
            'queries_executed' => 0,
            'urls_found' => 0,
            'domains_evaluated' => 0,
            'new_stores_registered' => 0,
            'stores_compatible' => 0,
            'stores_rejected' => 0,
            'new_products_synced' => 0,
            'discovered_stores' => [],
            'errors' => [],
        ];

        $terms = $this->resolveSearchTerms($specificTerm, $maxQueries);

        foreach ($terms as $term) {
            $template = $this->discoveryTemplates[array_rand($this->discoveryTemplates)];
            $query = str_replace('{term}', $term, $template);

            Log::channel('scraper')->info("🌐 [Web Discovery] Buscando en la web: '{$query}'");
            $stats['queries_executed']++;

            $urls = $this->searchProvider->search($query, ['limit' => 15]);
            $stats['urls_found'] += count($urls);

            foreach ($urls as $url) {
                try {
                    $domainUrl = $this->extractBaseDomain($url);
                    if (!$domainUrl || $this->isBlacklisted($domainUrl)) {
                        continue;
                    }

                    $stats['domains_evaluated']++;

                    // Verificar si ya está registrada en affiliate_stores
                    $host = parse_url($domainUrl, PHP_URL_HOST);
                    $exists = AffiliateStore::where('website_url', 'LIKE', "%{$host}%")->exists();
                    if ($exists) {
                        continue;
                    }

                    // Analizar plataforma con StorePlatformDetectorService
                    $detection = $this->detector->detect($domainUrl);

                    $isCompatible = ($detection['is_crawler_ready'] ?? false) || ($detection['is_compatible'] ?? false);

                    if (!$isCompatible || ($detection['platform'] ?? 'MANUAL') === 'MANUAL') {
                        $stats['stores_rejected']++;
                        continue;
                    }

                    $stats['stores_compatible']++;

                    // Registrar nueva tienda en el sistema
                    $store = $this->registerDiscoveredStore($domainUrl, $detection);
                    if ($store) {
                        $stats['new_stores_registered']++;
                        $storeSummary = [
                            'id' => $store->id,
                            'name' => $store->name,
                            'url' => $store->website_url,
                            'platform' => $store->crawler_platform,
                            'country_code' => $store->country_code,
                            'confidence' => $detection['confidence'],
                        ];
                        $stats['discovered_stores'][] = $storeSummary;

                        Log::channel('scraper')->info("🎉 [Web Discovery] ¡Nueva tienda detectada y registrada!: {$store->name} [{$store->country_code}] ({$store->crawler_platform}) en {$store->website_url}");

                        // Si se solicita, rastrear productos del término de búsqueda inmediatamente
                        if ($crawlImmediately && $this->crawlerEngine) {
                            $ingredientModel = Ingredient::where('common_name', 'ILIKE', "%{$term}%")
                                ->orWhere('inci_name', 'ILIKE', "%{$term}%")
                                ->first();
                            if ($ingredientModel) {
                                $crawlResult = $this->crawlerEngine->crawlForIngredient($ingredientModel, true, [$store->id]);
                                $stats['new_products_synced'] += $crawlResult['total_saved'] ?? 0;
                            }
                        }
                    }
                } catch (\Throwable $e) {
                    $stats['errors'][] = "Error procesando URL {$url}: " . $e->getMessage();
                    Log::channel('scraper')->error("Error en Web Discovery para {$url}: " . $e->getMessage());
                }
            }

            // Pausa cortés entre consultas web para evitar rate limits
            usleep(1500000); // 1.5 segundos
        }

        return $stats;
    }

    /**
     * Registra una tienda descubierta en la tabla affiliate_stores con su país detectado algorítmicamente.
     */
     public function registerDiscoveredStore(string $domainUrl, array $detection): ?AffiliateStore
     {
         $host = parse_url($domainUrl, PHP_URL_HOST);
         $name = $this->extractStoreName($domainUrl, $host);
         $slug = Str::slug($name);

         // Garantizar unicidad de slug
         $originalSlug = $slug;
         $counter = 1;
         while (AffiliateStore::where('slug', $slug)->exists()) {
             $slug = "{$originalSlug}-{$counter}";
             $counter++;
         }

         // Detección algorítmica de país multiseñal
         $countryResult = $this->countryDetector->detectCountry($domainUrl);
         $countryCode = $countryResult['country_code'] ?? 'GLOBAL';

         return AffiliateStore::create([
             'name' => $name,
             'slug' => $slug,
             'website_url' => $domainUrl,
             'crawler_platform' => $detection['platform'],
             'crawler_enabled' => true,
             'is_active' => true,
             'store_type' => 'ONLINE',
             'country_code' => $countryCode,
             'affiliate_network' => 'DISCOVERED_WEB',
         ]);
     }

    /**
     * Intenta extraer el nombre comercial de la tienda desde el sitio web o el dominio.
     */
    protected function extractStoreName(string $domainUrl, string $host): string
    {
        try {
            $response = Http::timeout(5)->get($domainUrl);
            if ($response->successful()) {
                $html = $response->body();

                // 1. Meta og:site_name
                if (preg_match('/<meta[^>]+property=["\']og:site_name["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $m)) {
                    $clean = trim(html_entity_decode($m[1]));
                    if (strlen($clean) > 2 && strlen($clean) < 60) {
                        return $clean;
                    }
                }

                // 2. Tag <title>
                if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $m)) {
                    $title = trim(strip_tags(html_entity_decode($m[1])));
                    // Tomar la primera parte antes de un separador común (| o -)
                    $parts = preg_split('/[\-|\–\—]/', $title);
                    if (!empty($parts[0])) {
                        $candidate = trim($parts[0]);
                        if (strlen($candidate) > 2 && strlen($candidate) < 60) {
                            return $candidate;
                        }
                    }
                }
            }
        } catch (\Throwable) {
            // Fallback a derivación del host
        }

        // Fallback: Limpiar el host (ej. www.tienda-online.com.ve -> Tienda Online)
        $cleanHost = preg_replace('/^(www\.)/i', '', $host);
        $cleanHost = preg_replace('/\.(com|com\.ve|ve|co|net|org|store|shop)$/i', '', $cleanHost);
        $cleanName = ucwords(str_replace(['-', '_', '.'], ' ', $cleanHost));

        return $cleanName ?: $host;
    }

    /**
     * Extrae el dominio base con protocolo (ej: https://sub.tienda.com).
     */
    protected function extractBaseDomain(string $url): ?string
    {
        $parsed = parse_url($url);
        if (empty($parsed['scheme']) || empty($parsed['host'])) {
            return null;
        }

        return "{$parsed['scheme']}://{$parsed['host']}";
    }

    /**
     * Verifica si el dominio pertenece a la lista negra.
     */
    protected function isBlacklisted(string $url): bool
    {
        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');
        foreach ($this->blacklistedDomains as $bad) {
            if (str_contains($host, $bad)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Resuelve los términos a buscar (priorizando ingredientes activos de la BD).
     *
     * @param string|null $specificTerm
     * @param int $max
     * @return array<string>
     */
    protected function resolveSearchTerms(?string $specificTerm, int $max): array
    {
        if (!empty($specificTerm)) {
            return [$specificTerm];
        }

        $ingredients = Ingredient::where('is_active', true)
            ->whereNotNull('common_name')
            ->inRandomOrder()
            ->limit($max)
            ->pluck('common_name')
            ->toArray();

        if (empty($ingredients)) {
            return ['retinol', 'acido hialuronico', 'niacinamida', 'vitamina c', 'acido salicilico'];
        }

        return $ingredients;
    }
}
