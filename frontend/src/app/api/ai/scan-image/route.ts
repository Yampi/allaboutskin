import { NextRequest, NextResponse } from 'next/server';
import { classifyAndProcessImage, GeminiBusyError } from '@/lib/gemini';
import { getClientIp } from '@/lib/rateLimit';
import { validateBase64Image, sanitizeText } from '@/lib/security';
import {
  consumeScanQuota,
  readDeviceCount,
  encodeDeviceCount,
  DEVICE_COOKIE,
  DEVICE_COOKIE_MAX_AGE,
  type QuotaDecision,
} from '@/lib/scanQuota';

const QUOTA_STATUS: Record<Exclude<QuotaDecision, { allowed: true }>['reason'], number> = {
  ACCOUNT_REQUIRED: 403,
  USER_LIMIT: 403,
  RATE_LIMITED: 429,
  GLOBAL_LIMIT: 503,
  UNAVAILABLE: 503,
};

// Reintentos ante saturación de Gemini: dentro de una sola petición para consumir una única unidad de cuota
export const maxDuration = 60;
const MAX_ATTEMPTS = 4;
const TOTAL_BUDGET_MS = 50000;
const RETRY_DELAY_MS = 2000;

/** Eventos que recibe el cliente, uno por línea (NDJSON). */
export type ScanStreamEvent =
  | { type: 'retry'; attempt: number; message: string }
  | { type: 'result'; data: Awaited<ReturnType<typeof classifyAndProcessImage>> }
  | { type: 'error'; code?: 'AI_BUSY'; error: string };

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(timer); resolve(); }, { once: true });
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, mimeType } = body;

    // 1. Validar formato y tamaño antes de consumir cuota
    const imageValidation = validateBase64Image(image);
    if (!imageValidation.isValid) {
      return NextResponse.json({ error: imageValidation.error }, { status: 400 });
    }

    // 2. Cuota (en el backend): límite por minuto, análisis gratis por dispositivo e IP,
    //    cuota diaria por usuario y tope global
    const deviceCount = readDeviceCount(req.cookies.get(DEVICE_COOKIE)?.value);
    const quota = await consumeScanQuota({
      authorization: req.headers.get('authorization'),
      ip: getClientIp(req),
      deviceCount,
    });
    if (!quota.allowed) {
      return NextResponse.json(
        { success: false, code: quota.reason, error: quota.message },
        { status: QUOTA_STATUS[quota.reason] }
      );
    }

    const sanitizedMimeType = sanitizeText(mimeType || 'image/jpeg', 30);
    const signal = req.signal;
    const deadline = Date.now() + TOTAL_BUDGET_MS;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: ScanStreamEvent) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            // El cliente cerró la conexión
          }
        };
        try {
          for (let attempt = 1; ; attempt++) {
            try {
              const data = await classifyAndProcessImage(image, sanitizedMimeType, { signal, deadline });
              send({ type: 'result', data });
              return;
            } catch (err) {
              if (signal.aborted) return;
              const busy = err instanceof GeminiBusyError;
              const canRetry = busy && attempt < MAX_ATTEMPTS && Date.now() + RETRY_DELAY_MS + 5000 < deadline;
              if (!canRetry) {
                console.error('Error en /api/ai/scan-image:', err);
                send(
                  busy
                    ? { type: 'error', code: 'AI_BUSY', error: 'El servicio de IA de Google sigue saturado. Inténtalo de nuevo en unos minutos.' }
                    : { type: 'error', error: err instanceof Error ? err.message : 'Error al analizar la imagen con visión artificial' }
                );
                return;
              }
              send({ type: 'retry', attempt: attempt + 1, message: 'El servicio de IA de Google está saturado. Reintentando…' });
              await wait(RETRY_DELAY_MS, signal);
            }
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Ya estaba cerrado porque el cliente canceló
          }
        }
      },
    });

    // La cuota ya se consumió en el backend, así que el contador del dispositivo se actualiza ahora
    const response = new NextResponse(stream, {
      headers: { 'Content-Type': 'application/x-ndjson; charset=utf-8', 'Cache-Control': 'no-store' },
    });
    if (quota.tier === 'anonymous') {
      response.cookies.set(DEVICE_COOKIE, encodeDeviceCount(deviceCount + 1), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: DEVICE_COOKIE_MAX_AGE,
        path: '/',
      });
    }
    return response;
  } catch (error: unknown) {
    console.error('Error en /api/ai/scan-image:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : undefined) || 'Error al analizar la imagen con visión artificial',
      },
      { status: 500 }
    );
  }
}
