import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FormulaAuditor from '@/components/FormulaAuditor';
import { 
  Sparkles, 
  Database, 
  FileText, 
  Layers, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowRight,
  Droplets,
  HeartPulse
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allabout.skin — Asesoría & Fórmulas de Skincare Inteligente',
  description: 'Guía de formulación cosmética, compatibilidad de ingredientes y seguimiento de Skin Cycling.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#2B2A29] selection:bg-[#E8D5D0] selection:text-[#2B2A29]">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-7">
        
        {/* TOP MOBILE-FIRST CARD: MI PERFIL DE CICLADO CUTÁNEO */}
        <section className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-7 border border-[#EFECE6] shadow-beauty relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EFF5F1] border border-[#7A9A8B]/30 flex items-center justify-center text-[#4F6D60] shadow-xs text-xl font-serif">
                ✨
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                  Perfil de Cuidado Diario
                </span>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2A29] leading-snug">
                  Mi Ritual de Ciclado Cutáneo
                </h1>
                <p className="text-xs text-[#6E6A66] mt-0.5">
                  Armonía de activos y renovación celular progresiva
                </p>
              </div>
            </div>

            <Link
              href="/rutinas/skin-cycling"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#4F6D60] hover:text-[#2B2A29] bg-[#EFF5F1] hover:bg-[#E2ECE5] px-4 py-2 rounded-full border border-[#7A9A8B]/20 transition-all duration-200"
            >
              <span>Personalizar Protocolo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* TWO QUICK STAT CAPSULES: TU BIOTIPO & ESTADO DE BARRERA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 pt-4 border-t border-[#EFECE6]">
            {/* TU BIOTIPO */}
            <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EFECE6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9790] block">
                  Biotipo Cutáneo
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="bg-[#EFF5F1] text-[#4F6D60] text-xs font-semibold px-3 py-0.5 rounded-full border border-[#7A9A8B]/30">
                    Piel Mixta
                  </span>
                  <span className="bg-[#F8EFEA] text-[#A46864] text-xs font-semibold px-3 py-0.5 rounded-full border border-[#E8D5D0]">
                    Sensible
                  </span>
                </div>
              </div>
              <Link
                href="/rutinas/skin-cycling"
                className="text-[11px] font-bold text-[#7A9A8B] hover:text-[#4F6D60] hover:underline flex items-center gap-0.5 touch-target"
              >
                <span>Ajustar</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ESTADO DE BARRERA */}
            <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EFECE6] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9790] block">
                  Estado de Barrera
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7A9A8B] animate-pulse" />
                  <span className="text-xs font-bold text-[#4F6D60]">
                    Saludable y Óptima
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[#6E6A66] bg-[#FFFFFF] px-2.5 py-1 rounded-full border border-[#EFECE6] font-semibold">
                Tolerancia Alta
              </div>
            </div>
          </div>
        </section>

        {/* HERO CARD: PRÓXIMA NOCHE (SKIN CYCLING TONIGHT'S PHASE - BEAUTY SAGE PALETTE) */}
        <section className="bg-gradient-to-br from-[#4F6D60] via-[#5A796B] to-[#3D554A] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-beauty relative overflow-hidden space-y-4">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#FFFFFF]/20 text-[#FDFBF7] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                  Próxima Noche • Fase 3
                </span>
                <span className="text-xs text-[#E8D5D0]">
                  Hoy en tu ciclo
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                Noche 3: Reparación & Nutrición de Barrera
              </h2>
              <p className="text-xs text-[#FDFBF7]/90 leading-relaxed">
                Hidratación calmante y lípidos biomiméticos para sellar la humedad, dando descanso a la piel sin exfoliantes ni retinoides.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/mi-rutina"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FDFBF7] hover:bg-white text-[#4F6D60] font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-target"
              >
                <CalendarIcon className="w-4 h-4 text-[#7A9A8B]" />
                <span>Ver Mi Calendario</span>
              </Link>
            </div>
          </div>

          {/* ACTIVE INGREDIENTS FOR TONIGHT */}
          <div className="relative z-10 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#E8D5D0] mr-1">
              Activos Clave Recomendados:
            </span>
            <span className="bg-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              🧴 Ceramidas NP/AP/EOP
            </span>
            <span className="bg-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              🌿 Centella Asiática (Cica)
            </span>
            <span className="bg-white/15 text-white text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
              💧 Ácido Hialurónico
            </span>
          </div>

          {/* Decorative Glow Elements */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#A3B899]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#E8D5D0]/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* SECTION: TUS ACTIVOS Y PRODUCTOS ASIGNADOS */}
        <section className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-7 border border-[#EFECE6] shadow-beauty space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Fórmulas Verificadas
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#2B2A29]">
                Tus Productos Asignados para Esta Fase
              </h3>
            </div>
            <Link
              href="/mi-rutina"
              className="text-xs font-semibold text-[#7A9A8B] hover:text-[#4F6D60] hover:underline flex items-center gap-1 touch-target"
            >
              <span>Editar rutina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6] flex items-center gap-3.5 hover:border-[#7A9A8B]/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-xl shrink-0 shadow-xs">
                🧴
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2B2A29] block truncate">
                  Cicaplast B5+ Baume
                </span>
                <span className="text-[11px] text-[#6E6A66] block">
                  La Roche-Posay • Reparador
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6] flex items-center gap-3.5 hover:border-[#7A9A8B]/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-xl shrink-0 shadow-xs">
                💧
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate">
                  100% Plant-Derived Squalane
                </span>
                <span className="text-[11px] text-[#6E6A66] block">
                  The Ordinary • Hidratante
                </span>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EFECE6] flex items-center gap-3.5 hover:border-[#7A9A8B]/30 transition-all duration-200">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EFECE6] flex items-center justify-center text-xl shrink-0 shadow-xs">
                ✨
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate">
                  Ceramide Moisturizer
                </span>
                <span className="text-[11px] text-[#6E6A66] block">
                  Paula&apos;s Choice • Barrera
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: AUDITOR CIENTÍFICO Y ESCÁNER DE FÓRMULAS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Evaluador de Fórmulas
              </span>
              <h3 className="text-xl font-serif font-bold text-[#2B2A29]">
                Audita Cualquier Cosmético al Instante
              </h3>
            </div>
            <span className="text-xs text-[#9C9790] hidden sm:block">
              Respaldo botánico & CosIng UE
            </span>
          </div>

          <FormulaAuditor />
        </section>

        {/* SECTION: BIBLIOTECA DE ACTIVOS COSMÉTICOS (ESTÉTICA EDITORIAL BEAUTY) */}
        <section className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
          <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-widest block">
                Guía Botánica & Clínica
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2A29]">
                Biblioteca de Activos Cosméticos
              </h3>
              <p className="text-xs text-[#6E6A66] mt-0.5">
                Fichas de acción tópica, pH de formulación y compatibilidad.
              </p>
            </div>
            <Link
              href="/ingrediente"
              className="text-xs font-bold text-[#7A9A8B] hover:text-[#4F6D60] hover:underline flex items-center gap-1 touch-target"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-left">
            <Link
              href="/ingrediente/niacinamide"
              className="bg-gradient-to-b from-[#EFF5F1]/80 to-[#FAF8F5] hover:to-[#EFF5F1] p-4 rounded-3xl border border-[#EFECE6] hover:border-[#7A9A8B]/40 transition-all duration-300 flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#7A9A8B]/30 flex items-center justify-center text-[#4F6D60] group-hover:scale-105 transition-transform">
                <Database className="w-4 h-4 text-[#7A9A8B]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7A9A8B] uppercase tracking-wider block">
                  Regulador
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#4F6D60]">
                  Niacinamida
                </h4>
                <p className="text-[11px] text-[#6E6A66] mt-0.5">Poros y Barrera</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/retinol"
              className="bg-gradient-to-b from-[#F8EFEA]/80 to-[#FAF8F5] hover:to-[#F8EFEA] p-4 rounded-3xl border border-[#EFECE6] hover:border-[#E8D5D0] transition-all duration-300 flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E8D5D0] flex items-center justify-center text-[#A46864] group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4 text-[#A46864]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#A46864] uppercase tracking-wider block">
                  Renovación
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#A46864]">
                  Retinol
                </h4>
                <p className="text-[11px] text-[#6E6A66] mt-0.5">Antiedad & Colágeno</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/salicylic-acid"
              className="bg-gradient-to-b from-[#FAF8F5] to-[#F7F2EB] hover:to-[#F2ECE0] p-4 rounded-3xl border border-[#EFECE6] hover:border-[#C4A482]/40 transition-all duration-300 flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#C4A482]/30 flex items-center justify-center text-[#8F7253] group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-[#C4A482]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8F7253] uppercase tracking-wider block">
                  Exfoliante
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#8F7253]">
                  Ácido Salicílico
                </h4>
                <p className="text-[11px] text-[#6E6A66] mt-0.5">BHA & Puntos Negros</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/hyaluronic-acid"
              className="bg-gradient-to-b from-[#EFF5F1]/80 to-[#FAF8F5] hover:to-[#EFF5F1] p-4 rounded-3xl border border-[#EFECE6] hover:border-[#7A9A8B]/40 transition-all duration-300 flex flex-col justify-between space-y-3 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#7A9A8B]/30 flex items-center justify-center text-[#4F6D60] group-hover:scale-105 transition-transform">
                <Droplets className="w-4 h-4 text-[#7A9A8B]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#7A9A8B] uppercase tracking-wider block">
                  Humectante
                </span>
                <h4 className="text-sm font-serif font-bold text-[#2B2A29] group-hover:text-[#4F6D60]">
                  Ácido Hialurónico
                </h4>
                <p className="text-[11px] text-[#6E6A66] mt-0.5">Hidratación Profunda</p>
              </div>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

