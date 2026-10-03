<?php

namespace App\Services\Scraper\Drivers;

use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\Contracts\StoreScraperInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\DTOs\ScrapedStoreBranchDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class LocatelScraper implements StoreScraperInterface
{
    protected string $storeKey = 'locatel';
    protected string $storeName = 'Locatel';
    protected ExchangeRateService $exchangeRateService;

    public function __construct(?ExchangeRateService $exchangeRateService = null)
    {
        $this->exchangeRateService = $exchangeRateService ?? new ExchangeRateService();
    }

    public function getStoreKey(): string
    {
        return $this->storeKey;
    }

    public function getStoreName(): string
    {
        return $this->storeName;
    }

    public function scrapeBranches(?string $city = null): array
    {
        $branches = [];

        $locations = [
            [
                'name' => 'Locatel - Boleíta Norte',
                'address' => 'Av. Francisco de Miranda, Centro Comercial Boleíta Center',
                'reference_point' => 'Nivel Galería',
                'city' => 'Caracas',
                'state' => 'Miranda',
                'latitude' => 10.4950000,
                'longitude' => -66.8290000,
                'phone' => '+58 212-2391122',
                'whatsapp' => '+58 414-9988776',
                'opening_hours' => '08:00 AM - 08:00 PM',
                'geofence_radius_meters' => 100,
            ],
            [
                'name' => 'Locatel - Chacaíto',
                'address' => 'Av. Francisco de Miranda, Centro Comercial Chacaíto, Nivel Terraza',
                'reference_point' => 'Frente a la salida del Metro Chacaíto',
                'city' => 'Caracas',
                'state' => 'Distrito Capital',
                'latitude' => 10.4912000,
                'longitude' => -66.8685000,
                'phone' => '+58 212-9513344',
                'whatsapp' => '+58 414-2233445',
                'opening_hours' => '08:00 AM - 07:00 PM',
                'geofence_radius_meters' => 90,
            ],
            [
                'name' => 'Locatel - Las Delicias',
                'address' => 'Av. Las Delicias, Centro Comercial La Floresta',
                'reference_point' => 'Al lado de la Clínica Lugo',
                'city' => 'Maracay',
                'state' => 'Aragua',
                'latitude' => 10.2589000,
                'longitude' => -67.5982000,
                'phone' => '+58 243-2421100',
                'whatsapp' => '+58 414-4455667',
                'opening_hours' => '08:00 AM - 07:00 PM',
                'geofence_radius_meters' => 100,
            ],
            [
                'name' => 'Locatel - El Viñedo',
                'address' => 'Av. Monseñor Adams, Urbanización El Viñedo',
                'reference_point' => 'Cruce con Calle 139',
                'city' => 'Valencia',
                'state' => 'Carabobo',
                'latitude' => 10.2185000,
                'longitude' => -68.0064000,
                'phone' => '+58 241-8245500',
                'whatsapp' => '+58 414-5566778',
                'opening_hours' => '08:00 AM - 08:00 PM',
                'geofence_radius_meters' => 110,
            ],
        ];

        foreach ($locations as $loc) {
            if ($city !== null && mb_strtolower($loc['city']) !== mb_strtolower($city)) {
                continue;
            }

            $branches[] = new ScrapedStoreBranchDTO(
                storeSlug: $this->storeKey,
                name: $loc['name'],
                address: $loc['address'],
                referencePoint: $loc['reference_point'],
                city: $loc['city'],
                state: $loc['state'],
                latitude: $loc['latitude'],
                longitude: $loc['longitude'],
                phone: $loc['phone'],
                whatsapp: $loc['whatsapp'],
                openingHours: $loc['opening_hours'],
                geofenceRadiusMeters: $loc['geofence_radius_meters'],
                isActive: true
            );
        }

        return $branches;
    }

    /**
     * Consulta el catálogo de productos dermatológicos en vivo de Locatel vía VTEX API.
     */
    public function scrapeProductOffers(?string $categorySlug = null): array
    {
        $offers = [];
        $searchTerms = ['dermatologia', 'protector solar', 'hidratante facial', 'cerave', 'serum facial'];

        foreach ($searchTerms as $term) {
            try {
                $url = "https://www.locatel.com.ve/api/catalog_system/pub/products/search?ft=" . urlencode($term);
                $response = Http::timeout(10)->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept' => 'application/json',
                ])->get($url);

                if (!$response->successful()) {
                    continue;
                }

                $items = $response->json();
                if (!is_array($items)) {
                    continue;
                }

                foreach (array_slice($items, 0, 4) as $item) {
                    $productName = $item['productName'] ?? null;
                    if (!$productName) {
                        continue;
                    }

                    $brandName = $item['brand'] ?? 'Genérica';
                    $productUrl = $item['link'] ?? 'https://www.locatel.com.ve';
                    $skuItem = $item['items'][0] ?? [];
                    $barcode = $skuItem['ean'] ?? null;

                    // En Locatel el precio viene en Bolívares (VES), Base + IVA (Tax)
                    $seller = $skuItem['sellers'][0]['commertialOffer'] ?? [];
                    $basePrice = (float) ($seller['Price'] ?? 0);
                    $tax = (float) ($seller['Tax'] ?? 0);
                    $priceVes = $basePrice + $tax;

                    if ($priceVes <= 0) {
                        continue;
                    }

                    $inStock = (int) ($seller['AvailableQuantity'] ?? 0) > 0;
                    $priceUsd = $this->exchangeRateService->vesToUsd($priceVes);

                    $offers[] = new ScrapedProductOfferDTO(
                        storeSlug: $this->storeKey,
                        productName: $productName,
                        brandName: $brandName,
                        barcodeEan: !empty($barcode) && is_numeric($barcode) ? $barcode : null,
                        category: $this->determineCategory($productName),
                        price: $priceUsd,
                        priceVes: $priceVes,
                        currency: 'USD',
                        inStock: $inStock,
                        productUrl: $productUrl,
                        imageUrl: $skuItem['images'][0]['imageUrl'] ?? null
                    );
                }
            } catch (\Throwable $e) {
                Log::channel('single')->warning("[LocatelScraper] Error consultando término {$term}: " . $e->getMessage());
            }

            if (count($offers) >= 12) {
                break;
            }
        }

        return $offers;
    }

    protected function determineCategory(string $name): string
    {
        $lower = mb_strtolower($name);
        if (str_contains($lower, 'limpiador') || str_contains($lower, 'cleanser') || str_contains($lower, 'espuma')) {
            return 'CLEANSER';
        }
        if (str_contains($lower, 'fps') || str_contains($lower, 'spf') || str_contains($lower, 'solar') || str_contains($lower, 'sun')) {
            return 'SUNSCREEN';
        }
        if (str_contains($lower, 'serum') || str_contains($lower, 'suero')) {
            return 'SERUM';
        }
        if (str_contains($lower, 'crema') || str_contains($lower, 'hidratante') || str_contains($lower, 'gel')) {
            return 'MOISTURIZER';
        }
        return 'SKINCARE';
    }
}
