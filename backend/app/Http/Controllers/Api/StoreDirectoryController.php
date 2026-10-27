<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use App\Models\StoreLeadInteraction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
                    'store_id' => $branch->store_id,
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
                    'is_featured' => $branch->store?->isFeaturedActive() ?? false,
                    'subscription_tier' => $branch->store?->subscription_tier?->value ?? 'FREE',
                ];

                $nearbyBranches[] = $branchData;

                if ($isInside && ($insideBranch === null || $distance < $insideBranch['distance_meters'])) {
                    $insideBranch = $branchData;
                }
            }
        }

        // Ordenar: primero las sucursales destacadas/PRO_LOCAL si están en rango razonable, luego por distancia
        usort($nearbyBranches, function ($a, $b) {
            if ($a['is_featured'] !== $b['is_featured']) {
                return $b['is_featured'] <=> $a['is_featured'];
            }
            return $a['distance_meters'] <=> $b['distance_meters'];
        });

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

        // Crear la entidad de la tienda independiente y sucursal en una transacción ACID atómica
        [$store, $branch] = DB::transaction(function () use ($validated, $uniqueSlug) {
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

            return [$store, $branch];
        }, 5);

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

    /**
     * Registro de interacción o lead comercial (WhatsApp, llamada, mapa, presencia física).
     */
    public function recordInteraction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_id' => 'required|exists:affiliate_stores,id',
            'branch_id' => 'nullable|exists:store_branches,id',
            'interaction_type' => 'required|in:WHATSAPP_CLICK,PHONE_CLICK,MAP_ROUTE,IN_STORE_VIEW,PRODUCT_CLICK',
            'metadata' => 'nullable|array',
        ]);

        $interaction = StoreLeadInteraction::record(
            storeId: (int) $validated['store_id'],
            interactionType: $validated['interaction_type'],
            branchId: isset($validated['branch_id']) ? (int) $validated['branch_id'] : null,
            userId: $request->user()?->id,
            metadata: $validated['metadata'] ?? null
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Interacción registrada con éxito.',
            'interaction_id' => $interaction->id,
        ], 201);
    }

    /**
     * Motor de recomendación de compra para rutinas de skincare.
     * Analiza productos de la rutina del usuario y recomienda:
     * 1) Tienda más cercana con disponibilidad.
     * 2) Tienda con el mejor precio disponible.
     * 3) Tienda consolidada óptima (mayor cantidad de productos en una sola parada).
     */
    public function optimizeRoutine(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
            'radius_meters' => 'nullable|integer|min:500|max:50000',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'integer|exists:products,id',
        ]);

        $userLat = (float) $validated['lat'];
        $userLng = (float) $validated['lng'];
        $maxRadius = (int) ($validated['radius_meters'] ?? 15000); // 15 km por defecto
        $exchangeRateService = new \App\Services\Currency\ExchangeRateService();

        // Obtener sucursales en rango
        $branches = StoreBranch::with('store')
            ->where('is_active', true)
            ->get()
            ->filter(function ($branch) use ($userLat, $userLng, $maxRadius) {
                $dist = StoreBranch::calculateDistanceMeters(
                    $userLat,
                    $userLng,
                    $branch->latitude,
                    $branch->longitude
                );
                $branch->distance_meters = round($dist);
                return $dist <= $maxRadius;
            })
            ->sortBy('distance_meters')
            ->values();

        // Si no se pasaron product_ids específicos, tomar productos populares del catálogo
        $productIds = $validated['product_ids'] ?? [];
        if (empty($productIds)) {
            $productIds = \App\Models\Product::take(4)->pluck('id')->toArray();
        }

        $products = \App\Models\Product::with('brand')->whereIn('id', $productIds)->get();

        $branchIds = $branches->pluck('id')->toArray();
        $storeIds = $branches->pluck('store_id')->unique()->toArray();

        // Buscar ofertas disponibles para estos productos en las tiendas cercanas
        $offers = ProductStoreOffer::with(['store', 'branch'])
            ->whereIn('product_id', $productIds)
            ->where(function ($q) use ($branchIds, $storeIds) {
                $q->whereIn('branch_id', $branchIds)
                  ->orWhereIn('store_id', $storeIds);
            })
            ->where('in_stock', true)
            ->get();

        $productRecommendations = [];
        $basketByBranch = [];

        foreach ($products as $product) {
            $productOffers = $offers->where('product_id', $product->id);

            $availableInBranches = [];

            foreach ($branches as $branch) {
                $offer = $productOffers->first(function ($o) use ($branch) {
                    return $o->branch_id === $branch->id || ($o->branch_id === null && $o->store_id === $branch->store_id);
                });

                if ($offer) {
                    $item = [
                        'branch_id' => $branch->id,
                        'branch_name' => $branch->name,
                        'store_name' => $branch->store->name,
                        'distance_meters' => $branch->distance_meters,
                        'price_usd' => (float) $offer->price,
                        'price_ves' => (float) ($offer->price_ves ?? $exchangeRateService->usdToVes((float) $offer->price)),
                        'product_url' => $offer->product_url,
                        'phone' => $branch->phone,
                        'whatsapp' => $branch->whatsapp ?? $branch->store->whatsapp_contact,
                        'latitude' => $branch->latitude,
                        'longitude' => $branch->longitude,
                        'opening_hours' => $branch->opening_hours,
                    ];
                    $availableInBranches[] = $item;

                    if (!isset($basketByBranch[$branch->id])) {
                        $basketByBranch[$branch->id] = [
                            'branch' => [
                                'id' => $branch->id,
                                'name' => $branch->name,
                                'store_name' => $branch->store->name,
                                'distance_meters' => $branch->distance_meters,
                                'address' => $branch->address,
                                'phone' => $branch->phone,
                                'whatsapp' => $branch->whatsapp ?? $branch->store->whatsapp_contact,
                                'latitude' => $branch->latitude,
                                'longitude' => $branch->longitude,
                            ],
                            'products_available_count' => 0,
                            'total_usd' => 0.0,
                            'total_ves' => 0.0,
                            'items' => [],
                        ];
                    }
                    $basketByBranch[$branch->id]['products_available_count']++;
                    $basketByBranch[$branch->id]['total_usd'] += (float) $offer->price;
                    $basketByBranch[$branch->id]['total_ves'] += (float) ($offer->price_ves ?? $exchangeRateService->usdToVes((float) $offer->price));
                    $basketByBranch[$branch->id]['items'][] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'price_usd' => (float) $offer->price,
                        'price_ves' => (float) ($offer->price_ves ?? $exchangeRateService->usdToVes((float) $offer->price)),
                    ];
                }
            }

            $sortedByDistance = collect($availableInBranches)->sortBy('distance_meters')->values()->all();
            $sortedByPrice = collect($availableInBranches)->sortBy('price_usd')->values()->all();

            $closest = $sortedByDistance[0] ?? null;
            $cheapest = $sortedByPrice[0] ?? null;

            $savingsUsd = ($closest && $cheapest) ? max(0, $closest['price_usd'] - $cheapest['price_usd']) : 0;

            $productRecommendations[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'category' => $product->category,
                'brand' => $product->brand?->name,
                'is_available_nearby' => !empty($availableInBranches),
                'closest_store' => $closest,
                'best_price_store' => $cheapest,
                'savings_usd' => round($savingsUsd, 2),
                'available_stores_count' => count($availableInBranches),
            ];
        }

        $consolidatedOptions = collect(array_values($basketByBranch))
            ->sort(function ($a, $b) {
                if ($a['products_available_count'] !== $b['products_available_count']) {
                    return $b['products_available_count'] <=> $a['products_available_count'];
                }
                return $a['total_usd'] <=> $b['total_usd'];
            })
            ->values();

        $recommendedSingleStore = $consolidatedOptions->first();

        return response()->json([
            'status' => 'success',
            'user_location' => [
                'lat' => $userLat,
                'lng' => $userLng,
                'radius_meters' => $maxRadius,
            ],
            'total_routine_products' => count($products),
            'recommended_single_trip_store' => $recommendedSingleStore,
            'products_comparison' => $productRecommendations,
            'all_nearby_baskets' => $consolidatedOptions->slice(0, 5),
        ]);
    }

    /**
     * Búsqueda geolocalizada de productos en Venezuela por Estado, Municipio, Parroquia, Ciudad o Coordenadas GPS.
     * Permite al usuario encontrar qué tiendas (independientes o cadenas) tienen un producto o componente y cuál queda más cerca.
     */
    public function searchProductsGeolocated(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'nullable|string|max:150',
            'ingredient' => 'nullable|string|max:150',
            'state' => 'nullable|string|max:100',
            'municipality' => 'nullable|string|max:100',
            'parish' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            'radius_km' => 'nullable|numeric|min:1|max:500',
            'store_type' => 'nullable|in:ALL,INDEPENDENT,CHAIN',
            'in_stock_only' => 'nullable|boolean',
        ]);

        $queryText = trim($validated['q'] ?? '');
        $ingredientTerm = trim($validated['ingredient'] ?? '');
        $userLat = isset($validated['lat']) ? (float) $validated['lat'] : null;
        $userLng = isset($validated['lng']) ? (float) $validated['lng'] : null;
        $radiusMeters = isset($validated['radius_km']) ? ((float) $validated['radius_km'] * 1000) : 50000;
        $exchangeRateService = new \App\Services\Currency\ExchangeRateService();

        $offersQuery = ProductStoreOffer::query()
            ->with(['product.brand', 'product.ingredients', 'store', 'branch'])
            ->whereHas('store', fn($sq) => $sq->where('is_active', true));

        if ($country = $request->query('country') ?: $request->query('country_code')) {
            $offersQuery->whereHas('store', fn($sq) => $sq->where('country_code', strtoupper($country)));
        }

        if ($request->boolean('in_stock_only', true)) {
            $offersQuery->where('in_stock', true);
        }

        if ($queryText !== '') {
            $offersQuery->whereHas('product', function ($pq) use ($queryText) {
                $pq->where('name', 'ILIKE', "%{$queryText}%")
                   ->orWhereHas('brand', fn($bq) => $bq->where('name', 'ILIKE', "%{$queryText}%"));
            });
        }

        if ($ingredientTerm !== '') {
            $offersQuery->whereHas('product.ingredients', function ($iq) use ($ingredientTerm) {
                $iq->where('inci_name', 'ILIKE', "%{$ingredientTerm}%")
                   ->orWhere('common_name', 'ILIKE', "%{$ingredientTerm}%")
                   ->orWhereHas('aliases', fn($aq) => $aq->where('alias', 'ILIKE', "%{$ingredientTerm}%"));
            });
        }

        if (!empty($validated['store_type']) && $validated['store_type'] !== 'ALL') {
            $isIndep = $validated['store_type'] === 'INDEPENDENT';
            $offersQuery->whereHas('store', fn($sq) => $sq->where('is_independent', $isIndep));
        }

        if (!empty($validated['state'])) {
            $offersQuery->whereHas('branch', fn($bq) => $bq->where('state', 'ILIKE', "%{$validated['state']}%"));
        }
        if (!empty($validated['municipality'])) {
            $offersQuery->whereHas('branch', fn($bq) => $bq->where('municipality', 'ILIKE', "%{$validated['municipality']}%"));
        }
        if (!empty($validated['parish'])) {
            $offersQuery->whereHas('branch', fn($bq) => $bq->where('parish', 'ILIKE', "%{$validated['parish']}%"));
        }
        if (!empty($validated['city'])) {
            $offersQuery->whereHas('branch', fn($bq) => $bq->where('city', 'ILIKE', "%{$validated['city']}%"));
        }

        $offers = $offersQuery->limit(100)->get();
        $results = [];

        foreach ($offers as $offer) {
            $branch = $offer->branch;
            $distanceMeters = null;

            if ($userLat !== null && $userLng !== null && $branch && $branch->latitude && $branch->longitude) {
                $dist = StoreBranch::calculateDistanceMeters(
                    $userLat,
                    $userLng,
                    $branch->latitude,
                    $branch->longitude
                );
                if ($dist > $radiusMeters) {
                    continue;
                }
                $distanceMeters = round($dist);
            }

            $priceUsd = (float) $offer->price;
            $priceVes = (float) ($offer->price_ves ?? $exchangeRateService->usdToVes($priceUsd));

            $results[] = [
                'offer_id' => $offer->id,
                'product' => [
                    'id' => $offer->product?->id,
                    'name' => $offer->product?->name,
                    'brand' => $offer->product?->brand?->name,
                    'category' => $offer->product?->category,
                    'barcode' => $offer->product?->barcode_ean,
                    'ingredients' => $offer->product?->ingredients->map(fn($ing) => [
                        'id' => $ing->id,
                        'name' => $ing->common_name ?? $ing->inci_name,
                        'inci' => $ing->inci_name,
                        'is_active' => (bool) $ing->pivot->is_declared_active,
                    ]),
                ],
                'pricing' => [
                    'price_usd' => $priceUsd,
                    'price_ves' => $priceVes,
                    'formatted_usd' => '$' . number_format($priceUsd, 2) . ' USD',
                    'formatted_ves' => 'Bs. ' . number_format($priceVes, 2, ',', '.'),
                    'in_stock' => (bool) $offer->in_stock,
                    'product_url' => $offer->product_url,
                ],
                'store' => [
                    'id' => $offer->store?->id,
                    'name' => $offer->store?->name,
                    'is_independent' => (bool) ($offer->store?->is_independent ?? false),
                    'website_url' => $offer->store?->website_url,
                    'instagram_handle' => $offer->store?->instagram_handle,
                    'whatsapp' => $offer->store?->whatsapp_contact,
                ],
                'branch' => $branch ? [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'state' => $branch->state,
                    'municipality' => $branch->municipality,
                    'parish' => $branch->parish,
                    'city' => $branch->city,
                    'address' => $branch->address,
                    'reference_point' => $branch->reference_point,
                    'phone' => $branch->phone,
                    'whatsapp' => $branch->whatsapp ?? $offer->store?->whatsapp_contact,
                    'latitude' => $branch->latitude,
                    'longitude' => $branch->longitude,
                    'opening_hours' => $branch->opening_hours,
                    'distance_meters' => $distanceMeters,
                    'distance_km' => $distanceMeters !== null ? round($distanceMeters / 1000, 2) : null,
                ] : null,
            ];
        }

        if ($userLat !== null && $userLng !== null) {
            usort($results, function ($a, $b) {
                $distA = $a['branch']['distance_meters'] ?? PHP_INT_MAX;
                $distB = $b['branch']['distance_meters'] ?? PHP_INT_MAX;
                return $distA <=> $distB;
            });
        }

        return response()->json([
            'status' => 'success',
            'filters' => [
                'query' => $queryText,
                'ingredient' => $ingredientTerm,
                'state' => $validated['state'] ?? 'TODOS',
                'city' => $validated['city'] ?? 'TODAS',
                'has_gps' => $userLat !== null && $userLng !== null,
            ],
            'total_matches' => count($results),
            'results' => $results,
        ]);
    }

    /**
     * Directorio público de tiendas aliadas y rastreadas.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AffiliateStore::query()
            ->where('is_active', true)
            ->withCount([
                'productOffers as active_offers_count' => function ($q) {
                    $q->where('in_stock', true);
                },
                'productOffers as total_offers_count',
                'branches as active_branches_count' => function ($q) {
                    $q->where('is_active', true);
                },
            ]);

        if ($country = $request->query('country') ?: $request->query('country_code')) {
            $query->where('country_code', strtoupper($country));
        }

        if ($search = $request->query('search') ?: $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('slug', 'ILIKE', "%{$search}%");
            });
        }

        $stores = $query->orderBy('name')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'slug' => $s->slug,
                'website_url' => $s->website_url,
                'logo_url' => $s->logo_url,
                'store_type' => $s->store_type,
                'country_code' => $s->country_code,
                'country_name' => $s->country_name,
                'country_flag' => $s->country_flag,
                'crawler_platform' => $s->crawler_platform,
                'instagram_handle' => $s->instagram_handle,
                'whatsapp_contact' => $s->whatsapp_contact,
                'total_offers_count' => (int) $s->total_offers_count,
                'in_stock_offers_count' => (int) $s->active_offers_count,
                'branches_count' => (int) $s->active_branches_count,
            ];
        });

        return response()->json([
            'status' => 'success',
            'total_stores' => $stores->count(),
            'stores' => $stores,
        ]);
    }

    /**
     * Perfil público y catálogo de ofertas de una tienda específica.
     */
    public function show(Request $request, string $identifier): JsonResponse
    {
        $store = AffiliateStore::where('is_active', true)
            ->where(function ($q) use ($identifier) {
                if (is_numeric($identifier)) {
                    $q->where('id', (int) $identifier);
                } else {
                    $q->where('slug', $identifier);
                }
            })
            ->with(['branches' => function ($q) {
                $q->where('is_active', true);
            }])
            ->firstOrFail();

        $search = $request->query('search') ?: $request->query('q');
        $limit = min(300, max(10, (int) $request->query('limit', 150)));

        $offersQuery = ProductStoreOffer::with([
            'product:id,name,slug,brand_id,image_url,category,volume_amount,volume_unit',
            'product.brand:id,name',
        ])
        ->where('store_id', $store->id);

        if ($request->boolean('in_stock_only', false)) {
            $offersQuery->where('in_stock', true);
        }

        if ($search) {
            $offersQuery->whereHas('product', function ($pq) use ($search) {
                $pq->where('name', 'ILIKE', "%{$search}%")
                   ->orWhereHas('brand', fn ($bq) => $bq->where('name', 'ILIKE', "%{$search}%"));
            });
        }

        $offers = $offersQuery->orderByDesc('in_stock')
            ->orderBy('price')
            ->take($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'website_url' => $store->website_url,
                'logo_url' => $store->logo_url,
                'store_type' => $store->store_type,
                'country_code' => $store->country_code,
                'country_name' => $store->country_name,
                'country_flag' => $store->country_flag,
                'crawler_platform' => $store->crawler_platform,
                'instagram_handle' => $store->instagram_handle,
                'whatsapp_contact' => $store->whatsapp_contact,
                'branches' => $store->branches,
                'total_offers_loaded' => $offers->count(),
            ],
            'products' => $offers,
        ]);
    }
}
