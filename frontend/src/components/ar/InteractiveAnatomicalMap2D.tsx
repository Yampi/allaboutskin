'use client';

import React, { useState, useId } from 'react';
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Camera,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Zap,
  Hand,
  Check,
  ChevronRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import {
  FaceZoneKey,
  TutorialStep,
  TutorialRoutine,
  ZoneCoverageState,
  VirtualTextureType
} from './types';
import { FACE_ZONES_CONFIG } from './FaceMaskArEngine';
import { arAudio } from './arSoundEffects';

export interface InteractiveAnatomicalMap2DProps {
  currentRoutine: TutorialRoutine;
  currentStepIndex: number;
  currentStep: TutorialStep;
  activeStepZones: FaceZoneKey[];
  coverage: ZoneCoverageState;
  onZoneCoverageChange: (zone: FaceZoneKey, newPercentage: number) => void;
  selectedMaskType: VirtualTextureType;
  lastCompletedZone: FaceZoneKey | null;
  onNextStep: () => void;
  onPrevStep: () => void;
  isStepFinished: boolean;
  onSwitchToCamera?: () => void;
  hasCameraSupport?: boolean;
}

// Preset color map for bioluminescent glow accents in DLG-HYBRID
const PRESET_COLOR_MAP: Record<string, { stroke: string; glow: string; textClass: string; bgClass: string; ringClass: string }> = {
  emerald_lines: {
    stroke: '#10B981',
    glow: 'rgba(16, 185, 129, 0.65)',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30',
    ringClass: 'ring-emerald-500/40',
  },
  cyan_lines: {
    stroke: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.65)',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10 border-cyan-500/30',
    ringClass: 'ring-cyan-500/40',
  },
  gold_lines: {
    stroke: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.65)',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/30',
    ringClass: 'ring-amber-500/40',
  },
  rose_lines: {
    stroke: '#F43F5E',
    glow: 'rgba(244, 63, 94, 0.65)',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10 border-rose-500/30',
    ringClass: 'ring-rose-500/40',
  },
  clay_mint: {
    stroke: '#527D5E',
    glow: 'rgba(82, 125, 94, 0.65)',
    textClass: 'text-emerald-300',
    bgClass: 'bg-emerald-600/10 border-emerald-600/30',
    ringClass: 'ring-emerald-600/40',
  },
  clay_white: {
    stroke: '#E2DEC9',
    glow: 'rgba(226, 222, 201, 0.65)',
    textClass: 'text-stone-300',
    bgClass: 'bg-stone-500/10 border-stone-500/30',
    ringClass: 'ring-stone-400/40',
  },
};

// Pedagogical massage directional arrows metadata
const ZONE_MASSAGE_DIRECTIONS: Record<FaceZoneKey, {
  motionTitle: string;
  motionInstruction: string;
  arrowPaths: Array<{ d: string; label?: string }>;
}> = {
  forehead: {
    motionTitle: 'Movimiento Circular y Ascendente',
    motionInstruction: 'Desde el entrecejo hacia la línea del cabello y las sienes',
    arrowPaths: [
      { d: 'M 200, 140 Q 155, 115 130, 95' }, // Hacia sien izquierda
      { d: 'M 200, 140 Q 245, 115 270, 95' }, // Hacia sien derecha
      { d: 'M 200, 145 L 200, 80' },           // Ascendente centro
    ],
  },
  nose: {
    motionTitle: 'Fricción Circular en Aletas',
    motionInstruction: 'Círculos pequeños y deslizamiento descendente a lo largo del puente',
    arrowPaths: [
      { d: 'M 200, 185 L 200, 275' },          // A lo largo del dorso
      { d: 'M 183, 280 C 172, 285 174, 300 185, 298' }, // Círculo aleta izquierda
      { d: 'M 217, 280 C 228, 285 226, 300 215, 298' }, // Círculo aleta derecha
    ],
  },
  leftCheek: {
    motionTitle: 'Drenaje Ascendente a la Sien',
    motionInstruction: 'Desde el surco nasolabial hacia el pómulo y oreja izquierda',
    arrowPaths: [
      { d: 'M 160, 295 Q 120, 270 95, 225' },  // Hacia pómulo superior
      { d: 'M 150, 325 Q 115, 305 90, 265' },  // Hacia ángulo mandibular
    ],
  },
  rightCheek: {
    motionTitle: 'Drenaje Ascendente a la Sien',
    motionInstruction: 'Desde el surco nasolabial hacia el pómulo y oreja derecha',
    arrowPaths: [
      { d: 'M 240, 295 Q 280, 270 305, 225' }, // Hacia pómulo superior
      { d: 'M 250, 325 Q 285, 305 310, 265' }, // Hacia ángulo mandibular
    ],
  },
  chin: {
    motionTitle: 'Drenaje Mandibular Lateral',
    motionInstruction: 'Desde el centro del mentón hacia los extremos de la mandíbula',
    arrowPaths: [
      { d: 'M 190, 400 Q 165, 410 148, 385' }, // Hacia oreja izquierda
      { d: 'M 210, 400 Q 235, 410 252, 385' }, // Hacia oreja derecha
    ],
  },
  eyeContour: {
    motionTitle: 'Toques Ligeros (Patting)',
    motionInstruction: 'Presión delicada sin frotar con el dedo anular alrededor del hueso orbital',
    arrowPaths: [
      { d: 'M 125, 220 Q 145, 230 165, 220' }, // Arco inferior izquierdo
      { d: 'M 275, 220 Q 255, 230 235, 220' }, // Arco inferior derecho
    ],
  },
  neck: {
    motionTitle: 'Trazos Ascendentes Firmes',
    motionInstruction: 'Desde las clavículas hacia el mentón para favorecer el sostén de la piel',
    arrowPaths: [
      { d: 'M 145, 490 Q 155, 455 170, 425' },
      { d: 'M 200, 495 L 200, 435' },
      { d: 'M 255, 490 Q 245, 455 230, 425' },
    ],
  },
};

export default function InteractiveAnatomicalMap2D({
  currentRoutine,
  currentStepIndex,
  currentStep,
  activeStepZones,
  coverage,
  onZoneCoverageChange,
  selectedMaskType,
  lastCompletedZone,
  onNextStep,
  onPrevStep,
  isStepFinished,
  onSwitchToCamera,
  hasCameraSupport = true,
}: InteractiveAnatomicalMap2DProps) {
  const [selectedHoverZone, setSelectedHoverZone] = useState<FaceZoneKey | null>(null);
  const [activeZoneInFocus, setActiveZoneInFocus] = useState<FaceZoneKey | null>(activeStepZones[0] || null);

  const filterId = useId();
  const theme = PRESET_COLOR_MAP[selectedMaskType] || PRESET_COLOR_MAP.emerald_lines;

  // Calculate overall step coverage
  const overallStepCoverage = React.useMemo(() => {
    if (activeStepZones.length === 0) return 100;
    const sum = activeStepZones.reduce((acc, key) => acc + (coverage[key] || 0), 0);
    return Math.min(100, Math.round(sum / activeStepZones.length));
  }, [coverage, activeStepZones]);

  // Handle click on zone to increase coverage
  const handleApplyZone = (zone: FaceZoneKey, increment = 34) => {
    const currentVal = coverage[zone] || 0;
    const nextVal = Math.min(100, currentVal + increment);
    onZoneCoverageChange(zone, nextVal);
    setActiveZoneInFocus(zone);

    if (nextVal >= 100 && currentVal < 100) {
      arAudio.playZoneComplete();
    } else {
      arAudio.playTick();
    }
  };

  // Autocomplete all zones of current step
  const handleAutocompleteStep = () => {
    activeStepZones.forEach((zone) => {
      onZoneCoverageChange(zone, 100);
    });
    arAudio.playZoneComplete();
  };

  // Reset current step coverage
  const handleResetStep = () => {
    activeStepZones.forEach((zone) => {
      onZoneCoverageChange(zone, 0);
    });
    arAudio.playTick();
  };

  return (
    <div className="w-full bg-slate-950/95 border border-slate-800/80 rounded-2xl md:rounded-3xl p-3 sm:p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background Subtle Gradient Grid (DLG-EXEC + DLG-HYBRID Glow) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Bar: Mode info + Switch to Camera Button */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Modo Guía Anatómica 2D
              </span>
              <span className="text-[10px] font-sans text-slate-400">
                Acelerado • Accesible • Sin Cámara
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {currentRoutine.name}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasCameraSupport && onSwitchToCamera && (
            <button
              onClick={onSwitchToCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-slate-200 hover:text-emerald-300 text-xs font-semibold transition cursor-pointer shadow-sm group"
              title="Cambiar a la cámara en vivo con filtro AR"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Activar Cámara AR</span>
            </button>
          )}

          <button
            onClick={handleResetStep}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
            title="Reiniciar cobertura de este paso"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Face SVG + Guidance Panel */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Interactive Vector Face Anatomical Map (DLG-HYBRID Wow Moment 1) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 relative">
          {/* Active Preset Tag Indicator */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.stroke }} />
            <span>Filtro: {selectedMaskType.replace('_', ' ')}</span>
          </div>

          {/* Overall Progress Circle Mini */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[11px] font-mono bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">Progreso paso:</span>
            <span className={`font-bold ${overallStepCoverage >= 95 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {overallStepCoverage}%
            </span>
          </div>

          {/* SVG Anatomical Canvas */}
          <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-[400/520] relative">
            <svg
              viewBox="0 0 400 520"
              className="w-full h-full select-none"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Bioluminescent Glow Filter */}
                <filter id={`glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Animated Flow Arrow Marker */}
                <marker
                  id={`arrow-${filterId}`}
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={theme.stroke} />
                </marker>
              </defs>

              {/* Head Silhouette Base Contour */}
              <path
                d="M 200, 45 C 130, 45 75, 110 75, 190 C 75, 270 100, 350 145, 410 C 165, 435 190, 445 200, 445 C 210, 445 235, 435 255, 410 C 300, 350 325, 270 325, 190 C 325, 110 270, 45 200, 45 Z"
                fill="#0F172A"
                stroke="#1E293B"
                strokeWidth="2"
              />

              {/* ========================================================= */}
              {/* ANATOMICAL ZONES                                          */}
              {/* ========================================================= */}

              {/* 1. NECK / CUELLO */}
              {renderZonePath({
                key: 'neck',
                d: 'M 148, 412 C 145, 440 120, 475 90, 510 L 310, 510 C 280, 475 255, 440 252, 412 Z',
              })}

              {/* 2. FOREHEAD / FRENTE */}
              {renderZonePath({
                key: 'forehead',
                d: 'M 115, 160 C 105, 110 140, 60 200, 60 C 260, 60 295, 110 285, 160 C 255, 155 225, 160 200, 165 C 175, 160 145, 155 115, 160 Z',
              })}

              {/* 3. EYE CONTOUR / CONTORNO DE OJOS */}
              {renderZonePath({
                key: 'eyeContour',
                d: 'M 108, 175 C 135, 165 170, 168 178, 190 C 185, 212 165, 235 138, 235 C 112, 235 98, 210 108, 175 Z M 292, 175 C 265, 165 230, 168 222, 190 C 215, 212 235, 235 262, 235 C 288, 235 302, 210 292, 175 Z',
              })}

              {/* 4. NOSE / NARIZ */}
              {renderZonePath({
                key: 'nose',
                d: 'M 188, 175 C 195, 175 205, 175 212, 175 L 214, 255 C 228, 260 234, 275 226, 292 C 218, 305 206, 308 200, 308 C 194, 308 182, 305 174, 292 C 166, 275 172, 260 186, 255 Z',
              })}

              {/* 5. LEFT CHEEK / MEJILLA IZQUIERDA */}
              {renderZonePath({
                key: 'leftCheek',
                d: 'M 82, 195 C 92, 180 105, 175 105, 185 C 96, 215 110, 240 135, 240 C 155, 240 168, 260 170, 290 C 170, 310 155, 345 135, 360 C 100, 320 80, 255 82, 195 Z',
              })}

              {/* 6. RIGHT CHEEK / MEJILLA DERECHA */}
              {renderZonePath({
                key: 'rightCheek',
                d: 'M 318, 195 C 308, 180 295, 175 295, 185 C 304, 215 290, 240 265, 240 C 245, 240 232, 260 230, 290 C 230, 310 245, 345 265, 360 C 300, 320 320, 255 318, 195 Z',
              })}

              {/* 7. CHIN / MENTÓN */}
              {renderZonePath({
                key: 'chin',
                d: 'M 148, 365 C 170, 355 200, 352 200, 352 C 200, 352 230, 355 252, 365 C 250, 395 235, 428 200, 442 C 165, 428 150, 395 148, 365 Z',
              })}

              {/* Anatomical Reference Details (Eyes, Mouth, Brows) */}
              <g pointerEvents="none" opacity="0.4">
                {/* Eyebrows */}
                <path d="M 120, 168 Q 145, 155 170, 168" stroke="#94A3B8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 280, 168 Q 255, 155 230, 168" stroke="#94A3B8" strokeWidth="2.5" fill="none" strokeLinecap="round" />

                {/* Eye Slits */}
                <path d="M 128, 202 Q 146, 194 164, 202 Q 146, 210 128, 202 Z" fill="#334155" />
                <path d="M 236, 202 Q 254, 194 272, 202 Q 254, 210 236, 202 Z" fill="#334155" />

                {/* Lips */}
                <path
                  d="M 172, 332 C 185, 326 200, 328 200, 328 C 200, 328 215, 326 228, 332 C 218, 346 182, 346 172, 332 Z"
                  fill="#1E293B"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
              </g>

              {/* Dynamic Massage Vectors Overlay (DLG-HYBRID Wow Moment 2) */}
              <g pointerEvents="none">
                {activeStepZones.map((zoneKey) => {
                  const dir = ZONE_MASSAGE_DIRECTIONS[zoneKey];
                  if (!dir) return null;
                  const isComplete = (coverage[zoneKey] || 0) >= 100;

                  return (
                    <g key={`vectors-${zoneKey}`} opacity={isComplete ? 0.35 : 0.95}>
                      {dir.arrowPaths.map((arrow, idx) => (
                        <path
                          key={idx}
                          d={arrow.d}
                          fill="none"
                          stroke={theme.stroke}
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                          className="animate-pulse"
                          markerEnd={`url(#arrow-${filterId})`}
                        />
                      ))}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Interactive Hint */}
          <p className="mt-2 text-center text-xs text-slate-400 font-sans flex items-center gap-1.5">
            <Hand className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span>Haz clic o toca las zonas iluminadas para aplicar producto</span>
          </p>
        </div>

        {/* Right Column: Step Guidance, Zone Focus & Progress Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Step Header */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Paso {currentStep.stepNumber} de {currentRoutine.steps.length}
              </span>
              <span className="font-sans">
                {currentRoutine.badge}
              </span>
            </div>

            <h4 className="font-serif text-lg font-bold text-white">
              {currentStep.title}
            </h4>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              {currentStep.instruction}
            </p>

            {/* Dermatological Tip Box */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300">Evidencia Médica: </span>
                {currentStep.dermatologicalTip}
              </div>
            </div>
          </div>

          {/* Active Zones Checklist with Click-to-Apply (DLG-HYBRID Wow Moment 3) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Zonas Requeridas en este Paso
              </span>
              <button
                onClick={handleAutocompleteStep}
                className="text-[11px] font-sans text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
              >
                Autocompletar paso
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeStepZones.map((zoneKey) => {
                const config = FACE_ZONES_CONFIG[zoneKey];
                const pct = coverage[zoneKey] || 0;
                const isFinished = pct >= 100;
                const dir = ZONE_MASSAGE_DIRECTIONS[zoneKey];
                const isFocused = activeZoneInFocus === zoneKey || selectedHoverZone === zoneKey;

                return (
                  <button
                    key={zoneKey}
                    type="button"
                    onClick={() => handleApplyZone(zoneKey, 34)}
                    onMouseEnter={() => setSelectedHoverZone(zoneKey)}
                    onMouseLeave={() => setSelectedHoverZone(null)}
                    onFocus={() => setActiveZoneInFocus(zoneKey)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                      isFinished
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : isFocused
                        ? 'bg-slate-800/80 border-emerald-400/60 shadow-lg text-white'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    {/* Background Progress Bar Fill */}
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />

                    <div className="relative z-10 flex items-center justify-between mb-1">
                      <span className="font-sans font-semibold text-xs flex items-center gap-1.5">
                        {isFinished ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: config.colorHex }}
                          />
                        )}
                        <span>{config.shortLabel}</span>
                      </span>

                      <span className="font-mono text-[11px] font-bold">
                        {pct}%
                      </span>
                    </div>

                    <div className="relative z-10 text-[10.5px] text-slate-400 line-clamp-1 font-sans">
                      {dir ? dir.motionInstruction : config.description}
                    </div>

                    <div className="relative z-10 mt-1 flex items-center justify-between text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Tocar para +34%</span>
                      <Zap className="w-3 h-3" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step Navigation Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <button
              onClick={onPrevStep}
              disabled={currentStepIndex === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              onClick={onNextStep}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg ${
                isStepFinished || overallStepCoverage >= 90
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
            >
              <span>{currentStepIndex === currentRoutine.steps.length - 1 ? 'Finalizar Rutina' : 'Siguiente Paso'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Helper method to render an anatomical zone path in the SVG
  function renderZonePath({ key, d }: { key: FaceZoneKey; d: string }) {
    const isActive = activeStepZones.includes(key);
    const pct = coverage[key] || 0;
    const isCompleted = pct >= 100;
    const isHovered = selectedHoverZone === key || activeZoneInFocus === key;
    const isRecentCompleted = lastCompletedZone === key;

    // Fill calculation based on coverage
    let fillColor = 'rgba(15, 23, 42, 0.4)'; // Subdued dark slate for inactive zones
    let strokeColor = '#334155';
    let strokeWidth = 1.5;

    if (isActive) {
      if (isCompleted) {
        fillColor = 'rgba(16, 185, 129, 0.45)';
        strokeColor = '#10B981';
        strokeWidth = 2.5;
      } else {
        // Partially covered: scale opacity from 0.15 to 0.40
        const opacity = 0.15 + (pct / 100) * 0.25;
        fillColor = `rgba(16, 185, 129, ${opacity})`;
        strokeColor = isHovered ? '#34D399' : theme.stroke;
        strokeWidth = isHovered ? 3 : 2;
      }
    }

    return (
      <g
        key={key}
        className="cursor-pointer transition-all duration-200"
        onClick={() => handleApplyZone(key, 34)}
        onMouseEnter={() => setSelectedHoverZone(key)}
        onMouseLeave={() => setSelectedHoverZone(null)}
      >
        <path
          d={d}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className={
            isRecentCompleted
              ? 'animate-ping'
              : isActive && !isCompleted
              ? 'hover:opacity-90'
              : ''
          }
          style={{
            filter: isActive ? `url(#glow-${filterId})` : undefined,
            transition: 'fill 0.3s ease, stroke 0.3s ease, stroke-width 0.2s ease',
          }}
        />

        {/* Percentage Label Tag in center of zone if active */}
        {isActive && (
          <text
            x={getZoneLabelCoordinates(key).x}
            y={getZoneLabelCoordinates(key).y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={isCompleted ? '#FFFFFF' : '#E2E8F0'}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            pointerEvents="none"
            style={{
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            {isCompleted ? '✓' : `${pct}%`}
          </text>
        )}
      </g>
    );
  }
}

// Approximate visual centers for zone numerical badges
function getZoneLabelCoordinates(key: FaceZoneKey): { x: number; y: number } {
  switch (key) {
    case 'forehead':
      return { x: 200, y: 110 };
    case 'nose':
      return { x: 200, y: 240 };
    case 'leftCheek':
      return { x: 125, y: 280 };
    case 'rightCheek':
      return { x: 275, y: 280 };
    case 'chin':
      return { x: 200, y: 395 };
    case 'eyeContour':
      return { x: 145, y: 200 };
    case 'neck':
      return { x: 200, y: 470 };
    default:
      return { x: 200, y: 200 };
  }
}
