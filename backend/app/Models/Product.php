<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'volume_amount' => 'float',
            'pao_months' => 'integer',
            'dosage_per_application_ml' => 'float',
            'ph_level' => 'float',
            'is_verified' => 'boolean',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'product_ingredients')
            ->withPivot(['position', 'concentration_percentage', 'is_declared_active'])
            ->orderByPivot('position', 'asc')
            ->withTimestamps();
    }

    public function storeOffers(): HasMany
    {
        return $this->hasMany(ProductStoreOffer::class);
    }
}
