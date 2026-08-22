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
      <section className="bg-[#FFFCF9] rounded-3xl p-6 sm:p-8 border border-[#E8E0D8]/90 shadow-sm space-y-8">
        <div className="border-b border-[#F0E8E0] pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#3A7A96] font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[#4A8BA8]" />
              <span>Configurador Personalizado</span>
            </div>
            <h2 className="text-2xl font-black text-[#2D2D2D] tracking-tight">
              Crea tu Calendario de Noches (Skin Cycling)
            </h2>
            <p className="text-xs sm:text-sm text-[#8B8178] mt-1">
              Elige cómo sientes tu piel para organizar qué noches usar exfoliantes, qué noches usar retinoides y qué noches dar descanso a tu piel.
            </p>
          </div>

          {/* Quick Beginner Starter */}
          <button
            type="button"
            onClick={handleApplyBeginnerPreset}
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#E8F4FA] hover:bg-[#D3EAF5] text-[#1A4D63] text-xs font-bold px-4 py-2.5 rounded-2xl border border-[#A8D4E6] transition cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#3A7A96]" />
            <span>Soy Principiante: Rutina Estándar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Tipo de Piel */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-[#5A5A5A] tracking-wider">
              1. ¿Cómo es tu piel habitualmente?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SKIN_TYPES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSkinType(st.id)}
                  className={`p-3 rounded-2xl text-left border transition text-xs font-semibold cursor-pointer ${
                    skinType === st.id
                      ? 'bg-[#E8F4FA] border-[#4A8BA8] text-[#1A4D63] shadow-sm ring-1 ring-[#5FA8C2]/30'
                      : 'bg-[#FAF7F4] hover:bg-[#F5EDE6]/80 border-[#E8E0D8] text-[#5A5A5A]'
                  }`}
                >
                  <span className="block font-bold text-sm mb-0.5">{st.label}</span>
                  <span className="text-[10px] text-[#8B8178] line-clamp-2 leading-tight">
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Tono y Reacción al Sol */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-[#5A5A5A] tracking-wider">
                2. ¿Cómo reacciona tu piel con el sol?
              </label>
              <span className="text-[11px] text-[#A69D94] font-medium">Ayuda a prevenir manchas</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FITZPATRICK_SCALE.map((fp) => (
                <button
                  key={fp.type}
                  type="button"
                  onClick={() => setFitzpatrick(fp.type)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition text-center cursor-pointer ${
                    fitzpatrick === fp.type
                      ? 'border-[#4A8BA8] bg-[#E8F4FA]/60 ring-2 ring-[#5FA8C2]/20'
                      : 'border-[#E8E0D8] hover:border-[#F0E8E0] bg-[#FFFCF9]'
                  }`}
                  title={fp.desc}
                >
                  <span className={`w-7 h-7 rounded-full border shadow-inner mb-1.5 ${fp.tone}`} />
                  <span className="text-[11px] font-bold text-[#3D3D3D] leading-tight">{fp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Estado de la Barrera Cutánea */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-[#5A5A5A] tracking-wider">
              3. ¿Cómo sientes tu piel en estos días?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBarrierStatus('HEALTHY')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  barrierStatus === 'HEALTHY'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-500/30'
                    : 'bg-[#FAF7F4] border-[#E8E0D8] text-[#5A5A5A]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> Normal / Cómoda
                </div>
                <p className="text-[11px] text-[#8B8178]">Tolerancia normal a cremas, sin ardor ni tirantez.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('COMPROMISED')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  barrierStatus === 'COMPROMISED'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-500/30'
                    : 'bg-[#FAF7F4] border-[#E8E0D8] text-[#5A5A5A]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Sensible o Tirante
                </div>
                <p className="text-[11px] text-[#8B8178]">Sensación seca o picor leve al usar ciertos productos.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('ACUTELY_DAMAGED')}
                className={`p-3 rounded-2xl text-left border transition cursor-pointer ${
                  barrierStatus === 'ACUTELY_DAMAGED'
                    ? 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-500/30'
                    : 'bg-[#FAF7F4] border-[#E8E0D8] text-[#5A5A5A]'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-rose-800">
                  <Flame className="w-3.5 h-3.5" /> Muy Irritada / Quema
                </div>
                <p className="text-[11px] text-[#8B8178]">Ardor al poner cualquier crema, rojez evidente.</p>
              </button>
            </div>
          </div>

          {/* 4. Experiencia con Activos y Situación Médica */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#5A5A5A] tracking-wider mb-2">
                4. ¿Qué tanta experiencia tienes usando ácidos o retinoides?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition cursor-pointer ${
                      experienceLevel === lvl
                        ? 'bg-[#4A8BA8] border-[#4A8BA8] text-white shadow-sm'
                        : 'bg-[#FAF7F4] border-[#E8E0D8] text-[#5A5A5A] hover:bg-[#F5EDE6]'
                    }`}
                  >
                    {lvl === 'BEGINNER' ? 'Principiante (Cero)' : lvl === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                  </button>
                ))}
              </div>
            </div>

            {/* Embarazo o Lactancia Switch */}
            <div className="flex items-center justify-between p-3.5 bg-[#F9F2F0]/70 border border-[#F2E2DC]/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F2E2DC] text-[#6E4435] flex items-center justify-center font-bold">
                  <Baby className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#321E18] block">
                    ¿Estás embarazada o en periodo de lactancia?
                  </span>
                  <span className="text-[10px] text-[#6E4435]">
                    Sustituye automáticamente retinoides por alternativas seguras recomendadas.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPregnancyOrNursing(!pregnancyOrNursing)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                  pregnancyOrNursing ? 'bg-[#8A5543] justify-end' : 'bg-[#C5BBB2] justify-start'
                }`}
              >
                <div className="bg-[#FFFCF9] w-4 h-4 rounded-full shadow-md transform transition" />
              </button>
            </div>
          </div>

          {/* 5. Condiciones o Necesidades Específicas */}
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-xs font-bold uppercase text-[#5A5A5A] tracking-wider">
              5. ¿Qué te gustaría mejorar en tu piel? (Puedes elegir varias)
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS_LIST.map((cond) => {
                const selected = conditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                      selected
                        ? 'bg-[#4A8BA8] border-[#4A8BA8] text-white shadow-sm'
                        : 'bg-[#FAF7F4] hover:bg-[#F5EDE6] border-[#E8E0D8] text-[#5A5A5A]'
                    }`}
                  >
                    {selected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
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
        <div className="bg-gradient-to-r from-[#1A4D63] via-[#1A2332] to-[#0F3344] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#7BB8D0]/20 text-[#8EC5DB] border border-[#7BB8D0]/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Ciclo de {protocol.cycleLength} Noches
                </span>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Barrera: {protocol.barrierScore}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {protocol.protocolName}
              </h3>
              <p className="text-xs sm:text-sm text-[#C5BBB2] leading-relaxed">
                {protocol.summary}
              </p>
            </div>

            {/* Lead Magnet CTA Button */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleSaveProtocol}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#7BB8D0] hover:bg-[#8EC5DB] text-[#0F1721] font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-[#7BB8D0]/20 transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Save className="w-4 h-4" />
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
            const borderColor = isExfoliation
              ? 'border-[#5FA8C2]/50 hover:border-[#5FA8C2]'
              : isRetinoid
              ? 'border-[#AC6A53]/50 hover:border-[#AC6A53]'
              : 'border-emerald-500/50 hover:border-emerald-500';

            const numBg = isExfoliation
              ? 'bg-[#C5E3F0] text-[#2D6680]'
              : isRetinoid
              ? 'bg-[#F2E2DC] text-[#5A372B]'
              : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={night.nightNumber}
                className={`bg-[#FFFCF9] rounded-3xl p-6 border-2 ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${numBg} flex items-center justify-center font-black text-sm`}>
                      0{night.nightNumber}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A69D94]">
                      Noche {night.nightNumber} de {protocol.cycleLength}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-[#2D2D2D] leading-snug">
                      {night.title}
                    </h4>
                    <p className="text-[11px] text-[#3A7A96] font-bold mt-0.5">
                      {night.subtitle}
                    </p>
                  </div>

                  {/* Actives Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#A69D94] tracking-wider">
                      Qué ingredientes usar:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {night.recommendedActives.map((act, i) => (
                        <span
                          key={i}
                          className="bg-[#F5EDE6] text-[#3D3D3D] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#E8E0D8]/80"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step By Step Instructions */}
                  <div className="pt-2 border-t border-[#F0E8E0] space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#A69D94] tracking-wider block">
                      Paso a paso:
                    </span>
                    <ul className="text-xs text-[#6B6B6B] space-y-1">
                      {night.suggestedSteps.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-tight">
                          <span className="text-[#4A8BA8] font-black">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F0E8E0]">
                  <p className="text-[11px] text-[#8B8178] leading-tight italic">
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
