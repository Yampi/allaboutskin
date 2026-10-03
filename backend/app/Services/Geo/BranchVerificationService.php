<?php

namespace App\Services\Geo;

use App\Models\StoreBranch;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BranchVerificationService
{
    /**
     * Bounding Boxes y Centroides precalculados de las principales ciudades de Venezuela
     * Formato: [lat_min, lat_max, lon_min, lon_max, center_lat, center_lon, max_radius_km]
     */
    protected array $knownCityBounds = [
        'valle de la pascua' => [9.1750, 9.2550, -66.0500, -65.9600, 9.2139, -66.0065, 12],
        'caracas' => [10.4200, 10.5500, -67.0500, -66.7800, 10.4806, -66.9036, 30],
        'maracay' => [10.1800, 10.3200, -67.6500, -67.5300, 10.2469, -67.5958, 18],
        'valencia' => [10.1200, 10.2800, -68.0800, -67.9200, 10.1620, -68.0077, 22],
        'barquisimeto' => [10.0200, 10.1400, -69.4200, -69.2400, 10.0678, -69.3474, 20],
        'maracaibo' => [10.5500, 10.7500, -71.7200, -71.5800, 10.6427, -71.6125, 25],
        'san juan de los morros' => [9.8500, 9.9600, -67.4000, -67.3000, 9.9115, -67.3538, 12],
        'puerto la cruz' => [10.1500, 10.2500, -64.6800, -64.5800, 10.2138, -64.6328, 15],
        'barcelona' => [10.0800, 10.1900, -64.7400, -64.6500, 10.1362, -64.6862, 15],
        'maturin' => [9.6800, 9.8000, -63.2400, -63.1200, 9.7457, -63.1832, 16],
        'san cristobal' => [7.7200, 7.8200, -72.2600, -72.1800, 7.7669, -72.2250, 15],
        'merida' => [8.5500, 8.6500, -71.2000, -71.1000, 8.5983, -71.1449, 12],
    ];

    /**
     * Verifica la existencia y precisión geográfica de una sucursal física.
     */
    public function verifyBranch(StoreBranch $branch): array
    {
        $storeName = $branch->store?->name ?? 'Tienda';
        $city = trim($branch->city);
        $state = trim($branch->state);
        $currentLat = (float) $branch->latitude;
        $currentLng = (float) $branch->longitude;

        // 1. Obtener los límites geográficos de la ciudad declarada
        $cityBounds = $this->getCityBounds($city, $state);

        if (!$cityBounds) {
            return [
                'is_valid' => false,
                'status' => 'UNKNOWN_CITY',
                'confidence' => 0.0,
                'reason' => "No se pudieron resolver los límites territoriales para la ciudad '{$city}'.",
            ];
        }

        // 2. Comprobar si las coordenadas actuales caen dentro de la ciudad declarada
        $isInsideCity = $this->isWithinBounds($currentLat, $currentLng, $cityBounds);
        $distToCityCenter = $this->distanceKm($currentLat, $currentLng, $cityBounds['center_lat'], $cityBounds['center_lon']);

        // 3. Consultar fuentes autorizadas (Google Places si hay API Key, u OpenStreetMap / Nominatim)
        $googleKey = config('services.google.maps_api_key') ?? env('GOOGLE_MAPS_API_KEY');
        
        if (!empty($googleKey)) {
            $googleResult = $this->queryGooglePlaces($storeName, $city, $state, $googleKey, $cityBounds);
            if ($googleResult) {
                return $this->evaluateProviderResult($branch, $googleResult, $cityBounds, $isInsideCity, $distToCityCenter, 'GOOGLE_PLACES');
            }
        }

        // Consulta en OpenStreetMap / Nominatim
        $osmResult = $this->queryOpenStreetMap($storeName, $branch->name, $city, $state, $cityBounds);
        if ($osmResult) {
            return $this->evaluateProviderResult($branch, $osmResult, $cityBounds, $isInsideCity, $distToCityCenter, 'OPENSTREETMAP');
        }

        // 4. Si los buscadores no devuelven un POI exacto pero las coordenadas actuales caen dentro del perímetro de la ciudad:
        if ($isInsideCity && $distToCityCenter <= $cityBounds['max_radius_km']) {
            return [
                'is_valid' => true,
                'status' => 'SPATIAL_VALID_UNCONFIRMED_POI',
                'confidence' => 0.70,
                'suggested_lat' => $currentLat,
                'suggested_lng' => $currentLng,
                'suggested_address' => $branch->address,
                'provider' => 'SPATIAL_BOUNDS',
                'distance_to_center_km' => round($distToCityCenter, 2),
                'reason' => "Las coordenadas actuales ({$currentLat}, {$currentLng}) están dentro del polígono urbano de {$city} ({$distToCityCenter} km del centro).",
            ];
        }

        // 5. Las coordenadas caen fuera de la ciudad o la tienda no existe
        return [
            'is_valid' => false,
            'status' => 'NOT_FOUND_OR_OUTSIDE_CITY',
            'confidence' => 0.10,
            'distance_to_center_km' => round($distToCityCenter, 2),
            'reason' => "La sucursal '{$branch->name}' no pudo ser validada en {$city}. Las coordenadas registradas están a {$distToCityCenter} km del centro de la ciudad (límite: {$cityBounds['max_radius_km']} km).",
        ];
    }

    /**
     * Evalúa el resultado retornado por un proveedor autorizado (Google o OSM).
     */
    protected function evaluateProviderResult(
        StoreBranch $branch,
        array $providerData,
        array $cityBounds,
        bool $currentIsInside,
        float $currentDistCenter,
        string $provider
    ): array {
        $foundLat = (float) $providerData['latitude'];
        $foundLng = (float) $providerData['longitude'];
        $distToCityCenter = $this->distanceKm($foundLat, $foundLng, $cityBounds['center_lat'], $cityBounds['center_lon']);

        // Si el resultado de búsqueda está fuera del radio de la ciudad, es un falso positivo (ej: encontró una tienda en otra ciudad)
        if ($distToCityCenter > $cityBounds['max_radius_km']) {
            return [
                'is_valid' => false,
                'status' => 'MATCH_OUTSIDE_CITY',
                'confidence' => 0.2,
                'provider' => $provider,
                'reason' => "El proveedor encontró una coincidencia pero está a {$distToCityCenter} km de {$branch->city}, fuera del límite urbano.",
            ];
        }

        // Comprobar si la sucursal actual tiene una discrepancia notable en coordenadas con el punto oficial (> 300 metros)
        $distBetweenRegisteredAndFound = $this->distanceKm((float) $branch->latitude, (float) $branch->longitude, $foundLat, $foundLng) * 1000;
        $needsCorrection = $distBetweenRegisteredAndFound > 300;

        return [
            'is_valid' => true,
            'status' => $needsCorrection ? 'NEEDS_COORDINATE_CORRECTION' : 'VERIFIED_CANONICAL',
            'confidence' => 0.95,
            'suggested_lat' => $foundLat,
            'suggested_lng' => $foundLng,
            'suggested_address' => $providerData['formatted_address'] ?? $branch->address,
            'external_place_id' => $providerData['place_id'] ?? null,
            'provider' => $provider,
            'distance_between_meters' => round($distBetweenRegisteredAndFound),
            'reason' => $needsCorrection
                ? "Se localizó el punto oficial verificado a {$distBetweenRegisteredAndFound}m de la posición registrada. Se sugiere corregir."
                : "Ubicación verificada canónicamente por {$provider}.",
        ];
    }

    /**
     * Consulta Google Places Text Search.
     */
    protected function queryGooglePlaces(string $storeName, string $city, string $state, string $apiKey, array $bounds): ?array
    {
        $query = "{$storeName} en {$city}, {$state}, Venezuela";
        $cacheKey = 'gp_' . md5($query);

        return Cache::remember($cacheKey, now()->addDays(15), function () use ($query, $apiKey, $bounds) {
            try {
                $response = Http::timeout(10)->get('https://maps.googleapis.com/maps/api/place/textsearch/json', [
                    'query' => $query,
                    'location' => "{$bounds['center_lat']},{$bounds['center_lon']}",
                    'radius' => ($bounds['max_radius_km'] * 1000),
                    'key' => $apiKey,
                ]);

                if (!$response->successful()) {
                    return null;
                }

                $json = $response->json();
                $candidates = $json['results'] ?? [];

                if (empty($candidates)) {
                    return null;
                }

                $best = $candidates[0];

                // Verificar si está cerrado permanentemente
                if (($best['business_status'] ?? '') === 'CLOSED_PERMANENTLY') {
                    return null;
                }

                return [
                    'name' => $best['name'] ?? '',
                    'formatted_address' => $best['formatted_address'] ?? '',
                    'latitude' => (float) ($best['geometry']['location']['lat'] ?? 0),
                    'longitude' => (float) ($best['geometry']['location']['lng'] ?? 0),
                    'place_id' => $best['place_id'] ?? null,
                ];
            } catch (\Throwable $e) {
                Log::warning("[BranchVerificationService] Google Places error: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Consulta Nominatim / OpenStreetMap.
     */
    protected function queryOpenStreetMap(string $storeName, string $branchName, string $city, string $state, array $bounds): ?array
    {
        // Buscar con término limpio
        $query = "{$storeName} {$city} Venezuela";
        $cacheKey = 'osm_branch_' . md5($query);

        return Cache::remember($cacheKey, now()->addDays(15), function () use ($query, $bounds) {
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'AllaboutSkin-Validator/1.0 (contact@allabout.skin)',
                ])
                ->timeout(10)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => 3,
                    'countrycodes' => 've',
                ]);

                if (!$response->successful() || empty($response->json())) {
                    return null;
                }

                foreach ($response->json() as $result) {
                    $lat = (float) $result['lat'];
                    $lon = (float) $result['lon'];

                    // Comprobar que esté dentro de los límites de la ciudad
                    if ($this->isWithinBounds($lat, $lon, $bounds)) {
                        return [
                            'name' => $result['display_name'] ?? '',
                            'formatted_address' => $result['display_name'] ?? '',
                            'latitude' => $lat,
                            'longitude' => $lon,
                            'place_id' => 'osm_' . ($result['osm_id'] ?? uniqid()),
                        ];
                    }
                }

                return null;
            } catch (\Throwable $e) {
                Log::warning("[BranchVerificationService] OSM search error: " . $e->getMessage());
                return null;
            }
        });
    }

    /**
     * Obtiene los límites territoriales y centroide de una ciudad.
     */
    public function getCityBounds(string $city, ?string $state = null): ?array
    {
        $normalizedCity = mb_strtolower(trim($city));

        if (isset($this->knownCityBounds[$normalizedCity])) {
            $b = $this->knownCityBounds[$normalizedCity];
            return [
                'lat_min' => $b[0],
                'lat_max' => $b[1],
                'lon_min' => $b[2],
                'lon_max' => $b[3],
                'center_lat' => $b[4],
                'center_lon' => $b[5],
                'max_radius_km' => $b[6],
            ];
        }

        // Si no está precalculada, consultar Nominatim y cachear
        $cacheKey = 'city_bounds_' . md5("{$city}_{$state}");
        return Cache::remember($cacheKey, now()->addDays(60), function () use ($city, $state) {
            try {
                $query = "{$city}, Venezuela";
                $response = Http::withHeaders([
                    'User-Agent' => 'AllaboutSkin-Validator/1.0 (contact@allabout.skin)',
                ])
                ->timeout(10)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $query,
                    'format' => 'json',
                    'limit' => 1,
                    'countrycodes' => 've',
                ]);

                if (!$response->successful() || empty($response->json())) {
                    return null;
                }

                $data = $response->json()[0];
                $bb = $data['boundingbox'] ?? null;

                if (!$bb || count($bb) < 4) {
                    return null;
                }

                $latMin = (float) $bb[0];
                $latMax = (float) $bb[1];
                $lonMin = (float) $bb[2];
                $lonMax = (float) $bb[3];
                $centerLat = (float) $data['lat'];
                $centerLon = (float) $data['lon'];

                return [
                    'lat_min' => $latMin,
                    'lat_max' => $latMax,
                    'lon_min' => $lonMin,
                    'lon_max' => $lonMax,
                    'center_lat' => $centerLat,
                    'center_lon' => $centerLon,
                    'max_radius_km' => 15.0,
                ];
            } catch (\Throwable $e) {
                return null;
            }
        });
    }

    /**
     * Verifica si una coordenada cae dentro de un bounding box.
     */
    public function isWithinBounds(float $lat, float $lng, array $bounds): bool
    {
        return $lat >= $bounds['lat_min']
            && $lat <= $bounds['lat_max']
            && $lng >= $bounds['lon_min']
            && $lng <= $bounds['lon_max'];
    }

    /**
     * Distancia Haversine en kilómetros.
     */
    public function distanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadiusKm * $c;
    }
}
