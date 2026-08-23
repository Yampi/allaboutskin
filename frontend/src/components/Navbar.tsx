'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microscope, Home, RotateCcw, BookOpen, User, ShieldAlert } from 'lucide-react';
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
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ECE6DC] transition-colors duration-200">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#EFF5F1] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Microscope className="w-4 h-4 text-[#4F6D60]" />
            </div>
            <span className="text-xl font-serif font-bold tracking-tight text-[#1C1B1A]">
              Allabout<span className="text-[#4F6D60]">.skin</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center space-x-8 text-sm font-semibold tracking-wide text-[#66615C]">
            <Link
              href="/"
              className={`transition-colors duration-150 py-5 ${
                pathname === '/' ? 'text-[#4F6D60] border-b-2 border-[#4F6D60]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Auditar INCI
            </Link>
            <Link
              href="/rutinas/skin-cycling"
              className={`transition-colors duration-150 py-5 ${
                pathname.startsWith('/rutinas/skin-cycling') ? 'text-[#4F6D60] border-b-2 border-[#4F6D60]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Skin Cycling
            </Link>
            <Link
              href="/mi-rutina"
              className={`transition-colors duration-150 py-5 ${
                pathname.startsWith('/mi-rutina') ? 'text-[#4F6D60] border-b-2 border-[#4F6D60]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Mi Calendario
            </Link>
            <Link
              href="/ingrediente"
              className={`transition-colors duration-150 py-5 ${
                pathname.startsWith('/ingrediente') ? 'text-[#4F6D60] border-b-2 border-[#4F6D60]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Ingredientes
            </Link>
            <Link
              href="/ofertas"
              className={`transition-colors duration-150 py-5 ${
                pathname.startsWith('/ofertas') ? 'text-[#4F6D60] border-b-2 border-[#4F6D60]' : 'hover:text-[#1C1B1A]'
              }`}
            >
              Explorar
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#4F6D60] text-white'
                    : 'bg-[#1E2822] text-[#FDF2F0] hover:bg-[#2D4A3E]'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#ECE6DC]">
        <div className="h-14 flex items-center justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#EFF5F1] flex items-center justify-center">
              <Microscope className="w-3.5 h-3.5 text-[#4F6D60]" />
            </div>
            <span className="text-lg font-serif font-bold tracking-tight text-[#1C1B1A]">
              Allabout<span className="text-[#4F6D60]">.skin</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_16px_rgba(28,27,26,0.05)] border-t border-[#ECE6DC] px-2 py-2 flex items-center justify-around safe-bottom">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-3 rounded-full transition-all duration-200 ${
            pathname === '/'
              ? 'text-[#4F6D60] bg-[#EFF5F1]'
              : 'text-[#99938B]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Inicio</span>
        </Link>
        <Link
          href="/mi-rutina"
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-3 rounded-full transition-all duration-200 ${
            pathname.startsWith('/mi-rutina')
              ? 'text-[#4F6D60] bg-[#EFF5F1]'
              : 'text-[#99938B]'
          }`}
        >
          <RotateCcw className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Mi Ciclo</span>
        </Link>
        <Link
          href="/ingrediente"
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-3 rounded-full transition-all duration-200 ${
            pathname.startsWith('/ingrediente')
              ? 'text-[#4F6D60] bg-[#EFF5F1]'
              : 'text-[#99938B]'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Biblioteca</span>
        </Link>
        <Link
          href="#"
          className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 px-3 rounded-full transition-all duration-200 ${
            pathname === '/perfil'
              ? 'text-[#4F6D60] bg-[#EFF5F1]'
              : 'text-[#99938B]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">Mi Perfil</span>
        </Link>
      </nav>
    </>
  );
}
