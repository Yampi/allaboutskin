import { NextRequest, NextResponse } from 'next/server';

const CATALOG_PRODUCTS = [
  { id: 101, name: 'CeraVe Gel Limpiador Espumoso (236ml)', slug: 'cerave-foaming-facial-cleanser', category: 'Limpiador Facial', brand: { id: 1, name: 'CeraVe', slug: 'cerave' } },
  { id: 102, name: 'Nivea Sun UV Rostro Control de Brillo FPS 50+ (50ml)', slug: 'nivea-sun-control-de-brillo-fps50', category: 'Protector Solar', brand: { id: 2, name: 'Nivea', slug: 'nivea' } },
  { id: 103, name: 'Neutrogena Hydro Boost Water Gel Ácido Hialurónico (50g)', slug: 'neutrogena-hydro-boost-water-gel', category: 'Hidratante Facial', brand: { id: 3, name: 'Neutrogena', slug: 'neutrogena' } },
  { id: 104, name: 'La Roche-Posay Effaclar Duo+M Tratamiento Anti-Imperfecciones (40ml)', slug: 'la-roche-posay-effaclar-duo-plus-m', category: 'Tratamiento', brand: { id: 4, name: 'La Roche-Posay', slug: 'la-roche-posay' } },
  { id: 105, name: 'The Ordinary Niacinamide 10% + Zinc 1% (30ml)', slug: 'the-ordinary-niacinamide-zinc', category: 'Serum', brand: { id: 5, name: 'The Ordinary', slug: 'the-ordinary' } },
  { id: 106, name: 'Eucerin Oil Control Sun Gel-Cream FPS 50+ (50ml)', slug: 'eucerin-oil-control-fps50', category: 'Protector Solar', brand: { id: 6, name: 'Eucerin', slug: 'eucerin' } },
  { id: 107, name: 'Bioderma Sensibio H2O Solución Micelar (500ml)', slug: 'bioderma-sensibio-h2o', category: 'Limpiador', brand: { id: 7, name: 'Bioderma', slug: 'bioderma' } },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase();

  // Try proxy to Laravel
  const backendUrl = process.env.LARAVEL_API_URL;
  if (backendUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${backendUrl}/catalog/products?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}
  }

  let filtered = CATALOG_PRODUCTS;
  if (q) {
    filtered = CATALOG_PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.brand.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    current_page: 1,
    data: filtered,
    last_page: 1,
    total: filtered.length,
  });
}
