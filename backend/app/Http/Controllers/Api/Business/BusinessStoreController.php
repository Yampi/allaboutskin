<?php

namespace App\Http\Controllers\Api\Business;

use App\Domain\Auth\Enums\UserRole;
use App\Domain\Store\Enums\StoreSubscriptionTier;
use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\StoreBranch;
use App\Models\StoreLeadInteraction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessStoreController extends Controller
{
    /**
     * Obtener el perfil y resumen comercial de la tienda del usuario autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $store = AffiliateStore::query()
            ->withCount(['branches', 'productOffers'])
            ->where('owner_id', $user->id)
            ->first();

        if (!$store) {
            return response()->json([
                'status' => 'not_found',
                'message' => 'No tienes ninguna tienda registrada en tu cuenta.',
                'has_store' => false,
            ], 404);
        }

        $this->authorize('view', $store);

        // Resumen de rendimiento de leads del mes actual
        $startOfMonth = now()->startOfMonth();
        $leadsThisMonth = StoreLeadInteraction::where('store_id', $store->id)
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        return response()->json([
            'status' => 'success',
            'has_store' => true,
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'slug' => $store->slug,
                'website_url' => $store->website_url,
                'logo_url' => $store->logo_url,
                'store_type' => $store->store_type,
                'country_code' => $store->country_code,
                'instagram_handle' => $store->instagram_handle,
                'whatsapp_contact' => $store->whatsapp_contact,
                'is_independent' => $store->is_independent,
                'verification_status' => $store->verification_status,
                'is_active' => $store->is_active,
                'subscription_tier' => $store->subscription_tier?->value ?? StoreSubscriptionTier::FREE->value,
                'subscription_tier_label' => $store->subscription_tier?->label() ?? 'Plan Gratuito',
                'subscription_expires_at' => $store->subscription_expires_at?->toISOString(),
                'is_featured' => $store->isFeaturedActive(),
                'branches_count' => $store->branches_count,
                'offers_count' => $store->product_offers_count,
                'leads_this_month' => $leadsThisMonth,
            ],
        ]);
    }

    /**
     * Actualizar los datos de contacto y perfil de la tienda.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();
        $this->authorize('update', $store);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'website_url' => 'nullable|url|max:255',
            'logo_url' => 'nullable|url|max:500',
            'instagram_handle' => 'nullable|string|max:100',
            'whatsapp_contact' => 'nullable|string|max:50',
            'community_notes' => 'nullable|string|max:1000',
        ]);

        $store->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Datos de la tienda actualizados correctamente.',
            'store' => $store->fresh(),
        ]);
    }

    /**
     * Registrar una nueva tienda de autoservicio para el usuario autenticado.
     */
    public function register(Request $request): JsonResponse
    {
        $user = $request->user();

        // Si ya tiene una tienda registrada, evitar duplicados
        $existingStore = AffiliateStore::where('owner_id', $user->id)->first();
        if ($existingStore) {
            return response()->json([
                'status' => 'error',
                'message' => 'Ya posees una tienda registrada en esta cuenta.',
                'store_id' => $existingStore->id,
            ], 409);
        }

        $validated = $request->validate([
            'store_name' => 'required|string|max:150',
            'website_url' => 'nullable|url|max:255',
            'instagram_handle' => 'nullable|string|max:100',
            'whatsapp' => 'required|string|max:50',
            'address' => 'required|string|max:300',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'phone' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:150',
        ]);

        $slugBase = Str::slug($validated['store_name'] . '-' . $validated['city']);
        $uniqueSlug = $slugBase . '-' . Str::random(5);

        // Crear la entidad de la tienda
        $store = AffiliateStore::create([
            'owner_id' => $user->id,
            'name' => $validated['store_name'],
            'slug' => $uniqueSlug,
            'website_url' => $validated['website_url'] ?? 'https://allabout.skin',
            'store_type' => 'PHYSICAL',
            'country_code' => 'VE',
            'affiliate_network' => 'Comercio Local',
            'instagram_handle' => $validated['instagram_handle'] ?? null,
            'whatsapp_contact' => $validated['whatsapp'],
            'is_independent' => true,
            'verification_status' => 'PENDING_REVIEW',
            'subscription_tier' => StoreSubscriptionTier::FREE->value,
            'is_active' => true, // Activa para que el comerciante empiece a configurarla
            'submitted_by_email' => $user->email,
        ]);

        // Crear sucursal principal
        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => $validated['store_name'] . ' - Sede Principal',
            'slug' => 'branch-' . $uniqueSlug,
            'state' => $validated['state'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'latitude' => $validated['latitude'] ?? 9.2150000,
            'longitude' => $validated['longitude'] ?? -66.0100000,
            'geofence_radius_meters' => 90,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'],
            'opening_hours' => $validated['opening_hours'] ?? 'Lunes a Sábado: 8:00 AM - 6:00 PM',
            'is_active' => true,
        ]);

        // Si el usuario es estándar, ascender automáticamente a BUSINESS_OWNER
        if ($user->role === UserRole::STANDARD_USER) {
            $user->role = UserRole::BUSINESS_OWNER;
            $user->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => '¡Tienda registrada con éxito! Ya puedes gestionar tus ofertas y sucursales.',
            'store' => $store,
            'primary_branch' => $branch,
        ], 201);
    }
}
