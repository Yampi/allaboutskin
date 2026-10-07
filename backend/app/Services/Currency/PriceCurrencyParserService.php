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
    public static function parseAmount(?string $str, ?string $currency = null, ?string $countryCode = null): ?float
    {
        return app(PriceNormalizerService::class)->parseAmount($str, $currency, $countryCode);
    }

    /**
     * Extrae precios detectando moneda local según el país de la tienda,
     * datos estructurados Schema.org, OpenGraph y texto HTML.
     *
     * @param string $html
     * @param string|null $countryCode Código ISO del país de la tienda (ej. 'VE', 'CL', 'SV', 'CO', 'ES')
     * @return array{
     *     price_ves: ?float,
     *     price_usd: ?float,
     *     price_local: ?float,
     *     currency_local: string,
     *     base_ves: ?float,
     *     tax_ves: ?float,
     *     source: string
     * }
     */
    public static function extractPricesFromHtml(string $html, ?string $countryCode = null): array
    {
        $normalizedCountry = strtoupper(trim($countryCode ?? 'GLOBAL'));
        $exchangeService = app(ExchangeRateService::class);
        $expectedCurrency = $exchangeService->getCurrencyForCountry($normalizedCountry);

        $priceVes = null;
        $priceUsd = null;
        $priceLocal = null;
        $detectedCurrency = $expectedCurrency;
        $baseVes = null;
        $taxVes = null;
        $source = 'none';

        // 1. Extraer de GraphQL / Apollo State de VTEX (Locatel y otras tiendas en Venezuela)
        if ($normalizedCountry === 'VE' || str_contains($html, 'vtex.cmc')) {
            if (preg_match('/commertialOffer.*?\{.*?"Price"\s*:\s*([0-9.]+).*?"Tax"\s*:\s*([0-9.]+)/s', $html, $vtexMatch)) {
                $baseVes = (float) $vtexMatch[1];
                $taxVes = (float) $vtexMatch[2];
                $priceVes = $baseVes + $taxVes;
                $priceLocal = $priceVes;
                $detectedCurrency = 'VES';
                $source = 'vtex_commertial_offer';
            }
        }

        // 2. Extraer de Schema.org JSON-LD (Product con offers o AggregateOffer)
        if ($priceLocal === null && preg_match_all('/<script\s+type=["\']application\/ld\+json["\']\s*>(.*?)<\/script>/is', $html, $matches)) {
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
                                $valFloat = (float) $val;
                                $effectiveCurr = !empty($curr) ? $curr : $expectedCurrency;

                                $priceLocal = $valFloat;
                                $detectedCurrency = $effectiveCurr;
                                $source = "json_ld_{$effectiveCurr}";

                                if ($effectiveCurr === 'VES') {
                                    $priceVes = $valFloat;
                                } elseif ($effectiveCurr === 'USD') {
                                    $priceUsd = $valFloat;
                                } else {
                                    $priceUsd = $exchangeService->toUsd($valFloat, $effectiveCurr);
                                }
                                break 2;
                            }
                        }
                    }
                }
            }
        }

        // 3. Extracción de Bolívares (VES): ÚNICAMENTE si la tienda es venezolana o si se menciona explícitamente Bs./VES
        $hasExplicitBs = preg_match('/(?:Bs\.?|VES|Bolívares|Bolivares)\s*([0-9.,]+)/iu', $html, $mBsExplicit);
        if ($normalizedCountry === 'VE' || $hasExplicitBs) {
            // A. Precio Total con IVA en Venezuela
            if (preg_match('/(?:precio\s*total|total(?:\s*con\s*iva)?)\s*:?\s*(?:Bs\.?|VES)\s*([0-9.,]+)/iu', $html, $mTotal)) {
                $totalParsed = self::parseAmount($mTotal[1]);
                if ($totalParsed && $totalParsed > 0) {
                    $priceVes = $totalParsed;
                    $priceLocal = $totalParsed;
                    $detectedCurrency = 'VES';
                    $source = 'html_text_total_bs';
                }
            } elseif ($hasExplicitBs) {
                $bsParsed = self::parseAmount($mBsExplicit[1]);
                if ($bsParsed && $bsParsed > 0) {
                    $priceVes = $bsParsed;
                    $priceLocal = $bsParsed;
                    $detectedCurrency = 'VES';
                    $source = 'html_text_bs';
                }
            }

            // B. Base sin IVA y Costo IVA para Venezuela
            if (preg_match('/(?:precio\s*sin\s*iva|base(?:\s*imponible)?)\s*:?\s*(?:Bs\.?|VES)\s*([0-9.,]+)/iu', $html, $mBase)) {
                $baseVes = self::parseAmount($mBase[1]);
            }
            if (preg_match('/(?<!sin\s)(?:costo\s*(?:del\s*)?iva|monto\s*iva|\biva\b)\s*:?\s*(?:Bs\.?|VES)\s*([0-9.,]+)/iu', $html, $mTax)) {
                $taxVes = self::parseAmount($mTax[1]);
            }

            if ($priceVes === null && $baseVes !== null) {
                $priceVes = $baseVes + ($taxVes ?? 0.0);
                $priceLocal = $priceVes;
                $detectedCurrency = 'VES';
                $source = 'calculated_base_plus_tax';
            }
        }

        // 4. Extracción según moneda nativa de otros países (Chile CLP, Colombia COP, España EUR, El Salvador USD, etc.)
        if ($priceLocal === null) {
            // A. Si es España / Europa (EUR €)
            if ($normalizedCountry === 'ES' || preg_match('/([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:€|EUR)/iu', $html, $mEur)) {
                $eurStr = isset($mEur[1]) ? $mEur[1] : null;
                if (!$eurStr && preg_match('/(?:€|EUR)\s*([0-9]+(?:[.,][0-9]{1,2})?)/iu', $html, $mEur2)) {
                    $eurStr = $mEur2[1];
                }
                if ($eurStr) {
                    $parsed = self::parseAmount($eurStr);
                    if ($parsed && $parsed > 0) {
                        $priceLocal = $parsed;
                        $detectedCurrency = 'EUR';
                        $priceUsd = $exchangeService->toUsd($parsed, 'EUR');
                        $source = 'html_text_eur';
                    }
                }
            }

            // B. Si es Chile (CLP)
            if ($priceLocal === null && $normalizedCountry === 'CL') {
                if (preg_match('/(?:\$\s*|CLP\s*)([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,7})/iu', $html, $mClp)) {
                    $cleanClp = str_replace('.', '', $mClp[1]);
                    if (is_numeric($cleanClp) && (float) $cleanClp > 0) {
                        $priceLocal = (float) $cleanClp;
                        $detectedCurrency = 'CLP';
                        $priceUsd = $exchangeService->toUsd($priceLocal, 'CLP');
                        $source = 'html_text_clp';
                    }
                }
            }

            // C. Si es Colombia (COP)
            if ($priceLocal === null && $normalizedCountry === 'CO') {
                if (preg_match('/(?:\$\s*|COP\s*)([0-9]{1,3}(?:\.[0-9]{3})+|[0-9]{4,8})/iu', $html, $mCop)) {
                    $cleanCop = str_replace('.', '', $mCop[1]);
                    if (is_numeric($cleanCop) && (float) $cleanCop > 0) {
                        $priceLocal = (float) $cleanCop;
                        $detectedCurrency = 'COP';
                        $priceUsd = $exchangeService->toUsd($priceLocal, 'COP');
                        $source = 'html_text_cop';
                    }
                }
            }

            // D. Búsqueda de referencia en dólares ($ o USD) - para El Salvador, Panamá, USA o general
            if ($priceLocal === null) {
                if (preg_match('/(?:ref\.?|\bref\b)\s*:?\s*\$?\s*([0-9]+(?:[.,][0-9]{1,2})?)/iu', $html, $mRef)) {
                    $refParsed = self::parseAmount($mRef[1]);
                    if ($refParsed && $refParsed > 0 && $refParsed < 10000) {
                        $priceUsd = $refParsed;
                        $priceLocal = $refParsed;
                        $detectedCurrency = 'USD';
                        $source = 'html_ref_usd';
                    }
                } elseif (preg_match('/(?:\$|USD)\s*([0-9]+(?:[.,][0-9]{1,2})?)/iu', $html, $mUsd)) {
                    if (!preg_match('/(?:mayores|superiores|env[ií]os?)\s*a\s*\$?\s*' . preg_quote($mUsd[1], '/') . '/i', $html)) {
                        $usdParsed = self::parseAmount($mUsd[1]);
                        if ($usdParsed && $usdParsed > 0 && $usdParsed < 10000) {
                            $priceUsd = $usdParsed;
                            $priceLocal = $usdParsed;
                            $detectedCurrency = 'USD';
                            $source = 'html_dollar_usd';
                        }
                    }
                }
            }
        }

        // Si tenemos precio local pero no USD aún
        if ($priceLocal !== null && $priceUsd === null) {
            $priceUsd = $exchangeService->toUsd($priceLocal, $detectedCurrency);
        }

        // Para Venezuela: si tenemos USD pero no VES
        if ($normalizedCountry === 'VE' && $priceUsd !== null && $priceVes === null) {
            $priceVes = $exchangeService->usdToVes($priceUsd);
        }

        return [
            'price_ves' => $priceVes,
            'price_usd' => $priceUsd,
            'price_local' => $priceLocal,
            'currency_local' => $detectedCurrency,
            'base_ves' => $baseVes,
            'tax_ves' => $taxVes,
            'source' => $source,
        ];
    }

    /**
     * Calcula y sincroniza el par de precios (USD y VES) utilizando la tasa oficial BCV.
     * Mantiene retrocompatibilidad.
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
