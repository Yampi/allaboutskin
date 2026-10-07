<?php

namespace App\Services\Scraper\Drivers;

use App\Services\Currency\ExchangeRateService;
use App\Services\Currency\PriceCurrencyParserService;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenericWebPageScraper
{
    protected ExchangeRateService $exchangeRateService;

    public function __construct(?ExchangeRateService $exchangeRateService = null)
    {
        $this->exchangeRateService = $exchangeRateService ?? new ExchangeRateService();
    }

    /**
     * Rastrea una URL de producto arbitraria y extrae metadatos normalizados
     * utilizando OpenGraph, microdatos Schema.org (JSON-LD), estado de plataforma (VTEX) y tags HTML.
     */
    public function scrapeUrl(string $url, ?\App\Models\AffiliateStore $store = null): ?ScrapedProductOfferDTO
    {
        try {
            $parsedUrl = parse_url($url);
            $host = $parsedUrl['host'] ?? 'tienda-externa';
            $storeSlug = $store?->slug ?? Str::slug(explode('.', $host)[0] === 'www' ? explode('.', $host)[1] : explode('.', $host)[0]);

            // Determinar país de la tienda
            $countryCode = $store?->country_code;
            if (!$countryCode) {
                $matchedStore = \App\Models\AffiliateStore::where('website_url', 'ILIKE', "%{$host}%")->first();
                $countryCode = $matchedStore?->country_code;
            }
            if (!$countryCode) {
                $countryDetector = app(\App\Services\Scraper\Services\StoreCountryDetectorService::class);
                $countryDetection = $countryDetector->detectCountry($url);
                $countryCode = $countryDetection['country_code'] ?? 'GLOBAL';
            }

            $response = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ])
            ->timeout(15)
            ->get($url);

            if (!$response->successful()) {
                Log::channel('single')->error("Scraper HTTP error [{$response->status()}] para la URL: {$url}");
                return null;
            }

            $html = $response->body();

            // 1. Intentar extraer mediante microdatos JSON-LD (Schema.org / Product)
            $jsonLdData = $this->extractJsonLd($html);

            // 2. Extraer OpenGraph / Meta tags
            $metaData = $this->extractMetaTags($html);

            // Determinar título/nombre del producto
            $name = $jsonLdData['name'] 
                ?? $metaData['og:title'] 
                ?? $metaData['twitter:title'] 
                ?? $this->extractHtmlTitle($html)
                ?? 'Producto sin título';

            // Determinar marca
            $brand = $jsonLdData['brand'] 
                ?? $metaData['product:brand'] 
                ?? null;

            // Determinar disponibilidad
            $inStock = true;
            if (isset($jsonLdData['availability'])) {
                $inStock = str_contains(strtolower($jsonLdData['availability']), 'instock');
            } elseif (stripos($html, 'agotado') !== false || stripos($html, 'out of stock') !== false) {
                $inStock = false;
            }

            // 3. Extracción robusta de precios y monedas según el país
            $priceData = PriceCurrencyParserService::extractPricesFromHtml($html, $countryCode);

            // Si JSON-LD tenía precio y no fue capturado antes
            if ($priceData['price_local'] === null && isset($jsonLdData['price']) && $jsonLdData['price'] > 0) {
                $curr = strtoupper($jsonLdData['currency'] ?? $this->exchangeRateService->getCurrencyForCountry($countryCode));
                $localAmt = (float) $jsonLdData['price'];
                $priceData['price_local'] = $localAmt;
                $priceData['currency_local'] = $curr;
                $priceData['price_usd'] = $this->exchangeRateService->toUsd($localAmt, $curr);
                if ($countryCode === 'VE' && ($curr === 'VES' || $curr === 'BS')) {
                    $priceData['price_ves'] = $localAmt;
                }
            }

            // Si Meta tags tenían precio
            if ($priceData['price_local'] === null && isset($metaData['product:price:amount'])) {
                $metaPrice = (float) $metaData['product:price:amount'];
                $metaCurr = strtoupper($metaData['product:price:currency'] ?? $this->exchangeRateService->getCurrencyForCountry($countryCode));
                if ($metaPrice > 0) {
                    $priceData['price_local'] = $metaPrice;
                    $priceData['currency_local'] = $metaCurr;
                    $priceData['price_usd'] = $this->exchangeRateService->toUsd($metaPrice, $metaCurr);
                    if ($countryCode === 'VE' && ($metaCurr === 'VES' || $metaCurr === 'BS')) {
                        $priceData['price_ves'] = $metaPrice;
                    }
                }
            }

            $rawPriceCandidate = $priceData['price_usd'] ?? $priceData['price_local'] ?? null;
            $rawCurrCandidate = $priceData['currency_local'] ?? ($priceData['price_ves'] ? 'VES' : 'USD');
            $normalized = app(\App\Services\Currency\PriceNormalizerService::class)->normalize(
                rawPrice: $rawPriceCandidate,
                currency: $rawCurrCandidate,
                countryCode: $countryCode,
                rawVes: $priceData['price_ves'] ?? null,
                rawLocal: $priceData['price_local'] ?? null
            );

            // Determinar categoría por palabras clave
            $category = $this->determineCategory($name);

            return new ScrapedProductOfferDTO(
                storeSlug: $storeSlug,
                productName: trim($name),
                brandName: $brand,
                barcodeEan: $jsonLdData['gtin13'] ?? $jsonLdData['sku'] ?? null,
                category: $category,
                price: $normalized['price_usd'],
                priceVes: $normalized['price_ves'],
                currency: 'USD',
                inStock: $inStock,
                productUrl: $url,
                imageUrl: $jsonLdData['image'] ?? $metaData['og:image'] ?? null,
                rawMetadata: [
                    'source_host' => $host,
                    'extracted_at' => now()->toIso8601String(),
                    'price_source' => $priceData['source'],
                    'country_code' => $countryCode,
                    'currency_local' => $normalized['currency_local'],
                    'price_local' => $normalized['price_local'],
                    'base_ves' => $priceData['base_ves'] ?? null,
                    'tax_ves' => $priceData['tax_ves'] ?? null,
                ],
                priceLocal: $normalized['price_local'],
                currencyLocal: $normalized['currency_local']
            );
        } catch (\Throwable $e) {
            Log::channel('single')->error("Excepción en GenericWebPageScraper para [{$url}]: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extrae bloques de Schema.org JSON-LD del HTML.
     */
    protected function extractJsonLd(string $html): array
    {
        $result = [];
        if (preg_match_all('/<script\s+type=["\']application\/ld\+json["\']\s*>(.*?)<\/script>/is', $html, $matches)) {
            foreach ($matches[1] as $block) {
                $data = json_decode(trim($block), true);
                if (is_array($data)) {
                    $nodes = $data['@graph'] ?? [$data];
                    foreach ($nodes as $node) {
                        $type = $node['@type'] ?? '';
                        if (is_string($type) && strtolower($type) === 'product') {
                            $result['name'] = $node['name'] ?? null;
                            $result['sku'] = $node['sku'] ?? null;
                            $result['gtin13'] = $node['gtin13'] ?? $node['gtin'] ?? null;
                            $result['image'] = is_string($node['image'] ?? null) ? $node['image'] : ($node['image'][0] ?? null);

                            if (isset($node['brand'])) {
                                $result['brand'] = is_array($node['brand']) ? ($node['brand']['name'] ?? null) : $node['brand'];
                            }

                            if (isset($node['offers'])) {
                                $offers = $node['offers'];
                                $offer = is_array($offers) && isset($offers[0]) ? $offers[0] : (is_array($offers['offers'] ?? null) ? $offers['offers'][0] : $offers);
                                $result['price'] = (float) ($offer['price'] ?? $offers['lowPrice'] ?? 0);
                                $result['currency'] = $offer['priceCurrency'] ?? ($offers['priceCurrency'] ?? 'USD');
                                $result['availability'] = $offer['availability'] ?? 'InStock';
                            }
                            return $result;
                        }
                    }
                }
            }
        }
        return $result;
    }

    /**
     * Extrae meta tags OpenGraph y Twitter del HTML.
     */
    protected function extractMetaTags(string $html): array
    {
        $tags = [];
        if (preg_match_all('/<meta\s+[^>]*?(?:name|property)=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']/i', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $tags[strtolower($match[1])] = html_entity_decode($match[2], ENT_QUOTES | ENT_HTML5);
            }
        }
        return $tags;
    }

    protected function extractHtmlTitle(string $html): ?string
    {
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
            return trim(html_entity_decode($matches[1], ENT_QUOTES | ENT_HTML5));
        }
        return null;
    }

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
