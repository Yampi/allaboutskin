<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Domain\Auth\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\SecurityAuditLog;
use App\Models\User;
use App\Models\UserSkinProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Proveedores OAuth admitidos.
     */
    protected array $supportedProviders = ['google', 'facebook'];

    /**
     * Redirigir al usuario al proveedor OAuth seleccionado.
     */
    public function redirectToProvider(Request $request, string $provider): JsonResponse|RedirectResponse
    {
        if (!in_array($provider, $this->supportedProviders, true)) {
            return response()->json([
                'status' => 'error',
                'message' => "El proveedor OAuth '{$provider}' no está soportado.",
            ], 400);
        }

        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');
        $clientId = config("services.{$provider}.client_id");

        if (empty($clientId)) {
            Log::warning("SocialAuth: Intento de autenticación sin {$provider} client_id configurado.");
            return redirect("{$frontendUrl}/login?error=" . urlencode("Falta configurar las credenciales de {$provider} (GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en backend/.env)."));
        }


        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver($provider)->stateless();

            // Si el frontend solicita la URL vía JSON
            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'provider' => $provider,
                    'redirect_url' => $driver->redirect()->getTargetUrl(),
                ]);
            }

            return $driver->redirect();
        } catch (\Throwable $e) {
            Log::error("SocialAuth: Error al generar redirección para {$provider}: " . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo inicializar la autenticación social.',
            ], 500);
        }
    }

    /**
     * Procesar la respuesta del proveedor OAuth y emitir token Sanctum.
     */
    public function handleProviderCallback(Request $request, string $provider): RedirectResponse|JsonResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        if (!in_array($provider, $this->supportedProviders, true)) {
            return redirect("{$frontendUrl}/login?error=" . urlencode('Proveedor no admitido'));
        }

        try {
            /** @var \Laravel\Socialite\Two\User $socialUser */
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $email = strtolower(trim($socialUser->getEmail() ?? ''));
            $providerId = (string) $socialUser->getId();
            $name = $socialUser->getName() ?: $socialUser->getNickname() ?: 'Usuario Allabout.skin';
            $avatar = $socialUser->getAvatar();

            if (empty($email)) {
                return redirect("{$frontendUrl}/login?error=" . urlencode('El proveedor no suministró un correo electrónico válido.'));
            }

            // 1. Buscar usuario por provider y provider_id, o por email
            $user = User::where('provider', $provider)
                ->where('provider_id', $providerId)
                ->first();

            $isNewUser = false;

            if (!$user) {
                // Verificar si ya existe con ese correo (vinculación)
                $user = User::where('email', $email)->first();

                if ($user) {
                    $user->provider = $provider;
                    $user->provider_id = $providerId;
                    if ($avatar && empty($user->avatar_url)) {
                        $user->avatar_url = $avatar;
                    }
                    $user->save();
                } else {
                    // Crear nuevo usuario
                    $user = new User([
                        'name' => $name,
                        'email' => $email,
                        'provider' => $provider,
                        'provider_id' => $providerId,
                        'avatar_url' => $avatar,
                    ]);
                    $user->role = UserRole::STANDARD_USER;
                    $user->is_active = true;
                    $user->email_verified_at = now();
                    $user->save();

                    // Perfil dermatológico base inicial
                    UserSkinProfile::create([
                        'user_id' => $user->id,
                        'skin_type' => 'NORMAL',
                        'barrier_status' => 'HEALTHY',
                        'active_conditions' => [],
                        'known_allergens' => [],
                    ]);

                    $isNewUser = true;
                }
            }

            // Registrar log de auditoría
            SecurityAuditLog::logEvent(
                $isNewUser ? 'USER_REGISTERED_OAUTH' : 'USER_LOGIN_OAUTH',
                "Acceso vía {$provider} para {$user->email}",
                $user->id,
                'INFO'
            );

            // Generar token Sanctum
            $token = $user->createToken('auth_token', ['user:basic'])->plainTextToken;

            // Datos mínimos del usuario para la sesión frontend
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'avatar_url' => $user->avatar_url,
                'is_new' => $isNewUser,
            ];

            $userJson = urlencode(json_encode($userData));

            // Redirigir al frontend con el token de sesión
            return redirect("{$frontendUrl}/login?social_token={$token}&social_user={$userJson}&is_new=" . ($isNewUser ? '1' : '0'));

        } catch (\Throwable $e) {
            Log::error("SocialAuth: Fallo en callback de {$provider}: " . $e->getMessage());

            return redirect("{$frontendUrl}/login?error=" . urlencode('Fallo en la comunicación con el proveedor social: ' . $e->getMessage()));
        }
    }
}
