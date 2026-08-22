import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaAuditor from '@/components/FormulaAuditor';
import FormulaComparator from '@/components/FormulaComparator';
import { 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Microscope,
  SlidersHorizontal
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allabout.skin — Asesoría Científica & Verificador de Cosméticos',
  description: 'Audita fórmulas cosméticas, descubre si es solo publicidad o ciencia real, y construye tu rutina inteligente.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29] selection:bg-[#E8D5D0] selection:text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-10">
        
        {/* MAIN FOCUSED MODULE: AUDITOR & FORMULA SCANNER (PHOTO + INCI + GUIDED FLOW) */}
        <section className="w-full">
          <FormulaAuditor />
        </section>

        {/* COMPARADOR DE FÓRMULAS LADO A LADO (COLAPSABLE / SECUNDARIO) */}
        <section className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#EFECE6] shadow-beauty space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Herramienta Avanzada
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B2A29]">
                Comparador de Fórmulas Lado a Lado
              </h3>
              <p className="text-xs text-[#6E6A66] mt-0.5">
                Compara dos productos simultáneamente para ver cuál tiene mejor concentración y tolerancia dérmica.
              </p>
            </div>
          </div>
          <FormulaComparator />
        </section>

        {/* MÓDULOS DE LA PLATAFORMA (ACCESO RÁPIDO Y DIRECTO) */}
        <section className="space-y-4">
          <div className="text-center max-w-md mx-auto space-y-1">
            <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest">
              Ecosistema Allabout.skin
            </span>
            <h3 className="text-lg font-serif font-bold text-[#2B2A29]">
              Explora los Módulos Especializados
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Módulo Rutina */}
            <Link
              href="/mi-rutina"
              className="bg-[#FFFFFF] hover:bg-[#FAF8F5] p-5 rounded-3xl border border-[#EFECE6] hover:border-[#7A9A8B]/40 transition-all duration-300 shadow-beauty flex flex-col justify-between space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EFF5F1] text-[#4F6D60] border border-[#7A9A8B]/30 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-[#7A9A8B]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7A9A8B] uppercase tracking-wider block">
                  Módulo 2
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#4F6D60]">
                  Mi Rutina & Calendario
                </h4>
                <p className="text-xs text-[#6E6A66] leading-relaxed">
                  Rutina diaria fija, Skin Cycling de noches alternas y seguimiento diario.
                </p>
              </div>
              <div className="text-xs font-bold text-[#7A9A8B] flex items-center gap-1">
                <span>Ir a Mi Rutina</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Módulo Activos */}
            <Link
              href="/ingrediente"
              className="bg-[#FFFFFF] hover:bg-[#FAF8F5] p-5 rounded-3xl border border-[#EFECE6] hover:border-[#E8D5D0] transition-all duration-300 shadow-beauty flex flex-col justify-between space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F8EFEA] text-[#A46864] border border-[#E8D5D0] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#A46864]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#A46864] uppercase tracking-wider block">
                  Módulo 3
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#A46864]">
                  Guía de Activos
                </h4>
                <p className="text-xs text-[#6E6A66] leading-relaxed">
                  Biblioteca técnica con pH, compatibilidad y evidencia CosIng UE.
                </p>
              </div>
              <div className="text-xs font-bold text-[#A46864] flex items-center gap-1">
                <span>Ver Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Módulo Ofertas */}
            <Link
              href="/ofertas"
              className="bg-[#FFFFFF] hover:bg-[#FAF8F5] p-5 rounded-3xl border border-[#EFECE6] hover:border-[#C4A482]/40 transition-all duration-300 shadow-beauty flex flex-col justify-between space-y-4 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#F7F2EB] text-[#8F7253] border border-[#C4A482]/30 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5 text-[#C4A482]" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#8F7253] uppercase tracking-wider block">
                  Módulo 4
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#8F7253]">
                  Productos & Ofertas
                </h4>
                <p className="text-xs text-[#6E6A66] leading-relaxed">
                  Catálogo curado, comparativas de precio y fórmulas recomendadas.
                </p>
              </div>
              <div className="text-xs font-bold text-[#8F7253] flex items-center gap-1">
                <span>Explorar Ofertas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

