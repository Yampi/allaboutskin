'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Microscope, BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Header (Compact & Clean for Mobile & Desktop) */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
              <Microscope className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-teal-950 via-teal-800 to-teal-600 bg-clip-text text-transparent">
                SkinEvidence
              </span>
              <span className="hidden sm:block text-[11px] text-slate-500 font-medium -mt-1">
                Auditoría Científica de Skincare
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
            <Link
              href="/"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname === '/' ? 'text-teal-600 font-bold' : 'hover:text-teal-600'
              }`}
            >
              <Microscope className="w-4 h-4 text-teal-600" />
              Auditor INCI
            </Link>
            <Link
              href="/rutinas/skin-cycling"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname === '/rutinas/skin-cycling' ? 'text-teal-600 font-bold' : 'hover:text-teal-600'
              }`}
            >
              <Layers className="w-4 h-4 text-teal-600" />
              Skin Cycling
            </Link>
            <Link
              href="/ingrediente/niacinamide"
              className={`flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/ingrediente') ? 'text-teal-600 font-bold' : 'hover:text-teal-600'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              CosIng UE
            </Link>
          </nav>

          {/* Validation Badge */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-1 bg-teal-50 text-teal-900 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full font-bold border border-teal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>PubMed • CosIng</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Sticky Bottom Navigation Bar (iOS / Android App Feel) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl px-2 py-1.5 flex items-center justify-around safe-bottom">
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            pathname === '/'
              ? 'text-teal-600 font-bold bg-teal-50/80 scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Microscope className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Auditor</span>
        </Link>

        <Link
          href="/rutinas/skin-cycling"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            pathname === '/rutinas/skin-cycling'
              ? 'text-teal-600 font-bold bg-teal-50/80 scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Skin Cycling</span>
        </Link>

        <Link
          href="/ingrediente/niacinamide"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
            pathname.startsWith('/ingrediente')
              ? 'text-teal-600 font-bold bg-teal-50/80 scale-105'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Enciclopedia</span>
        </Link>
      </div>
    </>
  );
}

