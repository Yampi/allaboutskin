'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Sun,
  Moon,
  Droplets,
  Layers,
  Camera,
  Check,
  X,
  Play,
  RotateCcw,
  Package,
  HeartPulse,
  Flame,
  Info,
  Calendar,
  ExternalLink
} from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import VirtualFaceMaskTutorial from '@/components/ar/VirtualFaceMaskTutorial';
import { getCurrentUser, StoredUser, logUserRoutineAdherence } from '@/lib/api';

function MiRutinaContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [activeSlot, setActiveSlot] = useState<'PM' | 'AM'>('PM');
  const [isArMaskOpen, setIsArMaskOpen] = useState(false);
  const [arRoutineType, setArRoutineType] = useState<'skin_cycling' | 'spf_shield' | 'double_cleansing'>('skin_cycling');

  useEffect(() => {
    const launchParam = searchParams.get('launchAr');
    const arParam = searchParams.get('ar');
    if (launchParam === 'spf_shield' || launchParam === 'double_cleansing' || launchParam === 'skin_cycling') {
      setArRoutineType(launchParam);
      setIsArMaskOpen(true);
    } else if (arParam === '1' || launchParam === 'true') {
      setIsArMaskOpen(true);
    }
  }, [searchParams]);

  // Estado de los pasos completados hoy
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    'pm-1': true,
    'pm-2': false,
    'pm-3': false,
    'am-1': true,
    'am-2': true,
    'am-3': true,
    'am-4': false,
  });

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const toggleStep = (stepId: string, stepName: string) => {
    setCompletedSteps((prev) => {
      const next = { ...prev, [stepId]: !prev[stepId] };
      if (currentUser?.token) {
        logUserRoutineAdherence({
          slot: activeSlot,
          notes: `Paso ${stepName}: ${!prev[stepId] ? 'Completado' : 'Desmarcado'}`,
        }).catch(() => {});
      }
      return next;
    });
  };

  const handleLaunchArMask = (routine: 'skin_cycling' | 'spf_shield' | 'double_cleansing') => {
    setArRoutineType(routine);
    setIsArMaskOpen(true);
  };

  // Datos detallados de la rutina PM (Noche 2 Retinoide - Skin Cycling)
  const pmRoutine = {
    title: 'Noche 2: Estimulación Celular con Retinoide',
    cycleDay: 'Día 2 de tu protocolo de 4 noches',
    badge: 'Protocolo Fisiológico Activo',
    purpose: 'Acelerar el recambio celular, afinar la textura de la piel y prevenir imperfecciones sin irritar la barrera cutánea.',
    incompatibilityAlert: 'NO combinar esta noche con Vitamina C pura (ácido ascórbico), ácido glicólico ni ácido salicílico. El exceso de activos acelera la pérdida transepidérmica de agua (TEWL).',
    steps: [
      {
        id: 'pm-1',
        order: 1,
        phase: 'Preparación dérmica',
        productName: 'Gel Limpiador Espumoso Suave',
        brand: 'CeraVe',
        dosage: '1 pulsación sobre rostro húmedo',
        technique: 'Masajear durante 60 segundos con movimientos circulares suaves. Aclarar con agua tibia y SECAR TOTALMENTE a toques suaves. La piel debe estar completamente seca antes del retinoide para evitar mayor penetración irritante.',
        waitTime: 'Esperar 2 minutos hasta secado total',
        bottleLevel: 80,
        volumeLeft: '~160 ml restantes',
        daysLeft: 45,
        paoStatus: 'Abierto hace 40 días • 140 días de PAO restante',
        stockWarning: false,
      },
      {
        id: 'pm-2',
        order: 2,
        phase: 'Activo de renovación',
        productName: 'Granactive Retinoid 2% Emulsion',
        brand: 'The Ordinary',
        dosage: '2 a 3 gotas en la yema de los dedos',
        technique: 'Distribuir con técnica de micropuntos (frente, mejillas, mentón) y esparcir suavemente hacia el exterior. Mantener alejado del contorno de ojos, aletas de la nariz y comisuras labiales.',
        waitTime: 'Esperar 5 a 10 minutos para permitir absorción lipídica',
        bottleLevel: 35,
        volumeLeft: '~10 ml restantes',
        daysLeft: 18,
        paoStatus: 'Abierto hace 70 días • 20 días de PAO restante',
        stockWarning: true,
      },
      {
        id: 'pm-3',
        order: 3,
        phase: 'Sellado oclusivo',
        productName: 'Cicaplast Baume B5+ / Emulsión Calmante',
        brand: 'La Roche-Posay',
        dosage: 'Cantidad equivalente a una almendra',
        technique: 'Calentar entre las palmas y presionar sobre rostro y cuello. Restaura la barrera epidérmica con ceramidas y madecassoside, previniendo descamación.',
        waitTime: 'Listo para dormir',
        bottleLevel: 65,
        volumeLeft: '~26 ml restantes',
        daysLeft: 32,
        paoStatus: 'Abierto hace 25 días • 65 días de PAO restante',
        stockWarning: false,
      },
    ],
  };

  // Datos detallados de la rutina AM (Protección y Antioxidantes)
  const amRoutine = {
    title: 'Rutina Diurna: Blindaje Antioxidante y Fotoprotección',
    cycleDay: 'Protocolo de Mañana Diario',
    badge: 'Protección UV & TEWL',
    purpose: 'Neutralizar radicales libres causados por luz visible y radiación solar, sellar la hidratación matutina y blindar contra foto-envejecimiento.',
    incompatibilityAlert: 'El protector solar debe ser siempre el último paso cosmético antes del maquillaje. Dejar secar 3 minutos antes de aplicar base.',
    steps: [
      {
        id: 'am-1',
        order: 1,
        phase: 'Higiene suave',
        productName: 'Limpiador Facial Hidratante Syndet',
        brand: 'CeraVe',
        dosage: '1 pulsación',
        technique: 'Limpieza ligera para remover sebo nocturno sin deslipidizar la piel.',
        waitTime: 'Secar a toques suaves',
        bottleLevel: 75,
        volumeLeft: '~150 ml',
        daysLeft: 40,
        paoStatus: 'Óptimo',
        stockWarning: false,
      },
      {
        id: 'am-2',
        order: 2,
        phase: 'Activo antioxidante',
        productName: 'Niacinamide 10% + Zinc 1%',
        brand: 'The Ordinary',
        dosage: '3 gotas',
        technique: 'Aplicar en frente y mejillas. Regula el sebo y refuerza la síntesis de ceramidas.',
        waitTime: 'Esperar 60 segundos',
        bottleLevel: 50,
        volumeLeft: '~15 ml',
        daysLeft: 25,
        paoStatus: 'Óptimo',
        stockWarning: false,
      },
      {
        id: 'am-3',
        order: 3,
        phase: 'Hidratación ligera',
        productName: 'Loción Hidratante Facial Ultraligera',
        brand: 'CeraVe',
        dosage: '1 pulsación',
        technique: 'Extender en rostro y cuello con movimientos ascendentes.',
        waitTime: 'Esperar 2 minutos',
        bottleLevel: 85,
        volumeLeft: '~45 ml',
        daysLeft: 50,
        paoStatus: 'Óptimo',
        stockWarning: false,
      },
      {
        id: 'am-4',
        order: 4,
        phase: 'Fotoprotección esencial',
        productName: 'Fusion Water Magic SPF 50',
        brand: 'ISDIN',
        dosage: 'Regla de los 2 dedos (líneas en índice y corazón)',
        technique: 'Aplicar uniformemente en rostro, orejas y cuello. No olvidar párpados y sienes.',
        waitTime: 'Esperar 10 minutos antes de exponerse al sol',
        bottleLevel: 45,
        volumeLeft: '~22 ml',
        daysLeft: 20,
        paoStatus: 'Abierto hace 40 días',
        stockWarning: true,
      },
    ],
  };

  const currentRoutineData = activeSlot === 'PM' ? pmRoutine : amRoutine;

  return (
    <UserAppShell activeNavId="mi-rutina">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
        
        {/* ========================================================= */}
        {/* HEADER EXPLICATIVO DE LA RUTINA                           */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider mb-1 border border-[#D5E2DB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentRoutineData.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Mi rutina dermatológica explicativa
            </h1>
            <p className="text-xs sm:text-sm text-[#5D6B63] max-w-2xl">
              Aprende el orden científico exacto, dosificación, tiempos de absorción y prevención de incompatibilidades para proteger tu piel.
            </p>
          </div>

          {/* Toggle AM / PM */}
          <div className="flex items-center gap-3">
            <div className="flex bg-[#EFECE6] p-1 rounded-full border border-[#E8E1D7] shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveSlot('AM')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeSlot === 'AM'
                    ? 'bg-white text-[#2E7D5B] shadow-2xs'
                    : 'text-[#66615C] hover:text-[#2D2825]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Mañana (AM)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSlot('PM')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  activeSlot === 'PM'
                    ? 'bg-white text-[#2E7D5B] shadow-2xs'
                    : 'text-[#66615C] hover:text-[#2D2825]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-sky-600" />
                <span>Noche (PM)</span>
              </button>
            </div>

            <Link
              href="/calendario"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F2F7F4] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#2E7D5B]" />
              <span>Ver calendario</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BANNER PRINCIPAL CON BOTÓN DE MASCARILLA VIRTUAL AR       */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#113D32] via-[#1B4D3E] to-[#2E7D58] text-white p-6 sm:p-8 shadow-md">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[#A8E6CF] text-xs font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentRoutineData.cycleDay}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {currentRoutineData.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                {currentRoutineData.purpose}
              </p>
            </div>

            {/* BOTÓN HERO: ACTIVAR GUÍA VIRTUAL CON MASCARILLA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleLaunchArMask(activeSlot === 'PM' ? 'skin_cycling' : 'spf_shield')}
                className="px-6 py-4 rounded-2xl bg-white hover:bg-[#E6F4EC] text-[#113D32] font-extrabold text-sm shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group cursor-pointer hover:scale-102 active:scale-98"
              >
                <div className="w-8 h-8 rounded-full bg-[#E6F4EC] group-hover:bg-[#2E7D58] group-hover:text-white flex items-center justify-center text-[#2E7D5B] transition">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="block leading-none text-xs font-black uppercase text-[#2E7D5B]">
                    Guía en vivo con Cámara
                  </span>
                  <span className="block text-sm font-extrabold text-[#113D32] mt-0.5">
                    Activar Mascarilla Virtual AR
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2E7D5B] group-hover:translate-x-1 transition ml-1" />
              </button>
            </div>
          </div>

          {/* Círculo estético decorativo de fondo */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* ALERTA CLÍNICA DE INCOMPATIBILIDAD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-900 block">
              Regla de compatibilidad y seguridad dermatológica:
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">
              {currentRoutineData.incompatibilityAlert}
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LISTADO PASO A PASO EXPLICATIVO CON NIVELES DE ENVASE     */}
        {/* ========================================================= */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
            <h3 className="text-base sm:text-lg font-extrabold text-[#2D2825]">
              Protocolo paso a paso y dosificación ({currentRoutineData.steps.length} pasos)
            </h3>
            <span className="text-xs text-[#7E756F]">
              Haz clic en la casilla para marcar el paso completado
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {currentRoutineData.steps.map((step) => {
              const isDone = !!completedSteps[step.id];
              return (
                <div
                  key={step.id}
                  className={`bg-white rounded-3xl p-5 sm:p-7 border transition-all duration-200 shadow-2xs ${
                    isDone
                      ? 'border-[#2E7D5B]/40 bg-[#FAFDFB]'
                      : 'border-[#E8E1D7] hover:border-[#2E7D5B]/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    
                    {/* LADO IZQUIERDO: DETALLE DEL PASO Y TÉCNICA */}
                    <div className="space-y-4 flex-1">
                      
                      {/* Cabecera del paso */}
                      <div className="flex items-start gap-3.5">
                        <button
                          type="button"
                          onClick={() => toggleStep(step.id, step.productName)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border transition mt-0.5 shrink-0 cursor-pointer ${
                            isDone
                              ? 'bg-[#2E7D5B] border-[#2E7D5B] text-white'
                              : 'bg-white border-[#D5CDC5] hover:border-[#2E7D5B]'
                          }`}
                          aria-label={`Marcar paso ${step.order}`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold text-[#7E756F]">{step.order}</span>}
                        </button>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                              Paso {step.order}: {step.phase}
                            </span>
                            {isDone && (
                              <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aplicado</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-[#2D2825]">
                            {step.productName} <span className="text-xs font-medium text-[#7E756F]">({step.brand})</span>
                          </h4>
                        </div>
                      </div>

                      {/* Explicación clínica y técnica de aplicación */}
                      <div className="space-y-2 bg-[#FAFAF7] p-4 rounded-2xl border border-[#E8E1D7] text-xs">
                        <div className="flex items-center gap-2 font-bold text-[#2D2825]">
                          <Droplets className="w-3.5 h-3.5 text-[#2E7D5B]" />
                          <span>Dosificación:</span>
                          <span className="font-normal text-[#5D6B63]">{step.dosage}</span>
                        </div>
                        <p className="text-[#374151] leading-relaxed">
                          <strong className="text-[#2D2825]">Modo de aplicación: </strong>
                          {step.technique}
                        </p>
                        <div className="flex items-center gap-2 pt-1 text-[11px] font-semibold text-[#2E7D5B]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{step.waitTime}</span>
                        </div>
                      </div>

                    </div>

                    {/* LADO DERECHO: NIVEL DEL ENVASE Y STOCK ESTIMADO */}
                    <div className="w-full lg:w-72 bg-[#FAFAF7] p-4 sm:p-5 rounded-2xl border border-[#E8E1D7] space-y-3 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#2E7D5B]" />
                          <span>Nivel del envase</span>
                        </span>
                        <span className="text-xs font-extrabold text-[#2D2825]">
                          {step.bottleLevel}%
                        </span>
                      </div>

                      {/* Barra visual de nivel del frasco */}
                      <div className="w-full h-3 bg-[#E8E1D7] rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            step.bottleLevel <= 35
                              ? 'bg-amber-500'
                              : 'bg-[#2E7D5B]'
                          }`}
                          style={{ width: `${step.bottleLevel}%` }}
                        />
                      </div>

                      <div className="space-y-1 text-[11px] text-[#5D6B63]">
                        <div className="flex justify-between">
                          <span>Volumen restante:</span>
                          <span className="font-bold text-[#2D2825]">{step.volumeLeft}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Usos aproximados:</span>
                          <span className="font-bold text-[#2D2825]">~{step.daysLeft} días</span>
                        </div>
                        <p className="text-[10px] text-[#8C827A] pt-1 border-t border-[#E8E1D7]">
                          {step.paoStatus}
                        </p>
                      </div>

                      {step.stockWarning && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between">
                          <span>Envase próximo a agotarse</span>
                          <Link
                            href="/tiendas"
                            className="text-[#2E7D5B] font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Comprar</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* VISOR MODAL: MASCARILLA VIRTUAL AR                        */}
      {/* ========================================================= */}
      {isArMaskOpen && (
        <VirtualFaceMaskTutorial
          initialRoutine={arRoutineType}
          onClose={() => setIsArMaskOpen(false)}
        />
      )}

    </UserAppShell>
  );
}

export default function MiRutinaExplicativaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2E7D5B] border-t-transparent animate-spin" />
      </div>
    }>
      <MiRutinaContent />
    </Suspense>
  );
}
