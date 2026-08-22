'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Percent,
  Star,
  Info,
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
  scientificRating: number; // out of 100
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
    highlightBadge: '⭐ Estándar de Oro BHA'
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
    highlightBadge: '🔬 Mejor Costo/Beneficio'
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
    highlightBadge: '🛡️ Reparador de Barrera'
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
    highlightBadge: '☀️ Mayor Protección UVA'
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
    highlightBadge: '💎 Básico Seborregulador'
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
    highlightBadge: '🌿 Respetuoso del Manto Lipídico'
  }
];

export default function OffersAndProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'ALL', label: 'Todos los Productos' },
    { id: 'EXFOLIANT', label: 'Exfoliantes Químicos' },
    { id: 'RETINOID', label: 'Retinoides' },
    { id: 'MOISTURIZER', label: 'Hidratantes & Barrera' },
    { id: 'SPF', label: 'Protectores Solares' },
    { id: 'SERUM', label: 'Sérums Activos' },
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
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* TOP HERO HEADER */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#4F6D60] bg-[#EFF5F1] px-3.5 py-1 rounded-full border border-[#7A9A8B]/30 uppercase tracking-widest">
                Módulo de Productos & Ofertas
              </span>
              <span className="text-xs text-[#9C9790]">•</span>
              <span className="text-xs font-medium text-[#6E6A66]">
                Transparencia Científica
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2A29] tracking-tight">
              Cosméticos con <span className="text-[#7A9A8B]">Respaldo Comprobado</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A66] leading-relaxed">
              Curaduría científica independiente de productos con evidencia clínica real, comparativas de precio por gramo de activo y mejores ofertas de farmacia.
            </p>
          </div>

          <div className="bg-[#FAF8F5] border border-[#EFECE6] p-4 rounded-2xl space-y-1.5 shrink-0 max-w-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#4F6D60]">
              <ShieldCheck className="w-4 h-4 text-[#7A9A8B]" />
              <span>Criterio Sin Publicidad Engañosa</span>
            </div>
            <p className="text-[11px] text-[#6E6A66] leading-relaxed">
              Ninguna marca paga por posicionamiento. Solo listamos fórmulas con activos respaldados por literatura dermatológica.
            </p>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-[#FFFFFF] rounded-3xl p-4 sm:p-6 border border-[#EFECE6] shadow-beauty space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-[#9C9790] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por marca, cosmético o activo (ej: Retinal, BHA)..."
                className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-full pl-9 pr-4 py-2.5 text-xs text-[#2B2A29] placeholder-[#9C9790] focus:outline-none focus:border-[#7A9A8B] focus:bg-white"
              />
            </div>

            <span className="text-xs font-semibold text-[#6E6A66] shrink-0">
              {filteredOffers.length} {filteredOffers.length === 1 ? 'fórmula disponible' : 'fórmulas disponibles'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-4 py-2 rounded-full border transition whitespace-nowrap cursor-pointer touch-target ${
                  selectedCategory === cat.id
                    ? 'bg-[#7A9A8B] text-white border-[#7A9A8B] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6E6A66] border-[#EFECE6] hover:bg-[#EFF5F1] hover:text-[#4F6D60]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* OFFERS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty flex flex-col justify-between space-y-4 hover:border-[#7A9A8B]/40 transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Badges & Category */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-[#4F6D60] bg-[#EFF5F1] px-2.5 py-0.5 rounded-full border border-[#7A9A8B]/30 uppercase tracking-wider">
                    {item.category}
                  </span>
                  {item.highlightBadge && (
                    <span className="text-[10px] font-bold text-[#A46864] bg-[#F8EFEA] px-2.5 py-0.5 rounded-full border border-[#E8D5D0]">
                      {item.highlightBadge}
                    </span>
                  )}
                </div>

                {/* Product Name & Brand */}
                <div>
                  <span className="text-xs font-bold text-[#9C9790] uppercase tracking-wider block">
                    {item.brand}
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#2B2A29] leading-snug mt-0.5">
                    {item.name}
                  </h3>
                </div>

                {/* Active Ingredient & Concentration */}
                <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EFECE6] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E6A66]">Activo Principal:</span>
                    <span className="font-bold text-[#2B2A29]">{item.activeIngredient}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#6E6A66]">Concentración / Tipo:</span>
                    <span className="font-bold text-[#4F6D60]">{item.activeConcentration}</span>
                  </div>
                </div>

                {/* Biotipo Recommendation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-wider block">
                    Recomendado para:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.skinTypeRecommendation.map((type, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-white border border-[#EFECE6] px-2 py-0.5 rounded-md text-[#6E6A66] font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Section */}
              <div className="pt-3 border-t border-[#EFECE6] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#9C9790] block">Mejor precio detectado</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-[#2B2A29] font-serif">
                        ${item.bestPrice.toFixed(2)}
                      </span>
                      {item.originalPrice > item.bestPrice && (
                        <span className="text-xs text-[#9C9790] line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.discountPercentage > 0 && (
                    <span className="inline-flex items-center gap-1 bg-[#EFF5F1] text-[#4F6D60] text-xs font-bold px-2.5 py-1 rounded-full border border-[#7A9A8B]/30">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>-{item.discountPercentage}%</span>
                    </span>
                  )}
                </div>

                {/* Actions: Audit Formula or View Store */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/?formula=${encodeURIComponent(item.inciSummary)}`}
                    className="w-full bg-[#FAF8F5] hover:bg-[#EFF5F1] text-[#4F6D60] border border-[#EFECE6] text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1 transition cursor-pointer touch-target"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auditar INCI</span>
                  </Link>

                  <a
                    href={item.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#4F6D60] hover:bg-[#3D554A] text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1 shadow-xs transition cursor-pointer touch-target"
                  >
                    <span>Ver Oferta</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
