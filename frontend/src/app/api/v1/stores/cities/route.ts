import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
  'http://127.0.0.1:8000/api/v1';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE_URL}/stores/cities${search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (
      lower !== 'host' &&
      lower !== 'connection' &&
      lower !== 'transfer-encoding' &&
      lower !== 'content-length'
    ) {
      headers.set(key, value);
    }
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const backendRes = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
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
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError' || err?.message?.includes('abort');
    const statusCode = isTimeout ? 504 : 503;
    const code = isTimeout ? 'TIMEOUT' : 'BACKEND_UNAVAILABLE';
    const message = isTimeout
      ? 'Tiempo de espera agotado (8000ms) al consultar directorio de ciudades.'
      : 'Servicio de directorio de ciudades no disponible temporalmente.';

    return NextResponse.json(
      {
        status: 'error',
        code,
        message,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  }
}
