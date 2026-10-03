<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPriceHistory extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'old_price_usd' => 'float',
            'new_price_usd' => 'float',
            'old_price_ves' => 'float',
            'new_price_ves' => 'float',
            'difference_usd' => 'float',
            'percentage_change' => 'float',
            'was_in_stock' => 'boolean',
            'is_in_stock' => 'boolean',
            'recorded_at' => 'datetime',
        ];
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(ProductStoreOffer::class, 'offer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(AffiliateStore::class, 'store_id');
    }
}
