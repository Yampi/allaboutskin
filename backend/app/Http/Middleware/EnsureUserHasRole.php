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
                'message' => 'No autenticado.',
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
                'message' => 'Tu cuenta ha sido suspendida. Contacta con soporte.',
            ], 403);
        }

        if ($user->isLocked()) {
            return response()->json([
                'message' => 'Tu cuenta está temporalmente bloqueada por motivos de seguridad.',
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
                'message' => 'Acceso denegado. No tienes los permisos requeridos para esta sección.',
            ], 403);
        }

        return $next($request);
    }
}
