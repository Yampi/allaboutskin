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

        $startTime = microtime(true);

        try {
            // 1. Endpoint público de WooCommerce Store API (v1) con timeout estricto de 8s
            $storeApiUrl = "{$baseUrl}/wp-json/wc/store/v1/products?search=" . urlencode($keyword) . "&per_page=25";
            $response = $this->configureHttpClient(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($storeApiUrl);

            if ($response->status() === 429) {
                $response->throw();
            }

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

                        $currencyCode = strtoupper($prices['currency_code'] ?? '');
                        $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                            rawPrice: $priceValue,
                            currency: $currencyCode,
                            countryCode: $store->country_code
                        );

                        $inStock = (bool) ($item['is_in_stock'] ?? true);

                        $offers[] = new ScrapedProductOfferDTO(
                            storeSlug: $store->slug,
                            productName: html_entity_decode($name, ENT_QUOTES | ENT_HTML5),
                            price: $normalized['price_usd'],
                            currency: 'USD',
                            inStock: $inStock,
                            productUrl: $permalink,
                            brandName: $store->name,
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
            }

            // 2. Fallback HTML: Parseo de resultados de búsqueda WooCommerce respetando presupuesto de 8s
            $elapsed = microtime(true) - $startTime;
            if ($elapsed < 7.0) {
                $remainingTimeout = max(1, (int) round(8.0 - $elapsed));
                $searchHtmlUrl = "{$baseUrl}/?s=" . urlencode($keyword) . "&post_type=product";
                $htmlResp = $this->configureHttpClient($remainingTimeout)->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])->get($searchHtmlUrl);

                if ($htmlResp->status() === 429) {
                    $htmlResp->throw();
                }

                if ($htmlResp->successful()) {
                    $html = $htmlResp->body();

                    // Caso A: Temas tipo Farmahorro y custom (<li class="one-product"> o .product-card)
                    if (preg_match_all('/<li[^>]*class=[\'"][^\'"]*one-product[^\'"]*[\'"][^>]*>(.*?)<\/li>/is', $html, $items) && !empty($items[1])) {
                        foreach ($items[1] as $p) {
                            if (preg_match('/<h4><a\s+href=[\'"]([^\'"]+)[\'"]>([^<]+)<\/a><\/h4>/i', $p, $tm)) {
                                $link = trim($tm[1]);
                                $fullUrl = str_starts_with($link, 'http') ? $link : $baseUrl . $link;
                                $title = html_entity_decode(trim($tm[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');

                                $rawVes = null;
                                if (preg_match('/<bdi>.*?Bs\.\s*<\/span>\s*([0-9.,]+)<\/bdi>/is', $p, $prm)) {
                                    $rawVes = app(\App\Services\Currency\PriceNormalizerService::class)->parseAmount($prm[1], 'VES', 'VE');
                                }

                                $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                                    rawPrice: $rawVes,
                                    currency: 'VES',
                                    countryCode: $store->country_code,
                                    rawVes: $rawVes
                                );

                                $offers[] = new ScrapedProductOfferDTO(
                                    storeSlug: $store->slug,
                                    productName: $title,
                                    price: $normalized['price_usd'],
                                    currency: 'USD',
                                    inStock: true,
                                    productUrl: $fullUrl,
                                    brandName: $store->name,
                                    category: 'SKINCARE',
                                    priceVes: $normalized['price_ves'],
                                    priceLocal: $normalized['price_local'],
                                    currencyLocal: $normalized['currency_local']
                                );
                            }
                        }
                    }

                    // Caso B: Estándar WooCommerce (<li class="product">)
                    // Elimina precios hardcodeados (como $15.00) exigiendo precio real o descartando oferta
                    if (empty($offers)) {
                        if (preg_match_all('/<li[^>]*class=[\'"][^\'"]*product[^\'"]*[\'"][^>]*>(.*?)<\/li>/is', $html, $cards) && !empty($cards[1])) {
                            foreach ($cards[1] as $card) {
                                $url = null;
                                $title = null;
                                if (preg_match('/<a[^>]+href="([^"]+)"[^>]*class="[^"]*woocommerce-LoopProduct-link[^"]*"[^>]*>.*?<h2[^>]*>([^<]+)<\/h2>/is', $card, $m)) {
                                    $url = $m[1];
                                    $title = trim($m[2]);
                                } elseif (preg_match('/<a[^>]+href="([^"]+)"[^>]*>.*?<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]+)<\/h2>/is', $card, $m)) {
                                    $url = $m[1];
                                    $title = trim($m[2]);
                                }

                                if (!$url || !$title) {
                                    continue;
                                }

                                // Extraer precio real desde etiquetas de precio WooCommerce
                                $parsedPrice = null;
                                if (preg_match('/<span[^>]*class=[\'"][^\'"]*woocommerce-Price-amount[^\'"]*[\'"][^>]*>.*?<bdi>(?:<span[^>]*>.*?<\/span>)?\s*([0-9.,]+)<\/bdi>/is', $card, $pm)) {
                                    $parsedPrice = app(\App\Services\Currency\PriceNormalizerService::class)->parseAmount($pm[1], 'USD', $store->country_code);
                                } elseif (preg_match('/<span[^>]*class=[\'"][^\'"]*woocommerce-Price-amount[^\'"]*[\'"][^>]*>.*?([0-9]+[.,][0-9]{2})/is', $card, $pm)) {
                                    $parsedPrice = app(\App\Services\Currency\PriceNormalizerService::class)->parseAmount($pm[1], 'USD', $store->country_code);
                                }

                                // Si no hay precio real parseable, omitir el producto (NUNCA usar fallbacks falsos como $15.00)
                                if ($parsedPrice === null || $parsedPrice <= 0) {
                                    continue;
                                }

                                $storeCurrency = $this->exchangeRateService->getCurrencyForCountry($store->country_code);
                                $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                                    rawPrice: $parsedPrice,
                                    currency: $storeCurrency,
                                    countryCode: $store->country_code
                                );

                                $offers[] = new ScrapedProductOfferDTO(
                                    storeSlug: $store->slug,
                                    productName: html_entity_decode($title, ENT_QUOTES | ENT_HTML5),
                                    price: $normalized['price_usd'],
                                    currency: 'USD',
                                    inStock: true,
                                    productUrl: str_starts_with($url, 'http') ? $url : $baseUrl . $url,
                                    brandName: $store->name,
                                    category: 'SKINCARE',
                                    priceVes: $normalized['price_ves'],
                                    priceLocal: $normalized['price_local'],
                                    currencyLocal: $normalized['currency_local']
                                );
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response?->status() === 429) {
                throw $e;
            }
            Log::channel('single')->warning("[WooCommerceConnector] Error consultando {$store->name}: " . $e->getMessage());
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
