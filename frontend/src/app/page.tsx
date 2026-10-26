import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Scan, Calendar, ShieldCheck, TrendingUp } from 'lucide-react';
import LandingStores from '@/components/home/landing/LandingStores';

const BADGES = [
  { icon: Scan, text: 'Análisis de piel con IA' },
  { icon: Calendar, text: 'Rutina personalizada (Skin Cycling)' },
  { icon: ShieldCheck, text: 'Productos verificados (INCI)' },
];

const STEPS = [
  { icon: Scan, tone: 'bg-[#E6F4EC] text-[#2E7D5B]', title: '1. Analiza', href: '/escaner', text: 'Escanea tu piel o completa tu perfil para conocer tu biotipo, necesidades y estado actual.' },
  { icon: Calendar, tone: 'bg-rose-50 text-rose-600', title: '2. Personaliza', href: '/calendario', text: 'Recibe tu rutina de 4 noches (Skin Cycling) con productos compatibles y recomendaciones específicas.' },
  { icon: ShieldCheck, tone: 'bg-sky-50 text-sky-600', title: '3. Cuida', href: '/dashboard/usuario', text: 'Sigue tu progreso y evita incompatibilidades entre ingredientes.' },
  { icon: TrendingUp, tone: 'bg-amber-50 text-amber-600', title: '4. Mejora', href: '/mi-rutina', text: 'Ajusta tu rutina según tus resultados y la evidencia disponible.' },
];

export default function LandingPage() {
  return (
    <div className="w-full bg-[#FAFAF7] text-[#2D2825] overflow-hidden">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="absolute top-12 right-6 w-96 h-96 lg:w-[540px] lg:h-[540px] bg-[#E6F4EC]/60 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ciencia real para tu piel</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.12]">
              Tu piel merece <br className="hidden sm:inline" />
              <span className="text-[#2E7D5B]">más que marketing.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#5D6B63] leading-relaxed max-w-xl">
              En Allabout.skin combinamos ciencia dermatológica, inteligencia artificial y productos reales para que tomes decisiones informadas sobre tu piel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/escaner"
              className="px-7 py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2.5 group"
            >
              <Scan className="w-4 h-4 text-emerald-200" />
              <span>Escanear Rostro o Producto (IA)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              href="/mi-rutina"
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#F2ECE4] border border-[#E8E1D7] font-bold text-sm transition flex items-center gap-2.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Ver mi rutina</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8E1D7]">
            {BADGES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs font-semibold bg-white p-2.5 rounded-2xl border border-[#E8E1D7]">
                <div className="w-7 h-7 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-[#E8E1D7]">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Tu piel, paso a paso</h2>
          <p className="text-sm sm:text-base text-[#5D6B63] leading-relaxed">
            Tecnología y ciencia trabajando para ti, desde el análisis hasta la rutina.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon: Icon, tone, title, href, text }) => (
            <div key={title} className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-[13px] text-[#5D6B63] leading-relaxed">{text}</p>
              </div>
              <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] group-hover:gap-2.5 transition">
                <span>Saber más</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <LandingStores />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#1B3D32] text-white rounded-[36px] p-8 sm:p-12 text-center space-y-4">
          <p className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider">Tu piel. Nuestra ciencia.</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Empieza auditando un producto</h3>
          <p className="text-sm text-[#A4B5AC] max-w-xl mx-auto">
            Escanea la lista de ingredientes y revisa la evidencia detrás de cada activo.
          </p>
          <Link
            href="/escaner"
            className="inline-flex px-6 py-3 rounded-full bg-[#2E7D5B] hover:bg-[#246448] font-bold text-sm transition"
          >
            Ir al escáner
          </Link>
        </div>
      </section>
    </div>
  );
}
