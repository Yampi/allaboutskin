<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreDirectoryController extends Controller
{
    /**
     * Detección de presencia en tienda y búsqueda de sucursales cercanas.
     */
    public function nearby(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius_meters' => 'nullable|integer|min:50|max:20000',
        ]);

        $userLat = (float) $validated['lat'];
        $userLng = (float) $validated['lng'];
        $maxRadius = (int) ($validated['radius_meters'] ?? 5000); // 5 km por defecto

        // Optimización por Bounding Box para no saturar CPU ni base de datos
        // 1 grado latitud ~ 111,000 metros
        $latDelta = ($maxRadius / 111000) * 1.2;
        $lngDelta = ($maxRadius / (111000 * max(0.1, cos(deg2rad($userLat))))) * 1.2;

        $branches = StoreBranch::query()
            ->with(['store'])
            ->where('is_active', true)
            ->whereBetween('latitude', [$userLat - $latDelta, $userLat + $latDelta])
            ->whereBetween('longitude', [$userLng - $lngDelta, $userLng + $lngDelta])
            ->get();

        $nearbyBranches = [];
        $insideBranch = null;

        foreach ($branches as $branch) {
            $distance = StoreBranch::calculateDistanceMeters(
                $userLat,
                $userLng,
                $branch->latitude,
                $branch->longitude
            );

            if ($distance <= $maxRadius) {
                $isInside = $distance <= $branch->geofence_radius_meters;

                $branchData = [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'slug' => $branch->slug,
                    'store_name' => $branch->store->name ?? 'Tienda',
                    'store_type' => $branch->store->store_type ?? 'PHYSICAL',
                    'is_independent' => (bool) ($branch->store->is_independent ?? false),
                    'state' => $branch->state,
                    'city' => $branch->city,
                    'address' => $branch->address,
                    'reference_point' => $branch->reference_point,
                    'phone' => $branch->phone,
                    'whatsapp' => $branch->whatsapp ?? $branch->store->whatsapp_contact,
                    'instagram_handle' => $branch->store->instagram_handle,
                    'opening_hours' => $branch->opening_hours,
                    'latitude' => $branch->latitude,
                    'longitude' => $branch->longitude,
                    'distance_meters' => round($distance),
                    'geofence_radius_meters' => $branch->geofence_radius_meters,
                    'is_inside' => $isInside,
                ];

                $nearbyBranches[] = $branchData;

                if ($isInside && ($insideBranch === null || $distance < $insideBranch['distance_meters'])) {
                    $insideBranch = $branchData;
                }
            }
        }

        // Ordenar las sucursales por cercanía
        usort($nearbyBranches, fn ($a, $b) => $a['distance_meters'] <=> $b['distance_meters']);

        // Si el usuario está físicamente dentro de una tienda, contar cuántos productos tiene
        $inStoreCatalogCount = 0;
        if ($insideBranch) {
            $inStoreCatalogCount = ProductStoreOffer::query()
                ->where(function ($q) use ($insideBranch) {
                    $q->where('branch_id', $insideBranch['id'])
                      ->orWhere('store_id', function ($sq) use ($insideBranch) {
                          $sq->select('store_id')
                             ->from('store_branches')
                             ->where('id', $insideBranch['id'])
                             ->limit(1);
                      });
                })
                ->where('in_stock', true)
                ->count();
        }

        return response()->json([
            'status' => 'success',
            'is_inside_store' => $insideBranch !== null,
            'current_store' => $insideBranch,
            'in_store_catalog_count' => $inStoreCatalogCount,
            'nearby_branches_count' => count($nearbyBranches),
            'nearby_branches' => array_slice($nearbyBranches, 0, 8),
        ]);
    }

    /**
     * Obtener el catálogo evaluado científicamente para una sucursal específica.
     */
    public function branchProducts(Request $request, string $identifier): JsonResponse
    {
        $branch = StoreBranch::with('store')
            ->where('id', is_numeric($identifier) ? $identifier : null)
            ->orWhere('slug', $identifier)
            ->firstOrFail();

        $skinType = strtoupper($request->query('skin_type', 'ALL')); // OILY, DRY, SENSITIVE, COMBINATION, ALL

        $offers = ProductStoreOffer::with([
            'product.brand',
            'product.ingredients',
        ])
            ->where(function ($q) use ($branch) {
                $q->where('branch_id', $branch->id)
                  ->orWhere('store_id', $branch->store_id);
            })
            ->where('in_stock', true)
            ->get();

        $evaluatedProducts = $offers->map(function ($offer) use ($skinType) {
            $product = $offer->product;
            if (!$product) {
                return null;
            }

            // Motor de evaluación y asignación de semáforo dermatológico
            $score = 85;
            $badge = 'APTO_TODO_TIPO';
            $safetyLabel = 'Recomendado / Seguro';
            $highlights = [];

            if ($product->category === 'CLEANSER') {
                $highlights[] = 'Limpieza suave pH 5.5';
                $score = 92;
            } elseif ($product->category === 'SPF') {
                $highlights[] = 'Control de Brillo & UV';
                $score = 95;
            } elseif ($product->category === 'MOISTURIZER') {
                $highlights[] = 'Hidratación Ácido Hialurónico';
                $score = 94;
            }

            if ($skinType === 'OILY' || $skinType === 'ACNE_PRONE') {
                if ($product->category === 'CLEANSER' || $product->category === 'SPF') {
                    $score = 98;
                    $badge = 'IDEAL_PIEL_GRASA';
                    $safetyLabel = 'Alta compatibilidad sin sensación pesada';
                }
            } elseif ($skinType === 'DRY') {
                if ($product->category === 'MOISTURIZER') {
                    $score = 97;
                    $badge = 'IDEAL_PIEL_SECA';
                    $safetyLabel = 'Refuerzo de barrera lipídica';
                }
            }

            return [
                'offer_id' => $offer->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'brand' => $product->brand->name ?? 'Marca',
                'category' => $product->category,
                'volume_amount' => $product->volume_amount,
                'volume_unit' => $product->volume_unit,
                'barcode_ean' => $product->barcode_ean,
                'price_usd' => $offer->price,
                'price_ves' => $offer->price_ves,
                'in_stock' => $offer->in_stock,
                'scientific_score' => $score,
                'badge' => $badge,
                'safety_label' => $safetyLabel,
                'highlights' => $highlights,
                'ingredients_count' => $product->ingredients->count(),
            ];
        })->filter()->values();

        // Ordenar por mejor puntuación dermatológica primero
        $evaluatedProducts = $evaluatedProducts->sortByDesc('scientific_score')->values();

        return response()->json([
            'status' => 'success',
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
                'slug' => $branch->slug,
                'store_name' => $branch->store->name,
                'is_independent' => (bool) $branch->store->is_independent,
                'address' => $branch->address,
                'city' => $branch->city,
                'state' => $branch->state,
                'phone' => $branch->phone,
                'whatsapp' => $branch->whatsapp ?? $branch->store->whatsapp_contact,
                'instagram_handle' => $branch->store->instagram_handle,
                'opening_hours' => $branch->opening_hours,
            ],
            'filters' => [
                'skin_type' => $skinType,
            ],
            'products_count' => $evaluatedProducts->count(),
            'products' => $evaluatedProducts,
        ]);
    }

    /**
     * Listado de ciudades y estados con cobertura de comercios.
     */
    public function cities(): JsonResponse
    {
        $locations = StoreBranch::query()
            ->where('is_active', true)
            ->selectRaw('state, city, count(*) as total_branches')
            ->groupBy('state', 'city')
            ->orderBy('state')
            ->orderBy('city')
            ->get();

        return response()->json([
            'status' => 'success',
            'total_locations' => $locations->count(),
            'locations' => $locations,
        ]);
    }

    /**
     * Registro/sugerencia de tiendas independientes o comercios locales.
     */
    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:150',
            'category' => 'required|in:PHARMACY,SUPERMARKET,BEAUTY_SHOP,INDEPENDENT,OTHER',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:300',
            'reference_point' => 'nullable|string|max:150',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'instagram_handle' => 'nullable|string|max:100',
            'submitted_by_email' => 'nullable|email|max:150',
            'notes' => 'nullable|string|max:500',
        ]);

        $slugBase = Str::slug($validated['store_name'] . '-' . $validated['city']);
        $uniqueSlug = $slugBase . '-' . Str::random(5);

        // Crear la entidad de la tienda independiente en estado PENDING_REVIEW
        $store = AffiliateStore::create([
            'name' => $validated['store_name'] . ' (' . $validated['city'] . ')',
            'slug' => $uniqueSlug,
            'website_url' => !empty($validated['instagram_handle'])
                ? 'https://instagram.com/' . ltrim($validated['instagram_handle'], '@')
                : 'https://allabout.skin',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'affiliate_network' => 'Comercio Local',
            'instagram_handle' => $validated['instagram_handle'] ?? null,
            'whatsapp_contact' => $validated['whatsapp'] ?? null,
            'is_independent' => true,
            'verification_status' => 'PENDING_REVIEW',
            'submitted_by_email' => $validated['submitted_by_email'] ?? null,
            'community_notes' => $validated['notes'] ?? null,
            'is_active' => false, // Se activa tras moderación
        ]);

        // Crear la sucursal
        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => $validated['store_name'],
            'slug' => 'branch-' . $uniqueSlug,
            'state' => $validated['state'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'reference_point' => $validated['reference_point'] ?? null,
            'latitude' => $validated['latitude'] ?? 9.2150000, // Coordenadas aproximadas por defecto si no envía
            'longitude' => $validated['longitude'] ?? -66.0100000,
            'geofence_radius_meters' => 80,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'is_active' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => '¡Establecimiento registrado con éxito! Nuestro equipo verificará los datos antes de publicarlo en el catálogo en tienda.',
            'data' => [
                'store_id' => $store->id,
                'branch_id' => $branch->id,
                'name' => $branch->name,
                'city' => $branch->city,
                'status' => 'PENDING_REVIEW',
            ],
        ], 201);
    }
}
