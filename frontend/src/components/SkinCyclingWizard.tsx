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
  { id: 'COMBINATION', label: 'Mixta', desc: 'Zona T grasa y mejillas normales o secas' },
  { id: 'OILY', label: 'Grasa', desc: 'Brillo generalizado, poros dilatados y propensión a sebo' },
  { id: 'DRY', label: 'Seca', desc: 'Tirantez, opacidad, falta de lípidos naturales' },
  { id: 'SENSITIVE', label: 'Sensible', desc: 'Reactividad inmediata, tendencia a rojeces y picor' },
  { id: 'NORMAL', label: 'Normal', desc: 'Equilibrio hidrolipídico óptimo y textura uniforme' },
];

const FITZPATRICK_SCALE: { type: FitzpatrickType; label: string; tone: string; desc: string }[] = [
  { type: 1, label: 'Tipo I', tone: 'bg-[#ffeedd] border-[#ebd1bc]', desc: 'Muy clara, pelirrojo/rubio, siempre se quema' },
  { type: 2, label: 'Tipo II', tone: 'bg-[#fbe4ce] border-[#e7c7a9]', desc: 'Clara, ojos claros, suele quemarse fácil' },
  { type: 3, label: 'Tipo III', tone: 'bg-[#eed0b0] border-[#d8b087]', desc: 'Media clara, se quema moderado, broncea gradual' },
  { type: 4, label: 'Tipo IV', tone: 'bg-[#d8a776] border-[#bd8853]', desc: 'Oliva o morena clara, rara vez se quema' },
  { type: 5, label: 'Tipo V', tone: 'bg-[#a76e3e] border-[#8a5426]', desc: 'Morena oscura, casi nunca se quema' },
  { type: 6, label: 'Tipo VI', tone: 'bg-[#5c371d] border-[#44230d]', desc: 'Muy oscura/negra, máxima melanina protectora' },
];

const CONDITIONS_LIST: { id: SkinCondition; label: string }[] = [
  { id: 'ACNE', label: 'Acné o Puntos Negros' },
  { id: 'ROSACEA', label: 'Rosácea o Cuperosis' },
  { id: 'HYPERPIGMENTATION', label: 'Manchas o Melasma' },
  { id: 'AGING', label: 'Líneas de expresión / Arrugas' },
  { id: 'CLOGGED_PORES', label: 'Poros Obstruidos / Textura Irregular' },
  { id: 'REDNESS', label: 'Rojeces Ocasionales' },
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
        <div className="fixed bottom-6 right-6 z-50 bg-teal-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-teal-500 animate-in slide-in-from-bottom duration-300">
          <CheckCircle2 className="w-5 h-5 text-teal-300" />
          <div>
            <p className="text-xs font-bold">¡Rutina Guardada con Éxito!</p>
            <p className="text-[11px] text-teal-200">Redirigiendo a tu calendario de Skin Cycling...</p>
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
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8">
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Configurador Dermatológico Personalizado</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Personaliza tu Protocolo de Skin Cycling
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ajusta los parámetros de tu piel para que el algoritmo clínico adapte el número de noches, los activos óptimos y las precauciones necesarias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. Tipo de Piel */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              1. Biotipo / Tipo de Piel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SKIN_TYPES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSkinType(st.id)}
                  className={`p-3 rounded-2xl text-left border transition text-xs font-semibold ${
                    skinType === st.id
                      ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-sm ring-1 ring-teal-500/30'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-bold text-sm mb-0.5">{st.label}</span>
                  <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                    {st.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fototipo Fitzpatrick */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
                2. Fototipo de Piel (Escala Fitzpatrick)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Previene manchas post-ácidos</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FITZPATRICK_SCALE.map((fp) => (
                <button
                  key={fp.type}
                  type="button"
                  onClick={() => setFitzpatrick(fp.type)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition text-center ${
                    fitzpatrick === fp.type
                      ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full border shadow-inner mb-1.5 ${fp.tone}`} />
                  <span className="text-xs font-bold text-slate-800">{fp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Estado de la Barrera Cutánea */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              3. Estado de tu Barrera Cutánea
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBarrierStatus('HEALTHY')}
                className={`p-3 rounded-2xl text-left border transition ${
                  barrierStatus === 'HEALTHY'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-1 ring-emerald-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> Saludable
                </div>
                <p className="text-[11px] text-slate-500">Tolerancia normal a cremas y activos sin ardor.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('COMPROMISED')}
                className={`p-3 rounded-2xl text-left border transition ${
                  barrierStatus === 'COMPROMISED'
                    ? 'bg-amber-50 border-amber-600 text-amber-900 ring-1 ring-amber-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5" /> Comprometida
                </div>
                <p className="text-[11px] text-slate-500">Tirantez o picor leve con ciertos productos.</p>
              </button>

              <button
                type="button"
                onClick={() => setBarrierStatus('ACUTELY_DAMAGED')}
                className={`p-3 rounded-2xl text-left border transition ${
                  barrierStatus === 'ACUTELY_DAMAGED'
                    ? 'bg-rose-50 border-rose-600 text-rose-900 ring-1 ring-rose-500/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-rose-800">
                  <Flame className="w-3.5 h-3.5" /> Muy Dañada / Quema
                </div>
                <p className="text-[11px] text-slate-500">Ardor al poner cualquier crema, rojez severa.</p>
              </button>
            </div>
          </div>

          {/* 4. Experiencia con Activos y Situación Médica */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider mb-2">
                4. Nivel de Experiencia con Activos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExperienceLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition ${
                      experienceLevel === lvl
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 'BEGINNER' ? 'Principiante' : lvl === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                  </button>
                ))}
              </div>
            </div>

            {/* Embarazo o Lactancia Switch */}
            <div className="flex items-center justify-between p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Baby className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-950 block">
                    ¿Estás embarazada o en periodo de lactancia?
                  </span>
                  <span className="text-[10px] text-purple-700">
                    Sustituye automáticamente retinoides por alternativas seguras (Bakuchiol/Azelaico).
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPregnancyOrNursing(!pregnancyOrNursing)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  pregnancyOrNursing ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
              </button>
            </div>
          </div>

          {/* 5. Condiciones o Necesidades Específicas */}
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700 tracking-wider">
              5. Condiciones o Necesidades Específicas (Selecciona todas las que apliquen)
            </label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS_LIST.map((cond) => {
                const selected = conditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      selected
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
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
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Ciclo de {protocol.cycleLength} Noches
                </span>
                <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Barrera: {protocol.barrierScore}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {protocol.protocolName}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {protocol.summary}
              </p>
            </div>

            {/* Lead Magnet CTA Button */}
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={handleSaveProtocol}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-teal-400/20 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Save className="w-4 h-4" />
                <span>Guardar y Activar Calendario</span>
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
              ? 'border-teal-500/50 hover:border-teal-500'
              : isRetinoid
              ? 'border-indigo-500/50 hover:border-indigo-500'
              : 'border-emerald-500/50 hover:border-emerald-500';

            const numBg = isExfoliation
              ? 'bg-teal-100 text-teal-800'
              : isRetinoid
              ? 'bg-indigo-100 text-indigo-800'
              : 'bg-emerald-100 text-emerald-800';

            return (
              <div
                key={night.nightNumber}
                className={`bg-white rounded-3xl p-6 border-2 ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${numBg} flex items-center justify-center font-black text-sm`}>
                      0{night.nightNumber}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Noche {night.nightNumber} de {protocol.cycleLength}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-snug">
                      {night.title}
                    </h4>
                    <p className="text-[11px] text-teal-700 font-bold mt-0.5">
                      {night.subtitle}
                    </p>
                  </div>

                  {/* Actives Chips */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Activos Recomendados:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {night.recommendedActives.map((act, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/80"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Step By Step Instructions */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Instrucciones de Aplicación:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {night.suggestedSteps.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5 leading-tight">
                          <span className="text-teal-600 font-black">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Rationale & Precautions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] text-slate-500 italic leading-relaxed">
                    {night.clinicalRationale}
                  </p>
                  {night.precautions.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2 text-[10px] text-amber-900 flex items-start gap-1.5">
                      <Info className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{night.precautions[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suitable Products Category Breakdown */}
        <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 space-y-6">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Fórmulas y Productos Compatibles con tu Protocolo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-teal-700 tracking-wider block">
                Exfoliantes Aptos:
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {protocol.suitableExfoliants.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider block">
                Retinoides / Alternativas Aptas:
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {protocol.suitableRetinoidsOrAlternatives.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-2 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider block">
                Hidratantes y Reparadores:
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {protocol.suitableMoisturizers.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* SPONSORED MONETIZATION BANNER */}
        <AdBanner
          slotType="SPONSORED_PRODUCT"
          sponsorName="Farmacias y Distribuidores Autorizados"
          title="Consigue tus Activos de Skin Cycling con Envío Rápido y Garantía de Autenticidad"
          description="Explora el catálogo verificado con promociones en limpiadores syndet, retinoides de grado dermatológico y cremas con ceramidas puras."
          ctaText="Explorar Productos Recomendados"
          ctaLink="/"
        />

        {/* Lead Capture Bottom Banner */}
        <div className="bg-white rounded-3xl p-8 border-2 border-teal-500/30 shadow-xl text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              ¿Listo para empezar tu ciclo y no olvidar qué noche toca hoy?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Guarda tu protocolo, añade los productos que ya tienes en casa y revisa tu calendario interactivo día por día.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveProtocol}
              className="inline-flex items-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-teal-600/25 transition hover:scale-105 active:scale-95"
            >
              <Save className="w-5 h-5" />
              <span>Guardar Mi Rutina y Ver Calendario</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
