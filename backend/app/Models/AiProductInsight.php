<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiProductInsight extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_hash',
        'product_name',
        'brand_name',
        'price',
        'currency',
        'is_physical_applicator',
        'format_type',
        'friction_risk_level',
        'is_rinse_off_required',
        'barrier_warning',
        'plain_language_summary',
        'contraindications',
        'quality_factors',
        'format_quality_score',
        'when_to_use',
        'how_to_use',
        'superior_alternatives',
        'source_type',
        'confidence_score',
        'lookup_count',
        'last_queried_at',
    ];

    protected $casts = [
        'is_physical_applicator' => 'boolean',
        'is_rinse_off_required' => 'boolean',
        'price' => 'decimal:2',
        'format_quality_score' => 'decimal:1',
        'confidence_score' => 'decimal:2',
        'contraindications' => 'array',
        'quality_factors' => 'array',
        'superior_alternatives' => 'array',
        'last_queried_at' => 'datetime',
    ];

    /**
     * Increment search counter to track product demand in the database flywheel.
     */
    public function incrementLookup(): void
    {
        $this->increment('lookup_count');
        $this->update(['last_queried_at' => now()]);
    }
}
