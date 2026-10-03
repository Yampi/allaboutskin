import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.store_name || !body.address || !body.city) {
      return NextResponse.json(
        { error: 'El nombre, la dirección y la ciudad son obligatorios.' },
        { status: 422 }
      );
    }

    const backendUrl = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${backendUrl}/stores/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    } catch (fetchErr) {
      console.error('Error connecting to backend in /stores/suggest:', fetchErr);
      return NextResponse.json(
        { error: 'No se pudo conectar con el servidor de base de datos para registrar el comercio. Verifica que el backend esté activo.' },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar el registro del establecimiento' },
      { status: 500 }
    );
  }
}
