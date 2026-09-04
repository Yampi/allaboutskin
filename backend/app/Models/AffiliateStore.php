<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AffiliateStore extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_independent' => 'boolean',
        ];
    }

    public function branches(): HasMany
    {
        return $this->hasMany(StoreBranch::class, 'store_id');
    }

    public function productOffers(): HasMany
    {
        return $this->hasMany(ProductStoreOffer::class, 'store_id');
    }
}
