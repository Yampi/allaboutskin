<?php

namespace App\Domain\Auth\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case ADMIN = 'admin';
    case SCIENTIFIC_EDITOR = 'scientific_editor';
    case BUSINESS_OWNER = 'business_owner';
    case PREMIUM_USER = 'premium_user';
    case STANDARD_USER = 'standard_user';

    /**
     * Check if role has administrative privileges
     */
    public function isAdmin(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN], true);
    }

    /**
     * Check if role has business / merchant privileges
     */
    public function isBusiness(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN, self::BUSINESS_OWNER], true);
    }

    /**
     * Check if role can manage scientific and catalog content
     */
    public function canManageContent(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN, self::SCIENTIFIC_EDITOR], true);
    }

    /**
     * Check if role has access to premium AI & advanced tools
     */
    public function hasPremiumAccess(): bool
    {
        return in_array($this, [self::SUPER_ADMIN, self::ADMIN, self::SCIENTIFIC_EDITOR, self::PREMIUM_USER], true);
    }

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN => 'Super Administrador',
            self::ADMIN => 'Administrador',
            self::SCIENTIFIC_EDITOR => 'Editor Científico / Dermatólogo',
            self::BUSINESS_OWNER => 'Comercio / Tienda Asociada',
            self::PREMIUM_USER => 'Usuario Premium',
            self::STANDARD_USER => 'Usuario Estándar',
        };
    }
}
