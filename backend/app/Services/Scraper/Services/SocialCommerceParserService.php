<?php

namespace App\Services\Scraper\Services;

use App\Services\Currency\ExchangeRateService;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SocialCommerceParserService
{
    protected ExchangeRateService $exchangeRateService;

    // Catálogo de marcas frecuentes en el mercado venezolano de cosmética y skincare
    protected array $knownBrands = [
        'The Ordinary' => ['the ordinary', 'ordinary', 'theordinary'],
        'CeraVe' => ['cerave', 'cera ve'],
        'La Roche-Posay' => ['la roche posay', 'la roche-posay', 'laroche posay', 'laroche-posay', 'lrp'],
        'Good Molecules' => ['good molecules', 'goodmolecules'],
        'Beauty of Joseon' => ['beauty of joseon', 'boj', 'joseon'],
        'Cosrx' => ['cosrx', 'cos rx'],
        'Anua' => ['anua'],
        'Skin1004' => ['skin1004', 'skin 1004', 'centella skin1004', 'madagascar centella'],
        'Bioderma' => ['bioderma', 'sensibio', 'sebium'],
        'ISDIN' => ['isdin', 'fotoprotector isdin', 'fusion water'],
        'Cetaphil' => ['cetaphil'],
        'Eucerin' => ['eucerin', 'oil control eucerin'],
        'Vichy' => ['vichy', 'mineral 89'],
        'Neutrogena' => ['neutrogena', 'hydro boost'],
        'Paula\'s Choice' => ['paula\'s choice', 'paulas choice', 'paula choice'],
        'The Inkey List' => ['the inkey list', 'inkey list'],
        'Rohto Hada Labo' => ['hada labo', 'rohto hadalabo'],
        'Bioré' => ['biore', 'bioré'],
        'Nivea' => ['nivea'],
        'Garnier' => ['garnier', 'micelar garnier'],
        'L\'Oréal' => ['loreal', 'l\'oreal', 'l oreal'],
        'Zoah Anti-Edad' => ['zoah'],
        'Dernier Cosmetics' => ['dernier', 'dernier cosmetics'],
        'Dr. Rashel' => ['dr rashel', 'dr. rashel', 'doctor rashel'],
        'Tree Hut' => ['tree hut', 'treehut'],
        'Laneige' => ['laneige', 'lip sleeping mask'],
        'Tocobo' => ['tocobo'],
        'Round Lab' => ['round lab', 'birch juice'],
        'Haruharu Wonder' => ['haruharu', 'haruharu wonder'],
        'Some By Mi' => ['some by mi', 'somebymi'],
        'Torriden' => ['torriden', 'dive in'],
        'Medicube' => ['medicube', 'zero pore'],
        'Valmy' => ['valmy'],
    ];

    // Ciudades principales de Venezuela para geo-referenciación
    protected array $knownCities = [
        'Caracas' => ['caracas', 'ccs', 'chacao', 'las mercedes', 'altamira', 'el hatillo', 'baruta', 'la candelaria', 'sambil chacao', 'ccct'],
        'Valencia' => ['valencia', 'el viñedo', 'naguanagua', 'san diego', 'sambil valencia', 'prebo'],
        'Maracay' => ['maracay', 'las delicias', 'el bosque', 'calicanto', 'cagua', 'turmero'],
        'Barquisimeto' => ['barquisimeto', 'lara', 'las trinitarias', 'cabudare'],
        'Maracaibo' => ['maracaibo', 'zulia', 'bella vista', 'delicias norte', '5 de julio'],
        'Lechería' => ['lecheria', 'lechería', 'puerto la cruz', 'plc', 'barcelona', 'anzoategui'],
        'San Cristóbal' => ['san cristobal', 'san cristóbal', 'tachira', 'táchira'],
        'Mérida' => ['merida', 'mérida'],
        'Puerto Ordaz' => ['puerto ordaz', 'pzo', 'guayana'],
        'Maturín' => ['maturin', 'maturín'],
    ];

    public function __construct(?ExchangeRateService $exchangeRateService = null)
    {
        $this->exchangeRateService = $exchangeRateService ?? new ExchangeRateService();
    }

    /**
     * Parsea un texto no estructurado (caption de Instagram, mensaje de WhatsApp,
     * listado de precios o transcripción de flyer).
     */
    public function parsePostText(
        string $rawText,
        ?string $defaultStoreSlug = null,
        ?string $postDate = null,
        ?string $accountBio = null
    ): array {
        $cleanText = trim($rawText);

        // 0. Evaluación de autenticidad, vigencia temporal y filtro anti-bot/foráneo
        $authenticity = $this->evaluateAuthenticity($cleanText, $postDate, $accountBio);

        // 1. Extraer username de Instagram si está mencionado (@tienda)
        $instagramHandle = null;
        if (preg_match('/@([a-zA-Z0-9_\.]{3,30})/i', $cleanText, $igMatch)) {
            $instagramHandle = strtolower($igMatch[1]);
        }

        // 2. Extraer teléfono o WhatsApp de contacto (+58 o formatos venezolanos)
        $whatsappNumber = null;
        if (preg_match('/(?:\+?58\s?)?(?:0?412|0?414|0?424|0?416|0?426)[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}/i', $cleanText, $phoneMatch)) {
            $cleanedPhone = preg_replace('/[^0-9]/', '', $phoneMatch[0]);
            if (!str_starts_with($cleanedPhone, '58')) {
                $cleanedPhone = '58' . ltrim($cleanedPhone, '0');
            }
            $whatsappNumber = '+' . $cleanedPhone;
        }

        // 3. Extraer precio en USD / Ref y precio en VES
        $prices = $this->extractPrices($cleanText);

        // 4. Identificar la marca cosmética
        $brand = $this->detectBrand($cleanText);

        // 5. Detectar la categoría cosmética
        $category = $this->determineCategory($cleanText);

        // 6. Detectar ciudad / zona de despacho
        $city = $this->detectCity($cleanText);

        // 7. Detectar métodos de pago admitidos
        $paymentMethods = $this->detectPaymentMethods($cleanText);

        // 8. Determinar disponibilidad / stock
        $inStock = $this->detectStockStatus($cleanText);

        // 9. Extraer título legible del producto limpio de muletillas de marketing
        $productName = $this->extractCleanProductName($cleanText, $brand);

        // 10. Construir el storeSlug final
        $storeSlug = $defaultStoreSlug 
            ?? ($instagramHandle ? 'ig-' . Str::slug($instagramHandle) : 'tienda-social-vzla');

        $dto = new ScrapedProductOfferDTO(
            storeSlug: $storeSlug,
            productName: $productName,
            brandName: $brand,
            barcodeEan: null,
            category: $category,
            price: $prices['price_usd'] ?? 0.0,
            priceVes: $prices['price_ves'] ?? null,
            currency: 'USD',
            inStock: $inStock,
            productUrl: $instagramHandle ? "https://instagram.com/{$instagramHandle}" : null,
            imageUrl: null,
            branchSlug: $city ? Str::slug("{$storeSlug}-{$city}") : null,
            rawMetadata: [
                'whatsapp' => $whatsappNumber,
                'city' => $city,
                'payment_methods' => $paymentMethods,
                'instagram_handle' => $instagramHandle,
                'authenticity' => $authenticity,
                'original_caption' => $rawText,
            ]
        );

        return [
            'dto' => $dto,
            'is_valid' => $authenticity['is_valid'],
            'authenticity' => $authenticity,
            'metadata' => [
                'store_slug' => $storeSlug,
                'product_name' => $productName,
                'brand' => $brand,
                'category' => $category,
                'price_usd' => $prices['price_usd'] ?? 0.0,
                'price_ves' => $prices['price_ves'] ?? null,
                'city' => $city,
                'whatsapp' => $whatsappNumber,
                'instagram_handle' => $instagramHandle,
                'payment_methods' => $paymentMethods,
                'in_stock' => $inStock,
                'trust_score' => $authenticity['trust_score'],
                'verification_status' => $authenticity['status'],
                'reasons' => $authenticity['reasons'],
                'signals' => $authenticity['signals'],
            ]
        ];
    }

    /**
     * Evalúa la autenticidad, vigencia y legitimidad de un post o cuenta en Venezuela.
     * Filtra cuentas bots, extranjeras o desactualizadas (ej: @beauty_shop_ve con ruso y posts del 2021).
     */
    public function evaluateAuthenticity(string $text, ?string $postDate = null, ?string $bio = null): array
    {
        $score = 0;
        $reasons = [];
        $signals = [];
        $lower = mb_strtolower($text . ' ' . ($bio ?? ''));

        // 1. FILTRO DE EXCLUSIÓN INMEDIATA: Idiomas/alfabetos extranjeros (Ruso, Árabe, Chino/Japonés)
        if (preg_match('/\p{Cyrillic}/u', $text) || ($bio && preg_match('/\p{Cyrillic}/u', $bio))) {
            return [
                'is_valid' => false,
                'status' => 'REJECTED',
                'trust_score' => 0,
                'reasons' => ['Rechazado: Detectado alfabeto cirílico / idioma ruso. Cuenta foránea o bot sin actividad comercial en Venezuela.'],
                'signals' => [],
            ];
        }

        if (preg_match('/\p{Arabic}|\p{Thai}|\p{Han}/u', $text) || ($bio && preg_match('/\p{Arabic}|\p{Thai}|\p{Han}/u', $bio))) {
            return [
                'is_valid' => false,
                'status' => 'REJECTED',
                'trust_score' => 0,
                'reasons' => ['Rechazado: Detectado alfabeto asiático/árabe sin relación comercial en Venezuela.'],
                'signals' => [],
            ];
        }

        // 2. FILTRO DE VIGENCIA TEMPORAL (Fecha del post)
        if (!empty($postDate)) {
            try {
                $date = \Carbon\Carbon::parse($postDate);
                $daysOld = $date->diffInDays(now());
                if ($daysOld > 60) {
                    return [
                        'is_valid' => false,
                        'status' => 'REJECTED',
                        'trust_score' => 5,
                        'reasons' => ["Rechazado: Publicación desactualizada de hace {$daysOld} días ({$date->format('Y-m-d')}). Precios e inventario obsoletos."],
                        'signals' => [],
                    ];
                } elseif ($daysOld <= 15) {
                    $score += 25;
                    $signals[] = "Publicación muy reciente ({$daysOld} días)";
                } else {
                    $score += 15;
                    $signals[] = "Publicación vigente ({$daysOld} días)";
                }
            } catch (\Throwable $e) {
                // Fecha ilegible
            }
        }

        // 3. SEÑALES DE COMERCIO VENEZOLANO
        // Moneda local y referencias de precio
        if (preg_match('/(?:ref\.?|referencia|bcv|tasa bcv|tasa oficial|bs\.?|bolivares)/i', $lower)) {
            $score += 25;
            $signals[] = 'Referencia cambiaria / moneda venezolana (Ref/Bs/BCV)';
        }

        // Métodos de pago venezolanos
        $payments = $this->detectPaymentMethods($lower);
        if (!empty($payments)) {
            $score += 20;
            $signals[] = 'Métodos de pago locales (' . implode(', ', $payments) . ')';
        }

        // Envíos y logística venezolana (MRW, Tealca, Zoom, Delivery en ciudad)
        if (preg_match('/(?:mrw|tealca|zoom|domesa|delivery|pick\s*up|entregas? personales?)/i', $lower)) {
            $score += 15;
            $signals[] = 'Logística de despacho venezolana (MRW/Tealca/Zoom/Delivery)';
        }

        // Ciudad / Geografía venezolana
        $city = $this->detectCity($lower);
        if ($city) {
            $score += 20;
            $signals[] = "Ubicación en Venezuela ({$city})";
        }

        // Contacto telefónico venezolano (+58 / 0412 / 0414 / 0424...)
        if (preg_match('/(?:\+?58\s?)?(?:0?412|0?414|0?424|0?416|0?426)/i', $lower)) {
            $score += 20;
            $signals[] = 'Teléfono móvil venezolano (+58 / 041X / 042X)';
        }

        // 4. VEREDICTO FINAL
        if ($score >= 45) {
            $status = 'VERIFIED';
            $isValid = true;
        } elseif ($score >= 20) {
            $status = 'PENDING_REVIEW';
            $isValid = true;
            $reasons[] = 'Cuenta con señales parciales de Venezuela; requiere revisión moderada.';
        } else {
            $status = 'REJECTED';
            $isValid = false;
            $reasons[] = 'Pocas o nulas señales de actividad comercial venezolana (Score insuficiente).';
        }

        return [
            'is_valid' => $isValid,
            'status' => $status,
            'trust_score' => min(100, $score),
            'signals' => $signals,
            'reasons' => $reasons,
        ];
    }

    /**
     * Extrae precios en USD (Ref) y VES manejando todas las jergas y abreviaturas venezolanas.
     */
    protected function extractPrices(string $text): array
    {
        $priceUsd = null;
        $priceVes = null;

        // Patrón 1: Notación "Ref", "Ref:", "Ref." (la más usada en Venezuela)
        // Ejemplos: "Ref: 12", "Ref 15$", "Ref. 8", "12 ref"
        if (preg_match('/(?:ref\.?|referencia)\s*[:=\-]?\s*\$?\s*([0-9]+(?:[\.,][0-9]{1,2})?)/i', $text, $m)) {
            $priceUsd = (float) str_replace(',', '.', $m[1]);
        } elseif (preg_match('/([0-9]+(?:[\.,][0-9]{1,2})?)\s*\$?\s*(?:ref\.?|referencia)/i', $text, $m)) {
            $priceUsd = (float) str_replace(',', '.', $m[1]);
        }

        // Patrón 2: Símbolo de dólar antes o después ("$15", "15$", "15 USD", "15 verdes", "15 dol")
        if ($priceUsd === null) {
            if (preg_match('/(?:\$|usd|verdes|lechugas)\s*([0-9]+(?:[\.,][0-9]{1,2})?)/i', $text, $m)) {
                $priceUsd = (float) str_replace(',', '.', $m[1]);
            } elseif (preg_match('/([0-9]+(?:[\.,][0-9]{1,2})?)\s*(?:\$|usd|verdes|lechugas|dls|dol)/i', $text, $m)) {
                $priceUsd = (float) str_replace(',', '.', $m[1]);
            }
        }

        // Patrón 3: Precio en Bolívares ("Bs. 1200", "1200 Bs", "BsS 950")
        if (preg_match('/(?:bs\.?|bss|bolivares)\s*[:=\-]?\s*([0-9]+(?:[\.,][0-9]{1,2})?)/i', $text, $m)) {
            $cleanVes = str_replace('.', '', $m[1]);
            $cleanVes = str_replace(',', '.', $cleanVes);
            $priceVes = (float) $cleanVes;
        }

        // Conversión cambiaria cruzada usando la tasa BCV oficial
        if ($priceUsd !== null && $priceVes === null && $priceUsd > 0) {
            $priceVes = $this->exchangeRateService->usdToVes($priceUsd);
        } elseif ($priceVes !== null && $priceUsd === null && $priceVes > 0) {
            $priceUsd = $this->exchangeRateService->vesToUsd($priceVes);
        }

        return [
            'price_usd' => $priceUsd,
            'price_ves' => $priceVes,
        ];
    }

    /**
     * Detección léxica de marcas reconocidas.
     */
    protected function detectBrand(string $text): string
    {
        $lower = mb_strtolower($text);

        foreach ($this->knownBrands as $canonicalBrand => $variations) {
            foreach ($variations as $var) {
                if (preg_match('/\b' . preg_quote($var, '/') . '\b/i', $lower)) {
                    return $canonicalBrand;
                }
            }
        }

        return 'Genérica / Sin Marca';
    }

    /**
     * Infiere la categoría cosmética según palabras clave dermatológicas.
     */
    protected function determineCategory(string $text): string
    {
        $lower = mb_strtolower($text);

        if (str_contains($lower, 'limpiador') || str_contains($lower, 'cleanser') || str_contains($lower, 'gel limpiador') || str_contains($lower, 'espuma') || str_contains($lower, 'bar cleanser')) {
            return 'CLEANSER';
        }
        if (str_contains($lower, 'protector solar') || str_contains($lower, 'pantalla solar') || str_contains($lower, 'bloqueador') || str_contains($lower, 'fps') || str_contains($lower, 'spf') || str_contains($lower, 'sunscreen') || str_contains($lower, 'sun stick') || str_contains($lower, 'sun relief')) {
            return 'SUNSCREEN';
        }
        if (str_contains($lower, 'serum') || str_contains($lower, 'suero') || str_contains($lower, 'ampoule') || str_contains($lower, 'ampolla') || str_contains($lower, 'gotero') || str_contains($lower, 'concentrado')) {
            return 'SERUM';
        }
        if (str_contains($lower, 'contorno') || str_contains($lower, 'ojos') || str_contains($lower, 'eye cream') || str_contains($lower, 'ojeras')) {
            return 'EYE_CARE';
        }
        if (str_contains($lower, 'exfoliante') || str_contains($lower, 'peeling') || str_contains($lower, 'aha') || str_contains($lower, 'bha') || str_contains($lower, 'pha') || str_contains($lower, 'glycolic') || str_contains($lower, 'salicylic')) {
            return 'EXFOLIANT';
        }
        if (str_contains($lower, 'tonico') || str_contains($lower, 'tónico') || str_contains($lower, 'toner') || str_contains($lower, 'mist') || str_contains($lower, 'agua micelar')) {
            return 'TONER';
        }
        if (str_contains($lower, 'crema') || str_contains($lower, 'hidratante') || str_contains($lower, 'moisturizer') || str_contains($lower, 'lotion') || str_contains($lower, 'gel')) {
            return 'MOISTURIZER';
        }
        if (str_contains($lower, 'mascarilla') || str_contains($lower, 'sheet mask') || str_contains($lower, 'sleeping mask')) {
            return 'MASK';
        }
        if (str_contains($lower, 'labial') || str_contains($lower, 'lip balm') || str_contains($lower, 'balsamo labial')) {
            return 'LIP_CARE';
        }

        return 'SKINCARE';
    }

    /**
     * Detecta la ciudad o zona venezolana en el texto.
     */
    protected function detectCity(string $text): ?string
    {
        $lower = mb_strtolower($text);

        foreach ($this->knownCities as $city => $keywords) {
            foreach ($keywords as $kw) {
                if (preg_match('/\b' . preg_quote($kw, '/') . '\b/i', $lower)) {
                    return $city;
                }
            }
        }

        return null;
    }

    /**
     * Detecta métodos de pago típicos del ecosistema venezolano.
     */
    protected function detectPaymentMethods(string $text): array
    {
        $lower = mb_strtolower($text);
        $methods = [];

        if (str_contains($lower, 'pago movil') || str_contains($lower, 'pagomovil') || str_contains($lower, 'pago móvil')) {
            $methods[] = 'Pago Móvil';
        }
        if (str_contains($lower, 'zelle')) {
            $methods[] = 'Zelle';
        }
        if (str_contains($lower, 'binance') || str_contains($lower, 'usdt')) {
            $methods[] = 'Binance USDT';
        }
        if (str_contains($lower, 'zinli')) {
            $methods[] = 'Zinli';
        }
        if (str_contains($lower, 'cashea')) {
            $methods[] = 'Cashea';
        }
        if (str_contains($lower, 'efectivo') || str_contains($lower, 'cash')) {
            $methods[] = 'Efectivo USD/VES';
        }
        if (str_contains($lower, 'bcv') || str_contains($lower, 'tasa bcv') || str_contains($lower, 'tasa oficial')) {
            $methods[] = 'Acepta tasa BCV';
        }

        return $methods;
    }

    /**
     * Detección de disponibilidad.
     */
    protected function detectStockStatus(string $text): bool
    {
        $lower = mb_strtolower($text);

        if (str_contains($lower, 'agotado') || str_contains($lower, 'sold out') || str_contains($lower, 'sin stock') || str_contains($lower, 'no disponible')) {
            return false;
        }

        return true;
    }

    /**
     * Limpia el texto del post para extraer un nombre de producto limpio y legible.
     */
    protected function extractCleanProductName(string $text, string $brand): string
    {
        // Tomar la primera o segunda línea que usualmente contiene el nombre del producto
        $lines = array_filter(array_map('trim', explode("\n", $text)));
        $firstLine = reset($lines) ?: $text;

        // Limpiar emojis
        $clean = preg_replace('/[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{FE0F}]/u', '', $firstLine);

        // Limpiar frases de venta típicas de Instagram y delimitadores de corte
        $cutPatterns = [
            '/(?:ref\.?|referencia|precio|\$|bs\.?|bss|disponible|stock|entrega|envios|delivery|pago|whatsapp|ws|dm|escribenos|original|tasa).*$/iu',
        ];

        foreach ($cutPatterns as $p) {
            $candidate = preg_replace($p, '', $clean);
            if (strlen(trim($candidate)) >= 6) {
                $clean = $candidate;
                break;
            }
        }

        $clean = trim(preg_replace('/[–—\-\|\:\.]+$/u', '', trim($clean)));
        $clean = trim(preg_replace('/\s+/', ' ', $clean));

        // Si quedó muy corto o vacío, estructurar con la marca
        if (strlen($clean) < 4) {
            return $brand !== 'Genérica / Sin Marca' ? "{$brand} Tratamiento Facial" : "Producto Cosmético";
        }

        return Str::limit($clean, 80, '');
    }

    /**
     * Opcional: Si el usuario configura GEMINI_API_KEY en .env, permite
     * usar Gemini 2.5 Flash para extracción zero-shot estructurada.
     */
    public function parseWithGemini(string $text, ?string $apiKey = null): ?array
    {
        $key = $apiKey ?? env('GEMINI_API_KEY');
        if (empty($key)) {
            // Fallback directo al analizador léxico/heurístico local
            return $this->parsePostText($text);
        }

        try {
            $prompt = <<<PROMPT
Eres un extractor de datos de comercio electrónico en redes sociales para Venezuela (Instagram, WhatsApp).
Analiza el siguiente texto de un post o mensaje y extrae un JSON estricto con los siguientes campos:
- product_name: Nombre exacto del producto cosmético/skincare.
- brand: Marca cosmética (ej: The Ordinary, CeraVe, etc.).
- category: Una de CLEANSER, SUNSCREEN, SERUM, MOISTURIZER, TONER, EXFOLIANT, EYE_CARE, MASK, SKINCARE.
- price_usd: Precio numérico en dólares o Ref (float, ej 12.5). Si no hay, null.
- price_ves: Precio numérico en Bolívares (float). Si no hay, null.
- city: Ciudad venezolana mencionada (ej: Caracas, Valencia, etc.) o null.
- whatsapp: Número telefónico de contacto en formato internacional (+58...) o null.
- in_stock: true o false.
- instagram_handle: Usuario de Instagram sin el @ o null.

Texto a analizar:
"""
{$text}
"""

Responde ÚNICAMENTE con el objeto JSON válido.
PROMPT;

            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->timeout(10)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$key}", [
                    'contents' => [
                        ['parts' => [['text' => $prompt]]]
                    ],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                $jsonText = $response->json('candidates.0.content.parts.0.text');
                $parsed = json_decode($jsonText, true);
                if (is_array($parsed) && !empty($parsed['product_name'])) {
                    return $parsed;
                }
            }
        } catch (\Throwable $e) {
            Log::channel('single')->warning("[SocialCommerceParser] Error llamando a Gemini API: " . $e->getMessage());
        }

        // Si falló Gemini o la API key es inválida, fallback al analizador determinista local
        return $this->parsePostText($text);
    }
}
