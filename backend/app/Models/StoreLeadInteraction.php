<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreLeadInteraction extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(AffiliateStore::class, 'store_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(StoreBranch::class, 'branch_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Registrar una interacción o lead comercial.
     */
    public static function record(
        int $storeId,
        string $interactionType,
        ?int $branchId = null,
        ?int $userId = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'store_id' => $storeId,
            'branch_id' => $branchId,
            'interaction_type' => $interactionType,
            'user_id' => $userId,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
