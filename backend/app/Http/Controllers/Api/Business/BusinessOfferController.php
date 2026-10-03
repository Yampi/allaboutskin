<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\Brand;
use App\Models\Product;
use App\Models\ProductStoreOffer;
use App\Models\StoreBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessOfferController extends Controller
{
    /**
     * Listado paginado de ofertas y productos en inventario de la tienda.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $query = ProductStoreOffer::with(['product.brand', 'branch'])
            ->where('store_id', $store->id);

        // Búsqueda por nombre de producto o marca
        if ($search = $request->query('search')) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('barcode_ean', 'like', "%{$search}%")
                  ->orWhereHas('brand', function ($bq) use ($search) {
                      $bq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por sucursal
        if ($branchId = $request->query('branch_id')) {
            $query->where('branch_id', $branchId);
        }

        // Filtro por disponibilidad de stock
        if ($request->has('in_stock')) {
            $inStock = filter_var($request->query('in_stock'), FILTER_VALIDATE_BOOLEAN);
            $query->where('in_stock', $inStock);
        }

        $perPage = min(100, max(10, (int) $request->query('per_page', 20)));
        $offers = $query->orderBy('updated_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'store_id' => $store->id,
            'offers' => $offers,
        ]);
    }

    /**
     * Publicar una nueva oferta o añadir producto al inventario.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $this->authorize('create', [ProductStoreOffer::class, $store]);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'branch_id' => 'nullable|exists:store_branches,id',
            'price' => 'required|numeric|min:0',
            'price_ves' => 'nullable|numeric|min:0',
            'in_stock' => 'nullable|boolean',
            'product_url' => 'nullable|url|max:500',
        ]);

        // Si se indica una sucursal, validar que pertenezca a la tienda del usuario
        if (!empty($validated['branch_id'])) {
            $branch = StoreBranch::where('id', $validated['branch_id'])
                ->where('store_id', $store->id)
                ->firstOrFail();
        }

        $offer = ProductStoreOffer::create([
            'store_id' => $store->id,
            'product_id' => $validated['product_id'],
            'branch_id' => $validated['branch_id'] ?? null,
            'price' => $validated['price'],
            'price_ves' => $validated['price_ves'] ?? null,
            'currency' => 'USD',
            'in_stock' => $validated['in_stock'] ?? true,
            'product_url' => $validated['product_url'] ?? $store->website_url,
            'affiliate_url' => $validated['product_url'] ?? $store->website_url,
            'last_checked_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Producto añadido al inventario exitosamente.',
            'offer' => $offer->load(['product.brand', 'branch']),
        ], 201);
    }

    /**
     * Actualizar precio, stock o enlace de una oferta existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $offer = ProductStoreOffer::with('store')->findOrFail($id);
        $this->authorize('manage', $offer);

        $validated = $request->validate([
            'price' => 'sometimes|required|numeric|min:0',
            'price_ves' => 'nullable|numeric|min:0',
            'in_stock' => 'sometimes|required|boolean',
            'branch_id' => 'nullable|exists:store_branches,id',
            'product_url' => 'nullable|url|max:500',
        ]);

        if (isset($validated['branch_id']) && $validated['branch_id'] !== null) {
            StoreBranch::where('id', $validated['branch_id'])
                ->where('store_id', $offer->store_id)
                ->firstOrFail();
        }

        $offer->update(array_merge($validated, ['last_checked_at' => now()]));

        return response()->json([
            'status' => 'success',
            'message' => 'Oferta actualizada con éxito.',
            'offer' => $offer->fresh()->load(['product.brand', 'branch']),
        ]);
    }

    /**
     * Eliminar producto del inventario.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $offer = ProductStoreOffer::with('store')->findOrFail($id);
        $this->authorize('manage', $offer);

        $offer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Producto eliminado del inventario.',
        ]);
    }

    /**
     * Actualización masiva de precios o tasa de cambio VES para todo el catálogo de la tienda.
     */
    public function bulkUpdatePrices(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'exchange_rate' => 'nullable|numeric|min:0.01', // Tasa de cambio (e.g. 36.50 VES por USD)
            'offers' => 'nullable|array',
            'offers.*.id' => 'required_with:offers|exists:product_store_offers,id',
            'offers.*.price' => 'nullable|numeric|min:0',
            'offers.*.price_ves' => 'nullable|numeric|min:0',
            'offers.*.in_stock' => 'nullable|boolean',
        ]);

        $updatedCount = 0;

        // 1. Si se envía una tasa de cambio general, recalcular todos los precios VES en base a USD
        if (!empty($validated['exchange_rate'])) {
            $rate = (float) $validated['exchange_rate'];
            $storeOffers = ProductStoreOffer::where('store_id', $store->id)->get();

            foreach ($storeOffers as $offer) {
                $offer->update([
                    'price_ves' => round($offer->price * $rate, 2),
                    'last_checked_at' => now(),
                ]);
                $updatedCount++;
            }
        }

        // 2. Si se envían ofertas individuales en lote
        if (!empty($validated['offers'])) {
            foreach ($validated['offers'] as $item) {
                $offer = ProductStoreOffer::where('id', $item['id'])
                    ->where('store_id', $store->id)
                    ->first();

                if ($offer) {
                    $updateData = [];
                    if (isset($item['price'])) $updateData['price'] = $item['price'];
                    if (isset($item['price_ves'])) $updateData['price_ves'] = $item['price_ves'];
                    if (isset($item['in_stock'])) $updateData['in_stock'] = $item['in_stock'];
                    $updateData['last_checked_at'] = now();

                    $offer->update($updateData);
                    $updatedCount++;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Se actualizaron {$updatedCount} registros exitosamente.",
            'updated_count' => $updatedCount,
        ]);
    }

    /**
     * Importación masiva de productos y ofertas de catálogo (CSV / Lote JSON).
     */
    public function importCatalog(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'branch_id' => 'nullable|exists:store_branches,id',
            'exchange_rate' => 'nullable|numeric|min:0.01',
            'items' => 'required|array|min:1|max:500',
            'items.*.barcode_ean' => 'nullable|string|max:50',
            'items.*.name' => 'required|string|max:200',
            'items.*.brand' => 'nullable|string|max:100',
            'items.*.price_usd' => 'required|numeric|min:0',
            'items.*.price_ves' => 'nullable|numeric|min:0',
            'items.*.in_stock' => 'nullable|boolean',
            'items.*.product_url' => 'nullable|url|max:500',
        ]);

        // Validar sucursal si se especifica
        $branchId = null;
        if (!empty($validated['branch_id'])) {
            $branch = StoreBranch::where('id', $validated['branch_id'])
                ->where('store_id', $store->id)
                ->firstOrFail();
            $branchId = $branch->id;
        }

        $rate = !empty($validated['exchange_rate']) ? (float) $validated['exchange_rate'] : null;

        $createdOffers = 0;
        $updatedOffers = 0;
        $createdProducts = 0;
        $matchedProducts = 0;
        $errors = [];

        foreach ($validated['items'] as $index => $item) {
            try {
                $productName = trim($item['name']);
                $barcode = !empty($item['barcode_ean']) ? trim($item['barcode_ean']) : null;
                $brandName = !empty($item['brand']) ? trim($item['brand']) : 'Genérico';
                $priceUsd = (float) $item['price_usd'];
                $priceVes = isset($item['price_ves']) && $item['price_ves'] !== null
                    ? (float) $item['price_ves']
                    : ($rate ? round($priceUsd * $rate, 2) : null);
                $inStock = isset($item['in_stock']) ? (bool) $item['in_stock'] : true;
                $productUrl = !empty($item['product_url']) ? $item['product_url'] : $store->website_url;

                // 1. Intentar encontrar producto por código de barras
                $product = null;
                if ($barcode) {
                    $product = Product::where('barcode_ean', $barcode)->first();
                }

                // 2. Si no coincide por código de barras, buscar por nombre exacto o slug
                if (!$product) {
                    $productSlug = Str::slug($productName);
                    $product = Product::where('slug', $productSlug)
                        ->orWhere('name', 'ilike', $productName)
                        ->first();
                }

                // 3. Búsqueda por coincidencia parcial si aún no se encuentra
                if (!$product) {
                    $product = Product::where('name', 'ilike', "%{$productName}%")->first();
                }

                if ($product) {
                    $matchedProducts++;
                } else {
                    // Crear marca si no existe
                    $brandSlug = Str::slug($brandName);
                    $brand = Brand::firstOrCreate(
                        ['slug' => $brandSlug],
                        ['name' => $brandName, 'is_verified' => false]
                    );

                    // Crear producto nuevo para el catálogo de la tienda
                    $uniqueProductSlug = Str::slug($productName . '-' . Str::random(5));
                    $product = Product::create([
                        'brand_id' => $brand->id,
                        'name' => $productName,
                        'slug' => $uniqueProductSlug,
                        'barcode_ean' => $barcode,
                        'category' => 'SERUM',
                        'is_verified' => false,
                    ]);
                    $createdProducts++;
                }

                // 4. Crear o actualizar la oferta en la tienda
                $offer = ProductStoreOffer::where('store_id', $store->id)
                    ->where('product_id', $product->id)
                    ->where(function ($q) use ($branchId) {
                        if ($branchId) {
                            $q->where('branch_id', $branchId);
                        } else {
                            $q->whereNull('branch_id');
                        }
                    })
                    ->first();

                if ($offer) {
                    $offer->update([
                        'price' => $priceUsd,
                        'price_ves' => $priceVes,
                        'in_stock' => $inStock,
                        'product_url' => $productUrl,
                        'affiliate_url' => $productUrl,
                        'last_checked_at' => now(),
                    ]);
                    $updatedOffers++;
                } else {
                    ProductStoreOffer::create([
                        'store_id' => $store->id,
                        'product_id' => $product->id,
                        'branch_id' => $branchId,
                        'price' => $priceUsd,
                        'price_ves' => $priceVes,
                        'currency' => 'USD',
                        'in_stock' => $inStock,
                        'product_url' => $productUrl,
                        'affiliate_url' => $productUrl,
                        'last_checked_at' => now(),
                    ]);
                    $createdOffers++;
                }
            } catch (\Throwable $e) {
                $errors[] = [
                    'row' => $index + 1,
                    'name' => $item['name'] ?? 'Desconocido',
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Procesamiento completado: {$createdOffers} ofertas nuevas, {$updatedOffers} actualizadas.",
            'summary' => [
                'total_processed' => count($validated['items']),
                'created_offers' => $createdOffers,
                'updated_offers' => $updatedOffers,
                'matched_scientific_products' => $matchedProducts,
                'created_new_products' => $createdProducts,
                'errors_count' => count($errors),
            ],
            'errors' => $errors,
        ]);
    }
}
