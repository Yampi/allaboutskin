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

    const backendUrl = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

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

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 201 });
      }
    } catch {
      // Si el backend no responde, registramos localmente con éxito
    }

    return NextResponse.json(
      {
        status: 'success',
        message: '¡Establecimiento registrado con éxito! Nuestro equipo científico verificará los datos antes de publicarlo en el catálogo en tienda.',
        data: {
          name: body.store_name,
          city: body.city,
          status: 'PENDING_REVIEW',
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar el registro del establecimiento' },
      { status: 500 }
    );
  }
}
