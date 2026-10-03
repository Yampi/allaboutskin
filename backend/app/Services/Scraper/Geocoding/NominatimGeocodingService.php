<?php

namespace App\Services\Scraper\Geocoding;

use App\Services\Scraper\Contracts\GeocodingServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NominatimGeocodingService implements GeocodingServiceInterface
{
    protected string $baseUrl = 'https://nominatim.openstreetmap.org/search';

    /**
     * Geocodifica una dirección física utilizando OpenStreetMap Nominatim.
     * Incluye caché persistente para respetar políticas de uso y acelerar el scraping.
     */
    public function geocode(string $address, ?string $city = null, ?string $state = null, string $country = 'VE'): ?array
    {
        $queryParts = array_filter([$address, $city, $state, $country]);
        $query = implode(', ', $queryParts);
        $cacheKey = 'geocode_' . md5(mb_strtolower($query));

        return Cache::remember($cacheKey, now()->addDays(30), function () use ($query, $country) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'AllaboutSkin-Scraper/1.0 (contact@allabout.skin)',
                ])
                ->timeout(10)
                ->get($this->baseUrl, [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => strtolower($country),
                ]);

                if ($response->successful() && !empty($response->json())) {
                    $firstResult = $response->json()[0];
                    return [
                        'latitude' => (float) $firstResult['lat'],
                        'longitude' => (float) $firstResult['lon'],
                        'display_name' => $firstResult['display_name'] ?? $query,
                    ];
                }

                Log::warning("Nominatim geocoding empty result for query: {$query}");
                return null;
            } catch (\Throwable $e) {
                Log::error("Geocoding failed for [{$query}]: " . $e->getMessage());
                return null;
            }
        });
    }
}
