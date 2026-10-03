'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronRight,
  Zap,
  Info,
  SlidersHorizontal,
  Droplets,
  Sun,
  Award,
  VideoOff,
  Maximize2,
  Minimize2,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
} from 'lucide-react';
import {
  FaceZoneKey,
  VirtualTextureType,
  TutorialRoutineType,
  ZoneCoverageState,
  ArFilterConfig,
  ArExperiencePhase,
  MaskDisplayMode,
  HeadPose,
  HeadCalibrationState,
} from './types';
import { FaceMaskArEngine, FACE_ZONES_CONFIG } from './FaceMaskArEngine';
import { TUTORIAL_ROUTINES } from './tutorialRoutines';
import { arAudio } from './arSoundEffects';
import InteractiveAnatomicalMap2D from './InteractiveAnatomicalMap2D';

interface VirtualFaceMaskTutorialProps {
  onClose?: () => void;
  initialRoutine?: TutorialRoutineType;
}

export const COSMETIC_MASK_PRESETS: Array<{
  id: VirtualTextureType;
  name: string;
  shortDesc: string;
  tag: string;
  colorHex: string;
  borderHex: string;
  accentBg: string;
}> = [
  {
    id: 'emerald_lines',
    name: 'Verde Clínico Láser',
    shortDesc: 'Piel 100% transparente con líneas de alta precisión',
    tag: 'Recomendado',
    colorHex: 'rgba(16, 185, 129, 0.85)',
    borderHex: '#10B981',
    accentBg: 'from-emerald-950/40 via-teal-950/20 to-emerald-950/40',
  },
  {
    id: 'cyan_lines',
    name: 'Cian Holográfico',
    shortDesc: 'Líneas bioluminiscentes de definición dérmica',
    tag: 'Bioluminiscente',
    colorHex: 'rgba(6, 182, 212, 0.85)',
    borderHex: '#06B6D4',
    accentBg: 'from-cyan-950/40 via-teal-950/20 to-cyan-950/40',
  },
  {
    id: 'gold_lines',
    name: 'Oro Champagne',
    shortDesc: 'Líneas satinadas de contorneado y arquitectura facial',
    tag: 'Contorneado',
    colorHex: 'rgba(245, 158, 11, 0.85)',
    borderHex: '#F59E0B',
    accentBg: 'from-amber-950/40 via-yellow-950/20 to-amber-950/40',
  },
  {
    id: 'rose_lines',
    name: 'Rosa Calmante',
    shortDesc: 'Delineado suave para pieles sensibles',
    tag: 'Piel Sensible',
    colorHex: 'rgba(244, 63, 94, 0.85)',
    borderHex: '#F43F5E',
    accentBg: 'from-rose-950/40 via-pink-950/20 to-rose-950/40',
  },
  {
    id: 'clay_mint',
    name: 'Arcilla Matcha (Pasta)',
    shortDesc: 'Pasta densa de spa (opcional con color)',
    tag: 'Textura Spa',
    colorHex: 'rgba(92, 138, 102, 0.78)',
    borderHex: '#527D5E',
    accentBg: 'from-emerald-950/40 via-teal-950/20 to-emerald-950/40',
  },
  {
    id: 'clay_white',
    name: 'Caolín Blanco (Pasta)',
    shortDesc: 'Crema calmante de avena (opcional con color)',
    tag: 'Textura Spa',
    colorHex: 'rgba(238, 235, 226, 0.88)',
    borderHex: '#E2DEC9',
    accentBg: 'from-stone-900/50 via-zinc-900/30 to-stone-900/50',
  },
];

export default function VirtualFaceMaskTutorial({
  onClose,
  initialRoutine = 'double_cleansing',
}: VirtualFaceMaskTutorialProps) {
  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // AR Engine Instance
  const engineRef = useRef<FaceMaskArEngine | null>(null);

  // Experience Phase:
  // 1. 'calibrating': Calibración 3D del rostro con movimientos de cabeza
  // 2. 'ready': Mascarilla pegada a la cara -> El usuario elige rutina o textura
  // 3. 'tutorial': Modo guiado activo (desmaquillado, rutina diaria, spf)
  const [phase, setPhase] = useState<ArExperiencePhase>('calibrating');
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationState, setCalibrationState] = useState<HeadCalibrationState>({
    center: false,
    left: false,
    right: false,
    tilt: false,
    currentStep: 'center',
    percent: 0,
  });
  const [headPose, setHeadPose] = useState<HeadPose>({
    yaw: 0,
    pitch: 0,
    roll: 0,
    angleDegrees: { yaw: 0, pitch: 0, roll: 0 },
  });

  // Active state
  const [selectedRoutineKey, setSelectedRoutineKey] = useState<TutorialRoutineType>(initialRoutine);
  const [selectedMaskType, setSelectedMaskType] = useState<VirtualTextureType>('emerald_lines');
  const [maskDisplayMode, setMaskDisplayMode] = useState<MaskDisplayMode>('transparent_lines');
  const [maskOpacity, setMaskOpacity] = useState<number>(0.85);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'camera' | 'anatomical_2d'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fps, setFps] = useState(60);

  // Clean Mirror Mode (hides panels so user has 100% full screen face mirror)
  const [cleanMirrorMode, setCleanMirrorMode] = useState(false);

  // Web Camera Zoom & Pan State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Coverage & Completed Zones
  const [coverage, setCoverage] = useState<ZoneCoverageState>({
    forehead: 0,
    nose: 0,
    leftCheek: 0,
    rightCheek: 0,
    chin: 0,
    eyeContour: 0,
    neck: 0,
  });
  const [lastCompletedZone, setLastCompletedZone] = useState<FaceZoneKey | null>(null);
  const [isStepFinished, setIsStepFinished] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Filter Configuration
  const [config, setConfig] = useState<ArFilterConfig>({
    showHoloMesh: false,
    showFullMask: false, // 100% TRANSPARENT SKIN! No colored fill!
    showZoneOutlines: true, // Biometric zone lines delineate facial anatomy
    showZoneParticles: true,
    enableSoundChimes: true,
    textureType: 'emerald_lines',
    maskOpacity: 0.85,
    maskDisplayMode: 'transparent_lines',
    zoomLevel: 1.0,
    sensitivity: 'normal',
    mirrorMode: true,
    enableRigidAnchor: true,
    brushTrailStyle: 'off',
  });

  // Framing aspect ratio
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>(16 / 9);

  // Current Routine & Step
  const currentRoutine = TUTORIAL_ROUTINES[selectedRoutineKey];
  const currentStep = currentRoutine.steps[currentStepIndex] || currentRoutine.steps[0];
  const activeStepZones = currentStep.activeZones;

  // Calculate Overall Step Progress (0 to 100%)
  const overallStepCoverage = useMemo(() => {
    if (activeStepZones.length === 0) return 100;
    const sum = activeStepZones.reduce((acc, key) => acc + (coverage[key] || 0), 0);
    return Math.min(100, Math.round(sum / activeStepZones.length));
  }, [coverage, activeStepZones]);

  // =========================================================================
  // CAMERA ZOOM & PAN HANDLERS
  // =========================================================================
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(3.0, Math.round((prev + 0.25) * 100) / 100));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const next = Math.max(1.0, Math.round((prev - 0.25) * 100) / 100);
      if (next <= 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleSetZoomPreset = useCallback((preset: number) => {
    setZoomLevel(preset);
    if (preset <= 1.0) {
      setPanOffset({ x: 0, y: 0 });
    }
    arAudio.playTick();
  }, []);

  const handleRecenter = useCallback(() => {
    setPanOffset({ x: 0, y: 0 });
    arAudio.playTick();
  }, []);

  const handleResetAllZoom = useCallback(() => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    arAudio.playTick();
  }, []);

  // Mouse wheel zoom inside camera frame
  const handleWheelZoom = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel((prev) => {
      const next = Math.max(1.0, Math.min(3.0, Math.round((prev + delta) * 10) / 10));
      if (next <= 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Pointer drag to pan (when zoom > 1.0)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (zoomLevel <= 1.0) return;
    setIsDraggingPan(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...panOffset };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [zoomLevel, panOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingPan) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Max pan limit proportional to zoom level to keep face on screen
    const maxPanX = (zoomLevel - 1) * 260;
    const maxPanY = (zoomLevel - 1) * 200;

    const newX = Math.max(-maxPanX, Math.min(maxPanX, startPanRef.current.x + dx));
    const newY = Math.max(-maxPanY, Math.min(maxPanY, startPanRef.current.y + dy));

    setPanOffset({ x: newX, y: newY });
  }, [isDraggingPan, zoomLevel]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDraggingPan) {
      setIsDraggingPan(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  }, [isDraggingPan]);

  // =========================================================================
  // AR ENGINE INITIALIZATION & LISTENERS
  // =========================================================================
  useEffect(() => {
    const engine = new FaceMaskArEngine();
    engineRef.current = engine;

    engine.onZoneProgress = (newCoverage) => {
      setCoverage(newCoverage);
    };

    engine.onZoneCompleted = (zone) => {
      setLastCompletedZone(zone);
      arAudio.playZoneComplete();
      setTimeout(() => setLastCompletedZone(null), 2500);
    };

    engine.onFpsUpdate = (currentFps) => {
      setFps(currentFps);
    };

    engine.onHeadPoseUpdate = (pose) => {
      setHeadPose(pose);
    };

    engine.onCalibrationUpdate = (calState) => {
      setCalibrationState(calState);
      setCalibrationProgress(calState.percent);
      if (calState.currentStep !== 'complete') {
        arAudio.playTick();
      }
    };

    engine.onCalibrationCompleted = () => {
      arAudio.playRoutineSuccess();
      engine.freezeFaceAnchor();
      engine.setMotionTracking(false);
      engine.showBrushTrail = false;
      engine.clearBrushTrail();
      engine.resetCoverage();
      setPhase('ready');
    };

    engine.initMediaPipe();
    startCamera('user');

    return () => {
      stopCamera();
      engine.detach();
      engineRef.current = null;
    };
  }, []);

  // Smooth scroll into view for laptop viewports
  useEffect(() => {
    const timer = setTimeout(() => {
      videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  // Handle phase changes & start calibration
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (phase === 'calibrating') {
      engine.startCalibration();
      engine.setMotionTracking(false);
      engine.showBrushTrail = false;
      engine.clearBrushTrail();
      engine.resetCoverage();
    } else if (phase === 'ready') {
      engine.isCalibrating = false;
      engine.setMotionTracking(false);
      engine.showBrushTrail = false;
      engine.clearBrushTrail();
      engine.resetCoverage();
      engine.freezeFaceAnchor();
    } else if (phase === 'tutorial') {
      engine.isCalibrating = false;
      engine.setMotionTracking(false);
      engine.showBrushTrail = false;
      engine.clearBrushTrail();
      engine.resetCoverage();
    }
  }, [phase]);

  // Sync engine settings when config changes
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    engine.showFullMask = config.showFullMask;
    engine.showHoloMesh = config.showHoloMesh;
    engine.showZoneOutlines = config.showZoneOutlines;
    engine.showParticles = config.showZoneParticles;
    engine.textureType = config.textureType;
    engine.maskOpacity = config.maskOpacity;
    engine.maskDisplayMode = config.maskDisplayMode;
    engine.activeTutorialZones =
      phase === 'tutorial'
        ? activeStepZones
        : ['forehead', 'nose', 'leftCheek', 'rightCheek', 'chin'];
    engine.mirrorMode = config.mirrorMode;
    engine.sensitivityMultiplier =
      config.sensitivity === 'high' ? 1.6 : config.sensitivity === 'low' ? 0.7 : 1.0;
    engine.enableRigidAnchor = config.enableRigidAnchor ?? true;
    engine.brushTrailStyle = 'off';
    engine.showBrushTrail = false;
    engine.isTrackingMotion = false;

    arAudio.setMuted(!config.enableSoundChimes);
  }, [config, activeStepZones, phase]);

  // Check if step target is achieved in tutorial mode
  useEffect(() => {
    if (phase === 'tutorial' && overallStepCoverage >= 95 && !isStepFinished) {
      setIsStepFinished(true);
      arAudio.playRoutineSuccess();
      if (currentStepIndex === currentRoutine.steps.length - 1) {
        setShowCelebrationModal(true);
      }
    }
  }, [overallStepCoverage, isStepFinished, currentStepIndex, currentRoutine.steps.length, phase]);

  // Attach elements to engine once video plays
  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current || !canvasRef.current || !engineRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw;
    canvas.height = vh;
    if (vh > 0) {
      setVideoAspectRatio(vw / vh);
    }

    engineRef.current.attach(video, canvas);
  };

  // Camera Management
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este dispositivo.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setIsCameraActive(true);

        if (canvasRef.current && engineRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth || 640;
          canvasRef.current.height = videoRef.current.videoHeight || 480;
          engineRef.current.attach(videoRef.current, canvasRef.current);
        }
      }
    } catch (err: any) {
      console.warn('Camera error:', err);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Se activó automáticamente el Modo Guía Anatómica 2D interactivo.'
          : 'No se pudo iniciar la cámara en este dispositivo. Se activó automáticamente el Modo Guía Anatómica 2D.'
      );
      setViewMode('anatomical_2d');
      setPhase((prev) => (prev === 'calibrating' ? 'tutorial' : prev));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleFacingMode = () => {
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    startCamera(next);
  };

  // Quick switch cosmetic mask texture
  const handleSelectMaskPreset = (presetId: VirtualTextureType) => {
    setSelectedMaskType(presetId);
    setConfig((prev) => ({ ...prev, textureType: presetId }));
    arAudio.playTick();
  };

  // Switch mask display mode
  const handleSelectDisplayMode = (mode: MaskDisplayMode) => {
    setMaskDisplayMode(mode);
    setConfig((prev) => ({ ...prev, maskDisplayMode: mode }));
    arAudio.playTick();
  };

  // Change mask opacity
  const handleOpacityChange = (val: number) => {
    setMaskOpacity(val);
    setConfig((prev) => ({ ...prev, maskOpacity: val }));
  };

  // Trigger re-calibration
  const handleRestartCalibration = () => {
    if (engineRef.current) {
      engineRef.current.clearBrushTrail();
      engineRef.current.resetCoverage();
      engineRef.current.setMotionTracking(false);
      engineRef.current.showBrushTrail = false;
      engineRef.current.startCalibration();
    }
    setPhase('calibrating');
    arAudio.playTick();
  };

  // Skip calibration
  const handleSkipCalibration = () => {
    if (engineRef.current) {
      engineRef.current.skipCalibration();
      engineRef.current.clearBrushTrail();
      engineRef.current.resetCoverage();
      engineRef.current.setMotionTracking(false);
      engineRef.current.showBrushTrail = false;
    }
    setPhase('ready');
    arAudio.playZoneComplete();
  };

  // Launch guided tutorial (e.g. Desmaquillarme & Doble Limpieza)
  const handleStartTutorial = (routineType: TutorialRoutineType) => {
    setSelectedRoutineKey(routineType);
    setCurrentStepIndex(0);
    setIsStepFinished(false);
    setShowCelebrationModal(false);

    const routine = TUTORIAL_ROUTINES[routineType];
    setConfig((prev) => ({ ...prev, textureType: routine.texture }));

    if (engineRef.current) {
      engineRef.current.clearBrushTrail();
      engineRef.current.resetCoverage();
      engineRef.current.setMotionTracking(false);
      engineRef.current.showBrushTrail = false;
    }

    setPhase('tutorial');
    arAudio.playTick();
  };

  // Step Navigation in Tutorial
  const handleNextStep = () => {
    if (currentStepIndex < currentRoutine.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setIsStepFinished(false);
      engineRef.current?.clearBrushTrail();
      engineRef.current?.resetCoverage();

      const nextTexture = currentRoutine.steps[nextIdx]?.suggestedTexture;
      if (nextTexture) {
        setConfig((prev) => ({ ...prev, textureType: nextTexture }));
      }
      arAudio.playTick();
    } else {
      setShowCelebrationModal(true);
    }
  };

  const handleResetStep = () => {
    setIsStepFinished(false);
    engineRef.current?.clearBrushTrail();
    engineRef.current?.resetCoverage();
    arAudio.playTick();
  };

  const handleBoostZone = (zone: FaceZoneKey) => {
    engineRef.current?.addManualZoneCoverage(zone, 50);
    arAudio.playTick();
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setIsStepFinished(false);
      engineRef.current?.clearBrushTrail();
      engineRef.current?.resetCoverage();

      const prevTexture = currentRoutine.steps[prevIdx]?.suggestedTexture;
      if (prevTexture) {
        setConfig((prev) => ({ ...prev, textureType: prevTexture }));
      }
      arAudio.playTick();
    }
  };

  const handleZoneCoverageChangeFrom2D = (zone: FaceZoneKey, newPercentage: number) => {
    setCoverage((prev) => ({ ...prev, [zone]: newPercentage }));
    if (newPercentage >= 100) {
      setLastCompletedZone(zone);
      setTimeout(() => setLastCompletedZone(null), 2500);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#060B08] text-white flex flex-col font-sans transition-all duration-300 select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen'
          : 'rounded-2xl border border-emerald-500/30 shadow-2xl h-[clamp(440px,calc(100vh-170px),680px)]'
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP GLOBAL AR HUD CONTROLS                                             */}
      {/* ========================================================================= */}
      <div className="z-30 px-2 sm:px-4 py-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar bg-gradient-to-b from-black/90 via-black/75 to-black/40 border-b border-white/10 shrink-0 h-12">
        {/* Left: Status Badge & Telemetry */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#0B1510]/90 backdrop-blur-xl border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase whitespace-nowrap">
              {phase === 'calibrating' && 'Calibrando Rostro 3D'}
              {phase === 'ready' && 'Filtro Mascarilla Activo'}
              {phase === 'tutorial' && currentRoutine.badge}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-mono text-white/80 whitespace-nowrap shrink-0">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>{fps} FPS • En Vivo</span>
          </div>
        </div>

        {/* Center: Mode Switcher (Cámara AR vs Mapa 2D Anatómico) */}
        <div className="flex items-center bg-black/80 p-0.5 rounded-full border border-emerald-500/30 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <button
            type="button"
            onClick={() => {
              setViewMode('camera');
              if (!isCameraActive) startCamera();
              arAudio.playTick();
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'camera'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cámara AR</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('anatomical_2d');
              if (phase === 'calibrating') setPhase('tutorial');
              arAudio.playTick();
            }}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === 'anatomical_2d'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa 2D</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Zoom / Framing Toggle Button */}
          <button
            onClick={() => setFitMode((m) => (m === 'contain' ? 'cover' : 'contain'))}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 ${
              fitMode === 'contain'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-xs'
                : 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-xs'
            }`}
            title={fitMode === 'contain' ? 'Cambiar a Llenar Pantalla' : 'Cambiar a Encuadre Natural (Sin Zoom)'}
          >
            {fitMode === 'contain' ? <Eye className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {fitMode === 'contain' ? 'Sin Zoom' : 'Llenar'}
            </span>
          </button>

          {/* Rigid Face Anchor Toggle / Freeze */}
          <button
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.freezeFaceAnchor();
                arAudio.playTick();
              }
            }}
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Anclaje Rígido: La mascarilla se fija a los huesos del cráneo y no se deforma al pasar las manos. Clic para fijar posición actual."
            aria-label="Fijar anclaje rígido"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Anclaje Rígido</span>
          </button>

          {/* Interactive Brush / Cotton Trail Selector */}
          <button
            onClick={() => {
              const current = config.brushTrailStyle || 'cotton_pad';
              const next = current === 'cotton_pad' ? 'serum_glow' : current === 'serum_glow' ? 'off' : 'cotton_pad';
              setConfig((p) => ({ ...p, brushTrailStyle: next }));
              arAudio.playTick();
            }}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 ${
              config.brushTrailStyle === 'cotton_pad'
                ? 'bg-teal-500/20 text-teal-200 border-teal-400/50 shadow-xs'
                : config.brushTrailStyle === 'serum_glow'
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-xs'
                : 'bg-white/5 text-white/50 border-white/20'
            }`}
            title="Rastro Interactivo: Dibuja por dónde pasa tu mano o algodón desmaquillante"
            aria-label="Alternar rastro interactivo"
          >
            {config.brushTrailStyle === 'cotton_pad' ? (
              <>
                <Droplets className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Rastro: Algodón</span>
              </>
            ) : config.brushTrailStyle === 'serum_glow' ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Rastro: Sérum</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-white/40" />
                <span className="hidden sm:inline">Sin Rastro</span>
              </>
            )}
          </button>

          {/* Quick Clear Trail Button */}
          {config.brushTrailStyle !== 'off' && (
            <button
              onClick={() => {
                engineRef.current?.clearBrushTrail();
                arAudio.playTick();
              }}
              className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white/70 hover:text-white transition cursor-pointer"
              title="Borrar Rastro Pintado"
              aria-label="Borrar rastro pintado"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Clean Mirror Mode Toggle */}
          <button
            onClick={() => setCleanMirrorMode(!cleanMirrorMode)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition cursor-pointer flex items-center gap-1.5 ${
              cleanMirrorMode
                ? 'bg-emerald-500 text-black border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-black/60 hover:bg-black/90 border-white/20 text-white/90'
            }`}
            title={cleanMirrorMode ? 'Mostrar Panel Lateral' : 'Modo Espejo Limpio (Sin Paneles)'}
            aria-label="Alternar modo espejo limpio"
          >
            {cleanMirrorMode ? <EyeOff className="w-3.5 h-3.5 text-black" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden md:inline">
              {cleanMirrorMode ? 'Ver Panel' : 'Solo Espejo'}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setConfig((p) => ({ ...p, enableSoundChimes: !p.enableSoundChimes }))}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition cursor-pointer"
            title={config.enableSoundChimes ? 'Silenciar Sonidos' : 'Activar Sonidos'}
            aria-label="Alternar audio"
          >
            {config.enableSoundChimes ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-white/50" />}
          </button>

          {/* Switch Camera */}
          <button
            onClick={toggleFacingMode}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition cursor-pointer"
            title="Girar Cámara"
            aria-label="Girar cámara"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition cursor-pointer"
            title={isFullscreen ? 'Salir de Pantalla Completa' : 'Pantalla Completa'}
            aria-label="Pantalla completa"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md border border-red-500/40 text-red-200 transition cursor-pointer"
              title="Cerrar"
              aria-label="Cerrar filtro"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DUAL STUDIO LAYOUT: CAMERA VIEWPORT + DOCKED SIDEBAR OR 2D MAP         */}
      {/* ========================================================================= */}
      {viewMode === 'anatomical_2d' ? (
        <div className="w-full flex-1 min-h-0 overflow-y-auto p-2 sm:p-4 md:p-6 bg-[#030604] flex items-center justify-center">
          <div className="w-full max-w-5xl">
            <InteractiveAnatomicalMap2D
              currentRoutine={currentRoutine}
              currentStepIndex={currentStepIndex}
              currentStep={currentStep}
              activeStepZones={activeStepZones}
              coverage={coverage}
              onZoneCoverageChange={handleZoneCoverageChangeFrom2D}
              selectedMaskType={selectedMaskType}
              lastCompletedZone={lastCompletedZone}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              isStepFinished={isStepFinished}
              onSwitchToCamera={() => {
                setViewMode('camera');
                if (!isCameraActive) startCamera();
              }}
              hasCameraSupport={typeof navigator !== 'undefined' && !!navigator.mediaDevices}
            />
          </div>
        </div>
      ) : (
        <div className="w-full flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ======================================================================= */}
        {/* 2.A: AR CAMERA MIRROR VIEWPORT WITH ZOOM & PAN CONTROLS                 */}
        {/* ======================================================================= */}
        <div
          className={`relative flex items-center justify-center overflow-hidden bg-[#030604] p-1.5 sm:p-2 md:p-3 ${
            cleanMirrorMode
              ? 'w-full h-full'
              : 'w-full md:flex-1 h-[48%] sm:h-[52%] md:h-full min-w-0 shrink-0 md:shrink'
          }`}
          onWheel={handleWheelZoom}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            cursor: zoomLevel > 1.0 ? (isDraggingPan ? 'grabbing' : 'grab') : 'default',
            touchAction: zoomLevel > 1.0 ? 'none' : 'auto',
          }}
        >
          {/* Framed Video & Canvas Inner Container with Hardware-Accelerated Zoom/Pan */}
          <div
            className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-emerald-500/25 shadow-2xl transition-transform ${
              fitMode === 'contain' ? 'max-h-full max-w-full' : 'w-full h-full'
            }`}
            style={{
              aspectRatio: fitMode === 'contain' && videoAspectRatio ? `${videoAspectRatio}` : undefined,
              maxHeight: '100%',
              maxWidth: '100%',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: isDraggingPan ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Raw Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={handleVideoLoadedMetadata}
              className={`w-full h-full select-none ${
                fitMode === 'contain' ? 'object-contain' : 'object-cover'
              } ${config.mirrorMode ? 'scale-x-[-1]' : ''}`}
            />

            {/* Real-time Biometric Overlays & Cosmetic Clay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </div>

          {/* ===================================================================== */}
          {/* FLOATING WEB CAMERA ZOOM CONTROLS HUD                                 */}
          {/* ===================================================================== */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.7)] text-xs text-white">
            {/* Zoom Out Button */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1.0}
              className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Reducir Zoom"
              aria-label="Reducir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5 text-white/90" />
            </button>

            {/* Zoom Slider */}
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoomLevel}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setZoomLevel(val);
                if (val <= 1.0) setPanOffset({ x: 0, y: 0 });
              }}
              className="w-16 sm:w-24 h-1.5 accent-emerald-400 bg-white/20 rounded-lg cursor-pointer"
              title={`Zoom actual: ${zoomLevel.toFixed(1)}x`}
              aria-label="Nivel de zoom"
            />

            {/* Zoom In Button */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
              title="Aumentar Zoom"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5 text-white/90" />
            </button>

            {/* Zoom Badge Indicator */}
            <span className="font-mono text-[11px] font-bold text-emerald-400 min-w-[28px] text-center">
              {zoomLevel.toFixed(1)}x
            </span>

            <div className="w-[1px] h-3.5 bg-white/20" />

            {/* Quick Presets: 1.0x (Natural), 1.5x (Retrato), 2.0x (Poros) */}
            <div className="hidden sm:flex items-center gap-1">
              {[1.0, 1.5, 2.0].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSetZoomPreset(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    Math.abs(zoomLevel - preset) < 0.05
                      ? 'bg-emerald-500 text-black font-bold shadow-xs'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {preset === 1.0 ? '1x' : `${preset}x`}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-3.5 bg-white/20" />

            {/* Re-center Pan Button */}
            <button
              type="button"
              onClick={handleRecenter}
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                panOffset.x !== 0 || panOffset.y !== 0
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/10'
              }`}
              title="Centrar rostro en el marco"
              aria-label="Centrar rostro"
            >
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span className="hidden md:inline">Centrar</span>
            </button>

            {/* Pan Drag Hint */}
            {zoomLevel > 1.0 && (
              <span className="hidden xl:inline text-[9.5px] font-sans text-white/50 pl-1 border-l border-white/15">
                Arrastra para mover
              </span>
            )}
          </div>

          {/* Camera Inactive Fallback */}
          {!isCameraActive && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/90 backdrop-blur-md space-y-4">
              <VideoOff className="w-14 h-14 text-emerald-400 animate-pulse" />
              <div className="max-w-md space-y-1.5">
                <h3 className="font-serif text-lg font-bold text-white">Sensor de Cámara no Disponible</h3>
                <p className="text-xs text-white/70">
                  {cameraError || 'Iniciando cámara en vivo y detector facial...'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs uppercase tracking-wider transition cursor-pointer border border-slate-700"
                >
                  Reintentar Cámara
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('anatomical_2d');
                    if (phase === 'calibrating') setPhase('tutorial');
                    arAudio.playTick();
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-4 h-4" />
                  <span>Continuar con Mapa 2D</span>
                </button>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* 3D HEAD MOVEMENT CALIBRATION OVERLAY HUD                              */}
          {/* ===================================================================== */}
          {phase === 'calibrating' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-3 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-emerald-400/50 text-center space-y-2.5 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-mono font-bold">
                    <Compass className="w-3.5 h-3.5 animate-spin" />
                    <span>Calibrando Rostro en 3D</span>
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {calibrationProgress}%
                  </span>
                </div>

                {/* Current Instruction Step */}
                <div className="py-1">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                    {calibrationState.currentStep === 'center' && '👤 Mira de frente a la cámara'}
                    {calibrationState.currentStep === 'left' && '👈 Gira la cabeza a la izquierda'}
                    {calibrationState.currentStep === 'right' && '👉 Gira la cabeza a la derecha'}
                    {calibrationState.currentStep === 'tilt' && '👆 Inclina la cabeza arriba o abajo'}
                    {calibrationState.currentStep === 'complete' && '✨ ¡Rostro 100% Calibrado!'}
                  </h4>
                  <p className="text-[11px] text-emerald-300/80 font-sans mt-0.5">
                    Ajustando la curvatura de la mascarilla para que cubra exactamente toda tu cara
                  </p>
                </div>

                {/* 4 Step Pills */}
                <div className="grid grid-cols-4 gap-1 text-[9.5px] font-mono">
                  <div
                    className={`py-1 rounded-md border transition ${
                      calibrationState.center
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : calibrationState.currentStep === 'center'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    Centro {calibrationState.center ? '✓' : ''}
                  </div>
                  <div
                    className={`py-1 rounded-md border transition ${
                      calibrationState.left
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : calibrationState.currentStep === 'left'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    Izquierda {calibrationState.left ? '✓' : ''}
                  </div>
                  <div
                    className={`py-1 rounded-md border transition ${
                      calibrationState.right
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : calibrationState.currentStep === 'right'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    Derecha {calibrationState.right ? '✓' : ''}
                  </div>
                  <div
                    className={`py-1 rounded-md border transition ${
                      calibrationState.tilt
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : calibrationState.currentStep === 'tilt'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 animate-pulse'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    Inclinación {calibrationState.tilt ? '✓' : ''}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${calibrationProgress}%` }}
                  />
                </div>

                {/* Skip / Fast Calibrate Button */}
                <button
                  type="button"
                  onClick={handleSkipCalibration}
                  className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Omitir / Calibración Rápida</span>
                </button>
              </div>
            </div>
          )}

          {/* Toast Notification: Zone Completed */}
          {lastCompletedZone && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
              <div className="px-5 py-2 rounded-full bg-emerald-500/90 backdrop-blur-xl border border-emerald-300 text-white text-xs font-bold shadow-[0_0_24px_rgba(16,185,129,0.7)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>¡{FACE_ZONES_CONFIG[lastCompletedZone].label} 100% Cubierta y Limpia!</span>
              </div>
            </div>
          )}

          {/* Subtle Ambient Vignette */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,0.5)_100%)]" />
        </div>

        {/* ======================================================================= */}
        {/* 2.B: COPILOT SIDEBAR (DEDICATED PANEL OUTSIDE THE VIDEO STREAM)         */}
        {/* ======================================================================= */}
        {!cleanMirrorMode && (
          <div className="w-full md:w-[340px] lg:w-[380px] xl:w-[410px] flex-1 md:flex-initial md:h-full flex flex-col bg-[#0A120D] border-t md:border-t-0 md:border-l border-[#192E22] overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
              
              {/* ------------------------------------------------------------------- */}
              {/* SUB-STATE A: READY MENU (MASCARILLA, TEXTURAS, RUTINAS Y ZONAS)    */}
              {/* ------------------------------------------------------------------- */}
              {(phase === 'ready' || phase === 'calibrating') && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px] font-mono font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delineado Facial Activo</span>
                    </div>
                    <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                      Zonas Dérmicas Transparentes
                    </h3>
                    <p className="text-xs text-white/70 font-sans leading-relaxed">
                      Tu piel se mantiene 100% visible y transparente. Líneas de alta precisión delinean la frente hasta el nacimiento del pelo, el contorno debajo de los ojos, mejillas y barbilla:
                    </p>
                  </div>

                  {/* 1. MASK DISPLAY MODE SELECTOR */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                        Modo de Visualización:
                      </span>
                      <span className="text-[10px] text-white/50">Piel 100% Transparente</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectDisplayMode('transparent_lines')}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          maskDisplayMode === 'transparent_lines'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block">✨ Líneas de Zonas</span>
                        <span className="text-[10px] text-white/60">Transparente (Recomendado)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDisplayMode('biometric_hud')}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          maskDisplayMode === 'biometric_hud'
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block">📐 Malla Clínica</span>
                        <span className="text-[10px] text-white/60">Mapeo analítico HUD</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDisplayMode('full_spa')}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          maskDisplayMode === 'full_spa'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block">🧖 Mascarilla Spa</span>
                        <span className="text-[10px] text-white/60">Pasta con textura (Opcional)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectDisplayMode('zone_application')}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          maskDisplayMode === 'zone_application'
                            ? 'bg-teal-500/20 border-teal-400 text-teal-200 shadow-sm'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xs font-bold block">🎯 Por Zonas</span>
                        <span className="text-[10px] text-white/60">Se ilumina al aplicar</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. LINE COLOR & STYLE THEMES */}
                  <div className="space-y-2 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                        Estilo de Líneas de Delineado:
                      </span>
                      <span className="text-[10px] text-white/50">Toca para cambiar color</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {COSMETIC_MASK_PRESETS.map((preset) => {
                        const isSelected = selectedMaskType === preset.id;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectMaskPreset(preset.id)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-2 ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-white/30"
                              style={{ backgroundColor: preset.borderHex }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-[11.5px] font-bold block truncate leading-tight">
                                {preset.name}
                              </span>
                              <span className="text-[9.5px] text-white/60 block truncate mt-0.5">
                                {preset.tag}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Mask Opacity Slider */}
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/70 text-[11px] font-medium">Densidad de la pasta:</span>
                        <span className="font-mono text-emerald-400 font-bold text-[11px]">
                          {Math.round(maskOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.30"
                        max="0.95"
                        step="0.05"
                        value={maskOpacity}
                        onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                        className="w-full h-1.5 accent-emerald-400 bg-white/20 rounded-lg cursor-pointer"
                        aria-label="Densidad de la mascarilla"
                      />
                      <div className="flex justify-between text-[9px] text-white/40 font-mono">
                        <span>30% Traslúcida</span>
                        <span>70% Equilibrada</span>
                        <span>95% Arcilla Densa</span>
                      </div>
                    </div>
                  </div>

                  {/* 2.5 RIGID FACE ANCHOR */}
                  <div className="space-y-2.5 pt-1 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                        Anclaje Facial 3D:
                      </span>
                      <span className="text-[10px] text-white/50">Máscara anclada</span>
                    </div>

                    {/* Rigid Anchor Status Card */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">Anclaje Rígido Facial</span>
                          <span className="text-[10px] text-emerald-300/80 block">La mascarilla se adapta y ancla a tus rasgos</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          engineRef.current?.freezeFaceAnchor();
                          arAudio.playTick();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-bold text-emerald-200 transition cursor-pointer"
                        title="Vuelve a capturar el anclaje de tus huesos faciales"
                      >
                        Fijar Ahora
                      </button>
                    </div>
                  </div>

                  {/* 3. GUIDED CLINICAL ROUTINES */}
                  <div className="space-y-2.5 pt-1 border-t border-white/10">
                    <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Iniciar Rutina Guiada Paso a Paso:
                    </span>

                    {/* Card 1: Desmaquillarme & Doble Limpieza */}
                    <div
                      onClick={() => handleStartTutorial('double_cleansing')}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-950/40 via-emerald-950/20 to-teal-950/40 border border-teal-500/30 hover:border-teal-400/80 transition cursor-pointer group shadow-sm flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <Droplets className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-teal-300 transition">
                            Desmaquillarme & Doble Limpieza
                          </h4>
                          <ChevronRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition" />
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                          Bálsamo y espuma. El sensor verifica en vivo que retires y limpies el 100% de impurezas.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Rutina Diaria Skin Cycling */}
                    <div
                      onClick={() => handleStartTutorial('skin_cycling')}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-950/40 border border-amber-500/30 hover:border-amber-400/80 transition cursor-pointer group shadow-sm flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition">
                            Aplicar mi Rutina Diaria
                          </h4>
                          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition" />
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                          Puntos de dosificación, masajes ascendentes y absorción profunda de activos.
                        </p>
                      </div>
                    </div>

                    {/* Card 3: Escudo Solar SPF 50+ */}
                    <div
                      onClick={() => handleStartTutorial('spf_shield')}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-orange-950/40 border border-orange-500/30 hover:border-orange-400/80 transition cursor-pointer group shadow-sm flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-300 shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                        <Sun className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-orange-300 transition">
                            Verificar Protector Solar (SPF)
                          </h4>
                          <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition" />
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                          Asegura cobertura completa sin dejar zonas desprotegidas en aletas y sienes.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. RE-CALIBRATE 3D BUTTON */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleRestartCalibration}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Compass className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recalibrar Movimiento 3D del Rostro</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------- */}
              {/* SUB-STATE B: TUTORIAL ACTIVE (MODO GUIADO PASO A PASO)              */}
              {/* ------------------------------------------------------------------- */}
              {phase === 'tutorial' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  {/* Back to Ready Menu */}
                  <button
                    onClick={() => setPhase('ready')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition cursor-pointer p-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a la selección de mascarillas</span>
                  </button>

                  {/* Step Card */}
                  <div className="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-2.5 shadow-inner">
                    {/* Step Header & Progress */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                          Paso {currentStep.stepNumber} de {currentRoutine.steps.length}
                        </span>
                        <h3 className="font-serif font-bold text-sm sm:text-base text-white leading-tight">
                          {currentStep.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-sm font-bold text-emerald-400 block">
                          {overallStepCoverage}%
                        </span>
                        <span className="text-[9px] font-mono text-white/50 block">cobertura</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 transition-all duration-300 rounded-full"
                        style={{ width: `${overallStepCoverage}%` }}
                      />
                    </div>

                    {/* Instruction Text */}
                    <p className="text-[11.5px] text-white/90 leading-relaxed font-sans">
                      {currentStep.instruction}
                    </p>

                    {/* Dermatological Clinical Tip */}
                    <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-200">
                      <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">
                        <strong className="text-emerald-300 font-semibold">Consejo clínico: </strong>
                        {currentStep.dermatologicalTip}
                      </span>
                    </div>
                  </div>

                  {/* Required Facial Zones Grid */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-white/60 uppercase tracking-wider block font-bold">
                      Verificación de zonas en vivo:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {activeStepZones.map((zoneKey) => {
                        const zConfig = FACE_ZONES_CONFIG[zoneKey];
                        const val = Math.round(coverage[zoneKey]);
                        const done = val >= 100;
                        return (
                          <button
                            key={zoneKey}
                            type="button"
                            onClick={() => handleBoostZone(zoneKey)}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-1.5 ${
                              done
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                : val > 0
                                ? 'bg-cyan-500/10 border-cyan-400/50 text-cyan-200'
                                : 'bg-black/30 border-white/10 text-white/70 hover:bg-white/5'
                            }`}
                            title="Toca para validar el cuidado de esta zona"
                          >
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span>{zConfig.shortLabel}</span>
                              <span>{done ? '✓ 100%' : `${val}%`}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  done ? 'bg-emerald-400' : 'bg-cyan-400'
                                }`}
                                style={{ width: `${val}%` }}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={handleResetStep}
                      className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white transition cursor-pointer shrink-0"
                      title="Reiniciar Cobertura del Paso Actual"
                      aria-label="Reiniciar cobertura"
                    >
                      <RotateCcw className="w-4 h-4 text-white/80" />
                    </button>

                    <button
                      onClick={handleNextStep}
                      className={`flex-1 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                        isStepFinished || overallStepCoverage >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white ring-2 ring-emerald-300/50 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse'
                          : 'bg-emerald-600/80 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-sm'
                      }`}
                    >
                      <span>
                        {currentStepIndex === currentRoutine.steps.length - 1
                          ? 'Completar Rutina'
                          : 'Siguiente Paso'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CELEBRATION MODAL (RUTINA COMPLETADA CON ÉXITO)                         */}
      {/* ========================================================================= */}
      {showCelebrationModal && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#0B1510] border-2 border-emerald-400/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-[0_0_50px_rgba(16,185,129,0.35)] relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 block">
                ¡Cobertura Facial 100% Verificada!
              </span>
              <h3 className="font-serif text-2xl font-bold text-white mt-1">
                {currentRoutine.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mt-2 font-sans leading-relaxed">
                Has cubierto y trabajado minuciosamente cada área anatómica del rostro sin dejar zonas desprotegidas. Tu piel está radiante.
              </p>
            </div>

            {/* Scorecard */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/50 block font-mono">Cobertura</span>
                <span className="text-base font-bold text-emerald-400 font-mono">100%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/50 block font-mono">Zonas</span>
                <span className="text-base font-bold text-cyan-400 font-mono">
                  {activeStepZones.length} / {activeStepZones.length}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-white/50 block font-mono">Precisión</span>
                <span className="text-base font-bold text-amber-300 font-mono">Óptima</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setCurrentStepIndex(0);
                  setIsStepFinished(false);
                  engineRef.current?.resetCoverage();
                }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-900/40"
              >
                Repetir Rutina
              </button>

              <button
                onClick={() => {
                  setShowCelebrationModal(false);
                  setPhase('ready');
                }}
                className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white/80 font-semibold text-xs transition cursor-pointer"
              >
                Volver al Menú de Mascarillas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
