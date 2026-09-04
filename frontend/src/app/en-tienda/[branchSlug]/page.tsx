'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Store,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Camera,
  ExternalLink,
  Phone,
  Clock,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Barcode,
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import { StoreBranchInfo, InStoreProduct, BranchProductsResponse } from '@/types/stores';

export default function InStoreShoppingPage({
  params,
}: {
  params: Promise<{ branchSlug: string }>;
}) {
  const resolvedParams = use(params);
  const branchSlug = resolvedParams.branchSlug;

  const [branch, setBranch] = useState<StoreBranchInfo | null>(null);
  const [products, setProducts] = useState<InStoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSkinType, setSelectedSkinType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadBranchData() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/v1/stores/branches/${branchSlug}/products?skin_type=${selectedSkinType}`
        );
        if (res.ok) {
          const data: BranchProductsResponse = await res.json();
          setBranch(data.branch);
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Error al cargar datos de la sucursal:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBranchData();
  }, [branchSlug, selectedSkinType]);

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] px-4 py-6 max-w-4xl mx-auto">
      {/* 1. Volver y Encabezado de Navegación */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-[#2D2825] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        <Link
          href="/tiendas/registrar"
          className="inline-flex items-center gap-1 text-xs text-[#526B5D] hover:underline"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>¿Eres comerciante? Agrega tu tienda</span>
        </Link>
      </div>

      {/* 2. Tarjeta Principal de la Tienda */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#8FA89B]/20 text-[#3F5A4D] border border-[#8FA89B]/30">
                <MapPin className="w-3 h-3 text-[#526B5D]" />
                Modo En Tienda
              </span>
              {branch?.is_independent && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium border border-amber-200">
                  Comercio Local Independiente
                </span>
              )}
            </div>

            <h1 className="text-2xl font-serif font-bold text-[#2D2825]">
              {branch?.name || 'Establecimiento en Valle de la Pascua'}
            </h1>

            <p className="text-sm text-stone-600 flex items-center gap-1.5">
              <span>{branch?.address}</span>
              {branch?.reference_point && (
                <span className="text-xs text-stone-500 italic">
                  ({branch.reference_point})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              href="/escaner"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-semibold hover:bg-stone-800 transition-all shadow-sm"
            >
              <Camera className="w-4 h-4 text-[#8FA89B]" />
              <span>Escanear etiqueta en anaquel</span>
            </Link>
          </div>
        </div>

        {/* Datos de contacto y horario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-stone-150 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-stone-400" />
            <span>{branch?.opening_hours || 'Horario comercial habitual'}</span>
          </div>

          {branch?.whatsapp && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <a
                href={`https://wa.me/${branch.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline font-medium"
              >
                WhatsApp Tienda
              </a>
            </div>
          )}

          {branch?.instagram_handle && (
            <div className="flex items-center gap-2">
              <AtSign className="w-4 h-4 text-pink-600" />
              <a
                href={`https://instagram.com/${branch.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-pink-700 hover:underline font-medium"
              >
                {branch.instagram_handle}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 3. Selector de Perfil Dermatológico */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filtrar por tu tipo de piel:
          </label>
          <span className="text-xs text-stone-500">
            {filteredProducts.length} productos evaluados
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'Todos los productos' },
            { key: 'OILY', label: 'Piel Grasa / Seborregulador' },
            { key: 'DRY', label: 'Piel Seca / Barrera' },
            { key: 'ACNE_PRONE', label: 'Tendencia Acneica' },
            { key: 'SENSITIVE', label: 'Piel Sensible / Sin Fragancia' },
          ].map((type) => (
            <button
              key={type.key}
              onClick={() => setSelectedSkinType(type.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedSkinType === type.key
                  ? 'bg-[#526B5D] text-white shadow-sm'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por marca o producto (ej: CeraVe, Nivea, Protector solar)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-[#2D2825] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8FA89B]/50"
          />
        </div>
      </div>

      {/* 4. Listado de Productos Evaluados */}
      {isLoading ? (
        <div className="py-12 text-center text-stone-500 text-xs flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-[#8FA89B] border-t-transparent rounded-full animate-spin" />
          <span>Auditando catálogo de la tienda...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-stone-300">
          <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-stone-700">
            No se encontraron productos con este filtro
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            ¿Estás frente a un producto que no ves aquí? Puedes escanear su código de barras o lista INCI directamente con la cámara.
          </p>
          <Link
            href="/escaner"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#526B5D] text-white text-xs font-semibold"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Abrir escáner de cámara</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.offer_id}
              className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:border-[#8FA89B]/60 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-[#526B5D] uppercase tracking-wider">
                    {product.brand} • {product.category}
                  </span>

                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{product.scientific_score}/100</span>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#2D2825] group-hover:text-[#3F5A4D] transition-colors leading-snug">
                  {product.name}
                </h3>

                <p className="text-xs text-stone-600 mt-1">
                  {product.safety_label}
                </p>

                {/* Highlights científicos */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {product.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-stone-100 text-stone-700 font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>

              {/* Precios y Barra de Anaquel */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-[#2D2825]">
                      ${product.price_usd.toFixed(2)}
                    </span>
                    {product.price_ves && (
                      <span className="text-xs text-stone-500 font-medium">
                        (Ref. Bs. {product.price_ves.toLocaleString('es-VE')})
                      </span>
                    )}
                  </div>

                  {product.barcode_ean && (
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                      <Barcode className="w-3 h-3" />
                      <span>EAN: {product.barcode_ean}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/escaner`}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#2D2825] text-xs font-semibold transition-colors"
                >
                  Verificar INCI
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Banner de Ayuda Comunitaria */}
      <div className="mt-8 p-4 rounded-2xl bg-[#8FA89B]/10 border border-[#8FA89B]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#2D2825]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#526B5D]" />
          <span>
            ¿Falta algún producto de esta tienda o cambió el precio? Ayuda a la comunidad reportándolo.
          </span>
        </div>
        <Link
          href="/tiendas/registrar"
          className="font-semibold text-[#526B5D] hover:underline whitespace-nowrap"
        >
          Proponer actualización →
        </Link>
      </div>
    </div>
  );
}
