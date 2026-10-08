'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sparkles,
  Flame,
  CheckCircle2,
  Check,
  ArrowRight,
  Droplets,
  Package,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import { useSkincare } from '@/context/SkincareContext';

export default function CalendarioSkinCyclingPage() {
  const { userProfile } = useSkincare();

  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Lunes = 0, Domingo = 6
  const [selectedDayIndex, setSelectedDayIndex] = useState(dayOfWeek);
  
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'step-1': true,
    'step-2': true,
    'step-3': false,
    'step-4': true,
  });

  const currentMonthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const capitalizedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  // Generar los 7 días de la semana actual
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);

  const phaseNames = ['Exfoliación', 'Retinoide', 'Recuperación', 'Recuperación'];
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const weekDays = dayNames.map((name, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const phaseIdx = i % 4;
    const phaseNum = phaseIdx + 1;
    const isToday = d.toDateString() === now.toDateString();
    return {
      dayName: name,
      date: d.getDate().toString(),
      phaseNum,
      phaseLabel: phaseNames[phaseIdx],
      isToday,
      bgBadge: phaseNum === 1 ? 'bg-rose-100 text-rose-800' : phaseNum === 2 ? 'bg-sky-100 text-sky-800' : 'bg-[#E6F4EC] text-[#2E7D5B]',
    };
  });

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const selectedDay = weekDays[selectedDayIndex] || weekDays[0];

  // Productos asignados según la fase del ciclo con niveles de envase estimados
  const phaseProducts: Record<number, Array<{
    name: string;
    brand: string;
    category: string;
    bottleLevel: number;
    daysLeft: number;
    volumeLeft: string;
    warning?: boolean;
  }>> = {
    1: [
      { name: 'Gel Limpiador Suave', brand: 'CeraVe', category: 'Limpiador', bottleLevel: 80, daysLeft: 45, volumeLeft: '160 ml' },
      { name: 'Ácido Salicílico 2% BHA', brand: 'Paula\'s Choice', category: 'Exfoliante químico', bottleLevel: 55, daysLeft: 30, volumeLeft: '65 ml' },
      { name: 'Hidratante Barrera Ligera', brand: 'CeraVe', category: 'Hidratante', bottleLevel: 70, daysLeft: 40, volumeLeft: '40 ml' },
    ],
    2: [
      { name: 'Gel Limpiador Suave', brand: 'CeraVe', category: 'Limpiador', bottleLevel: 80, daysLeft: 45, volumeLeft: '160 ml' },
      { name: 'Granactive Retinoid 2%', brand: 'The Ordinary', category: 'Sérum retinoide', bottleLevel: 35, daysLeft: 18, volumeLeft: '10 ml', warning: true },
      { name: 'Cicaplast Baume B5+', brand: 'La Roche-Posay', category: 'Bálsamo reparador', bottleLevel: 65, daysLeft: 32, volumeLeft: '26 ml' },
    ],
    3: [
      { name: 'Limpiador Facial Syndet', brand: 'CeraVe', category: 'Limpiador', bottleLevel: 80, daysLeft: 45, volumeLeft: '160 ml' },
      { name: 'Sérum Ácido Hialurónico 2%', brand: 'The Ordinary', category: 'Sérum hidratante', bottleLevel: 60, daysLeft: 35, volumeLeft: '18 ml' },
      { name: 'Crema Hidratante con Ceramidas', brand: 'CeraVe', category: 'Hidratante barrera', bottleLevel: 75, daysLeft: 42, volumeLeft: '120 ml' },
    ],
    4: [
      { name: 'Limpiador Facial Syndet', brand: 'CeraVe', category: 'Limpiador', bottleLevel: 80, daysLeft: 45, volumeLeft: '160 ml' },
      { name: 'Sérum Calmante Centella Asiatica', brand: 'Skin1004', category: 'Ampolla calmante', bottleLevel: 50, daysLeft: 28, volumeLeft: '25 ml' },
      { name: 'Crema Hidratante con Ceramidas', brand: 'CeraVe', category: 'Hidratante barrera', bottleLevel: 75, daysLeft: 42, volumeLeft: '120 ml' },
    ],
  };

  const currentPhaseProducts = phaseProducts[selectedDay.phaseNum] || phaseProducts[2];

  return (
    <UserAppShell activeNavId="calendario">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
        
        {/* ========================================================= */}
        {/* HEADER & SELECTOR DE MES                                  */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#D5E2DB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Protocolo Fisiológico 4 Noches</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Tu calendario de Skin Cycling
            </h1>
            <p className="text-xs sm:text-sm text-[#5D6B63] mt-0.5">
              Sigue tu protocolo de 4 noches para una piel más sana, protegida y equilibrada.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8E1D7] shadow-2xs self-start md:self-auto">
            <button
              type="button"
              className="p-1 rounded-lg text-[#7E756F] hover:text-[#2D2825] hover:bg-[#FAF8F5] transition"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-[#2D2825] px-2 min-w-[90px] text-center">
              {capitalizedMonth}
            </span>
            <button
              type="button"
              className="p-1 rounded-lg text-[#7E756F] hover:text-[#2D2825] hover:bg-[#FAF8F5] transition"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BARRA SEMANAL DE 7 DÍAS CON CÍRCULOS DE FASE              */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E1D7] shadow-sm">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {weekDays.map((d, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`flex flex-col items-center p-2.5 sm:p-4 rounded-2xl transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#E6F4EC]/60 border-[#2E7D5B] shadow-xs'
                      : 'border-transparent hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs text-[#7E756F] font-medium">
                    {d.dayName}
                  </span>
                  <span className="text-base sm:text-xl font-extrabold text-[#2D2825] mt-0.5">
                    {d.date}
                  </span>
                  
                  {/* Círculo con número de fase */}
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm my-2 shadow-2xs ${
                    d.phaseNum === 1
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : d.phaseNum === 2
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB]'
                  }`}>
                    {d.phaseNum}
                  </div>

                  <span className="text-[9px] sm:text-[11px] font-semibold text-[#5D6B63] truncate max-w-full">
                    {d.phaseLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* GRID DE DETALLE: ESTA NOCHE + PROGRESO + ÚLTIMOS 7 DÍAS   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tarjeta 1: Esta noche (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-sm space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#2D2825]">
                      Esta noche: {selectedDay.phaseLabel}
                    </h2>
                    <span className="text-xs text-[#7E756F] font-medium">
                      Día {selectedDay.phaseNum} de tu ciclo de 4 noches
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EC] px-3 py-1 rounded-full border border-[#D5E2DB]">
                Hoy
              </span>
            </div>

            {/* Checklist interactivo de pasos */}
            <div className="space-y-3 pt-2">
              <div
                onClick={() => toggleStep('step-1')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  completedSteps['step-1'] ? 'bg-[#E6F4EC]/40 border-[#D5E2DB]' : 'bg-[#FAF8F5] border-[#E8E1D7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    completedSteps['step-1'] ? 'bg-[#2E7D5B] border-[#2E7D5B] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {completedSteps['step-1'] && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs font-semibold ${completedSteps['step-1'] ? 'text-[#2D2825]' : 'text-[#7E756F]'}`}>
                    Limpiador suave equilibrante
                  </span>
                </div>
                <span className="text-[10px] text-[#7E756F]">Paso 1</span>
              </div>

              <div
                onClick={() => toggleStep('step-2')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  completedSteps['step-2'] ? 'bg-[#E6F4EC]/40 border-[#D5E2DB]' : 'bg-[#FAF8F5] border-[#E8E1D7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    completedSteps['step-2'] ? 'bg-[#2E7D5B] border-[#2E7D5B] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {completedSteps['step-2'] && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs font-semibold ${completedSteps['step-2'] ? 'text-[#2D2825]' : 'text-[#7E756F]'}`}>
                    {selectedDay.phaseNum === 1 ? 'Exfoliante químico AHA/BHA' : selectedDay.phaseNum === 2 ? 'Sérum retinoide 2%' : 'Sérum hidratante / calmante'}
                  </span>
                </div>
                <span className="text-[10px] text-[#7E756F]">Paso 2 (Activo)</span>
              </div>

              <div
                onClick={() => toggleStep('step-3')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  completedSteps['step-3'] ? 'bg-[#E6F4EC]/40 border-[#D5E2DB]' : 'bg-[#FAF8F5] border-[#E8E1D7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    completedSteps['step-3'] ? 'bg-[#2E7D5B] border-[#2E7D5B] text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {completedSteps['step-3'] && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs font-semibold ${completedSteps['step-3'] ? 'text-[#2D2825]' : 'text-[#7E756F]'}`}>
                    Hidratante reparadora de barrera
                  </span>
                </div>
                <span className="text-[10px] text-[#7E756F]">Paso 3 (Sellado)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">
                  {selectedDay.phaseNum === 2 ? 'Evita ácidos exfoliantes y vitamina C' : 'Sella siempre con ceramidas'}
                </span>
                <span className="text-[10px] text-amber-700 font-bold">Regla clínica</span>
              </div>
            </div>

            {/* SECCIÓN DE PRODUCTOS EN USO CON NIVELES DE ENVASE */}
            <div className="space-y-3 pt-4 border-t border-[#E8E1D7]">
              <span className="text-xs font-bold text-[#2D2825] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#2E7D5B]" />
                <span>Productos en uso y niveles de envase ({selectedDay.phaseLabel})</span>
              </span>

              <div className="space-y-2.5">
                {currentPhaseProducts.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] flex items-center justify-between text-xs gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-[#2D2825] block truncate">
                        {prod.name}
                      </span>
                      <span className="text-[10px] text-[#7E756F]">
                        {prod.brand} • {prod.volumeLeft} restantes (~{prod.daysLeft} días)
                      </span>
                    </div>

                    <div className="w-24 text-right shrink-0">
                      <div className="flex items-center justify-end gap-1 mb-1">
                        <span className={`text-[10px] font-bold ${prod.bottleLevel <= 35 ? 'text-amber-600' : 'text-[#2E7D5B]'}`}>
                          {prod.bottleLevel}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E8E1D7] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${prod.bottleLevel <= 35 ? 'bg-amber-500' : 'bg-[#2E7D5B]'}`}
                          style={{ width: `${prod.bottleLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN VER DETALLES DE LA RUTINA (Lleva a la página explicativa /mi-rutina) */}
            <Link
              href="/mi-rutina"
              className="w-full py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver detalles explicativos de la rutina</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Columna Derecha: Tarjeta 2 (Tu progreso) + Tarjeta 3 (Últimos 7 días - Image 4) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Tarjeta 2: Tu progreso */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">
                  Tu progreso
                </span>
                <h3 className="text-2xl font-extrabold text-[#2D2825]">
                  5/7 días
                </h3>
                <p className="text-xs text-[#5D6B63] flex items-center gap-1 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  <span>Racha actual activa</span>
                </p>
              </div>

              {/* Radial gauge mini */}
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
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
                    strokeDasharray="71, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-xs font-black text-[#2E7D5B]">
                  71%
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* Tarjeta 3: ÚLTIMOS 7 DÍAS (Exacto a Referencia Imagen 4)     */}
            {/* ========================================================= */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D7] shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
                <h3 className="text-base font-extrabold text-[#2D2825]">
                  Últimos 7 días
                </h3>
                <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EC] px-3 py-1 rounded-full border border-[#D5E2DB]">
                  Semana 3
                </span>
              </div>

              {/* Métricas lado a lado: Adherencia 86% vs Esperado 80% */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#E8E1D7] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#66615C] uppercase tracking-wider block">
                    ADHERENCIA
                  </span>
                  <div className="text-3xl font-extrabold text-[#2E7D5B] tracking-tight">
                    86%
                  </div>
                </div>

                <div className="bg-[#FAFAF7] p-4 rounded-2xl border border-[#E8E1D7] space-y-1">
                  <span className="text-[10px] font-extrabold text-[#66615C] uppercase tracking-wider block">
                    RESULTADO ESPERADO
                  </span>
                  <div className="text-3xl font-extrabold text-[#2D2825] tracking-tight">
                    80%
                  </div>
                </div>
              </div>

              {/* Barras de cumplimiento por jornada: 6 de 7 noches */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66615C] font-semibold">
                    Cumplimiento por jornada
                  </span>
                  <span className="font-extrabold text-[#2E7D5B]">
                    6 de 7 noches
                  </span>
                </div>

                {/* 7 barras horizontales redondeadas */}
                <div className="grid grid-cols-7 gap-2">
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 1: Cumplida" />
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 2: Cumplida" />
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 3: Cumplida" />
                  <div className="h-3 rounded-full bg-[#E8E1D7]" title="Noche 4: Descanso" />
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 5: Cumplida" />
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 6: Cumplida" />
                  <div className="h-3 rounded-full bg-[#2E7D5B]" title="Noche 7: Cumplida" />
                </div>
              </div>

              {/* Diagnóstico de mejora confirmado */}
              <div className="flex items-center gap-2 pt-2 text-xs font-bold text-[#2E7D5B]">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />
                <span>Mejora en textura y luminosidad confirmada</span>
              </div>
            </div>

            {/* Consejo clínico */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E8E1D7] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#2E7D5B] mt-0.5 shrink-0" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-[#2D2825] block">Consejo de hoy:</span>
                <p className="text-[#66615C] leading-relaxed">
                  La constancia es la clave en Skin Cycling. Tu piel necesita entre 4 y 6 semanas completas para mostrar cambios celulares visibles sin comprometer la barrera cutánea.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </UserAppShell>
  );
}
