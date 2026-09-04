import { NextRequest, NextResponse } from 'next/server';

const BRANCH_PRODUCTS_MAP: Record<string, any[]> = {
  'rio-supermercado-traki-valle-de-la-pascua': [
    {
      offer_id: 1,
      product_id: 101,
      name: 'CeraVe Gel Limpiador Espumoso (236ml)',
      slug: 'cerave-foaming-facial-cleanser',
      brand: 'CeraVe',
      category: 'CLEANSER',
      volume_amount: 236,
      volume_unit: 'ml',
      barcode_ean: '3337875597180',
      price_usd: 16.5,
      price_ves: 1155.0,
      in_stock: true,
      scientific_score: 98,
      badge: 'IDEAL_PIEL_GRASA',
      safety_label: 'Alta compatibilidad y sin sensación pesada',
      highlights: ['Limpieza suave con pH 5.5 fisiológico', 'Con 3 Ceramidas Esenciales y Niacinamida'],
      ingredients_count: 22,
    },
    {
      offer_id: 2,
      product_id: 102,
      name: 'Nivea Sun UV Rostro Control de Brillo FPS 50+ (50ml)',
      slug: 'nivea-sun-control-de-brillo-fps50',
      brand: 'Nivea',
      category: 'SPF',
      volume_amount: 50,
      volume_unit: 'ml',
      barcode_ean: '4005900593741',
      price_usd: 13.5,
      price_ves: 945.0,
      in_stock: true,
      scientific_score: 96,
      badge: 'IDEAL_PIEL_GRASA',
      safety_label: 'Excelente efecto matificante inmediato',
      highlights: ['Efecto toque seco antibrillo', 'Filtro fotoestable UVA/UVB de amplio espectro'],
      ingredients_count: 28,
    },
    {
      offer_id: 3,
      product_id: 103,
      name: 'Neutrogena Hydro Boost Water Gel Ácido Hialurónico (50g)',
      slug: 'neutrogena-hydro-boost-water-gel',
      brand: 'Neutrogena',
      category: 'MOISTURIZER',
      volume_amount: 50,
      volume_unit: 'g',
      barcode_ean: '7891010885236',
      price_usd: 18.0,
      price_ves: 1260.0,
      in_stock: true,
      scientific_score: 94,
      badge: 'APTO_TODO_TIPO',
      safety_label: 'Hidratación intensa de absorción ultrarrápida',
      highlights: ['Gel oil-free no comedogénico', 'Retención hídrica con Ácido Hialurónico purificado'],
      ingredients_count: 19,
    },
  ],
  'farmacia-saas-atarraya-traki-pascua': [
    {
      offer_id: 4,
      product_id: 104,
      name: "Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant (118ml)",
      slug: 'paulas-choice-skin-perfecting-2-bha-liquid',
      brand: "Paula's Choice",
      category: 'EXFOLIANT',
      volume_amount: 118,
      volume_unit: 'ml',
      barcode_ean: '0655439020106',
      price_usd: 38.0,
      price_ves: 2660.0,
      in_stock: true,
      scientific_score: 99,
      badge: 'ESTANDAR_ORO_BHA',
      safety_label: 'Desincrustante folicular probado clínicamente',
      highlights: ['Ácido Salicílico al 2.0% puro', 'Desobstruye poros y combate puntos negros'],
      ingredients_count: 8,
    },
    {
      offer_id: 5,
      product_id: 101,
      name: 'CeraVe Gel Limpiador Espumoso (236ml)',
      slug: 'cerave-foaming-facial-cleanser',
      brand: 'CeraVe',
      category: 'CLEANSER',
      volume_amount: 236,
      volume_unit: 'ml',
      barcode_ean: '3337875597180',
      price_usd: 17.0,
      price_ves: 1190.0,
      in_stock: true,
      scientific_score: 98,
      badge: 'IDEAL_PIEL_GRASA',
      safety_label: 'Aprobado para uso diario',
      highlights: ['Barrera cutánea intacta', 'Sin perfume'],
      ingredients_count: 22,
    },
  ],
  'dermopascua-local-av-bolivar': [
    {
      offer_id: 6,
      product_id: 105,
      name: 'The Ordinary Niacinamide 10% + Zinc 1% (30ml)',
      slug: 'the-ordinary-niacinamide-10-zinc-1',
      brand: 'The Ordinary',
      category: 'SERUM',
      volume_amount: 30,
      volume_unit: 'ml',
      barcode_ean: '0769915190311',
      price_usd: 11.5,
      price_ves: 805.0,
      in_stock: true,
      scientific_score: 98,
      badge: 'TOP_SEBORREGULADOR',
      safety_label: 'Fórmula científica minimalista',
      highlights: ['Control de sebo y reducción de manchas', 'Zinc purificante al 1%'],
      ingredients_count: 11,
    },
    {
      offer_id: 7,
      product_id: 103,
      name: 'Neutrogena Hydro Boost Water Gel Ácido Hialurónico (50g)',
      slug: 'neutrogena-hydro-boost-water-gel',
      brand: 'Neutrogena',
      category: 'MOISTURIZER',
      volume_amount: 50,
      volume_unit: 'g',
      barcode_ean: '7891010885236',
      price_usd: 17.5,
      price_ves: 1225.0,
      in_stock: true,
      scientific_score: 94,
      badge: 'APTO_TODO_TIPO',
      safety_label: 'Excelente para el clima cálido de Guárico',
      highlights: ['Ligero en gel', 'Refrescante'],
      ingredients_count: 19,
    },
  ],
};

// Fallback por defecto si se consulta otra sucursal
const DEFAULT_BRANCH_PRODUCTS = [
  {
    offer_id: 10,
    product_id: 101,
    name: 'CeraVe Gel Limpiador Espumoso (236ml)',
    slug: 'cerave-foaming-facial-cleanser',
    brand: 'CeraVe',
    category: 'CLEANSER',
    volume_amount: 236,
    volume_unit: 'ml',
    barcode_ean: '3337875597180',
    price_usd: 16.5,
    price_ves: 1155.0,
    in_stock: true,
    scientific_score: 98,
    badge: 'IDEAL_PIEL_GRASA',
    safety_label: 'Alta compatibilidad sin sensación pesada',
    highlights: ['Limpieza suave con pH 5.5', '3 Ceramidas Esenciales'],
    ingredients_count: 22,
  },
  {
    offer_id: 11,
    product_id: 102,
    name: 'Nivea Sun UV Rostro Control de Brillo FPS 50+ (50ml)',
    slug: 'nivea-sun-control-de-brillo-fps50',
    brand: 'Nivea',
    category: 'SPF',
    volume_amount: 50,
    volume_unit: 'ml',
    barcode_ean: '4005900593741',
    price_usd: 13.5,
    price_ves: 945.0,
    in_stock: true,
    scientific_score: 96,
    badge: 'IDEAL_PIEL_GRASA',
    safety_label: 'Matificante y protección UV intensa',
    highlights: ['Toque seco', 'Filtro amplio espectro'],
    ingredients_count: 28,
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const skinType = searchParams.get('skin_type') || 'ALL';

  // 1. Intentar consultar primero al backend Laravel si está disponible
  const backendUrl = process.env.LARAVEL_API_URL || 'http://127.0.0.1:8000/api/v1';
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${backendUrl}/stores/branches/${slug}/products?skin_type=${skinType}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch {
    // Si Laravel no está corriendo, usamos el fallback
  }

  // 2. Respuesta local enriquecida
  const products = BRANCH_PRODUCTS_MAP[slug] || DEFAULT_BRANCH_PRODUCTS;

  return NextResponse.json({
    status: 'success',
    branch: {
      id: 1,
      name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      slug: slug,
      store_name: slug.includes('rio')
        ? 'Río Supermercado'
        : slug.includes('saas')
        ? 'Farmacia SAAS'
        : slug.includes('mundo-total')
        ? 'Tiendas Mundo Total'
        : slug.includes('farmahorro')
        ? 'Farmahorro'
        : 'DermoPascua & Belleza',
      is_independent: slug.includes('dermopascua'),
      address: 'Valle de la Pascua, Edo. Guárico',
      city: 'Valle de la Pascua',
      state: 'Guárico',
      phone: '0235-3420000',
      whatsapp: '+584121234567',
      instagram_handle: slug.includes('rio') ? '@riosupermarket' : '@dermopascua_store',
      opening_hours: 'Lunes a Domingo: 8:00 AM - 8:30 PM',
    },
    filters: {
      skin_type: skinType,
    },
    products_count: products.length,
    products: products,
  });
}
