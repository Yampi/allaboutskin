<?php

namespace App\Services\Scraper\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StorePlatformDetectorService
{
    /**
     * Analiza una URL de tienda para detectar de forma automatizada su plataforma de e-commerce.
     *
     * @param string $url URL base de la tienda (ej: https://ejemplo.com)
     * @return array
     */
    public function detect(string $url): array
    {
        $normalizedUrl = rtrim($url, '/');
        if (!str_starts_with($normalizedUrl, 'http://') && !str_starts_with($normalizedUrl, 'https://')) {
            $normalizedUrl = 'https://' . $normalizedUrl;
        }

        $detectedPlatform = 'MANUAL';
        $confidence = 'LOW';
        $signals = [];
        $sampleProductsCount = 0;

        // 1. Probar si es Shopify (API Predictiva o /products.json)
        try {
            $shopifyResp = Http::timeout(6)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get("{$normalizedUrl}/products.json?limit=3");

            if ($shopifyResp->successful()) {
                $data = $shopifyResp->json();
                if (isset($data['products']) && is_array($data['products'])) {
                    $detectedPlatform = 'SHOPIFY';
                    $confidence = 'HIGH';
                    $signals[] = 'Endpoint público /products.json activo con ' . count($data['products']) . ' productos detectados.';
                    $sampleProductsCount = count($data['products']);
                    return $this->formatResult($detectedPlatform, $confidence, $signals, $sampleProductsCount, $normalizedUrl);
                }
            }
        } catch (\Throwable $e) {
            // Continuar con siguiente detección
        }

        // 2. Probar si es WooCommerce (Store API o WordPress REST)
        try {
            $wcResp = Http::timeout(6)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get("{$normalizedUrl}/wp-json/wc/store/v1/products?per_page=3");

            if ($wcResp->successful() && is_array($wcResp->json())) {
                $data = $wcResp->json();
                $detectedPlatform = 'WOOCOMMERCE';
                $confidence = 'HIGH';
                $signals[] = 'WooCommerce Store API v1 pública (/wp-json/wc/store/v1/products) activa.';
                $sampleProductsCount = count($data);
                return $this->formatResult($detectedPlatform, $confidence, $signals, $sampleProductsCount, $normalizedUrl);
            }
        } catch (\Throwable $e) {
            // Continuar con siguiente detección
        }

        // 3. Probar si es VTEX (API de Catálogo)
        try {
            $vtexResp = Http::timeout(6)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])
                ->get("{$normalizedUrl}/api/catalog_system/pub/products/search?_from=0&_to=2");

            if (($vtexResp->status() === 200 || $vtexResp->status() === 206) && is_array($vtexResp->json())) {
                $data = $vtexResp->json();
                $detectedPlatform = 'VTEX';
                $confidence = 'HIGH';
                $signals[] = 'VTEX Catalog System API (/api/catalog_system/pub/products/search) activa.';
                $sampleProductsCount = count($data);
                return $this->formatResult($detectedPlatform, $confidence, $signals, $sampleProductsCount, $normalizedUrl);
            }
        } catch (\Throwable $e) {
            // Continuar con siguiente detección
        }

        // 4. Inspección profunda de HTML (Meta tags, scripts y Schema.org)
        try {
            $htmlResp = Http::timeout(8)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->get($normalizedUrl);

            if ($htmlResp->successful()) {
                $html = $htmlResp->body();

                if (str_contains($html, 'cdn.shopify.com') || str_contains($html, 'window.Shopify') || str_contains($html, 'Shopify.theme')) {
                    $detectedPlatform = 'SHOPIFY';
                    $confidence = 'HIGH';
                    $signals[] = 'Assets o scripts globales de Shopify detectados en el DOM HTML.';
                } elseif (str_contains($html, 'woocommerce') || str_contains($html, 'wc-block') || str_contains($html, 'wp-content/plugins/woocommerce')) {
                    $detectedPlatform = 'WOOCOMMERCE';
                    $confidence = 'HIGH';
                    $signals[] = 'Plugins o selectores CSS de WooCommerce detectados en el DOM HTML.';
                } elseif (str_contains($html, 'vtexassets') || str_contains($html, 'vtex.cmc')) {
                    $detectedPlatform = 'VTEX';
                    $confidence = 'HIGH';
                    $signals[] = 'Assets de plataforma VTEX detectados en el DOM HTML.';
                } elseif (str_contains($html, 'application/ld+json') && str_contains($html, 'schema.org') && str_contains($html, 'Product')) {
                    $detectedPlatform = 'SCHEMA_ORG';
                    $confidence = 'MEDIUM';
                    $signals[] = 'Marcado semántico JSON-LD Schema.org Product disponible para rastreo universal.';
                }
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[PlatformDetector] Error analizando HTML para {$normalizedUrl}: " . $e->getMessage());
        }

        return $this->formatResult($detectedPlatform, $confidence, $signals, $sampleProductsCount, $normalizedUrl);
    }

    protected function formatResult(string $platform, string $confidence, array $signals, int $sampleProductsCount, string $url): array
    {
        $connectorMap = [
            'SHOPIFY' => 'ShopifyConnector (Predictive search & /products.json)',
            'WOOCOMMERCE' => 'WooCommerceConnector (Store API REST & HTML product loop)',
            'VTEX' => 'VtexConnector (VTEX Pub Catalog API)',
            'SCHEMA_ORG' => 'SchemaOrgConnector (Universal JSON-LD Product Parser)',
            'MANUAL' => 'GenericWebPageScraper / Ingestión Manual de Redes',
        ];

        return [
            'url' => $url,
            'platform' => $platform,
            'confidence' => $confidence,
            'is_crawler_ready' => $platform !== 'MANUAL',
            'is_compatible' => $platform !== 'MANUAL',
            'recommended_connector' => $connectorMap[$platform] ?? 'SchemaOrgConnector',
            'sample_products_found' => $sampleProductsCount,
            'signals' => $signals,
        ];
    }
}
