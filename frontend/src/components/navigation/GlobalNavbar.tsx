'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Scan,
  Store,
  ShieldCheck,
  User,
  Home,
  HeartPulse,
  LogOut,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';
import { getCurrentUser, isUserAdmin, isUserBusiness, StoredUser, logoutUser } from '@/lib/api';

interface GlobalNavbarProps {
  onOpenProfile?: () => void;
  onOpenDiagnosis?: () => void;
}

export default function GlobalNavbar({ onOpenProfile, onOpenDiagnosis }: GlobalNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useSkincare();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setCurrentUser(null);
      setIsDropdownOpen(false);
      router.push('/');
    }
  };

  // Enlaces públicos para visitantes sin cuenta
  const publicNavItems = [
    { href: '/', label: 'Inicio' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/biblioteca', label: 'Ingredientes' },
    { href: '/tiendas', label: 'Tiendas' },
    { href: '/rutinas/skin-cycling', label: 'Skin Cycling' },
  ];

  // Enlaces para usuarios autenticados cuando navegan por páginas públicas
  const authNavItems = [
    { href: '/', label: 'Inicio' },
    { href: '/#como-funciona', label: 'Cómo funciona' },
    { href: '/tiendas', label: 'Tiendas' },
    { href: '/biblioteca', label: 'Ingredientes' },
  ];

  const navItems = currentUser ? authNavItems : publicNavItems;
  const userName = currentUser?.name || userProfile?.name || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E8E1D7] transition-all duration-200 shadow-2xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* DESKTOP HEADER (>= 1024px)                                */}
        {/* ========================================================= */}
        <div className="hidden lg:flex items-center justify-between h-20 gap-4">
          
          {/* 1. Logo & Identidad de Marca */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] group-hover:scale-105 transition shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
            </div>
            <div>
              <span className="text-[20px] font-extrabold text-[#2D2825] tracking-tight leading-none block">
                allabout<span className="text-[#2E7D5B]">.skin</span>
              </span>
            </div>
          </Link>

          {/* 2. Navegación Principal en Píldora Centrada */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-[#FAFAF7] border border-[#E8E1D7] shrink-0">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2E7D5B] text-white shadow-xs font-bold'
                      : 'text-[#5D6B63] hover:text-[#2D2825] hover:bg-white'
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Acciones Derecha (Separación Clara: Visitante vs Autenticado) */}
          <div className="flex items-center gap-3 shrink-0">

            {/* CTA Escanear Cosmético con Cámara */}
            <Link
              href="/escaner"
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F2F7F4] border border-[#D5E2DB] text-[#2E7D5B] font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Scan className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Escanear Cosmético</span>
            </Link>

            {/* Bloque de Usuario o Login */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* Botón Acceso Rápido a mi Tocador */}
                <Link
                  href="/dashboard/usuario"
                  className="px-4 py-2 rounded-full bg-[#E6F4EC] hover:bg-[#D5E2DB] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
                  title="Ir a mi tocador digital"
                >
                  <Home className="w-3.5 h-3.5 text-[#2E7D5B]" />
                  <span>Mi Tocador</span>
                </Link>

                {/* Avatar con Dropdown de Cuenta & Logout */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-[#FAFAF7] hover:bg-white border border-[#E8E1D7] transition cursor-pointer"
                  >
                    <div className="text-right leading-tight pr-0.5">
                      <span className="text-[11px] font-bold text-[#2D2825] block truncate max-w-[100px]">
                        {userName}
                      </span>
                      <span className="text-[9px] text-[#2E7D5B] font-semibold block">
                        Cuenta activa
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] font-bold text-xs flex items-center justify-center">
                      {userInitial}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#8C827A]" />
                  </button>

                  {/* Dropdown del Menú de Usuario */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-sm border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs font-bold text-[#2D2825] truncate">{userName}</p>
                        <p className="text-[10px] text-[#7E756F] truncate">{currentUser.email || 'usuario@allabout.skin'}</p>
                      </div>

                      <div className="py-1 space-y-0.5">
                        {isUserAdmin(currentUser) && (
                          <Link
                            href="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B5B]" />
                            <span>Panel SuperAdmin</span>
                          </Link>
                        )}
                        {isUserBusiness(currentUser) && (
                          <Link
                            href="/dashboard/empresa"
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-bold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                          >
                            <Store className="w-3.5 h-3.5 text-[#4A6B5B]" />
                            <span>Portal de Comercios</span>
                          </Link>
                        )}
                        <Link
                          href="/dashboard/usuario"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#2D2825] hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>Mi Tocador / Dashboard</span>
                        </Link>
                        <Link
                          href="/mi-piel"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#2D2825] hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                        >
                          <HeartPulse className="w-3.5 h-3.5" />
                          <span>Mi Piel (Datos Clínicos)</span>
                        </Link>
                        <Link
                          href="/mi-rutina"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#2D2825] hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mi Rutina Explicativa</span>
                        </Link>
                        <Link
                          href="/perfil"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-[#2D2825] hover:bg-[#F2F7F4] hover:text-[#2E7D5B] transition"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Ajustes de Perfil</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-[#2D2825] hover:text-[#2E7D5B] transition whitespace-nowrap cursor-pointer"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
                >
                  Crear cuenta
                </Link>
              </div>
            )}

          </div>

        </div>

        {/* ========================================================= */}
        {/* MOBILE TOP BAR (< 1024px)                                 */}
        {/* ========================================================= */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-base text-[#2D2825] tracking-tight">
              allabout<span className="text-[#2E7D5B]">.skin</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard/usuario"
                  className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold border border-[#D5E2DB]"
                >
                  Mi Tocador
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1 text-xs font-semibold text-[#2D2825]"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="px-3 py-1 rounded-full bg-[#2E7D5B] text-white text-xs font-bold"
                >
                  Registro
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
