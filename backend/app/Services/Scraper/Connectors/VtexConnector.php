<?php

namespace App\Services\Scraper\Connectors;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\Connectors\Contracts\StoreConnectorInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class VtexConnector implements StoreConnectorInterface
{
    public function __construct(
        protected ExchangeRateService $exchangeRateService = new ExchangeRateService()
    ) {}

    public function search(AffiliateStore $store, string $keyword, ?Ingredient $ingredient = null): array
    {
        $baseUrl = rtrim($store->website_url, '/');
        $endpoint = "{$baseUrl}/api/catalog_system/pub/products/search?ft=" . urlencode($keyword) . "&_from=0&_to=49";

        $offers = [];

        try {
            $response = $this->configureHttpClient(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get($endpoint);

            if (!$response->successful()) {
                if ($response->status() === 429) {
                    $response->throw();
                }
                return [];
            }

            $items = $response->json();
            if (!is_array($items)) {
                return [];
            }

            foreach ($items as $item) {
                $productName = $item['productName'] ?? null;
                if (!$productName) {
                    continue;
                }

                $brandName = $item['brand'] ?? 'Genérica';
                $productUrl = $item['link'] ?? $baseUrl;

                $skuItem = $item['items'][0] ?? [];
                $barcode = $skuItem['ean'] ?? null;
                $seller = $skuItem['sellers'][0]['commertialOffer'] ?? [];

                $basePrice = (float) ($seller['Price'] ?? 0);
                $tax = (float) ($seller['Tax'] ?? 0);
                $rawVes = $basePrice + $tax;
                $inStock = (int) ($seller['AvailableQuantity'] ?? 0) > 0;

                $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                    rawPrice: $rawVes,
                    currency: 'VES',
                    countryCode: $store->country_code,
                    rawVes: $rawVes
                );

                $branchSlug = null;
                $merchantInstallments = $seller['Installments'][0]['sellerMerchantInstallments'][0]['id'] ?? null;
                if ($merchantInstallments) {
                    $branchSlug = Str::slug($merchantInstallments);
                }

                $offers[] = new ScrapedProductOfferDTO(
                    storeSlug: $store->slug,
                    productName: $productName,
                    price: $normalized['price_usd'],
                    currency: 'USD',
                    inStock: $inStock,
                    productUrl: $productUrl,
                    brandName: $brandName,
                    barcodeEan: !empty($barcode) && is_numeric($barcode) ? $barcode : null,
                    category: 'SKINCARE',
                    branchSlug: $branchSlug,
                    priceVes: $normalized['price_ves'],
                    priceLocal: $normalized['price_local'],
                    currencyLocal: $normalized['currency_local']
                );
            }
        } catch (\Throwable $e) {
            if ($e instanceof \Illuminate\Http\Client\RequestException && $e->response?->status() === 429) {
                throw $e;
            }
            Log::channel('single')->warning("[VtexConnector] Error consultando {$store->name} para '{$keyword}': " . $e->getMessage());
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

