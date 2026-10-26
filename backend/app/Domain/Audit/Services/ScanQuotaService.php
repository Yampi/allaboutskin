<?php

namespace App\Domain\Audit\Services;

use Illuminate\Support\Facades\RateLimiter;

/**
 * Cuotas del análisis de imagen con IA. Los contadores viven en la caché de Laravel
 * (base de datos en producción), así que se comparten entre instancias y sobreviven
 * a reinicios del servidor web.
 *
 * Visitante sin cuenta: pocos análisis gratis por dispositivo y por IP.
 * Usuario con sesión: cuota diaria por usuario. Además hay un tope global diario.
 */
class ScanQuotaService
{
    private const DAY_SECONDS = 86400;

    /**
     * Consume cupo solo si todos los límites aplicables lo permiten.
     *
     * @return array{allowed: true, tier: 'user'|'anonymous'}|array{allowed: false, reason: string, message: string}
     */
    public function consume(?int $userId, string $ip, int $deviceCount): array
    {
        $limits = config('services.scan_quota');

        $minuteKey = "scan-quota:minute:{$ip}";
        if (RateLimiter::tooManyAttempts($minuteKey, $limits['ip_per_minute'])) {
            $seconds = RateLimiter::availableIn($minuteKey);

            return $this->deny('RATE_LIMITED', "Has alcanzado el límite de análisis por minuto. Reintenta en {$seconds} segundos.");
        }

        if ($userId === null && $deviceCount >= $limits['device_free']) {
            return $this->deny('ACCOUNT_REQUIRED', 'Ya usaste tus análisis gratis. Crea una cuenta gratuita para seguir escaneando y guardar tu progreso.');
        }

        $globalKey = 'scan-quota:global';
        if (RateLimiter::tooManyAttempts($globalKey, $limits['global_per_day'])) {
            return $this->deny('GLOBAL_LIMIT', 'El análisis con IA está saturado por hoy. Vuelve a intentarlo mañana.');
        }

        if ($userId !== null) {
            $identityKey = "scan-quota:user:{$userId}";
            if (RateLimiter::tooManyAttempts($identityKey, $limits['user_per_day'])) {
                return $this->deny('USER_LIMIT', "Alcanzaste el límite de {$limits['user_per_day']} análisis por día. Vuelve mañana.");
            }
        } else {
            $identityKey = "scan-quota:ip:{$ip}";
            if (RateLimiter::tooManyAttempts($identityKey, $limits['ip_per_day'])) {
                return $this->deny('ACCOUNT_REQUIRED', 'Se agotaron los análisis gratis desde esta conexión. Crea una cuenta gratuita para seguir.');
            }
        }

        RateLimiter::hit($minuteKey, 60);
        RateLimiter::hit($globalKey, self::DAY_SECONDS);
        RateLimiter::hit($identityKey, self::DAY_SECONDS);

        return ['allowed' => true, 'tier' => $userId !== null ? 'user' : 'anonymous'];
    }

    private function deny(string $reason, string $message): array
    {
        return ['allowed' => false, 'reason' => $reason, 'message' => $message];
    }
}
