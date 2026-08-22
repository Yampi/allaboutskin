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
  Microscope,
  ShieldCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Allabout.skin — Auditoría Científica y Ciclado Cutáneo',
  description: 'Audita cosméticos con rigor científico CosIng/PubMed y sigue tu protocolo personalizado de Skin Cycling.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F4] text-[#2D2D2D] selection:bg-[#7BB8D0] selection:text-white">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full space-y-7">
        
        {/* TOP MOBILE-FIRST CARD: MI PERFIL DE CICLADO CUTÁNEO */}
        <section className="bg-[#FFFCF9] rounded-3xl p-5 sm:p-6 border border-[#E8E0D8] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C5E3F0] via-[#E8F4FA] to-[#E8C4B8]/40 border border-[#A8D4E6] flex items-center justify-center text-[#2D6680] shadow-inner font-serif font-black text-lg">
                ✨
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider block">
                  Dashboard de Skincare
                </span>
                <h1 className="text-lg sm:text-xl font-bold font-serif text-[#2D2D2D] leading-snug">
                  Mi Perfil de Ciclado Cutáneo
                </h1>
                <p className="text-xs text-[#6B6B6B]">
                  Protocolo adaptativo guiado por evidencia médica
                </p>
              </div>
            </div>

            <Link
              href="/rutinas/skin-cycling"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#3A7A96] hover:text-[#1A4D63] bg-[#E8F4FA] hover:bg-[#C5E3F0] px-3.5 py-2 rounded-xl transition"
            >
              <span>Personalizar Protocolo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* TWO QUICK STAT CAPSULES: TU BIOTIPO & ESTADO DE BARRERA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#F0E8E0]">
            {/* TU BIOTIPO */}
            <div className="bg-[#FAF7F4] rounded-2xl p-3.5 border border-[#E8E0D8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8B8178] block">
                  Tu Biotipo
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#E8F4FA] text-[#2D6680] text-xs font-bold px-2.5 py-0.5 rounded-lg border border-[#A8D4E6]">
                    Piel Mixta
                  </span>
                  <span className="bg-[#F9F2F0] text-[#8B4B3D] text-xs font-bold px-2.5 py-0.5 rounded-lg border border-[#E8C4B8]">
                    Sensible
                  </span>
                </div>
              </div>
              <Link
                href="/rutinas/skin-cycling"
                className="text-[11px] font-bold text-[#3A7A96] hover:underline flex items-center gap-0.5"
              >
                <span>Ajustar</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* ESTADO DE BARRERA */}
            <div className="bg-[#FAF7F4] rounded-2xl p-3.5 border border-[#E8E0D8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#8B8178] block">
                  Estado de Barrera
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black text-emerald-800">
                    Saludable y Óptima
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-[#8B8178] bg-white px-2.5 py-1 rounded-lg border border-[#E8E0D8] font-bold">
                Tolerancia Alta
              </div>
            </div>
          </div>
        </section>

        {/* HERO CARD: PRÓXIMA NOCHE (SKIN CYCLING TONIGHT'S PHASE) */}
        <section className="bg-gradient-to-br from-[#1A4D63] via-[#2D6680] to-[#1A2332] text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden space-y-4">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="bg-[#A8D4E6]/25 text-[#C5E3F0] text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#A8D4E6]/30">
                  Próxima Noche • Fase 3
                </span>
                <span className="text-xs text-[#C5E3F0]/80">
                  Hoy en tu ciclo
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
                Noche 3: Recuperación de Barrera Cutánea
              </h2>
              <p className="text-xs text-[#E8F4FA]/90 leading-relaxed">
                Noche de hidratación profunda y lípidos biomiméticos para sellar la humedad sin exfoliantes ni retinoides.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/mi-rutina"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E8F4FA] hover:bg-white text-[#1A4D63] font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <CalendarIcon className="w-4 h-4 text-[#4A8BA8]" />
                <span>Ver Mi Calendario</span>
              </Link>
            </div>
          </div>

          {/* ACTIVE INGREDIENTS FOR TONIGHT */}
          <div className="relative z-10 pt-3 border-t border-white/15 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#A8D4E6] mr-1">
              Activos Clave Asignados:
            </span>
            <span className="bg-white/10 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl backdrop-blur-sm border border-white/15">
              🧴 Ceramidas NP/AP/EOP
            </span>
            <span className="bg-white/10 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl backdrop-blur-sm border border-white/15">
              🌿 Centella Asiática
            </span>
            <span className="bg-white/10 text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl backdrop-blur-sm border border-white/15">
              💧 Ácido Hialurónico
            </span>
          </div>

          {/* Decorative Glow Elements */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#5FA8C2]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#A8D4E6]/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* SECTION: TUS ACTIVOS Y PRODUCTOS ASIGNADOS */}
        <section className="bg-[#FFFCF9] rounded-3xl p-5 sm:p-6 border border-[#E8E0D8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider block">
                Fórmulas Verificadas
              </span>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#2D2D2D]">
                Tus Productos Asignados para Esta Fase
              </h3>
            </div>
            <Link
              href="/mi-rutina"
              className="text-xs font-semibold text-[#3A7A96] hover:underline flex items-center gap-1"
            >
              <span>Editar rutina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-[#E8E0D8] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D8] flex items-center justify-center text-lg shrink-0 shadow-xs">
                🧴
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate">
                  Cicaplast B5+ Baume
                </span>
                <span className="text-[10px] text-[#8B8178] block">
                  La Roche-Posay • Reparador
                </span>
              </div>
            </div>

            <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-[#E8E0D8] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D8] flex items-center justify-center text-lg shrink-0 shadow-xs">
                💧
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate">
                  100% Plant-Derived Squalane
                </span>
                <span className="text-[10px] text-[#8B8178] block">
                  The Ordinary • Hidratante
                </span>
              </div>
            </div>

            <div className="bg-[#FAF7F4] p-3.5 rounded-2xl border border-[#E8E0D8] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E0D8] flex items-center justify-center text-lg shrink-0 shadow-xs">
                ✨
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate">
                  Ceramide Enriched Moisturizer
                </span>
                <span className="text-[10px] text-[#8B8178] block">
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
              <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider block">
                Auditoría INCI & Escáner
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-[#2D2D2D]">
                Audita Cualquier Cosmético al Instante
              </h3>
            </div>
            <span className="text-xs text-[#8B8178] hidden sm:block">
              Base oficial CosIng UE y PubMed
            </span>
          </div>

          <FormulaAuditor />
        </section>

        {/* SECTION: BIBLIOTECA DE ACTIVOS COSMÉTICOS (ESTÉTICA EDITORIAL) */}
        <section className="bg-[#FFFCF9] rounded-3xl p-6 sm:p-7 border border-[#E8E0D8] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F0E8E0] pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider block">
                Fichas Técnicas Oficiales
              </span>
              <h3 className="text-xl font-bold font-serif text-[#2D2D2D]">
                Biblioteca de Activos Cosméticos
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Fichas de farmacología tópica, pH óptimo y compatibilidad química.
              </p>
            </div>
            <Link
              href="/ingrediente"
              className="text-xs font-bold text-[#3A7A96] hover:text-[#1A4D63] hover:underline flex items-center gap-1"
            >
              <span>Ver catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <Link
              href="/ingrediente/niacinamide"
              className="bg-[#FAF7F4] hover:bg-[#E8F4FA]/60 p-4 rounded-2xl border border-[#E8E0D8] hover:border-[#A8D4E6] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F4FA] border border-[#A8D4E6] flex items-center justify-center text-[#2D6680] group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#3A7A96] uppercase block">
                  Regulador
                </span>
                <h4 className="text-sm font-bold font-serif text-[#2D2D2D] group-hover:text-[#1A4D63]">
                  Niacinamida
                </h4>
                <p className="text-[11px] text-[#8B8178] mt-0.5">Poros y Barrera</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/retinol"
              className="bg-[#FAF7F4] hover:bg-[#F9F2F0] p-4 rounded-2xl border border-[#E8E0D8] hover:border-[#E8C4B8] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F9F2F0] border border-[#E8C4B8] flex items-center justify-center text-[#8B4B3D] group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#8B4B3D] uppercase block">
                  Antiedad
                </span>
                <h4 className="text-sm font-bold font-serif text-[#2D2D2D] group-hover:text-[#1A4D63]">
                  Retinol
                </h4>
                <p className="text-[11px] text-[#8B8178] mt-0.5">Renovación Celular</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/salicylic-acid"
              className="bg-[#FAF7F4] hover:bg-amber-50/60 p-4 rounded-2xl border border-[#E8E0D8] hover:border-amber-200 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase block">
                  Exfoliante
                </span>
                <h4 className="text-sm font-bold font-serif text-[#2D2D2D] group-hover:text-[#1A4D63]">
                  Ácido Salicílico
                </h4>
                <p className="text-[11px] text-[#8B8178] mt-0.5">BHA y Puntos Negros</p>
              </div>
            </Link>

            <Link
              href="/ingrediente/hyaluronic-acid"
              className="bg-[#FAF7F4] hover:bg-[#E8F4FA]/60 p-4 rounded-2xl border border-[#E8E0D8] hover:border-[#A8D4E6] transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8F4FA] border border-[#A8D4E6] flex items-center justify-center text-[#2D6680] group-hover:scale-105 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-[#3A7A96] uppercase block">
                  Humectante
                </span>
                <h4 className="text-sm font-bold font-serif text-[#2D2D2D] group-hover:text-[#1A4D63]">
                  Ácido Hialurónico
                </h4>
                <p className="text-[11px] text-[#8B8178] mt-0.5">Hidratación Celular</p>
              </div>
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
