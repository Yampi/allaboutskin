<?php

namespace App\Policies;

use App\Models\AffiliateStore;
use App\Models\StoreBranch;
use App\Models\User;

class StoreBranchPolicy
{
    /**
     * Super Admin y Admin tienen acceso total.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determina si el usuario puede ver la sucursal.
     */
    public function view(User $user, StoreBranch $branch): bool
    {
        return $branch->store && $branch->store->owner_id === $user->id;
    }

    /**
     * Determina si el usuario puede crear sucursales en la tienda.
     */
    public function create(User $user, AffiliateStore $store): bool
    {
        return $store->owner_id === $user->id;
    }

    /**
     * Determina si el usuario puede actualizar la sucursal.
     */
    public function update(User $user, StoreBranch $branch): bool
    {
        return $branch->store && $branch->store->owner_id === $user->id;
    }

    /**
     * Determina si el usuario puede eliminar la sucursal.
     */
    public function delete(User $user, StoreBranch $branch): bool
    {
        return $branch->store && $branch->store->owner_id === $user->id;
    }
}
