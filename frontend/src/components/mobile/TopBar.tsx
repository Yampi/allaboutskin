'use client';

import React from 'react';
import { Microscope, Sparkles, ShieldCheck, Scan, User, Calendar, BookOpen, Repeat, Layers } from 'lucide-react';
import { NavTab, UserProfile } from './types';

interface TopBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onOpenDiagnosis?: () => void;
}

export default function TopBar({
  activeTab,
  onChangeTab,
  userProfile,
  onOpenProfile,
  onOpenDiagnosis,
}: TopBarProps) {
  const desktopNavItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'scanner', label: 'Auditor INCI', icon: Scan },
    { id: 'home', label: 'Skin Cycling', icon: Repeat },
    { id: 'cycle', label: 'Mi Calendario', icon: Calendar },
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E1D7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* DESKTOP TOP NAVIGATION BAR (>= 1024px / 72px - 80px) */}
        <div className="hidden lg:flex items-center justify-between h-20">
          {/* 1. Izquierda: Logo + Subtítulo */}
          <div
            onClick={() => onChangeTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B] group-hover:border-[#8FA89B] group-hover:bg-[#EBF1EE] transition shadow-xs">
              <Microscope className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <span className="font-serif text-[24px] font-semibold text-[#2D2825] tracking-tight leading-none block">
                Allabout<span className="text-[#4A6B5B]">.skin</span>
              </span>
              <span className="text-[11px] font-sans font-medium text-[#7E756F] tracking-wide mt-0.5 block">
                Auditoría Científica de Skincare
              </span>
            </div>
          </div>

          {/* 2. Centro: Menú Interactivo */}
          <nav className="flex items-center gap-1.5 p-1 rounded-full bg-[#F2ECE4]/70 border border-[#E2D9CD]">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onChangeTab(item.id)}
                  className={`px-4 py-2 rounded-full text-[13px] font-medium transition cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#4A6B5B] text-white shadow-xs font-semibold'
                      : 'text-[#4A433E] hover:text-[#2D2825] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7E756F]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 3. Derecha: Botón CTA "Evaluar Producto" + Avatar de Usuario */}
          <div className="flex items-center gap-3">
            {/* Live Clinical Badge */}
            <button
              onClick={onOpenDiagnosis}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/40 text-[#4A6B5B] text-[11.5px] font-medium hover:bg-[#8FA89B]/20 transition cursor-pointer shadow-xs"
              title="Ver informe de barrera cutánea"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6B5B]"></span>
              </span>
              <span>{userProfile?.tewlScore && userProfile.tewlScore !== '--' ? `TEWL ${userProfile.tewlScore}` : 'Diagnóstico Cutáneo'}</span>
            </button>

            {/* CTA Píldora "Evaluar Producto" (#8FA89B) */}
            <button
              onClick={() => onChangeTab('scanner')}
              className="px-5 py-2.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[13.5px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center gap-2 cursor-pointer"
            >
              <Scan className="w-4 h-4 text-white" />
              <span>Evaluar Producto</span>
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] hover:border-[#8FA89B] transition cursor-pointer group"
              title="Configuración de Perfil"
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

        {/* MOBILE TOP BAR (< 1024px) */}
        <div className="flex lg:hidden items-center justify-between h-14">
          {/* Logo */}
          <div
            onClick={() => onChangeTab('home')}
            className="flex flex-col cursor-pointer"
          >
            <span className="font-serif text-[21px] font-semibold text-[#2D2825] tracking-tight leading-none">
              Allabout<span className="text-[#4A6B5B]">.skin</span>
            </span>
            <span className="text-[9px] font-sans font-medium text-[#7E756F] tracking-wider uppercase mt-0.5">
              Auditoría Dermatológica
            </span>
          </div>

          {/* Right Mobile Status & Profile Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiagnosis}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/30 text-[#4A6B5B] text-[10.5px] font-medium transition cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8FA89B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4A6B5B]"></span>
              </span>
              <span>{userProfile?.barrierStatus && userProfile.barrierStatus !== 'Sin evaluar' ? userProfile.barrierStatus : 'Diagnóstico'}</span>
            </button>

            <button
              onClick={onOpenProfile}
              className="w-9 h-9 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-center text-[#4A6B5B] hover:bg-[#EBF1EE] transition cursor-pointer"
              aria-label="Perfil"
            >
              {userProfile?.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile?.name || 'Usuario'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-[#4A6B5B]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}