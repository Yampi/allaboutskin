'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  HeartPulse,
  Sparkles,
  Calendar,
  BookOpen,
  Globe,
  Scan,
  Store,
  User,
  LogOut,
  Flower2,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getCurrentUser, logoutUser, StoredUser } from '@/lib/api';

interface UserAppShellProps {
  children: React.ReactNode;
  activeNavId?: 'inicio' | 'mi-piel' | 'mi-rutina' | 'calendario' | 'productos' | 'analisis' | 'tiendas' | 'perfil';
  hideTopSearch?: boolean;
}

export default function UserAppShell({
  children,
  activeNavId,
  hideTopSearch = false,
}: UserAppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setCurrentUser(null);
      router.push('/');
    }
  };

  const navItems = [
    { id: 'inicio', label: 'Mi Tocador', icon: Home, href: '/dashboard/usuario' },
    { id: 'mi-piel', label: 'Mi piel', icon: HeartPulse, href: '/mi-piel' },
    { id: 'mi-rutina', label: 'Mi rutina', icon: Sparkles, href: '/mi-rutina' },
    { id: 'calendario', label: 'Skin Cycling', icon: Calendar, href: '/calendario' },
    { id: 'productos', label: 'Ingredientes', icon: BookOpen, href: '/biblioteca' },
    { id: 'analisis', label: 'Análisis y escaneos', icon: Scan, href: '/escaner' },
    { id: 'tiendas', label: 'Tiendas cercanas', icon: Store, href: '/tiendas' },
    { id: 'perfil', label: 'Perfil', icon: User, href: '/perfil' },
  ];

  const currentActive = activeNavId || (
    pathname.startsWith('/dashboard/usuario') ? 'inicio'
    : pathname.startsWith('/mi-piel') ? 'mi-piel'
    : pathname.startsWith('/mi-rutina') ? 'mi-rutina'
    : pathname.startsWith('/calendario') ? 'calendario'
    : pathname.startsWith('/biblioteca') ? 'productos'
    : pathname.startsWith('/escaner') ? 'analisis'
    : pathname.startsWith('/tiendas') ? 'tiendas'
    : pathname.startsWith('/perfil') ? 'perfil'
    : 'inicio'
  );

  const userName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Tu cuenta');
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#2D2825] flex flex-col lg:flex-row antialiased selection:bg-[#E6F4EC] selection:text-[#2E7D5B] font-sans pb-16 lg:pb-0">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP (Verde Clínico DLG-HYBRID / MOCKUP)      */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E8E1D7] sticky top-0 h-screen justify-between p-5 shrink-0 z-30">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/" title="Ir a la página principal" className="flex items-center gap-2.5 px-2 group cursor-pointer">
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
              const isActive = currentActive === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
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

        {/* Sidebar Bottom: Logout & Philosophy Badge */}
        <div className="space-y-3 pt-4 border-t border-[#E8E1D7]">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#66615C] hover:text-[#2E7D5B] hover:bg-[#F2F7F4] transition"
          >
            <Globe className="w-4 h-4 text-[#8C827A] shrink-0" />
            <span>Página principal</span>
          </Link>

          {/* Botón Destacado de Cerrar Sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer text-left"
            title="Cerrar sesión actual"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Cerrar sesión</span>
          </button>

          {/* Philosophy Card */}
          <div className="p-3.5 rounded-2xl bg-[#F4F8F5] border border-[#D5E2DB] flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#1B3D32] leading-snug">
                Tu piel, <span className="text-[#2E7D5B] font-extrabold">con ciencia.</span>
              </p>
              <p className="text-[10px] text-[#66615C] font-medium">
                No con marketing.
              </p>
            </div>
            <Flower2 className="w-4 h-4 text-[#2E7D5B] shrink-0" />
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. HEADER MOBILE (Visible solo en dispositivos móviles)   */}
      {/* ========================================================= */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#E8E1D7] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl bg-[#F2F7F4] text-[#2E7D5B] hover:bg-[#E6F4EC] transition"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link href="/" title="Ir a la página principal" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-base text-[#2D2825] tracking-tight">
              allabout<span className="text-[#2E7D5B]">.skin</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/perfil"
            className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-xs flex items-center justify-center border border-[#D5E2DB]"
            title="Ir a mi perfil"
          >
            {userInitial}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 transition"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85%] bg-white h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} title="Ir a la página principal" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E6F4EC] flex items-center justify-center text-[#2E7D5B]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-lg text-[#2D2825]">
                    allabout<span className="text-[#2E7D5B]">.skin</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentActive === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                        isActive
                          ? 'bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB] font-bold'
                          : 'text-[#66615C] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#2E7D5B]' : 'text-[#8C827A]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#E8E1D7]">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[#66615C] hover:bg-slate-50"
              >
                <Globe className="w-4 h-4 text-[#8C827A]" />
                <span>Página principal</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE / CONTENT AREA                           */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR INTERNO DEL DASHBOARD (Desktop) */}
        {!hideTopSearch && (
          <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-md border-b border-[#E8E1D7] sticky top-0 z-20">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar productos, ingredientes, fórmulas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/biblioteca?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 bg-[#FAFAF7] border border-[#E8E1D7] rounded-full text-xs text-[#2D2825] placeholder-[#8C827A] focus:outline-none focus:border-[#2E7D5B] focus:ring-1 focus:ring-[#2E7D5B] transition"
              />
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/escaner"
                className="p-2 rounded-full bg-[#FAFAF7] hover:bg-[#F2F7F4] text-[#2E7D5B] border border-[#E8E1D7] transition"
                title="Escanear con Cámara IA"
              >
                <Scan className="w-4 h-4" />
              </Link>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 bg-[#FAFAF7] hover:bg-[#F2F7F4] border border-[#E8E1D7] rounded-full transition cursor-pointer"
                >
                  <div className="text-right leading-tight pr-1">
                    <span className="text-xs font-bold text-[#2D2825] block truncate max-w-[120px]">
                      {userName}
                    </span>
                    <span className="text-[10px] text-[#2E7D5B] font-semibold block">
                      Cuenta activa
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] font-bold text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] mr-1" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E1D7] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800 truncate">{userName}</p>
                      {currentUser?.email && <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>}
                    </div>

                    <div className="py-1 space-y-0.5">
                      <Link
                        href="/dashboard/usuario"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Mi Tocador</span>
                      </Link>
                      <Link
                        href="/mi-piel"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                      >
                        <HeartPulse className="w-3.5 h-3.5" />
                        <span>Mi Piel (Datos Clínicos)</span>
                      </Link>
                      <Link
                        href="/mi-rutina"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mi Rutina (Guía Paso a Paso)</span>
                      </Link>
                      <Link
                        href="/perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Ajustes de Perfil</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
