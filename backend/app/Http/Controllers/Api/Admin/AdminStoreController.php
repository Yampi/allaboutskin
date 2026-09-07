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

        // Conteo de tiendas pendientes para alertas en el dashboard
        $pendingCount = AffiliateStore::where('verification_status', 'PENDING_REVIEW')->count();
        $verifiedCount = AffiliateStore::where('verification_status', 'VERIFIED')->count();

        $perPage = min(50, max(10, (int) $request->query('per_page', 15)));
        $stores = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'summary' => [
                'pending_review' => $pendingCount,
                'total_verified' => $verifiedCount,
                'total_stores' => $stores->total(),
            ],
            'stores' => $stores,
        ]);
    }

    /**
     * Detalle completo de una tienda para auditoría.
     */
    public function show(int $id): JsonResponse
    {
        $store = AffiliateStore::with([
            'owner:id,name,email,role,created_at',
            'branches',
            'productOffers' => function ($q) {
                $q->with('product.brand')->take(30);
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
     * Activar o suspender una tienda.
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $admin = $request->user();
        $store = AffiliateStore::findOrFail($id);

        $store->is_active = !$store->is_active;
        $store->save();

        SecurityAuditLog::logEvent(
            eventType: 'STORE_STATUS_TOGGLED',
            description: "Admin [{$admin->email}] cambió estado activo de tienda [{$store->name}] a [" . ($store->is_active ? 'ACTIVO' : 'INACTIVO') . "]",
            userId: $admin->id,
            severity: 'WARNING',
            target: "store:{$store->id}"
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Estado de la tienda actualizado.',
            'is_active' => $store->is_active,
        ]);
    }
}
