'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Calendar,
  Save,
  Baby,
  Layers,
  ChevronRight,
  Info,
  ArrowRight,
  RefreshCw,
  Zap
} from 'lucide-react';
import {
  SkinType,
  FitzpatrickType,
  BarrierStatus,
  SkinCondition,
  ExperienceLevel,
  SkinDiagnosisInput,
} from '@/types/skinCycling';
import { generateCustomProtocol } from '@/lib/skinCyclingEngine';
import { getCurrentUser, setSavedCustomProtocol } from '@/lib/api';
import AuthModal from './AuthModal';
import AdBanner from './AdBanner';

const SKIN_TYPES: { id: SkinType; label: string; desc: string }[] = [
  { id: 'COMBINATION', label: 'Mixta', desc: 'Frente/nariz con brillo y mejillas normales o secas' },
  { id: 'OILY', label: 'Grasa', desc: 'Brillo en todo el rostro y poros visibles' },
  { id: 'DRY', label: 'Seca', desc: 'Sensación tirante, opaca o descamada' },
  { id: 'SENSITIVE', label: 'Sensible', desc: 'Se enrojece o pica con facilidad' },
  { id: 'NORMAL', label: 'Normal', desc: 'Equilibrada, sin exceso de grasa ni sequedad' },
];

const FITZPATRICK_SCALE: { type: FitzpatrickType; label: string; tone: string; desc: string }[] = [
  { type: 1, label: 'Muy clara', tone: 'bg-[#ffeedd] border-[#ebd1bc]', desc: 'Siempre se quema con el sol, nunca se broncea' },
  { type: 2, label: 'Clara', tone: 'bg-[#fbe4ce] border-[#e7c7a9]', desc: 'Suele quemarse fácil, broncea poco' },
  { type: 3, label: 'Trigueña clara', tone: 'bg-[#eed0b0] border-[#d8b087]', desc: 'Se quema moderado, broncea gradual' },
  { type: 4, label: 'Trigueña / Oliva', tone: 'bg-[#d8a776] border-[#bd8853]', desc: 'Rara vez se quema, broncea fácil' },
  { type: 5, label: 'Morena oscura', tone: 'bg-[#a76e3e] border-[#8a5426]', desc: 'Casi nunca se quema, pigmenta rápido' },
  { type: 6, label: 'Oscura', tone: 'bg-[#5c371d] border-[#44230d]', desc: 'Piel muy pigmentada, alta resistencia al sol' },
];

const CONDITIONS_LIST: { id: SkinCondition; label: string }[] = [
  { id: 'ACNE', label: 'Acné o Granitos' },
  { id: 'ROSACEA', label: 'Rojeces o Rosácea' },
  { id: 'HYPERPIGMENTATION', label: 'Manchas del Sol o Melasma' },
  { id: 'AGING', label: 'Líneas de Expresión y Arrugas' },
  { id: 'CLOGGED_PORES', label: 'Puntos Negros y Poros Obstruidos' },
  { id: 'REDNESS', label: 'Piel Reactiva / Sensibilidad' },
];

export default function SkinCyclingWizard() {
  const router = useRouter();

  // Diagnostic State
  const [skinType, setSkinType] = useState<SkinType>('COMBINATION');
  const [fitzpatrick, setFitzpatrick] = useState<FitzpatrickType>(3);
  const [barrierStatus, setBarrierStatus] = useState<BarrierStatus>('HEALTHY');
  const [conditions, setConditions] = useState<SkinCondition[]>(['CLOGGED_PORES']);
  const [pregnancyOrNursing, setPregnancyOrNursing] = useState<boolean>(false);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('INTERMEDIATE');

  // UI / Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Quick Beginner Preset
  const handleApplyBeginnerPreset = () => {
    setSkinType('COMBINATION');
    setFitzpatrick(3);
    setBarrierStatus('HEALTHY');
    setExperienceLevel('BEGINNER');
    setConditions(['CLOGGED_PORES']);
  };

  // Generate dynamic protocol based on inputs
  const protocol = useMemo(() => {
    const input: SkinDiagnosisInput = {
      skinType,
      fitzpatrick,
      barrierStatus,
      conditions,
      pregnancyOrNursing,
      experienceLevel,
    };
    return generateCustomProtocol(input);
  }, [skinType, fitzpatrick, barrierStatus, conditions, pregnancyOrNursing, experienceLevel]);

  const toggleCondition = (conditionId: SkinCondition) => {
    setConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((c) => c !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleSaveProtocol = () => {
    const user = getCurrentUser();
    const diagnosisInput: SkinDiagnosisInput = {
      skinType,
      fitzpatrick,
      barrierStatus,
      conditions,
      pregnancyOrNursing,
      experienceLevel,
    };

    setSavedCustomProtocol(protocol, diagnosisInput);

    if (user) {
      setIsSavedToast(true);
      setTimeout(() => {
        router.push('/mi-rutina');
      }, 700);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsSavedToast(true);
    setTimeout(() => {
      router.push('/mi-rutina');
    }, 700);
  };

  return (
    <div className="space-y-12">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A4D63] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#5FA8C2] animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#8EC5DB]" />
          <div>
            <p className="text-xs font-bold">¡Rutina Guardada con Éxito!</p>
            <p className="text-[11px] text-[#A8D4E6]">Redirigiendo a tu calendario de Skin Cycling...</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* SECTION 1: INTERACTIVE DIAGNOSTIC CONFIGURATOR */}
      <section className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-8">
        <div className="border-b border-[#EFECE6] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#7A9A8B] font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 text-[#7A9A8B]" />
              <span>Configurador Dermatológico & Cosmético</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2A29] tracking-tight">
              Personaliza tu Ritual de Noches (Skin Cycling)
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6A66] mt-1">
              Organiza las noches de exfoliación química, retinoides y descanso con base en tu tolerancia y biotipo.
            </p>
          </div>

          {/* Quick Beginner Starter */}
          <button
            type="button"
            onClick={handleApplyBeginnerPreset}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#EFF5F1] hover:bg-[#E2ECE5] text-[#4F6D60] text-xs font-bold px-4 py-2.5 rounded-full border border-[#7A9A8B]/30 transition-all duration-200 cursor-pointer touch-target"
          >
            <Zap className="w-4 h-4 text-[#7A9A8B]" />
            <span>Ritual Estándar para Principiantes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Tipo de Piel */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-[#6E6A66] tracking-wider">
              1. ¿Cómo es tu piel habitualmente?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SKIN_TYPES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSkinType(st.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all duration-200 text-xs font-semibold cursor-pointer touch-target ${
                    skinType === st.id
                      ? 'bg-[#EFF5F1] border-[#7A9A8B] text-[#4F6D60] shadow-xs'
                      : 'bg-[#FAF8F5] hover:bg-[#F5F2EC] border-[#EFECE6] text-[#6E6A66]'
                  }`}
                >
                  <span className="block font-bold text-sm mb-0.5">{st.label}</span>
                  <span className="text-[10px] text-[#9C9790] line-clamp-2 leading-tight">
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tono y Reacción al Sol */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-[#6E6A66] tracking-wider">
                2. Fototipo / Reacción al Sol
              </label>
              <span className="text-[11px] text-[#9C9790] font-medium">Previene manchas post-inflamatorias</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FITZPATRICK_SCALE.map((fp) => (
                <button
                  key={fp.type}
                  type="button"
                  onClick={() => setFitzpatrick(fp.type)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all duration-200 text-center cursor-pointer touch-target ${
                    fitzpatrick === fp.type
                      ? 'border-[#7A9A8B] bg-[#EFF5F1] ring-2 ring-[#7A9A8B]/20 shadow-xs'
                      : 'border-[#EFECE6] hover:border-[#E6E1D8] bg-[#FAF8F5]'
                  }`}
                  title={fp.desc}
                >
                  <span className={`w-7 h-7 rounded-full border shadow-inner mb-1.5 ${fp.tone}`} />
                  <span className="text-[11px] font-bold text-[#2B2A29] leading-tight">{fp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Estado de la Barrera Cutánea */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-[#6E6A66] tracking-wider">
              3. ¿Cómo sientes tu piel en estos días?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBarrierStatus('HEALTHY')}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer touch-target ${
                  barrierStatus === 'HEALTHY'
                    ? 'bg-[#EFF5F1] border-[#7A9A8B] text-[#4F6D60] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EFECE6] text-[#6E6A66]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#4F6D60]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cómoda / Óptima
                </div>
                <p className="text-[11px] text-[#9C9790]">Tolerancia normal a cremas, sin ardor ni tirantez.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('COMPROMISED')}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer touch-target ${
                  barrierStatus === 'COMPROMISED'
                    ? 'bg-[#FAF8F5] border-[#C4A482] text-[#8F7253] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EFECE6] text-[#6E6A66]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#C4A482]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sensible / Tirante
                </div>
                <p className="text-[11px] text-[#9C9790]">Sensación seca o picor leve al usar ciertos productos.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('ACUTELY_DAMAGED')}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer touch-target ${
                  barrierStatus === 'ACUTELY_DAMAGED'
                    ? 'bg-[#F8EFEA] border-[#E8D5D0] text-[#A46864] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EFECE6] text-[#6E6A66]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#A46864]">
                  <Flame className="w-3.5 h-3.5" /> Muy Irritada
                </div>
                <p className="text-[11px] text-[#9C9790]">Ardor al poner cualquier crema o rojez evidente.</p>
              </button>
            </div>
          </div>

          {/* 4. Experiencia con Activos y Situación */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#6E6A66] tracking-wider mb-2">
                4. ¿Qué experiencia tienes usando activos concentrados?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2.5 px-3 rounded-full border text-center text-xs font-bold transition-all duration-200 cursor-pointer touch-target ${
                      experienceLevel === lvl
                        ? 'bg-[#7A9A8B] border-[#7A9A8B] text-white shadow-xs'
                        : 'bg-[#FAF8F5] border-[#EFECE6] text-[#6E6A66] hover:bg-[#F5F2EC]'
                    }`}
                  >
                    {lvl === 'BEGINNER' ? 'Principiante' : lvl === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                  </button>
                ))}
              </div>
            </div>

            {/* Embarazo o Lactancia Switch */}
            <div className="flex items-center justify-between p-3.5 bg-[#F8EFEA]/80 border border-[#E8D5D0] rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F2E2DC] text-[#A46864] flex items-center justify-center font-bold">
                  <Baby className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#2B2A29] block">
                    ¿En periodo de embarazo o lactancia?
                  </span>
                  <span className="text-[10px] text-[#6E6A66]">
                    Sustituye automáticamente retinoides por alternativas botánicas seguras (Bakuchiol).
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPregnancyOrNursing(!pregnancyOrNursing)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer touch-target ${
                  pregnancyOrNursing ? 'bg-[#7A9A8B] justify-end' : 'bg-[#E6E1D8] justify-start'
                }`}
              >
                <div className="bg-[#FFFFFF] w-4 h-4 rounded-full shadow-md transform transition-all" />
              </button>
            </div>
          </div>

          {/* 5. Condiciones o Necesidades Específicas (Chips en Pill) */}
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-xs font-bold uppercase text-[#6E6A66] tracking-wider">
              5. ¿Qué te gustaría priorizar en tu piel?
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS_LIST.map((cond) => {
                const selected = conditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer touch-target ${
                      selected
                        ? 'bg-[#7A9A8B] border-[#7A9A8B] text-white shadow-xs'
                        : 'bg-[#FAF8F5] hover:bg-[#EFF5F1] hover:text-[#4F6D60] border-[#EFECE6] text-[#6E6A66]'
                    }`}
                  >
                    {selected ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
                    {cond.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: DYNAMIC GENERATED PROTOCOL */}
      <section className="space-y-8 animate-in fade-in duration-300">
        {/* Protocol Banner Header */}
        <div className="bg-gradient-to-r from-[#4F6D60] via-[#5A796B] to-[#3D554A] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-beauty relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#FFFFFF]/20 text-[#FDFBF7] border border-white/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  Ciclo de {protocol.cycleLength} Noches
                </span>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Score de Barrera: {protocol.barrierScore}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
                {protocol.protocolName}
              </h3>
              <p className="text-xs sm:text-sm text-[#FDFBF7]/90 leading-relaxed">
                {protocol.summary}
              </p>
            </div>

            {/* Save CTA Button */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleSaveProtocol}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FDFBF7] hover:bg-white text-[#4F6D60] font-bold text-sm px-7 py-3.5 rounded-full shadow-beauty transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer touch-target"
              >
                <Save className="w-4 h-4 text-[#7A9A8B]" />
                <span>Guardar y Ver Mi Calendario</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Nights Cards Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(protocol.nights.length, 5)} gap-5`}>
          {protocol.nights.map((night) => {
            const isExfoliation = night.category === 'EXFOLIATION';
            const isRetinoid = night.category === 'RETINOID';
            const badgeBg = isExfoliation
              ? 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30'
              : isRetinoid
              ? 'bg-[#F8EFEA] text-[#A46864] border-[#E8D5D0]'
              : 'bg-[#FAF8F5] text-[#C4A482] border-[#C4A482]/30';

            const numBg = isExfoliation
              ? 'bg-[#EFF5F1] text-[#4F6D60]'
              : isRetinoid
              ? 'bg-[#F8EFEA] text-[#A46864]'
              : 'bg-[#FAF8F5] text-[#8F7253]';

            return (
              <div
                key={night.nightNumber}
                className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty hover:border-[#7A9A8B]/40 hover:shadow-beauty-hover transition-all duration-300 flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-full ${numBg} flex items-center justify-center font-bold text-xs`}>
                      0{night.nightNumber}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
                      Noche {night.nightNumber} de {protocol.cycleLength}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-serif font-bold text-[#2B2A29] leading-snug">
                      {night.title}
                    </h4>
                    <p className="text-xs text-[#7A9A8B] font-semibold mt-0.5">
                      {night.subtitle}
                    </p>
                  </div>

                  {/* Actives Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#9C9790] tracking-wider">
                      Activos recomendados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {night.recommendedActives.map((act, i) => (
                        <span
                          key={i}
                          className="bg-[#FAF8F5] text-[#6E6A66] text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#EFECE6]"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step By Step Instructions */}
                  <div className="pt-3 border-t border-[#EFECE6] space-y-2">
                    <span className="text-[10px] font-bold uppercase text-[#9C9790] tracking-wider block">
                      Ritual de aplicación:
                    </span>
                    <ul className="text-xs text-[#6E6A66] space-y-1.5">
                      {night.suggestedSteps.map((st, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-[#7A9A8B] font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFECE6]">
                  <p className="text-[11px] text-[#9C9790] leading-relaxed italic">
                    💡 {night.clinicalRationale}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
