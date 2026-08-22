'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BookOpen, Layers, Calendar, ShieldAlert, HeartPulse, Search, User } from 'lucide-react';
import { getCurrentUser, isUserAdmin, StoredUser } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  const isAdmin = isUserAdmin(currentUser);

  return (
    <>
      {/* Top Header - Desktop & Mobile Header Minimal */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EFECE6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EFF5F1] border border-[#7A9A8B]/30 flex items-center justify-center text-[#4F6D60] shadow-xs group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-[#7A9A8B]" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#2B2A29]">
                Allabout<span className="text-[#7A9A8B]">.skin</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#9C9790] font-medium -mt-0.5">
                Asesoría & Formulación Cosmética
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wide text-[#6E6A66]">
            <Link
              href="/"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                pathname === '/' ? 'text-[#7A9A8B] font-bold' : 'hover:text-[#2B2A29]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Evaluar Fórmula
            </Link>
            <Link
              href="/rutinas/skin-cycling"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                pathname === '/rutinas/skin-cycling' ? 'text-[#7A9A8B] font-bold' : 'hover:text-[#2B2A29]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Skin Cycling
            </Link>
            <Link
              href="/mi-rutina"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                pathname === '/mi-rutina' ? 'text-[#7A9A8B] font-bold' : 'hover:text-[#2B2A29]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Mi Calendario
            </Link>
            <Link
              href="/ingrediente"
              className={`flex items-center gap-1.5 transition-colors duration-200 ${
                pathname.startsWith('/ingrediente') ? 'text-[#7A9A8B] font-bold' : 'hover:text-[#2B2A29]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Guía de Activos
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#7A9A8B] text-white shadow-xs'
                    : 'bg-[#2B2A29] text-[#E8D5D0] hover:bg-[#3D3835]'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Quick Actions / SOS */}
          <div className="flex items-center space-x-2.5">
            <Link
              href="/mi-rutina"
              className="flex items-center gap-1.5 bg-[#F8EFEA] hover:bg-[#F2E4DE] text-[#A46864] text-[11px] sm:text-xs px-3 py-1.5 rounded-full font-bold border border-[#E8D5D0] transition-colors duration-200"
              title="Activar cuidado calmante para piel sensible"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#A46864] animate-pulse" />
              <span>Modo Calma SOS</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="md:hidden flex items-center gap-1 bg-[#2B2A29] text-[#E8D5D0] text-[10px] px-2.5 py-1 rounded-full font-bold"
              >
                <ShieldAlert className="w-3 h-3 text-[#E8D5D0]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Sticky Bottom Navigation Bar (Glassmorphic & Touch Optimized 44px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-t border-[#EFECE6] shadow-[0_-4px_20px_rgba(43,42,41,0.03)] px-3 py-1 flex items-center justify-around safe-bottom">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-300 ${
            pathname === '/'
              ? 'text-[#4F6D60] font-bold bg-[#EFF5F1]'
              : 'text-[#9C9790] hover:text-[#2B2A29]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Evaluar</span>
        </Link>
        <Link
          href="/rutinas/skin-cycling"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-300 ${
            pathname === '/rutinas/skin-cycling'
              ? 'text-[#4F6D60] font-bold bg-[#EFF5F1]'
              : 'text-[#9C9790] hover:text-[#2B2A29]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Ciclos</span>
        </Link>
        <Link
          href="/mi-rutina"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-300 ${
            pathname === '/mi-rutina'
              ? 'text-[#4F6D60] font-bold bg-[#EFF5F1]'
              : 'text-[#9C9790] hover:text-[#2B2A29]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Mi Rutina</span>
        </Link>
        <Link
          href="/ingrediente"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-300 ${
            pathname.startsWith('/ingrediente')
              ? 'text-[#4F6D60] font-bold bg-[#EFF5F1]'
              : 'text-[#9C9790] hover:text-[#2B2A29]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Activos</span>
        </Link>
      </nav>
    </>
  );
}

