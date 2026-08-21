<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'cosing_functions' => 'array',
            'is_active' => 'boolean',
            'is_uv_sensitizing' => 'boolean',
            'requires_sunscreen' => 'boolean',
            'optimal_ph_min' => 'float',
            'optimal_ph_max' => 'float',
            'molecular_weight' => 'float',
            'comedogenic_rating' => 'integer',
            'irritation_rating' => 'integer',
            'results_timeline_weeks_min' => 'integer',
            'results_timeline_weeks_max' => 'integer',
        ];
    }

    public function aliases(): HasMany
    {
        return $this->hasMany(IngredientAlias::class);
    }

    public function indications(): BelongsToMany
    {
        return $this->belongsToMany(ClinicalIndication::class, 'ingredient_clinical_indications')
            ->withPivot(['evidence_level', 'effective_concentration_min', 'target_mechanism'])
            ->withTimestamps();
    }

    public function pubmedStudies(): BelongsToMany
    {
        return $this->belongsToMany(PubMedStudy::class, 'ingredient_pubmed_studies', 'ingredient_id', 'pubmed_study_id')
            ->withPivot(['primary_finding'])
            ->withTimestamps();
    }

    public function conflictsAsA(): HasMany
    {
        return $this->hasMany(IngredientConflict::class, 'ingredient_a_id');
    }

    public function conflictsAsB(): HasMany
    {
        return $this->hasMany(IngredientConflict::class, 'ingredient_b_id');
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_ingredients')
            ->withPivot(['position', 'concentration_percentage', 'is_declared_active'])
            ->withTimestamps();
    }
}
