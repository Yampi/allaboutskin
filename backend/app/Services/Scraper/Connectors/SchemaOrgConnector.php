<?php

namespace App\Services\Scraper\Connectors;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Scraper\Connectors\Contracts\StoreConnectorInterface;
use App\Services\Scraper\Drivers\GenericWebPageScraper;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Currency\ExchangeRateService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SchemaOrgConnector implements StoreConnectorInterface
{
    public function __construct(
        protected GenericWebPageScraper $webScraper = new GenericWebPageScraper(),
        protected ExchangeRateService $exchangeRateService = new ExchangeRateService()
    ) {}

    public function search(AffiliateStore $store, string $keyword, ?Ingredient $ingredient = null): array
    {
        $baseUrl = rtrim($store->website_url, '/');
        $searchPattern = $store->catalog_search_url ?: "{$baseUrl}/search?q={query}";
        $targetUrl = str_replace('{query}', urlencode($keyword), $searchPattern);

        $offers = [];

        try {
            $response = $this->configureHttpClient(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml',
                ])
                ->get($targetUrl);

            if (!$response->successful()) {
                if ($response->status() === 429) {
                    $response->throw();
                }
                return [];
            }

            $html = $response->body();

            // Buscar bloques Schema.org JSON-LD en la página
            if (preg_match_all('/<script\b[^>]*type=[\'"]application\/ld\+json[\'"][^>]*>(.*?)<\/script>/is', $html, $matches)) {
                foreach ($matches[1] as $jsonText) {
                    $data = json_decode(trim($jsonText), true);
                    if (!is_array($data)) {
                        continue;
                    }

                    $items = isset($data['@graph']) && is_array($data['@graph']) ? $data['@graph'] : [$data];

                    foreach ($items as $obj) {
                        $type = $obj['@type'] ?? '';
                        if ($type === 'Product' || (is_array($type) && in_array('Product', $type))) {
                            $name = $obj['name'] ?? null;
                            if (!$name) {
                                continue;
                            }

                            $offerData = $obj['offers'] ?? [];
                            if (isset($offerData[0])) {
                                $offerData = $offerData[0];
                            }

                            $storeCurrency = $this->exchangeRateService->getCurrencyForCountry($store->country_code);
                            $currency = strtoupper($offerData['priceCurrency'] ?? $storeCurrency);
                            $rawPrice = (float) ($offerData['price'] ?? 0);
                            $priceUsd = $this->exchangeRateService->toUsd($rawPrice, $currency);
                            $priceVes = ($currency === 'VES' || $currency === 'BS') ? $rawPrice : null;
                            $url = $offerData['url'] ?? ($obj['url'] ?? $targetUrl);
                            $brand = is_array($obj['brand'] ?? null) ? ($obj['brand']['name'] ?? $store->name) : ($obj['brand'] ?? $store->name);

                            $offers[] = new ScrapedProductOfferDTO(
                                storeSlug: $store->slug,
                                productName: $name,
                                price: $priceUsd,
                                currency: 'USD',
                                inStock: true,
                                productUrl: $url,
                                brandName: $brand,
                                category: 'SKINCARE',
                                priceVes: $priceVes,
                                priceLocal: $rawPrice,
                                currencyLocal: $currency
                            );
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response?->status() === 429) {
                throw $e;
            }
            Log::channel('single')->warning("[SchemaOrgConnector] Error en {$store->name}: " . $e->getMessage());
        }

        return $offers;
    }

    /**
     * Configura el cliente HTTP con timeout estricto de 8s y reintentos exponenciales con jitter.
     */
    protected function configureHttpClient(int $timeout = 8): \Illuminate\Http\Client\PendingRequest
    {
        return Http::connectTimeout(3)
            ->timeout($timeout)
            ->retry(3, function (int $attempt, ?\Exception $exception) {
                if ($exception instanceof \Illuminate\Http\Client\RequestException && $exception->response?->hasHeader('Retry-After')) {
                    $retryAfter = (int) $exception->response->header('Retry-After');
                    if ($retryAfter > 0) {
                        return min($retryAfter * 1000, 10000);
                    }
                }
                return ($attempt * 1000) + random_int(0, 250);
            }, function (\Exception $exception, $request) {
                if ($exception instanceof \Illuminate\Http\Client\RequestException) {
                    $status = $exception->response?->status();
                    return $status === 429 || ($status >= 500 && $status <= 504);
                }
                return $exception instanceof \Illuminate\Http\Client\ConnectionException;
            }, throw: false);
    }
}
