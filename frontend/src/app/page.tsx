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
      
      {/* 1. HERO EDITORIAL CON BUSCADOR INCI & ACCESO RÁPIDO */}
      <div className="card-sand p-6 sm:p-10 border border-[#E2D9CD] relative overflow-hidden shadow-diffuse rounded-[26px]">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#8FA89B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-3 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-sans font-bold uppercase tracking-wider">
              Dermatología Basada en Evidencia
            </span>
            <span className="text-[12px] font-sans text-[#7E756F] hidden sm:inline">
              • Protocolo Skin Cycling Fisiológico 4 Noches
            </span>
          </div>

          <h1 className="font-serif text-[28px] sm:text-[36px] lg:text-[42px] font-semibold text-[#2D2825] leading-tight">
            Auditoría Científica de Skincare & Ciclado Cutáneo
          </h1>

          <p className="text-[14px] sm:text-[15.5px] font-sans text-[#4A433E] mt-2.5 leading-relaxed max-w-2xl">
            Verifica la seguridad y eficacia de cualquier fórmula cosmética contra la base oficial <strong>CosIng UE</strong> y estudios médicos en <strong>PubMed</strong>.
          </p>

          {/* Buscador INCI Expandido */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (quickSearchQuery.trim()) {
                window.location.href = `/escaner?q=${encodeURIComponent(quickSearchQuery)}`;
              }
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7E756F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Busca un activo (ej: Niacinamida) o escribe un cosmético..."
                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-[#E8E1D7] text-[#2D2825] text-[13.5px] placeholder-[#9D948B] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B] shadow-xs"
              />
            </div>

            <Link
              href="/escaner"
              className="px-6 py-3.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[13.5px] shadow-diffuse transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>Auditar con Cámara / INCI</span>
            </Link>
          </form>

          {/* Chips de acceso rápido */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11.5px] text-[#7E756F]">
            <span className="font-semibold text-[#4A6B5B] mr-1">Frecuentes:</span>
            {['Niacinamida 10%', 'Retinol 0.3%', 'Ceramidas NP', 'Ácido Salicílico 2%', 'Centella Asiática (Cica)'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const key = tag.toLowerCase().includes('niacin') ? 'niacinamida' :
                              tag.toLowerCase().includes('retin') ? 'retinol' :
                              tag.toLowerCase().includes('salic') ? 'acido-salicilico' :
                              tag.toLowerCase().includes('centella') ? 'centella' : 'ceramidas';
                  handleOpenIngredient(key);
                }}
                className="px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-[#E2D9CD] hover:border-[#8FA89B] text-[#2D2825] transition cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ALERTA DE CONFLICTOS QUÍMICOS (SI EXISTEN EN EL NECESER) */}
      {conflicts.length > 0 && (
        <div className="space-y-3">
          {conflicts.map((conflict) => (
            <div
              key={conflict.id}
              className={`p-4 sm:p-5 rounded-[22px] border flex items-start gap-4 shadow-diffuse animate-in slide-in-from-top-2 ${
                conflict.severity === 'CRITICAL'
                  ? 'bg-[#FAF0ED] border-[#D8A899] text-[#943C36]'
                  : 'bg-[#FAF5EE] border-[#DFCAAC] text-[#7A5832]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-current" />
              </div>
              <div className="flex-1 text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/80">
                    Alerta Dermatológica
                  </span>
                  <h4 className="font-serif font-bold text-[16px]">
                    {conflict.title}
                  </h4>
                </div>
                <p className="mt-1 leading-relaxed opacity-95">
                  {conflict.description}
                </p>
                <div className="mt-2 text-[12px] bg-white/70 p-2.5 rounded-[12px] font-medium inline-block">
                  💡 <strong>Recomendación:</strong> {conflict.recommendation}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. SECCIÓN PROTAGONISTA: "TU RITUAL DE ESTA NOCHE" (THE CORE HABIT) */}
      <div className="card-white p-6 sm:p-8 border-2 border-[#8FA89B]/50 rounded-[26px] shadow-diffuse relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#EBF1EE]/60 rounded-full blur-3xl pointer-events-none" />

        {/* Encabezado del Ritual */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E1D7] pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activeNightData.accentColor }}
            >
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider block">
                Protocolo de Ciclado • Noche Activa {activeNightData.nightNumber} de 4
              </span>
              <h2 className="font-serif text-[22px] sm:text-[26px] font-semibold text-[#2D2825]">
                {activeNightData.phaseName}: {activeNightData.phaseTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E2D9CD] text-[12px] font-semibold text-[#4A6B5B] flex items-center gap-1.5 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-[#DFCAAC]" />
              <span>{userProfile.cycleStreakDays} Días en Racha</span>
            </div>
            <Link
              href="/calendario"
              className="text-[12px] font-semibold text-[#4A6B5B] hover:text-[#3D5A4C] flex items-center gap-1 transition"
            >
              <span>Ver Matriz Completa</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Cosméticos asignados a esta noche */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-[#7E756F] tracking-wider">
              Tus Cosméticos Registrados para Esta Noche:
            </span>
            <span className="text-[12px] text-[#7E756F]">
              ({activeNightData.products.length} {activeNightData.products.length === 1 ? 'fórmula' : 'fórmulas'})
            </span>
          </div>

          {activeNightData.products.length === 0 ? (
            <div className="p-6 rounded-[20px] bg-[#FAF8F5] border border-dashed border-[#8FA89B]/50 text-center space-y-2.5">
              <Layers className="w-8 h-8 text-[#8FA89B] mx-auto" />
              <h4 className="font-serif text-[16px] font-semibold text-[#2D2825]">
                No tienes cosméticos asignados a la {activeNightData.phaseName}
              </h4>
              <p className="text-[12.5px] text-[#7E756F] max-w-md mx-auto">
                Escanea el envase de tu producto con la cámara o asígnalo directamente desde tu estantería.
              </p>
              <Link
                href="/escaner"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white text-[12.5px] font-semibold shadow-xs transition"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Escanear Producto para Hoy</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {activeNightData.products.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-[18px] bg-[#FAF8F5] border border-[#E8E1D7] flex items-center gap-3.5 shadow-2xs group hover:border-[#8FA89B] transition"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-[12px] object-cover border border-[#E2D9CD] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[9.5px] font-bold uppercase text-[#7E756F] block truncate">
                      {product.brand}
                    </span>
                    <h5 className="font-serif text-[14.5px] font-semibold text-[#2D2825] truncate">
                      {product.name}
                    </h5>
                    <span className="text-[11px] text-[#4A6B5B] font-medium block mt-0.5">
                      Compatibilidad INCI: {product.inciScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA "Completar Ritual de Esta Noche" */}
        <div className="pt-3 border-t border-[#E8E1D7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-[12.5px] text-[#7E756F]">
            💡 Al completar el ritual, tu barrera se recalcula y tu calendario avanza automáticamente a la siguiente fase.
          </div>

          <button
            type="button"
            onClick={handleCompleteTonight}
            className="px-7 py-3.5 rounded-full bg-[#4A6B5B] hover:bg-[#3D5A4C] text-white font-sans font-semibold text-[14px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-4 h-4 text-[#DFCAAC]" />
            <span>Completar Ritual de Esta Noche</span>
          </button>
        </div>
      </div>

      {/* 4. EXPEDIENTE DERMATOLÓGICO & BARRERA (2 COLUMNAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Columna 1: Expediente Cutáneo */}
        <div className="card-sand p-6 border border-[#E2D9CD] rounded-[24px] flex flex-col justify-between shadow-diffuse">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10.5px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider block">
                  Expediente Cutáneo Calibrado
                </span>
                <h3 className="font-serif text-[22px] font-semibold text-[#2D2825] mt-0.5">
                  {userProfile.name || 'Mi Perfil Dermatológico'}
                </h3>
                <p className="text-[12.5px] text-[#7E756F] mt-0.5">
                  Biotipo: <strong className="text-[#2D2825]">{userProfile.skinType || 'Sin calibrar'}</strong>
                </p>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="p-2.5 rounded-full bg-white text-[#4A6B5B] border border-[#E2D9CD] hover:border-[#8FA89B] transition shadow-xs cursor-pointer"
                title="Ajustar Biotipo"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {userProfile.conditions?.map((cond, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-white/80 border border-[#E2D9CD] text-[11px] text-[#4A433E] font-medium"
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E2D9CD] grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-[16px] bg-white/80 border border-[#E2D9CD]">
              <span className="text-[10.5px] text-[#7E756F] uppercase font-bold block">
                Racha en Curso
              </span>
              <span className="font-serif text-[18px] font-bold text-[#4A6B5B]">
                {userProfile.cycleStreakDays} Días Activos
              </span>
            </div>
            <div className="p-3 rounded-[16px] bg-white/80 border border-[#E2D9CD]">
              <span className="text-[10.5px] text-[#7E756F] uppercase font-bold block">
                Adherencia 4 Fases
              </span>
              <span className="font-serif text-[18px] font-bold text-[#4A6B5B]">
                {userProfile.cycleStreakDays > 0 ? '96% (Óptima)' : 'Sin iniciar'}
              </span>
            </div>
          </div>
        </div>

        {/* Columna 2: Barrera Lipídica & Microscopía */}
        <div
          onClick={() => setIsMicroscopyModalOpen(true)}
          className="card-white p-6 border border-[#E8E1D7] rounded-[24px] flex flex-col justify-between hover:border-[#8FA89B] hover:shadow-diffuse-elevated transition cursor-pointer group shadow-diffuse"
        >
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-section-h3 text-[#7E756F]">
                  ESTADO DE BARRERA EPIDÉRMICA
                </span>
                <h3 className="font-serif text-[22px] font-semibold text-[#2D2825] mt-1">
                  {userProfile.barrierStatus || 'Barrera Estable'}
                </h3>
                <p className="text-[12.5px] text-[#7E756F] mt-0.5">
                  Pérdida Transepidérmica (TEWL): <strong className="text-[#4A6B5B]">{userProfile.tewlScore || '8.4 g/m²h (Óptimo)'}</strong>
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#EBF1EE] flex items-center justify-center text-[#4A6B5B] group-hover:scale-105 transition">
                <Maximize2 className="w-4 h-4" />
              </div>
            </div>

            <p className="text-[12.5px] text-[#4A433E] mt-3 leading-relaxed">
              Manto hidrolipídico íntegro con ratio fisiológico óptimo de ceramidas, colesterol y ácidos grasos libres.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#E8E1D7] flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#8FA89B] shrink-0 shadow-xs">
              <img
                src="/stratum-corneum-microscopy.jpg"
                alt="Microscopía Estrato Córneo"
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
            </div>
            <div className="text-[12px]">
              <span className="font-semibold text-[#4A6B5B] block group-hover:underline">
                Abrir Ficha Óptica del Estrato Córneo &gt;
              </span>
              <span className="text-[#7E756F] text-[11px]">
                Validado con espectrometría lipídica y biomarcadores
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 5. SECCIÓN: TU NECESER INTELIGENTE (ESTANTERÍA ACTIVA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#4A6B5B]" />
              <h3 className="font-serif text-[22px] font-semibold text-[#2D2825]">
                Tu Neceser Inteligente
              </h3>
            </div>
            <p className="text-[12.5px] text-[#7E756F]">
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
                className={`px-3 py-1.5 rounded-full text-[11.5px] font-medium transition cursor-pointer border ${
                  activeShelfFilter === f.id
                    ? 'bg-[#4A6B5B] text-white border-[#4A6B5B] shadow-xs'
                    : 'bg-white text-[#7E756F] border-[#E8E1D7] hover:border-[#8FA89B]'
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
            href="/escaner"
            className="card-sand p-4 border-2 border-dashed border-[#8FA89B]/50 rounded-[20px] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#EBF1EE] transition min-h-[220px] group"
          >
            <div className="w-12 h-12 rounded-full bg-white border border-[#8FA89B] flex items-center justify-center text-[#4A6B5B] shadow-xs mb-2 group-hover:scale-110 transition">
              <Scan className="w-5 h-5" />
            </div>
            <span className="font-serif text-[15px] font-semibold text-[#2D2825]">
              Escanear Nuevo
            </span>
            <span className="text-[11px] text-[#7E756F] mt-0.5">
              Cámara AR / INCI
            </span>
          </Link>

          {filteredShelf.map((product) => (
            <div
              key={product.id}
              className="card-white p-3.5 border border-[#E8E1D7] rounded-[20px] flex flex-col justify-between group hover:border-[#8FA89B] hover:shadow-diffuse transition"
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

                <span className="text-[9.5px] font-bold text-[#7E756F] uppercase tracking-wider block truncate">
                  {product.brand}
                </span>

                <h4 className="font-serif text-[14px] font-semibold text-[#2D2825] line-clamp-1 mt-0.5">
                  {product.name}
                </h4>

                {/* Phase Selection Dropdown */}
                <div className="mt-2">
                  <select
                    value={product.assignedPhase}
                    onChange={(e) => assignProductPhase(product.id, parseInt(e.target.value))}
                    className="w-full text-[10.5px] font-medium bg-[#FAF8F5] border border-[#E8E1D7] rounded-lg px-2 py-1 text-[#4A6B5B] focus:outline-none focus:border-[#8FA89B]"
                  >
                    <option value={0}>☀️ Rutina AM (Día)</option>
                    <option value={1}>🌙 Noche 1: Exfoliación</option>
                    <option value={2}>🌙 Noche 2: Retinoide</option>
                    <option value={3}>🌙 Noche 3: Recuperación</option>
                    <option value={4}>🌙 Noche 4: Recuperación</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-[11px] text-[#7E756F]">
                <span>PAO: {product.paoMonths}M</span>
                <button
                  type="button"
                  onClick={() => removeProductFromShelf(product.id)}
                  className="text-[#9D948B] hover:text-[#943C36] transition p-1 cursor-pointer"
                  title="Eliminar de mi estantería"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. GUÍA DE BIOTIPOS FACIALES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-section-h3 text-[#7E756F]">
              CALIBRACIÓN DERMATOLÓGICA
            </span>
            <h3 className="font-serif text-[20px] sm:text-[22px] font-semibold text-[#2D2825]">
              Guía de Biotipos y Activos Compatibles
            </h3>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="text-[12px] font-semibold text-[#4A6B5B] hover:text-[#3D5A4C] flex items-center gap-1 cursor-pointer transition"
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
                className={`card-white p-4 border rounded-[22px] transition cursor-pointer flex flex-col justify-between hover:shadow-diffuse-elevated group ${
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

                  <h4 className="font-serif text-[16px] font-semibold text-[#2D2825] leading-tight">
                    {bio.name}
                  </h4>

                  <p className="text-[12px] text-[#7E756F] mt-1.5 leading-snug">
                    {bio.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E8E1D7]">
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
