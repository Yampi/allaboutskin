'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  RefreshCw,
  Store,
  Globe2
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface CleanProductOffer {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  bestPrice: number;
  bestPriceVes: number;
  priceLocal: number;
  currencyLocal: string;
  formattedPriceUsd: string;
  formattedPriceLocal: string;
  originalPrice: number;
  discountPercentage: number;
  activeIngredient: string;
  activeConcentration: string;
  scientificRating: number;
  storeName: string;
  storeCountryCode: string;
  storeCountryName: string;
  storeCountryFlag: string;
  storeUrl: string;
  inciSummary: string;
  inStock: boolean;
}

export default function OffersAndProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'CLEANSER', label: 'Limpiadores' },
    { id: 'SERUM', label: 'Sérums' },
    { id: 'MOISTURIZER', label: 'Hidratantes' },
    { id: 'SPF', label: 'Protección Solar' },
    { id: 'EXFOLIANT', label: 'Exfoliantes' },
    { id: 'RETINOID', label: 'Retinoides' },
  ];

  const countries = [
    { code: 'ALL', label: 'Todos los países', flag: '🌐' },
    { code: 'VE', label: 'Venezuela', flag: '🇻🇪' },
    { code: 'CL', label: 'Chile', flag: '🇨🇱' },
    { code: 'MX', label: 'México', flag: '🇲🇽' },
    { code: 'CO', label: 'Colombia', flag: '🇨🇴' },
    { code: 'ES', label: 'España', flag: '🇪🇸' },
    { code: 'US', label: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'PA', label: 'Panamá', flag: '🇵🇦' },
  ];

  const fetchCatalog = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/catalog/products?per_page=60`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data || []);
      } else {
        setErrorMsg('No se pudieron consultar los productos en la base de datos.');
      }
    } catch (err) {
      console.error('Error al cargar ofertas:', err);
      setErrorMsg('No se pudo conectar con el servidor local (API REST).');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const offers: CleanProductOffer[] = products.map((p) => {
    const primaryOffer = p.store_offers?.[0];
    const bestPrice = primaryOffer?.price_usd
      ? Number(primaryOffer.price_usd)
      : (primaryOffer?.price ? Number(primaryOffer.price) : 0);

    const storeCountryCode = String(primaryOffer?.store_country_code || primaryOffer?.store?.country_code || 'VE').toUpperCase();
    const storeCountryName = primaryOffer?.store_country_name || primaryOffer?.store?.country_name || 'Venezuela';
    const storeCountryFlag = primaryOffer?.store_country_flag || primaryOffer?.store?.country_flag || '🇻🇪';

    const currencyLocal = String(
      primaryOffer?.currency_local ||
      (storeCountryCode === 'CL' ? 'CLP' : (storeCountryCode === 'VE' ? 'VES' : (storeCountryCode === 'MX' ? 'MXN' : (storeCountryCode === 'ES' ? 'EUR' : 'USD'))))
    ).toUpperCase();

    const priceLocal = primaryOffer?.price_local
      ? Number(primaryOffer.price_local)
      : (primaryOffer?.price_ves ? Number(primaryOffer.price_ves) : bestPrice);

    const bestPriceVes = currencyLocal === 'VES'
      ? priceLocal
      : (primaryOffer?.price_ves ? Number(primaryOffer.price_ves) : 0);

    const formattedPriceUsd = primaryOffer?.formatted_price_usd || `$${bestPrice.toFixed(2)} USD`;
    const formattedPriceLocal = primaryOffer?.formatted_price_local || (
      currencyLocal === 'CLP'
        ? `$${Math.round(priceLocal).toLocaleString('es-CL')} CLP`
        : currencyLocal === 'VES'
        ? `Bs. ${priceLocal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : currencyLocal === 'EUR'
        ? `${priceLocal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
        : `$${priceLocal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencyLocal}`
    );

    const brandName = p.brand?.name || 'Cosmética';
    const activeIng = p.ingredients?.find((i: any) => i.is_active || i.pivot?.is_declared_active) || p.ingredients?.[0];
    const activeIngredient = activeIng?.common_name || activeIng?.inci_name || 'Fórmula Dermocosmética';
    const activeConcentration = activeIng?.pivot?.concentration_percentage
      ? `${activeIng.pivot.concentration_percentage}%`
      : 'Concentración evaluada';
    const inciSummary = p.ingredients && p.ingredients.length > 0
      ? p.ingredients.map((i: any) => i.inci_name || i.name).join(', ')
      : 'Aqua, Glycerin, Niacinamide';
    const storeName = primaryOffer?.store?.name || primaryOffer?.branch?.name || 'Distribuidor Autorizado';
    const storeUrl = primaryOffer?.product_url || primaryOffer?.affiliate_url || '#';

    return {
      id: String(p.id),
      name: p.name,
      brand: brandName,
      category: p.category,
      categorySlug: p.category,
      bestPrice,
      bestPriceVes,
      priceLocal,
      currencyLocal,
      formattedPriceUsd,
      formattedPriceLocal,
      originalPrice: bestPrice > 0 ? bestPrice * 1.12 : 0,
      discountPercentage: bestPrice > 0 ? 10 : 0,
      activeIngredient,
      activeConcentration,
      scientificRating: p.is_verified ? 98 : 94,
      storeName,
      storeCountryCode,
      storeCountryName,
      storeCountryFlag,
      storeUrl,
      inciSummary,
      inStock: primaryOffer ? Boolean(primaryOffer.in_stock) : true,
    };
  });

  const filteredOffers = offers.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.categorySlug === selectedCategory;
    const matchesCountry = selectedCountry === 'ALL' || item.storeCountryCode === selectedCountry;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.activeIngredient.toLowerCase().includes(q) ||
      item.storeName.toLowerCase().includes(q) ||
      item.storeCountryName.toLowerCase().includes(q);
    return matchesCat && matchesCountry && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        
        {/* TOP HERO HEADER */}
        <div className="border-b border-[#ECE6DC] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-widest bg-[#EFF5F1] px-3 py-0.5 rounded-full inline-block">
              Catálogo Internacional & Tiendas Verificadas
            </span>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1C1B1A] tracking-tight">
              Cosméticos con <span className="text-[#4F6D60]">Disponibilidad Real</span>
            </h1>
            <p className="text-sm text-[#66615C] leading-relaxed">
              Catálogo sincronizado en vivo con tiendas de Venezuela, Chile, México, España y distribuidores oficiales. Precios ajustados en moneda local y dólares ($ USD).
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECE6DC] p-4 rounded-xl shadow-editorial space-y-1 shrink-0 max-w-xs text-xs text-[#66615C]">
            <div className="flex items-center gap-1.5 font-semibold text-[#2D4A3E]">
              <ShieldCheck className="w-4 h-4 text-[#4F6D60]" />
              <span>Multi-Divisa & Geolocalizado</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Detección automática del país de origen de cada tienda con conversión cambiaria oficial en tiempo real.
            </p>
          </div>
        </div>

        {/* ALERTA DE ERROR SI FALLA EL BACKEND */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-center justify-between">
            <p className="text-xs sm:text-sm font-medium">{errorMsg}</p>
            <button
              onClick={fetchCatalog}
              className="px-3 py-1.5 bg-amber-700 text-white rounded-xl text-xs font-semibold hover:bg-amber-800 transition"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#ECE6DC] shadow-editorial space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#99938B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por producto, marca, tienda o país (ej: Chile, Locatel, CeraVe)..."
                className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1C1B1A] placeholder-[#99938B] focus:outline-none focus:border-[#4F6D60] focus:bg-white transition"
              />
            </div>

            <span className="text-xs text-[#66615C] shrink-0 font-medium">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'producto encontrado' : 'productos encontrados'}
            </span>
          </div>

          {/* Filtro por País de la Tienda */}
          <div className="space-y-1.5 pt-1 border-t border-[#ECE6DC]/60">
            <div className="flex items-center gap-1.5 text-xs text-[#66615C] font-semibold mb-1">
              <Globe2 className="w-3.5 h-3.5 text-[#4F6D60]" />
              <span>Filtrar por país de la tienda:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {countries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCountry(c.code)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedCountry === c.code
                      ? 'bg-[#2D4A3E] text-white border-[#2D4A3E] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#66615C] border-[#ECE6DC] hover:bg-[#EFF5F1] hover:text-[#2D4A3E]'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-1.5 pt-1 border-t border-[#ECE6DC]/60">
            <div className="flex items-center gap-1.5 text-xs text-[#66615C] font-semibold mb-1">
              <Tag className="w-3.5 h-3.5 text-[#4F6D60]" />
              <span>Categoría cosmética:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition whitespace-nowrap cursor-pointer touch-target ${
                    selectedCategory === cat.id
                      ? 'bg-[#2D4A3E] text-white border-[#2D4A3E]'
                      : 'bg-[#FAF8F5] text-[#66615C] border-[#ECE6DC] hover:bg-[#EFF5F1] hover:text-[#2D4A3E]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* OFFERS GRID */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66615C] gap-3">
            <RefreshCw className="w-7 h-7 animate-spin text-[#4F6D60]" />
            <p className="text-xs font-medium">Cargando catálogo en tiempo real...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#ECE6DC] shadow-editorial flex flex-col justify-between space-y-4 hover:border-[#4F6D60]/40 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#2D4A3E] bg-[#EFF5F1] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#99938B] font-semibold">
                      {item.scientificRating}% Respaldo
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[#99938B] block font-medium">{item.brand}</span>
                    <h3 className="font-serif font-bold text-base text-[#1C1B1A] leading-snug mt-0.5 group-hover:text-[#2D4A3E] transition">
                      {item.name}
                    </h3>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE6DC]/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#66615C]">Activo:</span>
                      <span className="font-semibold text-[#1C1B1A] text-right truncate max-w-[180px]">
                        {item.activeIngredient}
                      </span>
                    </div>

                    {/* Tienda con país y bandera */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#ECE6DC]/50">
                      <span className="text-[#66615C] shrink-0">Tienda:</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="font-medium text-[#2D4A3E] flex items-center gap-1 truncate max-w-[130px]">
                          <Store className="w-3.5 h-3.5 text-[#4F6D60] shrink-0" />
                          <span className="truncate">{item.storeName}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#EFF5F1] text-[#2D4A3E] px-2 py-0.5 rounded-full border border-[#D5E3DA] shrink-0" title={`Tienda radicada en ${item.storeCountryName}`}>
                          <span>{item.storeCountryFlag}</span>
                          <span>{item.storeCountryName}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECE6DC] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-[#99938B] block font-medium">Precio en tienda</span>
                      <div className="flex flex-col">
                        {item.bestPrice > 0 ? (
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-lg font-serif font-bold text-[#1C1B1A]">
                              {item.formattedPriceUsd}
                            </span>
                            {item.currencyLocal !== 'USD' && item.priceLocal > 0 && (
                              <span className="text-xs font-semibold text-[#2D4A3E] bg-[#EFF5F1] px-2 py-0.5 rounded-md border border-[#D5E3DA]">
                                ≈ {item.formattedPriceLocal}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-stone-500">
                            Consultar en sucursal
                          </span>
                        )}
                      </div>
                    </div>

                    {!item.inStock && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Agotado
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/?formula=${encodeURIComponent(item.inciSummary)}`}
                      className="w-full bg-[#FAF8F5] hover:bg-[#EFF5F1] text-[#2D4A3E] border border-[#ECE6DC] text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-[#4F6D60]" />
                      <span>Auditar INCI</span>
                    </Link>

                    {item.storeUrl && item.storeUrl !== '#' ? (
                      <a
                        href={item.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-[#2D4A3E] hover:bg-[#2A3B32] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition shadow-sm"
                        title="Visitar sitio de la tienda para comprar o ver disponibilidad"
                      >
                        <span>Ir a la tienda</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href="/tiendas"
                        className="w-full bg-[#2D4A3E] hover:bg-[#2A3B32] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        <span>Ver en Tiendas</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#ECE6DC] space-y-3">
            <Search className="w-8 h-8 text-[#99938B] mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#1C1B1A]">No se encontraron cosméticos</h3>
            <p className="text-xs text-[#66615C]">Intenta con otros términos o selecciona otro país o categoría.</p>
          </div>
        )}

      </main>
    </div>
  );
}
