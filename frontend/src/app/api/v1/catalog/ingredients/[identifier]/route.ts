import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
  'http://127.0.0.1:8000/api/v1';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const { identifier } = await params;
  const targetUrl = `${BACKEND_BASE_URL}/catalog/ingredients/${encodeURIComponent(identifier)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const backendRes = await fetch(targetUrl, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    const responseBody = await backendRes.arrayBuffer();
    const responseHeaders = new Headers();
    const contentType = backendRes.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);

    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'));
    return NextResponse.json(
      {
        status: 'error',
        code: isTimeout ? 'TIMEOUT' : 'BACKEND_UNAVAILABLE',
        message: isTimeout
          ? 'Tiempo de espera agotado al consultar la ficha del ingrediente.'
          : 'El catálogo de ingredientes no está disponible en este momento.',
        timestamp: new Date().toISOString(),
      },
      { status: isTimeout ? 504 : 503 }
    );
  }
}
