<?php

namespace App\Services\Scraper\Connectors\Contracts;

use App\Models\AffiliateStore;
use App\Models\Ingredient;
use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;

interface StoreConnectorInterface
{
    /**
     * Busca productos en la tienda usando su motor nativo (API o búsqueda estructurada).
     *
     * @param AffiliateStore $store
     * @param string $keyword
     * @param Ingredient|null $ingredient
     * @return array<ScrapedProductOfferDTO>
     */
    public function search(AffiliateStore $store, string $keyword, ?Ingredient $ingredient = null): array;
}
