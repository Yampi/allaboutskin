import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Por favor, introduce tu correo electrónico y contraseña.' },
        { status: 422 }
      );
    }

    // 1. Conexión al Backend Laravel central
    const backendUrl = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_LARAVEL_API_URL;
    let proxyFailed = false;

    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          return NextResponse.json(
            { message: errData.message || 'Credenciales inválidas. Verifica tu correo y contraseña.' },
            { status: res.status }
          );
        }
      } catch (proxyErr) {
        console.warn('Fallo de conexión con el backend central Laravel:', proxyErr);
        proxyFailed = true;
      }
    }

    // 2. Control de fallback: únicamente si está explícitamente activado en desarrollo
    const isDemoAuthEnabled = process.env.ENABLE_DEMO_AUTH === 'true' || (process.env.NODE_ENV === 'development' && !backendUrl);

    if (isDemoAuthEnabled) {
      const demoAdminPass = process.env.DEMO_ADMIN_PASSWORD;

      if (email.includes('admin') || email.includes('editor')) {
        if (demoAdminPass && password === demoAdminPass) {
          return NextResponse.json({
            message: 'Inicio de sesión demo como Administrador.',
            access_token: 'demo_token_admin_' + Date.now(),
            token_type: 'Bearer',
            user: {
              id: 1,
              name: 'Administrador Demo',
              email,
              role: 'admin',
              is_active: true,
            },
          });
        }
      }

      if (email.includes('tienda') || email.includes('comercio') || email.includes('farmacia')) {
        return NextResponse.json({
          message: 'Inicio de sesión comercial demo exitoso.',
          access_token: 'demo_token_merchant_' + Date.now(),
          token_type: 'Bearer',
          user: {
            id: 10,
            name: email.split('@')[0],
            email,
            role: 'business_owner',
            is_active: true,
          },
        });
      }

      if (password.length >= 6) {
        return NextResponse.json({
          message: 'Inicio de sesión demo exitoso.',
          access_token: 'demo_token_user_' + Date.now(),
          token_type: 'Bearer',
          user: {
            id: 99,
            name: email.split('@')[0],
            email,
            role: 'standard_user',
            is_active: true,
          },
        });
      }
    }

    // Si el proxy falló y no hay demo auth permitido, responder con servicio no disponible
    if (proxyFailed) {
      return NextResponse.json(
        { message: 'El servicio central de autenticación está temporalmente inaccesible. Por favor, reintenta en unos instantes.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Error interno del servidor al procesar la autenticación.' },
      { status: 500 }
    );
  }
}
