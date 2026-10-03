<?php

namespace App\Models;

use App\Domain\Store\Enums\StoreSubscriptionTier;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateStore extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $appends = ['country_name', 'country_flag'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_independent' => 'boolean',
            'is_featured' => 'boolean',
            'crawler_enabled' => 'boolean',
            'last_crawled_at' => 'datetime',
            'subscription_tier' => StoreSubscriptionTier::class,
            'subscription_expires_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function getCountryNameAttribute(): string
    {
        $code = strtoupper($this->country_code ?? 'GLOBAL');
        return \App\Services\Scraper\Services\StoreCountryDetectorService::COUNTRIES[$code]['name'] ?? 'Internacional';
    }

    public function getCountryFlagAttribute(): string
    {
        $code = strtoupper($this->country_code ?? 'GLOBAL');
        return \App\Services\Scraper\Services\StoreCountryDetectorService::COUNTRIES[$code]['flag'] ?? '🌐';
    }

    public function scopeByCountry(Builder $query, string $countryCode): Builder
    {
        return $query->where('country_code', strtoupper($countryCode));
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function branches(): HasMany
    {
        return $this->hasMany(StoreBranch::class, 'store_id');
    }

    public function productOffers(): HasMany
    {
        return $this->hasMany(ProductStoreOffer::class, 'store_id');
    }

    public function leadInteractions(): HasMany
    {
        return $this->hasMany(StoreLeadInteraction::class, 'store_id');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true)
            ->orWhereIn('subscription_tier', [
                StoreSubscriptionTier::PRO_LOCAL->value,
                StoreSubscriptionTier::ENTERPRISE->value,
            ]);
    }

    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('owner_id', $userId);
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'VERIFIED';
    }

    public function isFeaturedActive(): bool
    {
        if ($this->is_featured) {
            return true;
        }

        if ($this->subscription_tier?->isFeatured()) {
            return $this->subscription_expires_at === null || $this->subscription_expires_at->isFuture();
        }

        return false;
    }
}
