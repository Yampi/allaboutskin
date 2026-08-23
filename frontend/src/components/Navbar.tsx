'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, BookOpen, Layers, Calendar, ShieldAlert, Search, Compass, RotateCcw } from 'lucide-react';
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
      {/* Top Header - Editorial Desktop & Clean Mobile Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#ECE6DC] transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#EEF4F0] border border-[#6B8B7B]/20 flex items-center justify-center text-[#364B40] group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-3.5 h-3.5 text-[#6B8B7B]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-serif font-bold tracking-tight text-[#1C1B1A]">
                Allabout<span className="text-[#6B8B7B]">.skin</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-[#99938B] font-medium -mt-0.5">
                Ciencia & Formulación Cosmética
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold tracking-wide text-[#66615C]">
            <Link
              href="/"
              className={`transition-colors duration-150 py-1 ${
                pathname === '/' ? 'text-[#364B40] font-bold border-b-2 border-[#6B8B7B]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Analizar
            </Link>
            <Link
              href="/mi-rutina"
              className={`transition-colors duration-150 py-1 ${
                pathname.startsWith('/mi-rutina') ? 'text-[#364B40] font-bold border-b-2 border-[#6B8B7B]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Mi rutina
            </Link>
            <Link
              href="/ingrediente"
              className={`transition-colors duration-150 py-1 ${
                pathname.startsWith('/ingrediente') ? 'text-[#364B40] font-bold border-b-2 border-[#6B8B7B]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Explorar
            </Link>
            <Link
              href="/rutinas/skin-cycling"
              className={`transition-colors duration-150 py-1 ${
                pathname.startsWith('/rutinas/skin-cycling') ? 'text-[#364B40] font-bold border-b-2 border-[#6B8B7B]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Skin Cycling
            </Link>
            <Link
              href="/ofertas"
              className={`transition-colors duration-150 py-1 ${
                pathname.startsWith('/ofertas') ? 'text-[#364B40] font-bold border-b-2 border-[#6B8B7B]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Catálogo
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#6B8B7B] text-white shadow-2xs'
                    : 'bg-[#1C1B1A] text-[#FDF2F0] hover:bg-[#364B40]'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* Quick Action */}
          <div className="flex items-center space-x-2">
            <Link
              href="/mi-rutina"
              className="hidden sm:flex items-center gap-1.5 bg-[#EEF4F0] hover:bg-[#E2ECE5] text-[#364B40] text-xs px-3.5 py-1.5 rounded-full font-bold border border-[#6B8B7B]/20 transition-colors duration-200"
            >
              <Calendar className="w-3.5 h-3.5 text-[#6B8B7B]" />
              <span>Mi Rutina</span>
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="md:hidden flex items-center gap-1 bg-[#1C1B1A] text-[#FDF2F0] text-[10px] px-2.5 py-1 rounded-full font-bold"
              >
                <ShieldAlert className="w-3 h-3 text-[#FDF2F0]" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile-First Sticky Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#ECE6DC] shadow-[0_-2px_14px_rgba(28,27,26,0.03)] px-3 py-1 flex items-center justify-around safe-bottom">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            pathname === '/'
              ? 'text-[#364B40] font-bold bg-[#EEF4F0]'
              : 'text-[#99938B] hover:text-[#1C1B1A]'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Analizar</span>
        </Link>
        <Link
          href="/mi-rutina"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            pathname.startsWith('/mi-rutina')
              ? 'text-[#364B40] font-bold bg-[#EEF4F0]'
              : 'text-[#99938B] hover:text-[#1C1B1A]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Mi rutina</span>
        </Link>
        <Link
          href="/ingrediente"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            pathname.startsWith('/ingrediente')
              ? 'text-[#364B40] font-bold bg-[#EEF4F0]'
              : 'text-[#99938B] hover:text-[#1C1B1A]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Explorar</span>
        </Link>
        <Link
          href="/rutinas/skin-cycling"
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-2xl transition-all duration-200 ${
            pathname.startsWith('/rutinas/skin-cycling')
              ? 'text-[#364B40] font-bold bg-[#EEF4F0]'
              : 'text-[#99938B] hover:text-[#1C1B1A]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Guía</span>
        </Link>
      </nav>
    </>
  );
}

