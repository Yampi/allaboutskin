import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { checkRateLimit } from './rateLimit';

/**
 * Cuotas del análisis de imagen con Gemini.
 * Visitante sin cuenta: pocos análisis gratis por dispositivo (cookie firmada) y por IP.
 * Usuario con sesión: cuota diaria por usuario. Además hay un tope global diario.
 * Los contadores viven en memoria del servidor: se reinician al reiniciarlo.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const envInt = (name: string, fallback: number) => {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const DEVICE_COOKIE = 'scan_free';
export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const limits = () => ({
  deviceFree: envInt('SCAN_FREE_PER_DEVICE', 2),
  ipPerDay: envInt('SCAN_ANON_PER_IP_DAY', 3),
  userPerDay: envInt('SCAN_USER_PER_DAY', 20),
  globalPerDay: envInt('SCAN_GLOBAL_PER_DAY', 500),
});

// Sin SCAN_QUOTA_SECRET la clave es aleatoria por proceso: las cookies previas dejan de valer al reiniciar.
const secret = process.env.SCAN_QUOTA_SECRET || randomBytes(32).toString('hex');
const sign = (value: string) => createHmac('sha256', secret).update(value).digest('hex');

export function readDeviceCount(cookieValue: string | undefined): number {
  if (!cookieValue) return 0;
  const [count, mac] = cookieValue.split('.');
  if (!count || !mac || !/^\d{1,3}$/.test(count)) return 0;
  const expected = Buffer.from(sign(count));
  const given = Buffer.from(mac);
  return given.length === expected.length && timingSafeEqual(given, expected) ? Number(count) : 0;
}

export const encodeDeviceCount = (count: number) => `${count}.${sign(String(count))}`;

export type QuotaDecision =
  | { allowed: true; tier: 'user' | 'anonymous' }
  | { allowed: false; reason: 'ACCOUNT_REQUIRED' | 'USER_LIMIT' | 'GLOBAL_LIMIT'; message: string };

interface QuotaInput {
  userId: number | null;
  ip: string;
  deviceCount: number;
}

/** Consume cupo del tope global y del identificador correspondiente. */
export function checkScanQuota({ userId, ip, deviceCount }: QuotaInput): QuotaDecision {
  const l = limits();

  if (userId === null && deviceCount >= l.deviceFree) {
    return {
      allowed: false,
      reason: 'ACCOUNT_REQUIRED',
      message: 'Ya usaste tus análisis gratis. Crea una cuenta gratuita para seguir escaneando y guardar tu progreso.',
    };
  }

  const global = checkRateLimit('scan_global', { limit: l.globalPerDay, windowMs: DAY_MS });
  if (!global.allowed) {
    return {
      allowed: false,
      reason: 'GLOBAL_LIMIT',
      message: 'El análisis con IA está saturado por hoy. Vuelve a intentarlo mañana.',
    };
  }

  if (userId !== null) {
    const user = checkRateLimit(`scan_user_${userId}`, { limit: l.userPerDay, windowMs: DAY_MS });
    return user.allowed
      ? { allowed: true, tier: 'user' }
      : { allowed: false, reason: 'USER_LIMIT', message: `Alcanzaste el límite de ${l.userPerDay} análisis por día. Vuelve mañana.` };
  }

  const byIp = checkRateLimit(`scan_ip_${ip}`, { limit: l.ipPerDay, windowMs: DAY_MS });
  return byIp.allowed
    ? { allowed: true, tier: 'anonymous' }
    : {
        allowed: false,
        reason: 'ACCOUNT_REQUIRED',
        message: 'Se agotaron los análisis gratis desde esta conexión. Crea una cuenta gratuita para seguir.',
      };
}

const tokenCache = new Map<string, { userId: number; expiresAt: number }>();

/** Devuelve el id del usuario dueño del token Sanctum, o null si no hay sesión válida. */
export async function resolveUserId(authorization: string | null): Promise<number | null> {
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;

  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.userId;

  const backend = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';
  try {
    const res = await fetch(`${backend}/auth/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const id = (await res.json())?.user?.id;
    if (typeof id !== 'number') return null;
    tokenCache.set(token, { userId: id, expiresAt: Date.now() + 5 * 60 * 1000 });
    return id;
  } catch {
    return null;
  }
}
