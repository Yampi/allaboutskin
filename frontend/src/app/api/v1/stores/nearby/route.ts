import { NextRequest, NextResponse } from 'next/server';

// Sucursales base para soporte offline / fallback directo
const SEED_BRANCHES = [
  {
    id: 1,
    name: 'Río Supermercado - C.C. Traki',
    slug: 'rio-supermercado-traki-valle-de-la-pascua',
    store_name: 'Río Supermercado',
    store_type: 'HYBRID',
    is_independent: false,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Av. Rómulo Gallegos, Centro Comercial Traki, Planta Baja, Local L-4',
    reference_point: 'C.C. Traki, PB frente a las escaleras mecánicas',
    phone: '0235-3420000',
    whatsapp: '+584121234567',
    instagram_handle: '@riosupermarket',
    opening_hours: 'Lunes a Domingo: 8:00 AM - 9:00 PM',
    latitude: 9.2185,
    longitude: -66.009,
    geofence_radius_meters: 100,
  },
  {
    id: 4,
    name: 'Farmacia SAAS - Calle Atarraya (Traki)',
    slug: 'farmacia-saas-atarraya-traki-pascua',
    store_name: 'Farmacia SAAS',
    store_type: 'HYBRID',
    is_independent: false,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Calle Atarraya Sur, al lado de Traki',
    reference_point: 'Entrada lateral C.C. Traki',
    phone: '0235-3415566',
    whatsapp: '+584140001122',
    instagram_handle: '@redsaas',
    opening_hours: 'Lunes a Domingo: 8:00 AM - 8:00 PM',
    latitude: 9.2189,
    longitude: -66.0086,
    geofence_radius_meters: 80,
  },
  {
    id: 3,
    name: 'Farmacia SAAS - Av. Rómulo Gallegos',
    slug: 'farmacia-saas-romulo-gallegos-pascua',
    store_name: 'Farmacia SAAS',
    store_type: 'HYBRID',
    is_independent: false,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Av. Rómulo Gallegos c/c Calle González Padrón',
    reference_point: 'Cerca de la Plaza Bolívar',
    phone: '0235-3413344',
    whatsapp: '+584140001122',
    instagram_handle: '@redsaas',
    opening_hours: '24 Horas / Turno rotativo',
    latitude: 9.2178,
    longitude: -66.0102,
    geofence_radius_meters: 80,
  },
  {
    id: 6,
    name: 'DermoPascua - Calle Bolívar',
    slug: 'dermopascua-local-av-bolivar',
    store_name: 'DermoPascua & Belleza (Independiente)',
    store_type: 'PHYSICAL',
    is_independent: true,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Calle Bolívar cruce con Calle Retumbo, Local 3B',
    reference_point: 'A media cuadra de la Plaza Central',
    phone: '0235-3419999',
    whatsapp: '+584243339988',
    instagram_handle: '@dermopascua_store',
    opening_hours: 'Lunes a Sábado: 9:00 AM - 6:00 PM',
    latitude: 9.2162,
    longitude: -66.0105,
    geofence_radius_meters: 70,
  },
  {
    id: 5,
    name: 'Farmahorro - Av. Libertador',
    slug: 'farmahorro-av-libertador-pascua',
    store_name: 'Farmahorro',
    store_type: 'HYBRID',
    is_independent: false,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'Av. Libertador N° 64, entre Calle Las Flores y Bolívar',
    reference_point: 'Frente a la parada de transporte',
    phone: '0235-3426776',
    whatsapp: null,
    instagram_handle: '@farmahorrove',
    opening_hours: 'Lunes a Sábado: 7:30 AM - 7:30 PM',
    latitude: 9.2155,
    longitude: -66.011,
    geofence_radius_meters: 80,
  },
  {
    id: 2,
    name: 'Mundo Total - C.C. Valle de la Pascua',
    slug: 'mundo-total-cc-valle-de-la-pascua',
    store_name: 'Tiendas Mundo Total',
    store_type: 'PHYSICAL',
    is_independent: false,
    state: 'Guárico',
    city: 'Valle de la Pascua',
    address: 'C.C. Valle de la Pascua (antiguo Hiper Galerías), Sector Centro',
    reference_point: 'Al lado de los ascensores principales',
    phone: '0235-3421111',
    whatsapp: '+584149876543',
    instagram_handle: '@mundototal_ve',
    opening_hours: 'Lunes a Sábado: 8:30 AM - 7:00 PM',
    latitude: 9.213,
    longitude: -66.0125,
    geofence_radius_meters: 90,
  },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius_meters') || '5000', 10);

  // 1. Intentar consultar primero al backend Laravel si está disponible
  const backendUrl = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${backendUrl}/stores/nearby?lat=${lat}&lng=${lng}&radius_meters=${radius}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Si Laravel no está corriendo o responde lento, usamos el motor local
  }

  // 2. Motor de geolocalización local
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
    return NextResponse.json({
      status: 'success',
      is_inside_store: false,
      current_store: null,
      in_store_catalog_count: 0,
      nearby_branches_count: SEED_BRANCHES.length,
      nearby_branches: SEED_BRANCHES.map((b) => ({
        ...b,
        distance_meters: 1000,
        is_inside: false,
      })),
    });
  }

  const branchesWithDistance = SEED_BRANCHES.map((branch) => {
    const dist = calculateDistance(lat, lng, branch.latitude, branch.longitude);
    const isInside = dist <= branch.geofence_radius_meters;
    return {
      ...branch,
      distance_meters: Math.round(dist),
      is_inside: isInside,
    };
  }).filter((b) => b.distance_meters <= radius);

  branchesWithDistance.sort((a, b) => a.distance_meters - b.distance_meters);

  const insideBranch = branchesWithDistance.find((b) => b.is_inside) || null;

  return NextResponse.json({
    status: 'success',
    is_inside_store: insideBranch !== null,
    current_store: insideBranch,
    in_store_catalog_count: insideBranch ? 3 : 0,
    nearby_branches_count: branchesWithDistance.length,
    nearby_branches: branchesWithDistance.slice(0, 8),
  });
}
