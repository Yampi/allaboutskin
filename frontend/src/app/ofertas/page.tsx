'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface ProductOffer {
  id: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: 'CLEANSER' | 'SERUM' | 'EXFOLIANT' | 'RETINOID' | 'MOISTURIZER' | 'SPF';
  bestPrice: number;
  originalPrice: number;
  discountPercentage: number;
  activeIngredient: string;
  activeConcentration: string;
  skinTypeRecommendation: string[];
  scientificRating: number;
  storeName: string;
  storeUrl: string;
  inciSummary: string;
  highlightBadge?: string;
}

const SAMPLE_OFFERS: ProductOffer[] = [
  {
    id: 'prod_1',
    name: '2% BHA Liquid Exfoliant',
    brand: "Paula's Choice",
    category: 'Exfoliante Químico',
    categorySlug: 'EXFOLIANT',
    bestPrice: 34.50,
    originalPrice: 42.00,
    discountPercentage: 18,
    activeIngredient: 'Ácido Salicílico (BHA)',
    activeConcentration: '2.0%',
    skinTypeRecommendation: ['Grasa', 'Mixta', 'Tendencia Acneica'],
    scientificRating: 98,
    storeName: 'Sephora / Farmacia Oficial',
    storeUrl: '#',
    inciSummary: 'Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera Leaf Extract...',
    highlightBadge: 'Estándar de Oro BHA'
  },
  {
    id: 'prod_2',
    name: 'A-Game 5 (Retinal 0.05%)',
    brand: 'Geek & Gorgeous',
    category: 'Retinoide Antiedad',
    categorySlug: 'RETINOID',
    bestPrice: 14.80,
    originalPrice: 16.50,
    discountPercentage: 10,
    activeIngredient: 'Retinaldehído',
    activeConcentration: '0.05%',
    skinTypeRecommendation: ['Normal', 'Mixta', 'Seca', 'Resistente'],
    scientificRating: 96,
    storeName: 'Laboratorio Oficial',
    storeUrl: '#',
    inciSummary: 'Aqua, Caprylic/Capric Triglyceride, Squalane, Retinal, Allantoin, Biosaccharide Gum-1...',
    highlightBadge: 'Mejor Costo/Beneficio'
  },
  {
    id: 'prod_3',
    name: 'Cicaplast Baume B5+ Ultra-Reparador',
    brand: 'La Roche-Posay',
    category: 'Hidratante / Barrera',
    categorySlug: 'MOISTURIZER',
    bestPrice: 11.90,
    originalPrice: 15.20,
    discountPercentage: 22,
    activeIngredient: 'Pantenol + Madecassoside',
    activeConcentration: '5.0%',
    skinTypeRecommendation: ['Sensible', 'Seca', 'Irritada', 'Piel con Retinización'],
    scientificRating: 99,
    storeName: 'Farmacias Dermatológicas',
    storeUrl: '#',
    inciSummary: 'Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Madecassoside, Zinc Gluconate...',
    highlightBadge: 'Reparador de Barrera'
  },
  {
    id: 'prod_4',
    name: 'Anthelios UVMune 400 Oil Control FPS 50+',
    brand: 'La Roche-Posay',
    category: 'Protector Solar Facial',
    categorySlug: 'SPF',
    bestPrice: 17.50,
    originalPrice: 22.00,
    discountPercentage: 20,
    activeIngredient: 'Mexoryl 400 + Airlicium',
    activeConcentration: 'Filtro UVA Ultra-Largo',
    skinTypeRecommendation: ['Grasa', 'Mixta', 'Brillo'],
    scientificRating: 99,
    storeName: 'Farmacias Dermatológicas',
    storeUrl: '#',
    inciSummary: 'Aqua, Silica, Diisopropyl Sebacate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Methoxypropylamino Cyclohexenylidene Ethoxyethylcyanoacetate...',
    highlightBadge: 'Mayor Protección UVA'
  },
  {
    id: 'prod_5',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Sérum / Seborregulador',
    categorySlug: 'SERUM',
    bestPrice: 6.20,
    originalPrice: 7.90,
    discountPercentage: 21,
    activeIngredient: 'Niacinamida (Vitamina B3)',
    activeConcentration: '10.0%',
    skinTypeRecommendation: ['Grasa', 'Mixta', 'Poros Visibles'],
    scientificRating: 92,
    storeName: 'Deciem / Tiendas de Belleza',
    storeUrl: '#',
    inciSummary: 'Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum...',
    highlightBadge: 'Básico Seborregulador'
  },
  {
    id: 'prod_6',
    name: 'Toleriane Dermo-Limpiador Suave',
    brand: 'La Roche-Posay',
    category: 'Limpiador Facial',
    categorySlug: 'CLEANSER',
    bestPrice: 13.50,
    originalPrice: 16.00,
    discountPercentage: 15,
    activeIngredient: 'Glicerina + Agua Termal',
    activeConcentration: 'Fórmula Syndet sin jabón',
    skinTypeRecommendation: ['Sensible', 'Seca', 'Normal'],
    scientificRating: 95,
    storeName: 'Farmacias Dermatológicas',
    storeUrl: '#',
    inciSummary: 'Aqua, Ethylhexyl Palmitate, Glycerin, Dipropylene Glycol, Carbomer, Sodium Hydroxide, Capryl Glycol...',
    highlightBadge: 'Respetuoso del Manto'
  }
];

export default function OffersAndProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'EXFOLIANT', label: 'Exfoliantes' },
    { id: 'RETINOID', label: 'Retinoides' },
    { id: 'MOISTURIZER', label: 'Hidratantes' },
    { id: 'SPF', label: 'Protección Solar' },
    { id: 'SERUM', label: 'Sérums' },
    { id: 'CLEANSER', label: 'Limpiadores' },
  ];

  const filteredOffers = SAMPLE_OFFERS.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.categorySlug === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-10">
        
        {/* TOP HERO HEADER */}
        <div className="border-b border-[#ECE6DC] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-widest bg-[#EFF5F1] px-3 py-0.5 rounded-full inline-block">
              Catálogo Curado & Evidencia
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1C1B1A] tracking-tight">
              Cosméticos con <span className="text-[#4F6D60]">Respaldo Científico</span>
            </h1>
            <p className="text-sm text-[#66615C] leading-relaxed">
              Curaduría científica independiente de productos con evidencia clínica real, concentraciones óptimas y compatibilidad dérmica comprobada.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#ECE6DC] p-4 rounded-xl shadow-editorial space-y-1 shrink-0 max-w-xs text-xs text-[#66615C]">
            <div className="flex items-center gap-1.5 font-semibold text-[#2D4A3E]">
              <ShieldCheck className="w-4 h-4 text-[#4F6D60]" />
              <span>Criterio Independiente</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Ninguna marca paga por posicionamiento. Solo listamos fórmulas con activos respaldados en ensayos clínicos.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#ECE6DC] shadow-editorial space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-[#99938B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por marca, cosmético o activo..."
                className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1C1B1A] placeholder-[#99938B] focus:outline-none focus:border-[#4F6D60] focus:bg-white transition"
              />
            </div>

            <span className="text-xs text-[#66615C] shrink-0">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'fórmula disponible' : 'fórmulas disponibles'}
            </span>
          </div>

          {/* Category Filter Pills */}
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

        {/* OFFERS GRID */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOffers.map((item) => (
              <div
                key={item.id}
                className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#ECE6DC] shadow-editorial flex flex-col justify-between space-y-4 hover:border-[#4F6D60]/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#2D4A3E] bg-[#EFF5F1] px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#99938B] font-semibold">
                      {item.scientificRating}% Puntuación
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-[#99938B] block font-medium">{item.brand}</span>
                    <h3 className="font-serif font-bold text-base text-[#1C1B1A] leading-snug mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#ECE6DC]/70 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#66615C]">Activo:</span>
                      <span className="font-semibold text-[#1C1B1A]">{item.activeIngredient}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#66615C]">Concentración:</span>
                      <span className="font-semibold text-[#2D4A3E]">{item.activeConcentration}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ECE6DC] space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-[#99938B] block">Precio referencia</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-serif font-bold text-[#1C1B1A]">
                          ${item.bestPrice.toFixed(2)}
                        </span>
                        {item.originalPrice > item.bestPrice && (
                          <span className="text-xs text-[#99938B] line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.discountPercentage > 0 && (
                      <span className="inline-flex items-center gap-0.5 bg-[#EFF5F1] text-[#2D4A3E] text-xs font-bold px-2 py-0.5 rounded-full">
                        <TrendingDown className="w-3 h-3" />
                        <span>-{item.discountPercentage}%</span>
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

                    <a
                      href={item.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#2D4A3E] hover:bg-[#2A3B32] text-white text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <span>Ver Oferta</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#ECE6DC] space-y-3">
            <Search className="w-8 h-8 text-[#99938B] mx-auto" />
            <h3 className="text-base font-serif font-bold text-[#1C1B1A]">No se encontraron cosméticos</h3>
            <p className="text-xs text-[#66615C]">Intenta con otros términos o selecciona otra categoría.</p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
