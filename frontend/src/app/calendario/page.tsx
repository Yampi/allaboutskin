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
  Circle,
  Lightbulb,
  ArrowRight,
  Droplets,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';

export default function CalendarioPage() {
  const { userProfile, completeNightRitual } = useSkincare();

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

  return (
    <div className="w-full min-h-screen bg-[#FAFAF7] text-[#2D2825] py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================= */}
        {/* HEADER & SELECTOR DE MES (MOCKUP VISTA 4)                 */}
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

          {/* Selector de Mes */}
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
                      Día {selectedDay.phaseNum} de tu ciclo
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
                    Limpiador suave
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
                    Sérum retinoide
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
                    Hidratante ligera
                  </span>
                </div>
                <span className="text-[10px] text-[#7E756F]">Paso 3 (Sellado)</span>
              </div>

              <div
                onClick={() => toggleStep('step-4')}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  completedSteps['step-4'] ? 'bg-amber-50/50 border-amber-200' : 'bg-[#FAF8F5] border-[#E8E1D7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                    completedSteps['step-4'] ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {completedSteps['step-4'] && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-xs font-semibold text-amber-900">
                    Evita ácidos y vitamina C
                  </span>
                </div>
                <span className="text-[10px] text-amber-700 font-bold">Regla clínica</span>
              </div>

            </div>

            <Link
              href="/dashboard/usuario"
              className="w-full py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Ver detalles de la rutina</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Columna Derecha: Tarjeta 2 (Tu progreso) + Tarjeta 3 (Últimos 7 días) (lg:col-span-6) */}
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

            {/* Tarjeta 3: Últimos 7 días */}
            <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
                <span className="text-xs font-bold text-[#2D2825]">
                  Últimos 7 días
                </span>
                <span className="text-[11px] text-[#2E7D5B] font-semibold bg-[#E6F4EC] px-2 py-0.5 rounded-full">
                  Semana 3
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D7]">
                  <span className="text-[10px] text-[#7E756F] font-bold uppercase block">
                    Adherencia
                  </span>
                  <span className="text-xl font-extrabold text-[#2E7D5B] mt-0.5 block">
                    86%
                  </span>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D7]">
                  <span className="text-[10px] text-[#7E756F] font-bold uppercase block">
                    Resultado esperado
                  </span>
                  <span className="text-xl font-extrabold text-[#2D2825] mt-0.5 block">
                    80%
                  </span>
                </div>
              </div>

              {/* Indicador de píldoras diarias */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-[#7E756F]">
                  <span>Cumplimiento por jornada</span>
                  <span className="font-semibold text-[#2E7D5B]">6 de 7 noches</span>
                </div>
                <div className="flex items-center gap-1.5 h-3">
                  {[true, true, true, false, true, true, true].map((done, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-full rounded-full ${done ? 'bg-[#2E7D5B]' : 'bg-[#E8E1D7]'}`}
                      title={`Día ${i + 1}: ${done ? 'Completado' : 'Pendiente'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-xs text-[#2E7D5B] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />
                <span>Mejora en textura y luminosidad confirmada</span>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* TARJETA INFERIOR: CONSEJO DE HOY                         */}
        {/* ========================================================= */}
        <div className="bg-[#FAF8F5] border border-[#E8E1D7] rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#2D2825]">
              Consejo de hoy
            </h4>
            <p className="text-xs text-[#5D6B63] leading-relaxed font-normal">
              La constancia es la clave. Tu piel necesita entre 4 y 6 semanas para mostrar cambios visibles a nivel celular durante la renovación con retinoides.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
