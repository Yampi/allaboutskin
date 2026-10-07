<?php

namespace App\Services\Scraper\Pipeline;

use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Services\Scraper\Contracts\GeocodingServiceInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\DTOs\ScrapedStoreBranchDTO;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OfferSyncService
{
    public function __construct(
        protected GeocodingServiceInterface $geocodingService
    ) {}

    /**
     * Sincroniza o registra una sucursal física proveniente del scraper.
     */
    public function syncBranch(ScrapedStoreBranchDTO $dto): ?StoreBranch
    {
        $store = $this->resolveStore($dto->storeSlug);

        // Si no tiene coordenadas geográficas, intentar geocodificar la dirección
        $lat = $dto->latitude;
        $lng = $dto->longitude;

        if ($lat === null || $lng === null) {
            $geocoded = $this->geocodingService->geocode(
                $dto->address,
                $dto->city,
                $dto->state
            );

            if ($geocoded) {
                $lat = $geocoded['latitude'];
                $lng = $geocoded['longitude'];
            }
        }

        // Generar un slug único para la sucursal
        $branchSlug = Str::slug("{$store->slug}-{$dto->name}-{$dto->city}");

        return StoreBranch::updateOrCreate(
            ['slug' => $branchSlug],
            [
                'store_id' => $store->id,
                'name' => $dto->name,
                'state' => $dto->state,
                'city' => $dto->city,
                'address' => $dto->address,
                'reference_point' => $dto->referencePoint,
                'latitude' => $lat ?? 0.0,
                'longitude' => $lng ?? 0.0,
                'geofence_radius_meters' => $dto->geofenceRadiusMeters,
                'phone' => $dto->phone,
                'whatsapp' => $dto->whatsapp,
                'opening_hours' => $dto->openingHours,
                'is_active' => $dto->isActive,
            ]
        );
    }

    /**
     * Sincroniza o actualiza una oferta de producto con el catálogo.
     */
    public function syncOffer(ScrapedProductOfferDTO $dto, ?\App\Models\Ingredient $matchingIngredient = null): ?ProductStoreOffer
    {
        $store = $this->resolveStore($dto->storeSlug);

        // 1. Emparejar con un producto existente (por código de barra EAN o por nombre)
        $product = null;

        if (!empty($dto->barcodeEan)) {
            $product = Product::where('barcode_ean', $dto->barcodeEan)->first();
        }

        if (!$product) {
            $product = $this->findProductByName($dto->productName, $dto->brandName);
        }

        // Si el producto aún no existe en el catálogo, lo creamos preliminarmente
        if (!$product) {
            $brandName = !empty($dto->brandName) ? $dto->brandName : 'Genérica / Desconocida';
            $brand = Brand::firstOrCreate(
                ['slug' => Str::slug($brandName)],
                ['name' => $brandName, 'is_verified' => false]
            );
            $brandId = $brand->id;

            $product = Product::create([
                'brand_id' => $brandId,
                'name' => $dto->productName,
                'slug' => Str::slug($dto->productName . '-' . uniqid()),
                'category' => $dto->category ?? 'MISCELLANEOUS',
                'barcode_ean' => $dto->barcodeEan,
                'is_verified' => false,
            ]);
        }

        // Si se vinculó un ingrediente activo específico (por búsqueda de componente), relacionarlo
        if ($matchingIngredient) {
            $product->ingredients()->syncWithoutDetaching([
                $matchingIngredient->id => [
                    'position' => 1,
                    'is_declared_active' => true,
                ]
            ]);
        }

        // 2. Asociar a sucursal si se especificó slug o nombre
        $branchId = null;
        if ($dto->branchSlug) {
            $branch = StoreBranch::where('slug', $dto->branchSlug)
                ->orWhere('name', 'ILIKE', "%{$dto->branchSlug}%")
                ->first();
            $branchId = $branch?->id;
        }

        // 3. Normalizar de forma estricta precios, divisas y equivalencias según el país de la tienda
        $priceNormalizer = app(\App\Services\Currency\PriceNormalizerService::class);
        $dto = $priceNormalizer->normalizeProductOffer($dto, $store);

        // Crear o actualizar la oferta de precio y stock
        return ProductStoreOffer::updateOrCreate(
            [
                'product_id' => $product->id,
                'store_id' => $store->id,
                'branch_id' => $branchId,
            ],
            [
                'product_url' => $dto->productUrl ?? $store->website_url,
                'affiliate_url' => $dto->productUrl ?? $store->website_url,
                'price' => $dto->price,
                'price_ves' => $dto->priceVes,
                'price_local' => $dto->priceLocal,
                'currency' => $dto->currency ?: 'USD',
                'currency_local' => $dto->currencyLocal,
                'in_stock' => $dto->inStock,
                'last_checked_at' => now(),
            ]
        );
    }

    /**
     * Búsqueda por similitud de nombres y marca.
     */
    protected function findProductByName(string $name, ?string $brandName = null): ?Product
    {
        $query = Product::query();

        if ($brandName) {
            $query->whereHas('brand', function ($q) use ($brandName) {
                $q->where('name', 'ILIKE', "%{$brandName}%")
                  ->orWhere('slug', Str::slug($brandName));
            });
        }

        // Búsqueda flexible en PostgreSQL (ILIKE insensible a mayúsculas/minúsculas)
        $cleanName = trim(preg_replace('/[^a-zA-Z0-9\s]/', '', $name));
        $terms = array_filter(explode(' ', $cleanName), fn($t) => strlen($t) > 3);

        if (!empty($terms)) {
            $firstTerm = array_shift($terms);
            $query->where('name', 'ILIKE', "%{$firstTerm}%");

            foreach (array_slice($terms, 0, 2) as $term) {
                $query->where('name', 'ILIKE', "%{$term}%");
            }

            return $query->first();
        }

        return null;
    }

    /**
     * Resuelve o crea una tienda afiliada de forma determinista y a prueba de colisiones únicas.
     */
    public function resolveStore(string $storeSlug): AffiliateStore
    {
        $normalizedSlug = Str::slug($storeSlug);
        $storeName = ucwords(str_replace('-', ' ', $normalizedSlug));

        // 1. Buscar coincidencia por slug exacto, nombre o prefijos
        $store = AffiliateStore::where('slug', $storeSlug)
            ->orWhere('slug', $normalizedSlug)
            ->orWhere('name', 'ILIKE', $storeName)
            ->orWhere('slug', 'ILIKE', "{$normalizedSlug}%")
            ->orWhere('slug', 'ILIKE', "%{$normalizedSlug}%")
            ->first();

        if ($store) {
            return $store;
        }

        // 2. Si no existe, deducir país mediante detector
        $fallbackUrl = 'https://' . $normalizedSlug . '.com';
        $countryDetector = app(\App\Services\Scraper\Services\StoreCountryDetectorService::class);
        $detected = $countryDetector->detectCountry($fallbackUrl);
        $countryCode = $detected['country_code'] ?? 'GLOBAL';

        // Usar firstOrCreate por name para garantizar que la restricción UNIQUE de PostgreSQL nunca falle
        return AffiliateStore::firstOrCreate(
            ['name' => $storeName],
            [
                'slug' => $normalizedSlug,
                'website_url' => $fallbackUrl,
                'store_type' => 'HYBRID',
                'country_code' => $countryCode,
                'is_active' => true,
            ]
        );
    }
}
