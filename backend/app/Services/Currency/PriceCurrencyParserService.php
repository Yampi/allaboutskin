<?php

namespace App\Services\Currency;

class PriceCurrencyParserService
{
    /**
     * Parsea de forma robusta cualquier representación numérica en formato venezolano o internacional.
     * En Venezuela:
     *   - El punto (.) se usa para separar millares: 22.532,28
     *   - La coma (,) se usa para separar decimales: 22.532,28 -> 22532.28
     * En formato estándar/API:
     *   - El punto (.) es decimal: 19424.38 o 7.82
     */
    public static function parseAmount(?string $str): ?float
    {
        if ($str === null) {
            return null;
        }

        $clean = trim($str);
        // Quitar etiquetas de moneda y palabras comunes
        $clean = preg_replace('/^(?:Bs\.?|VES|ref\.?|USD|\$|d[oó]lares?)\s*/iu', '', $clean);
        $clean = preg_replace('/\s*(?:Bs\.?|VES|ref\.?|USD|\$|d[oó]lares?)$/iu', '', $clean);
        $clean = preg_replace('/[^0-9.,]/', '', $clean);
        $clean = trim($clean);

        if ($clean === '' || !preg_match('/[0-9]/', $clean)) {
            return null;
        }

        $hasDot = strpos($clean, '.') !== false;
        $hasComma = strpos($clean, ',') !== false;

        if ($hasDot && $hasComma) {
            $lastDot = strrpos($clean, '.');
            $lastComma = strrpos($clean, ',');

            if ($lastDot < $lastComma) {
                // Formato venezolano: 22.532,28 o 1.942.438,50 (Puntos = miles, coma = decimal)
                $clean = str_replace('.', '', $clean);
                $clean = str_replace(',', '.', $clean);
            } else {
                // Formato anglosajón: 22,532.28 (Comas = miles, punto = decimal)
                $clean = str_replace(',', '', $clean);
            }
        } elseif ($hasComma) {
            // Solo coma: ej 6712,71 o 7,82 o 22532,28
            $clean = str_replace(',', '.', $clean);
        } elseif ($hasDot) {
            // Solo punto(s): ej 19424.38 o 7.82 o 22.532
            // Si hay más de un punto (ej: 1.500.000), son separadores de miles
            if (substr_count($clean, '.') > 1) {
                $clean = str_replace('.', '', $clean);
            }
        }

        return is_numeric($clean) ? (float) $clean : null;
    }

    /**
     * Extrae precios detectando moneda (Bolívares VES vs Dólares USD / Ref), desglose de IVA
     * y datos estructurados de plataformas de e-commerce (VTEX, Schema.org, OpenGraph y texto HTML).
     *
     * @param string $html
     * @return array{
     *     price_ves: ?float,
     *     price_usd: ?float,
     *     base_ves: ?float,
     *     tax_ves: ?float,
     *     source: string
     * }
     */
    public static function extractPricesFromHtml(string $html): array
    {
        $priceVes = null;
        $priceUsd = null;
        $baseVes = null;
        $taxVes = null;
        $source = 'none';

        // 1. Extraer de GraphQL / Apollo State de VTEX (Locatel y otras tiendas en Venezuela)
        // En VTEX, commertialOffer contiene Price (base) y Tax (IVA)
        if (preg_match('/commertialOffer.*?\{.*?"Price"\s*:\s*([0-9.]+).*?"Tax"\s*:\s*([0-9.]+)/s', $html, $vtexMatch)) {
            $baseVes = (float) $vtexMatch[1];
            $taxVes = (float) $vtexMatch[2];
            // En Venezuela el precio total final al consumidor es Base + IVA
            $priceVes = $baseVes + $taxVes;
            $source = 'vtex_commertial_offer';
        }

        // 2. Extraer de Schema.org JSON-LD (Product con offers o AggregateOffer)
        if ($priceVes === null && preg_match_all('/<script\s+type=["\']application\/ld\+json["\']\s*>(.*?)<\/script>/is', $html, $matches)) {
            foreach ($matches[1] as $block) {
                $data = json_decode(trim($block), true);
                if (is_array($data)) {
                    $nodes = $data['@graph'] ?? [$data];
                    foreach ($nodes as $node) {
                        if (($node['@type'] ?? '') === 'Product' && isset($node['offers'])) {
                            $offers = $node['offers'];
                            $curr = strtoupper($offers['priceCurrency'] ?? ($offers['offers'][0]['priceCurrency'] ?? ''));
                            $val = $offers['price'] ?? $offers['lowPrice'] ?? ($offers['offers'][0]['price'] ?? null);

                            if ($val !== null && (float) $val > 0) {
                                if ($curr === 'VES') {
                                    $priceVes = (float) $val;
                                    $source = 'json_ld_ves';
                                } elseif ($curr === 'USD') {
                                    $priceUsd = (float) $val;
                                    $source = 'json_ld_usd';
                                }
                            }
                        }
                    }
                }
            }
        }

        // 3. Extraer desglose explícito de texto HTML (Precio Total, Base sin IVA, Costo IVA)
        // A. Precio Total con IVA
        if (preg_match('/(?:precio\s*total|total(?:\s*con\s*iva)?)\s*:?\s*(?:Bs\.?|VES)?\s*([0-9.,]+)/iu', $html, $mTotal)) {
            $totalParsed = self::parseAmount($mTotal[1]);
            if ($totalParsed && $totalParsed > 0) {
                $priceVes = $totalParsed;
                $source = 'html_text_total';
            }
        }

        // B. Base sin IVA
        if (preg_match('/(?:precio\s*sin\s*iva|base(?:\s*imponible)?)\s*:?\s*(?:Bs\.?|VES)?\s*([0-9.,]+)/iu', $html, $mBase)) {
            $baseParsed = self::parseAmount($mBase[1]);
            if ($baseParsed && $baseParsed > 0) {
                $baseVes = $baseParsed;
            }
        }

        // C. Costo IVA (asegurando que no sea "sin IVA")
        if (preg_match('/(?<!sin\s)(?:costo\s*(?:del\s*)?iva|monto\s*iva|\biva\b)\s*:?\s*(?:Bs\.?|VES)?\s*([0-9.,]+)/iu', $html, $mTax)) {
            $taxParsed = self::parseAmount($mTax[1]);
            if ($taxParsed && $taxParsed > 0) {
                $taxVes = $taxParsed;
            }
        }

        // Si tenemos Base y Tax pero aún no Total en Bolívares
        if ($priceVes === null && $baseVes !== null) {
            $priceVes = $baseVes + ($taxVes ?? 0.0);
            $source = 'calculated_base_plus_tax';
        }

        // D. Si aún no tenemos VES, buscar formato Bs. general (evitando números de teléfono o códigos)
        if ($priceVes === null) {
            if (preg_match('/(?:Bs\.?|VES)\s*([0-9]+(?:\.[0-9]{3})*(?:,[0-9]{1,2})?|[0-9]+(?:,[0-9]{1,2})|[0-9]+(?:\.[0-9]+)?)/iu', $html, $mBs)) {
                $bsParsed = self::parseAmount($mBs[1]);
                if ($bsParsed && $bsParsed > 0) {
                    $priceVes = $bsParsed;
                    $source = 'html_text_bs';
                }
            }
        }

        // 4. Buscar precio de referencia en dólares: "ref 7.82", "REF: 7.82", "Ref. 7,82", "$7.82"
        if ($priceUsd === null) {
            if (preg_match('/(?:ref\.?|\bref\b)\s*:?\s*\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/iu', $html, $mRef)) {
                $refParsed = self::parseAmount($mRef[1]);
                if ($refParsed && $refParsed > 0 && $refParsed < 10000) {
                    $priceUsd = $refParsed;
                }
            } elseif (preg_match('/(?:\$|USD)\s*([0-9]+(?:[.,][0-9]{1,2})?)/iu', $html, $mUsd)) {
                // Evitar capturar promociones de envío como "órdenes mayores a 20$"
                if (!preg_match('/(?:mayores|superiores|env[ií]os?)\s*a\s*\$?\s*' . preg_quote($mUsd[1], '/') . '/i', $html)) {
                    $usdParsed = self::parseAmount($mUsd[1]);
                    if ($usdParsed && $usdParsed > 0 && $usdParsed < 10000) {
                        $priceUsd = $usdParsed;
                    }
                }
            }
        }

        return [
            'price_ves' => $priceVes,
            'price_usd' => $priceUsd,
            'base_ves' => $baseVes,
            'tax_ves' => $taxVes,
            'source' => $source,
        ];
    }

    /**
     * Calcula y sincroniza el par de precios (USD y VES) utilizando la tasa oficial BCV.
     *
     * @param float|null $priceVes
     * @param float|null $priceUsd
     * @param ExchangeRateService $exchangeRateService
     * @return array{price_usd: float, price_ves: float}
     */
    public static function resolvePricePair(?float $priceVes, ?float $priceUsd, ExchangeRateService $exchangeRateService): array
    {
        $resolvedVes = $priceVes ?? 0.0;
        $resolvedUsd = $priceUsd ?? 0.0;

        if ($resolvedVes > 0 && $resolvedUsd <= 0) {
            $resolvedUsd = $exchangeRateService->vesToUsd($resolvedVes);
        } elseif ($resolvedUsd > 0 && $resolvedVes <= 0) {
            $resolvedVes = $exchangeRateService->usdToVes($resolvedUsd);
        }

        return [
            'price_usd' => $resolvedUsd,
            'price_ves' => $resolvedVes,
        ];
    }
}
