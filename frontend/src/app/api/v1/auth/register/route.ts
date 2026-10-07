import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Por favor, completa tu nombre, correo electrónico y contraseña.' },
        { status: 422 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'La contraseña debe contener al menos 8 caracteres.' },
        { status: 422 }
      );
    }

    // Conexión al Backend Laravel central
    const backendUrl = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';

    try {
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        return NextResponse.json(data, { status: res.status });
      }

      return NextResponse.json(
        { message: data.message || 'Error al procesar el registro.' },
        { status: res.status }
      );
    } catch (proxyErr) {
      console.warn('Fallo de conexión con backend central para registro:', proxyErr);
      return NextResponse.json(
        { message: 'El servicio central de registro no responde temporalmente. Intenta nuevamente.' },
        { status: 503 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Error interno del servidor al procesar el registro.' },
      { status: 500 }
    );
  }
}
