<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rutas que solo llama el servidor Next.js: exigen el secreto compartido INTERNAL_API_SECRET
 * en la cabecera X-Internal-Secret. Sin secreto configurado la ruta queda cerrada.
 */
class EnsureInternalRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('services.internal.secret');

        if ($secret === '') {
            return response()->json([
                'status' => 'error',
                'error_type' => 'INTERNAL_SECRET_NOT_CONFIGURED',
                'message' => 'Servicio interno no configurado.',
            ], 503);
        }

        if (! hash_equals($secret, (string) $request->header('X-Internal-Secret'))) {
            return response()->json([
                'status' => 'error',
                'error_type' => 'FORBIDDEN',
                'message' => 'No autorizado.',
            ], 403);
        }

        return $next($request);
    }
}
