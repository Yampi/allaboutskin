<?php

namespace App\Services\Scraper\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StoreCountryDetectorService
{
    /**
     * Catálogo de países con metadatos y emojis de banderas.
     */
    public const COUNTRIES = [
        'VE' => ['name' => 'Venezuela', 'flag' => '🇻🇪', 'currency' => 'VES'],
        'CO' => ['name' => 'Colombia', 'flag' => '🇨🇴', 'currency' => 'COP'],
        'MX' => ['name' => 'México', 'flag' => '🇲🇽', 'currency' => 'MXN'],
        'ES' => ['name' => 'España', 'flag' => '🇪🇸', 'currency' => 'EUR'],
        'CL' => ['name' => 'Chile', 'flag' => '🇨🇱', 'currency' => 'CLP'],
        'PA' => ['name' => 'Panamá', 'flag' => '🇵🇦', 'currency' => 'USD'],
        'US' => ['name' => 'Estados Unidos', 'flag' => '🇺🇸', 'currency' => 'USD'],
        'AR' => ['name' => 'Argentina', 'flag' => '🇦🇷', 'currency' => 'ARS'],
        'PE' => ['name' => 'Perú', 'flag' => '🇵🇪', 'currency' => 'PEN'],
        'EC' => ['name' => 'Ecuador', 'flag' => '🇪🇨', 'currency' => 'USD'],
        'HN' => ['name' => 'Honduras', 'flag' => '🇭🇳', 'currency' => 'HNL'],
        'DO' => ['name' => 'República Dominicana', 'flag' => '🇩🇴', 'currency' => 'DOP'],
        'SV' => ['name' => 'El Salvador', 'flag' => '🇸🇻', 'currency' => 'USD'],
        'IN' => ['name' => 'India', 'flag' => '🇮🇳', 'currency' => 'INR'],
        'CH' => ['name' => 'Suiza', 'flag' => '🇨🇭', 'currency' => 'CHF'],
        'GL' => ['name' => 'Internacional', 'flag' => '🌐', 'currency' => 'USD'],
        'GLOBAL' => ['name' => 'Internacional', 'flag' => '🌐', 'currency' => 'USD'],
    ];

    /**
     * Prefijos telefónicos internacionales y sus países asociados.
     */
    protected array $phonePrefixes = [
        '58'  => 'VE',
        '57'  => 'CO',
        '52'  => 'MX',
        '34'  => 'ES',
        '56'  => 'CL',
        '507' => 'PA',
        '54'  => 'AR',
        '51'  => 'PE',
        '593' => 'EC',
        '504' => 'HN',
        '503' => 'SV',
        '91'  => 'IN',
        '41'  => 'CH',
    ];

    /**
     * Métodos de pago y logística locales característicos de cada país.
     */
    protected array $localPaymentAndLogistics = [
        'VE' => [
            'pago movil', 'pagomovil', 'pago móvil', 'banesco', 'banco de venezuela', 'mercantil',
            'provincial', 'bdv', 'bancaribe', 'bnc', 'bancamiga', 'mrw', 'tealca', 'zoom envios',
            'zoom envíos', 'domesa', 'liberty express', 'dingo', 'yummy', 'pedidosya venezuela',
            'c.a.', 'rif j-', 'rif: j-', 'rif v-', 'valle de la pascua'
        ],
        'CO' => [
            'nequi', 'daviplata', 'bancolombia', 'pse', 'efecty', 'baloto', 'servientrega',
            'interrapidisimo', 'interrapidísimo', 'envia', 'coordinadora', 'tcc', 'contraentrega colombia', 's.a.s'
        ],
        'MX' => [
            'oxxo', 'spei', 'mercado pago mexico', 'mercado pago méxico', 'estafeta', 'redpack',
            'fedex mexico', 'coppel', 'bbva mexico'
        ],
        'ES' => [
            'bizum', 'correos españa', 'seur', 'nacex', 'mrw españa', 'cif:', 'nif:', 'península y baleares'
        ],
        'CL' => [
            'webpay', 'transbank', 'chilexpress', 'starken', 'cuenta rut', 'redcompra'
        ],
        'PA' => [
            'yappy', 'banco general panama', 'uno express', 'arrocha', 'panama'
        ],
        'AR' => [
            'mercado pago argentina', 'rapipago', 'pago facil', 'pago fácil', 'correo argentino', 'andreani'
        ],
    ];

    /**
     * Principales ciudades y estados / departamentos por país.
     */
    protected array $locations = [
        'VE' => [
            'caracas', 'maracaibo', 'valencia', 'barquisimeto', 'maracay', 'ciudad guayana',
            'san cristobal', 'san cristóbal', 'maturin', 'maturín', 'barcelona', 'puerto la cruz',
            'lecheria', 'lechería', 'merida', 'márida', 'porlamar', 'margarita', 'valle de la pascua',
            'guarico', 'guárico', 'zulia', 'miranda', 'carabobo', 'aragua', 'lara', 'tachira',
            'táchira', 'anzoategui', 'anzoátegui', 'nueva esparta', 'chacao', 'baruta', 'el hatillo',
            'sucre', 'altamira', 'las mercedes', 'los palos grandes', 'naguanagua', 'san diego'
        ],
        'CO' => [
            'bogota', 'bogotá', 'medellin', 'medellín', 'cali', 'barranquilla', 'cartagena',
            'bucaramanga', 'pereira', 'manizales', 'cucuta', 'cúcuta', 'santa marta', 'antioquia',
            'cundinamarca', 'valle del cauca', 'atlantico', 'atlántico', 'santander'
        ],
        'MX' => [
            'ciudad de mexico', 'ciudad de méxico', 'cdmx', 'guadalajara', 'monterrey', 'puebla',
            'cancun', 'cancún', 'zapopan', 'jalisco', 'nuevo leon', 'nuevo león', 'tijuana', 'merida yucatan'
        ],
        'ES' => [
            'madrid', 'barcelona', 'sevilla', 'zaragoza', 'malaga', 'málaga', 'murcia',
            'palma de mallorca', 'bilbao', 'alicante', 'cordoba españa', 'valladolid'
        ],
        'CL' => [
            'santiago de chile', 'valparaiso', 'valparaíso', 'concepcion', 'concepción',
            'viña del mar', 'antofagasta', 'la serena', 'temuco'
        ],
        'PA' => [
            'ciudad de panama', 'ciudad de panamá', 'panama city', 'colon panama', 'david chiriqui'
        ],
        'AR' => [
            'buenos aires', 'cordoba argentina', 'rosario', 'mendoza', 'la plata', 'mar del plata'
        ],
        'HN' => [
            'tegucigalpa', 'san pedro sula', 'honduras'
        ],
        'SV' => [
            'san salvador', 'santa ana el salvador', 'el salvador'
        ],
        'IN' => [
            'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'india'
        ],
    ];

    /**
     * Detecta el país más probable analizando la URL y el contenido del sitio web.
     *
     * @param string $url URL base de la tienda
     * @param string|null $html Contenido HTML previo (si ya se descargó)
     * @return array{country_code: string, country_name: string, flag: string, confidence: int, signals: array}
     */
    public function detectCountry(string $url, ?string $html = null): array
    {
        $scores = [
            'VE' => 0,
            'CO' => 0,
            'MX' => 0,
            'ES' => 0,
            'CL' => 0,
            'PA' => 0,
            'US' => 0,
            'AR' => 0,
            'PE' => 0,
            'EC' => 0,
            'HN' => 0,
            'SV' => 0,
            'IN' => 0,
            'CH' => 0,
        ];
        $signals = [];

        $host = strtolower(parse_url($url, PHP_URL_HOST) ?? '');

        // 1. Evaluación directa por TLD de dominio de nivel superior
        if (str_ends_with($host, '.com.ve') || str_ends_with($host, '.ve') || str_ends_with($host, '.net.ve') || str_ends_with($host, '.org.ve')) {
            $scores['VE'] += 60;
            $signals[] = "Dominio con ccTLD oficial de Venezuela ({$host})";
        } elseif (str_ends_with($host, '.com.co') || str_ends_with($host, '.co')) {
            $scores['CO'] += 45;
            $signals[] = "Dominio con ccTLD de Colombia ({$host})";
        } elseif (str_ends_with($host, '.com.mx') || str_ends_with($host, '.mx')) {
            $scores['MX'] += 55;
            $signals[] = "Dominio con ccTLD de México ({$host})";
        } elseif (str_ends_with($host, '.es') || str_ends_with($host, '.com.es')) {
            $scores['ES'] += 55;
            $signals[] = "Dominio con ccTLD de España ({$host})";
        } elseif (str_ends_with($host, '.cl') || str_ends_with($host, '.com.cl')) {
            $scores['CL'] += 55;
            $signals[] = "Dominio con ccTLD de Chile ({$host})";
        } elseif (str_ends_with($host, '.pa') || str_ends_with($host, '.com.pa')) {
            $scores['PA'] += 55;
            $signals[] = "Dominio con ccTLD de Panamá ({$host})";
        } elseif (str_ends_with($host, '.ar') || str_ends_with($host, '.com.ar')) {
            $scores['AR'] += 55;
            $signals[] = "Dominio con ccTLD de Argentina ({$host})";
        } elseif (str_ends_with($host, '.hn') || str_ends_with($host, '.com.hn')) {
            $scores['HN'] += 55;
            $signals[] = "Dominio con ccTLD de Honduras ({$host})";
        } elseif (str_ends_with($host, '.sv') || str_ends_with($host, '.com.sv')) {
            $scores['SV'] += 55;
            $signals[] = "Dominio con ccTLD de El Salvador ({$host})";
        }

        // 2. Palabras clave en el nombre del dominio o subdominio
        if (preg_match('/(vzla|venezuela|ve\b|ve[\-_])/i', $host)) {
            $scores['VE'] += 30;
            $signals[] = "Nombre de host contiene indicador 'vzla'/'ve' ({$host})";
        } elseif (preg_match('/(colombia|bogota|medellin)/i', $host)) {
            $scores['CO'] += 30;
            $signals[] = "Nombre de host contiene indicador colombiano";
        } elseif (preg_match('/(chile)/i', $host)) {
            $scores['CL'] += 30;
            $signals[] = "Nombre de host contiene indicador chileno";
        } elseif (preg_match('/(mexico|mx)/i', $host)) {
            $scores['MX'] += 30;
            $signals[] = "Nombre de host contiene indicador mexicano";
        } elseif (preg_match('/(panama)/i', $host)) {
            $scores['PA'] += 30;
            $signals[] = "Nombre de host contiene indicador panameño";
        } elseif (preg_match('/(hn\b|honduras)/i', $host)) {
            $scores['HN'] += 30;
            $signals[] = "Nombre de host contiene indicador hondureño";
        } elseif (preg_match('/(sv\b|salvador)/i', $host)) {
            $scores['SV'] += 30;
            $signals[] = "Nombre de host contiene indicador salvadoreño";
        }

        // Descargar HTML si no fue provisto
        if ($html === null) {
            $html = $this->fetchHtml($url);
        }

        if (!empty($html)) {
            $this->evaluateHtmlSignals($html, $scores, $signals);

            // Si el puntaje es bajo (< 25) o empate, intentar consultar la página de contacto o envíos
            $maxScore = max($scores);
            if ($maxScore < 30) {
                $contactHtml = $this->fetchContactPage($url, $html);
                if (!empty($contactHtml)) {
                    $this->evaluateHtmlSignals($contactHtml, $scores, $signals, isContactPage: true);
                }
            }
        }

        // Determinar el país ganador
        arsort($scores);
        $topCountry = array_key_first($scores);
        $topScore = $scores[$topCountry];

        // Umbral mínimo de confianza
        if ($topScore < 15) {
            // Si no hay señales claras pero el dominio es .com o genérico
            $topCountry = 'GLOBAL';
            $confidence = 20;
        } else {
            $confidence = min(99, $topScore);
        }

        $countryMeta = self::COUNTRIES[$topCountry] ?? self::COUNTRIES['GLOBAL'];

        return [
            'country_code' => $topCountry,
            'country_name' => $countryMeta['name'],
            'flag' => $countryMeta['flag'],
            'confidence' => $confidence,
            'signals' => array_unique($signals),
            'scores' => $scores,
        ];
    }

    /**
     * Evalúa las señales textuales, semánticas y de metadatos dentro del HTML.
     */
    protected function evaluateHtmlSignals(string $html, array &$scores, array &$signals, bool $isContactPage = false): void
    {
        $weightMultiplier = $isContactPage ? 1.5 : 1.0;
        $htmlLower = strtolower($html);

        // A. Marcado semántico Schema.org addressCountry y país explícito
        if (preg_match('/["\']addressCountry["\']\s*:\s*["\']([a-zA-Z]{2})["\']/i', $html, $m)) {
            $cc = strtoupper($m[1]);
            if (isset($scores[$cc])) {
                $scores[$cc] += round(60 * $weightMultiplier);
                $signals[] = "Schema.org addressCountry explícito: {$cc}";
            }
        } elseif (preg_match('/["\']addressCountry["\']\s*:\s*["\'](Venezuela|Colombia|Mexico|México|España|Chile|Panama|Panamá|Argentina)["\']/i', $html, $m)) {
            $countryName = strtolower($m[1]);
            foreach (self::COUNTRIES as $code => $meta) {
                if (strtolower($meta['name']) === $countryName || str_starts_with($countryName, strtolower($code))) {
                    $scores[$code] += round(60 * $weightMultiplier);
                    $signals[] = "Schema.org país explícito: {$m[1]} ({$code})";
                    break;
                }
            }
        }

        // B. Teléfonos y enlaces de WhatsApp (wa.me, api.whatsapp.com, tel:)
        if (preg_match_all('/(?:wa\.me\/|whatsapp\.com\/send\?phone=|tel:\+?|callto:\+?)([0-9]{8,15})/i', $html, $m)) {
            foreach ($m[1] as $num) {
                foreach ($this->phonePrefixes as $prefix => $country) {
                    if (str_starts_with($num, $prefix)) {
                        $scores[$country] += round(40 * $weightMultiplier);
                        $signals[] = "Teléfono/WhatsApp con código internacional +{$prefix} ({$country}): {$num}";
                        break;
                    }
                }
            }
        }

        // Códigos venezolanos móviles locales (0412, 0414, 0424, 0416, 0426, 0212)
        if (preg_match('/\b(0412|0414|0424|0416|0426|0212)[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{4}\b/', $html)) {
            $scores['VE'] += round(35 * $weightMultiplier);
            $signals[] = "Número móvil/fijo con formato nacional venezolano detectado en el contenido";
        }

        // C. Divisas de precios
        if (preg_match('/\b(VES|Bs\.|Bs\.S|Bs\.D|Bolívares|Bolivares)\b/i', $html)) {
            $scores['VE'] += round(50 * $weightMultiplier);
            $signals[] = "Moneda nacional de Venezuela (Bolívares / VES) detectada en catálogo";
        }
        if (preg_match('/\b(COP|\$\s*COP|pesos colombianos)\b/i', $html) || preg_match('/\$\s*[0-9]{2,3}\.[0-9]{3}\b/', $html)) {
            $scores['CO'] += round(35 * $weightMultiplier);
            $signals[] = "Moneda o denominación de Pesos Colombianos (COP) detectada";
        }
        if (preg_match('/\b(MXN|\$\s*MXN|pesos mexicanos)\b/i', $html)) {
            $scores['MX'] += round(40 * $weightMultiplier);
            $signals[] = "Moneda Pesos Mexicanos (MXN) detectada";
        }
        if (preg_match('/\b(CLP|\$\s*CLP|pesos chilenos)\b/i', $html)) {
            $scores['CL'] += round(40 * $weightMultiplier);
            $signals[] = "Moneda Pesos Chilenos (CLP) detectada";
        }
        if (preg_match('/\b(€|EUR|euros)\b/i', $html)) {
            $scores['ES'] += round(35 * $weightMultiplier);
            $signals[] = "Moneda Euro (€) detectada";
        }

        // D. Métodos de pago y logística locales con límite de palabras estrictas
        foreach ($this->localPaymentAndLogistics as $country => $methods) {
            foreach ($methods as $method) {
                // Requiere límite de palabra estricto para evitar falsos positivos
                if (preg_match('/\b' . preg_quote($method, '/') . '\b/iu', $htmlLower)) {
                    $scores[$country] += round(25 * $weightMultiplier);
                    $signals[] = "Método de pago o despacho típico de {$country} detectado: '{$method}'";
                    break;
                }
            }
        }

        // E. Ciudades y regiones con límite de palabras estrictas
        foreach ($this->locations as $country => $cities) {
            $matchCount = 0;
            foreach ($cities as $city) {
                if (preg_match('/\b' . preg_quote($city, '/') . '\b/iu', $htmlLower)) {
                    $matchCount++;
                    if ($matchCount <= 2) {
                        $scores[$country] += round(20 * $weightMultiplier);
                        $signals[] = "Ubicación geográfica detectada para {$country}: '{$city}'";
                    }
                }
            }
        }

        // F. Enlaces a redes sociales con sufijos de país
        if (preg_match_all('/instagram\.com\/([a-zA-Z0-9_\.\-]+)/i', $html, $m)) {
            foreach ($m[1] as $handle) {
                $handleLower = strtolower($handle);
                if (preg_match('/(_ve|vzla|\.ve|ve$)/', $handleLower)) {
                    $scores['VE'] += 30;
                    $signals[] = "Cuenta de Instagram sugiere Venezuela: @{$handle}";
                } elseif (preg_match('/(_co|colombia|\.co)$/', $handleLower)) {
                    $scores['CO'] += 30;
                    $signals[] = "Cuenta de Instagram sugiere Colombia: @{$handle}";
                } elseif (preg_match('/(_mx|mexico|\.mx)$/', $handleLower)) {
                    $scores['MX'] += 30;
                    $signals[] = "Cuenta de Instagram sugiere México: @{$handle}";
                } elseif (preg_match('/(_es|spain|\.es)$/', $handleLower)) {
                    $scores['ES'] += 30;
                    $signals[] = "Cuenta de Instagram sugiere España: @{$handle}";
                }
            }
        }

        // G. Shopify shop country variable y WooCommerce store info
        if (preg_match('/Shopify\.country\s*=\s*["\']([a-zA-Z]{2})["\']/i', $html, $m)) {
            $cc = strtoupper($m[1]);
            if (isset($scores[$cc])) {
                $scores[$cc] += 50;
                $signals[] = "Configuración nativa Shopify.country: {$cc}";
            }
        }
    }

    /**
     * Intenta descargar una subpágina de contacto o políticas si el sitio no dio suficiente certeza.
     */
    protected function fetchContactPage(string $baseUrl, string $homeHtml): ?string
    {
        $normalizedBase = rtrim($baseUrl, '/');

        // Buscar enlaces a contacto en el HTML principal
        $contactPaths = ['/contacto', '/contact', '/pages/contact', '/contactanos', '/pages/politica-de-envio', '/nosotros'];

        if (preg_match_all('/href=["\']([^"\']*(?:contact|contacto|envio|ubicacion)[^"\']*)["\']/i', $homeHtml, $m)) {
            foreach ($m[1] as $href) {
                if (str_starts_with($href, 'http')) {
                    $candidate = $href;
                } else {
                    $candidate = $normalizedBase . '/' . ltrim($href, '/');
                }
                $contactPaths = array_merge([$candidate], $contactPaths);
            }
        }

        foreach (array_unique($contactPaths) as $path) {
            $url = str_starts_with($path, 'http') ? $path : $normalizedBase . $path;
            try {
                $response = Http::timeout(4)
                    ->withHeaders(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'])
                    ->get($url);

                if ($response->successful() && strlen($response->body()) > 200) {
                    return $response->body();
                }
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }

    /**
     * Descarga el HTML de la página web con timeout prudente.
     */
    protected function fetchHtml(string $url): ?string
    {
        try {
            $resp = Http::timeout(6)
                ->withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                ])
                ->get($url);

            return $resp->successful() ? $resp->body() : null;
        } catch (\Throwable $e) {
            Log::channel('scraper')->warning("[CountryDetector] Error descargando {$url}: " . $e->getMessage());
            return null;
        }
    }
}
