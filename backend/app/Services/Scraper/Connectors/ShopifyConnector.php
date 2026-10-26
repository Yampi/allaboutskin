<?php

namespace App\Services\Scraper\Connectors;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\Connectors\Contracts\StoreConnectorInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyConnector implements StoreConnectorInterface
{
    public function __construct(
        protected ExchangeRateService $exchangeRateService = new ExchangeRateService()
    ) {}

    public function search(AffiliateStore $store, string $keyword, ?Ingredient $ingredient = null): array
    {
        $baseUrl = rtrim($store->website_url, '/');
        $offers = [];
        $isVe = (($store->country_code ?? 'VE') === 'VE');

        // En Venezuela, Shopify opera en USD debido a pasarelas de pago internacionales
        $catalogCurrency = $isVe ? 'USD' : $this->exchangeRateService->getCurrencyForCountry($store->country_code);
        $isZeroDecimal = in_array($catalogCurrency, ['CLP', 'COP', 'PYG', 'JPY', 'KRW']);

        $startTime = microtime(true);

        try {
            // 1. Intentar el endpoint estándar predictivo de Shopify con timeout estricto de 8s
            $suggestUrl = "{$baseUrl}/search/suggest.json?q=" . urlencode($keyword) . "&resources[type]=product&resources[options][unavailable_products]=hide";
            $response = $this->configureHttpClient(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($suggestUrl);

            if ($response->status() === 429) {
                $response->throw();
            }

            if ($response->successful()) {
                $data = $response->json();
                $products = $data['resources']['results']['products'] ?? [];

                foreach ($products as $p) {
                    $title = $p['title'] ?? null;
                    if (!$title) {
                        continue;
                    }

                    $handle = $p['handle'] ?? '';
                    $productUrl = !empty($handle) ? "{$baseUrl}/products/{$handle}" : ($p['url'] ?? $baseUrl);
                    $brand = $p['vendor'] ?? $store->name;
                    $rawPrice = $p['price'] ?? 0;

                    // Si no es moneda de cero decimales (como CLP/COP) y Shopify devuelve centavos (ej: 2500 para $25.00)
                    if (!$isZeroDecimal && is_numeric($rawPrice) && (float)$rawPrice > 1000 && !str_contains((string) $rawPrice, '.')) {
                        $rawPrice = ((float) $rawPrice) / 100.0;
                    }

                    $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                        rawPrice: $rawPrice,
                        currency: $isVe ? 'USD' : $catalogCurrency,
                        countryCode: $store->country_code
                    );

                    $isAvailable = (bool) ($p['available'] ?? true);

                    $offers[] = new ScrapedProductOfferDTO(
                        storeSlug: $store->slug,
                        productName: $title,
                        price: $normalized['price_usd'],
                        currency: 'USD',
                        inStock: $isAvailable,
                        productUrl: $productUrl,
                        brandName: $brand,
                        category: 'SKINCARE',
                        priceVes: $normalized['price_ves'],
                        priceLocal: $normalized['price_local'],
                        currencyLocal: $normalized['currency_local']
                    );
                }

                if (!empty($offers)) {
                    return $offers;
                }
            }

            // 2. Fallback a /products.json respetando presupuesto de tiempo total de 8s
            $elapsed = microtime(true) - $startTime;
            if ($elapsed < 7.0) {
                $remainingTimeout = max(1, (int) round(8.0 - $elapsed));
                $catalogUrl = "{$baseUrl}/products.json?limit=50";
                $catResponse = $this->configureHttpClient($remainingTimeout)->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])->get($catalogUrl);

                if ($catResponse->status() === 429) {
                    $catResponse->throw();
                }

                if ($catResponse->successful()) {
                $catalogData = $catResponse->json();
                $allProducts = $catalogData['products'] ?? [];
                $kwLower = mb_strtolower($keyword);

                foreach ($allProducts as $p) {
                    $title = $p['title'] ?? '';
                    $body = $p['body_html'] ?? '';

                    if (str_contains(mb_strtolower($title), $kwLower) || str_contains(mb_strtolower($body), $kwLower)) {
                        $handle = $p['handle'] ?? '';
                        $productUrl = "{$baseUrl}/products/{$handle}";
                        $brand = $p['vendor'] ?? $store->name;
                        $firstVariant = $p['variants'][0] ?? [];
                        $rawPrice = $firstVariant['price'] ?? 0;

                        if (!$isZeroDecimal && is_numeric($rawPrice) && (float)$rawPrice > 1000 && !str_contains((string) $rawPrice, '.')) {
                            $rawPrice = ((float) $rawPrice) / 100.0;
                        }

                        $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                            rawPrice: $rawPrice,
                            currency: $isVe ? 'USD' : $catalogCurrency,
                            countryCode: $store->country_code
                        );

                        $inStock = (bool) ($firstVariant['available'] ?? true);

                        $offers[] = new ScrapedProductOfferDTO(
                            storeSlug: $store->slug,
                            productName: $title,
                            price: $normalized['price_usd'],
                            currency: 'USD',
                            inStock: $inStock,
                            productUrl: $productUrl,
                            brandName: $brand,
                            category: 'SKINCARE',
                            priceVes: $normalized['price_ves'],
                            priceLocal: $normalized['price_local'],
                            currencyLocal: $normalized['currency_local']
                        );
                    }
                }
            }
        }
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response?->status() === 429) {
                throw $e;
            }
            Log::channel('single')->warning("[ShopifyConnector] Error en {$store->name}: " . $e->getMessage());
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
