<?php

namespace App\Models;

use App\Domain\Auth\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     * Note: 'role' and security attributes are excluded from public mass assignment.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'failed_login_attempts',
        'locked_until',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
        ];
    }

    public function skinProfile(): HasOne
    {
        return $this->hasOne(UserSkinProfile::class);
    }

    public function routineItems(): HasMany
    {
        return $this->hasMany(UserRoutineItem::class);
    }

    public function adherenceLogs(): HasMany
    {
        return $this->hasMany(RoutineAdherenceLog::class);
    }

    public function securityLogs(): HasMany
    {
        return $this->hasMany(SecurityAuditLog::class);
    }

    public function hasRole(UserRole|string $role): bool
    {
        $roleValue = is_string($role) ? $role : $role->value;
        return $this->role?->value === $roleValue;
    }

    public function isAdmin(): bool
    {
        return $this->role?->isAdmin() ?? false;
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }
}
