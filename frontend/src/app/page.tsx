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
    <div className="min-h-screen flex flex-col bg-[#FAF7F4] text-[#2D2D2D] selection:bg-[#7BB8D0] selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* App-Centric Hero & Direct Interactive Evaluation Zone */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#E8F4FA]/80 via-[#FAF7F4] to-[#FAF7F4]">
          
          {/* Subtle Ambient Background Accents */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#A8D4E6]/20 via-[#C5E3F0]/30 to-emerald-200/20 blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-[#1A4D63] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#A8D4E6]/80 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-[#4A8BA8]" />
              <span>Plataforma Científica de Skincare</span>
            </div>

            {/* Direct & Impactful Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#2D2D2D] tracking-tight leading-tight sm:leading-none">
              Audita tu Skincare con <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#3A7A96] via-[#4A8BA8] to-[#5FA8C2] bg-clip-text text-transparent">
                Evidencia Médica e IA
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xs sm:text-base text-[#6B6B6B] max-w-xl mx-auto leading-relaxed">
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
              <span className="text-xs font-bold text-[#8B8178] uppercase tracking-wider">
                Explorar Activos y Guías
              </span>
              <Link href="/ingrediente" className="text-xs font-semibold text-[#3A7A96] hover:text-[#2D6680] hover:underline">
                Ver biblioteca de activos →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-left">
              <Link
                href="/ingrediente/niacinamide"
                className="bg-white hover:bg-[#E8F4FA]/50 hover:border-[#8EC5DB] transition-all p-3.5 rounded-2xl border border-[#E8E0D8] shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#E8F4FA] border border-[#A8D4E6] group-hover:bg-[#C5E3F0] flex items-center justify-center text-[#3A7A96] shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#1A4D63]">Niacinamida</h4>
                  <p className="text-[11px] text-[#8B8178]">Poros y Barrera</p>
                </div>
              </Link>

              <Link
                href="/ingrediente/retinol"
                className="bg-white hover:bg-[#E8F4FA]/50 hover:border-[#8EC5DB] transition-all p-3.5 rounded-2xl border border-[#E8E0D8] shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#D4A99A]/20 border border-[#D4A99A]/40 group-hover:bg-[#D4A99A]/30 flex items-center justify-center text-[#D4A99A] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#1A4D63]">Retinol</h4>
                  <p className="text-[11px] text-[#8B8178]">Renovación Celular</p>
                </div>
              </Link>

              <Link
                href="/ingrediente/salicylic-acid"
                className="bg-white hover:bg-[#E8F4FA]/50 hover:border-[#8EC5DB] transition-all p-3.5 rounded-2xl border border-[#E8E0D8] shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 group-hover:bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#1A4D63]">Ácido Salicílico</h4>
                  <p className="text-[11px] text-[#8B8178]">BHA y Poros</p>
                </div>
              </Link>

              <Link
                href="/rutinas/skin-cycling"
                className="bg-white hover:bg-[#E8F4FA]/50 hover:border-[#8EC5DB] transition-all p-3.5 rounded-2xl border border-[#E8E0D8] shadow-xs flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#1A4D63]">Skin Cycling</h4>
                  <p className="text-[11px] text-[#8B8178]">Rutina 4 Noches</p>
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
