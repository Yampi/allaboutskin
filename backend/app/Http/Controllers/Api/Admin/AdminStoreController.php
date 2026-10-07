<?php

namespace App\Http\Controllers\Api\Admin;

use App\Domain\Store\Enums\StoreSubscriptionTier;
use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\SecurityAuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStoreController extends Controller
{
    /**
     * Listado paginado de tiendas registradas para supervisión de administradores.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AffiliateStore::query()
            ->with(['owner:id,name,email', 'branches:id,store_id,name,city,state,is_active,slug'])
            ->withCount(['branches', 'productOffers', 'leadInteractions']);

        // Búsqueda por nombre, email o instagram
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('instagram_handle', 'like', "%{$search}%")
                  ->orWhere('whatsapp_contact', 'like', "%{$search}%")
                  ->orWhere('submitted_by_email', 'like', "%{$search}%")
                  ->orWhereHas('owner', function ($oq) use ($search) {
                      $oq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  })
                  ->orWhereHas('branches', function ($bq) use ($search) {
                      $bq->where('city', 'like', "%{$search}%")
                         ->orWhere('state', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por estado de verificación
        if ($status = $request->query('verification_status')) {
            $query->where('verification_status', strtoupper($status));
        }

        // Filtro por nivel de suscripción
        if ($tier = $request->query('subscription_tier')) {
            $query->where('subscription_tier', strtoupper($tier));
        }

        // Filtro por país / sectorización
        if ($country = $request->query('country_code') ?: $request->query('country')) {
            $query->where('country_code', strtoupper($country));
        }

        // Conteo de tiendas pendientes para alertas en el dashboard
        $pendingCount = AffiliateStore::where('verification_status', 'PENDING_REVIEW')->count();
        $verifiedCount = AffiliateStore::where('verification_status', 'VERIFIED')->count();

        // Conteo por país para selector de sectorización
        $byCountry = AffiliateStore::query()
            ->selectRaw('country_code, count(*) as count')
            ->groupBy('country_code')
            ->pluck('count', 'country_code')
            ->toArray();

        $perPage = min(100, max(5, (int) $request->query('per_page', 20)));
        $stores = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'summary' => [
                'pending_review' => $pendingCount,
                'total_verified' => $verifiedCount,
                'total_stores' => $stores->total(),
                'by_country' => $byCountry,
            ],
            'stores' => $stores,
        ]);
    }

    /**
     * Detalle completo de una tienda para auditoría.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $search = $request->query('search');
        $limit = min(300, max(10, (int) $request->query('limit', 200)));

        $store = AffiliateStore::with([
            'owner:id,name,email,role,created_at',
            'branches',
            'productOffers' => function ($q) use ($search, $limit) {
                $q->with([
                    'store:id,name,country_code,website_url',
                    'product:id,name,slug,brand_id,image_url,category,volume_amount,volume_unit,barcode_ean',
                    'product.brand:id,name',
                ]);
                if ($search) {
                    $q->whereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'ILIKE', "%{$search}%")
                           ->orWhereHas('brand', fn ($bq) => $bq->where('name', 'ILIKE', "%{$search}%"));
                    });
                }
                $q->orderByDesc('in_stock')->orderBy('price')->take($limit);
            },
        ])
        ->withCount(['branches', 'productOffers', 'leadInteractions'])
        ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'store' => $store,
        ]);
    }

    /**
     * Aprobar o rechazar la verificación de una tienda.
     */
    public function updateVerification(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::findOrFail($id);

        $validated = $request->validate([
            'verification_status' => 'required|in:VERIFIED,REJECTED,PENDING_REVIEW',
            'rejected_reason' => 'nullable|string|max:1000',
        ]);

        $newStatus = $validated['verification_status'];
        $updateData = [
            'verification_status' => $newStatus,
        ];

        if ($newStatus === 'VERIFIED') {
            $updateData['verified_at'] = now();
            $updateData['is_active'] = true;
            $updateData['rejected_reason'] = null;

            // Activar también sus sucursales principales
            $store->branches()->update(['is_active' => true]);
        } elseif ($newStatus === 'REJECTED') {
            $updateData['rejected_reason'] = $validated['rejected_reason'] ?? 'Información de establecimiento incompleta o no verificable.';
            $updateData['is_active'] = false;
        }

        $store->update($updateData);

        // Registro de auditoría de seguridad
        SecurityAuditLog::logEvent(
            eventType: 'STORE_VERIFICATION_UPDATED',
            description: "Admin [{$admin->email}] actualizó verificación de tienda [{$store->name}] a [{$newStatus}]",
            userId: $admin->id,
            severity: 'INFO',
            target: "store:{$store->id}"
        );

        return response()->json([
            'status' => 'success',
            'message' => "Estado de verificación actualizado a {$newStatus}.",
            'store' => $store->fresh()->load('branches'),
        ]);
    }

    /**
     * Actualizar el plan de suscripción y monetización de la tienda.
     */
    public function updateSubscription(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::findOrFail($id);

        $validated = $request->validate([
            'subscription_tier' => 'required|in:FREE,PRO_LOCAL,ENTERPRISE',
            'is_featured' => 'nullable|boolean',
            'subscription_expires_at' => 'nullable|date',
        ]);

        $tier = $validated['subscription_tier'];
        $isFeatured = $validated['is_featured'] ?? ($tier !== 'FREE');

        $store->update([
            'subscription_tier' => $tier,
            'is_featured' => $isFeatured,
            'subscription_expires_at' => $validated['subscription_expires_at'] ?? ($tier !== 'FREE' ? now()->addMonths(1) : null),
        ]);

        SecurityAuditLog::logEvent(
            eventType: 'STORE_SUBSCRIPTION_CHANGED',
            description: "Admin [{$admin->email}] cambió suscripción de [{$store->name}] a [{$tier}] (Destacado: " . ($isFeatured ? 'Sí' : 'No') . ")",
            userId: $admin->id,
            severity: 'INFO',
            target: "store:{$store->id}"
        );

        return response()->json([
            'status' => 'success',
            'message' => "Plan de la tienda actualizado a {$tier}.",
            'store' => $store->fresh(),
        ]);
    }

    /**
     * Activar o suspender una tienda, actualizando la disponibilidad de sus ofertas en el inventario.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::findOrFail($id);

        $store->is_active = !$store->is_active;
        $store->save();

        $affectedOffersCount = 0;
        if (!$store->is_active) {
            // Desactivar: suspender sucursales y retirar ofertas del inventario público
            $store->branches()->update(['is_active' => false]);
            $affectedOffersCount = $store->productOffers()->update(['in_stock' => false]);
            $message = "Tienda [{$store->name}] desactivada. Se retiraron {$affectedOffersCount} ofertas y sus productos del inventario activo.";
        } else {
            // Reactivar: restablecer sucursales y ofertas
            $store->branches()->update(['is_active' => true]);
            $affectedOffersCount = $store->productOffers()->update(['in_stock' => true]);
            $message = "Tienda [{$store->name}] reactivada. Se reincorporaron {$affectedOffersCount} ofertas al inventario.";
        }

        SecurityAuditLog::logEvent(
            eventType: 'STORE_STATUS_TOGGLED',
            description: "Admin [{$admin?->email}] cambió estado activo de tienda [{$store->name}] a [" . ($store->is_active ? 'ACTIVO' : 'INACTIVO') . "]. {$affectedOffersCount} ofertas afectadas.",
            userId: $admin?->id,
            severity: 'WARNING',
            target: "store:{$store->id}"
        );

        return response()->json([
            'status' => 'success',
            'message' => $message,
            'is_active' => $store->is_active,
            'affected_offers_count' => $affectedOffersCount,
        ]);
    }

    /**
     * Actualización rápida de datos clave de la tienda (país, ciudad, nombre, whatsapp, contacto).
     */
    public function quickUpdate(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::findOrFail($id);

        $validated = $request->validate([
            'country_code' => 'nullable|string|max:5',
            'country_name' => 'nullable|string|max:100',
            'country_flag' => 'nullable|string|max:10',
            'name' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'whatsapp_contact' => 'nullable|string|max:50',
            'instagram_handle' => 'nullable|string|max:100',
            'website_url' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['country_code'])) {
            $validated['country_code'] = strtoupper($validated['country_code']);
        }

        $city = $validated['city'] ?? null;
        unset($validated['city']);

        $store->update(array_filter($validated, fn($val) => !is_null($val)));

        if ($city) {
            $store->branches()->update(['city' => $city]);
        }

        SecurityAuditLog::logEvent(
            eventType: 'STORE_QUICK_UPDATED',
            description: "Admin [{$admin?->email}] actualizó datos rápidos de tienda [{$store->name}]",
            userId: $admin?->id,
            severity: 'INFO',
            target: "store:{$store->id}",
            payload: $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => "Datos de la tienda [{$store->name}] actualizados correctamente.",
            'store' => $store->fresh()->load('branches'),
        ]);
    }

    /**
     * Eliminar permanentemente una tienda y purgar del inventario todos sus productos exclusivos.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::with('productOffers')->findOrFail($id);
        $storeName = $store->name;

        // Obtener todos los IDs de productos ofertados por esta tienda
        $productIds = $store->productOffers()->pluck('product_id')->unique()->toArray();
        $offersCount = $store->productOffers()->count();

        // Eliminar la tienda (onDelete cascade limpia product_store_offers, store_branches y store_lead_interactions)
        $store->delete();

        // Purgar productos que se hayan quedado huérfanos (que no tengan ofertas de ninguna otra tienda y no sean verificados)
        $orphanedDeletedCount = 0;
        if (!empty($productIds)) {
            foreach ($productIds as $pId) {
                $hasOtherOffers = \App\Models\ProductStoreOffer::where('product_id', $pId)->exists();
                if (!$hasOtherOffers) {
                    $product = \App\Models\Product::find($pId);
                    if ($product && !$product->is_verified) {
                        $product->ingredients()->detach();
                        $product->delete();
                        $orphanedDeletedCount++;
                    }
                }
            }
        }

        SecurityAuditLog::logEvent(
            eventType: 'STORE_DELETED',
            description: "Admin [{$admin?->email}] eliminó la tienda [{$storeName}]. Se eliminaron {$offersCount} ofertas y {$orphanedDeletedCount} productos exclusivos del inventario.",
            userId: $admin?->id,
            severity: 'WARNING',
            target: "store:{$id}"
        );

        return response()->json([
            'status' => 'success',
            'message' => "La tienda [{$storeName}] ha sido eliminada permanentemente. Se retiraron {$offersCount} ofertas y se purgaron {$orphanedDeletedCount} productos exclusivos del inventario.",
            'deleted_store_id' => $id,
            'deleted_offers_count' => $offersCount,
            'orphaned_products_deleted_count' => $orphanedDeletedCount,
        ]);
    }
}
