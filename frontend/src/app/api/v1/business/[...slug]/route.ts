import { NextRequest, NextResponse } from 'next/server';

let mockBusinessStore = {
  id: 1,
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
  is_active: true,
  subscription_tier: 'PRO_LOCAL' as const,
  subscription_tier_label: 'Plan Pro Local',
  subscription_expires_at: null,
  is_featured: true,
  branches_count: 1,
  offers_count: 3,
  leads_this_month: 24,
};

let mockBusinessBranches: any[] = [
  {
    id: 1,
    store_id: 1,
    name: 'Río Supermercado - Sede Principal C.C. Traki',
    slug: 'rio-supermercado-traki-valle-de-la-pascua',
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Av. Rómulo Gallegos, Centro Comercial Traki, Planta Baja, Local L-4',
    reference_point: 'C.C. Traki, PB frente a las escaleras mecánicas',
    latitude: 9.2185,
    longitude: -66.009,
    geofence_radius_meters: 100,
    phone: '0235-3420000',
    whatsapp: '+584121234567',
    opening_hours: 'Lunes a Domingo: 8:00 AM - 9:00 PM',
    is_active: true,
    offers_count: 3,
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
  },
];

let mockBusinessOffers: any[] = [
  {
    id: 1,
    store_id: 1,
    product_id: 101,
    branch_id: 1,
    price: 16.5,
    price_ves: 742.5,
    currency: 'USD',
    in_stock: true,
    product_url: null,
    last_checked_at: new Date().toISOString(),
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
    product: {
      id: 101,
      name: 'CeraVe Gel Limpiador Espumoso (236ml)',
      slug: 'cerave-foaming-facial-cleanser',
      barcode_ean: '3337875597180',
      category: 'Limpiador Facial',
      image_url: null,
      brand: { id: 1, name: 'CeraVe', slug: 'cerave' },
    },
    branch: { id: 1, name: 'Río Supermercado - Sede C.C. Traki', slug: 'rio-supermercado-traki-valle-de-la-pascua', city: 'Valle de la Pascua' },
  },
  {
    id: 2,
    store_id: 1,
    product_id: 102,
    branch_id: 1,
    price: 13.5,
    price_ves: 607.5,
    currency: 'USD',
    in_stock: true,
    product_url: null,
    last_checked_at: new Date().toISOString(),
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
    product: {
      id: 102,
      name: 'Nivea Sun UV Rostro Control de Brillo FPS 50+ (50ml)',
      slug: 'nivea-sun-control-de-brillo-fps50',
      barcode_ean: '4005900593741',
      category: 'Protector Solar',
      image_url: null,
      brand: { id: 2, name: 'Nivea', slug: 'nivea' },
    },
    branch: { id: 1, name: 'Río Supermercado - Sede C.C. Traki', slug: 'rio-supermercado-traki-valle-de-la-pascua', city: 'Valle de la Pascua' },
  },
  {
    id: 3,
    store_id: 1,
    product_id: 103,
    branch_id: 1,
    price: 18.0,
    price_ves: 810.0,
    currency: 'USD',
    in_stock: true,
    product_url: null,
    last_checked_at: new Date().toISOString(),
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-06T12:00:00Z',
    product: {
      id: 103,
      name: 'Neutrogena Hydro Boost Water Gel Ácido Hialurónico (50g)',
      slug: 'neutrogena-hydro-boost-water-gel',
      barcode_ean: '7891010885236',
      category: 'Hidratante Facial',
      image_url: null,
      brand: { id: 3, name: 'Neutrogena', slug: 'neutrogena' },
    },
    branch: { id: 1, name: 'Río Supermercado - Sede C.C. Traki', slug: 'rio-supermercado-traki-valle-de-la-pascua', city: 'Valle de la Pascua' },
  },
];

async function tryProxyToLaravel(req: NextRequest, slugPath: string) {
  const backendUrl = process.env.LARAVEL_API_URL;
  if (!backendUrl) return null;

  try {
    const url = new URL(req.url);
    const targetUrl = `${backendUrl}/business/${slugPath}${url.search}`;
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
    console.warn('Laravel proxy unreachable for business, using local fallback:', err);
  }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  // 1. Store Profile
  if (slug[0] === 'store') {
    return NextResponse.json({
      status: 'success',
      has_store: true,
      store: mockBusinessStore,
    });
  }

  // 2. Branches
  if (slug[0] === 'branches') {
    return NextResponse.json({
      status: 'success',
      store_id: 1,
      total: mockBusinessBranches.length,
      max_allowed: 5,
      branches: mockBusinessBranches,
    });
  }

  // 3. Offers
  if (slug[0] === 'offers') {
    return NextResponse.json({
      status: 'success',
      store_id: 1,
      offers: {
        current_page: 1,
        data: mockBusinessOffers,
        last_page: 1,
        total: mockBusinessOffers.length,
      },
    });
  }

  // 4. Analytics
  if (slug[0] === 'analytics') {
    return NextResponse.json({
      status: 'success',
      store_id: 1,
      plan: {
        tier: mockBusinessStore.subscription_tier,
        is_featured: mockBusinessStore.is_featured,
      },
      inventory: {
        total_offers: mockBusinessOffers.length,
        in_stock_offers: mockBusinessOffers.filter((o) => o.in_stock).length,
        out_of_stock_offers: mockBusinessOffers.filter((o) => !o.in_stock).length,
        average_price_usd: 16.0,
        total_branches: mockBusinessBranches.length,
      },
      leads_summary_30d: {
        total_leads: 24,
        whatsapp_clicks: 18,
        phone_clicks: 4,
        in_store_views: 2,
      },
      branches_performance: [
        {
          id: 1,
          name: 'Río Supermercado - Sede Principal C.C. Traki',
          city: 'Valle de la Pascua',
          offers_count: mockBusinessOffers.length,
          leads_count: 24,
        },
      ],
    });
  }

  return NextResponse.json({ message: 'Ruta no encontrada' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  const body = await req.json().catch(() => ({}));

  // Bulk update exchange rate
  if (slug[0] === 'offers' && slug[1] === 'bulk-update') {
    const rate = body.exchange_rate || 45;
    mockBusinessOffers = mockBusinessOffers.map((offer) => ({
      ...offer,
      price_ves: parseFloat((offer.price * rate).toFixed(2)),
      last_checked_at: new Date().toISOString(),
    }));
    return NextResponse.json({
      status: 'success',
      message: `Se recalcularon ${mockBusinessOffers.length} productos a la tasa de ${rate} Bs/$`,
      updated_count: mockBusinessOffers.length,
    });
  }

  // Add offer
  if (slug[0] === 'offers') {
    const newOffer = {
      id: Date.now(),
      store_id: 1,
      product_id: body.product_id,
      branch_id: body.branch_id || 1,
      price: body.price || 10,
      price_ves: body.price_ves || body.price * 45,
      currency: 'USD',
      in_stock: body.in_stock ?? true,
      product_url: null,
      last_checked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      product: {
        id: body.product_id,
        name: 'Producto Dermatológico',
        slug: 'producto-dermatologico',
        category: 'Cuidado Facial',
        image_url: null,
        brand: { id: 1, name: 'Dermocosmética', slug: 'dermocosmetica' },
      },
      branch: { id: 1, name: 'Sede Principal', slug: 'sede-principal', city: 'Valle de la Pascua' },
    };
    mockBusinessOffers.push(newOffer);
    return NextResponse.json({ status: 'success', offer: newOffer }, { status: 201 });
  }

  // Register store
  if (slug[0] === 'store' && slug[1] === 'register') {
    mockBusinessStore.name = body.store_name || mockBusinessStore.name;
    return NextResponse.json({ status: 'success', store: mockBusinessStore }, { status: 201 });
  }

  // Add branch
  if (slug[0] === 'branches') {
    const newBranch = {
      id: Date.now(),
      store_id: 1,
      name: body.name,
      slug: 'branch-' + Date.now(),
      state: body.state,
      city: body.city,
      address: body.address,
      reference_point: body.reference_point || null,
      latitude: body.latitude || 9.215,
      longitude: body.longitude || -66.01,
      geofence_radius_meters: 90,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      opening_hours: body.opening_hours || 'Lunes a Sábado: 8:00 AM - 6:00 PM',
      is_active: true,
      offers_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockBusinessBranches.push(newBranch);
    return NextResponse.json({ status: 'success', branch: newBranch }, { status: 201 });
  }

  return NextResponse.json({ status: 'success' });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  const body = await req.json().catch(() => ({}));

  if (slug[0] === 'store') {
    mockBusinessStore = { ...mockBusinessStore, ...body };
    return NextResponse.json({ status: 'success', store: mockBusinessStore });
  }

  if (slug[0] === 'offers' && slug.length >= 2) {
    const offerId = parseInt(slug[1]);
    const idx = mockBusinessOffers.findIndex((o) => o.id === offerId);
    if (idx !== -1) {
      mockBusinessOffers[idx] = { ...mockBusinessOffers[idx], ...body };
      return NextResponse.json({ status: 'success', offer: mockBusinessOffers[idx] });
    }
  }

  return NextResponse.json({ status: 'success' });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || [];
  const slugPath = slug.join('/');

  const proxyRes = await tryProxyToLaravel(req, slugPath);
  if (proxyRes) return proxyRes;

  if (slug[0] === 'offers' && slug.length >= 2) {
    const offerId = parseInt(slug[1]);
    mockBusinessOffers = mockBusinessOffers.filter((o) => o.id !== offerId);
    return NextResponse.json({ status: 'success', message: 'Oferta eliminada' });
  }

  if (slug[0] === 'branches' && slug.length >= 2) {
    const branchId = parseInt(slug[1]);
    mockBusinessBranches = mockBusinessBranches.filter((b) => b.id !== branchId);
    return NextResponse.json({ status: 'success', message: 'Sucursal eliminada' });
  }

  return NextResponse.json({ status: 'success' });
}
