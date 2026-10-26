import { NextRequest, NextResponse } from 'next/server';
import { classifyAndProcessImage } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { validateBase64Image, sanitizeText } from '@/lib/security';
import {
  checkScanQuota,
  resolveUserId,
  readDeviceCount,
  encodeDeviceCount,
  DEVICE_COOKIE,
  DEVICE_COOKIE_MAX_AGE,
} from '@/lib/scanQuota';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Stricter for image vision: Max 10 per minute per IP)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`scan_image_${ip}`, { limit: 10, windowMs: 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Has alcanzado el límite de análisis de imágenes por minuto. Por favor, reintenta en ${rateLimit.resetInSeconds} segundos.`,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetInSeconds.toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const body = await req.json();
    const { image, mimeType } = body;

    // 2. Validate payload format and size
    const imageValidation = validateBase64Image(image);
    if (!imageValidation.isValid) {
      return NextResponse.json({ error: imageValidation.error }, { status: 400 });
    }

    // 3. Cuota: visitantes con pocos análisis gratis; usuarios con sesión, cuota diaria
    const userId = await resolveUserId(req.headers.get('authorization'));
    const deviceCount = readDeviceCount(req.cookies.get(DEVICE_COOKIE)?.value);
    const quota = checkScanQuota({ userId, ip, deviceCount });
    if (!quota.allowed) {
      return NextResponse.json(
        { success: false, code: quota.reason, error: quota.message },
        { status: quota.reason === 'GLOBAL_LIMIT' ? 503 : 403 }
      );
    }

    const sanitizedMimeType = sanitizeText(mimeType || 'image/jpeg', 30);
    const scanResult = await classifyAndProcessImage(image, sanitizedMimeType);

    const response = NextResponse.json(
      {
        success: true,
        data: scanResult,
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    );
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
