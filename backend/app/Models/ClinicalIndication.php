<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ClinicalIndication extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'ingredient_clinical_indications')
            ->withPivot(['evidence_level', 'effective_concentration_min', 'target_mechanism'])
            ->withTimestamps();
    }
}
