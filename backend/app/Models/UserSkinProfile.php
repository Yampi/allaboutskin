<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSkinProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'skin_type',
        'barrier_status',
        'fitzpatrick_type',
        'active_conditions',
        'known_allergens',
        'pregnancy_or_nursing',
    ];

    protected function casts(): array
    {
        return [
            'fitzpatrick_type' => 'integer',
            'active_conditions' => 'encrypted:array',
            'known_allergens' => 'encrypted:array',
            'pregnancy_or_nursing' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
