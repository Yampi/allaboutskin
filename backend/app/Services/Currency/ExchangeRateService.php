<?php

namespace App\Services\Currency;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExchangeRateService
{
    protected const DEFAULT_FALLBACK_RATE = 871.37;
    protected const CACHE_KEY = 'bcv_usd_rate_totoya';
    protected const MULTI_RATES_CACHE_KEY = 'global_exchange_rates_usd';
    protected const CACHE_TTL_SECONDS = 43200; // 12 horas de caché (12 * 3600 seg)

    /**
     * Tasas de respaldo offline seguras (unidades por 1 USD).
     */
    protected const FALLBACK_RATES = [
        'USD' => 1.0,
        'CLP' => 980.0,
        'COP' => 3310.0,
        'MXN' => 18.2,
        'EUR' => 0.89,
        'ARS' => 1520.0,
        'PEN' => 3.44,
        'VES' => 871.37,
        'BRL' => 5.22,
        'GBP' => 0.76,
        'HNL' => 26.85,
        'DOP' => 60.5,
        'INR' => 96.37,
        'CHF' => 0.83,
    ];

    /**
     * Mapeo oficial de código de país a código de moneda local.
     */
    public const COUNTRY_CURRENCY_MAP = [
        'VE' => 'VES',
        'CL' => 'CLP',
        'CO' => 'COP',
        'MX' => 'MXN',
        'ES' => 'EUR',
        'PA' => 'USD',
        'US' => 'USD',
        'AR' => 'ARS',
        'PE' => 'PEN',
        'EC' => 'USD',
        'HN' => 'HNL',
        'DO' => 'DOP',
        'SV' => 'USD',
        'IN' => 'INR',
        'CH' => 'CHF',
        'GL' => 'USD',
        'GLOBAL' => 'USD',
    ];

    /**
     * Obtiene la tasa oficial BCV actualizada en tiempo real vía totoya.app.
     */
    public function getBcvRate(): float
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            try {
                $response = Http::timeout(6)->get('https://totoya.app/api/rates');

                if ($response->successful()) {
                    $json = $response->json();
                    $rate = (float) ($json['data']['usd_ves'] ?? 0);

                    if ($rate > 0) {
                        SystemSetting::updateOrCreate(
                            ['key' => 'currency.usd_bcv_rate'],
                            [
                                'value' => (string) $rate,
                                'group' => 'currency',
                                'type' => 'number',
                                'description' => 'Tasa de cambio oficial BCV (USD a VES) sincronizada con totoya.app',
                            ]
                        );

                        Log::channel('single')->info("[ExchangeRate] Tasa oficial BCV actualizada desde totoya.app: Bs. {$rate} / USD");
                        return $rate;
                    }
                }
            } catch (\Throwable $e) {
                Log::channel('single')->warning("[ExchangeRate] No se pudo consultar totoya.app, usando respaldo: " . $e->getMessage());
            }

            // Fallback 1: Buscar última tasa guardada en SystemSetting
            $saved = SystemSetting::where('key', 'currency.usd_bcv_rate')->first();
            if ($saved && is_numeric($saved->value) && (float) $saved->value > 0) {
                return (float) $saved->value;
            }

            // Fallback 2: Constante actualizada
            return self::DEFAULT_FALLBACK_RATE;
        });
    }

    /**
     * Obtiene el diccionario completo de tasas de cambio internacionales referenciadas a USD.
     *
     * @return array<string, float>
     */
    public function getAllRates(): array
    {
        return Cache::remember(self::MULTI_RATES_CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            $rates = self::FALLBACK_RATES;
            $rates['VES'] = $this->getBcvRate();

            try {
                $response = Http::timeout(6)->get('https://open.er-api.com/v6/latest/USD');
                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data['rates']) && is_array($data['rates'])) {
                        foreach ($data['rates'] as $cur => $val) {
                            $rates[$cur] = (float) $val;
                        }
                        // Asegurar que VES use la tasa oficial BCV
                        $rates['VES'] = $this->getBcvRate();
                        return $rates;
                    }
                }
            } catch (\Throwable $e) {
                Log::channel('single')->warning("[ExchangeRate] No se pudo consultar open.er-api.com: " . $e->getMessage());
            }

            return $rates;
        });
    }

    /**
     * Obtiene la tasa de una moneda específica con respecto a USD (cuántas unidades de divisa equivalen a 1 USD).
     */
    public function getRate(string $currency): float
    {
        $curr = strtoupper(trim($currency));
        if ($curr === 'USD') {
            return 1.0;
        }

        if ($curr === 'VES' || $curr === 'BS') {
            return $this->getBcvRate();
        }

        $all = $this->getAllRates();
        return $all[$curr] ?? (self::FALLBACK_RATES[$curr] ?? 1.0);
    }

    /**
     * Convierte una cantidad en moneda local a Dólares Americanos (USD).
     */
    public function toUsd(float $amount, string $currency): float
    {
        $curr = strtoupper(trim($currency));
        if ($curr === 'USD' || $amount <= 0) {
            return round($amount, 2);
        }

        $rate = $this->getRate($curr);
        return $rate > 0 ? round($amount / $rate, 2) : $amount;
    }

    /**
     * Convierte una cantidad en Dólares Americanos (USD) a una moneda local.
     */
    public function fromUsd(float $amountUsd, string $currency): float
    {
        $curr = strtoupper(trim($currency));
        if ($curr === 'USD' || $amountUsd <= 0) {
            return round($amountUsd, 2);
        }

        $rate = $this->getRate($curr);
        $converted = $amountUsd * $rate;

        // Monedas sin decimales estándar (como CLP, COP, PYG, JPY, KRW)
        if (in_array($curr, ['CLP', 'COP', 'PYG', 'JPY', 'KRW'])) {
            return round($converted, 0);
        }

        return round($converted, 2);
    }

    /**
     * Formatea un monto numérico con el símbolo y estilo visual característico de su divisa.
     */
    public function formatPrice(float $amount, string $currency): string
    {
        $curr = strtoupper(trim($currency));

        return match ($curr) {
            'CLP' => '$' . number_format($amount, 0, ',', '.') . ' CLP',
            'COP' => '$' . number_format($amount, 0, ',', '.') . ' COP',
            'VES' => 'Bs. ' . number_format($amount, 2, ',', '.'),
            'EUR' => number_format($amount, 2, ',', '.') . ' €',
            'MXN' => '$' . number_format($amount, 2, '.', ',') . ' MXN',
            'PEN' => 'S/ ' . number_format($amount, 2, '.', ','),
            'ARS' => '$' . number_format($amount, 2, ',', '.') . ' ARS',
            'DOP' => 'RD$ ' . number_format($amount, 2, '.', ',') . ' DOP',
            'BRL' => 'R$ ' . number_format($amount, 2, ',', '.'),
            'GBP' => '£' . number_format($amount, 2, '.', ','),
            default => '$' . number_format($amount, 2, '.', ',') . ' USD',
        };
    }

    /**
     * Devuelve la moneda oficial de un país dado su código ISO (VE, CL, MX, ES...).
     */
    public function getCurrencyForCountry(?string $countryCode): string
    {
        $code = strtoupper(trim($countryCode ?? 'GLOBAL'));
        return self::COUNTRY_CURRENCY_MAP[$code] ?? 'USD';
    }

    /**
     * Fuerza la actualización de la tasa oficial BCV omitiendo la caché.
     */
    public function refreshBcvRate(): float
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::MULTI_RATES_CACHE_KEY);
        return $this->getBcvRate();
    }

    /**
     * Convierte Bolívares (VES) a Dólares Americanos (USD). Compatibilidad hacia atrás.
     */
    public function vesToUsd(float $ves): float
    {
        return $this->toUsd($ves, 'VES');
    }

    /**
     * Convierte Dólares Americanos (USD) a Bolívares (VES). Compatibilidad hacia atrás.
     */
    public function usdToVes(float $usd): float
    {
        return $this->fromUsd($usd, 'VES');
    }
}
