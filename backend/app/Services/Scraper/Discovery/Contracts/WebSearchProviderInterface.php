<?php

namespace App\Services\Scraper\Discovery\Contracts;

interface WebSearchProviderInterface
{
    /**
     * Realiza una búsqueda en la web y devuelve una lista de URLs limpias de resultados orgánicos.
     *
     * @param string $query
     * @param array $options
     * @return array<string>
     */
    public function search(string $query, array $options = []): array;
}
