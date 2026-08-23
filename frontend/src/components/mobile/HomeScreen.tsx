'use client';

import React from 'react';
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
  Award
} from 'lucide-react';
import { UserProfile, ProductShelfItem, ActiveIngredient, NavTab } from './types';
import { productShelfList, activeIngredientsList } from './skincareData';

interface HomeScreenProps {
  userProfile: UserProfile;
  onChangeTab: (tab: NavTab) => void;
  onOpenProfileModal: () => void;
  onOpenMicroscopyModal: () => void;
  onSelectIngredient: (ing: ActiveIngredient) => void;
}

export default function HomeScreen({
  userProfile,
  onChangeTab,
  onOpenProfileModal,
  onOpenMicroscopyModal,
  onSelectIngredient,
}: HomeScreenProps) {
  // Key active chips for Night 3
  const activeChips = [
    { name: 'Ceramidas NP/AP/EOP', id: 'ceramidas' },
    { name: 'Centella Asiática', id: 'centella-asiatica' },
    { name: 'Ácido Hialurónico', id: 'acido-hialuronico' },
    { name: 'Pantenol B5', id: 'pantenol' },
  ];

  const handleChipClick = (id: string) => {
    const found = activeIngredientsList.find((item) => item.id === id);
    if (found) {
      onSelectIngredient(found);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20 pt-1 px-4 max-w-md mx-auto animate-in fade-in duration-300">
      {/* 2. Hero Profile Card */}
      <div className="card-sand p-4 border border-[#E2D9CD] relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#8FA89B]/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Circular Avatar */}
            <div className="relative">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-xs"
              />
              <div
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#4A6B5B] rounded-full border-2 border-[#FAF8F5] flex items-center justify-center text-white text-[8px]"
                title="Validación Dermatológica"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>
            </div>

            {/* Profile Data */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider">
                  Dermatología Personalizada
                </span>
              </div>
              <h2 className="font-serif text-[18px] sm:text-[19px] font-semibold text-[#2D2825] leading-tight">
                Mi Perfil de Ciclado Cutáneo
              </h2>
              <p className="text-[12px] font-sans text-[#7E756F] mt-0.5">
                Usuaria: <strong className="text-[#2D2825] font-semibold">{userProfile.name}</strong> • Racha: {userProfile.cycleStreakDays} Días
              </p>
            </div>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="p-2 rounded-full bg-white/70 hover:bg-white text-[#4A6B5B] border border-[#E2D9CD] transition shadow-xs cursor-pointer"
            aria-label="Ajustar Perfil"
            title="Ajustar Perfil"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clinical Adherence Pill Bar */}
        <div className="mt-3.5 pt-3 border-t border-[#E2D9CD]/70 flex items-center justify-between text-[11px] text-[#4A433E]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8FA89B] animate-pulse" />
            <span>Validación Dermatológica Activa</span>
          </div>
          <span className="font-semibold text-[#4A6B5B]">
            4/4 Ciclos Completados (94%)
          </span>
        </div>
      </div>

      {/* 3. Bloque Diagnóstico Cutáneo (Grid 2 Columnas) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Columna 1: TU BIOTIPO */}
        <div className="card-white p-3.5 border border-[#E8E1D7] flex flex-col justify-between">
          <div>
            <span className="font-section-h3 text-[#7E756F] block">
              TU BIOTIPO
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/40 text-[#4A6B5B] text-[11px] font-medium">
                {userProfile.skinType}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF0ED] border border-[#D8A899]/50 text-[#943C36] text-[11px] font-medium">
                {userProfile.secondaryBiotype}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="mt-3 text-[11px] font-sans font-medium text-[#4A6B5B] hover:text-[#3D5A4C] flex items-center gap-1 cursor-pointer transition"
          >
            <span>Custom perfil setup</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Columna 2: ESTADO DE BARRERA */}
        <div
          onClick={onOpenMicroscopyModal}
          className="card-white p-3.5 border border-[#E8E1D7] flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:border-[#8FA89B] transition"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-section-h3 text-[#7E756F]">
                ESTADO DE BARRERA
              </span>
              <Maximize2 className="w-3 h-3 text-[#9D948B] group-hover:text-[#4A6B5B] transition" />
            </div>

            <div className="mt-1.5 flex items-baseline gap-1">
              <span className="font-serif text-[15px] font-semibold text-[#2D2825]">
                {userProfile.barrierStatus}
              </span>
            </div>

            <p className="text-[10px] text-[#7E756F] mt-0.5">
              Pérdida TEWL: {userProfile.tewlScore}
            </p>
          </div>

          {/* Micro-fotografía de validación */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#8FA89B] shrink-0">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=150&q=80"
                alt="Microscopía"
                className="w-full h-full object-cover group-hover:scale-115 transition duration-300"
              />
            </div>
            <span className="text-[10.5px] text-[#4A6B5B] font-medium underline underline-offset-2">
              Ver micro-foto &gt;
            </span>
          </div>
        </div>
      </div>

      {/* 4. Card Skin Cycling Activo (PRÓXIMA NOCHE) */}
      <div className="card-white p-4.5 border border-[#8FA89B]/40 relative overflow-hidden shadow-diffuse">
        {/* Soft decorative background tint */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBF1EE] rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-[#8FA89B] text-white text-[10.5px] font-sans font-semibold uppercase tracking-wider shadow-xs">
            Fase 3 • Esta Noche
          </span>
          <span className="text-[11px] font-sans font-semibold text-[#7E756F] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#4A6B5B]" />
            Día 3 de 4
          </span>
        </div>

        <h3 className="font-serif text-[19px] sm:text-[20px] font-semibold text-[#2D2825] mt-2.5 leading-snug">
          Noche 3: Recuperación de Barrera Cutánea
        </h3>

        <p className="text-[13px] font-sans text-[#4A433E] mt-1 leading-relaxed">
          Reparación lipídica con ceramidas y agentes antiinflamatorios calmantes para sellar hidratación tras la noche de retinoides.
        </p>

        {/* Chips en píldora con activos clave */}
        <div className="mt-3.5">
          <span className="text-[10px] font-bold uppercase text-[#7E756F] tracking-wider block mb-1.5">
            Activos Asignados para Hoy:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip.id)}
                className="px-3 py-1 rounded-full bg-[#F2ECE4] hover:bg-[#EBF1EE] hover:border-[#8FA89B] border border-[#E2D9CD] text-[#2D2825] text-[11px] font-medium transition cursor-pointer flex items-center gap-1"
                title="Ver ficha científica del activo"
              >
                <span>{chip.name}</span>
                <Sparkles className="w-2.5 h-2.5 text-[#4A6B5B]" />
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button to Night Protocol */}
        <div className="mt-4 pt-3 border-t border-[#E8E1D7] flex items-center justify-between gap-3">
          <div className="text-[11.5px] text-[#7E756F]">
            4 Pasos guiados listos
          </div>
          <button
            onClick={() => onChangeTab('cycle')}
            className="px-4 py-2 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white text-[12.5px] font-medium shadow-diffuse transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Iniciar Protocolo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Product Shelf (Tus Activos Asignados) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#4A6B5B]" />
            <h3 className="font-serif text-[17px] font-semibold text-[#2D2825]">
              Tus Activos Asignados
            </h3>
          </div>
          <span className="text-[11.5px] font-sans font-medium text-[#7E756F]">
            (5 Fórmulas Validadas)
          </span>
        </div>

        {/* Horizontal Carousel */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5 -mx-4 px-4">
          {productShelfList.map((product) => (
            <div
              key={product.id}
              className="card-white p-3 border border-[#E8E1D7] w-[170px] shrink-0 flex flex-col justify-between group hover:border-[#8FA89B] transition shadow-diffuse"
            >
              <div>
                {/* Product Image Container */}
                <div className="relative h-24 w-full rounded-[14px] overflow-hidden bg-[#FAF8F5] border border-[#E2D9CD] mb-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#4A6B5B] text-[9px] font-bold">
                    {product.inciScore}% INCI
                  </span>
                </div>

                <span className="text-[9.5px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  {product.brand}
                </span>

                <h4 className="font-serif text-[13.5px] font-semibold text-[#2D2825] line-clamp-1 mt-0.5">
                  {product.name}
                </h4>

                <span className="text-[10px] text-[#4A6B5B] font-medium block mt-1">
                  {product.assignedPhaseName}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-[10px] text-[#7E756F]">
                <span>PAO: {product.paoMonths}M</span>
                <span className="text-[#8FA89B] font-semibold">{product.volume}</span>
              </div>
            </div>
          ))}

          {/* Quick Add Product Card */}
          <div
            onClick={() => onChangeTab('scanner')}
            className="card-sand p-3 border-2 border-dashed border-[#8FA89B]/50 w-[140px] shrink-0 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#EBF1EE] transition"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#8FA89B] flex items-center justify-center text-[#4A6B5B] shadow-xs mb-2">
              <Scan className="w-5 h-5" />
            </div>
            <span className="font-serif text-[13px] font-semibold text-[#2D2825]">
              Escanear Nuevo
            </span>
            <span className="text-[10px] text-[#7E756F] mt-1">
              Auditoría INCI AR
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action AR Banner */}
      <div
        onClick={() => onChangeTab('scanner')}
        className="p-3.5 rounded-[20px] bg-gradient-to-r from-[#4A6B5B] to-[#5C8271] text-white flex items-center justify-between shadow-diffuse cursor-pointer hover:opacity-95 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-sans uppercase font-bold text-[#DFCAAC] tracking-wider block">
              Auditor Molecular en Vivo
            </span>
            <h4 className="font-serif text-[15px] font-semibold leading-tight">
              ¿Comprando un cosmético? Escanea el INCI
            </h4>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
      </div>
    </div>
  );
}