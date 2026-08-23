'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award,
  AlertTriangle,
  Clock,
  Droplets,
  RotateCw,
  Check
} from 'lucide-react';
import { UserProfile, CyclePhaseData, RoutineStep } from './types';
import { cyclePhasesMatrix } from './skincareData';

interface CycleScreenProps {
  userProfile: UserProfile;
  onCompleteNight: (completedNight: number) => void;
}

export default function CycleScreen({ userProfile, onCompleteNight }: CycleScreenProps) {
  const [activePhaseIndex, setActivePhaseIndex] = useState((userProfile?.activeNight || 1) - 1);
  const [routineSteps, setRoutineSteps] = useState(cyclePhasesMatrix);
  const [celebrationToast, setCelebrationToast] = useState(false);

  // Weekly days data
  const weeklyDays = [
    { dayName: 'Mo', dayNumber: '28', phase: 1, color: '#DFCAAC' },
    { dayName: 'Tu', dayNumber: '29', phase: 2, color: '#D8A899' },
    { dayName: 'We', dayNumber: '30', phase: 3, isToday: true, color: '#8FA89B' },
    { dayName: 'Th', dayNumber: '31', phase: 4, color: '#8FA89B' },
    { dayName: 'Fr', dayNumber: '1', phase: 1, color: '#DFCAAC' },
    { dayName: 'Sa', dayNumber: '2', phase: 2, color: '#D8A899' },
    { dayName: 'Su', dayNumber: '3', phase: 3, color: '#8FA89B' },
  ];

  const currentPhase = routineSteps[activePhaseIndex];

  // Toggle step completion
  const handleToggleStep = (stepId: string) => {
    setRoutineSteps((prev) =>
      prev.map((phase, pIdx) => {
        if (pIdx !== activePhaseIndex) return phase;
        return {
          ...phase,
          steps: phase.steps.map((step) => {
            if (step.id !== stepId) return step;
            return { ...step, completed: !step.completed };
          }),
        };
      })
    );
  };

  // Complete full night
  const handleCompleteFullNight = () => {
    // Mark all steps in this phase completed
    setRoutineSteps((prev) =>
      prev.map((phase, pIdx) => {
        if (pIdx !== activePhaseIndex) return phase;
        return {
          ...phase,
          steps: phase.steps.map((step) => ({ ...step, completed: true })),
        };
      })
    );

    setCelebrationToast(true);
    onCompleteNight(currentPhase.phaseNumber);

    setTimeout(() => {
      setCelebrationToast(false);
      // Advance to next phase index smoothly
      setActivePhaseIndex((prev) => (prev + 1) % 4);
    }, 2200);
  };

  const allCompleted = currentPhase.steps.every((s) => s.completed);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-wider block">
            Skin Cycling Matrix • Régimen 4 Noches Fisiológico
          </span>
          <h1 className="font-serif text-[26px] sm:text-[32px] font-semibold text-[#2D2825] leading-tight">
            Calendario de Ciclado Cutáneo
          </h1>
          <p className="text-[13px] font-sans text-[#7E756F] mt-0.5">
            Optimiza la tolerancia celular alternando noches de exfoliación, retinoides y descanso reparador.
          </p>
        </div>

        {/* Streak & Adherence Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="p-3 rounded-[20px] bg-[#F2ECE4] border border-[#E2D9CD] text-right">
            <span className="text-[10px] uppercase font-bold text-[#7E756F] block">
              Racha de Ciclado
            </span>
            <span className="font-serif text-[18px] font-bold text-[#4A6B5B]">
              {userProfile?.cycleStreakDays || 0} Días Activos
            </span>
          </div>
        </div>
      </div>

      {/* 2. Selector Semanal (Mo, Tu, We, Th, Fr, Sa, Su; día activo #8FA89B) */}
      <div className="card-white p-3.5 sm:p-4 border border-[#E8E1D7] shadow-diffuse rounded-[22px]">
        <div className="grid grid-cols-7 gap-2 text-center max-w-4xl mx-auto">
          {weeklyDays.map((item, idx) => {
            const isSelected = activePhaseIndex === item.phase - 1;
            const isToday = item.isToday;

            return (
              <button
                key={idx}
                onClick={() => setActivePhaseIndex(item.phase - 1)}
                className={`py-2.5 sm:py-3 rounded-[18px] flex flex-col items-center justify-center transition cursor-pointer ${
                  isToday
                    ? 'bg-[#8FA89B] text-white shadow-sm'
                    : isSelected
                    ? 'bg-[#EBF1EE] border border-[#8FA89B]/50 text-[#4A6B5B]'
                    : 'hover:bg-[#F2ECE4] text-[#2D2825]'
                }`}
              >
                <span
                  className={`text-[10.5px] font-sans font-semibold uppercase ${
                    isToday ? 'text-white' : 'text-[#7E756F]'
                  }`}
                >
                  {item.dayName}
                </span>

                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[14px] mt-1 ${
                    isToday ? 'bg-white/20 text-white' : 'text-[#2D2825]'
                  }`}
                >
                  {item.dayNumber}
                </span>

                {/* Phase indicator dot */}
                <span
                  className="w-2 h-2 rounded-full mt-1.5"
                  style={{ backgroundColor: item.color }}
                  title={`Fase ${item.phase}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Responsive Split Grid (2 Columns on Desktop, 1 Column on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Matriz de 4 Fases & Explicación Clínica (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-section-h3 text-[#7E756F]">
              MATRIZ DE 4 FASES DE CICLADO
            </span>
            <span className="text-[12px] font-sans font-medium text-[#4A6B5B]">
              Noche {currentPhase.phaseNumber} de 4 Seleccionada
            </span>
          </div>

          {/* 4-Phase Multi-Card Selector */}
          <div className="grid grid-cols-2 gap-2.5">
            {routineSteps.map((phase, idx) => {
              const isActive = activePhaseIndex === idx;

              return (
                <button
                  key={phase.phaseNumber}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`p-4 rounded-[20px] text-left transition cursor-pointer border flex flex-col justify-between ${
                    isActive
                      ? 'border-2 shadow-diffuse scale-[1.01]'
                      : 'bg-[#FAF8F5] border-[#E8E1D7] hover:border-[#8FA89B]/60 opacity-85'
                  }`}
                  style={{
                    backgroundColor: isActive ? phase.bgSubtleColor : '#FAF8F5',
                    borderColor: isActive ? phase.accentColor : '#E8E1D7',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold"
                        style={{ backgroundColor: phase.accentColor }}
                      >
                        {phase.nightName}
                      </span>
                      {phase.steps.every((s) => s.completed) && (
                        <CheckCircle2 className="w-4 h-4 text-[#4A6B5B]" />
                      )}
                    </div>

                    <h4 className="font-serif text-[15px] font-semibold text-[#2D2825] mt-2 leading-snug">
                      {phase.phaseTitle}
                    </h4>
                  </div>

                  <span className="text-[11px] font-sans font-medium text-[#7E756F] mt-2.5 block">
                    {phase.badgeLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Phase Clinical Rationale Card */}
          <div
            className="p-5 rounded-[22px] border shadow-diffuse space-y-3"
            style={{
              backgroundColor: currentPhase.bgSubtleColor,
              borderColor: currentPhase.accentColor,
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="px-3 py-1 rounded-full text-white text-[10.5px] font-bold uppercase tracking-wider shadow-xs"
                style={{ backgroundColor: currentPhase.accentColor }}
              >
                Objetivo Fisiológico
              </span>
              <span className="text-[12px] text-[#4A6B5B] font-semibold">
                {currentPhase.badgeLabel}
              </span>
            </div>

            <h3 className="font-serif text-[19px] font-semibold text-[#2D2825]">
              {currentPhase.nightName}: {currentPhase.phaseTitle}
            </h3>

            <p className="text-[13px] font-sans text-[#4A433E] leading-relaxed">
              {currentPhase.clinicalGoal}
            </p>

            <div className="pt-3 border-t border-black/5 flex flex-wrap gap-2">
              {currentPhase.keyActives.map((act, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-white/90 border border-black/5 text-[#2D2825] text-[11px] font-medium shadow-2xs"
                >
                  {act}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Checklist de Rutina Paso a Paso (col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-section-h3 text-[#7E756F]">
              CHECKLIST DE RUTINA • {currentPhase.nightName.toUpperCase()}
            </span>
            <span className="text-[12px] text-[#4A6B5B] font-semibold">
              {currentPhase.steps.filter((s) => s.completed).length}/{currentPhase.steps.length} Completados
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {currentPhase.steps.map((step) => (
              <div
                key={step.id}
                onClick={() => handleToggleStep(step.id)}
                className={`p-4 rounded-[20px] border transition cursor-pointer flex items-start gap-3.5 shadow-diffuse ${
                  step.completed
                    ? 'bg-[#EBF1EE]/70 border-[#8FA89B]'
                    : 'bg-white border-[#E8E1D7] hover:border-[#8FA89B]'
                }`}
              >
                {/* Interactive Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition ${
                    step.completed
                      ? 'bg-[#4A6B5B] text-white'
                      : 'border-2 border-[#D5CDC5] text-transparent hover:border-[#8FA89B]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </div>

                {/* Step Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold uppercase text-[#7E756F] tracking-wider">
                      Paso {step.stepNumber} • {step.category}
                    </span>
                    <span className="text-[11px] text-[#8FA89B] font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {step.timing}
                    </span>
                  </div>

                  <h4
                    className={`font-serif text-[16px] font-semibold mt-0.5 ${
                      step.completed ? 'line-through text-[#7E756F]' : 'text-[#2D2825]'
                    }`}
                  >
                    {step.title}
                  </h4>

                  <p className="text-[12.5px] font-sans text-[#4A6B5B] font-medium mt-0.5">
                    {step.productName}
                  </p>

                  <p className="text-[12px] font-sans text-[#7E756F] mt-1 leading-relaxed">
                    {step.instruction}
                  </p>

                  {step.warningNote && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-[12px] bg-[#FAF0ED] border border-[#D8A899]/40 text-[#943C36] text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#D8A899]" />
                      <span>{step.warningNote}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleCompleteFullNight}
              className="w-full py-4 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-sans font-semibold text-[14.5px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-white" />
              <span>Noche {currentPhase.phaseNumber} Completa / Registrar Adherencia</span>
            </button>
          </div>
        </div>
      </div>

      {/* Celebration Notification Toast */}
      {celebrationToast && (
        <div className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-top duration-300">
          <div className="p-4 rounded-[22px] bg-[#4A6B5B] text-white shadow-2xl flex items-center gap-3.5 border border-[#8FA89B]">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#DFCAAC]" />
            </div>
            <div>
              <h4 className="font-serif text-[16px] font-semibold">
                ¡Noche {currentPhase.phaseNumber} Registrada con Éxito!
              </h4>
              <p className="text-[12.5px] text-white/90">
                Racha aumentada a {(userProfile?.cycleStreakDays || 0) + 1} días. Tu barrera cutánea mantiene un nivel óptimo del 95%.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}