<?php

namespace App\Policies;

use App\Models\AffiliateStore;
use App\Models\User;

class AffiliateStorePolicy
{
    /**
     * Super Admin y Admin tienen acceso total a cualquier tienda.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determina si el usuario puede ver la administración de la tienda.
     */
    public function view(User $user, AffiliateStore $store): bool
    {
        return $store->owner_id === $user->id;
    }

    /**
     * Determina si el usuario puede actualizar la tienda.
     */
    public function update(User $user, AffiliateStore $store): bool
    {
        return $store->owner_id === $user->id;
    }

    /**
     * Solo los administradores pueden eliminar una tienda de la plataforma.
     */
    public function delete(User $user, AffiliateStore $store): bool
    {
        return false;
    }
}
