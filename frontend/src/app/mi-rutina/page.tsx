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
import { SkinCyclingProtocol, UserRoutineProduct } from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';

export default function MyRoutineDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [protocol, setProtocol] = useState<SkinCyclingProtocol | null>(null);
  const [products, setProducts] = useState<UserRoutineProduct[]>([]);
  const [streakCount, setStreakCount] = useState<number>(4);
  const [isAmDone, setIsAmDone] = useState<boolean>(false);
  const [isPmDone, setIsPmDone] = useState<boolean>(false);

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
      // Sample starter products
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
  }, []);

  const cycleLength = protocol?.cycleLength || 4;

  // Calculate current night based on calendar day
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const currentNightIndex = (dayOfYear % cycleLength) + 1;
  const currentNight = protocol?.nights.find((n) => n.nightNumber === currentNightIndex) || protocol?.nights[0];

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
      category: nightObj?.category || 'RECOVERY',
      title: nightObj?.title || `Noche ${dayNightIndex}`,
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 uppercase tracking-wider">
                Panel Personal de Ciclado Cutáneo
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {user ? `Cuenta de ${user.name}` : 'Modo Invitado / Local'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mi Calendario de <span className="text-teal-600">Skin Cycling</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Protocolo activo: <strong className="text-slate-800">{protocol?.protocolName}</strong> ({cycleLength} noches por ciclo)
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

            <Link
              href="/rutinas/skin-cycling"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-2xl transition"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Reajustar Protocolo</span>
            </Link>
          </div>
        </div>

        {/* SECTION: TODAY'S ACTIVE NIGHT HERO */}
        {currentNight && (
          <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Fase de Hoy: Noche {currentNight.nightNumber}
                  </span>
                  <span className="bg-white/10 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                    {today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {currentNight.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {currentNight.clinicalRationale}
                </p>

                {/* Actives Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-teal-300 font-bold mr-1">Activos para hoy:</span>
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
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 block">
                  Checklist del Día:
                </span>

                {/* AM Check */}
                <button
                  type="button"
                  onClick={() => setIsAmDone(!isAmDone)}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition text-left border ${
                    isAmDone
                      ? 'bg-teal-500/30 border-teal-400/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold block">Rutina AM (Mañana)</span>
                      <span className="text-[10px] text-slate-400">Limpieza + Antioxidante + FPS 50+</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isAmDone ? 'text-teal-300' : 'text-slate-600'}`}
                  />
                </button>

                {/* PM Check */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isPmDone) setStreakCount((prev) => prev + 1);
                    setIsPmDone(!isPmDone);
                  }}
                  className={`w-full p-3 rounded-xl flex items-center justify-between transition text-left border ${
                    isPmDone
                      ? 'bg-teal-500/30 border-teal-400/50 text-white'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Moon className="w-4 h-4 text-indigo-300" />
                    <div>
                      <span className="text-xs font-bold block">Rutina PM (Noche {currentNight.nightNumber})</span>
                      <span className="text-[10px] text-slate-400">{currentNight.subtitle}</span>
                    </div>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 transition ${isPmDone ? 'text-teal-300' : 'text-slate-600'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: 7-DAY INTERACTIVE CALENDAR */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Calendario de Ciclado (Próximos 7 Días)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ciclo continuo recurrente</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map((wd, i) => {
              const isToday = i === 0;
              const isExfoliation = wd.category === 'EXFOLIATION';
              const isRetinoid = wd.category === 'RETINOID';
              const badgeColor = isExfoliation
                ? 'bg-teal-100 text-teal-800 border-teal-200'
                : isRetinoid
                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border text-center transition flex flex-col justify-between space-y-2 relative ${
                    isToday
                      ? 'bg-teal-50/70 border-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                      : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isToday && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      Hoy
                    </span>
                  )}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">
                      {wd.dayName}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {wd.dateNum}
                    </span>
                  </div>

                  <div className={`p-1.5 rounded-xl border text-[10px] font-black leading-tight ${badgeColor}`}>
                    Noche 0{wd.nightNumber}
                  </div>

                  <span className="text-[10px] text-slate-600 line-clamp-2 leading-tight">
                    {wd.title}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION: MY ASSIGNED PRODUCTS FOR EACH NIGHT */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Mis Productos Asignados por Fase
              </h3>
              <p className="text-xs text-slate-500">
                Organiza qué producto utilizas en cada noche de tu protocolo para evitar mezclas incompatibles.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Asignar Nuevo Producto</span>
            </button>
          </div>

          {/* Grid of Nights + Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Daily AM Routine */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-extrabold text-amber-700 uppercase flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" /> Rutina AM Diaria
                </span>
                <span className="text-[10px] text-slate-400">Todos los días</span>
              </div>
              <div className="space-y-2">
                {products
                  .filter((p) => p.phaseId === 0)
                  .map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{prod.productName}</span>
                        {prod.brand && <span className="text-[10px] text-slate-500">{prod.brand}</span>}
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
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
                <div key={n.nightNumber} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-teal-600" /> Noche {n.nightNumber}
                    </span>
                    <span className="text-[10px] text-teal-700 font-bold">{n.category}</span>
                  </div>

                  <div className="space-y-2">
                    {nightProducts.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        Sin productos asignados aún.
                      </p>
                    ) : (
                      nightProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.productName}</span>
                            {prod.brand && <span className="text-[10px] text-slate-500">{prod.brand}</span>}
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition"
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

        {/* SPONSORED MONETIZATION / AD BANNER SLOT */}
        <AdBanner
          slotType="BANNER_DISPLAY"
          sponsorName="Red de Marcas Dermatológicas"
          title="Espacio Publicitario Disponible / Google Ads & Patrocinios"
          description="Espacio reservado para promocionar marcas nacionales de skincare, farmacias asociadas o anuncios programáticos relevantes para los usuarios."
          ctaText="Contactar para Publicidad o Ver Productos"
          ctaLink="/"
        />
      </main>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Asignar Producto a tu Rutina
            </h3>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Salicylic Acid 2% Solution"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Marca (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: The Ordinary"
                  value={newProductBrand}
                  onChange={(e) => setNewProductBrand(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fase o Noche a la que Pertenece
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-semibold"
                >
                  <option value={0}>☀️ Rutina AM (Todos los días)</option>
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
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/20"
                >
                  Guardar Producto
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
