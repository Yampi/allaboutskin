<?php

namespace App\Http\Controllers\Api;

use App\Domain\Cosmetics\Services\ProductMatchService;
use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    /**
     * List and search ingredients.
     */
    public function ingredients(Request $request): JsonResponse
    {
        $query = Ingredient::query()
            ->with(['indications', 'pubmedStudies'])
            ->withCount('products');

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                // ILIKE en Postgres: "niacinamide" debe encontrar "NIACINAMIDE".
                $q->whereLike('inci_name', "%{$search}%", caseSensitive: false)
                  ->orWhereLike('common_name', "%{$search}%", caseSensitive: false)
                  ->orWhereLike('cas_number', "%{$search}%", caseSensitive: false);
            });
        }

        if ($request->boolean('actives_only')) {
            $query->where('is_active', true);
        }

        if ($request->filled('evidence_level')) {
            $query->where('evidence_level', strtoupper($request->evidence_level));
        }

        if ($request->filled('timing')) {
            $timing = strtoupper($request->timing);
            $query->where(function ($q) use ($timing) {
                $q->where('recommended_timing', $timing)
                  ->orWhere('recommended_timing', 'BOTH');
            });
        }

        if ($request->filled('indication')) {
            $query->whereHas('indications', function ($q) use ($request) {
                $q->where('slug', $request->indication);
            });
        }

        $sortBy = $request->query('sort_by', 'inci_name');
        $order = strtolower($request->query('order', 'asc')) === 'desc' ? 'desc' : 'asc';

        if (in_array($sortBy, ['inci_name', 'common_name', 'evidence_level', 'comedogenic_rating', 'irritation_rating', 'products_count'])) {
            $query->orderBy($sortBy, $order);
        } else {
            $query->orderBy('inci_name', 'asc');
        }

        $ingredients = $query->paginate($request->integer('per_page', 20));

        return response()->json($ingredients);
    }

    /**
     * Get single ingredient scientific sheet.
     */
    public function ingredientDetail(string $identifier): JsonResponse
    {
        $ingredient = Ingredient::where('id', is_numeric($identifier) ? $identifier : null)
            ->orWhere('inci_name', strtoupper(str_replace('-', ' ', $identifier)))
            ->with([
                'indications',
                'pubmedStudies',
                'aliases',
                'conflictsAsA.ingredientB',
                'conflictsAsB.ingredientA',
                'products.brand',
                'products.storeOffers.store',
                'products.storeOffers.branch',
            ])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $ingredient,
        ]);
    }

    /**
     * List and search products.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::query()->with([
            'brand',
            'ingredients',
            'storeOffers' => function ($q) {
                $q->where('in_stock', true)
                  ->whereHas('store', fn ($sq) => $sq->where('is_active', true));
            },
            'storeOffers.store',
            'storeOffers.branch',
        ]);

        // Quitar del inventario público productos sin ofertas activas de comercios habilitados (a menos que se pase include_all=1)
        if (!$request->boolean('include_all')) {
            $query->whereHas('storeOffers', function ($oq) {
                $oq->where('in_stock', true)
                   ->whereHas('store', fn ($sq) => $sq->where('is_active', true));
            });
        }

        // Filtro por país / sectorización geográfica de productos
        if ($country = $request->query('country') ?: $request->query('country_code')) {
            $query->whereHas('storeOffers.store', function ($sq) use ($country) {
                $sq->where('is_active', true)
                   ->where('country_code', strtoupper($country));
            });
        }

        // Filtro por tienda específica
        if ($storeFilter = $request->query('store_id') ?: $request->query('store')) {
            $query->whereHas('storeOffers', function ($oq) use ($storeFilter) {
                $oq->where('in_stock', true);
                if (is_numeric($storeFilter)) {
                    $oq->where('store_id', (int) $storeFilter);
                } else {
                    $oq->whereHas('store', fn ($sq) => $sq->where('slug', $storeFilter)->orWhere('name', 'ILIKE', "%{$storeFilter}%"));
                }
            });
        }

        if ($request->filled('q')) {
            $search = trim($request->q);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ILIKE', "%{$search}%")
                  ->orWhere('barcode_ean', 'ILIKE', "%{$search}%")
                  ->orWhereHas('brand', fn ($bq) => $bq->where('name', 'ILIKE', "%{$search}%"))
                  ->orWhereHas('ingredients', fn ($iq) => $iq->where('inci_name', 'ILIKE', "%{$search}%")
                      ->orWhere('common_name', 'ILIKE', "%{$search}%")
                  );
            });
        }

        if ($request->filled('ingredient')) {
            $ingTerm = trim($request->ingredient);
            $query->whereHas('ingredients', function ($iq) use ($ingTerm) {
                if (is_numeric($ingTerm)) {
                    $iq->where('ingredients.id', $ingTerm);
                } else {
                    $iq->where('inci_name', 'ILIKE', "%{$ingTerm}%")
                       ->orWhere('common_name', 'ILIKE', "%{$ingTerm}%");
                }
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('brand')) {
            $query->whereHas('brand', fn ($bq) => $bq->where('slug', $request->brand));
        }

        $sort = $request->get('sort', 'latest');
        if ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } elseif ($sort === 'name_desc') {
            $query->orderBy('name', 'desc');
        } else {
            $query->orderBy('id', 'desc');
        }

        $products = $query->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    /**
     * Busca el producto leído en el frente de un envase (marca y nombre) y devuelve los candidatos.
     */
    public function matchProducts(Request $request, ProductMatchService $matcher): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'brand' => 'nullable|string|max:100',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $matcher->match($validated['brand'] ?? null, $validated['name']),
        ]);
    }

    /**
     * Get single product detail.
     */
    public function productDetail(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->with([
                'brand',
                'ingredients.indications',
                'ingredients.pubmedStudies',
                'storeOffers' => function ($q) {
                    $q->where('in_stock', true)
                      ->whereHas('store', fn ($sq) => $sq->where('is_active', true));
                },
                'storeOffers.store',
            ])
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $product,
        ]);
    }

    /**
     * List brands.
     */
    public function brands(): JsonResponse
    {
        $brands = Brand::withCount('products')->orderBy('name', 'asc')->get();

        return response()->json([
            'status' => 'success',
            'data' => $brands,
        ]);
    }
}
