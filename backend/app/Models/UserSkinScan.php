<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkinScan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_token',
        'image_url',
        'overall_score',
        'hydration_score',
        'elasticity_score',
        'pores_score',
        'spots_score',
        'fine_lines_score',
        'barrier_status',
        'scan_mode',
        'clinical_summary',
        'recommendations',
    ];

    protected $casts = [
        'overall_score' => 'integer',
        'hydration_score' => 'integer',
        'elasticity_score' => 'integer',
        'pores_score' => 'integer',
        'spots_score' => 'integer',
        'fine_lines_score' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
