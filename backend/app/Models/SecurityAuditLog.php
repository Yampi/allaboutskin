<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityAuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'event_type',
        'severity',
        'ip_address',
        'user_agent',
        'resource_target',
        'description',
        'payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to quickly log security events
     */
    public static function logEvent(
        string $eventType,
        string $description,
        ?int $userId = null,
        string $severity = 'INFO',
        ?string $target = null,
        ?array $payload = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): self {
        return self::create([
            'user_id' => $userId ?? (auth()->check() ? auth()->id() : null),
            'event_type' => $eventType,
            'severity' => $severity,
            'ip_address' => $ip ?? request()->ip(),
            'user_agent' => $userAgent ?? substr((string) request()->userAgent(), 0, 500),
            'resource_target' => $target,
            'description' => $description,
            'payload' => $payload,
            'created_at' => now(),
        ]);
    }
}
