<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserSkinProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'skin_type' => 'nullable|string|in:OILY,DRY,COMBINATION,NORMAL,SENSITIVE',
            'barrier_status' => 'nullable|string|in:HEALTHY,COMPROMISED,ACUTELY_DAMAGED',
            'active_conditions' => 'nullable|array',
            'known_allergens' => 'nullable|array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        UserSkinProfile::create([
            'user_id' => $user->id,
            'skin_type' => $validated['skin_type'] ?? 'NORMAL',
            'barrier_status' => $validated['barrier_status'] ?? 'HEALTHY',
            'active_conditions' => $validated['active_conditions'] ?? [],
            'known_allergens' => $validated['known_allergens'] ?? [],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado exitosamente.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('skinProfile'),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('skinProfile'),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load(['skinProfile', 'routineItems.product.brand']),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }
}
