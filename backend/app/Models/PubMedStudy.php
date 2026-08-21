<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class PubMedStudy extends Model
{
    use HasFactory;

    protected $table = 'pubmed_studies';
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'pub_year' => 'integer',
        ];
    }

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'ingredient_pubmed_studies', 'pubmed_study_id', 'ingredient_id')
            ->withPivot(['primary_finding'])
            ->withTimestamps();
    }
}
