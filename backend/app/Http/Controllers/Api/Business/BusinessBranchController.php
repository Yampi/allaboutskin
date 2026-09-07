<?php

namespace App\Http\Controllers\Api\Business;

use App\Http\Controllers\Controller;
use App\Models\AffiliateStore;
use App\Models\StoreBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BusinessBranchController extends Controller
{
    /**
     * Listado de sucursales pertenecientes a la tienda del usuario.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $branches = StoreBranch::where('store_id', $store->id)
            ->withCount('offers')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'store_id' => $store->id,
            'total' => $branches->count(),
            'max_allowed' => $store->subscription_tier?->maxBranches() ?? 1,
            'branches' => $branches,
        ]);
    }

    /**
     * Registrar una nueva sucursal.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $store = AffiliateStore::where('owner_id', $user->id)->firstOrFail();

        $this->authorize('create', [StoreBranch::class, $store]);

        // Verificar límite de sucursales según plan
        $currentBranchesCount = StoreBranch::where('store_id', $store->id)->count();
        $maxAllowed = $store->subscription_tier?->maxBranches() ?? 1;

        if ($currentBranchesCount >= $maxAllowed && !$user->isAdmin()) {
            return response()->json([
                'status' => 'limit_reached',
                'message' => "Has alcanzado el límite de {$maxAllowed} sucursal(es) de tu plan actual. Actualiza a Pro Local para añadir más sedes.",
                'current_count' => $currentBranchesCount,
                'max_allowed' => $maxAllowed,
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'state' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'address' => 'required|string|max:300',
            'reference_point' => 'nullable|string|max:150',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'geofence_radius_meters' => 'nullable|integer|min:30|max:500',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $slugBase = Str::slug($validated['name'] . '-' . $validated['city']);
        $uniqueSlug = $slugBase . '-' . Str::random(5);

        $branch = StoreBranch::create([
            'store_id' => $store->id,
            'name' => $validated['name'],
            'slug' => $uniqueSlug,
            'state' => $validated['state'],
            'city' => $validated['city'],
            'address' => $validated['address'],
            'reference_point' => $validated['reference_point'] ?? null,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'geofence_radius_meters' => $validated['geofence_radius_meters'] ?? 90,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? $store->whatsapp_contact,
            'opening_hours' => $validated['opening_hours'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Sucursal creada exitosamente.',
            'branch' => $branch,
        ], 201);
    }

    /**
     * Detalle de una sucursal específica.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $branch = StoreBranch::with('store')->findOrFail($id);
        $this->authorize('view', $branch);

        return response()->json([
            'status' => 'success',
            'branch' => $branch,
        ]);
    }

    /**
     * Actualizar una sucursal existente.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $branch = StoreBranch::with('store')->findOrFail($id);
        $this->authorize('update', $branch);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:150',
            'state' => 'sometimes|required|string|max:100',
            'city' => 'sometimes|required|string|max:100',
            'address' => 'sometimes|required|string|max:300',
            'reference_point' => 'nullable|string|max:150',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
            'geofence_radius_meters' => 'nullable|integer|min:30|max:500',
            'phone' => 'nullable|string|max:50',
            'whatsapp' => 'nullable|string|max:50',
            'opening_hours' => 'nullable|string|max:150',
            'is_active' => 'nullable|boolean',
        ]);

        $branch->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Sucursal actualizada con éxito.',
            'branch' => $branch->fresh(),
        ]);
    }

    /**
     * Eliminar una sucursal.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $branch = StoreBranch::with('store')->findOrFail($id);
        $this->authorize('delete', $branch);

        $branch->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Sucursal eliminada correctamente.',
        ]);
    }
}
