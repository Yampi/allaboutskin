import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { isIP } from 'net';

/**
 * Cuotas del análisis de imagen con Gemini.
 * Los contadores viven en el backend (caché de Laravel), compartidos entre instancias
 * serverless y persistentes entre reinicios. Aquí solo se firma la cookie del
 * dispositivo y se consulta al backend. Si el backend no responde, se deniega:
 * sin cuota verificable no se llama a la IA de pago.
 */

export const DEVICE_COOKIE = 'scan_free';
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const isProduction = process.env.NODE_ENV === 'production';

// En desarrollo, sin SCAN_QUOTA_SECRET la clave es aleatoria por proceso: las cookies previas dejan de valer al reiniciar.
const secret = process.env.SCAN_QUOTA_SECRET || (isProduction ? '' : randomBytes(32).toString('hex'));
const sign = (value: string) => createHmac('sha256', secret).update(value).digest('hex');

export function readDeviceCount(cookieValue: string | undefined): number {
  if (!cookieValue || !secret) return 0;
  const [count, mac] = cookieValue.split('.');
  if (!count || !mac || !/^\d{1,3}$/.test(count)) return 0;
  const expected = Buffer.from(sign(count));
  const given = Buffer.from(mac);
  return given.length === expected.length && timingSafeEqual(given, expected) ? Number(count) : 0;
}

export const encodeDeviceCount = (count: number) => `${count}.${sign(String(count))}`;

export type QuotaDecision =
  | { allowed: true; tier: 'user' | 'anonymous' }
  | {
      allowed: false;
      reason: 'ACCOUNT_REQUIRED' | 'USER_LIMIT' | 'GLOBAL_LIMIT' | 'RATE_LIMITED' | 'UNAVAILABLE';
      message: string;
    };

interface QuotaInput {
  authorization: string | null;
  ip: string;
  deviceCount: number;
}

const unavailable = (message: string): QuotaDecision => ({ allowed: false, reason: 'UNAVAILABLE', message });

/** Pide al backend que consuma una unidad de cuota. El backend resuelve el usuario a partir del token. */
export async function consumeScanQuota({ authorization, ip, deviceCount }: QuotaInput): Promise<QuotaDecision> {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret || !secret) {
    console.error('scan-quota: faltan INTERNAL_API_SECRET o SCAN_QUOTA_SECRET');
    return unavailable('El análisis con IA no está disponible en este momento.');
  }

  const backend = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Internal-Secret': internalSecret,
  };
  if (authorization && /^Bearer\s+\S+$/i.test(authorization)) headers.Authorization = authorization;

  try {
    const res = await fetch(`${backend}/internal/scan-quota`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ip: isIP(ip) ? ip : '0.0.0.0', device_count: deviceCount }),
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`scan-quota: el backend respondió ${res.status}`);
      return unavailable('No se pudo verificar tu cuota de análisis. Inténtalo de nuevo en unos minutos.');
    }
    return (await res.json()) as QuotaDecision;
  } catch (error) {
    console.error('scan-quota: backend inaccesible', error);
    return unavailable('No se pudo verificar tu cuota de análisis. Inténtalo de nuevo en unos minutos.');
  }
}
