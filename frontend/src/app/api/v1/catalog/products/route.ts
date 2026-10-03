import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Try proxy to Laravel
  const backendUrl = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const queryString = searchParams.toString();
    const targetUrl = `${backendUrl}/catalog/products${queryString ? `?${queryString}` : ''}`;
    
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    console.error('Error proxying catalog products to Laravel:', err);
  }

  return NextResponse.json({
    current_page: 1,
    data: [],
    last_page: 1,
    total: 0,
  });
}
