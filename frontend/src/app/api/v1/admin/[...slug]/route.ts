import { NextRequest, NextResponse } from 'next/server';

// Mock state for Vercel standalone demo
let mockStores: any[] = [
  {
    id: 1,
    owner_id: 10,
    name: 'Río Supermercado - Valle de la Pascua',
    slug: 'rio-supermercado-traki-valle-de-la-pascua',
    website_url: 'https://riosupermarket.com',
    logo_url: null,
    store_type: 'HYBRID' as const,
    country_code: 'VE',
    instagram_handle: '@riosupermarket',
    whatsapp_contact: '+584121234567',
    is_independent: false,
    verification_status: 'VERIFIED' as const,
    subscription_tier: 'PRO_LOCAL' as const,
    subscription_expires_at: null,
    is_featured: true,
    verified_at: '2026-09-01T12:00:00Z',
    rejected_reason: null,
    submitted_by_email: 'gerencia@riosupermarket.com',
    community_notes: 'Cadena de supermercados con departamento de cosmética.',
    is_active: true,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
    branches_count: 1,
    product_offers_count: 6,
    lead_interactions_count: 24,
    owner: {
      id: 10,
      name: 'Gerencia Río Supermercado',
      email: 'comercio@riosupermarket.com',
      role: 'business_owner',
      phone: '+58 412 1234567',
    },
    branches: [
      {
        id: 1,
        name: 'Río Supermercado - C.C. Traki',
        city: 'Valle de la Pascua',
        state: 'Guárico',
        is_active: true,
        slug: 'rio-supermercado-traki-valle-de-la-pascua',
        address: 'Av. Rómulo Gallegos, Centro Comercial Traki, Planta Baja, Local L-4',
        phone: '0235-3420000',
        whatsapp: '+584121234567',
      },
    ],
  },
  {
    id: 2,
    owner_id: 11,
    name: 'Farmacia San Juan Bautista',
    slug: 'farmacia-san-juan-bautista-pascua',
    website_url: null,
    logo_url: null,
    store_type: 'PHYSICAL' as const,
    country_code: 'VE',
    instagram_handle: '@farmaciasanjuan',
    whatsapp_contact: '+584241112233',
    is_independent: true,
    verification_status: 'PENDING_REVIEW' as const,
    subscription_tier: 'FREE' as const,
    subscription_expires_at: null,
    is_featured: false,
    verified_at: null,
    rejected_reason: null,
    submitted_by_email: 'contacto@farmaciasanjuan.com',
    community_notes: 'Farmacia independiente solicitando alta de sucursal centro.',
    is_active: true,
    created_at: '2026-09-06T15:30:00Z',
    updated_at: '2026-09-06T15:30:00Z',
    branches_count: 1,
    product_offers_count: 3,
    lead_interactions_count: 5,
    owner: {
      id: 11,
      name: 'Dr. Marcos Pérez',
      email: 'marcos@farmaciasanjuan.com',
      role: 'business_owner',
      phone: '+58 424 1112233',
    },
    branches: [
      {
        id: 2,
        name: 'Farmacia San Juan - Sede Centro',
        city: 'Valle de la Pascua',
        state: 'Guárico',
        is_active: true,
        slug: 'farmacia-san-juan-centro',
        address: 'Calle Real cruce con Calle Paraíso',
        phone: '0235-3419988',
        whatsapp: '+584241112233',
      },
    ],
  },
];

let mockUsers = [
  {
    id: 4,
    name: 'Brian Baloa',
    email: 'brian.baloa@gmail.com',
    role: 'super_admin',
    is_active: true,
    created_at: '2026-09-06T20:00:00Z',
    locked_until: null,
    failed_login_attempts: 0,
  },
  {
    id: 1,
    name: 'Super Administrador',
    email: 'admin@allaboutskin.com',
    role: 'super_admin',
    is_active: true,
    created_at: '2026-08-20T10:00:00Z',
    locked_until: null,
    failed_login_attempts: 0,
  },
  {
    id: 2,
    name: 'Dra. Elena Vasquez (Dermatóloga)',
    email: 'dermatology@allaboutskin.com',
    role: 'scientific_editor',
    is_active: true,
    created_at: '2026-08-21T10:00:00Z',
    locked_until: null,
    failed_login_attempts: 0,
  },
  {
    id: 10,
    name: 'Gerencia Río Supermercado',
    email: 'comercio@riosupermarket.com',
    role: 'business_owner',
    is_active: true,
    created_at: '2026-09-01T10:00:00Z',
    locked_until: null,
    failed_login_attempts: 0,
  },
];

async function tryProxyToLaravel(req: NextRequest, slugPath: string) {
  const backendUrl = process.env.LARAVEL_API_URL;
  if (!backendUrl) return null;

  try {
    const url = new URL(req.url);
    const targetUrl = `${backendUrl}/admin/${slugPath}${url.search}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await req.text() : undefined;

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: req.headers.get('Authorization') || '',
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok || res.status === 422 || res.status === 401 || res.status === 403) {
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }
  } catch (err) {
    console.warn('Laravel proxy unreachable for admin, using local fallback:', err);
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  // Proxy attempt
  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  // 1. Admin Stores list
  if (slug[0] === 'stores' && slug.length === 1) {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('verification_status');
    const tierFilter = url.searchParams.get('subscription_tier');
    const search = (url.searchParams.get('search') || '').toLowerCase();

    let filtered = [...mockStores];
    if (statusFilter) {
      filtered = filtered.filter((s) => s.verification_status === statusFilter);
    }
    if (tierFilter) {
      filtered = filtered.filter((s) => s.subscription_tier === tierFilter);
    }
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.owner?.name.toLowerCase().includes(search) ||
          s.owner?.email.toLowerCase().includes(search)
      );
    }

    const pendingCount = mockStores.filter((s) => s.verification_status === 'PENDING_REVIEW').length;
    const verifiedCount = mockStores.filter((s) => s.verification_status === 'VERIFIED').length;

    return NextResponse.json({
      status: 'success',
      summary: {
        pending_review: pendingCount,
        total_verified: verifiedCount,
        total_stores: mockStores.length,
      },
      stores: {
        current_page: 1,
        data: filtered,
        last_page: 1,
        total: filtered.length,
      },
    });
  }

  // 2. Admin Users list
  if (slug[0] === 'users' && slug.length === 1) {
    return NextResponse.json({
      current_page: 1,
      data: mockUsers,
      last_page: 1,
      total: mockUsers.length,
    });
  }

  // 3. Security logs & stats
  if (slug[0] === 'security') {
    if (slug[1] === 'logs') {
      return NextResponse.json({
        data: [
          {
            id: 1,
            event_type: 'ADMIN_LOGIN_SUCCESS',
            severity: 'INFO',
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            resource_target: 'brian.baloa@gmail.com',
            description: 'Inicio de sesión administrativo verificado.',
            payload: {},
            created_at: new Date().toISOString(),
            user: { id: 4, name: 'Brian Baloa', email: 'brian.baloa@gmail.com', role: 'super_admin' },
          },
          {
            id: 2,
            event_type: 'STORE_REGISTERED',
            severity: 'INFO',
            ip_address: '190.200.10.5',
            user_agent: 'Chrome/128.0',
            resource_target: 'AffiliateStore #2',
            description: 'Nueva tienda Farmacia San Juan registrada para revisión.',
            payload: {},
            created_at: new Date(Date.now() - 3600000).toISOString(),
            user: { id: 11, name: 'Dr. Marcos Pérez', email: 'marcos@farmaciasanjuan.com', role: 'business_owner' },
          },
        ],
        last_page: 1,
      });
    }

    if (slug[1] === 'stats') {
      return NextResponse.json({
        stats: {
          total_logs: 48,
          critical_events: 0,
          warnings: 2,
          locked_accounts: 0,
        },
      });
    }
  }

  // 4. Settings & Health
  if (slug[0] === 'settings') {
    if (slug[1] === 'health') {
      return NextResponse.json({
        health: {
          database: 'healthy',
          cache: 'connected',
          queue: 'idle',
          disk_free: '85%',
        },
      });
    }

    return NextResponse.json({
      settings: {
        security: [
          { key: 'max_login_attempts', value: '5', group: 'security', type: 'number', description: 'Intentos fallidos antes de bloqueo' },
          { key: 'lockout_duration_minutes', value: '15', group: 'security', type: 'number', description: 'Duración del bloqueo temporal' },
        ],
        monetization: [
          { key: 'pro_local_price_usd', value: '29.00', group: 'monetization', type: 'string', description: 'Costo mensual plan Pro Local' },
          { key: 'enterprise_price_usd', value: '79.00', group: 'monetization', type: 'string', description: 'Costo mensual plan Enterprise' },
        ],
      },
    });
  }

  return NextResponse.json({ message: 'Ruta no encontrada' }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  const body = await req.json().catch(() => ({}));

  // Store verification / subscription / toggle
  if (slug[0] === 'stores' && slug.length >= 3) {
    const storeId = parseInt(slug[1]);
    const action = slug[2];
    const storeIndex = mockStores.findIndex((s) => s.id === storeId);

    if (storeIndex !== -1) {
      if (action === 'verification') {
        mockStores[storeIndex].verification_status = body.verification_status;
        if (body.verification_status === 'VERIFIED') {
          mockStores[storeIndex].is_active = true;
          mockStores[storeIndex].verified_at = new Date().toISOString();
        } else if (body.verification_status === 'REJECTED') {
          mockStores[storeIndex].rejected_reason = body.rejected_reason || 'Rechazado';
        }
        return NextResponse.json({ status: 'success', store: mockStores[storeIndex] });
      }

      if (action === 'subscription') {
        if (body.subscription_tier) mockStores[storeIndex].subscription_tier = body.subscription_tier;
        if (body.is_featured !== undefined) mockStores[storeIndex].is_featured = body.is_featured;
        return NextResponse.json({ status: 'success', store: mockStores[storeIndex] });
      }

      if (action === 'toggle-status') {
        mockStores[storeIndex].is_active = !mockStores[storeIndex].is_active;
        return NextResponse.json({
          status: 'success',
          is_active: mockStores[storeIndex].is_active,
          message: mockStores[storeIndex].is_active ? 'Comercio activado' : 'Comercio desactivado',
        });
      }
    }
  }

  // Users toggle or role
  if (slug[0] === 'users' && slug.length >= 3) {
    const userId = parseInt(slug[1]);
    const action = slug[2];
    const userIndex = mockUsers.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      if (action === 'role') {
        mockUsers[userIndex].role = body.role;
        return NextResponse.json({ status: 'success', user: mockUsers[userIndex] });
      }
      if (action === 'toggle-status') {
        mockUsers[userIndex].is_active = !mockUsers[userIndex].is_active;
        return NextResponse.json({ status: 'success', user: mockUsers[userIndex] });
      }
    }
  }

  return NextResponse.json({ status: 'success', message: 'Operación simulada con éxito en Vercel' });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  return NextResponse.json({ status: 'success', message: 'Configuraciones guardadas' });
}
