<?php

namespace App\Services\Currency;

use App\Models\AffiliateStore;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use Illuminate\Support\Facades\Log;

class PriceNormalizerService
{
    protected ExchangeRateService $exchangeRateService;

    public function __construct(?ExchangeRateService $exchangeRateService = null)
    {
        $this->exchangeRateService = $exchangeRateService ?? app(ExchangeRateService::class);
    }

    /**
     * Parsea cualquier representación de precio a un float limpio y estándar (ej: "20,00" -> 20.00).
     * Resuelve de forma infalible separadores de miles y decimales según la divisa y los patrones numéricos.
     */
    public function parseAmount(mixed $rawAmount, ?string $currency = null, ?string $countryCode = null): ?float
    {
        if ($rawAmount === null) {
            return null;
        }

        if (is_numeric($rawAmount) && !is_string($rawAmount)) {
            return round((float) $rawAmount, 2);
        }

        $str = trim((string) $rawAmount);
        if ($str === '') {
            return null;
        }

        $curr = strtoupper(trim($currency ?? ''));
        $country = strtoupper(trim($countryCode ?? ''));

        // Limpiar etiquetas de moneda, palabras y caracteres extraños
        $clean = preg_replace('/^(?:Bs\.?|VES|ref\.?|USD|\$|CLP|COP|MXN|EUR|€|d[oó]lares?|pesos?)\s*/iu', '', $str);
        $clean = preg_replace('/\s*(?:Bs\.?|VES|ref\.?|USD|\$|CLP|COP|MXN|EUR|€|d[oó]lares?|pesos?)$/iu', '', $clean);
        $clean = preg_replace('/[^0-9.,]/', '', $clean);
        $clean = trim($clean);

        if ($clean === '' || !preg_match('/[0-9]/', $clean)) {
            return null;
        }

        $isZeroDecimal = in_array($curr, ['CLP', 'COP', 'PYG', 'JPY'], true) 
            || in_array($country, ['CL', 'CO', 'PY', 'JP'], true);

        $hasDot = str_contains($clean, '.');
        $hasComma = str_contains($clean, ',');

        if ($hasDot && $hasComma) {
            // Ambos separadores presentes
            $lastDot = strrpos($clean, '.');
            $lastComma = strrpos($clean, ',');

            if ($lastDot < $lastComma) {
                // Formato latino/europeo: 17.181,20 o 1.500,00 (puntos = miles, coma = decimal)
                $clean = str_replace('.', '', $clean);
                $clean = str_replace(',', '.', $clean);
            } else {
                // Formato anglosajón: 17,181.20 (comas = miles, punto = decimal)
                $clean = str_replace(',', '', $clean);
            }
        } elseif ($hasComma) {
            // Solo coma(s)
            $commaCount = substr_count($clean, ',');
            if ($commaCount > 1) {
                // Múltiples comas son separadores de miles: 1,500,000 -> 1500000
                $clean = str_replace(',', '', $clean);
            } else {
                // Una sola coma: e.g. "20,00" o "18,500" o "7,8"
                $parts = explode(',', $clean);
                $afterComma = $parts[1] ?? '';
                $digitsAfter = strlen($afterComma);

                if ($isZeroDecimal) {
                    if ($digitsAfter === 3) {
                        // En CLP/COP, 18,500 es 18500
                        $clean = str_replace(',', '', $clean);
                    } elseif ($afterComma === '00' || $afterComma === '0') {
                        // 18500,00 -> 18500
                        $clean = $parts[0];
                    } else {
                        $clean = str_replace(',', '.', $clean);
                    }
                } else {
                    // Para USD, EUR, VES, MXN:
                    // Si tiene 1 o 2 dígitos después de la coma (ej: 20,00 o 7,8 o 0,07) -> coma es DECIMAL
                    if ($digitsAfter === 1 || $digitsAfter === 2) {
                        $clean = str_replace(',', '.', $clean);
                    } elseif ($digitsAfter === 3) {
                        // Si tiene 3 dígitos e.g. 17,181 en VES -> miles
                        if ($curr === 'VES' || $country === 'VE') {
                            $clean = str_replace(',', '', $clean);
                        } else {
                            $clean = str_replace(',', '.', $clean);
                        }
                    } else {
                        $clean = str_replace(',', '.', $clean);
                    }
                }
            }
        } elseif ($hasDot) {
            // Solo punto(s)
            $dotCount = substr_count($clean, '.');
            if ($dotCount > 1) {
                // Múltiples puntos son separadores de miles: 1.500.000 o 17.181.200
                $clean = str_replace('.', '', $clean);
            } else {
                // Un solo punto: e.g. "20.00" o "18.500" o "17.181"
                $parts = explode('.', $clean);
                $afterDot = $parts[1] ?? '';
                $digitsAfter = strlen($afterDot);

                if ($isZeroDecimal) {
                    if ($digitsAfter === 3) {
                        // En CLP/COP: 18.500 es 18500 pesos
                        $clean = str_replace('.', '', $clean);
                    } elseif ($afterDot === '00' || $afterDot === '0') {
                        $clean = $parts[0];
                    }
                } else {
                    if ($digitsAfter === 3) {
                        // En Venezuela, un cosmético nunca cuesta 17.181 Bs. (eso sería 0.02 USD)
                        // 17.181 representa 17181 Bolívares
                        if ($curr === 'VES' || $country === 'VE') {
                            $clean = str_replace('.', '', $clean);
                        }
                    }
                    // Si digitsAfter es 1 o 2 (ej: 20.00, 19.99), se mantiene el punto como decimal estándar
                }
            }
        }

        if (!is_numeric($clean)) {
            return null;
        }

        $val = (float) $clean;
        return $isZeroDecimal ? round($val, 0) : round($val, 2);
    }

    /**
     * Normaliza de forma integral una oferta de precio:
     * - USD siempre normalizado como float estándar (ej. 20.00).
     * - Moneda local siempre normalizada según el país de la tienda.
     * - price_ves es estrictamente igual a price_local para Venezuela, y null para el resto del mundo.
     * - Resuelve discrepancias bimonetarias venezolanas (USD vs VES).
     *
     * @return array{
     *     price_usd: float,
     *     price_local: float,
     *     currency_local: string,
     *     price_ves: ?float,
     *     is_valid: bool,
     *     source_adjustment: string
     * }
     */
    public function normalize(
        mixed $rawPrice,
        ?string $currency = null,
        ?string $countryCode = null,
        mixed $rawVes = null,
        mixed $rawLocal = null
    ): array {
        $country = strtoupper(trim($countryCode ?? 'GLOBAL'));
        $storeCurrency = $this->exchangeRateService->getCurrencyForCountry($country);
        $providedCurrency = !empty($currency) ? strtoupper(trim($currency)) : $storeCurrency;
        $bcvRate = $this->exchangeRateService->getBcvRate();

        $parsedPrice = $this->parseAmount($rawPrice, $providedCurrency, $country);
        $parsedVes = $this->parseAmount($rawVes, 'VES', 'VE');
        $parsedLocal = $this->parseAmount($rawLocal, $storeCurrency, $country);

        $priceUsd = 0.0;
        $priceLocal = 0.0;
        $currencyLocal = $storeCurrency;
        $priceVes = null;
        $adjustment = 'standard';

        if ($country === 'VE') {
            $currencyLocal = 'VES';

            // CASO ESPECIAL CORRECCIÓN HISTÓRICA:
            // Si price_usd es < 1.00 (ej: 0.07 o 0.84) y price_local está entre 2 y 250 (ej: 20.00 o 50.00),
            // el precio original de la tienda era en DÓLARES ($20.00 o $50.00) y un scraper previo
            // lo dividió erróneamente por la tasa de cambio confundiéndolo con Bolívares.
            if ($parsedPrice !== null && $parsedPrice < 1.00 && $parsedLocal !== null && $parsedLocal >= 2.0 && $parsedLocal <= 250.0) {
                $priceUsd = $parsedLocal;
                $priceLocal = round($priceUsd * $bcvRate, 2);
                $priceVes = $priceLocal;
                $adjustment = 've_restored_from_divided_usd';
            } elseif ($parsedVes !== null && $parsedVes >= 150.0) {
                // CASO 1: Tenemos un monto en Bolívares explícito y confiable (>= 150 Bs.)
                $priceLocal = $parsedVes;
                $priceUsd = round($priceLocal / $bcvRate, 2);
                $priceVes = $priceLocal;
                $adjustment = 've_ves_explicit';
            } elseif ($parsedLocal !== null && $parsedLocal >= 150.0) {
                $priceLocal = $parsedLocal;
                $priceUsd = round($priceLocal / $bcvRate, 2);
                $priceVes = $priceLocal;
                $adjustment = 've_local_ves';
            } else {
                // CASO 2: El precio extraído está en dólares USD (típico de tiendas venezolanas en Shopify/WooCommerce)
                $candidateUsd = $parsedPrice ?? $parsedLocal ?? $parsedVes ?? 0.0;

                // Si el candidato es >= 150.00, en realidad es un precio en Bolívares que vino etiquetado como USD/número
                if ($candidateUsd >= 150.0) {
                    $priceLocal = $candidateUsd;
                    $priceUsd = round($priceLocal / $bcvRate, 2);
                    $priceVes = $priceLocal;
                    $adjustment = 've_large_number_is_ves';
                } elseif ($candidateUsd > 0) {
                    // Candidato < 150.00: En cosmética en Venezuela esto es DÓLARES USD (e.g. $20,00)
                    // Un sérum de 20 Bolívares costaría $0.02 USD, lo cual es imposible.
                    $priceUsd = $candidateUsd;
                    $priceLocal = round($priceUsd * $bcvRate, 2);
                    $priceVes = $priceLocal;
                    $adjustment = 've_usd_converted_to_ves';
                }
            }

            // Invariante de coherencia para Venezuela:
            // price_ves SIEMPRE debe ser exactamente price_local
            $priceVes = $priceLocal;

            // Si por alguna razón priceUsd quedó ridículamente desincronizado con priceLocal (ej. $0.07 vs 17,181 Bs.)
            if ($priceLocal > 100 && ($priceUsd < 0.50 || abs($priceLocal - ($priceUsd * $bcvRate)) / $priceLocal > 0.20)) {
                $priceUsd = round($priceLocal / $bcvRate, 2);
                $adjustment = 've_resynced_from_ves';
            }
        } else {
            // TIENDAS INTERNACIONALES (Chile, Colombia, España, México, USA, El Salvador, etc.)
            // price_ves es estrictamente null para no confundir al usuario
            $priceVes = null;
            $currencyLocal = $storeCurrency;

            // Determinar si el precio provisto vino en USD o en divisa local
            if ($providedCurrency === 'USD') {
                $priceUsd = $parsedPrice ?? 0.0;
                $priceLocal = $parsedLocal ?? $this->exchangeRateService->fromUsd($priceUsd, $storeCurrency);
                $adjustment = 'intl_usd_source';
            } elseif ($providedCurrency === $storeCurrency) {
                $priceLocal = $parsedLocal ?? $parsedPrice ?? 0.0;
                $priceUsd = $this->exchangeRateService->toUsd($priceLocal, $storeCurrency);
                $adjustment = 'intl_local_source';
            } else {
                // Otra moneda (ej. EUR en tienda global)
                $tempAmt = $parsedPrice ?? 0.0;
                $priceUsd = $this->exchangeRateService->toUsd($tempAmt, $providedCurrency);
                $priceLocal = $this->exchangeRateService->fromUsd($priceUsd, $storeCurrency);
                $adjustment = 'intl_converted_source';
            }

            // Corrección especial para tiendas de México / LatAm que cotizan en USD pero fueron marcadas con moneda local
            if ($country === 'MX' && $priceLocal > 0 && $priceLocal < 45.0 && $providedCurrency === 'MXN') {
                // En skincare, $15.95 en una tienda Shopify suele ser USD, no 15 pesos mexicanos ($0.80 USD)
                $priceUsd = $priceLocal;
                $priceLocal = round($priceUsd * 18.2, 2);
                $adjustment = 'mx_usd_corrected';
            }
        }

        $isValid = ($priceUsd >= 0.50 && $priceUsd <= 500.00);

        return [
            'price_usd' => round($priceUsd, 2),
            'price_local' => round($priceLocal, 2),
            'currency_local' => $currencyLocal,
            'price_ves' => $priceVes !== null ? round($priceVes, 2) : null,
            'is_valid' => $isValid,
            'source_adjustment' => $adjustment,
        ];
    }

    /**
     * Normaliza un DTO de oferta antes de ser procesado o almacenado en la base de datos.
     */
    public function normalizeProductOffer(ScrapedProductOfferDTO $dto, ?AffiliateStore $store = null): ScrapedProductOfferDTO
    {
        $countryCode = $store?->country_code ?? 'VE';

        $normalized = $this->normalize(
            rawPrice: $dto->price,
            currency: $dto->currency,
            countryCode: $countryCode,
            rawVes: $dto->priceVes,
            rawLocal: $dto->priceLocal
        );

        $dto->price = $normalized['price_usd'];
        $dto->priceLocal = $normalized['price_local'];
        $dto->currencyLocal = $normalized['currency_local'];
        $dto->priceVes = $normalized['price_ves'];
        $dto->currency = 'USD';

        return $dto;
    }
}
