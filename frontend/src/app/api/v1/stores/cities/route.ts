import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${backendUrl}/stores/cities`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  return NextResponse.json({
    status: 'success',
    total_locations: 1,
    locations: [
      {
        state: 'Guárico',
        city: 'Valle de la Pascua',
        total_branches: 6,
      },
    ],
  });
}
