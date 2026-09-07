<?php
declare(strict_types=1);

namespace App\Domain\Store\Enums;

enum StoreSubscriptionTier: string
{
    case FREE = 'FREE';
    case PRO_LOCAL = 'PRO_LOCAL';
    case ENTERPRISE = 'ENTERPRISE';

    /**
     * Determina si la tienda tiene prioridad de posicionamiento en el directorio y búsqueda.
     */
    public function isFeatured(): bool
    {
        return in_array($this, [self::PRO_LOCAL, self::ENTERPRISE], true);
    }

    /**
     * Límite de sucursales según el nivel de suscripción.
     */
    public function maxBranches(): int
    {
        return match ($this) {
            self::FREE => 1,
            self::PRO_LOCAL => 5,
            self::ENTERPRISE => 100,
        };
    }

    /**
     * Acceso a analítica avanzada de leads y clics.
     */
    public function hasAdvancedAnalytics(): bool
    {
        return in_array($this, [self::PRO_LOCAL, self::ENTERPRISE], true);
    }

    /**
     * Etiqueta amigable para la interfaz de usuario.
     */
    public function label(): string
    {
        return match ($this) {
            self::FREE => 'Plan Gratuito / Básico',
            self::PRO_LOCAL => 'Plan Pro Local Destacado',
            self::ENTERPRISE => 'Plan Cadena / Enterprise',
        };
    }
}
