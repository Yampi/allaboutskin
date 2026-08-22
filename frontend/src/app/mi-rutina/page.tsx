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
  Tag
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
    <div className="min-h-screen flex flex-col bg-[#FAF7F4]">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Card */}
        <div className="bg-[#FFFCF9] rounded-3xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#3A7A96] bg-[#E8F4FA] px-3 py-1 rounded-full border border-[#A8D4E6] uppercase tracking-wider">
                Panel de Rutina Diaria
              </span>
              <span className="text-xs text-[#A69D94]">•</span>
              <span className="text-xs font-semibold text-[#8B8178]">
                {user ? `Cuenta de ${user.name}` : 'Modo Invitado / Almacenamiento Local'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2D2D2D] tracking-tight">
              Mi Calendario de <span className="text-[#4A8BA8]">Skin Cycling</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8B8178]">
              Protocolo activo: <strong className="text-[#3D3D3D]">{protocol?.protocolName}</strong> ({cycleLength} noches por ciclo)
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Streak Badge */}
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-amber-900 shadow-sm">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-xs font-black block leading-none">{streakCount} Días en Racha</span>
                <span className="text-[10px] text-amber-700">Cumplimiento 100%</span>
              </div>
            </div>

            {/* SOS RESCUE BUTTON */}
            <button
              type="button"
              onClick={() => setIsSosActive(!isSosActive)}
              className={`inline-flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl transition shadow-sm cursor-pointer ${
                isSosActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300'
                  : 'bg-[#F9F2F0] hover:bg-rose-50 text-rose-800 border border-rose-200'
              }`}
              title="Activa si tu piel amanece roja, sensible o con ardor para pausar activos fuertes"
            >
              <HeartPulse className={`w-4 h-4 ${isSosActive ? 'animate-pulse' : 'text-rose-600'}`} />
              <span>{isSosActive ? 'SOS Activo: Piel Irritada' : 'Botón SOS: Piel Sensible'}</span>
            </button>

            <Link
              href="/rutinas/skin-cycling"
              className="inline-flex items-center gap-1.5 bg-[#F5EDE6] hover:bg-[#E8E0D8] text-[#5A5A5A] text-xs font-bold px-4 py-2.5 rounded-2xl transition"
            >
              <Settings className="w-4 h-4 text-[#8B8178]" />
              <span>Reajustar Rutina</span>
            </Link>
          </div>
        </div>

        {/* SOS ACTIVE BANNER ALERT */}
        {isSosActive && (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-3xl flex items-start gap-3.5 shadow-sm animate-in fade-in">
            <div className="p-2 bg-rose-100 rounded-2xl text-rose-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-rose-950">
                🛡️ Modo Rescate Activado para esta Noche
              </h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                Pausamos automáticamente tus exfoliantes químicos y retinoides de hoy. Tu piel se enfocará en calmar rojeces con hidratación y ceramidas reparadoras.
              </p>
              <button
                type="button"
                onClick={() => setIsSosActive(false)}
                className="text-[11px] font-bold text-rose-900 underline mt-1 cursor-pointer block"
              >
                Volver a mi noche normal programada
              </button>
            </div>
          </div>
        )}

        {/* SECTION: TODAY'S ACTIVE NIGHT HERO */}
        {currentNight && (
          <div className={`text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors duration-300 ${
            isSosActive
              ? 'bg-gradient-to-br from-rose-900 via-rose-950 to-[#1A2332]'
              : 'bg-gradient-to-br from-[#1A4D63] via-[#1A2332] to-[#1A4D63]'
          }`}>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    isSosActive ? 'bg-rose-400 text-rose-950' : 'bg-[#7BB8D0] text-[#0F1721]'
                  }`}>
                    {isSosActive ? 'Modo Calma SOS' : `Fase de Hoy: Noche ${currentNight.nightNumber}`}
                  </span>
                  <span className="bg-white/10 text-[#C5BBB2] text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {currentNight.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#C5BBB2] leading-relaxed max-w-xl">
                  {currentNight.clinicalRationale}
                </p>

                {/* Actives Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#8EC5DB] font-bold mr-1">Ingredientes para hoy:</span>
                  {currentNight.recommendedActives.map((act, i) => (
                    <span
                      key={i}
                      className="bg-white/15 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-lg backdrop-blur-sm border border-white/10"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Daily Adherence Checklist */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8EC5DB] block">
                  Checklist del Día:
                </span>

                {/* AM Check */}
                <button
                  type="button"
                  onClick={() => setIsAmDone(!isAmDone)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition text-left border cursor-pointer ${
                    isAmDone
                      ? 'bg-[#5FA8C2]/30 border-[#7BB8D0]/50 text-white'
                      : 'bg-white/5 border-white/10 text-[#C5BBB2] hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold block">Rutina AM (Mañana)</span>
                      <span className="text-[10px] text-[#A69D94]">Limpieza suave + Crema + FPS 50+</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isAmDone ? 'text-[#8EC5DB]' : 'text-[#6B6B6B]'}`}
                  />
                </button>

                {/* PM Check */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isPmDone) setStreakCount((prev) => prev + 1);
                    setIsPmDone(!isPmDone);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition text-left border cursor-pointer ${
                    isPmDone
                      ? 'bg-[#5FA8C2]/30 border-[#7BB8D0]/50 text-white'
                      : 'bg-white/5 border-white/10 text-[#C5BBB2] hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-[#D4A99A]" />
                    <div>
                      <span className="text-xs font-bold block">Rutina PM (Noche {currentNight.nightNumber})</span>
                      <span className="text-[10px] text-[#A69D94]">{currentNight.subtitle}</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isPmDone ? 'text-[#8EC5DB]' : 'text-[#6B6B6B]'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: 7-DAY INTERACTIVE CALENDAR */}
        <section className="bg-[#FFFCF9] rounded-3xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#4A8BA8]" />
              <h3 className="text-lg font-black text-[#2D2D2D] tracking-tight">
                Calendario de Noches (Próximos 7 Días)
              </h3>
            </div>
            <span className="text-xs text-[#A69D94] font-medium">Ciclo continuo automático</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((wd, i) => {
              const isToday = i === 0;
              const isExfoliation = wd.category === 'EXFOLIATION';
              const isRetinoid = wd.category === 'RETINOID';
              const isRescue = wd.category === 'SOS_RESCUE';

              const badgeColor = isRescue
                ? 'bg-rose-100 text-rose-900 border-rose-200'
                : isExfoliation
                ? 'bg-[#C5E3F0] text-[#2D6680] border-[#A8D4E6]'
                : isRetinoid
                ? 'bg-[#F2E2DC] text-[#5A372B] border-[#E6C8BC]'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col justify-between space-y-2 relative ${
                    isToday
                      ? isRescue
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200 shadow-sm'
                        : 'bg-[#E8F4FA]/70 border-[#4A8BA8] ring-2 ring-[#5FA8C2]/20 shadow-sm'
                      : 'bg-[#FAF7F4]/80 border-[#E8E0D8] hover:bg-[#F5EDE6]'
                  }`}
                >
                  {isToday && (
                    <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                      isRescue ? 'bg-rose-600' : 'bg-[#4A8BA8]'
                    }`}>
                      Hoy
                    </span>
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-[#8B8178] uppercase block">
                      {wd.dayName}
                    </span>
                    <span className="text-base font-black text-[#2D2D2D]">
                      {wd.dateNum}
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-xl border text-[10px] font-black leading-tight ${badgeColor}`}>
                    {isRescue ? 'SOS Calma' : `Noche 0${wd.nightNumber}`}
                  </div>

                  <span className="text-[10px] text-[#6B6B6B] line-clamp-2 leading-tight">
                    {wd.title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: MY ASSIGNED PRODUCTS FOR EACH NIGHT */}
        <section className="bg-[#FFFCF9] rounded-3xl p-6 sm:p-8 border border-[#E8E0D8] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-[#2D2D2D] tracking-tight">
                Tus Productos Asignados por Fase
              </h3>
              <p className="text-xs text-[#8B8178]">
                Organiza qué producto utilizas en cada momento para no mezclar ingredientes incompatibles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#4A8BA8] hover:bg-[#3A7A96] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Producto a Rutina</span>
            </button>
          </div>

          {/* Grid of Nights + Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Daily AM Routine */}
            <div className="bg-[#FAF7F4] rounded-2xl p-4 border border-[#E8E0D8] space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E0D8] pb-2">
                <span className="text-xs font-extrabold text-amber-700 uppercase flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" /> Mañanas (AM)
                </span>
                <span className="text-[10px] text-[#A69D94]">Todos los días</span>
              </div>
              <div className="space-y-2">
                {products
                  .filter((p) => p.phaseId === 0)
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#FFFCF9] p-2.5 rounded-xl border border-[#E8E0D8] flex items-center justify-between text-xs shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#2D2D2D] block">{prod.productName}</span>
                        <div className="flex items-center gap-1.5">
                          {prod.brand && <span className="text-[10px] text-[#8B8178]">{prod.brand}</span>}
                          <span className="text-[9px] bg-[#E8F4FA] text-[#2D6680] px-1.5 py-0.2 rounded font-semibold">
                            {getCategoryLabel(prod.category)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-[#A69D94] hover:text-rose-600 p-1 transition cursor-pointer"
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
              return (
                <div key={n.nightNumber} className="bg-[#FAF7F4] rounded-2xl p-4 border border-[#E8E0D8] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E8E0D8] pb-2">
                    <span className="text-xs font-extrabold text-[#3D3D3D] uppercase flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-[#4A8BA8]" /> Noche {n.nightNumber}
                    </span>
                    <span className="text-[10px] text-[#3A7A96] font-bold">{n.category}</span>
                  </div>

                  <div className="space-y-2">
                    {nightProducts.length === 0 ? (
                      <p className="text-[11px] text-[#A69D94] italic py-2">
                        Sin productos asignados aún.
                      </p>
                    ) : (
                      nightProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-[#FFFCF9] p-2.5 rounded-xl border border-[#E8E0D8] flex items-center justify-between text-xs shadow-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#2D2D2D] block">{prod.productName}</span>
                            <div className="flex items-center gap-1.5">
                              {prod.brand && <span className="text-[10px] text-[#8B8178]">{prod.brand}</span>}
                              <span className="text-[9px] bg-[#F5EDE6] text-[#5A5A5A] px-1.5 py-0.2 rounded font-semibold">
                                {getCategoryLabel(prod.category)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-[#A69D94] hover:text-rose-600 p-1 transition cursor-pointer"
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

        {/* INTEGRATED DERMATOLOGICAL RECOMMENDATION BANNER */}
        <div className="bg-gradient-to-r from-[#1A4D63] to-[#2D6680] text-white rounded-3xl p-6 sm:p-7 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[11px] font-bold text-[#8EC5DB] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
              <ShieldCheck className="w-4 h-4" /> Recomendación de Cuidado Diario
            </span>
            <h4 className="text-base sm:text-lg font-bold">
              ¿Vas a incorporar un nuevo ácido o retinoide a tu piel?
            </h4>
            <p className="text-xs text-[#C5BBB2] max-w-xl">
              Recuerda siempre realizar una prueba de parche en el antebrazo 24 horas antes para descartar alergias.
            </p>
          </div>
          <Link
            href="/"
            className="bg-white text-[#1A4D63] hover:bg-[#E8F4FA] text-xs font-black px-5 py-3 rounded-xl transition shadow-sm flex-shrink-0"
          >
            Auditar un producto nuevo →
          </Link>
        </div>
      </main>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1721]/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FFFCF9] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-[#2D2D2D]">
              Agregar Producto a tu Rutina
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                  Nombre del Producto / Crema
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sérum de Niacinamida 10%"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl focus:outline-none focus:border-[#5FA8C2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                  Marca (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: The Ordinary / La Roche-Posay"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl focus:outline-none focus:border-[#5FA8C2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                  Categoría del Producto
                </label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as UserRoutineProduct['category'])}
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl focus:outline-none focus:border-[#5FA8C2] font-semibold"
                >
                  <option value="CLEANSER">🧴 Limpiador Facial</option>
                  <option value="TONER">💧 Tónico / Bruma Hidratante</option>
                  <option value="SERUM">✨ Suero Concentrado</option>
                  <option value="EXFOLIANT">🧪 Exfoliante Químico (AHA / BHA)</option>
                  <option value="RETINOID">🌙 Retinoide / Retinol</option>
                  <option value="MOISTURIZER">🌿 Crema Hidratante</option>
                  <option value="SPF">☀️ Protector Solar FPS 50+</option>
                  <option value="SOS_TREATMENT">🛡️ Bálsamo Calmante / Cica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                  ¿Cuándo lo vas a aplicar?
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl focus:outline-none focus:border-[#5FA8C2] font-semibold"
                >
                  <option value={0}>☀️ Mañana (Rutina AM diaria)</option>
                  {protocol?.nights.map((n) => (
                    <option key={n.nightNumber} value={n.nightNumber}>
                      🌙 Noche {n.nightNumber}: {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#8B8178] hover:bg-[#F5EDE6] rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-[#4A8BA8] hover:bg-[#3A7A96] text-white rounded-xl shadow-md shadow-[#4A8BA8]/20 cursor-pointer"
                >
                  Guardar en Mi Rutina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
