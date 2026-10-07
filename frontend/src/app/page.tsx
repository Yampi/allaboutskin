'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  Play,
  Scan,
  Calendar,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Check,
  Star,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Apple,
  ShoppingBag,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="w-full bg-[#FAFAF7] text-[#2D2825] overflow-hidden">
      
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:pt-14 lg:pb-24">
        
        {/* Subtle decorative background organic shape */}
        <div className="absolute top-12 right-6 w-96 h-96 lg:w-[540px] lg:h-[540px] bg-[#E6F4EC]/60 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Mensaje principal y CTAs */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ciencia real para tu piel</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#2D2825] tracking-tight leading-[1.12]">
                Tu piel merece <br className="hidden sm:inline" />
                <span className="text-[#2E7D5B]">más que marketing.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#5D6B63] leading-relaxed max-w-xl font-normal">
                En Allabout.skin combinamos ciencia dermatológica, inteligencia artificial y productos reales para que tomes decisiones informadas sobre tu piel.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/escaner"
                className="px-7 py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2.5 group cursor-pointer"
              >
                <span>Comienza ahora</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <a
                href="#como-funciona"
                className="px-6 py-3.5 rounded-full bg-white hover:bg-[#F2ECE4] border border-[#E8E1D7] text-[#2D2825] font-bold text-sm shadow-2xs transition flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#E6F4EC] flex items-center justify-center text-[#2E7D5B]">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <span>Ver cómo funciona</span>
              </a>
            </div>

            {/* 3 Badges de confianza en fila */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E8E1D7]">
              <div className="flex items-center gap-2.5 text-xs text-[#2D2825] font-semibold bg-white p-2.5 rounded-2xl border border-[#E8E1D7] shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center shrink-0">
                  <Scan className="w-3.5 h-3.5" />
                </div>
                <span>Análisis de piel con IA</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#2D2825] font-semibold bg-white p-2.5 rounded-2xl border border-[#E8E1D7] shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Rutina personalizada (Skin Cycling)</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-[#2D2825] font-semibold bg-white p-2.5 rounded-2xl border border-[#E8E1D7] shadow-2xs">
                <div className="w-7 h-7 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Productos verificados (INCI)</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Mockup Visual con Foto y Cards Flotantes */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Foto de rostro limpio con contenedor redondeado */}
            <div className="relative w-full max-w-md aspect-4/5 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-tr from-[#E6F4EC] to-[#F5EBE1]">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
                alt="Salud de la piel dermatológica"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Card Flotante 1: Salud de la piel (Radial Gauge 78/100) */}
            <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-[#E8E1D7] rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in slide-in-from-left-4 duration-500 max-w-[170px]">
              <span className="text-[11px] font-bold text-[#7E756F] block">
                Tu salud de piel
              </span>
              <div className="flex flex-col items-center justify-center py-1">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E6F4EC]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#2E7D5B]"
                      strokeDasharray="78, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-sm font-extrabold text-[#2D2825] leading-none">
                      78<span className="text-[9px] text-[#7E756F]">/100</span>
                    </span>
                  </div>
                </div>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full">
                  Buena
                </span>
              </div>
            </div>

            {/* Card Flotante 2: Biotipo & Focos Activos */}
            <div className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md border border-[#E8E1D7] rounded-3xl p-4 shadow-xl space-y-2.5 animate-in fade-in slide-in-from-right-4 duration-500 max-w-[210px]">
              <div>
                <span className="text-[11px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  Tu biotipo
                </span>
                <p className="text-xs font-extrabold text-[#2D2825] mt-0.5">
                  Baumann: Tipo 4 • Fototipo III
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8E1D7] space-y-1.5">
                <span className="text-[10px] font-bold text-[#7E756F] uppercase tracking-wider block">
                  Focos activos
                </span>
                <ul className="text-[11px] space-y-1 font-medium text-[#2D2825]">
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>Deshidratación leve</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>Poros dilatados</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>Manchas post-acné</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CÓMO FUNCIONA (4 PASOS)                                */}
      {/* ========================================================= */}
      <section id="como-funciona" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-t border-[#E8E1D7]">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
            <span>Cómo funciona</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2825] tracking-tight">
            Tu piel, paso a paso
          </h2>
          <p className="text-sm sm:text-base text-[#5D6B63] font-normal leading-relaxed">
            Tecnología y ciencia trabajando para ti, desde el análisis hasta la rutina.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Paso 1: Analiza */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                <Scan className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2825]">
                1. Analiza
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5D6B63] leading-relaxed">
                Escanea tu piel o completa tu perfil para conocer tu biotipo, necesidades y estado actual.
              </p>
            </div>
            <Link
              href="/escaner"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] group-hover:gap-2.5 transition"
            >
              <span>Saber más</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Paso 2: Personaliza */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2825]">
                2. Personaliza
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5D6B63] leading-relaxed">
                Recibe tu rutina de 4 noches (Skin Cycling) con productos compatibles y recomendaciones específicas.
              </p>
            </div>
            <Link
              href="/calendario"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] group-hover:gap-2.5 transition"
            >
              <span>Saber más</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Paso 3: Cuida */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2825]">
                3. Cuida
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5D6B63] leading-relaxed">
                Sigue tu progreso, recibe alertas de PAO y reabastecimiento, y evita incompatibilidades moleculares.
              </p>
            </div>
            <Link
              href="/dashboard/usuario"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] group-hover:gap-2.5 transition"
            >
              <span>Saber más</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Paso 4: Mejora */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition shadow-2xs">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#2D2825]">
                4. Mejora
              </h3>
              <p className="text-xs sm:text-[13px] text-[#5D6B63] leading-relaxed">
                Tu piel evoluciona. Nuestra IA analiza tus resultados y ajusta la rutina para mejores resultados clínicos.
              </p>
            </div>
            <Link
              href="/mi-rutina"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] group-hover:gap-2.5 transition"
            >
              <span>Saber más</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. PRODUCTOS Y TIENDAS (BENEFICIO COMERCIAL)              */}
      {/* ========================================================= */}
      <section className="bg-[#E6F4EC]/40 border-y border-[#D5E2DB] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Texto y CTA */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Productos y tiendas</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2825] tracking-tight leading-tight">
                Lo que necesitas, <br />
                <span className="text-[#2E7D5B]">cerca de ti</span>
              </h2>

              <p className="text-sm sm:text-base text-[#5D6B63] leading-relaxed font-normal">
                Encuentra tus productos en farmacias y tiendas de confianza en tu ciudad, al mejor precio y con stock en tiempo real.
              </p>

              <div>
                <Link
                  href="/tiendas"
                  className="px-6 py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2 group cursor-pointer"
                >
                  <span>Explorar tiendas</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            {/* Mockup Interactivo de Producto + Tiendas Cercanas */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card de Producto CeraVe */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-lg flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-center p-4 bg-[#FAF8F5] rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80"
                    alt="CeraVe Loción Hidratante"
                    className="h-32 object-contain"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E756F]">
                      CeraVe
                    </span>
                    <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" />
                      89% Compatible
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2D2825]">
                    Loción Hidratante
                  </h4>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-base font-extrabold text-[#2E7D5B]">
                      $12.50
                    </span>
                    <span className="text-xs text-[#7E756F]">
                      | Bs 652,50
                    </span>
                  </div>
                </div>

                <Link
                  href="/tiendas"
                  className="w-full py-2.5 rounded-xl bg-[#2E7D5B] hover:bg-[#246448] text-white text-xs font-bold text-center transition block shadow-2xs"
                >
                  Ver en tienda
                </Link>
              </div>

              {/* Card de Tiendas Cercanas */}
              <div className="bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-lg flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-[#2D2825] block mb-3">
                    Tiendas cercanas con stock
                  </span>
                  
                  <div className="space-y-2.5">
                    
                    {/* Tienda 1: Farmatodo */}
                    <Link
                      href="/tiendas"
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E8E1D7] transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          F
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#2D2825] block group-hover:text-[#2E7D5B] transition">
                            Farmatodo
                          </span>
                          <span className="text-[10px] text-[#7E756F]">
                            2.1 km • <span className="text-[#2E7D5B] font-semibold">En stock</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7E756F] group-hover:translate-x-0.5 transition" />
                    </Link>

                    {/* Tienda 2: Locatel */}
                    <Link
                      href="/tiendas"
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E8E1D7] transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          L
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#2D2825] block group-hover:text-[#2E7D5B] transition">
                            Locatel
                          </span>
                          <span className="text-[10px] text-[#7E756F]">
                            3.1 km • <span className="text-[#2E7D5B] font-semibold">En stock</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7E756F] group-hover:translate-x-0.5 transition" />
                    </Link>

                    {/* Tienda 3: Río */}
                    <Link
                      href="/tiendas"
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E8E1D7] transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          R
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#2D2825] block group-hover:text-[#2E7D5B] transition">
                            Río Supermarket
                          </span>
                          <span className="text-[10px] text-[#7E756F]">
                            4.2 km • <span className="text-[#2E7D5B] font-semibold">En stock</span>
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#7E756F] group-hover:translate-x-0.5 transition" />
                    </Link>

                  </div>
                </div>

                <div className="p-3 bg-[#E6F4EC] rounded-2xl border border-[#D5E2DB] text-[11px] text-[#2E7D5B] font-semibold text-center">
                  Tasa oficial sincronizada en tiempo real
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. TESTIMONIOS (SOCIAL PROOF)                             */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
            <span>Testimonios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2825] tracking-tight">
            Historias reales, resultados reales
          </h2>
          <p className="text-sm sm:text-base text-[#5D6B63] font-normal leading-relaxed">
            Miles de personas ya están cuidando su piel con Allabout.skin.
          </p>
        </div>

        {/* 3 Cards de Testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Testimonio 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm flex flex-col justify-between space-y-6">
            <p className="text-sm text-[#5D6B63] leading-relaxed italic">
              "Por fin una app que realmente entiende mi piel. Mi acné ha mejorado mucho y la rutina es súper fácil de seguir."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-[#E8E1D7]">
              <div className="w-10 h-10 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-sm flex items-center justify-center shrink-0">
                LG
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-[#2D2825] block">
                  Laura G.
                </span>
                <span className="text-[10px] text-[#7E756F] block">
                  Usuario Premium
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonio 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm flex flex-col justify-between space-y-6">
            <p className="text-sm text-[#5D6B63] leading-relaxed italic">
              "La información es muy completa y confiable. Me encanta poder ver dónde comprar mis productos cerca y al precio correcto."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-[#E8E1D7]">
              <div className="w-10 h-10 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-sm flex items-center justify-center shrink-0">
                CM
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-[#2D2825] block">
                  Carlos M.
                </span>
                <span className="text-[10px] text-[#7E756F] block">
                  Usuario Estándar
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonio 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm flex flex-col justify-between space-y-6">
            <p className="text-sm text-[#5D6B63] leading-relaxed italic">
              "La IA me alertó sobre una incompatibilidad que no había notado. Gracias a eso evité irritación severa en mi barrera cutánea."
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-[#E8E1D7]">
              <div className="w-10 h-10 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-sm flex items-center justify-center shrink-0">
                VR
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-[#2D2825] block">
                  Valentina R.
                </span>
                <span className="text-[10px] text-[#7E756F] block">
                  Usuario Premium
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. CTA FINAL (BANNER VERDE OSCURO MOCKUP)                 */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-[#1B3D32] text-white rounded-[36px] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-xl text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                allabout<span className="text-[#8FA89B]">.skin</span>
              </span>
            </div>

            <p className="text-sm font-semibold text-[#8FA89B] uppercase tracking-wider">
              Tu piel. Nuestra ciencia.
            </p>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Descarga la app y comienza hoy
            </h3>

            <p className="text-xs sm:text-sm text-[#A4B5AC] leading-relaxed">
              Lleva tu tocador clínico digital en el bolsillo, con alertas de ingredientes y compras geolocalizadas.
            </p>

            {/* Badges de App Store y Google Play */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2.5 transition"
              >
                <Apple className="w-4 h-4" />
                <div className="text-left leading-tight">
                  <span className="text-[9px] block text-[#A4B5AC]">Disponible en</span>
                  <span className="text-xs font-bold block">App Store</span>
                </div>
              </button>

              <button
                type="button"
                className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold flex items-center gap-2.5 transition"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  ▶
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[9px] block text-[#A4B5AC]">Disponible en</span>
                  <span className="text-xs font-bold block">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mini Mockup Visual de Smartphone */}
          <div className="w-48 sm:w-56 bg-white/10 p-3 rounded-[32px] border border-white/20 shadow-2xl shrink-0 backdrop-blur-sm">
            <div className="bg-white text-[#2D2825] rounded-[24px] p-4 text-center space-y-2">
              <span className="text-[10px] font-bold text-[#7E756F] uppercase tracking-wider block">
                Salud de la piel
              </span>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E6F4EC] border-2 border-[#2E7D5B] flex items-center justify-center text-sm font-extrabold text-[#2E7D5B]">
                78/100
              </div>
              <span className="text-[9px] font-bold uppercase text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full inline-block">
                Buena
              </span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
