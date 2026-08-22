import { NextRequest, NextResponse } from 'next/server';
import { getAiDiagnosis, askAiCopilot } from '@/lib/gemini';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sanitizeQuestion, sanitizeInci, sanitizeText } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 25 requests per minute per IP)
    const ip = getClientIp(req);
    const rateLimit = checkRateLimit(`advisor_${ip}`, { limit: 25, windowMs: 60 * 1000 });
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Has superado el límite de consultas permitidas por minuto. Por favor, reintenta en ${rateLimit.resetInSeconds} segundos.`,
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
    const { action, inci_text, skin_type, concerns, product_name, question, history } = body;

    // Action 1: Q&A Chat with Copilot
    if (action === 'chat') {
      const sanitizedQuestion = sanitizeQuestion(question || '');
      if (!sanitizedQuestion) {
        return NextResponse.json({ error: 'La pregunta es obligatoria o inválida.' }, { status: 400 });
      }

      const sanitizedInci = sanitizeInci(inci_text || '');
      const sanitizedProductName = sanitizeText(product_name || 'Producto Cosmético', 120);
      const sanitizedSkinType = sanitizeText(skin_type || 'COMBINATION', 30);

      const sanitizedHistory = Array.isArray(history) 
        ? history.slice(-6).map((h: any) => ({
            role: h.role === 'user' ? 'user' as const : 'assistant' as const,
            content: sanitizeText(h.content || '', 600),
          }))
        : [];

      const answer = await askAiCopilot(
        sanitizedQuestion,
        sanitizedInci,
        sanitizedProductName,
        sanitizedHistory,
        sanitizedSkinType
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            answer,
            timestamp: new Date().toISOString(),
          },
        },
        {
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          }
        }
      );
    }

    // Action 2: Generate Comprehensive Clinical AI Diagnosis
    const sanitizedInci = sanitizeInci(inci_text || '');
    if (!sanitizedInci) {
      return NextResponse.json({ error: 'La lista de ingredientes (inci_text) es requerida.' }, { status: 400 });
    }

    const sanitizedProductName = sanitizeText(product_name || 'Producto Cosmético', 120);
    const sanitizedSkinType = sanitizeText(skin_type || 'COMBINATION', 30);
    const sanitizedConcerns = Array.isArray(concerns)
      ? concerns.slice(0, 10).map((c: any) => sanitizeText(String(c), 50))
      : [];

    const diagnosis = await getAiDiagnosis(
      sanitizedInci,
      sanitizedSkinType,
      sanitizedConcerns,
      sanitizedProductName
    );

    return NextResponse.json(
      {
        success: true,
        data: diagnosis,
      },
      {
        headers: {
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        }
      }
    );
  } catch (error: any) {
    console.error('Error en /api/ai/advisor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al procesar consulta con IA',
      },
      { status: 500 }
    );
  }
}
