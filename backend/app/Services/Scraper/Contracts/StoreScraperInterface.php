<?php

namespace App\Services\Scraper\Contracts;

use App\Services\Scraper\DTOs\ScrapedProductOfferDTO;
use App\Services\Scraper\DTOs\ScrapedStoreBranchDTO;

interface StoreScraperInterface
{
    /**
     * Identificador único del scraper (ej: 'farmatodo', 'locatel', 'shopify_store').
     */
    public function getStoreKey(): string;

    /**
     * Nombre legible de la cadena o tienda.
     */
    public function getStoreName(): string;

    /**
     * Rastrea y devuelve la lista de sucursales físicas (dirección, coordenadas, teléfono, etc.).
     *
     * @param string|null $city Ciudad opcional para filtrar la búsqueda.
     * @return array<ScrapedStoreBranchDTO>
     */
    public function scrapeBranches(?string $city = null): array;

    /**
     * Rastrea y devuelve las ofertas de productos (SKU, nombre, precio, stock, URL).
     *
     * @param string|null $categorySlug Categoría de cosmética/skincare a rastrear.
     * @return array<ScrapedProductOfferDTO>
     */
    public function scrapeProductOffers(?string $categorySlug = null): array;
}
