import { NextRequest, NextResponse } from 'next/server';
import { classifyAndProcessImage } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { validateBase64Image, sanitizeText } from '@/lib/security';

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

    const sanitizedMimeType = sanitizeText(mimeType || 'image/jpeg', 30);
    const scanResult = await classifyAndProcessImage(image, sanitizedMimeType);

    return NextResponse.json(
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
  } catch (error: any) {
    console.error('Error en /api/ai/scan-image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al analizar la imagen con visión artificial',
      },
      { status: 500 }
    );
  }
}
