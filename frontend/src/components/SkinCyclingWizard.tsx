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
  Baby,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Zap,
  Moon,
  Sun
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

const SKIN_TYPES: { id: SkinType; label: string; desc: string }[] = [
  { id: 'COMBINATION', label: 'Mixta', desc: 'Zona T con brillo y mejillas normales o secas' },
  { id: 'OILY', label: 'Grasa', desc: 'Brillo en todo el rostro y poros visibles' },
  { id: 'DRY', label: 'Seca', desc: 'Sensación tirante, opaca o descamada' },
  { id: 'SENSITIVE', label: 'Sensible', desc: 'Se enrojece o reacciona con facilidad' },
  { id: 'NORMAL', label: 'Normal', desc: 'Equilibrada, sin exceso de grasa ni sequedad' },
];

const FITZPATRICK_SCALE: { type: FitzpatrickType; label: string; tone: string; desc: string }[] = [
  { type: 1, label: 'Muy clara', tone: 'bg-[#ffeedd] border-[#ebd1bc]', desc: 'Siempre se quema con el sol, nunca se broncea' },
  { type: 2, label: 'Clara', tone: 'bg-[#fbe4ce] border-[#e7c7a9]', desc: 'Suele quemarse fácil, broncea poco' },
  { type: 3, label: 'Trigueña clara', tone: 'bg-[#eed0b0] border-[#d8b087]', desc: 'Se quema moderado, broncea gradual' },
  { type: 4, label: 'Trigueña / Oliva', tone: 'bg-[#d8a776] border-[#bd8853]', desc: 'Rara vez se quema, broncea fácil' },
  { type: 5, label: 'Morena oscura', tone: 'bg-[#a76e3e] border-[#8a5426]', desc: 'Casi nunca se quema, pigmenta rápido' },
  { type: 6, label: 'Oscura', tone: 'bg-[#5c371d] border-[#44230d]', desc: 'Piel muy pigmentada, alta resistencia' },
];

const CONDITIONS_LIST: { id: SkinCondition; label: string }[] = [
  { id: 'ACNE', label: 'Acné o Granitos' },
  { id: 'ROSACEA', label: 'Rojeces o Rosácea' },
  { id: 'HYPERPIGMENTATION', label: 'Manchas del Sol o Melasma' },
  { id: 'AGING', label: 'Líneas de Expresión' },
  { id: 'CLOGGED_PORES', label: 'Puntos Negros & Poros' },
  { id: 'REDNESS', label: 'Piel Reactiva / Sensible' },
];

export default function SkinCyclingWizard() {
  const router = useRouter();

  // Wizard Step State: 1 | 2 | 3 | 4
  const [currentStep, setCurrentStep] = useState<number>(1);

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
      }, 600);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsSavedToast(true);
    setTimeout(() => {
      router.push('/mi-rutina');
    }, 600);
  };

  const STEPS_NAV = [
    { num: 1, label: 'Tu piel' },
    { num: 2, label: 'Tus objetivos' },
    { num: 3, label: 'Tu tolerancia' },
    { num: 4, label: 'Tu protocolo' },
  ];

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E2822] text-white px-5 py-3 rounded-2xl shadow-editorial-elevated flex items-center gap-3 border border-[#364B40] animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#6B8B7B]" />
          <div>
            <p className="text-xs font-bold">Protocolo Guardado</p>
            <p className="text-[11px] text-[#B8C2BC]">Redirigiendo a tu calendario dérmico...</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* STEP PROGRESSION BAR (QUIET EDITORIAL STEPPER) */}
      <div className="flex items-center justify-between max-w-xl mx-auto border-b border-[#ECE6DC] pb-4">
        {STEPS_NAV.map((step) => (
          <button
            key={step.num}
            type="button"
            onClick={() => setCurrentStep(step.num)}
            className={`flex items-center gap-2 text-xs font-semibold transition cursor-pointer ${
              currentStep === step.num
                ? 'text-[#364B40] font-bold'
                : currentStep > step.num
                ? 'text-[#6B8B7B]'
                : 'text-[#99938B]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === step.num
                  ? 'bg-[#364B40] text-white'
                  : currentStep > step.num
                  ? 'bg-[#EEF4F0] text-[#364B40]'
                  : 'bg-[#FAF8F5] text-[#99938B] border border-[#ECE6DC]'
              }`}
            >
              {step.num}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN STEP CONTAINER */}
      <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-8 min-h-[380px] flex flex-col justify-between">
        
        {/* ======================================================== */}
        {/* PASO 1: TU PIEL                                         */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-widest">
                Paso 1 de 4
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A]">
                ¿Cómo describirías tu piel habitualmente?
              </h2>
              <p className="text-xs text-[#66615C]">
                Esto determina la proporción adecuada entre días de exfoliación y noches de recuperación.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SKIN_TYPES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSkinType(st.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
                    skinType === st.id
                      ? 'bg-[#EEF4F0] border-[#6B8B7B] text-[#364B40] shadow-2xs'
                      : 'bg-[#FAF8F5] hover:bg-[#F7F4EE] border-[#ECE6DC] text-[#66615C]'
                  }`}
                >
                  <span className="block font-serif font-bold text-sm text-[#1C1B1A] mb-1">{st.label}</span>
                  <span className="text-xs text-[#66615C] leading-snug">
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 2: TUS OBJETIVOS & FOTOTIPO                         */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-widest">
                Paso 2 de 4
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A]">
                ¿Qué te gustaría priorizar en tu piel?
              </h2>
              <p className="text-xs text-[#66615C]">
                Selecciona uno o más objetivos para enfocar los activos sugeridos.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {CONDITIONS_LIST.map((cond) => {
                const selected = conditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      selected
                        ? 'bg-[#364B40] text-white border-[#364B40]'
                        : 'bg-[#FAF8F5] text-[#66615C] border-[#ECE6DC] hover:bg-[#F7F4EE]'
                    }`}
                  >
                    {selected ? '✓ ' : ''}{cond.label}
                  </button>
                );
              })}
            </div>

            {/* Fototipo selector */}
            <div className="pt-4 border-t border-[#ECE6DC] space-y-2">
              <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider block">
                Tono de piel & Reacción al sol
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {FITZPATRICK_SCALE.map((fp) => (
                  <button
                    key={fp.type}
                    type="button"
                    onClick={() => setFitzpatrick(fp.type)}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      fitzpatrick === fp.type
                        ? 'bg-[#EEF4F0] border-[#6B8B7B]'
                        : 'bg-[#FAF8F5] border-[#ECE6DC] hover:bg-[#F7F4EE]'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border ${fp.tone}`} />
                    <span className="text-[11px] font-semibold text-[#1C1B1A]">{fp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 3: TU TOLERANCIA & EXPERIENCIA                     */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-widest">
                Paso 3 de 4
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A]">
                ¿Cómo sientes tu barrera dérmica actualmente?
              </h2>
              <p className="text-xs text-[#66615C]">
                Nos aseguramos de no prescribir activos irritantes si tu piel está sensibilizada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setBarrierStatus('HEALTHY')}
                className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                  barrierStatus === 'HEALTHY'
                    ? 'bg-[#EEF4F0] border-[#6B8B7B] text-[#364B40]'
                    : 'bg-[#FAF8F5] border-[#ECE6DC] text-[#66615C]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#364B40]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Cómoda / Equilibrada
                </div>
                <p className="text-xs text-[#66615C]">Tolerancia normal a cremas, sin ardor ni picor.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('COMPROMISED')}
                className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                  barrierStatus === 'COMPROMISED'
                    ? 'bg-[#F9F5F0] border-[#B89B7D] text-[#7A5E43]'
                    : 'bg-[#FAF8F5] border-[#ECE6DC] text-[#66615C]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#B89B7D]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Tirante o Reactiva
                </div>
                <p className="text-xs text-[#66615C]">Sensación seca o ligera molestia con ciertos productos.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('ACUTELY_DAMAGED')}
                className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                  barrierStatus === 'ACUTELY_DAMAGED'
                    ? 'bg-[#FDF2F0] border-[#D97D75] text-[#943C36]'
                    : 'bg-[#FAF8F5] border-[#ECE6DC] text-[#66615C]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[#D97D75]">
                  <Flame className="w-3.5 h-3.5" /> Muy Irritada
                </div>
                <p className="text-xs text-[#66615C]">Ardor con casi cualquier crema o rojez constante.</p>
              </button>
            </div>

            {/* Experience level & Pregnancy */}
            <div className="pt-4 border-t border-[#ECE6DC] space-y-4">
              <div>
                <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider block mb-2">
                  Experiencia previa con activos concentrados:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                        experienceLevel === lvl
                          ? 'bg-[#364B40] text-white border-[#364B40]'
                          : 'bg-[#FAF8F5] border-[#ECE6DC] text-[#66615C] hover:bg-[#F7F4EE]'
                      }`}
                    >
                      {lvl === 'BEGINNER' ? 'Principiante' : lvl === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregnancy switch */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-[#B89B7D]" />
                  <span className="text-xs font-semibold text-[#1C1B1A]">
                    ¿En periodo de embarazo o lactancia?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPregnancyOrNursing(!pregnancyOrNursing)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                    pregnancyOrNursing ? 'bg-[#6B8B7B] justify-end' : 'bg-[#ECE6DC] justify-start'
                  }`}
                >
                  <div className="bg-[#FFFFFF] w-4 h-4 rounded-full shadow-2xs" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PASO 4: TU PROTOCOLO PERSONALIZADO                       */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#6B8B7B] uppercase tracking-widest">
                Paso 4 de 4 · Resultado
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1C1B1A]">
                {protocol.protocolName}
              </h2>
              <p className="text-xs text-[#66615C]">
                Ciclo de {protocol.cycleLength} noches adaptado a tu biotipo dérmico.
              </p>
            </div>

            {/* Nights breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {protocol.nights.map((night) => (
                <div
                  key={night.nightNumber}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#6B8B7B] block">
                      Noche {night.nightNumber}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-[#1C1B1A]">{night.title}</h4>
                    <p className="text-[11px] text-[#66615C] mt-1 leading-relaxed">{night.clinicalRationale}</p>
                  </div>
                  <div className="pt-2 border-t border-[#ECE6DC]">
                    <span className="text-[10px] font-semibold text-[#364B40]">
                      Activos: {night.recommendedActives.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rationale and Save CTA */}
            <div className="bg-[#EEF4F0] p-4 rounded-xl border border-[#6B8B7B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-[#364B40] font-medium">
                Al guardar, este ciclo configurará automáticamente tu calendario en Mi Rutina.
              </span>
              <button
                type="button"
                onClick={handleSaveProtocol}
                className="bg-[#364B40] hover:bg-[#2A3B32] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
              >
                Guardar en Mi Rutina
              </button>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="pt-4 border-t border-[#ECE6DC] flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="text-xs font-semibold text-[#66615C] hover:text-[#1C1B1A] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 && (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="bg-[#6B8B7B] hover:bg-[#5A7768] text-white text-xs font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
