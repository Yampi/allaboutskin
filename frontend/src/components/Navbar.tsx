'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microscope, BookOpen, Layers, ShieldCheck, Calendar, ShieldAlert, HeartPulse, Search } from 'lucide-react';
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
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#FFFCF9]/95 backdrop-blur-md border-b border-[#E8E0D8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#5FA8C2] to-[#3A7A96] flex items-center justify-center text-white shadow-md shadow-[#A8D4E6]/25">
              <Microscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#2D2D2D]">
                Allabout<span className="text-[#4A8BA8]">.skin</span>
              </span>
              <span className="hidden sm:block text-[11px] text-[#8B8178] font-medium -mt-1">
                Tu Guía Inteligente de Skincare
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-semibold text-[#5A5A5A]">
            <Link
              href="/"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname === '/' ? 'text-[#4A8BA8] font-bold' : 'hover:text-[#4A8BA8]'
              }`}
            >
              <Search className="w-4 h-4 text-[#4A8BA8]" />
              Evaluar Producto
            </Link>
            <Link
              href="/rutinas/skin-cycling"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname === '/rutinas/skin-cycling' ? 'text-[#4A8BA8] font-bold' : 'hover:text-[#4A8BA8]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#4A8BA8]" />
              Ciclado de Noches
            </Link>
            <Link
              href="/mi-rutina"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname === '/mi-rutina' ? 'text-[#4A8BA8] font-bold' : 'hover:text-[#4A8BA8]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#4A8BA8]" />
              Mi Calendario & SOS
            </Link>
            <Link
              href="/ingrediente"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/ingrediente') ? 'text-[#4A8BA8] font-bold' : 'hover:text-[#4A8BA8]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-[#4A8BA8]" />
              Ingredientes
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#4A8BA8] text-white shadow-md shadow-[#A8D4E6]/30'
                    : 'bg-[#1A2332] text-[#8EC5DB] hover:bg-[#3D3D3D]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Validation Badge & SOS quick link */}
          <div className="flex items-center space-x-2">
            <Link
              href="/mi-rutina"
              className="flex items-center gap-1.5 bg-[#F9F2F0] hover:bg-rose-100 text-rose-800 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-bold border border-rose-200 transition"
              title="Ir a activar el modo rescate de piel"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Botón SOS</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="md:hidden flex items-center gap-1 bg-[#1A2332] text-[#8EC5DB] text-[10px] px-2.5 py-1 rounded-full font-extrabold border border-[#5FA8C2]/30"
              >
                <ShieldAlert className="w-3 h-3 text-[#7BB8D0]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFCF9]/95 backdrop-blur-lg border-t border-[#E8E0D8]/90 shadow-2xl px-2 py-1.5 flex items-center justify-around safe-bottom">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/'
              ? 'text-[#4A8BA8] font-bold bg-[#E8F4FA]/80 scale-105'
              : 'text-[#8B8178] hover:text-[#2D2D2D]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Evaluar</span>
        </Link>
        <Link
          href="/rutinas/skin-cycling"
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/rutinas/skin-cycling'
              ? 'text-[#4A8BA8] font-bold bg-[#E8F4FA]/80 scale-105'
              : 'text-[#8B8178] hover:text-[#2D2D2D]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Ciclado</span>
        </Link>
        <Link
          href="/mi-rutina"
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            pathname === '/mi-rutina'
              ? 'text-[#4A8BA8] font-bold bg-[#E8F4FA]/80 scale-105'
              : 'text-[#8B8178] hover:text-[#2D2D2D]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Mi Rutina</span>
        </Link>
        <Link
          href="/ingrediente"
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all ${
            pathname.startsWith('/ingrediente')
              ? 'text-[#4A8BA8] font-bold bg-[#E8F4FA]/80 scale-105'
              : 'text-[#8B8178] hover:text-[#2D2D2D]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Activos</span>
        </Link>
      </div>
    </>
  );
}
