import Link from 'next/link';
import { Microscope, Sparkles, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-900 to-teal-600 bg-clip-text text-transparent">
              SkinEvidence
            </span>
            <span className="text-xs block text-slate-500 font-medium -mt-1">Auditoría Científica de Fórmulas</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-teal-600 flex items-center gap-1.5 transition-colors">
            <Microscope className="w-4 h-4 text-teal-600" />
            Auditor INCI
          </Link>
          <Link href="/rutinas/skin-cycling" className="hover:text-teal-600 flex items-center gap-1.5 transition-colors">
            <Layers className="w-4 h-4 text-teal-600" />
            Skin Cycling
          </Link>
          <Link href="/ingrediente/niacinamide" className="hover:text-teal-600 flex items-center gap-1.5 transition-colors">
            <BookOpen className="w-4 h-4 text-teal-600" />
            Enciclopedia CosIng
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1 bg-teal-50 text-teal-800 text-xs px-3 py-1.5 rounded-full font-semibold border border-teal-200/60">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>PubMed + CosIng EU</span>
          </div>
        </div>
      </div>
    </header>
  );
}
