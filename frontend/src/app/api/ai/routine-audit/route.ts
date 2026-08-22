import { NextRequest, NextResponse } from 'next/server';
import { auditFullRoutineWithAi } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeText } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 15 requests per minute per IP)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`routine_audit_${ip}`, { limit: 15, windowMs: 60 * 1000 });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Has superado el límite de análisis de rutinas por minuto. Por favor, reintenta en ${rateLimit.resetInSeconds} segundos.`,
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
    const { products, skin_type } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Se requiere al menos un producto en el listado para auditar la rutina.' },
        { status: 400 }
      );
    }

    // Limit to max 20 products per routine audit to prevent token explosion
    const sanitizedProducts = products.slice(0, 20).map((p: any) => ({
      name: sanitizeText(p.name || '', 120),
      brand: sanitizeText(p.brand || '', 80),
      category: sanitizeText(p.category || '', 40),
      ingredients: sanitizeText(p.ingredients || '', 3000),
    }));

    const sanitizedSkinType = sanitizeText(skin_type || 'COMBINATION', 30);
    const auditResult = await auditFullRoutineWithAi(sanitizedProducts, sanitizedSkinType);

    return NextResponse.json(
      {
        success: true,
        data: auditResult,
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    );
  } catch (error: any) {
    console.error('Error en /api/ai/routine-audit:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al auditar la rutina completa',
      },
      { status: 500 }
    );
  }
}
