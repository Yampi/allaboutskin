<?php

namespace App\Http\Middleware;

use App\Models\SecurityAuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'error_type' => 'UNAUTHENTICATED',
                'message' => 'No autenticado.',
                'action_required' => 'login',
            ], 401);
        }

        if (!$user->is_active) {
            SecurityAuditLog::logEvent(
                'SUSPICIOUS_REQUEST',
                'Intento de acceso con cuenta inactiva o suspendida',
                $user->id,
                'WARNING',
                $request->path()
            );

            return response()->json([
                'status' => 'error',
                'error_type' => 'ACCOUNT_SUSPENDED',
                'message' => 'Tu cuenta ha sido suspendida. Contacta con soporte.',
                'action_required' => 'contact_support',
            ], 403);
        }

        if ($user->isLocked()) {
            return response()->json([
                'status' => 'error',
                'error_type' => 'ACCOUNT_LOCKED',
                'message' => 'Tu cuenta está temporalmente bloqueada por motivos de seguridad.',
                'action_required' => 'account_locked',
            ], 423);
        }

        $userRole = $user->role?->value;

        // Super Admin always has full access
        if ($userRole === 'super_admin') {
            return $next($request);
        }

        if (!empty($roles) && !in_array($userRole, $roles, true)) {
            SecurityAuditLog::logEvent(
                'ACCESS_DENIED',
                "Intento de acceso no autorizado al recurso [{$request->path()}] con rol [{$userRole}]",
                $user->id,
                'WARNING',
                $request->path()
            );

            return response()->json([
                'status' => 'error',
                'error_type' => 'FORBIDDEN',
                'message' => 'Acceso denegado. No tienes los permisos requeridos para esta sección.',
                'action_required' => 'insufficient_permissions',
            ], 403);
        }

        return $next($request);
    }
}
