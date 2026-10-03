<?php

namespace App\Models;

use App\Services\Currency\ExchangeRateService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductStoreOffer extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $appends = [
        'price_usd',
        'price_local',
        'currency_local',
        'formatted_price_usd',
        'formatted_price_local',
        'store_country_code',
        'store_country_name',
        'store_country_flag',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'price_ves' => 'float',
            'price_local' => 'float',
            'in_stock' => 'boolean',
            'last_checked_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(AffiliateStore::class, 'store_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(StoreBranch::class, 'branch_id');
    }

    public function priceHistories(): HasMany
    {
        return $this->hasMany(ProductPriceHistory::class, 'offer_id')->orderBy('recorded_at', 'desc');
    }

    public function getPriceUsdAttribute(): float
    {
        return (float) ($this->price ?? 0.0);
    }

    public function getCurrencyLocalAttribute(): string
    {
        if (!empty($this->attributes['currency_local'])) {
            return strtoupper($this->attributes['currency_local']);
        }

        $countryCode = $this->store?->country_code;
        return app(ExchangeRateService::class)->getCurrencyForCountry($countryCode);
    }

    public function getPriceLocalAttribute(): float
    {
        if (isset($this->attributes['price_local']) && (float) $this->attributes['price_local'] > 0) {
            return (float) $this->attributes['price_local'];
        }

        $currency = $this->currency_local;

        // Caso especial Venezuela: si ya tiene price_ves
        if ($currency === 'VES' && isset($this->attributes['price_ves']) && (float) $this->attributes['price_ves'] > 0) {
            return (float) $this->attributes['price_ves'];
        }

        // Si la moneda es USD
        if ($currency === 'USD') {
            return (float) ($this->price ?? 0.0);
        }

        // Convertir automáticamente desde USD usando ExchangeRateService
        $usd = (float) ($this->price ?? 0.0);
        if ($usd > 0) {
            return app(ExchangeRateService::class)->fromUsd($usd, $currency);
        }

        return 0.0;
    }

    public function getFormattedPriceUsdAttribute(): string
    {
        $usd = $this->price_usd;
        return '$' . number_format($usd, 2, '.', ',') . ' USD';
    }

    public function getFormattedPriceLocalAttribute(): string
    {
        $local = $this->price_local;
        $currency = $this->currency_local;
        return app(ExchangeRateService::class)->formatPrice($local, $currency);
    }

    public function getStoreCountryCodeAttribute(): string
    {
        return strtoupper($this->store?->country_code ?? 'VE');
    }

    public function getStoreCountryNameAttribute(): string
    {
        return $this->store?->country_name ?? 'Venezuela';
    }

    public function getStoreCountryFlagAttribute(): string
    {
        return $this->store?->country_flag ?? '🇻🇪';
    }
}
