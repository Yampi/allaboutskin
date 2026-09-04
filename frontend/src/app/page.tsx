'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Calendar,
  Scan,
  Plus,
  Moon,
  Sun,
  Flame,
  Check,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Layers,
  Microscope,
  Maximize2,
  Clock,
  Droplets,
  Activity,
  Feather
} from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';
import IngredientDetailModal from '@/components/mobile/IngredientDetailModal';
import ProfileModal from '@/components/mobile/ProfileModal';
import MicroscopyModal from '@/components/mobile/MicroscopyModal';
import { ActiveIngredient } from '@/components/mobile/types';
import { activeIngredientsList } from '@/components/mobile/skincareData';

export default function HomePage() {
  const {
    userProfile,
    shelfItems,
    conflicts,
    activeNightData,
    completeNightRitual,
    removeProductFromShelf,
    assignProductPhase,
    updateProfile,
    getProductsForPhase,
  } = useSkincare();

  const [selectedIngredient, setSelectedIngredient] = useState<ActiveIngredient | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMicroscopyModalOpen, setIsMicroscopyModalOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [activeShelfFilter, setActiveShelfFilter] = useState<number | 'ALL'>('ALL');
  const [celebrationToast, setCelebrationToast] = useState<string | null>(null);

  // Biotypes summary
  const facialBiotypes = [
    {
      id: 'mixta-grasa',
      name: 'Piel Mixta / Grasa',
      description: 'Control de sebo en zona T y afinamiento de poros.',
      heroActives: ['Niacinamida 10%', 'Zinc PCA', 'Ácido Salicílico 2%'],
      icon: Droplets,
      accentColor: '#8FA89B',
      isCurrent: userProfile.skinType?.includes('Mixta') || userProfile.skinType?.includes('Grasa'),
    },
    {
      id: 'seca-deshidratada',
      name: 'Piel Seca / Deshidratada',
      description: 'Reposición lipídica y retención de agua transepidérmica.',
      heroActives: ['Ceramidas NP', 'Ácido Hialurónico', 'Escualano'],
      icon: Feather,
      accentColor: '#4A6B5B',
      isCurrent: userProfile.skinType?.includes('Seca'),
    },
    {
      id: 'sensible-reactiva',
      name: 'Piel Sensible / Reactiva',
      description: 'Calmante vascular, refuerzo de barrera y alta tolerancia.',
      heroActives: ['Centella Asiática (Cica)', 'Pantenol B5', 'Alantoína'],
      icon: Activity,
      accentColor: '#D8A899',
      isCurrent: userProfile.skinType?.includes('Sensible'),
    },
    {
      id: 'madura-renovacion',
      name: 'Piel con Foto-Envejecimiento',
      description: 'Recambio celular acelerado y síntesis de colágeno.',
      heroActives: ['Retinol 0.3%', 'Vitamina C Pura', 'Ácido Glicólico'],
      icon: Sun,
      accentColor: '#DFCAAC',
      isCurrent: userProfile.conditions?.includes('Foto-Envejecimiento'),
    },
  ];

  const handleOpenIngredient = (slugOrName: string) => {
    const found = activeIngredientsList.find(
      (item) =>
        item.id.toLowerCase().includes(slugOrName.toLowerCase()) ||
        item.name.toLowerCase().includes(slugOrName.toLowerCase())
    );
    if (found) {
      setSelectedIngredient(found);
    }
  };

  const handleCompleteTonight = () => {
    completeNightRitual(activeNightData.nightNumber);
    setCelebrationToast(`¡Ritual de ${activeNightData.phaseName} registrado! Tu racha aumentó.`);
    setTimeout(() => setCelebrationToast(null), 3500);
  };

  const filteredShelf = activeShelfFilter === 'ALL'
    ? shelfItems
    : shelfItems.filter((p) => p.assignedPhase === activeShelfFilter);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ALERTA DE CONFLICTOS QUÍMICOS (SI EXISTEN EN EL NECESER) */}
      {conflicts.length > 0 && (
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`p-4 sm:p-5 rounded-[24px] glass-panel border flex items-start gap-4 shadow-lg animate-in slide-in-from-top-2 ${
                conflict.severity === 'CRITICAL'
                  ? 'bg-[#FAF0ED]/90 border-[#D8A899] text-[#943C36]'
                  : 'bg-[#FAF5EE]/90 border-[#DFCAAC] text-[#7A5832]'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-current" />
              </div>
              <div className="flex-1 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/90">
                    Alerta Dermatológica
                  </span>
                  <h4 className="font-bold text-[16px]">
                    {conflict.title}
                  </h4>
                </div>
                <p className="mt-1 leading-relaxed opacity-95">
                  {conflict.description}
                </p>
                <div className="mt-2 text-[12px] bg-white/80 p-2.5 rounded-[14px] font-medium inline-block">
                  💡 <strong>Recomendación:</strong> {conflict.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. HERO SPLIT-SCREEN GLASSMÓRFICO: EVALUACIÓN + RITUAL DE HOY */}
      <div className="glass-panel p-6 sm:p-8 lg:p-10 rounded-[32px] relative overflow-hidden shadow-2xl">
        {/* Orbes de luz ambiental */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start relative z-10">
          
          {/* COLUMNA IZQUIERDA: "¿QUÉ VAMOS A EVALUAR HOY?" (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6 text-center">
            
            <div className="space-y-1.5 max-w-lg mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Auditoría Dermatológica con IA</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-slate-900 leading-tight">
                ¿Qué vamos a evaluar hoy?
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium">
                Elige una opción para comenzar
              </p>
            </div>

            {/* TARJETAS DE ACCIÓN CON ICONOS GRANDES Y CENTRADAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              
              {/* Tarjeta 1: Escanear Producto */}
              <Link
                href="/escaner?mode=product"
                className="glass-action-card rounded-3xl p-6 sm:p-8 cursor-pointer relative group border border-emerald-500/20 hover:border-emerald-500/50 flex flex-col items-center text-center transition duration-300"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-xs">
                  <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="26" fill="#10B981" fillOpacity="0.12" />
                    <rect x="7" y="23" width="28" height="22" rx="5" stroke="#1E3A2B" strokeWidth="2.4" fill="#FFFFFF" fillOpacity="0.9" />
                    <path d="M14 23V19C14 17.8954 14.8954 17 16 17H22C23.1046 17 24 17.8954 24 19V23" stroke="#1E3A2B" strokeWidth="2.4" />
                    <circle cx="21" cy="34" r="5.5" stroke="#1E3A2B" strokeWidth="2.4" fill="#E8F3EB" />
                    <circle cx="21" cy="34" r="2.2" fill="#10B981" />
                    <circle cx="12" cy="28" r="1.3" fill="#1E3A2B" />
                    <rect x="42" y="14" width="8" height="6" rx="2" fill="#2E5540" />
                    <rect x="44" y="9" width="4" height="5" rx="1.5" fill="#10B981" />
                    <rect x="36" y="20" width="18" height="27" rx="5" stroke="#1E3A2B" strokeWidth="2.4" fill="#FFFFFF" />
                    <rect x="39" y="31" width="12" height="13" rx="2" fill="#10B981" fillOpacity="0.25" />
                    <line x1="41" y1="25.5" x2="49" y2="25.5" stroke="#2E5540" strokeWidth="1.8" strokeLinecap="round" />
                    <line x1="41" y1="28.5" x2="47" y2="28.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M53 10L54 12.5L56.5 13.5L54 14.5L53 17L52 14.5L49.5 13.5L52 12.5L53 10Z" fill="#10B981" />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-slate-900 font-bold text-lg sm:text-xl group-hover:text-emerald-900 transition">
                  <span>Escanear producto</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition text-emerald-700" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-medium">
                  Envase o lista de ingredientes
                </p>
              </Link>

              {/* Tarjeta 2: Analizar Piel */}
              <Link
                href="/escaner?mode=face"
                className="glass-action-card rounded-3xl p-6 sm:p-8 cursor-pointer relative group border border-amber-500/20 hover:border-amber-500/50 flex flex-col items-center text-center transition duration-300"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-xs">
                  <svg className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="32" cy="32" r="26" fill="#F59E0B" fillOpacity="0.1" />
                    <path d="M12 21V15C12 13.3431 13.3431 12 15 12H21" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M43 12H49C50.6569 12 52 13.3431 52 15V21" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M12 43V49C12 50.6569 13.3431 52 15 52H21" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M43 52H49C50.6569 52 52 50.6569 52 49V43" stroke="#B45309" strokeWidth="2.4" strokeLinecap="round" />
                    <path d="M22 28C22 21 26 17 32 17C38 17 42 21 42 28C42 35 37 42 32 42C27 42 22 35 22 28Z" fill="#FFFBEB" stroke="#78350F" strokeWidth="2.2" />
                    <path d="M22 25C24 20 28 18 32 18C37 18 40 21 42 24C39 21 34 21 32 23C30 25 25 24 22 25Z" fill="#78350F" />
                    <circle cx="28" cy="28.5" r="1.5" fill="#78350F" />
                    <circle cx="36" cy="28.5" r="1.5" fill="#78350F" />
                    <path d="M29.5 34.5C30.8 35.8 33.2 35.8 34.5 34.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
                    <path d="M30 42V45.5H34V42" stroke="#78350F" strokeWidth="2" />
                    <path d="M20 52C21 47 25 45 28 45H36C39 45 43 47 44 52" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="#FEF3C7" />
                    <line x1="14" y1="30" x2="50" y2="30" stroke="#10B981" strokeWidth="2" strokeDasharray="2 3" strokeLinecap="round" />
                    <circle cx="32" cy="30" r="3" fill="#10B981" fillOpacity="0.3" />
                    <circle cx="32" cy="30" r="1.3" fill="#10B981" />
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-slate-900 font-bold text-lg sm:text-xl group-hover:text-amber-900 transition">
                  <span>Analizar piel</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition text-amber-700" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed font-medium">
                  Selfie con diagnóstico IA
                </p>
              </Link>

            </div>

            {/* BUSCADOR INCI CENTRADO Y CHIPS FRECUENTES */}
            <div className="pt-2 max-w-lg mx-auto w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (quickSearchQuery.trim()) {
                    window.location.href = `/escaner?q=${encodeURIComponent(quickSearchQuery)}`;
                  }
                }}
                className="p-1.5 sm:p-2 rounded-full glass-subcard flex items-center gap-2 shadow-xs border border-white"
              >
                <div className="flex items-center gap-3 pl-4 w-full">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="O escribe un cosmético o activo..."
                    className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-1 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold text-white glass-button shrink-0 shadow-xs cursor-pointer"
                >
                  Buscar
                </button>
              </form>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5 text-xs">
                <span className="font-bold text-[#1E3A2B] text-[11px]">Frecuentes:</span>
                {['Niacinamida 10%', 'Retinol 0.3%', 'Ceramidas NP', 'Ácido Salicílico 2%'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const key = tag.toLowerCase().includes('niacin') ? 'niacinamida' :
                                  tag.toLowerCase().includes('retin') ? 'retinol' :
                                  tag.toLowerCase().includes('salic') ? 'acido-salicilico' : 'ceramidas';
                      handleOpenIngredient(key);
                    }}
                    className="px-3.5 py-1 rounded-full bg-white/70 hover:bg-white border border-white text-slate-600 hover:text-slate-900 transition cursor-pointer text-[11px] font-medium shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: RITUAL DE ESTA NOCHE (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-[30px] glass-subcard relative overflow-hidden space-y-5 border border-white/80 shadow-lg">
              
              {/* Encabezado del Ritual */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/70">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: activeNightData.accentColor || '#1E3A2B' }}
                  >
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-900 block">
                      Protocolo • Noche Activa {activeNightData.nightNumber} de 4
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      {activeNightData.phaseName}: {activeNightData.phaseTitle}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {activeNightData.phaseName === 'Exfoliación' ? 'Renovación Dérmica & Exfoliación Química' : 'Fisiología y Cuidado Activo'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold glass-panel text-[#1E3A2B] border border-white">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{userProfile.cycleStreakDays} Días</span>
                  </div>
                </div>
              </div>

              {/* Cosméticos de esta noche */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wide text-slate-500 text-[10.5px]">
                    Cosméticos de esta noche:
                  </span>
                  <span className="text-slate-500 font-medium">
                    ({activeNightData.products.length} {activeNightData.products.length === 1 ? 'fórmula' : 'fórmulas'})
                  </span>
                </div>

                {activeNightData.products.length === 0 ? (
                  <div className="p-5 rounded-2xl glass-panel border border-dashed border-emerald-500/30 text-center space-y-2">
                    <Layers className="w-6 h-6 text-emerald-700 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Sin fórmulas para la {activeNightData.phaseName}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Escanea el envase con la cámara o asígnalo desde tu estantería.
                    </p>
                    <Link
                      href="/escaner?mode=product"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold glass-button shadow-xs"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      <span>Escanear Producto</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeNightData.products.map((product) => (
                      <div
                        key={product.id}
                        className="p-3.5 rounded-2xl glass-panel flex items-center justify-between gap-3 border border-white/80 hover:bg-white/80 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 block truncate">
                              {product.brand}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        <div className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 text-xs font-bold text-emerald-900 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{product.inciScore}% INCI</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Completar Ritual */}
              <div className="pt-3 border-t border-white/70 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
                    💡 Tu calendario avanza automáticamente a la siguiente fase.
                  </p>
                  <Link
                    href="/calendario"
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Matriz 4 Fases</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteTonight}
                  className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold text-white glass-button transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Completar Ritual de Esta Noche</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* 3. EXPEDIENTE DERMATOLÓGICO & BARRERA (2 COLUMNAS GLASSMÓRFICAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Columna 1: Expediente Cutáneo */}
        <div className="glass-panel p-6 sm:p-7 border border-white/80 rounded-[28px] flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Expediente Cutáneo Calibrado
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {userProfile.name || 'Mi Perfil Dermatológico'}
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Biotipo: <strong className="text-slate-800">{userProfile.skinType || 'Sin calibrar'}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2.5 rounded-2xl glass-subcard text-[#1E3A2B] border border-white hover:bg-white transition shadow-xs cursor-pointer"
                title="Ajustar Biotipo"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {userProfile.conditions?.map((cond, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full glass-subcard border border-white text-[11px] text-slate-700 font-medium"
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/60 grid grid-cols-2 gap-3 text-center">
            <div className="p-3.5 rounded-2xl glass-subcard border border-white/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Racha en Curso
              </span>
              <span className="text-lg font-bold text-emerald-900">
                {userProfile.cycleStreakDays} Días Activos
              </span>
            </div>
            <div className="p-3.5 rounded-2xl glass-subcard border border-white/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                Adherencia 4 Fases
              </span>
              <span className="text-lg font-bold text-emerald-900">
                {userProfile.cycleStreakDays > 0 ? '96% (Óptima)' : 'Sin iniciar'}
              </span>
            </div>
          </div>
        </div>

        {/* Columna 2: Barrera Lipídica & Microscopía */}
        <div
          onClick={() => setIsMicroscopyModalOpen(true)}
          className="glass-panel p-6 sm:p-7 border border-white/80 rounded-[28px] flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-2xl transition cursor-pointer group shadow-xl"
        >
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
                  ESTADO DE BARRERA EPIDÉRMICA
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {userProfile.barrierStatus || 'Barrera Estable'}
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-0.5">
                  Pérdida Transepidérmica (TEWL): <strong className="text-emerald-800">{userProfile.tewlScore || '8.4 g/m²h (Óptimo)'}</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-900 group-hover:scale-110 transition shadow-xs">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <p className="text-[12.5px] text-slate-600 mt-3 leading-relaxed font-medium">
              Manto hidrolipídico íntegro con ratio fisiológico óptimo de ceramidas, colesterol y ácidos grasos libres.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/60 flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-emerald-500/30 shrink-0 shadow-xs">
              <img
                src="/stratum-corneum-microscopy.jpg"
                alt="Microscopía Estrato Córneo"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>
            <div className="text-[12px]">
              <span className="font-bold text-emerald-900 block group-hover:underline">
                Abrir Ficha Óptica del Estrato Córneo &gt;
              </span>
              <span className="text-slate-500 text-[11px] font-medium">
                Validado con espectrometría lipídica y biomarcadores
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. SECCIÓN: TU NECESER INTELIGENTE (ESTANTERÍA ACTIVA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-800" />
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                Tu Neceser Inteligente
              </h3>
            </div>
            <p className="text-[12.5px] text-slate-500 font-medium">
              Fórmulas verificadas con base oficial CosIng UE asignadas a tu rutina
            </p>
          </div>

          {/* Phase Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 1, label: 'N1: Exfoliación' },
              { id: 2, label: 'N2: Retinoides' },
              { id: 3, label: 'N3-4: Recuperación' },
              { id: 0, label: 'AM: Día' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveShelfFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold transition cursor-pointer border ${
                  activeShelfFilter === f.id
                    ? 'glass-button text-white shadow-xs'
                    : 'glass-subcard text-slate-600 border-white hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shelf Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {/* Card: Escanear Nuevo Producto */}
          <Link
            href="/escaner?mode=product"
            className="glass-subcard p-4 border-2 border-dashed border-emerald-500/30 rounded-[24px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/80 transition min-h-[220px] group shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-900 shadow-xs mb-2 group-hover:scale-110 transition">
              <Scan className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Escanear Nuevo
            </span>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5">
              Cámara AR / INCI
            </span>
          </Link>

          {filteredShelf.map((product) => (
            <div
              key={product.id}
              className="glass-panel p-3.5 border border-white/80 rounded-[24px] flex flex-col justify-between group hover:border-emerald-500/40 hover:shadow-xl transition"
            >
              <div>
                <div className="relative h-28 w-full rounded-[16px] overflow-hidden bg-white/60 border border-white mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-emerald-900 text-[9.5px] font-bold shadow-2xs">
                    {product.inciScore}% INCI
                  </span>
                </div>

                <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  {product.brand}
                </span>

                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-1 mt-0.5">
                  {product.name}
                </h4>

                {/* Phase Selection Dropdown */}
                <div className="mt-2">
                  <select
                    value={product.assignedPhase}
                    onChange={(e) => assignProductPhase(product.id, parseInt(e.target.value))}
                    className="w-full text-[10.5px] font-semibold bg-white/80 border border-white/90 rounded-xl px-2 py-1 text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value={0}>☀️ Rutina AM (Día)</option>
                    <option value={1}>🌙 Noche 1: Exfoliación</option>
                    <option value={2}>🌙 Noche 2: Retinoide</option>
                    <option value={3}>🌙 Noche 3: Recuperación</option>
                    <option value={4}>🌙 Noche 4: Recuperación</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">PAO: {product.paoMonths}M</span>
                <button
                  type="button"
                  onClick={() => removeProductFromShelf(product.id)}
                  className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Eliminar de mi estantería"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. GUÍA DE BIOTIPOS FACIALES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider block">
              CALIBRACIÓN DERMATOLÓGICA
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Guía de Biotipos y Activos Compatibles
            </h3>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer transition"
          >
            <span>Cambiar mi Biotipo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {facialBiotypes.map((bio) => {
            const Icon = bio.icon;
            return (
              <div
                key={bio.id}
                onClick={() => setIsProfileModalOpen(true)}
                className={`glass-panel p-5 border rounded-[26px] transition cursor-pointer flex flex-col justify-between hover:shadow-xl group ${
                  bio.isCurrent
                    ? 'border-2 border-emerald-500/60 bg-emerald-500/5 shadow-md'
                    : 'border-white/80 hover:border-emerald-500/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: bio.accentColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {bio.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 border border-emerald-500/25 text-[10px] font-bold">
                        Tu Biotipo
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {bio.name}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1.5 leading-snug font-medium">
                    {bio.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/60">
                  <span className="text-[9.5px] font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                    Activos Clave:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {bio.heroActives.map((act, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full glass-subcard border border-white text-slate-800 text-[10.5px] font-medium"
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

      {/* Global Toast Notification */}
      {celebrationToast && (
        <div className="fixed top-24 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-full bg-[#4A6B5B] text-white shadow-2xl flex items-center justify-between px-5 border border-[#8FA89B]">
            <span className="text-[13px] font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#DFCAAC]" />
              {celebrationToast}
            </span>
          </div>
        </div>
      )}

      {/* Modales Globales */}
      <IngredientDetailModal
        ingredient={selectedIngredient}
        onClose={() => setSelectedIngredient(null)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
      />

      <MicroscopyModal
        isOpen={isMicroscopyModalOpen}
        onClose={() => setIsMicroscopyModalOpen(false)}
        userProfile={userProfile}
      />
    </div>
  );
}
