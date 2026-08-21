<?php

namespace App\Http\Controllers\Api;

use App\Domain\Auth\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use App\Models\User;
use App\Models\UserSkinProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', Password::min(8)->letters()->mixedCase()->numbers()],
            'skin_type' => 'nullable|string|in:OILY,DRY,COMBINATION,NORMAL,SENSITIVE',
            'barrier_status' => 'nullable|string|in:HEALTHY,COMPROMISED,ACUTELY_DAMAGED',
            'active_conditions' => 'nullable|array',
            'known_allergens' => 'nullable|array',
        ]);

        $user = new User([
            'name' => $validated['name'],
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
        ]);
        // Explicitly set default role and active status
        $user->role = UserRole::STANDARD_USER;
        $user->is_active = true;
        $user->save();

        UserSkinProfile::create([
            'user_id' => $user->id,
            'skin_type' => $validated['skin_type'] ?? 'NORMAL',
            'barrier_status' => $validated['barrier_status'] ?? 'HEALTHY',
            'active_conditions' => $validated['active_conditions'] ?? [],
            'known_allergens' => $validated['known_allergens'] ?? [],
        ]);

        SecurityAuditLog::logEvent(
            'USER_REGISTERED',
            "Nuevo usuario registrado: {$user->email}",
            $user->id,
            'INFO'
        );

        $token = $user->createToken('auth_token', ['user:basic'])->plainTextToken;

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
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($request->email));
        $throttleKey = Str::transliterate($email.'|'.$request->ip());

        // 1. IP & Email Rate Limiter check (5 attempts per minute)
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            SecurityAuditLog::logEvent(
                'LOGIN_THROTTLED',
                "Intento de login bloqueado por exceso de peticiones para: {$email}",
                null,
                'WARNING',
                $email
            );

            return response()->json([
                'message' => "Demasiados intentos fallidos. Por favor, inténtalo de nuevo en {$seconds} segundos.",
            ], 429);
        }

        $user = User::where('email', $email)->first();

        // 2. Check if account is temporarily locked
        if ($user && $user->isLocked()) {
            SecurityAuditLog::logEvent(
                'LOGIN_BLOCKED_LOCKED_ACCOUNT',
                "Intento de login en cuenta bloqueada: {$email}",
                $user->id,
                'WARNING'
            );

            return response()->json([
                'message' => 'Esta cuenta se encuentra temporalmente bloqueada por exceso de intentos fallidos.',
            ], 423);
        }

        // 3. Check if account is suspended / inactive
        if ($user && !$user->is_active) {
            SecurityAuditLog::logEvent(
                'LOGIN_BLOCKED_INACTIVE',
                "Intento de login en cuenta inactiva o suspendida: {$email}",
                $user->id,
                'WARNING'
            );

            return response()->json([
                'message' => 'Esta cuenta ha sido suspendida. Por favor contacta al administrador.',
            ], 403);
        }

        // 4. Verify password
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            if ($user) {
                $user->increment('failed_login_attempts');

                // Lock account for 15 minutes after 5 consecutive failures
                if ($user->failed_login_attempts >= 5) {
                    $user->locked_until = now()->addMinutes(15);
                    $user->save();

                    SecurityAuditLog::logEvent(
                        'ACCOUNT_LOCKED',
                        "Cuenta bloqueada por 15 minutos tras 5 intentos fallidos consecutivos: {$email}",
                        $user->id,
                        'CRITICAL'
                    );
                } else {
                    SecurityAuditLog::logEvent(
                        'LOGIN_FAILED',
                        "Credenciales incorrectas para el usuario: {$email} (Intento {$user->failed_login_attempts})",
                        $user->id,
                        'WARNING'
                    );
                }
            } else {
                SecurityAuditLog::logEvent(
                    'LOGIN_FAILED',
                    "Intento de inicio de sesión con email inexistente: {$email}",
                    null,
                    'WARNING',
                    $email
                );
            }

            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        // Clear rate limiter on successful authentication
        RateLimiter::clear($throttleKey);

        // Reset failed login attempts & update login metadata
        $user->failed_login_attempts = 0;
        $user->locked_until = null;
        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        $user->save();

        SecurityAuditLog::logEvent(
            'LOGIN_SUCCESS',
            "Inicio de sesión exitoso: {$user->email} [Rol: {$user->role?->value}]",
            $user->id,
            'INFO'
        );

        // Determine abilities based on role
        $abilities = ['user:basic'];
        if ($user->role?->hasPremiumAccess()) {
            $abilities[] = 'user:premium';
        }
        if ($user->role?->canManageContent()) {
            $abilities[] = 'content:manage';
        }
        if ($user->role?->isAdmin()) {
            $abilities[] = 'admin:access';
        }

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

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
        $user = $request->user();

        if ($user) {
            SecurityAuditLog::logEvent(
                'LOGOUT',
                "Cierre de sesión: {$user->email}",
                $user->id,
                'INFO'
            );

            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }
}
