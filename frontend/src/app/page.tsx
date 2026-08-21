import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaAuditor from '@/components/FormulaAuditor';
import { Microscope, ShieldCheck, Database, FileText, Layers, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allabout.skin - Auditoría Científica de Skincare y Cosméticos',
  description: 'Audita cualquier cosmético, toallita o miscelánea con rigor científico. Verificado contra CosIng UE y PubMed.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* App-Centric Hero & Direct Interactive Evaluation Zone */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/80 via-slate-50 to-slate-50">
          
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-teal-200/20 via-cyan-100/30 to-emerald-200/20 blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-teal-900 text-xs font-bold px-3.5 py-1.5 rounded-full border border-teal-200/80 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Plataforma Científica de Skincare</span>
            </div>

            {/* Direct & Impactful Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
              Audita tu Skincare con <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Evidencia Médica e IA
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              Escribe un producto, pega sus ingredientes o toma una foto para evaluar compatibilidad química, orden de capas y estudios clínicos.
            </p>
          </div>

          {/* Interactive Single-Input Evaluation Box (Directly in Viewport) */}
          <div className="max-w-4xl mx-auto">
            <FormulaAuditor />
          </div>

          {/* Quick Exploration Cards (With Real Destinations) */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Explorar Activos y Guías
              </span>
              <Link href="/ingrediente" className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline">
                Ver biblioteca de activos →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
              <Link
                href="/ingrediente/niacinamide"
                className="bg-white hover:bg-teal-50/50 hover:border-teal-300 transition-all p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 group-hover:bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Niacinamida</h4>
                  <p className="text-[11px] text-slate-500">Poros y Barrera</p>
                </div>
              </Link>

              <Link
                href="/ingrediente/retinol"
                className="bg-white hover:bg-teal-50/50 hover:border-teal-300 transition-all p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 group-hover:bg-purple-100 flex items-center justify-center text-purple-700 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Retinol</h4>
                  <p className="text-[11px] text-slate-500">Renovación Celular</p>
                </div>
              </Link>

              <Link
                href="/ingrediente/salicylic-acid"
                className="bg-white hover:bg-teal-50/50 hover:border-teal-300 transition-all p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 group-hover:bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Ácido Salicílico</h4>
                  <p className="text-[11px] text-slate-500">BHA y Poros</p>
                </div>
              </Link>

              <Link
                href="/rutinas/skin-cycling"
                className="bg-white hover:bg-teal-50/50 hover:border-teal-300 transition-all p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-900">Skin Cycling</h4>
                  <p className="text-[11px] text-slate-500">Rutina 4 Noches</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
