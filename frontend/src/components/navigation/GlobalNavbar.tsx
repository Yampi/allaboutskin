'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microscope, Scan, Calendar, BookOpen, GitCompare, User } from 'lucide-react';
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
    { href: '/escaner', label: 'Auditor INCI & AR', icon: Scan },
    { href: '/calendario', label: 'Mi Calendario', icon: Calendar },
    { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
    { href: '/comparador', label: 'Comparador', icon: GitCompare },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D7] transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP HEADER (>= 1024px / 72px de altura) */}
        <div className="hidden lg:flex items-center justify-between h-20">
          
          {/* 1. Izquierda: Logo & Subtítulo Clínico */}
          <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B] group-hover:border-[#8FA89B] group-hover:bg-[#EBF1EE] transition shadow-xs">
              <Microscope className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="font-serif text-[23px] font-semibold text-[#2D2825] tracking-tight leading-none block">
                Allabout<span className="text-[#4A6B5B]">.skin</span>
              </span>
              <span className="text-[10.5px] font-sans font-medium text-[#7E756F] tracking-wide mt-0.5 block">
                Auditoría Científica de Skincare
              </span>
            </div>
          </Link>

          {/* 2. Centro: Navegación Principal en Píldora Editorial */}
          <nav className="flex items-center gap-1 p-1 rounded-full bg-[#F2ECE4]/70 border border-[#E2D9CD]">
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#4A6B5B] text-white shadow-xs font-semibold'
                      : 'text-[#4A433E] hover:text-[#2D2825] hover:bg-white/60'
                  }`}
                >
                  {item.icon && (
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#7E756F]'}`} />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. Derecha: Live Badge TEWL + CTA Escanear + Avatar */}
          <div className="flex items-center gap-3">
            {/* Live Diagnosis Badge */}
            <button
              onClick={onOpenDiagnosis}
              type="button"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/40 text-[#4A6B5B] text-[11px] font-semibold hover:bg-[#8FA89B]/20 transition cursor-pointer shadow-xs"
              title="Ver informe de barrera cutánea"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6B5B]"></span>
              </span>
              <span>
                {userProfile?.tewlScore && userProfile.tewlScore !== '--'
                  ? `TEWL: ${userProfile.tewlScore.split(' ')[0]}`
                  : 'Biotipo Dérmico'}
              </span>
            </button>

            {/* CTA Píldora "Escanear Cosmético" */}
            <Link
              href="/escaner"
              className="px-5 py-2.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[13px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>Escanear Cosmético</span>
            </Link>

            {/* User Profile Avatar */}
            <button
              onClick={onOpenProfile}
              type="button"
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] hover:border-[#8FA89B] transition cursor-pointer group"
              title="Configuración de Perfil Dermatológico"
            >
              <div className="text-right hidden xl:block">
                <span className="text-[12px] font-semibold text-[#2D2825] block leading-tight">
                  {userProfile?.name || 'Mi Perfil'}
                </span>
                <span className="text-[10px] text-[#4A6B5B] font-medium block">
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
                <div className="w-8 h-8 rounded-full bg-[#EBF1EE] border border-white shadow-xs flex items-center justify-center text-[#4A6B5B] group-hover:scale-105 transition">
                  <User className="w-4 h-4" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE TOP BAR (< 1024px / 56px de altura) */}
        <div className="flex lg:hidden items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B]">
              <Microscope className="w-4 h-4" />
            </div>
            <span className="font-serif text-[20px] font-semibold text-[#2D2825] tracking-tight leading-none">
              Allabout<span className="text-[#4A6B5B]">.skin</span>
            </span>
          </Link>

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
