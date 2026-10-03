<?php

namespace App\Services\Scraper\Contracts;

interface GeocodingServiceInterface
{
    /**
     * Convierte una dirección textual en coordenadas geográficas (latitud, longitud).
     *
     * @param string $address Dirección completa o punto de referencia.
     * @param string|null $city Ciudad para mejorar la precisión.
     * @param string|null $state Estado o provincia.
     * @param string $country País (por defecto 'VE' o 'ES').
     * @return array{latitude: float, longitude: float, display_name: string}|null
     */
    public function geocode(string $address, ?string $city = null, ?string $state = null, string $country = 'VE'): ?array;
}
