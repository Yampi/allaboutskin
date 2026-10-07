'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  HeartPulse,
  Calendar,
  Package,
  Scan,
  Store,
  User,
  Search,
  Bell,
  Sparkles,
  Flame,
  Check,
  ChevronRight,
  ArrowRight,
  MapPin,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Layers,
  CheckCircle2,
  Sliders,
  Flower2,
  Menu,
  X
} from 'lucide-react';
import { getCurrentUser, StoredUser, fetchUserProfile, fetchPublicStores, logUserRoutineAdherence } from '@/lib/api';

export default function UserSkinDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<'AM' | 'PM'>('AM');
  const [activeSidebarNav, setActiveSidebarNav] = useState('inicio');
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [vanityProducts, setVanityProducts] = useState<any[]>([]);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);

  // Routine Checklist State
  const [routineItems, setRoutineItems] = useState([
    { id: '1', name: 'Limpiador suave equilibrante', done: true, period: 'AM' },
    { id: '2', name: 'Sérum hidratante o antioxidante', done: false, period: 'AM' },
    { id: '3', name: 'Hidratante fisiológica de barrera', done: false, period: 'AM' },
    { id: '4', name: 'Protector solar de amplio espectro SPF 50', done: false, period: 'AM' },
    { id: '5', name: 'Limpieza nocturna suave', done: false, period: 'PM' },
    { id: '6', name: 'Tratamiento activo según ciclo', done: false, period: 'PM' },
    { id: '7', name: 'Bálsamo o emulsión reparadora', done: false, period: 'PM' },
  ]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Cargar perfil real de la base de datos
    fetchUserProfile()
      .then((res) => {
        if (res?.data) {
          setUserProfile(res.data);
        }
      })
      .catch(() => {});

    // Cargar productos reales del tocador
    try {
      const saved = localStorage.getItem('allaboutskin_vanity_items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVanityProducts(parsed);
          // Adaptar items de rutina a los productos reales
          const amSteps = parsed.filter((p: any) => p.phase === 0 || !p.phase);
          const pmSteps = parsed.filter((p: any) => p.phase && p.phase > 0);
          if (amSteps.length > 0 || pmSteps.length > 0) {
            const dynamicList: Array<{ id: string; name: string; done: boolean; period: 'AM' | 'PM' }> = [];
            amSteps.forEach((p: any, idx: number) => {
              dynamicList.push({ id: `am-${idx}`, name: p.name || 'Producto AM', done: false, period: 'AM' });
            });
            pmSteps.forEach((p: any, idx: number) => {
              dynamicList.push({ id: `pm-${idx}`, name: p.name || 'Producto PM', done: false, period: 'PM' });
            });
            if (dynamicList.length > 0) {
              setRoutineItems(dynamicList);
            }
          }
        }
      }
    } catch (e) {
      console.debug('Error al leer productos del tocador:', e);
    }

    // Cargar tiendas reales de la base de datos
    fetchPublicStores()
      .then((res) => {
        if (res?.stores && Array.isArray(res.stores)) {
          setNearbyStores(res.stores.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const toggleCheck = (id: string) => {
    setRoutineItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
      const completedSteps = next.filter((i) => i.done).map((i) => i.name);
      if (currentUser?.token) {
        logUserRoutineAdherence({
          slot: activeTab,
          notes: `Pasos completados: ${completedSteps.join(', ')}`,
        }).catch(() => {});
      }
      return next;
    });
  };

  const userName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Usuario');
  const isPremium = currentUser?.role === 'premium_user' || true;

  const currentRoutineSteps = routineItems.filter((i) => i.period === activeTab);

  // Dynamic Skin Profile & Gauge calculations
  const skinTypeLabel = userProfile?.skin_type === 'COMBINATION' ? 'Mixta'
    : userProfile?.skin_type === 'OILY' ? 'Grasa'
    : userProfile?.skin_type === 'DRY' ? 'Seca'
    : userProfile?.skin_type === 'SENSITIVE' ? 'Sensible'
    : userProfile?.skin_type === 'NORMAL' ? 'Normal / Equilibrada'
    : 'No calibrado';

  const fitzpatrickLabel = userProfile?.fitzpatrick_scale
    ? `Fototipo ${userProfile.fitzpatrick_scale}`
    : 'Pendiente';

  const concernsLabel = Array.isArray(userProfile?.concerns) && userProfile.concerns.length > 0
    ? userProfile.concerns.slice(0, 2).join(' + ')
    : 'Mantenimiento barrera';

  const score = userProfile?.barrier_status === 'DAMAGED' ? 45
    : userProfile?.barrier_status === 'SENSITIVE' ? 65
    : userProfile?.skin_type ? 82
    : 78;

  const barrierStatusText = score >= 80 ? 'Óptima' : score >= 60 ? 'Buena' : 'Comprometida';
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, href: '/dashboard/usuario' },
    { id: 'mi-piel', label: 'Mi piel', icon: HeartPulse, href: '/mi-rutina' },
    { id: 'mi-rutina', label: 'Mi rutina', icon: Calendar, href: '/calendario' },
    { id: 'productos', label: 'Productos', icon: Package, href: '/biblioteca' },
    { id: 'analisis', label: 'Análisis y escaneos', icon: Scan, href: '/escaner' },
    { id: 'tiendas', label: 'Tiendas cercanas', icon: Store, href: '/tiendas' },
    { id: 'perfil', label: 'Perfil', icon: User, href: '/mi-rutina' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#2D2825] flex flex-col lg:flex-row antialiased selection:bg-[#E6F4EC] selection:text-[#2E7D5B] font-sans pb-16 lg:pb-0">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP (Verde Clínico DLG-HYBRID)              */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E8E1D7] sticky top-0 h-screen justify-between p-5 shrink-0 z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 px-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-2xs group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
            </div>
            <div className="font-extrabold text-lg text-[#2D2825] tracking-tight">
              allabout<span className="text-[#2E7D5B]">.skin</span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveSidebarNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB] shadow-2xs font-bold'
                      : 'text-[#66615C] hover:text-[#2E7D5B] hover:bg-[#F2F7F4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2E7D5B]' : 'text-[#8C827A]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Brand Philosophy Badge (Mockup Footer Card) */}
        <div className="p-4 rounded-2xl bg-[#F4F8F5] border border-[#D5E2DB] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#1B3D32] leading-snug">
              Tu piel, <span className="text-[#2E7D5B] font-extrabold">con ciencia.</span>
            </p>
            <p className="text-[10px] text-[#66615C] font-medium">
              No con marketing.
            </p>
          </div>
          <Flower2 className="w-5 h-5 text-[#2E7D5B] shrink-0" />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. HEADER MOBILE (Visible solo en dispositivos móviles)   */}
      {/* ========================================================= */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#E8E1D7] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-base text-[#2D2825] tracking-tight">
            allabout<span className="text-[#2E7D5B]">.skin</span>
          </span>
        </Link>
        <Link
          href="/mi-rutina"
          className="w-7 h-7 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-xs flex items-center justify-center border border-[#D5E2DB]"
        >
          {userName.charAt(0)}
        </Link>
      </header>

      {/* ========================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT AREA (Vista 1 Mockup)           */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOPBAR: Search bar & User Profile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar productos, ingredientes, etc."
              className="w-full bg-white border border-[#E8E1D7] rounded-full pl-9 pr-4 py-2 text-xs text-[#2D2825] placeholder:text-[#8C827A] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B] transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2E7D5B] transition shadow-2xs relative cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {/* Profile Avatar Card */}
            <Link
              href="/mi-rutina"
              className="flex items-center gap-2.5 bg-white border border-[#E8E1D7] rounded-full py-1 pl-1 pr-3.5 shadow-2xs hover:border-[#2E7D5B] transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-xs flex items-center justify-center overflow-hidden border border-[#D5E2DB]">
                {userName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#2D2825] leading-tight">
                  {userName}
                </div>
                <div className="text-[10px] text-[#2E7D5B] font-semibold leading-none">
                  {isPremium ? 'Premium' : 'Estándar'}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* HERO / GREETING BANNER */}
        <div className="bg-gradient-to-r from-[#EAF4EE] via-[#F4F9F6] to-white rounded-3xl border border-[#D5E2DB] p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs overflow-hidden relative">
          <div className="space-y-1.5 z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Hola, {userName.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#66615C] max-w-lg leading-relaxed">
              Tu piel es única. Aquí tienes un resumen de tu estado actual y lo que necesitas hoy.
            </p>
          </div>

          {/* Skincare Editorial Avatar / Visual */}
          <div className="relative shrink-0 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md shadow-[#2E7D5B]/10 bg-[#E6F4EC] flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                alt="Piel saludable"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white px-2 py-0.5 rounded-full border border-[#D5E2DB] text-[10px] font-bold text-[#2E7D5B] shadow-2xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#2E7D5B]" />
              <span>Calibrado</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: WIDGETS PRINCIPALES (3 COLUMNAS MOCKUP)            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* WIDGET 1: ESTADO DE TU PIEL (WOW MOMENT: Radial Gauge) */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                Estado de tu piel
              </h2>
              <ChevronDown className="w-4 h-4 text-[#8C827A]" />
            </div>

            <div className="flex items-center gap-4">
              {/* Radial Score Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-[#E8E1D7]/50"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="stroke-[#2E7D5B] transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-[#2D2825] leading-none">
                    {score}<span className="text-[11px] font-medium text-[#8C827A]">/100</span>
                  </span>
                  <span className="text-[8px] font-semibold text-[#66615C] mt-0.5">
                    Salud de la barrera
                  </span>
                  <span className={`mt-1 px-1.5 py-0.2 rounded-full border text-[8px] font-bold ${
                    score >= 80 ? 'bg-[#E6F4EC] border-[#D5E2DB] text-[#2E7D5B]' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {barrierStatusText}
                  </span>
                </div>
              </div>

              {/* Clinical Attributes */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase block">
                    Biotipo Cutáneo
                  </span>
                  <span className="font-semibold text-[#2D2825]">
                    {skinTypeLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase block">
                    Fototipo Fitzpatrick
                  </span>
                  <span className="font-semibold text-[#2D2825]">
                    {fitzpatrickLabel}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase block">
                    Focos o Necesidades
                  </span>
                  <span className="font-medium text-[#66615C]">
                    {concernsLabel}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/mi-rutina"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1"
            >
              <span>Ver análisis completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WIDGET 2: TU RUTINA DE HOY */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                Tu rutina de hoy
              </h2>

              {/* AM / PM Switcher */}
              <div className="flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7]">
                <button
                  type="button"
                  onClick={() => setActiveTab('AM')}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    activeTab === 'AM'
                      ? 'bg-white text-[#2E7D5B] shadow-2xs'
                      : 'text-[#66615C] hover:text-[#2D2825]'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('PM')}
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                    activeTab === 'PM'
                      ? 'bg-white text-[#2E7D5B] shadow-2xs'
                      : 'text-[#66615C] hover:text-[#2D2825]'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Step Checklist */}
            <div className="space-y-2">
              {currentRoutineSteps.map((step) => (
                <div
                  key={step.id}
                  onClick={() => toggleCheck(step.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs transition cursor-pointer ${
                    step.done
                      ? 'bg-[#E6F4EC]/60 border-[#D5E2DB] text-[#2D2825]'
                      : 'bg-white border-[#E8E1D7] text-[#66615C] hover:border-[#2E7D5B]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition ${
                      step.done
                        ? 'bg-[#2E7D5B] text-white'
                        : 'border border-[#C8C2B8] bg-white'
                    }`}
                  >
                    {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`flex-1 font-medium ${step.done ? 'line-through text-[#8C827A]' : ''}`}>
                    {step.name}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/calendario"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1"
            >
              <span>Ver toda la rutina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WIDGET 3: SKIN CYCLING (WOW MOMENT: Stepper interactivo) */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                  Skin Cycling
                </h2>
                <div className="flex items-center gap-1 text-[#66615C] text-xs font-medium mt-0.5">
                  <span>Racha actual:</span>
                  <span className="font-bold text-[#2E7D5B]">5 días</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-2xs">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
            </div>

            {/* 4-Night Cycle Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-center">
              {/* Day 1: Exfoliación (Completado) */}
              <div className="space-y-1.5">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] font-bold text-xs">
                  1
                </div>
                <div className="text-[10px] font-bold text-[#2D2825] leading-tight">
                  Exfoliación
                </div>
                <div className="text-[9px] text-[#8C827A] font-medium">Día 1</div>
              </div>

              {/* Day 2: Retinoide (ACTIVO) */}
              <div className="space-y-1.5 relative">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#2E7D5B] text-white font-black text-xs flex items-center justify-center shadow-xs ring-4 ring-[#E6F4EC] animate-pulse">
                  2
                </div>
                <div className="text-[10px] font-black text-[#2E7D5B] leading-tight">
                  Retinoide
                </div>
                <div className="text-[9px] text-[#2E7D5B] font-bold">Día 2</div>
              </div>

              {/* Day 3: Recuperación */}
              <div className="space-y-1.5 opacity-60">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] font-bold text-xs">
                  3
                </div>
                <div className="text-[10px] font-medium text-[#2D2825] leading-tight">
                  Recuperación
                </div>
                <div className="text-[9px] text-[#8C827A]">Día 3</div>
              </div>

              {/* Day 4: Recuperación */}
              <div className="space-y-1.5 opacity-60">
                <div className="w-9 h-9 mx-auto rounded-full bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-center text-[#66615C] font-bold text-xs">
                  4
                </div>
                <div className="text-[10px] font-medium text-[#2D2825] leading-tight">
                  Recuperación
                </div>
                <div className="text-[9px] text-[#8C827A]">Día 4</div>
              </div>
            </div>

            <Link
              href="/calendario"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1"
            >
              <span>Ver progreso</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: WIDGETS SECUNDARIOS (PAO, INVENTARIO, TIENDAS)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* WIDGET 4: PAO Y VENCIMIENTOS (Monitor de Vida Útil) */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                PAO y vencimientos
              </h2>
              <Clock className="w-4 h-4 text-[#8C827A]" />
            </div>

            {/* Product with Critical PAO */}
            {vanityProducts.length > 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shrink-0">
                    <span className="text-base">🧴</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#2D2825] truncate">
                      {vanityProducts[0].name || 'Producto en tocador'}
                    </div>
                    <div className="text-[10px] text-[#66615C]">
                      {vanityProducts[0].brand || 'Uso activo'}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] border border-[#D5E2DB] px-2 py-0.5 rounded-full shrink-0">
                    Activo
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-[#E8E1D7]/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#2E7D5B] h-full rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E1D7] text-center space-y-1.5">
                <p className="text-xs font-semibold text-[#2D2825]">Sin alertas de PAO</p>
                <p className="text-[10px] text-[#7E756F]">Escanea un producto para monitorear su caducidad</p>
              </div>
            )}

            <Link
              href="/biblioteca"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WIDGET 5: TUS PRODUCTOS */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                Tus productos
              </h2>
              <Package className="w-4 h-4 text-[#8C827A]" />
            </div>

            {/* Cosmetic Bottles Visual Miniatures */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7]">
              <div className="flex items-center -space-x-2 overflow-hidden py-1">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E1D7] flex items-center justify-center shadow-2xs text-xs font-bold text-[#2D2825]">
                  🧴
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E1D7] flex items-center justify-center shadow-2xs text-xs font-bold text-[#2D2825]">
                  🧪
                </div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E1D7] flex items-center justify-center shadow-2xs text-xs font-bold text-[#2D2825]">
                  ✨
                </div>
              </div>

              <div className="space-y-1 text-right">
                <div className="text-xs font-bold text-[#2D2825]">
                  <span className="text-[#2E7D5B] font-extrabold">{vanityProducts.length || routineItems.length}</span> en rutina
                </div>
                <div className="text-[10px] font-semibold text-[#5D6B63]">
                  {vanityProducts.length > 0 ? 'Sincronizado' : 'Protocolo sugerido'}
                </div>
              </div>
            </div>

            <Link
              href="/mi-rutina"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1"
            >
              <span>Ver tocador</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WIDGET 6: DÓNDE COMPRAR CERCA DE TI (Geolocalización Local) */}
          <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between hover:shadow-xs transition space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                Dónde comprar cerca de ti
              </h2>
              <Store className="w-4 h-4 text-[#8C827A]" />
            </div>

            {/* Pharmacies List */}
            <div className="space-y-2">
              {nearbyStores.length > 0 ? (
                nearbyStores.map((store: any, idx: number) => {
                  const initial = store.store_name?.charAt(0) || store.name?.charAt(0) || 'T';
                  const storeName = store.store_name || store.name || 'Tienda';
                  const locationText = store.city || store.state || (store.distance_km ? `${store.distance_km} km` : 'Disponible');
                  return (
                    <div key={store.id || idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAFAF7] border border-[#E8E1D7]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#2E7D5B] text-white font-black text-[10px] flex items-center justify-center">
                          {initial}
                        </div>
                        <div>
                          <div className="font-bold text-[#2D2825] leading-tight truncate max-w-[130px]">
                            {storeName}
                          </div>
                          <div className="text-[10px] text-[#2E7D5B] font-medium">
                            {locationText} · Verificada
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/tiendas"
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E1D7] text-[#2D2825] text-[10px] font-bold hover:bg-[#E6F4EC] hover:text-[#2E7D5B] transition shadow-2xs"
                      >
                        Ver en mapa
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-center rounded-xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                  <p className="text-xs font-bold text-[#2D2825]">Directorio de farmacias</p>
                  <p className="text-[10px] text-[#66615C]">Encuentra puntos de venta oficiales y stock local</p>
                  <div className="pt-1">
                    <Link
                      href="/tiendas"
                      className="inline-block px-3 py-1 rounded-full bg-[#2E7D5B] text-white text-[10px] font-bold shadow-2xs"
                    >
                      Explorar comercios
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR                           */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E1D7] px-3 py-2 flex items-center justify-around shadow-lg">
        <Link
          href="/dashboard/usuario"
          className="flex flex-col items-center gap-0.5 text-[#2E7D5B] font-bold"
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Inicio</span>
        </Link>

        <Link
          href="/mi-rutina"
          className="flex flex-col items-center gap-0.5 text-[#66615C] hover:text-[#2E7D5B]"
        >
          <HeartPulse className="w-4 h-4" />
          <span className="text-[9px]">Mi piel</span>
        </Link>

        <Link
          href="/calendario"
          className="flex flex-col items-center gap-0.5 text-[#66615C] hover:text-[#2E7D5B]"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px]">Rutina</span>
        </Link>

        <Link
          href="/biblioteca"
          className="flex flex-col items-center gap-0.5 text-[#66615C] hover:text-[#2E7D5B]"
        >
          <Package className="w-4 h-4" />
          <span className="text-[9px]">Productos</span>
        </Link>

        <Link
          href="/mi-rutina"
          className="flex flex-col items-center gap-0.5 text-[#66615C] hover:text-[#2E7D5B]"
        >
          <User className="w-4 h-4" />
          <span className="text-[9px]">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
