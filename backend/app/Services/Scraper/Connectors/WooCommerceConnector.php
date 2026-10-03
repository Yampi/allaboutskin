<?php

namespace App\Services\Scraper\Connectors;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\Connectors\Contracts\StoreConnectorInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WooCommerceConnector implements StoreConnectorInterface
{
    public function __construct(
        protected ExchangeRateService $exchangeRateService = new ExchangeRateService()
    ) {}

    public function search(AffiliateStore $store, string $keyword, ?Ingredient $ingredient = null): array
    {
        $baseUrl = rtrim($store->website_url, '/');
        $offers = [];

        try {
            // 1. Endpoint público de WooCommerce Store API (v1)
            $storeApiUrl = "{$baseUrl}/wp-json/wc/store/v1/products?search=" . urlencode($keyword) . "&per_page=25";
            $response = Http::timeout(12)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($storeApiUrl);

            if ($response->successful()) {
                $items = $response->json();
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $name = $item['name'] ?? null;
                        if (!$name) {
                            continue;
                        }

                        $permalink = $item['permalink'] ?? $baseUrl;
                        $prices = $item['prices'] ?? [];
                        $minorUnit = (int) ($prices['currency_minor_unit'] ?? 2);
                        $rawPrice = (float) ($prices['price'] ?? 0);
                        $divisor = pow(10, $minorUnit);
                        $priceValue = $divisor > 0 ? $rawPrice / $divisor : $rawPrice;

                        $storeCurrency = $this->exchangeRateService->getCurrencyForCountry($store->country_code);
                        $currencyCode = strtoupper($prices['currency_code'] ?? $storeCurrency);
                        $priceUsd = $this->exchangeRateService->toUsd($priceValue, $currencyCode);
                        $priceVes = ($currencyCode === 'VES' || $currencyCode === 'BS') ? $priceValue : null;

                        $inStock = (bool) ($item['is_in_stock'] ?? true);

                        $offers[] = new ScrapedProductOfferDTO(
                            storeSlug: $store->slug,
                            productName: html_entity_decode($name, ENT_QUOTES | ENT_HTML5),
                            price: $priceUsd,
                            currency: 'USD',
                            inStock: $inStock,
                            productUrl: $permalink,
                            brandName: $store->name,
                            category: 'SKINCARE',
                            priceVes: $priceVes,
                            priceLocal: $priceValue,
                            currencyLocal: $currencyCode
                        );
                    }

                    if (!empty($offers)) {
                        return $offers;
                    }
                }
            }

            // 2. Fallback HTML: Parseo de resultados de búsqueda WooCommerce
            $searchHtmlUrl = "{$baseUrl}/?s=" . urlencode($keyword) . "&post_type=product";
            $htmlResp = Http::timeout(10)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ])->get($searchHtmlUrl);

            if ($htmlResp->successful()) {
                $html = $htmlResp->body();

                // Caso A: Temas tipo Farmahorro y custom (<li class="one-product"> o .product-card)
                if (preg_match_all('/<li[^>]*class=[\'"][^\'"]*one-product[^\'"]*[\'"][^>]*>(.*?)<\/li>/is', $html, $items) && !empty($items[1])) {
                    foreach ($items[1] as $p) {
                        if (preg_match('/<h4><a\s+href=[\'"]([^\'"]+)[\'"]>([^<]+)<\/a><\/h4>/i', $p, $tm)) {
                            $link = trim($tm[1]);
                            $fullUrl = str_starts_with($link, 'http') ? $link : $baseUrl . $link;
                            $title = html_entity_decode(trim($tm[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');

                            $priceVes = null;
                            if (preg_match('/<bdi>.*?Bs\.\s*<\/span>\s*([0-9.,]+)<\/bdi>/is', $p, $prm)) {
                                $rawVes = str_replace('.', '', trim($prm[1]));
                                $rawVes = (float) str_replace(',', '.', $rawVes);
                                $priceVes = $rawVes > 0 ? $rawVes : null;
                            }

                            $priceUsd = $priceVes ? $this->exchangeRateService->vesToUsd($priceVes) : 15.00;

                            $offers[] = new ScrapedProductOfferDTO(
                                storeSlug: $store->slug,
                                productName: $title,
                                price: $priceUsd,
                                currency: 'USD',
                                inStock: true,
                                productUrl: $fullUrl,
                                brandName: $store->name,
                                category: 'SKINCARE',
                                priceVes: $priceVes
                            );
                        }
                    }
                }

                // Caso B: Estándar WooCommerce (<li class="product"> o .woocommerce-LoopProduct-link)
                if (empty($offers)) {
                    preg_match_all('/<a[^>]+href="([^"]+)"[^>]*class="[^"]*woocommerce-LoopProduct-link[^"]*"[^>]*>.*?<h2[^>]*>([^<]+)<\/h2>/is', $html, $matches, PREG_SET_ORDER);
                    foreach ($matches as $m) {
                        $url = $m[1];
                        $title = trim($m[2]);

                        $offers[] = new ScrapedProductOfferDTO(
                            storeSlug: $store->slug,
                            productName: html_entity_decode($title, ENT_QUOTES | ENT_HTML5),
                            price: 15.00,
                            currency: 'USD',
                            inStock: true,
                            productUrl: $url,
                            brandName: $store->name,
                            category: 'SKINCARE'
                        );
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[WooCommerceConnector] Error consultando {$store->name}: " . $e->getMessage());
        }

        return $offers;
    }
}
