<?php

namespace App\Http\Controllers\Api;

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
        $query = Ingredient::query()->with(['indications', 'pubmedStudies']);

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('inci_name', 'like', "%{$search}%")
                  ->orWhere('common_name', 'like', "%{$search}%")
                  ->orWhere('cas_number', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('actives_only')) {
            $query->where('is_active', true);
        }

        if ($request->filled('indication')) {
            $query->whereHas('indications', function ($q) use ($request) {
                $q->where('slug', $request->indication);
            });
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
            ->with(['indications', 'pubmedStudies', 'aliases', 'conflictsAsA.ingredientB', 'conflictsAsB.ingredientA'])
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
        $query = Product::query()->with(['brand', 'ingredients', 'storeOffers.store']);

        if ($request->filled('q')) {
            $search = $request->q;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('brand', fn ($bq) => $bq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('brand')) {
            $query->whereHas('brand', fn ($bq) => $bq->where('slug', $request->brand));
        }

        $products = $query->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    /**
     * Get single product detail.
     */
    public function productDetail(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->with(['brand', 'ingredients.indications', 'ingredients.pubmedStudies', 'storeOffers.store'])
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
