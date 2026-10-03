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
        $storeCurrency = $this->exchangeRateService->getCurrencyForCountry($store->country_code);
        $isZeroDecimal = in_array($storeCurrency, ['CLP', 'COP', 'PYG', 'JPY', 'KRW']);

        try {
            // 1. Intentar el endpoint estándar predictivo de Shopify
            $suggestUrl = "{$baseUrl}/search/suggest.json?q=" . urlencode($keyword) . "&resources[type]=product&resources[options][unavailable_products]=hide";
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($suggestUrl);

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
                    $rawPrice = (float) ($p['price'] ?? 0);

                    // Si no es moneda de cero decimales (como CLP/COP) y Shopify devuelve centavos (ej: 2500 para $25.00)
                    $localPrice = $rawPrice;
                    if (!$isZeroDecimal && $rawPrice > 1000 && !str_contains((string) ($p['price'] ?? ''), '.')) {
                        $localPrice = $rawPrice / 100.0;
                    }

                    // Convertir precio local a USD
                    $priceUsd = $this->exchangeRateService->toUsd($localPrice, $storeCurrency);
                    $priceVes = $storeCurrency === 'VES' ? $localPrice : null;

                    $isAvailable = (bool) ($p['available'] ?? true);

                    $offers[] = new ScrapedProductOfferDTO(
                        storeSlug: $store->slug,
                        productName: $title,
                        price: $priceUsd,
                        currency: 'USD',
                        inStock: $isAvailable,
                        productUrl: $productUrl,
                        brandName: $brand,
                        category: 'SKINCARE',
                        priceVes: $priceVes,
                        priceLocal: $localPrice,
                        currencyLocal: $storeCurrency
                    );
                }

                if (!empty($offers)) {
                    return $offers;
                }
            }

            // 2. Fallback a /products.json si suggest no arrojó resultados
            $catalogUrl = "{$baseUrl}/products.json?limit=50";
            $catResponse = Http::timeout(10)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept' => 'application/json',
            ])->get($catalogUrl);

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
                        $rawPrice = (float) ($firstVariant['price'] ?? 0);

                        $localPrice = $rawPrice;
                        if (!$isZeroDecimal && $rawPrice > 1000 && !str_contains((string) ($firstVariant['price'] ?? ''), '.')) {
                            $localPrice = $rawPrice / 100.0;
                        }

                        $priceUsd = $this->exchangeRateService->toUsd($localPrice, $storeCurrency);
                        $priceVes = $storeCurrency === 'VES' ? $localPrice : null;
                        $inStock = (bool) ($firstVariant['available'] ?? true);

                        $offers[] = new ScrapedProductOfferDTO(
                            storeSlug: $store->slug,
                            productName: $title,
                            price: $priceUsd,
                            currency: 'USD',
                            inStock: $inStock,
                            productUrl: $productUrl,
                            brandName: $brand,
                            category: 'SKINCARE',
                            priceVes: $priceVes,
                            priceLocal: $localPrice,
                            currencyLocal: $storeCurrency
                        );
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[ShopifyConnector] Error en {$store->name}: " . $e->getMessage());
        }

        return $offers;
    }
}
