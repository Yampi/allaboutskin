'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microscope, Scan, Calendar, BookOpen, GitCompare, User, Store } from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';

interface GlobalNavbarProps {
  onOpenProfile?: () => void;
  onOpenDiagnosis?: () => void;
}

export default function GlobalNavbar({ onOpenProfile, onOpenDiagnosis }: GlobalNavbarProps) {
  const pathname = usePathname();
  const { userProfile } = useSkincare();

  const navItems = [
    { href: '/', label: 'Inicio' },
    { href: '/en-tienda/rio-supermercado-traki-valle-de-la-pascua', label: 'En Tienda (VE)', icon: Store },
    { href: '/escaner', label: 'Auditor INCI', icon: Scan },
    { href: '/calendario', label: 'Mi Calendario', icon: Calendar },
    { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
    { href: '/comparador', label: 'Comparador', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/75 backdrop-blur-xl border-b border-white/80 transition-all duration-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP HEADER (>= 1024px / 72px de altura) */}
        <div className="hidden lg:flex items-center justify-between h-20 gap-3">
          
          {/* 1. Izquierda: Logo & Subtítulo Clínico */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer shrink-0">
            <div className="w-10 h-10 rounded-2xl glass-subcard flex items-center justify-center text-[#1E3A2B] group-hover:scale-105 transition shadow-xs">
              <Microscope className="w-5 h-5 text-[#1E3A2B]" />
            </div>
            <div>
              <span className="text-[21px] font-bold text-slate-900 tracking-tight leading-none block">
                Allabout<span className="text-[#2E5540]">.skin</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5 block">
                Auditoría Científica de Skincare
              </span>
            </div>
          </Link>

          {/* 2. Centro: Navegación Principal en Píldora de Cristal (Sin saltos de línea) */}
          <nav className="flex items-center gap-1 p-1 rounded-full glass-subcard shrink-0">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 xl:px-4 py-2 rounded-full text-[12.5px] xl:text-[13px] font-semibold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'glass-button text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  {item.icon && (
                    <item.icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Derecha: Live Badge TEWL + CTA Escanear + Avatar (100% whitespace-nowrap) */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Live Diagnosis Badge */}
            <button
              onClick={onOpenDiagnosis}
              type="button"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-subcard text-[#1E3A2B] text-[11px] font-bold hover:bg-white/90 transition cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title="Ver informe de barrera cutánea"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="whitespace-nowrap">
                {userProfile?.tewlScore && userProfile.tewlScore !== '--'
                  ? `TEWL: ${userProfile.tewlScore.split(' ')[0]}`
                  : 'Biotipo Dérmico'}
              </span>
            </button>

            {/* CTA Píldora: si ya estamos en /escaner, muestra Volver al Inicio */}
            {pathname.startsWith('/escaner') ? (
              <Link
                href="/"
                className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-[12.5px] shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>← Volver al Inicio</span>
              </Link>
            ) : (
              <Link
                href="/escaner"
                className="px-4 py-2 rounded-full glass-button text-white font-bold text-[12.5px] shadow-sm hover:shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Scan className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Escanear Cosmético</span>
              </Link>
            )}

            {/* User Profile Avatar */}
            <button
              onClick={onOpenProfile}
              type="button"
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full glass-subcard hover:bg-white/80 transition cursor-pointer group shrink-0 whitespace-nowrap"
              title="Configuración de Perfil Dermatológico"
            >
              <div className="text-right hidden xl:block leading-tight pr-0.5">
                <span className="text-[11.5px] font-bold text-slate-900 block truncate max-w-[100px]">
                  {userProfile?.name || 'Mi Perfil'}
                </span>
                <span className="text-[9.5px] text-emerald-800 font-semibold block uppercase">
                  {userProfile?.skinType || 'Sin calibrar'}
                </span>
              </div>
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile?.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white border border-white shadow-xs flex items-center justify-center text-[#1E3A2B] font-bold text-xs group-hover:scale-105 transition">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE TOP BAR (< 1024px / 56px de altura) */}
        <div className="flex lg:hidden items-center justify-between h-14">
          {pathname.startsWith('/escaner') ? (
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2D9CD] text-[#2D2825] text-[12px] font-semibold hover:bg-[#F2ECE4] transition shadow-2xs"
            >
              <span>← Volver al Inicio</span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B]">
                <Microscope className="w-4 h-4" />
              </div>
              <span className="font-serif text-[20px] font-semibold text-[#2D2825] tracking-tight leading-none">
                Allabout<span className="text-[#4A6B5B]">.skin</span>
              </span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiagnosis}
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/30 text-[#4A6B5B] text-[10.5px] font-medium transition cursor-pointer"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#4A6B5B]"></span>
              </span>
              <span>{userProfile?.skinType?.split('/')[0]?.trim() || 'Diagnóstico'}</span>
            </button>

            <button
              onClick={onOpenProfile}
              type="button"
              className="w-8 h-8 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B] cursor-pointer"
              aria-label="Perfil"
            >
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
