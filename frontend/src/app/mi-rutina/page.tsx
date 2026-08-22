'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRight,
  Info,
  Clock,
  User as UserIcon,
  ExternalLink,
  Settings,
  AlertTriangle,
  HeartPulse,
  Droplets,
  Tag,
  Share2,
  Download,
  Copy,
  Check
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import {
  getCurrentUser,
  getSavedCustomProtocol,
  getStoredRoutineProducts,
  setStoredRoutineProducts,
  StoredUser,
} from '@/lib/api';
import { SkinCyclingProtocol, UserRoutineProduct, ProtocolNight } from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';

export default function MyRoutineDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [protocol, setProtocol] = useState<SkinCyclingProtocol | null>(null);
  const [products, setProducts] = useState<UserRoutineProduct[]>([]);
  const [streakCount, setStreakCount] = useState<number>(4);
  const [isAmDone, setIsAmDone] = useState<boolean>(false);
  const [isPmDone, setIsPmDone] = useState<boolean>(false);

  // SOS Barrier Mode State (For days when skin wakes up sensitive or irritated)
  const [isSosActive, setIsSosActive] = useState<boolean>(false);

  // Share Routine Card State
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<UserRoutineProduct['category']>('EXFOLIANT');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const savedData = getSavedCustomProtocol();
    if (savedData && savedData.protocol) {
      setProtocol(savedData.protocol);
    } else {
      // Default fallback protocol
      const defaultProtocol = generateCustomProtocol({
        skinType: 'COMBINATION',
        fitzpatrick: 3,
        barrierStatus: 'HEALTHY',
        conditions: ['CLOGGED_PORES'],
        pregnancyOrNursing: false,
        experienceLevel: 'INTERMEDIATE',
      });
      setProtocol(defaultProtocol);
    }

    const storedProducts = getStoredRoutineProducts();
    if (storedProducts.length > 0) {
      setProducts(storedProducts);
    } else {
      // Sample starter products with expanded categories
      const starterProducts: UserRoutineProduct[] = [
        {
          id: '1',
          phaseId: 1,
          productName: '2% BHA Liquid Exfoliant',
          brand: 'Paula’s Choice',
          category: 'EXFOLIANT',
        },
        {
          id: '2',
          phaseId: 2,
          productName: 'A-Game 5 (Retinal 0.05%)',
          brand: 'Geek & Gorgeous',
          category: 'RETINOID',
        },
        {
          id: '3',
          phaseId: 3,
          productName: 'Cicaplast B5+ Baume',
          brand: 'La Roche-Posay',
          category: 'SOS_TREATMENT',
        },
        {
          id: '4',
          phaseId: 0,
          productName: 'Anthelios UVMune 400 FPS 50+',
          brand: 'La Roche-Posay',
          category: 'SPF',
        },
      ];
      setProducts(starterProducts);
      setStoredRoutineProducts(starterProducts);
    }
  }, []);

  const cycleLength = protocol?.cycleLength || 4;

  // Calculate current night based on calendar day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const currentNightIndex = (dayOfYear % cycleLength) + 1;
  const standardNight = protocol?.nights.find((n) => n.nightNumber === currentNightIndex) || protocol?.nights[0];

  // SOS Override Night Definition
  const sosNight: ProtocolNight = {
    nightNumber: currentNightIndex,
    category: 'SOS_RESCUE',
    title: '🛡️ Noche SOS: Recuperación y Calma de Barrera',
    subtitle: 'Pausa de ácidos y retinoides para sanar la piel',
    badgeColor: 'rose',
    recommendedActives: ['Pantenol (B5)', 'Centella Asiática (Cica)', 'Ceramidas NP/AP/EOP', 'Ácido Hialurónico', 'Avena Coloidal'],
    suggestedSteps: [
      '1. Limpieza ultrasuave sin frotar con agua tibia',
      '2. Aplicar suero o bruma hidratante sobre piel húmeda',
      '3. Sellar con crema reparadora densa con ceramidas o bálsamo calmante',
      '4. Cero exfoliantes, retinoides o fricción mecánica'
    ],
    clinicalRationale: 'Tu piel necesita descansar y reparar su manto hidrolipídico. Evitamos cualquier activo irritante hasta que ceda la tirantez o rojez.',
    precautions: ['No uses cepillos ni esponjas exfoliantes', 'Usa abundante protector solar mañana']
  };

  const currentNight = isSosActive ? sosNight : standardNight;

  // Generate 7-day calendar forecast
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dayNightIndex = ((dayOfYear + i) % cycleLength) + 1;
    const nightObj = protocol?.nights.find((n) => n.nightNumber === dayNightIndex);

    return {
      date: d,
      dayName: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es-ES', { weekday: 'short' }),
      dateNum: d.getDate(),
      nightNumber: dayNightIndex,
      category: i === 0 && isSosActive ? 'SOS_RESCUE' : (nightObj?.category || 'RECOVERY'),
      title: i === 0 && isSosActive ? 'Noche SOS Calma' : (nightObj?.title || `Noche ${dayNightIndex}`),
    };
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: UserRoutineProduct = {
      id: 'prod_' + Math.random().toString(36).substring(7),
      phaseId: selectedPhase,
      productName: newProductName,
      brand: newProductBrand || undefined,
      category: newProductCategory,
    };

    const updated = [...products, newProd];
    setProducts(updated);
    setStoredRoutineProducts(updated);

    setNewProductName('');
    setNewProductBrand('');
    setIsAddProductOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    setStoredRoutineProducts(updated);
  };

  const getCategoryLabel = (cat: UserRoutineProduct['category']) => {
    switch (cat) {
      case 'CLEANSER': return 'Limpiador';
      case 'TONER': return 'Tónico / Bruma';
      case 'SERUM': return 'Suero';
      case 'EXFOLIANT': return 'Exfoliante';
      case 'RETINOID': return 'Retinoide';
      case 'MOISTURIZER': return 'Hidratante';
      case 'SPF': return 'Protector Solar';
      case 'SOS_TREATMENT': return 'Bálsamo SOS / Cica';
      default: return 'Producto';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Card */}
        <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#4F6D60] bg-[#EFF5F1] px-3.5 py-1 rounded-full border border-[#7A9A8B]/30 uppercase tracking-widest">
                Seguimiento de Rutina Diaria
              </span>
              <span className="text-xs text-[#9C9790]">•</span>
              <span className="text-xs font-medium text-[#6E6A66]">
                {user ? `Cuenta de ${user.name}` : 'Almacenamiento Local'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2A29] tracking-tight">
              Mi Calendario de <span className="text-[#7A9A8B]">Skin Cycling</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A66]">
              Ritual activo: <strong className="text-[#2B2A29] font-serif">{protocol?.protocolName}</strong> ({cycleLength} noches por ciclo)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Streak Badge */}
            <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EFECE6] px-4 py-2.5 rounded-full text-[#2B2A29] shadow-xs">
              <Flame className="w-4 h-4 text-[#C4A482] fill-[#C4A482]" />
              <div>
                <span className="text-xs font-bold block leading-none">{streakCount} Días en Racha</span>
                <span className="text-[10px] text-[#6E6A66]">Constancia 100%</span>
              </div>
            </div>

            {/* SOS RESCUE BUTTON */}
            <button
              type="button"
              onClick={() => setIsSosActive(!isSosActive)}
              className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full transition-all duration-200 shadow-xs cursor-pointer touch-target ${
                isSosActive
                  ? 'bg-[#A46864] hover:bg-[#8F5551] text-white ring-2 ring-[#E8D5D0]'
                  : 'bg-[#F8EFEA] hover:bg-[#F2E4DE] text-[#A46864] border border-[#E8D5D0]'
              }`}
              title="Activar si tu piel amanece sensible o con rojez para pausar exfoliantes y retinoides"
            >
              <HeartPulse className={`w-4 h-4 ${isSosActive ? 'animate-pulse' : 'text-[#A46864]'}`} />
              <span>{isSosActive ? 'Modo Calma Activo' : 'Botón SOS: Piel Sensible'}</span>
            </button>

            {/* SHARE ROUTINE CARD BUTTON */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#EFF5F1] hover:bg-[#E2ECE5] text-[#4F6D60] text-xs font-bold px-4 py-2.5 rounded-full border border-[#7A9A8B]/30 transition-all duration-200 cursor-pointer touch-target shadow-2xs"
              title="Compartir o exportar ficha estética de mi rutina"
            >
              <Share2 className="w-3.5 h-3.5 text-[#7A9A8B]" />
              <span>Compartir Tarjeta</span>
            </button>

            <Link
              href="/rutinas/skin-cycling"
              className="inline-flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#6E6A66] text-xs font-bold px-4 py-2.5 rounded-full border border-[#EFECE6] transition-all duration-200 touch-target"
            >
              <Settings className="w-3.5 h-3.5 text-[#7A9A8B]" />
              <span>Reajustar Ciclo</span>
            </Link>
          </div>
        </div>

        {/* SOS ACTIVE BANNER ALERT */}
        {isSosActive && (
          <div className="p-4 bg-[#F8EFEA] border border-[#E8D5D0] rounded-3xl flex items-start gap-3.5 shadow-beauty animate-in fade-in">
            <div className="p-2 bg-white rounded-2xl text-[#A46864] shrink-0 border border-[#E8D5D0]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-serif font-bold text-[#A46864]">
                🛡️ Modo Rescate Calmante Activado para esta Noche
              </h3>
              <p className="text-xs text-[#6E6A66] leading-relaxed">
                Pausamos automáticamente tus exfoliantes químicos y retinoides de hoy. Tu piel se enfocará en calmar rojeces con hidratación y lípidos biomiméticos.
              </p>
              <button
                type="button"
                onClick={() => setIsSosActive(false)}
                className="text-[11px] font-bold text-[#A46864] underline mt-1 cursor-pointer block touch-target"
              >
                Volver al orden programado habitual
              </button>
            </div>
          </div>
        )}

        {/* SECTION: TODAY'S ACTIVE NIGHT HERO */}
        {currentNight && (
          <div className={`text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-beauty relative overflow-hidden transition-all duration-300 ${
            isSosActive
              ? 'bg-gradient-to-br from-[#A46864] via-[#8F5551] to-[#6E3C38]'
              : 'bg-gradient-to-br from-[#4F6D60] via-[#5A796B] to-[#3D554A]'
          }`}>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    isSosActive ? 'bg-white text-[#A46864]' : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}>
                    {isSosActive ? 'Modo Calma SOS' : `Fase de Hoy: Noche ${currentNight.nightNumber}`}
                  </span>
                  <span className="bg-white/10 text-white text-[11px] px-3 py-0.5 rounded-full font-medium">
                    {today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {currentNight.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#FDFBF7]/90 leading-relaxed max-w-xl">
                  {currentNight.clinicalRationale}
                </p>

                {/* Actives Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#E8D5D0] font-semibold mr-1">Activos para hoy:</span>
                  {currentNight.recommendedActives.map((act, i) => (
                    <span
                      key={i}
                      className="bg-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Adherence Checklist */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8D5D0] block">
                  Checklist del Día:
                </span>

                {/* AM Check */}
                <button
                  type="button"
                  onClick={() => setIsAmDone(!isAmDone)}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all duration-200 text-left border cursor-pointer touch-target ${
                    isAmDone
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-[#C4A482]" />
                    <div>
                      <span className="text-xs font-bold block">Rutina AM (Mañana)</span>
                      <span className="text-[10px] text-white/70">Limpieza suave + Hidratante + FPS 50+</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isAmDone ? 'text-white' : 'text-white/40'}`}
                  />
                </button>

                {/* PM Check */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isPmDone) setStreakCount((prev) => prev + 1);
                    setIsPmDone(!isPmDone);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all duration-200 text-left border cursor-pointer touch-target ${
                    isPmDone
                      ? 'bg-white/20 border-white/40 text-white'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-[#E8D5D0]" />
                    <div>
                      <span className="text-xs font-bold block">Rutina PM (Noche {currentNight.nightNumber})</span>
                      <span className="text-[10px] text-white/70">{currentNight.subtitle}</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isPmDone ? 'text-white' : 'text-white/40'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: CALENDARIO DE CICLADO INTERACTIVO (ESTILO REFERENCIA BEAUTY) */}
        <section className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Seguimiento de Ciclado Cutáneo
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2B2A29] tracking-tight">
                Calendario de Noches
              </h3>
            </div>
            
            {/* Legend / Guía de Fases */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7A9A8B]" />
                <span className="text-[#6E6A66] font-medium">Exfoliación</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A46864]" />
                <span className="text-[#6E6A66] font-medium">Retinoide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C4A482]" />
                <span className="text-[#6E6A66] font-medium">Recuperación</span>
              </div>
            </div>
          </div>

          {/* Month Header & Controls */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-serif font-bold text-[#2B2A29]">
                {today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
              </span>
              <span className="text-xs bg-[#EFF5F1] text-[#4F6D60] font-bold px-3 py-0.5 rounded-full border border-[#7A9A8B]/30">
                Ciclo de {cycleLength} noches
              </span>
            </div>
            
            <div className="text-xs font-semibold text-[#6E6A66] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EFECE6]">
              Hoy es {today.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
            </div>
          </div>

          {/* 7-DAY WEEKDAY HEADER */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] font-bold text-[#9C9790] uppercase pb-1 tracking-wider">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* 14-DAY CALENDAR MATRIX (2 SEMANAS ACTIVAS CON DOTS DE FASE BEAUTY) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-3 text-center">
            {Array.from({ length: 14 }, (_, i) => {
              const d = new Date();
              const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 for Monday
              d.setDate(today.getDate() - currentDayOfWeek + i);

              const isCurrentDay = d.toDateString() === today.toDateString();
              const calcDayOfYear = Math.floor(
                (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
              );
              const dayPhaseIndex = ((calcDayOfYear % cycleLength) + cycleLength) % cycleLength + 1;
              const phaseObj = protocol?.nights.find((n) => n.nightNumber === dayPhaseIndex);

              const isExfoliation = phaseObj?.category === 'EXFOLIATION';
              const isRetinoid = phaseObj?.category === 'RETINOID';
              const phaseDotColor = isExfoliation
                ? 'bg-[#7A9A8B]'
                : isRetinoid
                ? 'bg-[#A46864]'
                : 'bg-[#C4A482]';

              const phaseBg = isCurrentDay
                ? 'bg-[#4F6D60] text-white shadow-beauty ring-2 ring-[#7A9A8B]/40'
                : 'bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#2B2A29] border border-[#EFECE6]';

              return (
                <div
                  key={i}
                  className={`p-2.5 sm:p-3.5 rounded-2xl transition-all duration-200 flex flex-col items-center justify-between space-y-1.5 cursor-pointer touch-target relative ${phaseBg}`}
                >
                  {isCurrentDay && (
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Hoy
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-bold font-serif">
                    {d.getDate()}
                  </span>
                  
                  {/* Skin Cycling Phase Dot Indicator */}
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCurrentDay ? 'bg-white' : phaseDotColor
                      }`}
                      title={phaseObj?.title || `Noche ${dayPhaseIndex}`}
                    />
                  </div>

                  <span className={`text-[9px] font-medium truncate max-w-full ${isCurrentDay ? 'text-white/90' : 'text-[#6E6A66]'}`}>
                    Noche {dayPhaseIndex}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: MY ASSIGNED PRODUCTS FOR EACH NIGHT */}
        <section className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Tocador Digital
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2B2A29] tracking-tight">
                Tus Fórmulas Asignadas por Fase
              </h3>
              <p className="text-xs text-[#6E6A66] mt-0.5">
                Organiza qué cosmético utilizas en cada momento para evitar sobrecargar tu barrera cutánea.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#7A9A8B] hover:bg-[#688577] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-xs transition-all duration-200 cursor-pointer touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Producto a Rutina</span>
            </button>
          </div>

          {/* Grid of Nights + Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Daily AM Routine */}
            <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-5 border border-[#EFECE6] space-y-3">
              <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2.5">
                <span className="text-xs font-bold text-[#C4A482] uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#C4A482]" /> Mañanas (AM)
                </span>
                <span className="text-[10px] text-[#9C9790]">Todos los días</span>
              </div>
              <div className="space-y-2">
                {products
                  .filter((p) => p.phaseId === 0)
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#EFECE6] flex items-center justify-between text-xs shadow-xs hover:border-[#7A9A8B]/30 transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#2B2A29] block">{prod.productName}</span>
                        <div className="flex items-center gap-1.5">
                          {prod.brand && <span className="text-[10px] text-[#6E6A66]">{prod.brand}</span>}
                          <span className="text-[9px] bg-[#EFF5F1] text-[#4F6D60] px-2 py-0.5 rounded-full font-medium">
                            {getCategoryLabel(prod.category)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-[#9C9790] hover:text-[#A46864] p-1.5 transition cursor-pointer touch-target"
                        title="Eliminar de rutina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Nights 1 to N */}
            {protocol?.nights.map((n) => {
              const nightProducts = products.filter((p) => p.phaseId === n.nightNumber);
              const isExfoliation = n.category === 'EXFOLIATION';
              const isRetinoid = n.category === 'RETINOID';
              const iconColor = isExfoliation ? 'text-[#7A9A8B]' : isRetinoid ? 'text-[#A46864]' : 'text-[#C4A482]';

              return (
                <div key={n.nightNumber} className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-5 border border-[#EFECE6] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#EFECE6] pb-2.5">
                    <span className="text-xs font-bold text-[#2B2A29] uppercase tracking-wider flex items-center gap-1.5">
                      <Moon className={`w-3.5 h-3.5 ${iconColor}`} /> Noche {n.nightNumber}
                    </span>
                    <span className={`text-[10px] font-bold ${iconColor}`}>{n.category}</span>
                  </div>

                  <div className="space-y-2">
                    {nightProducts.length === 0 ? (
                      <p className="text-[11px] text-[#9C9790] italic py-2">
                        Sin fórmulas asignadas aún.
                      </p>
                    ) : (
                      nightProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#EFECE6] flex items-center justify-between text-xs shadow-xs hover:border-[#7A9A8B]/30 transition-all"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#2B2A29] block">{prod.productName}</span>
                            <div className="flex items-center gap-1.5">
                              {prod.brand && <span className="text-[10px] text-[#6E6A66]">{prod.brand}</span>}
                              <span className="text-[9px] bg-[#FAF8F5] text-[#6E6A66] px-2 py-0.5 rounded-full font-medium border border-[#EFECE6]">
                                {getCategoryLabel(prod.category)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-[#9C9790] hover:text-[#A46864] p-1.5 transition cursor-pointer touch-target"
                            title="Eliminar de rutina"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* INTEGRATED BEAUTY RECOMMENDATION BANNER */}
        <div className="bg-gradient-to-r from-[#4F6D60] via-[#5A796B] to-[#3D554A] text-[#FDFBF7] rounded-3xl p-6 sm:p-7 shadow-beauty flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="text-[10px] font-bold text-[#E8D5D0] uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#7A9A8B]" /> Consejo de Belleza & Cuidado
            </span>
            <h4 className="text-lg font-serif font-bold text-white">
              ¿Vas a incorporar un nuevo activo a tu ritual de piel?
            </h4>
            <p className="text-xs text-[#FDFBF7]/90 max-w-xl">
              Realiza siempre una prueba de parche en el antebrazo 24 horas antes para comprobar la armonía con tu piel.
            </p>
          </div>
          <Link
            href="/"
            className="bg-[#FDFBF7] text-[#4F6D60] hover:bg-white text-xs font-bold px-6 py-3 rounded-full transition-all duration-200 shadow-xs flex-shrink-0 touch-target"
          >
            Evaluar fórmula nueva →
          </Link>
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2A29]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-beauty space-y-5 border border-[#EFECE6]">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Nuevo Cosmético
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2B2A29]">
                Agregar Producto a tu Rutina
              </h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6E6A66] mb-1.5">
                  Nombre del Producto / Cosmético
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sérum de Niacinamida 10%"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl focus:outline-none focus:border-[#7A9A8B] text-[#2B2A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6E6A66] mb-1.5">
                  Marca (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: The Ordinary / Glossier / Paula's Choice"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl focus:outline-none focus:border-[#7A9A8B] text-[#2B2A29]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6E6A66] mb-1.5">
                  Categoría del Producto
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as UserRoutineProduct['category'])}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl focus:outline-none focus:border-[#7A9A8B] text-[#2B2A29] font-medium"
                >
                  <option value="CLEANSER">Limpiador Facial</option>
                  <option value="TONER">Tónico / Esencia</option>
                  <option value="SERUM">Sérum Concentrado</option>
                  <option value="EXFOLIANT">Exfoliante Químico (AHA / BHA / PHA)</option>
                  <option value="RETINOID">Retinoide / Retinol / Retinal</option>
                  <option value="MOISTURIZER">Crema Hidratante / Reparadora</option>
                  <option value="SPF">Protector Solar (FPS 50+)</option>
                  <option value="SOS_TREATMENT">Bálsamo Calmante / Cica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6E6A66] mb-1.5">
                  ¿Cuándo lo vas a aplicar?
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#EFECE6] rounded-2xl focus:outline-none focus:border-[#7A9A8B] text-[#2B2A29] font-medium"
                >
                  <option value={0}>☀️ Todas las Mañanas (AM)</option>
                  {protocol?.nights.map((n) => (
                    <option key={n.nightNumber} value={n.nightNumber}>
                      🌙 Noche {n.nightNumber}: {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#6E6A66] hover:bg-[#FAF8F5] transition cursor-pointer touch-target"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#7A9A8B] hover:bg-[#688577] text-white transition shadow-xs cursor-pointer touch-target"
                >
                  Guardar Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHARE ROUTINE CARD MODAL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2B2A29]/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-beauty space-y-5 border border-[#EFECE6] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#4F6D60] bg-[#EFF5F1] px-3 py-0.5 rounded-full uppercase tracking-widest border border-[#7A9A8B]/30">
                  Tarjeta Digital de Protocolo
                </span>
                <h3 className="text-xl font-serif font-bold text-[#2B2A29] mt-1">
                  Tu Ficha de Skin Cycling
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="text-[#9C9790] hover:text-[#2B2A29] p-1.5 rounded-full transition"
              >
                ✕
              </button>
            </div>

            {/* AESTHETIC VISUAL CARD PREVIEW (INSTAGRAM / SOCIAL READY) */}
            <div id="routine-share-card" className="bg-gradient-to-br from-[#4F6D60] via-[#5A796B] to-[#3D554A] text-[#FDFBF7] p-6 rounded-3xl space-y-4 shadow-beauty relative overflow-hidden border border-white/20">
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#E8D5D0] uppercase tracking-widest block">
                    Allabout.skin • Protocolo Personalizado
                  </span>
                  <h4 className="text-xl font-serif font-bold text-white">
                    {protocol?.protocolName || 'Ritual de Ciclado Cutáneo'}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-lg">
                  ✨
                </div>
              </div>

              {/* Nights Summary Grid in Card */}
              <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-white/15 text-xs">
                {protocol?.nights.map((n) => (
                  <div key={n.nightNumber} className="bg-white/10 backdrop-blur-xs p-2.5 rounded-2xl border border-white/10">
                    <span className="text-[10px] text-[#E8D5D0] font-bold block uppercase">
                      Noche {n.nightNumber} • {n.category}
                    </span>
                    <span className="text-white font-serif font-bold text-xs truncate block">
                      {n.title.replace(/^[^\w]+/, '')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Racha & Footer in Card */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-[#FDFBF7]/80 pt-2 border-t border-white/10">
                <span>🔥 {streakCount} días de constancia</span>
                <span>allabout.skin</span>
              </div>

              {/* Background Glows */}
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[#A3B899]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -top-8 w-36 h-36 bg-[#E8D5D0]/15 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  const shareText = `✨ Mi protocolo de Skin Cycling en Allabout.skin: ${protocol?.protocolName} (${cycleLength} noches por ciclo). ¡${streakCount} días de racha!`;
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                      title: 'Mi Rutina de Skin Cycling',
                      text: shareText,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                  }
                }}
                className="w-full bg-[#4F6D60] hover:bg-[#3D554A] text-white text-xs font-bold py-3 px-5 rounded-full shadow-beauty flex items-center justify-center gap-2 transition cursor-pointer touch-target"
              >
                <Share2 className="w-4 h-4" />
                <span>{isCopied ? '¡Enlace Copiado al Portapapeles!' : 'Compartir con Amigos / Redes'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Allabout.skin - ${protocol?.protocolName}\n` +
                    protocol?.nights.map(n => `• Noche ${n.nightNumber} (${n.category}): ${n.title}`).join('\n') +
                    `\nSeguimiento en: ${window.location.href}`
                  );
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                }}
                className="w-full bg-[#FAF8F5] hover:bg-[#EFF5F1] text-[#2B2A29] hover:text-[#4F6D60] border border-[#EFECE6] text-xs font-bold py-2.5 px-5 rounded-full flex items-center justify-center gap-2 transition cursor-pointer touch-target"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#4F6D60]" /> : <Copy className="w-3.5 h-3.5 text-[#7A9A8B]" />}
                <span>{isCopied ? '¡Resumen Copiado!' : 'Copiar Resumen de Texto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
