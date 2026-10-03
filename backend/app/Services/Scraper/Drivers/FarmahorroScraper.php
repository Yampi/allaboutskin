<?php

namespace App\Services\Scraper\Drivers;

use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\Contracts\StoreScraperInterface;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\DTOs\ScrapedStoreBranchDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FarmahorroScraper implements StoreScraperInterface
{
    protected string $storeKey = 'farmahorro';
    protected string $storeName = 'Farmahorro';
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

    /**
     * Devuelve las sucursales físicas principales de Farmahorro en Venezuela.
     */
    public function scrapeBranches(?string $city = null): array
    {
        $branches = [];

        $locations = [
            [
                'name' => 'Farmahorro - Altamira',
                'address' => 'Av. San Juan Bosco con 2da Transversal de Altamira',
                'reference_point' => 'Cerca de la Plaza Altamira y estación de Metro',
                'city' => 'Caracas',
                'state' => 'Miranda',
                'latitude' => 10.4990000,
                'longitude' => -66.8525000,
                'phone' => '+58 212-2615500',
                'whatsapp' => '+58 412-2277110',
                'opening_hours' => '07:30 AM - 09:00 PM',
                'geofence_radius_meters' => 100,
            ],
            [
                'name' => 'Farmahorro - Las Mercedes',
                'address' => 'Av. Principal de Las Mercedes, Centro Comercial Tolón Fashion Mall',
                'reference_point' => 'Nivel PB, Entrada Principal',
                'city' => 'Caracas',
                'state' => 'Miranda',
                'latitude' => 10.4805000,
                'longitude' => -66.8622000,
                'phone' => '+58 212-3008800',
                'whatsapp' => '+58 412-2277111',
                'opening_hours' => '08:00 AM - 10:00 PM',
                'geofence_radius_meters' => 110,
            ],
            [
                'name' => 'Farmahorro - Sambil Chacao',
                'address' => 'Av. Libertador, Centro Comercial Sambil Chacao',
                'reference_point' => 'Nivel Autopista, pasillo de servicios',
                'city' => 'Caracas',
                'state' => 'Miranda',
                'latitude' => 10.4895000,
                'longitude' => -66.8530000,
                'phone' => '+58 212-2638899',
                'whatsapp' => '+58 412-2277112',
                'opening_hours' => '09:00 AM - 09:00 PM',
                'geofence_radius_meters' => 95,
            ],
            [
                'name' => 'Farmahorro - Las Delicias Maracay',
                'address' => 'Av. Las Delicias, Centro Empresarial Europa',
                'reference_point' => 'Frente al C.C. Las Américas',
                'city' => 'Maracay',
                'state' => 'Aragua',
                'latitude' => 10.2575000,
                'longitude' => -67.5995000,
                'phone' => '+58 243-2418800',
                'whatsapp' => '+58 412-2277113',
                'opening_hours' => '07:30 AM - 08:30 PM',
                'geofence_radius_meters' => 100,
            ],
            [
                'name' => 'Farmahorro - El Viñedo Valencia',
                'address' => 'Av. Monseñor Adams, Urbanización El Viñedo',
                'reference_point' => 'Diagonal a la Plaza Las Esculturas',
                'city' => 'Valencia',
                'state' => 'Carabobo',
                'latitude' => 10.2190000,
                'longitude' => -68.0070000,
                'phone' => '+58 241-8251122',
                'whatsapp' => '+58 412-2277114',
                'opening_hours' => '08:00 AM - 08:00 PM',
                'geofence_radius_meters' => 105,
            ],
            [
                'name' => 'Farmahorro - Las Trinitarias Barquisimeto',
                'address' => 'Av. Los Leones, Centro Comercial Las Trinitarias',
                'reference_point' => 'Nivel PB, Entrada 2',
                'city' => 'Barquisimeto',
                'state' => 'Lara',
                'latitude' => 10.0760000,
                'longitude' => -69.2885000,
                'phone' => '+58 251-2534455',
                'whatsapp' => '+58 412-2277115',
                'opening_hours' => '09:00 AM - 08:00 PM',
                'geofence_radius_meters' => 100,
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
     * Rastrea ofertas de productos de skincare y cuidado facial desde Farmahorro en vivo.
     */
    public function scrapeProductOffers(?string $categorySlug = null): array
    {
        $offers = [];

        // Categorías clave de Farmahorro para cosmética, protección solar y dermocosmética
        $categories = [
            'https://farmahorro.com.ve/categoria-producto/cuidado-personal/cuidado-de-la-piel/cuidado-facial-y-skincare/',
            'https://farmahorro.com.ve/categoria-producto/cuidado-personal/cuidado-de-la-piel/bronceadores-y-protectores-solares/protector-solar/',
            'https://farmahorro.com.ve/categoria-producto/cuidado-personal/cuidado-de-la-piel/cremas-y-lociones-corporales/crema-corporal/',
        ];

        foreach ($categories as $catUrl) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->timeout(12)
                ->get($catUrl);

                if (!$response->successful()) {
                    Log::channel('single')->warning("[FarmahorroScraper] Error HTTP [{$response->status()}] para {$catUrl}");
                    continue;
                }

                $html = $response->body();
                $pageOffers = $this->parseCategoryProducts($html);

                foreach ($pageOffers as $item) {
                    $offers[] = $item;
                }

            } catch (\Throwable $e) {
                Log::channel('single')->warning("[FarmahorroScraper] Excepción rastreando {$catUrl}: " . $e->getMessage());
            }

            // Pausa preventiva de 1 segundo para evitar saturar el servidor de Farmahorro
            usleep(800000);
        }

        return $offers;
    }

    /**
     * Parsea los bloques de productos <li class="one-product"> presentes en las páginas de categoría WooCommerce.
     *
     * @return array<ScrapedProductOfferDTO>
     */
    protected function parseCategoryProducts(string $html): array
    {
        $offers = [];

        // Extraer cada bloque de producto
        preg_match_all("/<li[^>]*class=\"[^\"]*one-product[^\"]*\"[^>]*>(.*?)<\/li>/is", $html, $items);

        if (empty($items[1])) {
            return [];
        }

        foreach ($items[1] as $productHtml) {
            // 1. Título y enlace del producto
            if (!preg_match("/<div class=\"title-col\">\s*<h4><a href=\"([^\"]+)\">([^<]+)<\/a><\/h4>/i", $productHtml, $titleMatch)) {
                continue;
            }

            $relativeLink = trim($titleMatch[1]);
            $productUrl = str_starts_with($relativeLink, 'http') ? $relativeLink : 'https://farmahorro.com.ve' . $relativeLink;
            $productName = html_entity_decode(trim($titleMatch[2]), ENT_QUOTES | ENT_HTML5, 'UTF-8');

            if (empty($productName)) {
                continue;
            }

            // 2. Extraer imagen del producto
            $imageUrl = null;
            if (preg_match("/<div class=\"img-col\">.*?<img[^>]*src=\"([^\"]+)\"/is", $productHtml, $imgMatch)) {
                $imgSrc = trim($imgMatch[1]);
                $imageUrl = str_starts_with($imgSrc, 'http') ? $imgSrc : 'https://farmahorro.com.ve' . $imgSrc;
            }

            // 3. Extraer precio en Bolívares (VES)
            // Ejemplo: <span class="product-normal-price"><span class="woocommerce-Price-amount amount"><bdi><span class="woocommerce-Price-currencySymbol">Bs.</span>390,21</bdi></span></span>
            $priceVes = null;
            if (preg_match("/<span class=\"product-normal-price\">.*?<bdi>.*?Bs\.\s*<\/span>\s*([0-9.,]+)<\/bdi>/is", $productHtml, $priceMatch)) {
                $rawPrice = str_replace('.', '', trim($priceMatch[1]));
                $rawPrice = str_replace(',', '.', $rawPrice);
                $priceVes = (float) $rawPrice;
            } elseif (preg_match("/Bs\.\s*([0-9.,]+)/i", $productHtml, $fallbackPrice)) {
                $rawPrice = str_replace('.', '', trim($fallbackPrice[1]));
                $rawPrice = str_replace(',', '.', $rawPrice);
                $priceVes = (float) $rawPrice;
            }

            if ($priceVes === null || $priceVes <= 0) {
                continue;
            }

            // Convertir a USD utilizando la tasa oficial BCV
            $priceUsd = $this->exchangeRateService->vesToUsd($priceVes);

            // 4. Deducir marca cosmética
            $brand = $this->detectBrand($productName);

            // 5. Deducir categoría cosmética
            $category = $this->determineCategory($productName);

            $offers[] = new ScrapedProductOfferDTO(
                storeSlug: $this->storeKey,
                productName: $productName,
                brandName: $brand,
                barcodeEan: null,
                category: $category,
                price: $priceUsd,
                priceVes: $priceVes,
                currency: 'USD',
                inStock: true,
                productUrl: $productUrl,
                imageUrl: $imageUrl
            );
        }

        return $offers;
    }

    /**
     * Detecta marcas comunes de skincare en el mercado venezolano a partir del nombre del producto.
     */
    protected function detectBrand(string $name): string
    {
        $lower = mb_strtolower($name);

        $brandPatterns = [
            'dernier' => 'Dernier Cosmetics',
            'zoah' => 'Zoah Anti-Edad',
            'cerave' => 'CeraVe',
            'la roche-posay' => 'La Roche-Posay',
            'la roche posay' => 'La Roche-Posay',
            'the ordinary' => 'The Ordinary',
            'bioderma' => 'Bioderma',
            'isdin' => 'ISDIN',
            'cetaphil' => 'Cetaphil',
            'neutrogena' => 'Neutrogena',
            'nivea' => 'Nivea',
            'ponds' => "Pond's",
            'eucerin' => 'Eucerin',
            'vichy' => 'Vichy',
            'garnier' => 'Garnier',
            'lubriderm' => 'Lubriderm',
            'st. ives' => 'St. Ives',
            'st ives' => 'St. Ives',
            'avene' => 'Avène',
            'avène' => 'Avène',
            'brita' => 'Brita Care',
            'valmy' => 'Valmy',
        ];

        foreach ($brandPatterns as $pattern => $brandName) {
            if (str_contains($lower, $pattern)) {
                return $brandName;
            }
        }

        return 'Genérica / Farmacia';
    }

    /**
     * Clasifica el producto según su función dermatológica.
     */
    protected function determineCategory(string $name): string
    {
        $lower = mb_strtolower($name);

        if (str_contains($lower, 'limpiador') || str_contains($lower, 'cleanser') || str_contains($lower, 'barra limpiadora') || str_contains($lower, 'gel limpiador') || str_contains($lower, 'espuma')) {
            return 'CLEANSER';
        }
        if (str_contains($lower, 'pantalla solar') || str_contains($lower, 'protector solar') || str_contains($lower, 'solar') || str_contains($lower, 'fps') || str_contains($lower, 'spf') || str_contains($lower, 'sun')) {
            return 'SUNSCREEN';
        }
        if (str_contains($lower, 'serum') || str_contains($lower, 'suero') || str_contains($lower, 'concentrado') || str_contains($lower, 'gotero')) {
            return 'SERUM';
        }
        if (str_contains($lower, 'contorno') || str_contains($lower, 'ojos') || str_contains($lower, 'eye')) {
            return 'EYE_CARE';
        }
        if (str_contains($lower, 'exfoliante') || str_contains($lower, 'peeling') || str_contains($lower, 'scrub')) {
            return 'EXFOLIANT';
        }
        if (str_contains($lower, 'tonico') || str_contains($lower, 'toner') || str_contains($lower, 'agua micelar') || str_contains($lower, 'desmaquillante')) {
            return 'TONER';
        }
        if (str_contains($lower, 'crema') || str_contains($lower, 'hidratante') || str_contains($lower, 'nutritiva') || str_contains($lower, 'gel') || str_contains($lower, 'bb crem')) {
            return 'MOISTURIZER';
        }

        return 'SKINCARE';
    }
}
