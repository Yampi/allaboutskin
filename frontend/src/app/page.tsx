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
  Compass
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allabout.skin — Asesoría Científica & Verificador de Cosméticos',
  description: 'Audita fórmulas cosméticas, descubre si es solo publicidad o ciencia real, y construye tu rutina inteligente.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1B1A] selection:bg-[#FDF2F0] selection:text-[#943C36]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-16">
        
        {/* MAIN FOCUSED MODULE: AUDITOR & FORMULA SCANNER */}
        <section className="w-full">
          <FormulaAuditor />
        </section>

        {/* COMPARADOR DE FÓRMULAS LADO A LADO (SECONDARY EDITORIAL SURFACE) */}
        <section className="border-t border-[#ECE6DC] pt-12 space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#99938B] uppercase tracking-widest block">
              Comparativa Científica
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A]">
              Comparador de Fórmulas Lado a Lado
            </h3>
            <p className="text-xs sm:text-sm text-[#66615C] max-w-xl">
              Compara dos productos simultáneamente para evaluar concentración de activos, compatibilidad dérmica y relación calidad-ciencia.
            </p>
          </div>
          <FormulaComparator />
        </section>

        {/* MÓDULOS DE LA PLATAFORMA (ACCESO EDITORIAL LIGERO) */}
        <section className="border-t border-[#ECE6DC] pt-12 space-y-8">
          <div className="text-center max-w-lg mx-auto space-y-1.5">
            <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-widest">
              Exploración & Cuidado Continuo
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#1C1B1A]">
              Herramientas de Bienestar Dérmico
            </h3>
            <p className="text-xs text-[#66615C]">
              Todo lo necesario para tomar decisiones informadas sobre tu piel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Módulo Rutina */}
            <Link
              href="/mi-rutina"
              className="bg-[#FFFFFF] hover:bg-[#F7F4EE] p-6 rounded-2xl border border-[#ECE6DC] hover:border-[#6B8B7B]/40 transition-all duration-300 shadow-editorial flex flex-col justify-between space-y-4 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EEF4F0] text-[#364B40] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4 text-[#6B8B7B]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-wider block">
                  Seguimiento
                </span>
                <h4 className="text-base font-serif font-bold text-[#1C1B1A] group-hover:text-[#364B40]">
                  Mi Rutina & Calendario
                </h4>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Rutina diaria fija, Skin Cycling de noches alternas y control de uso.
                </p>
              </div>
              <div className="text-xs font-bold text-[#364B40] flex items-center gap-1">
                <span>Abrir calendario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Módulo Activos */}
            <Link
              href="/ingrediente"
              className="bg-[#FFFFFF] hover:bg-[#F7F4EE] p-6 rounded-2xl border border-[#ECE6DC] hover:border-[#B89B7D]/40 transition-all duration-300 shadow-editorial flex flex-col justify-between space-y-4 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F9F5F0] text-[#7A5E43] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4 text-[#B89B7D]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#7A5E43] uppercase tracking-wider block">
                  Biblioteca
                </span>
                <h4 className="text-base font-serif font-bold text-[#1C1B1A] group-hover:text-[#7A5E43]">
                  Guía de Activos
                </h4>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Fichas técnicas con pH óptimo, compatibilidades y evidencia PubMed.
                </p>
              </div>
              <div className="text-xs font-bold text-[#7A5E43] flex items-center gap-1">
                <span>Ver biblioteca</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Módulo Skin Cycling */}
            <Link
              href="/rutinas/skin-cycling"
              className="bg-[#FFFFFF] hover:bg-[#F7F4EE] p-6 rounded-2xl border border-[#ECE6DC] hover:border-[#6B8B7B]/40 transition-all duration-300 shadow-editorial flex flex-col justify-between space-y-4 group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EEF4F0] text-[#364B40] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4 text-[#6B8B7B]" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-wider block">
                  Protocolo
                </span>
                <h4 className="text-base font-serif font-bold text-[#1C1B1A] group-hover:text-[#364B40]">
                  Skin Cycling Guiado
                </h4>
                <p className="text-xs text-[#66615C] leading-relaxed">
                  Configura tu ciclo personalizado según tu tolerancia y tipo de piel.
                </p>
              </div>
              <div className="text-xs font-bold text-[#364B40] flex items-center gap-1">
                <span>Configurar ciclo</span>
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

