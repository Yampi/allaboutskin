import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL =
  process.env.LARAVEL_API_URL ||
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ||
  'http://127.0.0.1:8000/api/v1';

async function proxyAdminRequest(req: NextRequest, slug: string[]): Promise<NextResponse> {
  const subpath = slug.join('/');
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_BASE_URL}/admin/${subpath}${search}`;

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
    let body: ArrayBuffer | undefined = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = await req.arrayBuffer();
    }

    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const responseBody = await backendRes.arrayBuffer();
    const responseHeaders = new Headers();
    const contentType = backendRes.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);
    const retryAfter = backendRes.headers.get('retry-after');
    if (retryAfter) responseHeaders.set('retry-after', retryAfter);

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
      ? 'Tiempo de espera agotado (8000ms) al comunicar con el panel de administración central.'
      : 'Servicio central de administración no disponible temporalmente.';

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

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyAdminRequest(req, slug);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyAdminRequest(req, slug);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyAdminRequest(req, slug);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyAdminRequest(req, slug);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyAdminRequest(req, slug);
}
