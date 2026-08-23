'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Droplets,
  Repeat,
  Plus,
  Scan,
  CheckCircle2,
  Maximize2,
  Calendar,
  Layers,
  Award,
  Search,
  SlidersHorizontal,
  Check,
  Microscope,
  Flame,
  Feather,
  Sun,
  Activity
} from 'lucide-react';
import { UserProfile, ProductShelfItem, ActiveIngredient, NavTab } from './types';
import { productShelfList, activeIngredientsList } from './skincareData';

interface HomeScreenProps {
  userProfile: UserProfile;
  shelfItems?: ProductShelfItem[];
  onChangeTab: (tab: NavTab) => void;
  onOpenProfileModal: () => void;
  onOpenMicroscopyModal: () => void;
  onSelectIngredient: (ing: ActiveIngredient) => void;
}

export default function HomeScreen({
  userProfile,
  shelfItems,
  onChangeTab,
  onOpenProfileModal,
  onOpenMicroscopyModal,
  onSelectIngredient,
}: HomeScreenProps) {
  const currentShelf = shelfItems && shelfItems.length > 0 ? shelfItems : productShelfList;
  const [quickSearchInci, setQuickSearchInci] = useState('');

  // Key active chips for Night 3
  const activeChips = [
    { name: 'Ceramidas NP/AP/EOP', id: 'ceramidas' },
    { name: 'Centella Asiática', id: 'centella-asiatica' },
    { name: 'Ácido Hialurónico', id: 'acido-hialuronico' },
    { name: 'Pantenol B5', id: 'pantenol' },
  ];

  // 4 Facial Biotypes for the desktop 4-column grid
  const facialBiotypes = [
    {
      id: 'mixta-grasa',
      name: 'Piel Mixta / Grasa',
      description: 'Control de sebo en zona T, afinamiento de poros y prevención de comedones.',
      heroActives: ['Niacinamida 10%', 'Zinc PCA 1%', 'Ácido Salicílico 2%'],
      icon: Droplets,
      accentColor: '#8FA89B',
      isCurrent: userProfile.skinType.includes('Mixta') || userProfile.skinType.includes('Grasa'),
    },
    {
      id: 'seca-deshidratada',
      name: 'Piel Seca / Deshidratada',
      description: 'Reposición del manto lipídico epidérmico y retención profunda de agua transepidérmica.',
      heroActives: ['Ceramidas NP/AP/EOP', 'Ácido Hialurónico', 'Escualano'],
      icon: Feather,
      accentColor: '#4A6B5B',
      isCurrent: userProfile.skinType.includes('Seca'),
    },
    {
      id: 'sensible-reactiva',
      name: 'Piel Sensible / Reactiva',
      description: 'Calmante vascular, refuerzo de barrera comprometida y tolerancia máxima.',
      heroActives: ['Centella Asiática (Cica)', 'Pantenol B5', 'Alantoína'],
      icon: Activity,
      accentColor: '#D8A899',
      isCurrent: userProfile.skinType.includes('Sensible') || userProfile.conditions.includes('Sensible'),
    },
    {
      id: 'madura-fotoenvejecida',
      name: 'Piel Madura / Renovación',
      description: 'Aceleración del recambio celular, estimulación de colágeno I y desvanecimiento de manchas.',
      heroActives: ['Retinol 0.3%', 'Vitamina C Pura', 'Ácido Glicólico'],
      icon: Sun,
      accentColor: '#DFCAAC',
      isCurrent: userProfile.conditions.includes('Foto-Envejecimiento'),
    },
  ];

  const handleChipClick = (id: string) => {
    const found = activeIngredientsList.find((item) => item.id === id);
    if (found) {
      onSelectIngredient(found);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInci.trim()) {
      onChangeTab('scanner');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Hero & Search Section (Expanded on Desktop) */}
      <div className="card-sand p-5 sm:p-8 border border-[#E2D9CD] relative overflow-hidden shadow-diffuse">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#8FA89B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-sans font-bold uppercase tracking-wider">
              Dermatología Basada en Evidencia
            </span>
            <span className="text-[12px] font-sans text-[#7E756F] hidden sm:inline">
              • Protocolo Skin Cycling 4 Noches Fisiológico
            </span>
          </div>

          <h1 className="font-serif text-[26px] sm:text-[34px] lg:text-[38px] font-semibold text-[#2D2825] leading-tight">
            Auditoría Científica de Skincare & Ciclado Cutáneo
          </h1>

          <p className="text-[13.5px] sm:text-[15px] font-sans text-[#4A433E] mt-2 leading-relaxed max-w-2xl">
            Verifica la seguridad y eficacia de cualquier fórmula cosmética contra la base oficial <strong>CosIng UE</strong> y estudios indexados en <strong>PubMed</strong>.
          </p>

          {/* Expanded INCI Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7E756F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickSearchInci}
                onChange={(e) => setQuickSearchInci(e.target.value)}
                placeholder="Busca por ingrediente, INCI o pega una fórmula completa..."
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-full bg-white border border-[#E8E1D7] text-[#2D2825] text-[13px] sm:text-[14px] placeholder-[#9D948B] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B] shadow-xs"
              />
            </div>
            <button
              type="button"
              onClick={() => onChangeTab('scanner')}
              className="px-6 py-3 sm:py-3.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[13.5px] shadow-diffuse transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Scan className="w-4 h-4" />
              <span>Auditar con Cámara / INCI</span>
            </button>
          </form>

          {/* Quick Active Filter Pills */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[#7E756F]">
            <span className="font-semibold text-[#4A6B5B] mr-1">Frecuentes:</span>
            {['Niacinamida 10%', 'Retinol 0.3%', 'Ceramidas NP', 'Ácido Salicílico 2%', 'Centella Asiática'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const slug = tag.toLowerCase().includes('niacin') ? 'niacinamida' : tag.toLowerCase().includes('retin') ? 'retinol' : tag.toLowerCase().includes('salic') ? 'acido-salicilico' : tag.toLowerCase().includes('centella') ? 'centella-asiatica' : 'ceramidas';
                  handleChipClick(slug);
                }}
                className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-[#E2D9CD] hover:border-[#8FA89B] text-[#2D2825] transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Personaliza activos de piel (4 Facial Biotypes Horizontal Grid on Desktop) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-section-h3 text-[#7E756F]">
              PERSONALIZA ACTIVOS DE PIEL
            </span>
            <h2 className="font-serif text-[20px] sm:text-[22px] font-semibold text-[#2D2825]">
              Calibración por Biotipo Facial
            </h2>
          </div>
          <button
            onClick={onOpenProfileModal}
            className="text-[12px] font-sans font-semibold text-[#4A6B5B] hover:text-[#3D5A4C] flex items-center gap-1 cursor-pointer transition"
          >
            <span>Ajustar mi perfil</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {facialBiotypes.map((bio) => {
            const Icon = bio.icon;
            return (
              <div
                key={bio.id}
                onClick={onOpenProfileModal}
                className={`card-white p-4 border rounded-[20px] transition cursor-pointer flex flex-col justify-between hover:shadow-diffuse-elevated group relative ${
                  bio.isCurrent
                    ? 'border-2 border-[#8FA89B] bg-[#FAF8F5]'
                    : 'border-[#E8E1D7] hover:border-[#8FA89B]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: bio.accentColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {bio.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10px] font-bold">
                        Tu Biotipo
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-[16px] font-semibold text-[#2D2825] leading-tight">
                    {bio.name}
                  </h3>

                  <p className="text-[12px] font-sans text-[#7E756F] mt-1.5 leading-snug">
                    {bio.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[#E8E1D7]">
                  <span className="text-[9.5px] font-bold uppercase text-[#7E756F] tracking-wider block mb-1">
                    Activos Clave:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {bio.heroActives.map((act, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full bg-[#F2ECE4] text-[#2D2825] text-[10px] font-medium"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Bloque Diagnóstico & Perfil (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna 1: Hero Profile Card */}
        <div className="card-sand p-5 border border-[#E2D9CD] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#4A6B5B] rounded-full border-2 border-[#FAF8F5] flex items-center justify-center text-white text-[8px]"
                  title="Validación Dermatológica Activa"
                >
                  <CheckCircle2 className="w-2.5 h-2.5" />
                </div>
              </div>

              <div>
                <span className="text-[10.5px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider">
                  Perfil de Ciclado Cutáneo
                </span>
                <h3 className="font-serif text-[20px] font-semibold text-[#2D2825] leading-tight">
                  {userProfile.name}
                </h3>
                <p className="text-[12px] font-sans text-[#7E756F] mt-0.5">
                  Biotipo: <strong className="text-[#2D2825]">{userProfile.skinType}</strong> • {userProfile.secondaryBiotype}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenProfileModal}
              className="p-2 rounded-full bg-white text-[#4A6B5B] border border-[#E2D9CD] hover:border-[#8FA89B] transition shadow-xs cursor-pointer"
              title="Calibrar Biotipo"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2D9CD] grid grid-cols-2 gap-2 text-[12px]">
            <div className="p-2.5 rounded-[14px] bg-white/70">
              <span className="text-[#7E756F] text-[11px] block">Racha Activa</span>
              <span className="font-serif text-[16px] font-bold text-[#4A6B5B]">
                {userProfile.cycleStreakDays} Días Consecutivos
              </span>
            </div>
            <div className="p-2.5 rounded-[14px] bg-white/70">
              <span className="text-[#7E756F] text-[11px] block">Adherencia al Protocolo</span>
              <span className="font-serif text-[16px] font-bold text-[#4A6B5B]">
                94% (4/4 Fases)
              </span>
            </div>
          </div>
        </div>

        {/* Columna 2: Estado de Barrera Lipídica */}
        <div
          onClick={onOpenMicroscopyModal}
          className="card-white p-5 border border-[#E8E1D7] flex flex-col justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="font-section-h3 text-[#7E756F]">
                ESTADO DE BARRERA EPIDÉRMICA
              </span>
              <h3 className="font-serif text-[20px] font-semibold text-[#2D2825] mt-1">
                {userProfile.barrierStatus}
              </h3>
              <p className="text-[12px] font-sans text-[#7E756F] mt-0.5">
                Pérdida Transepidérmica (TEWL): <strong className="text-[#4A6B5B]">{userProfile.tewlScore}</strong>
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#EBF1EE] flex items-center justify-center text-[#4A6B5B] group-hover:scale-105 transition">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8E1D7] flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#8FA89B] shrink-0 shadow-xs">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80"
                alt="Microscopía Estrato Córneo"
                className="w-full h-full object-cover group-hover:scale-115 transition duration-500"
              />
            </div>
            <div className="text-[12px]">
              <span className="font-semibold text-[#4A6B5B] block group-hover:underline">
                Ver Ficha Óptica del Estrato Córneo &gt;
              </span>
              <span className="text-[#7E756F] text-[11px]">
                Validado con espectrometría lipídica y biomarcadores
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Card Skin Cycling Activo (PRÓXIMA NOCHE) */}
      <div className="card-white p-5 sm:p-6 border border-[#8FA89B]/50 rounded-[20px] shadow-diffuse relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#EBF1EE] rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="self-start px-3 py-1 rounded-full bg-[#8FA89B] text-white text-[11px] font-sans font-semibold uppercase tracking-wider shadow-xs">
            Fase 3 • Esta Noche
          </span>
          <span className="text-[12px] font-sans font-semibold text-[#7E756F] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#4A6B5B]" />
            Día {userProfile.activeNight} de 4 en Curso
          </span>
        </div>

        <h3 className="font-serif text-[21px] sm:text-[24px] font-semibold text-[#2D2825] mt-2 leading-snug">
          Noche 3: Recuperación de Barrera Cutánea
        </h3>

        <p className="text-[13.5px] font-sans text-[#4A433E] mt-1.5 leading-relaxed max-w-3xl">
          Fase reparadora con lípidos fisiológicos (Ceramidas NP/AP/EOP) y activos calmantes (Centella Asiática, Pantenol B5) para restaurar la película hidrolipídica tras la noche de retinoides.
        </p>

        {/* Chips en píldora con activos clave */}
        <div className="mt-4">
          <span className="text-[10.5px] font-bold uppercase text-[#7E756F] tracking-wider block mb-2">
            Activos Asignados para Hoy (Toca para ver ficha):
          </span>
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                className="px-3.5 py-1.5 rounded-full bg-[#F2ECE4] hover:bg-[#EBF1EE] hover:border-[#8FA89B] border border-[#E2D9CD] text-[#2D2825] text-[12px] font-medium transition cursor-pointer flex items-center gap-1.5"
              >
                <span>{chip.name}</span>
                <Sparkles className="w-3 h-3 text-[#4A6B5B]" />
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-5 pt-4 border-t border-[#E8E1D7] flex items-center justify-between">
          <span className="text-[12.5px] text-[#7E756F]">
            4 Pasos guiados para la noche de hoy
          </span>
          <button
            onClick={() => onChangeTab('cycle')}
            className="px-5 py-2.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white text-[13px] font-semibold shadow-diffuse transition flex items-center gap-2 cursor-pointer"
          >
            <span>Iniciar Protocolo Guiado</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Product Shelf (Tus Activos Asignados) */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#4A6B5B]" />
            <h3 className="font-serif text-[19px] sm:text-[21px] font-semibold text-[#2D2825]">
              Tus Activos Asignados
            </h3>
          </div>
          <span className="text-[12px] font-sans font-medium text-[#7E756F]">
            ({currentShelf.length} Fórmulas Validadas)
          </span>
        </div>

        {/* Responsive Horizontal / Multi-column Carousel Shelf */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {currentShelf.map((product) => (
            <div
              key={product.id}
              className="card-white p-3.5 border border-[#E8E1D7] rounded-[18px] flex flex-col justify-between group hover:border-[#8FA89B] hover:shadow-diffuse transition"
            >
              <div>
                <div className="relative h-28 w-full rounded-[14px] overflow-hidden bg-[#FAF8F5] border border-[#E2D9CD] mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#4A6B5B] text-[9.5px] font-bold">
                    {product.inciScore}% INCI
                  </span>
                </div>

                <span className="text-[10px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  {product.brand}
                </span>

                <h4 className="font-serif text-[14px] font-semibold text-[#2D2825] line-clamp-1 mt-0.5">
                  {product.name}
                </h4>

                <span className="text-[10.5px] text-[#4A6B5B] font-medium block mt-1">
                  {product.assignedPhaseName}
                </span>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-[10.5px] text-[#7E756F]">
                <span>PAO: {product.paoMonths}M</span>
                <span className="text-[#8FA89B] font-semibold">{product.volume}</span>
              </div>
            </div>
          ))}

          {/* Quick Add Product Card */}
          <div
            onClick={() => onChangeTab('scanner')}
            className="card-sand p-4 border-2 border-dashed border-[#8FA89B]/50 rounded-[18px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#EBF1EE] transition min-h-[180px]"
          >
            <div className="w-11 h-11 rounded-full bg-white border border-[#8FA89B] flex items-center justify-center text-[#4A6B5B] shadow-xs mb-2 group-hover:scale-105 transition">
              <Scan className="w-5 h-5" />
            </div>
            <span className="font-serif text-[14px] font-semibold text-[#2D2825]">
              Escanear Nuevo
            </span>
            <span className="text-[11px] text-[#7E756F] mt-0.5">
              Auditoría INCI AR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}