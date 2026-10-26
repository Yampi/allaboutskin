<?php

use App\Http\Middleware\EnsureInternalRequest;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SecurityHeadersMiddleware::class);

        // API pura: sin ruta `login` a la que redirigir, un invitado recibe 401 JSON
        // (antes RouteNotFoundException -> 500 aunque faltara el header Accept).
        $middleware->redirectGuestsTo(fn () => null);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'internal' => EnsureInternalRequest::class,
        ]);

        // Detrás de Cloudflare Tunnel o de un PaaS todas las peticiones llegan desde el proxy:
        // sin esto los límites por IP agruparían a todos los visitantes en una sola IP.
        $trustedProxies = array_filter(array_map('trim', explode(',', (string) env('TRUSTED_PROXIES', ''))));
        if ($trustedProxies !== []) {
            $middleware->trustProxies(at: $trustedProxies === ['*'] ? '*' : $trustedProxies);
        }
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (\Illuminate\Http\Request $request, \Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // Report unhandled system errors directly to SecurityAuditLog for Admin supervision
        $exceptions->report(function (\Throwable $e) {
            if ($e instanceof \Illuminate\Validation\ValidationException ||
                $e instanceof \Illuminate\Auth\AuthenticationException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException ||
                $e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException) {
                return;
            }

            try {
                \App\Models\SecurityAuditLog::logEvent(
                    eventType: 'SYSTEM_UNHANDLED_EXCEPTION',
                    description: 'Error no controlado: ' . class_basename($e) . ' - ' . substr($e->getMessage(), 0, 200),
                    userId: auth()->check() ? auth()->id() : null,
                    severity: 'CRITICAL',
                    target: request()->path(),
                    payload: [
                        'exception' => get_class($e),
                        'message' => $e->getMessage(),
                        'file' => basename($e->getFile()) . ':' . $e->getLine(),
                        'method' => request()->method(),
                        'url' => request()->fullUrl(),
                        'ip' => request()->ip(),
                    ]
                );
            } catch (\Throwable $loggingErr) {
                // Ignore DB logging failure to avoid cascade loops
            }
        });

        // 401 Unauthenticated
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'error_type' => 'UNAUTHENTICATED',
                    'message' => 'Debes iniciar sesión para realizar esta acción.',
                    'action_required' => 'login',
                ], 401);
            }
        });

        // 403 Access Denied
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'error_type' => 'FORBIDDEN',
                    'message' => 'No tienes los permisos necesarios para acceder a esta sección.',
                    'action_required' => 'insufficient_permissions',
                ], 403);
            }
        });

        // 429 Too Many Requests
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $retryAfter = (int) ($e->getHeaders()['Retry-After'] ?? 60);

                return response()->json([
                    'status' => 'error',
                    'error_type' => 'TOO_MANY_REQUESTS',
                    'message' => "Demasiadas solicitudes. Vuelve a intentarlo en {$retryAfter} segundos.",
                    'retry_after_seconds' => $retryAfter,
                ], 429, $e->getHeaders());
            }
        });

        // 422 Validation Error
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'status' => 'error',
                    'error_type' => 'VALIDATION_ERROR',
                    'message' => 'Los datos proporcionados no son válidos.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });
    })->create();
