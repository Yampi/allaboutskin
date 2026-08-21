<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserSkinProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkinProfileController extends Controller
{
    /**
     * Get authenticated user skin profile.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->skinProfile ?? UserSkinProfile::create([
            'user_id' => $request->user()->id,
            'skin_type' => 'NORMAL',
            'barrier_status' => 'HEALTHY',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $profile,
        ]);
    }

    /**
     * Update skin profile.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'skin_type' => 'required|string|in:OILY,DRY,COMBINATION,NORMAL,SENSITIVE',
            'fitzpatrick_type' => 'nullable|integer|between:1,6',
            'barrier_status' => 'required|string|in:HEALTHY,COMPROMISED,ACUTELY_DAMAGED',
            'active_conditions' => 'nullable|array',
            'known_allergens' => 'nullable|array',
            'sun_exposure_level' => 'nullable|string|in:LOW,MODERATE,HIGH',
            'pregnancy_or_nursing' => 'nullable|boolean',
        ]);

        $profile = UserSkinProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Perfil dermatológico actualizado correctamente.',
            'data' => $profile,
        ]);
    }
}
