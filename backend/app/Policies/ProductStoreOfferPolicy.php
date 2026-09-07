<?php

namespace App\Policies;

use App\Models\AffiliateStore;
use App\Models\ProductStoreOffer;
use App\Models\User;

class ProductStoreOfferPolicy
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
     * Determina si el usuario puede crear ofertas para su tienda.
     */
    public function create(User $user, AffiliateStore $store): bool
    {
        return $store->owner_id === $user->id;
    }

    /**
     * Determina si el usuario puede actualizar o eliminar la oferta.
     */
    public function manage(User $user, ProductStoreOffer $offer): bool
    {
        return $offer->store && $offer->store->owner_id === $user->id;
    }
}
