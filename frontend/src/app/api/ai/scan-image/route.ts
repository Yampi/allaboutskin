import { NextRequest, NextResponse } from 'next/server';
import { classifyAndProcessImage } from '@/lib/gemini';
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
    const scanResult = await classifyAndProcessImage(image, sanitizedMimeType);

    const response = NextResponse.json({ success: true, data: scanResult });
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
