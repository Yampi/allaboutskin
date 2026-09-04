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
import { SkinCyclingProtocol, UserRoutineProduct } from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';

export default function MyRoutineDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [protocol, setProtocol] = useState<SkinCyclingProtocol | null>(null);
  const [products, setProducts] = useState<UserRoutineProduct[]>([]);
  const [dailyRoutine, setDailyRoutine] = useState<UserDailyRoutine | null>(null);
  const [activeTab, setActiveTab] = useState<'WEEKLY' | 'DAILY'>('WEEKLY');
  const [streakCount, setStreakCount] = useState<number>(0);
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
    if (storedProducts && storedProducts.length > 0) {
      setProducts(storedProducts);
    } else {
      setProducts([]);
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

  const currentMonthYear = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-10 animate-in fade-in">
        
        {/* Header Editorial */}
        <div className="border-b border-[#ECE6DC] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-widest block">
              Mi Rutina & Protocolo
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B1A] tracking-tight">
              Mi Calendario de Skin Cycling
            </h1>
            <p className="text-xs text-[#66615C]">
              Protocoliza tus noches, siente la diferencia...
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Streak */}
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#ECE6DC] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1C1B1A] shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-[#B89B7D]" />
              <span>{streakCount} días en racha</span>
            </div>

            {/* AI Audit Action */}
            <button
              type="button"
              onClick={handleRunAiRoutineAudit}
              disabled={isAiAuditingRoutine}
              className="inline-flex items-center gap-1.5 bg-[#2D4A3E] hover:bg-[#2A3B32] disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition active:scale-95 cursor-pointer"
            >
              {isAiAuditingRoutine ? (
                <>
                  <Activity className="w-3 h-3 animate-spin" />
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-[#A2BAAD]" />
                  <span>Auditar con IA</span>
                </>
              )}
            </button>

            <Link
              href="/rutinas/skin-cycling"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#66615C] hover:text-[#1C1B1A] bg-[#FFFFFF] px-3.5 py-1.5 rounded-full border border-[#ECE6DC] transition"
            >
              <Settings className="w-3 h-3" />
              <span>Ajustar</span>
            </Link>
          </div>
        </div>

        {/* AI ROUTINE AUDIT CARD (IF PRESENT) */}
        {aiRoutineAuditError && (
          <div className="bg-[#FDF2F0] border border-[#D97D75]/40 text-[#943C36] rounded-2xl p-4 flex items-start gap-3 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{aiRoutineAuditError}</span>
          </div>
        )}

        {aiRoutineAudit && (
          <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-7 border border-[#ECE6DC] shadow-editorial space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#4F6D60]" />
                <h3 className="font-serif font-bold text-sm text-[#1C1B1A]">
                  Diagnóstico Clínico de tu Rutina
                </h3>
              </div>
              <span className="text-xs font-bold text-[#2D4A3E] bg-[#EFF5F1] px-3 py-0.5 rounded-full">
                Seguridad {aiRoutineAudit.routineSafetyScore}%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#1C1B1A] leading-relaxed">
              {aiRoutineAudit.verdict}
            </p>

            {aiRoutineAudit.severeConflicts && aiRoutineAudit.severeConflicts.length > 0 && (
              <div className="p-3.5 bg-[#FDF2F0] border border-[#D97D75]/40 rounded-xl space-y-1 text-xs text-[#943C36]">
                <span className="font-bold">⚠️ Precauciones detectadas:</span>
                {aiRoutineAudit.severeConflicts.map((c: any, i: number) => (
                  <p key={i}>{c.productsInvolved?.join(' + ')}: {c.risk}. <em>{c.actionableFix}</em></p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7-DAY MINIMALIST EDITORIAL CALENDAR */}
        <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-7 border border-[#ECE6DC] shadow-editorial space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#1C1B1A]">
              Próximos 7 días
            </h3>
            <div className="flex items-center gap-3 text-[11px] text-[#736E67]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#B89B7D]" /> Exfoliación
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4F6D60]" /> Retinoide
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#ECE6DC]" /> Recuperación
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {next7Days.map((day, idx) => {
              const pillColor = day.category === 'EXFOLIATION' ? 'bg-[#B89B7D] text-white' :
                               day.category === 'RETINOID' ? 'bg-[#4F6D60] text-white' : 'bg-[#DCD5CA] text-[#1C1B1A]';
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 ${
                    day.isToday
                      ? 'bg-[#2D4A3E] text-white shadow-xs border-[#2D4A3E]'
                      : 'bg-[#FFFFFF] text-[#1C1B1A] border border-[#ECE6DC] shadow-sm'
                  }`}
                >
                  <span className="text-2xl font-serif font-bold leading-none">
                    {day.dayNumber}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${day.isToday ? 'text-[#A2BAAD]' : 'text-[#99938B]'}`}>
                    {day.dayName}
                  </span>
                  <div className={`px-2 py-0.5 mt-1 text-[9px] font-bold rounded-full ${pillColor}`}>
                    {day.category === 'EXFOLIATION' ? 'Exfoliación' : day.category === 'RETINOID' ? 'Retinoide' : 'Recuperación'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ESTA NOCHE / HOY (CARD PRINCIPAL DESTACADA) */}
        {currentNight && (
          <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#4F6D60]/30 shadow-editorial space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DC] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#4F6D60] uppercase tracking-wider">
                  Esta Noche · Fase {currentNight.nightNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A] flex items-center gap-2">
                  <Moon className="w-5 h-5 text-[#2D4A3E]" />
                  <span>{currentNight.title}</span>
                </h2>
                <p className="text-xs text-[#66615C]">
                  {currentNight.clinicalRationale}
                </p>
              </div>

              {/* AM & PM Quick Habit Check */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsAmDone(!isAmDone)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isAmDone
                      ? 'bg-[#EFF5F1] text-[#2D4A3E] border border-[#4F6D60]/30'
                      : 'bg-[#FAF8F5] text-[#66615C] border border-[#ECE6DC] hover:bg-[#F7F4EE]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>{isAmDone ? 'AM Completada' : 'AM Pendiente'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPmDone(!isPmDone)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    isPmDone
                      ? 'bg-[#EFF5F1] text-[#2D4A3E] border border-[#4F6D60]/30'
                      : 'bg-[#FAF8F5] text-[#66615C] border border-[#ECE6DC] hover:bg-[#F7F4EE]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isPmDone ? 'PM Completada' : 'PM Pendiente'}</span>
                </button>
              </div>
            </div>

            {/* Application Guide */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#1C1B1A] block">Indicación de aplicación:</span>
                <span className="text-[#66615C]">
                  {currentNight.category === 'EXFOLIATION' ? 'Aplica sobre piel limpia y completamente seca. Espera 15 min antes de hidratar.' :
                   currentNight.category === 'RETINOID' ? 'Aplica una cantidad del tamaño de un guisante después de tu hidratante ligera (técnica sándwich si tu piel es sensible).' :
                   'Enfócate en lípidos de barrera: ceramidas, pantenol y ácido hialurónico sobre piel húmeda.'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCT INVENTORY BY PHASE */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#1C1B1A]">
                Tus Cosméticos en Uso
              </h3>
              <p className="text-xs text-[#66615C]">
                Fórmulas registradas en tu tocador dérmico
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 bg-[#4F6D60] hover:bg-[#3D5B4E] text-white text-xs font-semibold px-4 py-2 rounded-xl transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Producto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {protocol?.nights.map((night) => {
              const phaseProducts = getProductsForPhase(night.nightNumber);
              return (
                <div
                  key={night.nightNumber}
                  className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#ECE6DC] shadow-editorial space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-2">
                    <span className="text-xs font-serif font-bold text-[#1C1B1A]">
                      Noche {night.nightNumber} · {night.title}
                    </span>
                    <span className="text-[10px] text-[#99938B] font-semibold">
                      {phaseProducts.length} {phaseProducts.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  {phaseProducts.length > 0 ? (
                    <div className="space-y-2">
                      {phaseProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#FAF8F5] p-3 rounded-xl border border-[#ECE6DC] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#1C1B1A] block truncate">{p.productName}</span>
                            <span className="text-[10px] text-[#99938B] block">{p.brand || getCategoryLabel(p.category)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-[#99938B] hover:text-[#943C36] p-1 transition cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#99938B] italic py-2">Sin productos asignados a esta noche.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      {/* MODAL: AÑADIR PRODUCTO */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1B1A]/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-editorial-elevated border border-[#ECE6DC] w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-serif font-bold text-[#1C1B1A]">
              Añadir cosmético a tu rutina
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#66615C] block mb-1">Nombre del cosmético *</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="ej: Retinol 0.3% en Escualano"
                  className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#4F6D60] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#66615C] block mb-1">Marca o Laboratorio</label>
                <input
                  type="text"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  placeholder="ej: The Ordinary"
                  className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#4F6D60] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#66615C] block mb-1">Fase / Noche de Uso</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(parseInt(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#4F6D60] focus:outline-none"
                >
                  <option value={0}>☀️ Mañanas (AM)</option>
                  <option value={1}>🌙 Noche 1: Exfoliación</option>
                  <option value={2}>🌙 Noche 2: Retinoide</option>
                  <option value={3}>🌙 Noche 3 & 4: Recuperación de Barrera</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#66615C] block mb-1">Categoría</label>
                <select
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl px-3.5 py-2 text-xs focus:bg-white focus:border-[#4F6D60] focus:outline-none"
                >
                  <option value="CLEANSER">Limpiador</option>
                  <option value="SERUM">Sérum / Activo Concentrado</option>
                  <option value="EXFOLIANT">Exfoliante Químico</option>
                  <option value="RETINOID">Retinoide</option>
                  <option value="MOISTURIZER">Crema Hidratante</option>
                  <option value="SPF">Protector Solar</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ECE6DC]">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="text-xs font-semibold text-[#66615C] px-3.5 py-1.5 rounded-full hover:bg-[#FAF8F5]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!newProductName.trim()}
                className="bg-[#4F6D60] hover:bg-[#3D5B4E] disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
