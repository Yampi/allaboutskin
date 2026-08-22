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
  Settings,
  Share2,
  Copy,
  Check,
  Layers,
  AlertTriangle,
  Activity,
  Bot,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getCurrentUser,
  getSavedCustomProtocol,
  getStoredRoutineProducts,
  setStoredRoutineProducts,
  getSavedDailyRoutine,
  saveDailyRoutine,
  StoredUser,
  UserDailyRoutine,
  auditFullRoutineAi
} from '@/lib/api';
import { SkinCyclingProtocol, UserRoutineProduct, ProtocolNight } from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';

export default function MyRoutineDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [protocol, setProtocol] = useState<SkinCyclingProtocol | null>(null);
  const [products, setProducts] = useState<UserRoutineProduct[]>([]);
  const [dailyRoutine, setDailyRoutine] = useState<UserDailyRoutine | null>(null);
  const [activeTab, setActiveTab] = useState<'WEEKLY' | 'DAILY'>('WEEKLY');
  const [streakCount, setStreakCount] = useState<number>(5);
  const [isAmDone, setIsAmDone] = useState<boolean>(false);
  const [isPmDone, setIsPmDone] = useState<boolean>(false);

  // AI Routine Audit State
  const [aiRoutineAudit, setAiRoutineAudit] = useState<any | null>(null);
  const [isAiAuditingRoutine, setIsAiAuditingRoutine] = useState(false);
  const [aiRoutineAuditError, setAiRoutineAuditError] = useState<string | null>(null);

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
          category: 'MOISTURIZER',
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

    const savedDaily = getSavedDailyRoutine();
    if (savedDaily) {
      setDailyRoutine(savedDaily);
      if (savedDaily.isDailyFixed) {
        setActiveTab('DAILY');
      }
    }
  }, []);

  const cycleLength = protocol?.cycleLength || 4;

  // Calculate current night based on calendar day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const currentNightIndex = (dayOfYear % cycleLength) + 1;
  const currentNight = protocol?.nights.find((n) => n.nightNumber === currentNightIndex) || protocol?.nights[0];

  const handleAddProduct = () => {
    if (!newProductName.trim()) return;

    const newProd: UserRoutineProduct = {
      id: Date.now().toString(),
      phaseId: selectedPhase,
      productName: newProductName.trim(),
      brand: newProductBrand.trim() || undefined,
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

  const getProductsForPhase = (phaseId: number) => {
    return products.filter((p) => p.phaseId === phaseId);
  };

  // Next 7 days calendar mapping
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    const futureDayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const dayNightIndex = (futureDayOfYear % cycleLength) + 1;
    const nightObj = protocol?.nights.find((n) => n.nightNumber === dayNightIndex);

    return {
      date,
      dayName: i === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'short' }),
      dayNumber: date.getDate(),
      nightNumber: dayNightIndex,
      category: nightObj?.category || 'RECOVERY',
      title: nightObj?.title || `Noche ${dayNightIndex}`,
      subtitle: nightObj?.subtitle || '',
      badgeColor: nightObj?.badgeColor || 'emerald',
      isToday: i === 0,
    };
  });

  const getCategoryLabel = (cat: UserRoutineProduct['category']) => {
    switch (cat) {
      case 'CLEANSER': return 'Limpiador';
      case 'TONER': return 'Tónico / Bruma';
      case 'SERUM': return 'Suero';
      case 'EXFOLIANT': return 'Exfoliante';
      case 'RETINOID': return 'Retinoide';
      case 'MOISTURIZER': return 'Hidratante';
      case 'SPF': return 'Protector Solar';
      default: return 'Producto';
    }
  };

  const handleRunAiRoutineAudit = async () => {
    if (products.length === 0) {
      setAiRoutineAuditError('Añade al menos un producto a tu rutina para poder auditarla.');
      return;
    }

    setIsAiAuditingRoutine(true);
    setAiRoutineAuditError(null);

    try {
      const routinePayload = products.map((p) => ({
        name: p.productName,
        brand: p.brand,
        category: p.category,
      }));

      const audit = await auditFullRoutineAi(routinePayload, dailyRoutine?.skinType || 'COMBINATION');
      setAiRoutineAudit(audit);
    } catch (err: any) {
      setAiRoutineAuditError(err?.message || 'Error al conectar con la IA de Gemini.');
    } finally {
      setIsAiAuditingRoutine(false);
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
                Módulo de Rutina & Seguimiento
              </span>
              <span className="text-xs text-[#9C9790]">•</span>
              <span className="text-xs font-medium text-[#6E6A66]">
                {user ? `Cuenta de ${user.name}` : 'Almacenamiento Local Sincronizado'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2A29] tracking-tight">
              Mi Rutina de <span className="text-[#7A9A8B]">Skincare Inteligente</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A66]">
              Protocolo activo: <strong className="text-[#2B2A29] font-serif">{protocol?.protocolName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Streak Badge */}
            <div className="flex items-center gap-2.5 bg-[#FAF8F5] border border-[#EFECE6] px-4 py-2.5 rounded-full text-[#2B2A29] shadow-xs">
              <Flame className="w-4 h-4 text-[#C4A482] fill-[#C4A482]" />
              <div>
                <span className="text-xs font-bold block leading-none">{streakCount} Días en Racha</span>
                <span className="text-[10px] text-[#6E6A66]">Constancia Dérmica</span>
              </div>
            </div>

            {/* AI AUDIT BUTTON */}
            <button
              type="button"
              onClick={handleRunAiRoutineAudit}
              disabled={isAiAuditingRoutine}
              className="inline-flex items-center gap-1.5 bg-[#4F6D60] hover:bg-[#3D554A] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all duration-200 cursor-pointer touch-target shadow-xs active:scale-95"
            >
              {isAiAuditingRoutine ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditando con Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#A3B899]" />
                  <span>Auditar Rutina con IA</span>
                </>
              )}
            </button>

            {/* SHARE ROUTINE CARD BUTTON */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#EFF5F1] hover:bg-[#E2ECE5] text-[#4F6D60] text-xs font-bold px-4 py-2.5 rounded-full border border-[#7A9A8B]/30 transition-all duration-200 cursor-pointer touch-target shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-[#7A9A8B]" />
              <span>Compartir Tarjeta</span>
            </button>

            <Link
              href="/rutinas/skin-cycling"
              className="inline-flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#6E6A66] text-xs font-bold px-4 py-2.5 rounded-full border border-[#EFECE6] transition-all duration-200 touch-target"
            >
              <Settings className="w-3.5 h-3.5 text-[#7A9A8B]" />
              <span>Reajustar Diagnóstico</span>
            </Link>
          </div>
        </div>

        {/* AI ROUTINE AUDIT CARD */}
        {aiRoutineAuditError && (
          <div className="bg-[#F8EFEA] border border-[#E8D5D0] text-[#A46864] rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-in fade-in">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs font-medium">
              <span className="font-bold">Error en auditoría: </span>{aiRoutineAuditError}
            </div>
          </div>
        )}

        {aiRoutineAudit && (
          <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#7A9A8B]/30 shadow-beauty space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#7A9A8B]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2B2A29] flex items-center gap-2">
                    Auditoría Integral de Rutina
                    <span className="text-[10px] font-sans font-bold bg-[#EFF5F1] text-[#4F6D60] px-2.5 py-0.5 rounded-full border border-[#7A9A8B]/30">
                      Google Gemini AI
                    </span>
                  </h3>
                  <p className="text-xs text-[#6E6A66]">
                    Detección de colisiones químicas, sobre-exfoliación y pilares ausentes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#FAF8F5] px-4 py-2 rounded-2xl border border-[#EFECE6]">
                <span className="text-xs font-bold text-[#9C9790]">Seguridad General:</span>
                <span className="text-base font-bold text-[#4F6D60]">{aiRoutineAudit.routineSafetyScore}%</span>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFECE6] space-y-2">
              <h4 className="font-bold text-sm text-[#2B2A29] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#7A9A8B]" />
                Diagnóstico del Experto
              </h4>
              <p className="text-xs sm:text-sm text-[#4F4B47] leading-relaxed">
                {aiRoutineAudit.verdict}
              </p>
              {aiRoutineAudit.dermatologistSummary && (
                <p className="text-xs text-[#6E6A66] italic pt-1 border-t border-[#EFECE6]/80">
                  &ldquo;{aiRoutineAudit.dermatologistSummary}&rdquo;
                </p>
              )}
            </div>

            {/* Severe Conflicts or Safe Badge */}
            {aiRoutineAudit.severeConflicts && aiRoutineAudit.severeConflicts.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A46864] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#A46864]" />
                  Conflictos Químicos Críticos Detectados:
                </span>
                <div className="space-y-2">
                  {aiRoutineAudit.severeConflicts.map((c: any, i: number) => (
                    <div key={i} className="p-4 bg-[#F8EFEA] border border-[#E8D5D0] rounded-2xl text-xs space-y-1 text-[#A46864]">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>⚠️ {c.productsInvolved?.join(' + ')} ({c.activesInvolved?.join(', ')})</span>
                      </div>
                      <p className="text-[#2B2A29]">{c.risk}</p>
                      <p className="text-[#4F6D60] font-semibold">💡 Solución sugerida: {c.actionableFix}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#EFF5F1] border border-[#7A9A8B]/30 rounded-2xl text-xs text-[#4F6D60] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>No se detectaron incompatibilidades químicas graves entre tus productos.</span>
              </div>
            )}

            {/* Missing Pillars */}
            {aiRoutineAudit.missingPillars && aiRoutineAudit.missingPillars.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1.5">
                <span className="font-bold block">📌 Elementos o pilares recomendados para incorporar:</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiRoutineAudit.missingPillars.map((pillar: string, i: number) => (
                    <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                      + {pillar}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optimized AM/PM Schedule */}
            {aiRoutineAudit.recommendedSchedule && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F6D60] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-[#C4A482]" />
                    Orden Óptimo Mañana (AM)
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-[#2B2A29]">
                    {aiRoutineAudit.recommendedSchedule.amRoutine?.map((step: string, i: number) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F6D60] flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-[#7A9A8B]" />
                    Distribución Nocturna (PM / Skin Cycling)
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#2B2A29]">
                    {aiRoutineAudit.recommendedSchedule.pmRoutine?.night1Exfoliation && (
                      <li><strong className="text-[#4F6D60]">Noche 1 (Exfoliación):</strong> {aiRoutineAudit.recommendedSchedule.pmRoutine.night1Exfoliation.join(' ➔ ')}</li>
                    )}
                    {aiRoutineAudit.recommendedSchedule.pmRoutine?.night2Retinoid && (
                      <li><strong className="text-[#4F6D60]">Noche 2 (Retinoide):</strong> {aiRoutineAudit.recommendedSchedule.pmRoutine.night2Retinoid.join(' ➔ ')}</li>
                    )}
                    {aiRoutineAudit.recommendedSchedule.pmRoutine?.night3Recovery && (
                      <li><strong className="text-[#4F6D60]">Noche 3 y 4 (Recuperación):</strong> {aiRoutineAudit.recommendedSchedule.pmRoutine.night3Recovery.join(' ➔ ')}</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTROLS: RUTINA SEMANAL (SKIN CYCLING) VS RUTINA DIARIA FIJA */}
        <div className="bg-[#FFFFFF] p-1.5 rounded-full border border-[#EFECE6] shadow-beauty flex items-center justify-center gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('WEEKLY')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              activeTab === 'WEEKLY'
                ? 'bg-[#7A9A8B] text-white shadow-xs'
                : 'text-[#6E6A66] hover:bg-[#FAF8F5]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Rutina Semanal / Skin Cycling</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DAILY')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
              activeTab === 'DAILY'
                ? 'bg-[#7A9A8B] text-white shadow-xs'
                : 'text-[#6E6A66] hover:bg-[#FAF8F5]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Rutina Diaria Fija</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW A: RUTINA SEMANAL / SKIN CYCLING                    */}
        {/* ======================================================== */}
        {activeTab === 'WEEKLY' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* TODAY'S ACTIVE NIGHT HERO */}
            {currentNight && (
              <div className="bg-gradient-to-br from-[#4F6D60] via-[#5A796B] to-[#3D554A] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-beauty relative overflow-hidden transition-all duration-300">
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Fase de Hoy: Noche {currentNight.nightNumber}
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

                  {/* Daily Habit Checklist AM & PM */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8D5D0] block">
                      Registro de Hoy
                    </span>

                    <button
                      type="button"
                      onClick={() => setIsAmDone(!isAmDone)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                        isAmDone
                          ? 'bg-[#EFF5F1] text-[#4F6D60] border-white'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Sun className={`w-4 h-4 ${isAmDone ? 'text-[#7A9A8B]' : 'text-[#C4A482]'}`} />
                        <span>Rutina Matutina (AM)</span>
                      </div>
                      {isAmDone ? <CheckCircle2 className="w-4 h-4 text-[#7A9A8B]" /> : <span className="text-[10px] opacity-70">Pendiente</span>}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPmDone(!isPmDone)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition cursor-pointer ${
                        isPmDone
                          ? 'bg-[#EFF5F1] text-[#4F6D60] border-white'
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Moon className={`w-4 h-4 ${isPmDone ? 'text-[#7A9A8B]' : 'text-[#A46864]'}`} />
                        <span>Rutina Nocturna (PM)</span>
                      </div>
                      {isPmDone ? <CheckCircle2 className="w-4 h-4 text-[#7A9A8B]" /> : <span className="text-[10px] opacity-70">Pendiente</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7-DAY INTERACTIVE HORIZONTAL CALENDAR */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                    Cronograma de Renovación
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B2A29]">
                    Calendario de los Próximos 7 Días
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {next7Days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                      day.isToday
                        ? 'bg-[#EFF5F1] border-[#7A9A8B] ring-2 ring-[#7A9A8B]/30'
                        : 'bg-[#FAF8F5] border-[#EFECE6]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase ${day.isToday ? 'text-[#4F6D60]' : 'text-[#9C9790]'}`}>
                          {day.dayName}
                        </span>
                        <span className="text-xs font-bold text-[#2B2A29]">{day.dayNumber}</span>
                      </div>
                      <span className="text-xs font-bold text-[#2B2A29] block line-clamp-1">
                        Noche {day.nightNumber}
                      </span>
                      <span className="text-[10px] text-[#6E6A66] block line-clamp-1 mt-0.5">
                        {day.subtitle}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#EFECE6]">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-white border border-[#EFECE6] text-[#6E6A66] inline-block">
                        {day.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROTOCOL NIGHTS BREAKDOWN & PRODUCTS */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                    Productos Asignados
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#2B2A29]">
                    Fórmulas Asignadas por Noche
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#7A9A8B] hover:bg-[#688879] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Cosmético</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {protocol?.nights.map((night) => {
                  const phaseProducts = getProductsForPhase(night.nightNumber);
                  return (
                    <div
                      key={night.nightNumber}
                      className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EFECE6] space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-[#EFECE6] text-[#4F6D60]">
                            Noche {night.nightNumber} • {night.category}
                          </span>
                        </div>
                        <h4 className="text-base font-serif font-bold text-[#2B2A29]">{night.title}</h4>
                        <p className="text-xs text-[#6E6A66] leading-relaxed">{night.clinicalRationale}</p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
                        <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-wider block">
                          Tus Cosméticos para esta noche ({phaseProducts.length}):
                        </span>

                        {phaseProducts.length > 0 ? (
                          <div className="space-y-1.5">
                            {phaseProducts.map((p) => (
                              <div
                                key={p.id}
                                className="bg-white p-2.5 rounded-xl border border-[#EFECE6] flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-[#2B2A29] block truncate">{p.productName}</span>
                                  <span className="text-[10px] text-[#9C9790] block">{p.brand || getCategoryLabel(p.category)}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="text-[#9C9790] hover:text-[#A46864] p-1 transition"
                                  title="Eliminar producto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#9C9790] italic">No tienes productos asignados a esta fase.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW B: RUTINA DIARIA FIJA                               */}
        {/* ======================================================== */}
        {activeTab === 'DAILY' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
              <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                    Protocolo Diario Estándar
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#2B2A29]">
                    Mi Rutina Diaria Fija
                  </h3>
                  <p className="text-xs text-[#6E6A66] mt-0.5">
                    Pasos secuenciales para la mañana y la noche sin alternancia de días.
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 bg-[#EFF5F1] hover:bg-[#E2ECE5] text-[#4F6D60] text-xs font-bold px-4 py-2 rounded-full border border-[#7A9A8B]/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Evaluar y añadir producto</span>
                </Link>
              </div>

              {dailyRoutine && dailyRoutine.steps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {dailyRoutine.steps.map((s) => (
                    <div
                      key={s.stepNumber}
                      className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EFECE6] flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#7A9A8B] uppercase tracking-wider">
                            Paso {s.stepNumber}
                          </span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#EFECE6] text-[#6E6A66]">
                            {s.timing === 'AM' ? '☀️ Mañana' : s.timing === 'PM' ? '🌙 Noche' : '☀️/🌙 AM y PM'}
                          </span>
                        </div>
                        <h4 className="text-sm font-serif font-bold text-[#2B2A29]">{s.stepName}</h4>
                        <p className="text-xs text-[#4F6D60] font-semibold mt-1">{s.productName}</p>
                      </div>
                      <span className="text-[10px] text-[#9C9790]">{s.brand || 'Cosmético sugerido'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-3 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6]">
                  <Sparkles className="w-8 h-8 text-[#7A9A8B] mx-auto" />
                  <h4 className="text-sm font-bold text-[#2B2A29]">No has configurado tu rutina diaria aún</h4>
                  <p className="text-xs text-[#6E6A66] max-w-sm mx-auto">
                    Audita tus cosméticos en la página de inicio y pulsa &quot;Guardar como rutina diaria fija&quot;.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 bg-[#4F6D60] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-beauty"
                  >
                    <span>Ir a Evaluar Cosmético</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* MODAL: AÑADIR PRODUCTO A FASE */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B2A29]/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#EFECE6] w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#2B2A29]">
              Añadir Producto a mi Rutina
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#6E6A66] block mb-1">Nombre del producto *</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="ej: Niacinamida 10% + Zinc 1%"
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#7A9A8B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#6E6A66] block mb-1">Marca (Opcional)</label>
                <input
                  type="text"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  placeholder="ej: The Ordinary"
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#7A9A8B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#6E6A66] block mb-1">Fase del Skin Cycling</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(parseInt(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#7A9A8B] focus:outline-none"
                >
                  <option value={0}>☀️ Rutina de Mañanas (AM)</option>
                  <option value={1}>🌙 Noche 1: Exfoliación Química</option>
                  <option value={2}>🌙 Noche 2: Retinoide</option>
                  <option value={3}>🌙 Noche 3 & 4: Recuperación de Barrera</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#6E6A66] block mb-1">Categoría</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#7A9A8B] focus:outline-none"
                >
                  <option value="CLEANSER">Limpiador</option>
                  <option value="TONER">Tónico / Bruma</option>
                  <option value="SERUM">Sérum / Activo Concentrado</option>
                  <option value="EXFOLIANT">Exfoliante Químico</option>
                  <option value="RETINOID">Retinoide / Retinal</option>
                  <option value="MOISTURIZER">Crema Hidratante</option>
                  <option value="SPF">Protector Solar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EFECE6]">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-xs font-semibold text-[#6E6A66] px-4 py-2 rounded-full hover:bg-[#FAF8F5]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!newProductName.trim()}
                className="bg-[#7A9A8B] hover:bg-[#688879] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
