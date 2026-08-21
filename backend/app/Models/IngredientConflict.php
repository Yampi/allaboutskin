<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IngredientConflict extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function ingredientA(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class, 'ingredient_a_id');
    }

    public function ingredientB(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class, 'ingredient_b_id');
    }
}
