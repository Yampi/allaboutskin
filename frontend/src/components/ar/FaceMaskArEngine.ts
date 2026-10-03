'use client';

import {
  FaceZoneKey,
  VirtualTextureType,
  ZoneCoverageState,
  FaceLandmarkPoint,
  HeadPose,
  HeadCalibrationState,
  MaskDisplayMode,
  BrushTrailStyle,
} from './types';

// Silence Emscripten / TensorFlow Lite stderr INFO logs that Next.js intercepts as fatal errors
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    const first = args[0];
    if (
      typeof first === 'string' &&
      (first.startsWith('INFO:') ||
        first.includes('TensorFlow Lite') ||
        first.includes('XNNPACK') ||
        first.includes('delegate'))
    ) {
      console.info('[MediaPipe-TFLite]', ...args);
      return;
    }
    origError.apply(console, args);
  };
}

export const FACE_ZONES_CONFIG: Record<FaceZoneKey, {
  label: string;
  shortLabel: string;
  description: string;
  colorHex: string;
  glowRgba: string;
  dermatologicalTip: string;
}> = {
  forehead: {
    label: 'Zona T: Frente',
    shortLabel: 'Frente',
    description: 'Alta concentración sebácea y líneas de expresión.',
    colorHex: '#38BDF8',
    glowRgba: 'rgba(56, 189, 248, 0.6)',
    dermatologicalTip: 'Masajea con movimientos circulares desde el entrecejo hacia las sienes.',
  },
  nose: {
    label: 'Zona T: Nariz y Aletas',
    shortLabel: 'Nariz',
    description: 'Punto propenso a poros visibles, puntos negros y cúmulo de maquillaje.',
    colorHex: '#F59E0B',
    glowRgba: 'rgba(245, 158, 11, 0.65)',
    dermatologicalTip: 'Incide en las aletas laterales con la yema de los dedos en movimientos circulares pequeños.',
  },
  leftCheek: {
    label: 'Mejilla Izquierda',
    shortLabel: 'Mejilla Izq.',
    description: 'Zona de barrera cutánea delicada susceptible a deshidratación o rojez.',
    colorHex: '#10B981',
    glowRgba: 'rgba(168, 85, 247, 0.6)',
    dermatologicalTip: 'Extiende siempre en sentido ascendente desde el surco hacia el pómulo.',
  },
  rightCheek: {
    label: 'Mejilla Derecha',
    shortLabel: 'Mejilla Der.',
    description: 'Zona de barrera cutánea delicada susceptible a deshidratación o rojez.',
    colorHex: '#10B981',
    glowRgba: 'rgba(16, 185, 129, 0.6)',
    dermatologicalTip: 'Extiende con suavidad ascendente hacia la sien.',
  },
  chin: {
    label: 'Mentón y Mandíbula',
    shortLabel: 'Barbilla',
    description: 'Frecuente depósito de sebo y cambios hormonales.',
    colorHex: '#A855F7',
    glowRgba: 'rgba(168, 85, 247, 0.6)',
    dermatologicalTip: 'Desliza hacia los extremos mandibulares para drenaje linfático suave.',
  },
  eyeContour: {
    label: 'Contorno Periocular',
    shortLabel: 'Ojos',
    description: 'Piel 4 veces más fina que el resto del rostro. Máxima delicadeza.',
    colorHex: '#EC4899',
    glowRgba: 'rgba(236, 72, 153, 0.6)',
    dermatologicalTip: 'Nunca frotes con fuerza. Usa toques con el dedo anular sin traccionar la piel.',
  },
  neck: {
    label: 'Cuello y Escote',
    shortLabel: 'Cuello',
    description: 'Extensión natural de la rutina facial que no debe descuidarse.',
    colorHex: '#06B6D4',
    glowRgba: 'rgba(6, 182, 212, 0.6)',
    dermatologicalTip: 'Aplica en trazos ascendentes hacia el mentón para favorecer la firmeza.',
  },
};

interface FoamParticle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  hue: number;
  wobbleSpeed: number;
  wobbleOffset: number;
  zone: FaceZoneKey;
}

export class FaceMaskArEngine {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  // MediaPipe Vision
  private faceLandmarker: any = null;
  private isMediaPipeLoading: boolean = false;
  private isMediaPipeReady: boolean = false;
  private lastVideoTime: number = -1;
  private lastDetectTimestamp: number = 0;
  private latestRawLandmarks: FaceLandmarkPoint[] | null = null;

  // Motion Detection Memory
  private prevFrameData: Uint8ClampedArray | null = null;
  private prevFrameWidth = 0;
  private prevFrameHeight = 0;
  private frameCount = 0;

  // Coverage State
  private coverage: ZoneCoverageState = {
    forehead: 0,
    nose: 0,
    leftCheek: 0,
    rightCheek: 0,
    chin: 0,
    eyeContour: 0,
    neck: 0,
  };

  // Particles for Foam / Serum
  private foamParticles: FoamParticle[] = [];
  private completedZonesNotice: Set<FaceZoneKey> = new Set();

  // Callbacks
  public onZoneProgress?: (coverage: ZoneCoverageState) => void;
  public onZoneCompleted?: (zone: FaceZoneKey) => void;
  public onFpsUpdate?: (fps: number) => void;

  // FPS calculation
  private lastTime = 0;
  private fpsHistory: number[] = [];

  // Offscreen motion detection canvas (downsampled for 60fps zero-lag rubbing detection)
  private motionCanvas: HTMLCanvasElement | null = null;
  private motionCtx: CanvasRenderingContext2D | null = null;

  // 3D Head Pose Tracking
  public currentHeadPose: HeadPose = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    angleDegrees: { yaw: 0, pitch: 0, roll: 0 },
  };

  // 3D Head Movement Calibration State
  public calibrationState: HeadCalibrationState = {
    center: false,
    left: false,
    right: false,
    tilt: false,
    currentStep: 'center',
    percent: 0,
  };

  private centerHoldFrames = 0;
  private leftHoldFrames = 0;
  private rightHoldFrames = 0;
  private tiltHoldFrames = 0;

  // Mask display options
  public maskOpacity = 0.88;
  public maskDisplayMode: MaskDisplayMode = 'transparent_lines'; // DEFAULT: 100% transparent face with zone lines!
  public isCalibrating = false;
  public isTrackingMotion = false; // Strictly gated: FALSE during calibration & ready standby, TRUE only during active routine tutorial!

  // Callbacks
  public onHeadPoseUpdate?: (pose: HeadPose) => void;
  public onCalibrationUpdate?: (state: HeadCalibrationState) => void;
  public onCalibrationCompleted?: () => void;

  // Configuration
  public showFullMask = false; // By default: FALSE, natural skin 100% transparent and visible!
  public showHoloMesh = false; // High-tech biometric zone detection is the star
  public showZoneOutlines = true; // Biometric zones always visible
  public showParticles = true;
  public textureType: VirtualTextureType = 'emerald_lines';
  public activeTutorialZones: FaceZoneKey[] = ['forehead', 'eyeContour', 'leftCheek', 'rightCheek', 'chin'];
  public sensitivityMultiplier = 1.0;
  public mirrorMode = true;

  // Rigid Face Anchor (Anclaje Rígido Inmune a Deformaciones por Manos)
  public enableRigidAnchor = true;
  public isAnchorCalibrated = false;
  private canonicalOffsets: Array<{ dx: number; dy: number; z?: number }> | null = null;
  private canonicalIOD = 0.22;
  private smoothedAnchor = {
    cx: 0.5,
    cy: 0.44,
    iod: 0.22,
    angle: 0,
    valid: false,
  };
  private stableCalibrationFrames = 0;
  private hasRecentHandMotion = false;
  private handMotionCooldown = 0;
  private lastValidRawLandmarks: FaceLandmarkPoint[] | null = null;
  private smoothedLandmarks: FaceLandmarkPoint[] | null = null;

  // Interactive Cotton Pad / Brush Trail Canvas (Disabled - mask remains rigidly anchored)
  public showBrushTrail = false;
  public brushTrailStyle: BrushTrailStyle = 'off';
  private trailCanvas: HTMLCanvasElement | null = null;
  private trailCtx: CanvasRenderingContext2D | null = null;
  private lastTrailStrokePoint: { x: number; y: number } | null = null;
  private lastActiveCottonPad: { x: number; y: number; zone: FaceZoneKey; timestamp: number } | null = null;

  constructor() {
    this.initParticles();
  }

  private initParticles() {
    this.foamParticles = [];
    const zones: FaceZoneKey[] = ['forehead', 'nose', 'leftCheek', 'rightCheek', 'chin', 'eyeContour'];
    for (let i = 0; i < 90; i++) {
      const z = zones[i % zones.length];
      this.foamParticles.push({
        x: Math.random(),
        y: Math.random(),
        radius: 3 + Math.random() * 8,
        alpha: 0.35 + Math.random() * 0.45,
        hue: 160 + Math.random() * 40,
        wobbleSpeed: 0.02 + Math.random() * 0.04,
        wobbleOffset: Math.random() * Math.PI * 2,
        zone: z,
      });
    }
  }

  // Rutas locales (servidas desde /public/mediapipe) para no depender de CDN ni filtrar la IP a terceros
  public static readonly MEDIAPIPE_WASM_PATH = '/mediapipe/wasm';
  public static readonly MEDIAPIPE_MODEL_PATH = '/mediapipe/models/face_landmarker.task';

  // Helper to dynamically load @mediapipe/tasks-vision (bundled)
  public static async loadMediaPipeTasksVision(): Promise<any> {
    if (typeof window !== 'undefined' && (window as any).FaceLandmarker && (window as any).FilesetResolver) {
      return {
        FaceLandmarker: (window as any).FaceLandmarker,
        FilesetResolver: (window as any).FilesetResolver,
      };
    }
    const vision = await import('@mediapipe/tasks-vision');
    if (vision && vision.FaceLandmarker) return vision;
    throw new Error('[MediaPipe] @mediapipe/tasks-vision no disponible');
  }

  // Initialize MediaPipe FaceLandmarker asynchronously
  public async initMediaPipe() {
    if (typeof window === 'undefined' || this.isMediaPipeReady || this.isMediaPipeLoading) return;
    this.isMediaPipeLoading = true;

    try {
      const vision = await FaceMaskArEngine.loadMediaPipeTasksVision();
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        FaceMaskArEngine.MEDIAPIPE_WASM_PATH
      );

      const landmarkerOptions = {
        baseOptions: {
          modelAssetPath: FaceMaskArEngine.MEDIAPIPE_MODEL_PATH,
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.20,
        minFacePresenceConfidence: 0.20,
        minTrackingConfidence: 0.20,
      };

      try {
        this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, landmarkerOptions);
      } catch (gpuErr) {
        console.info('[MediaPipe] GPU delegate unavailable, falling back to CPU delegate:', gpuErr);
        this.faceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          ...landmarkerOptions,
          baseOptions: {
            ...landmarkerOptions.baseOptions,
            delegate: 'CPU',
          },
        });
      }

      this.isMediaPipeReady = true;
      console.info('[MediaPipe Video] FaceLandmarker initialized successfully.');
    } catch (err) {
      console.warn('MediaPipe FaceLandmarker fallback to Optical Face Mesh:', err);
      this.isMediaPipeReady = false;
    } finally {
      this.isMediaPipeLoading = false;
    }
  }

  // Mount video and canvas
  public attach(videoEl: HTMLVideoElement, canvasEl: HTMLCanvasElement) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    this.startLoop();
  }

  // Detach / cleanup
  public detach() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.prevFrameData = null;
    this.trailCanvas = null;
    this.trailCtx = null;
    this.lastTrailStrokePoint = null;
    this.lastActiveCottonPad = null;
  }

  // Reset coverage stats & wipe brush trail
  public resetCoverage() {
    this.coverage = {
      forehead: 0,
      nose: 0,
      leftCheek: 0,
      rightCheek: 0,
      chin: 0,
      eyeContour: 0,
      neck: 0,
    };
    this.completedZonesNotice.clear();
    this.clearBrushTrail();
    this.onZoneProgress?.(this.getCoverage());
  }

  public getCoverage(): ZoneCoverageState {
    return { ...this.coverage };
  }

  // Manual boost for zone (e.g. user touch / accessibility tap)
  public addManualZoneCoverage(zone: FaceZoneKey, amount = 25) {
    this.increaseZoneCoverage(zone, amount);
  }

  private increaseZoneCoverage(zone: FaceZoneKey, amount: number) {
    const prev = this.coverage[zone];
    const updated = Math.min(100, prev + amount);
    this.coverage[zone] = Math.round(updated * 10) / 10;

    if (updated >= 100 && !this.completedZonesNotice.has(zone)) {
      this.completedZonesNotice.add(zone);
      this.onZoneCompleted?.(zone);
    }
    this.onZoneProgress?.(this.getCoverage());
  }

  // 3D Head Movement Calibration Controls
  public startCalibration() {
    this.isCalibrating = true;
    this.isTrackingMotion = false;
    this.hasRecentHandMotion = false;
    this.handMotionCooldown = 0;
    this.lastTrailStrokePoint = null;
    this.lastActiveCottonPad = null;
    this.isAnchorCalibrated = false;
    this.stableCalibrationFrames = 0;
    this.canonicalOffsets = null;
    this.smoothedAnchor.valid = false;
    this.clearBrushTrail();
    this.resetCoverage();
    this.calibrationState = {
      center: false,
      left: false,
      right: false,
      tilt: false,
      currentStep: 'center',
      percent: 0,
    };
    this.centerHoldFrames = 0;
    this.leftHoldFrames = 0;
    this.rightHoldFrames = 0;
    this.tiltHoldFrames = 0;
    this.onCalibrationUpdate?.({ ...this.calibrationState });
  }

  public skipCalibration() {
    this.isCalibrating = false;
    this.isTrackingMotion = false;
    this.hasRecentHandMotion = false;
    this.handMotionCooldown = 0;
    this.freezeFaceAnchor();
    this.clearBrushTrail();
    this.resetCoverage();
    this.calibrationState = {
      center: true,
      left: true,
      right: true,
      tilt: true,
      currentStep: 'complete',
      percent: 100,
    };
    this.onCalibrationUpdate?.({ ...this.calibrationState });
    this.onCalibrationCompleted?.();
  }

  public setMotionTracking(active: boolean) {
    this.isTrackingMotion = active;
    if (!active) {
      this.hasRecentHandMotion = false;
      this.handMotionCooldown = 0;
      this.lastTrailStrokePoint = null;
      this.lastActiveCottonPad = null;
    }
  }

  // =========================================================================
  // RIGID FACE ANCHOR METHODS (Anclaje Rígido Inmune a Deformaciones por Manos)
  // =========================================================================

  // Freezes / records the calibrated anatomical baseline proportions
  public freezeFaceAnchor(rawLandmarks?: FaceLandmarkPoint[]) {
    const pts = rawLandmarks || this.lastValidRawLandmarks || this.smoothedLandmarks;
    if (!pts || pts.length < 400) return;

    // Invariant bony landmarks: inner eye corners and upper nasal bridge
    const leftEyeInner = pts[362] || pts[263];
    const rightEyeInner = pts[133] || pts[33];
    const bridge = pts[168] || pts[197] || pts[6];

    if (!leftEyeInner || !rightEyeInner || !bridge) return;

    const cx = (leftEyeInner.x + rightEyeInner.x) / 2;
    const cy = (leftEyeInner.y + rightEyeInner.y) / 2;
    const dx = Math.abs(rightEyeInner.x - leftEyeInner.x);
    const dy = rightEyeInner.y - leftEyeInner.y;
    const iod = Math.max(0.08, Math.sqrt(dx * dx + dy * dy));

    this.canonicalIOD = iod;
    this.smoothedAnchor = { cx, cy, iod, angle: 0, valid: true };
    this.isAnchorCalibrated = true;
  }

  // Resolves stable, non-deformed landmarks immune to hand occlusion
  private resolveFaceLandmarks(
    rawLandmarks: FaceLandmarkPoint[] | null,
    width: number,
    height: number
  ): FaceLandmarkPoint[] {
    if (rawLandmarks && rawLandmarks.length >= 400) {
      // 1. Initialize or temporally smooth landmarks directly with MediaPipe 3D mesh:
      if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== rawLandmarks.length) {
        this.smoothedLandmarks = rawLandmarks.map((pt) => ({ ...pt }));
      } else {
        // Temporal responsiveness:
        // - When user is actively rubbing/touching their face during routine tutorial:
        //   alpha = 0.25 (heavy dampening: passing hands/fingers CANNOT drag or warp facial contours)
        // - Otherwise (calibration, preview, natural face tracking):
        //   alpha = 0.85 (ultra-fluid 60 FPS real-time tracking, perfect 1:1 facial adherence)
        const alpha = (this.hasRecentHandMotion && this.isTrackingMotion) ? 0.25 : 0.85;

        for (let i = 0; i < rawLandmarks.length; i++) {
          const raw = rawLandmarks[i];
          const prev = this.smoothedLandmarks[i] || raw;
          this.smoothedLandmarks[i] = {
            x: prev.x * (1 - alpha) + raw.x * alpha,
            y: prev.y * (1 - alpha) + raw.y * alpha,
            z: ((prev.z ?? 0) * (1 - alpha)) + ((raw.z ?? 0) * alpha),
          };
        }
      }

      this.lastValidRawLandmarks = this.smoothedLandmarks;
      return this.smoothedLandmarks;
    }

    // 2. Occlusion Hold: When hands completely cover the face or camera tracking momentarily drops,
    // maintain the last valid facial position so the mask NEVER jumps or reverts to center!
    if (this.smoothedLandmarks) {
      return this.smoothedLandmarks;
    }

    if (this.lastValidRawLandmarks) {
      return this.lastValidRawLandmarks;
    }

    return FaceMaskArEngine.generateAdaptiveLandmarks(width, height);
  }

  // =========================================================================
  // COTTON PAD / BRUSH TRAIL CANVAS (Rastro Interactivo de Pincel / Algodón)
  // =========================================================================

  private ensureTrailCanvas(width: number, height: number): CanvasRenderingContext2D | null {
    if (typeof document === 'undefined') return null;
    if (!this.trailCanvas) {
      this.trailCanvas = document.createElement('canvas');
      this.trailCanvas.width = width;
      this.trailCanvas.height = height;
      this.trailCtx = this.trailCanvas.getContext('2d', { willReadFrequently: true });
    } else if (this.trailCanvas.width !== width || this.trailCanvas.height !== height) {
      const temp = document.createElement('canvas');
      temp.width = this.trailCanvas.width;
      temp.height = this.trailCanvas.height;
      const tctx = temp.getContext('2d');
      if (tctx) tctx.drawImage(this.trailCanvas, 0, 0);

      this.trailCanvas.width = width;
      this.trailCanvas.height = height;
      this.trailCtx = this.trailCanvas.getContext('2d', { willReadFrequently: true });
      if (this.trailCtx) {
        this.trailCtx.drawImage(temp, 0, 0, width, height);
      }
    }
    return this.trailCtx;
  }

  public clearBrushTrail() {
    if (this.trailCtx && this.trailCanvas) {
      this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    }
    this.lastTrailStrokePoint = null;
    this.lastActiveCottonPad = null;
  }

  private drawBrushStroke(_x: number, _y: number, _zoneKey: FaceZoneKey) {
    // Disabled: User requested anchored mask only without brush/hand tracking
  }

  // Renders the glowing Cotton Pad / Applicator HUD cursor over where the hand is moving
  private renderCottonPadApplicator(_width: number, _height: number, _timestamp: number) {
    // Disabled: User requested anchored mask only without brush/hand tracking
  }

  // Main Render & Detection Loop
  private startLoop() {
    const loop = (timestamp: number) => {
      this.renderFrame(timestamp);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private renderFrame(timestamp: number) {
    if (!this.video || !this.canvas || !this.ctx) return;
    if (this.video.readyState < 2) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    if (width === 0 || height === 0) return;

    // Calculate FPS
    if (this.lastTime) {
      const delta = timestamp - this.lastTime;
      if (delta > 0) {
        const currentFps = Math.round(1000 / delta);
        this.fpsHistory.push(currentFps);
        if (this.fpsHistory.length > 20) this.fpsHistory.shift();
        const avgFps = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
        if (this.frameCount % 15 === 0) {
          this.onFpsUpdate?.(avgFps);
        }
      }
    }
    this.lastTime = timestamp;
    this.frameCount++;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // 1. Get Raw Landmarks (MediaPipe with strictly monotonic timestamps and video frame sync)
    let rawLandmarks: FaceLandmarkPoint[] | null = null;

    if (
      this.video &&
      this.video.readyState >= 2 &&
      this.video.videoWidth > 0 &&
      this.video.videoHeight > 0
    ) {
      if (this.canvas && (this.canvas.width !== this.video.videoWidth || this.canvas.height !== this.video.videoHeight)) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }

      if (this.faceLandmarker && this.isMediaPipeReady) {
        const nowMs = Math.round(performance.now());
        if (nowMs - this.lastDetectTimestamp >= 15) {
          const safeTimestamp = Math.max(this.lastDetectTimestamp + 1, nowMs);
          this.lastDetectTimestamp = safeTimestamp;

          try {
            const results = this.faceLandmarker.detectForVideo(this.video, safeTimestamp);
            if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
              this.latestRawLandmarks = results.faceLandmarks[0].map((pt: any) => ({
                x: this.mirrorMode ? 1 - pt.x : pt.x,
                y: pt.y,
                z: pt.z,
              }));
            }
          } catch (detErr) {
            console.warn('[MediaPipe Video] detectForVideo warning:', detErr);
          }
        }
      }

      rawLandmarks = this.latestRawLandmarks;
    }

    // 1.5. Resolve Stable Landmarks (immune to hand deformations via Rigid Face Anchor)
    const landmarks = this.resolveFaceLandmarks(rawLandmarks, width, height);

    // 2. Extract Full Face Contours (Perimeter + Wide Eye/Eyebrow Cutouts + Mouth)
    const contours = FaceMaskArEngine.extractFaceContours(landmarks, width, height);

    // 2.5. Compute 3D Head Pose (yaw, pitch, roll)
    this.updateHeadPose(landmarks);

    // 2.6. If in calibration mode, evaluate head movements & render 3D compass HUD
    if (this.isCalibrating) {
      this.evaluateCalibrationStep();
      this.renderCalibrationHUD(contours, width, height, timestamp);
    }

    // 3. Map Facial Zones Polygons for Tutorial / Rubbing Tracking
    const zonePolygons = FaceMaskArEngine.extractZonePolygons(landmarks, width, height);

    // 4. Render Face Mask / Zone Lines:
    if (this.maskDisplayMode === 'full_spa' || this.showFullMask) {
      // Opaque spa clay mask (only if explicitly enabled by user)
      this.renderRealisticCosmeticMask(contours, zonePolygons, width, height, timestamp);
    } else {
      // DEFAULT: 100% TRANSPARENT SKIN WITH PRECISION ZONE LINES!
      this.renderTransparentZoneLines(contours, zonePolygons, width, height, timestamp);
    }

    // 5. Motion & Hand Rubbing Detection per Zone (only during active tutorial / motion tracking)
    if (this.isTrackingMotion && !this.isCalibrating && this.frameCount % 2 === 0) {
      this.detectZoneRubbingMotion(zonePolygons, width, height);
    }

    // 6. Render Biometric Zone Badges & Additional Outlines if enabled
    if (
      this.showZoneOutlines &&
      (this.maskDisplayMode === 'biometric_hud' ||
        this.maskDisplayMode === 'hybrid' ||
        this.maskDisplayMode === 'zone_application')
    ) {
      this.renderZoneProgressVisuals(zonePolygons, contours, width, height, timestamp);
    }

    // 7. Render Holographic Cyber-Mesh if enabled
    if (this.showHoloMesh && landmarks) {
      this.renderHolographicMesh(landmarks, width, height, timestamp);
    }
  }

  // Fallback Landmark Generator based on center facial framing or Gemini faceRegions
  public static generateAdaptiveLandmarks(
    width: number,
    height: number,
    faceRegions?: any
  ): FaceLandmarkPoint[] {
    let cx = 0.50;
    let cy = 0.48;
    let rx = 0.38; // Proportional 76% width across temples and malar bones
    let ry = 0.44; // Proportional 88% height from hairline to chin

    if (faceRegions?.faceBox) {
      const fb = faceRegions.faceBox;
      if (fb.width > 5 && fb.height > 5) {
        cx = Math.max(0.15, Math.min(0.85, (fb.left + fb.width / 2) / 100));
        cy = Math.max(0.15, Math.min(0.85, (fb.top + fb.height / 2) / 100));
        rx = Math.max(0.20, Math.min(0.48, ((fb.width / 2) / 100) * 1.15));
        ry = Math.max(0.25, Math.min(0.50, ((fb.height / 2) / 100) * 1.10));
      }
    }

    const pts: FaceLandmarkPoint[] = [];

    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      pts.push({
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      });
    }

    pts.push({ x: cx, y: cy - ry * 0.70 }); // 36: Mid-forehead
    pts.push({ x: cx - rx * 0.45, y: cy - ry * 0.60 }); // 37: Left forehead
    pts.push({ x: cx + rx * 0.45, y: cy - ry * 0.60 }); // 38: Right forehead

    pts.push({ x: cx, y: cy - ry * 0.15 }); // 39: Bridge
    pts.push({ x: cx, y: cy + ry * 0.16 }); // 40: Tip
    pts.push({ x: cx - rx * 0.2, y: cy + ry * 0.16 }); // 41: Left nostril
    pts.push({ x: cx + rx * 0.2, y: cy + ry * 0.16 }); // 42: Right nostril

    pts.push({ x: cx - rx * 0.50, y: cy + ry * 0.18 }); // 43: Left cheek center
    pts.push({ x: cx + rx * 0.50, y: cy + ry * 0.18 }); // 44: Right cheek center

    pts.push({ x: cx, y: cy + ry * 0.88 }); // 45: Chin center

    return pts;
  }

  // Extract Face Perimeter + Anatomical Eye & Eyebrow Cutouts + Mouth Cutout
  public static extractFaceContours(landmarks: FaceLandmarkPoint[], width: number, height: number) {
    if (landmarks.length >= 400) {
      // 1. Forehead Hairline Lift:
      // MediaPipe landmark 10 is at the upper forehead, but about 25% below the actual hairline.
      const p10 = landmarks[10] || { x: 0.5, y: 0.2 };
      const pBridge = landmarks[168] || landmarks[197] || { x: 0.5, y: 0.35 };
      const foreheadSpan = Math.max(0.08, Math.abs(pBridge.y - p10.y));
      const liftAmount = foreheadSpan * 0.32; // lifts upper forehead up to hairline!

      const upperForeheadIndices = new Set([10, 338, 297, 332, 284, 251, 21, 54, 103, 67, 109]);

      const p = (idx: number) => {
        const pt = landmarks[idx] || { x: 0.5, y: 0.5 };
        let py = pt.y;
        if (upperForeheadIndices.has(idx)) {
          const distFromCenter = Math.abs(pt.x - p10.x);
          const weight = Math.max(0.25, 1.0 - distFromCenter * 3.0);
          py = Math.max(0.01, py - liftAmount * weight);
        }
        return {
          x: pt.x * width,
          y: py * height,
        };
      };

      // Full face perimeter (forehead hairline, temples, jawline, chin)
      const ovalIndices = [
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365,
        379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93,
        234, 127, 162, 21, 54, 103, 67, 109,
      ];

      // LEFT EYE APERTURE: Only the actual eye opening (leaves under-eye 100% intact & covered)
      const leftEyeAperture = [
        33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7,
      ];

      // RIGHT EYE APERTURE: Only the actual eye opening (leaves under-eye 100% intact & covered)
      const rightEyeAperture = [
        263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249,
      ];

      // MOUTH OUTER CUTOUT: Upper and lower lips
      const mouthOuter = [
        61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267,
        0, 37, 39, 40, 185,
      ];

      return {
        faceOval: ovalIndices.map(p),
        leftEye: leftEyeAperture.map(p),
        rightEye: rightEyeAperture.map(p),
        mouth: mouthOuter.map(p),
      };
    }

    // Adaptive Neoclassical Oval Fallback (calibrated to landmarks bounds or natural facial framing)
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const pt of landmarks) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const hasBounds = minX < maxX && minY < maxY;
    const cx = hasBounds ? ((minX + maxX) / 2) * width : width * 0.50;
    const cy = hasBounds ? ((minY + maxY) / 2) * height : height * 0.48;
    const rx = hasBounds ? ((maxX - minX) / 2) * width : width * 0.38;
    const ry = hasBounds ? ((maxY - minY) / 2) * height : height * 0.44;

    const oval: { x: number; y: number }[] = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      // If in upper half (angle between PI and 2PI, where sin < 0), lift towards hairline
      const factorY = Math.sin(angle) < 0 ? ry * 1.18 : ry;
      oval.push({ x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * factorY });
    }

    // Left Eye Aperture (small oval tight around eyeball)
    const leftEye: { x: number; y: number }[] = [];
    const lx = cx - rx * 0.42;
    const ly = cy - ry * 0.12;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      leftEye.push({ x: lx + Math.cos(a) * (rx * 0.22), y: ly + Math.sin(a) * (ry * 0.12) });
    }

    // Right Eye Aperture (small oval tight around eyeball)
    const rightEye: { x: number; y: number }[] = [];
    const rxCenter = cx + rx * 0.42;
    const ryCenter = cy - ry * 0.12;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      rightEye.push({ x: rxCenter + Math.cos(a) * (rx * 0.22), y: ryCenter + Math.sin(a) * (ry * 0.12) });
    }

    // Mouth Cutout
    const mouth: { x: number; y: number }[] = [];
    const mx = cx;
    const my = cy + ry * 0.5;
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      mouth.push({ x: mx + Math.cos(a) * (rx * 0.34), y: my + Math.sin(a) * (ry * 0.18) });
    }

    return {
      faceOval: oval,
      leftEye,
      rightEye,
      mouth,
    };
  }

  // 3D Head Pose Computation (Yaw, Pitch, Roll)
  private updateHeadPose(landmarks: FaceLandmarkPoint[]) {
    if (!landmarks || landmarks.length < 30) return;

    let noseTip = landmarks[1] || landmarks[4];
    let leftCheek = landmarks[234] || landmarks[116];
    let rightCheek = landmarks[454] || landmarks[345];
    let forehead = landmarks[10] || landmarks[151];
    let chin = landmarks[152] || landmarks[175];
    let leftEye = landmarks[33] || landmarks[133];
    let rightEye = landmarks[263] || landmarks[362];

    if (landmarks.length < 400) {
      forehead = landmarks[36];
      noseTip = landmarks[40];
      leftCheek = landmarks[43];
      rightCheek = landmarks[44];
      chin = landmarks[18];
      leftEye = landmarks[10];
      rightEye = landmarks[26];
    }

    if (noseTip && leftCheek && rightCheek && forehead && chin) {
      const leftDist = Math.abs(noseTip.x - leftCheek.x);
      const rightDist = Math.abs(rightCheek.x - noseTip.x);
      const totalW = leftDist + rightDist;
      const rawYaw = totalW > 0 ? (rightDist - leftDist) / totalW : 0;
      const yaw = this.mirrorMode ? -rawYaw : rawYaw;

      const upperDist = Math.abs(noseTip.y - forehead.y);
      const lowerDist = Math.abs(chin.y - noseTip.y);
      const totalH = upperDist + lowerDist;
      const pitch = totalH > 0 ? (lowerDist - upperDist) / totalH : 0;

      const roll = leftEye && rightEye ? Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) : 0;

      const yawDeg = Math.round(yaw * 45);
      const pitchDeg = Math.round(pitch * 35);
      const rollDeg = Math.round((roll * 180) / Math.PI);

      this.currentHeadPose = {
        yaw,
        pitch,
        roll,
        angleDegrees: { yaw: yawDeg, pitch: pitchDeg, roll: rollDeg },
      };

      if (this.frameCount % 5 === 0) {
        this.onHeadPoseUpdate?.(this.currentHeadPose);
      }
    }
  }

  // 3D Head Movement Calibration Sequence
  private evaluateCalibrationStep() {
    const { yaw, pitch } = this.currentHeadPose;
    const step = this.calibrationState.currentStep;

    if (step === 'center') {
      if (Math.abs(yaw) < 0.14 && Math.abs(pitch) < 0.14) {
        this.centerHoldFrames++;
        if (this.centerHoldFrames >= 18) {
          this.calibrationState.center = true;
          this.calibrationState.currentStep = 'left';
          this.calibrationState.percent = 25;
          this.onCalibrationUpdate?.({ ...this.calibrationState });
        }
      } else {
        this.centerHoldFrames = Math.max(0, this.centerHoldFrames - 1);
      }
    } else if (step === 'left') {
      if (yaw < -0.18) {
        this.leftHoldFrames++;
        if (this.leftHoldFrames >= 18) {
          this.calibrationState.left = true;
          this.calibrationState.currentStep = 'right';
          this.calibrationState.percent = 50;
          this.onCalibrationUpdate?.({ ...this.calibrationState });
        }
      }
    } else if (step === 'right') {
      if (yaw > 0.18) {
        this.rightHoldFrames++;
        if (this.rightHoldFrames >= 18) {
          this.calibrationState.right = true;
          this.calibrationState.currentStep = 'tilt';
          this.calibrationState.percent = 75;
          this.onCalibrationUpdate?.({ ...this.calibrationState });
        }
      }
    } else if (step === 'tilt') {
      if (Math.abs(pitch) > 0.15) {
        this.tiltHoldFrames++;
        if (this.tiltHoldFrames >= 18) {
          this.calibrationState.tilt = true;
          this.calibrationState.currentStep = 'complete';
          this.calibrationState.percent = 100;
          this.isCalibrating = false;
          this.freezeFaceAnchor();
          this.onCalibrationUpdate?.({ ...this.calibrationState });
          this.onCalibrationCompleted?.();
        }
      }
    }
  }

  // Render 3D Compass Calibration HUD on Video Frame
  private renderCalibrationHUD(
    contours: { faceOval: { x: number; y: number }[] },
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { yaw, pitch } = this.currentHeadPose;
    const state = this.calibrationState;

    ctx.save();

    let cx = width * 0.5;
    let cy = height * 0.46;
    if (contours.faceOval.length > 0) {
      let sx = 0,
        sy = 0;
      for (const p of contours.faceOval) {
        sx += p.x;
        sy += p.y;
      }
      cx = sx / contours.faceOval.length;
      cy = sy / contours.faceOval.length;
    }

    const radius = Math.min(width, height) * 0.28;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    const pointerX = cx + yaw * (radius * 0.85);
    const pointerY = cy + pitch * (radius * 0.85);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pointerX, pointerY);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pointerX, pointerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.fill();

    this.drawCalibrationNode(ctx, cx - radius, cy, state.left, '⬅️ Izquierda', state.currentStep === 'left', timestamp);
    this.drawCalibrationNode(ctx, cx + radius, cy, state.right, 'Derecha ➡️', state.currentStep === 'right', timestamp);
    this.drawCalibrationNode(ctx, cx, cy - radius, state.tilt, '⬆️ Arriba', state.currentStep === 'tilt', timestamp);
    this.drawCalibrationNode(ctx, cx, cy, state.center, 'Centro', state.currentStep === 'center', timestamp);

    const bannerW = Math.min(420, width * 0.9);
    const bannerH = 46;
    const bannerX = width / 2 - bannerW / 2;
    const bannerY = Math.max(16, cy - radius - 55);

    ctx.fillStyle = 'rgba(8, 14, 10, 0.9)';
    ctx.beginPath();
    if ((ctx as any).roundRect) {
      (ctx as any).roundRect(bannerX, bannerY, bannerW, bannerH, 14);
    } else {
      ctx.rect(bannerX, bannerY, bannerW, bannerH);
    }
    ctx.fill();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = state.currentStep === 'complete' ? '#10B981' : '#38BDF8';
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.stroke();

    let bannerTitle = '1/4: Mira directamente al centro';
    let bannerSub = 'Mantén la mirada al frente para fijar los biomarcadores';
    if (state.currentStep === 'left') {
      bannerTitle = '2/4: Gira suavemente a la izquierda ⬅️';
      bannerSub = 'Mueve tu cabeza para calibrar pómulo y sien izquierda';
    } else if (state.currentStep === 'right') {
      bannerTitle = '3/4: Gira suavemente a la derecha ➡️';
      bannerSub = 'Mueve tu cabeza para calibrar mejilla y sien derecha';
    } else if (state.currentStep === 'tilt') {
      bannerTitle = '4/4: Inclina levemente la cabeza ↕️';
      bannerSub = 'Sube o baja el mentón para ajustar frente y mandíbula';
    } else if (state.currentStep === 'complete') {
      bannerTitle = '✓ ¡Calibración 3D Completada con Éxito!';
      bannerSub = 'Mascarilla ajustada anatómicamente a 360°';
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowBlur = 0;
    ctx.fillText(bannerTitle, width / 2, bannerY + 20);

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '10.5px sans-serif';
    ctx.fillText(bannerSub, width / 2, bannerY + 36);

    ctx.restore();
  }

  private drawCalibrationNode(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    completed: boolean,
    label: string,
    active: boolean,
    timestamp: number
  ) {
    ctx.save();
    const pulse = Math.sin(timestamp * 0.008) * 3;

    if (completed) {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 1, y + 3.5);
      ctx.lineTo(x + 5, y - 3.5);
      ctx.stroke();
    } else if (active) {
      ctx.beginPath();
      ctx.arc(x, y, 12 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 14;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.0;
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render Transparent Zone Lines (100% transparent skin, aesthetic precision lines marking each facial zone)
  private renderTransparentZoneLines(
    contours: {
      faceOval: { x: number; y: number }[];
      leftEye: { x: number; y: number }[];
      rightEye: { x: number; y: number }[];
      mouth: { x: number; y: number }[];
    },
    zonePolygons: Record<FaceZoneKey, { x: number; y: number }[]>,
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { faceOval, leftEye, rightEye } = contours;
    if (faceOval.length < 3) return;

    ctx.save();

    // Line theme color selection
    let mainColor = '#10B981'; // Emerald clinical
    let glowColor = 'rgba(16, 185, 129, 0.7)';
    let lightColor = '#34D399';
    let dimColor = 'rgba(16, 185, 129, 0.4)';
    let rgbStr = '16, 185, 129';

    if (this.textureType === 'cyan_lines') {
      mainColor = '#06B6D4';
      glowColor = 'rgba(6, 182, 212, 0.7)';
      lightColor = '#67E8F9';
      dimColor = 'rgba(6, 182, 212, 0.4)';
      rgbStr = '6, 182, 212';
    } else if (this.textureType === 'gold_lines') {
      mainColor = '#F59E0B';
      glowColor = 'rgba(245, 158, 11, 0.7)';
      lightColor = '#FDE68A';
      dimColor = 'rgba(245, 158, 11, 0.4)';
      rgbStr = '245, 158, 11';
    } else if (this.textureType === 'rose_lines') {
      mainColor = '#F43F5E';
      glowColor = 'rgba(244, 63, 94, 0.7)';
      lightColor = '#FDA4AF';
      dimColor = 'rgba(244, 63, 94, 0.4)';
      rgbStr = '244, 63, 94';
    }

    // 1. OUTER FACE PERIMETER (Hairline up to temples and jawline - ZERO FILL, 100% TRANSPARENT SKIN!)
    ctx.beginPath();
    ctx.moveTo(faceOval[0].x, faceOval[0].y);
    for (let i = 1; i < faceOval.length; i++) {
      ctx.lineTo(faceOval[i].x, faceOval[i].y);
    }
    ctx.closePath();

    ctx.lineWidth = 2.2;
    ctx.strokeStyle = mainColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Hairline alignment points
    const topIndices = [0, 1, 2, 3, faceOval.length - 1, faceOval.length - 2, faceOval.length - 3];
    ctx.fillStyle = lightColor;
    for (const idx of topIndices) {
      const pt = faceOval[idx];
      if (pt) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. ANATOMICAL ZONE CONTOUR LINES (Forehead, Under-Eyes, Cheeks, Nose, Chin)
    const zonesToDraw: Array<{
      key: FaceZoneKey;
      label: string;
      color: string;
    }> = [
      { key: 'forehead', label: 'Zona T', color: mainColor },
      { key: 'eyeContour', label: 'Ojeras / Ojos', color: '#EC4899' },
      { key: 'nose', label: 'Nariz', color: mainColor },
      { key: 'leftCheek', label: 'Mejilla Izq.', color: lightColor },
      { key: 'rightCheek', label: 'Mejilla Der.', color: lightColor },
      { key: 'chin', label: 'Barbilla', color: mainColor },
    ];

    for (const z of zonesToDraw) {
      const poly = zonePolygons[z.key];
      if (!poly || poly.length < 3) continue;

      const cov = this.coverage[z.key] || 0;
      const isComplete = cov >= 100;
      const isActive = this.activeTutorialZones.includes(z.key);

      if (z.key === 'eyeContour' && (zonePolygons as any).leftEyeContour && (zonePolygons as any).rightEyeContour) {
        const leftP = (zonePolygons as any).leftEyeContour;
        const rightP = (zonePolygons as any).rightEyeContour;
        ctx.beginPath();
        ctx.moveTo(leftP[0].x, leftP[0].y);
        for (let i = 1; i < leftP.length; i++) ctx.lineTo(leftP[i].x, leftP[i].y);
        ctx.closePath();
        ctx.moveTo(rightP[0].x, rightP[0].y);
        for (let i = 1; i < rightP.length; i++) ctx.lineTo(rightP[i].x, rightP[i].y);
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i].x, poly[i].y);
        }
        ctx.closePath();
      }

      // Translucent aura only on active rubbing / completion
      if (isComplete) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fill();
      } else if (cov > 0) {
        ctx.fillStyle = `rgba(${rgbStr}, ${Math.min(0.08, (cov / 100) * 0.08)})`;
        ctx.fill();
      }

      // Stroke
      if (isComplete) {
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.setLineDash([]);
      } else if (isActive) {
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = lightColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -((timestamp * 0.02) % 10);
      } else {
        ctx.lineWidth = 1.3;
        ctx.strokeStyle = dimColor;
        ctx.shadowBlur = 0;
        ctx.setLineDash([4, 6]);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      // Center Node Badge with Label and Coverage
      const center = this.getPolygonCenter(poly);
      const badgeW = 86;
      const badgeH = 19;
      const badgeX = center.x - badgeW / 2;
      const badgeY = center.y - badgeH / 2;

      ctx.fillStyle = 'rgba(6, 15, 10, 0.78)';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 9);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = isComplete ? '#10B981' : dimColor;
      ctx.stroke();

      ctx.font = 'bold 9.5px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isComplete ? '#6EE7B7' : '#FFFFFF';
      ctx.fillText(
        `${isComplete ? '✓ ' : ''}${z.label} ${Math.round(cov)}%`,
        center.x,
        center.y
      );
    }

    // 3. UNDER-EYE DEDICATED CONTOUR LINES (Ensures eye contour & dark circles are explicitly delineated)
    if (leftEye && leftEye.length > 2) {
      ctx.beginPath();
      ctx.moveTo(leftEye[0].x, leftEye[0].y);
      for (let i = 1; i < leftEye.length; i++) {
        ctx.lineTo(leftEye[i].x, leftEye[i].y);
      }
      ctx.closePath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.shadowBlur = 4;
      ctx.stroke();
    }

    if (rightEye && rightEye.length > 2) {
      ctx.beginPath();
      ctx.moveTo(rightEye[0].x, rightEye[0].y);
      for (let i = 1; i < rightEye.length; i++) {
        ctx.lineTo(rightEye[i].x, rightEye[i].y);
      }
      ctx.closePath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.shadowBlur = 4;
      ctx.stroke();
    }

    ctx.restore();
  }

  // Render Realistic Cosmetic Skincare Clay/Cream Mask (Authentic textures like user's photos)
  private renderRealisticCosmeticMask(
    contours: {
      faceOval: { x: number; y: number }[];
      leftEye: { x: number; y: number }[];
      rightEye: { x: number; y: number }[];
      mouth: { x: number; y: number }[];
    },
    zonePolygons: Record<FaceZoneKey, { x: number; y: number }[]>,
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const { faceOval, leftEye, rightEye, mouth } = contours;
    if (faceOval.length < 3) return;

    ctx.save();

    const op = Math.max(0.1, Math.min(1.0, this.maskOpacity));

    // Realistic clay colors & palettes
    let baseColor = `rgba(184, 216, 200, ${op})`; // Mint green matcha (media_1790861634794.png)
    let highlightColor = `rgba(225, 245, 235, ${op * 0.75})`;
    let shadowColor = `rgba(135, 175, 155, ${op * 0.5})`;
    let strokeColor = `rgba(150, 195, 175, ${op * 0.85})`;
    let sheenColor = 'rgba(255, 255, 255, 0.28)';

    if (this.textureType === 'clay_white') {
      // White Kaolin Spa oatmeal clay (media_1790861538232.png)
      baseColor = `rgba(237, 232, 224, ${op})`;
      highlightColor = `rgba(252, 250, 246, ${op * 0.8})`;
      shadowColor = `rgba(205, 195, 185, ${op * 0.5})`;
      strokeColor = `rgba(220, 210, 200, ${op * 0.85})`;
      sheenColor = 'rgba(255, 255, 255, 0.35)';
    } else if (this.textureType === 'clay_rose') {
      baseColor = `rgba(238, 196, 201, ${op})`;
      highlightColor = `rgba(252, 225, 228, ${op * 0.7})`;
      shadowColor = `rgba(195, 145, 152, ${op * 0.45})`;
      strokeColor = `rgba(215, 170, 178, ${op * 0.85})`;
      sheenColor = 'rgba(255, 255, 255, 0.25)';
    } else if (this.textureType === 'charcoal') {
      baseColor = `rgba(48, 54, 60, ${op})`;
      highlightColor = `rgba(85, 95, 105, ${op * 0.65})`;
      shadowColor = `rgba(25, 30, 35, ${op * 0.5})`;
      strokeColor = `rgba(70, 78, 86, ${op * 0.85})`;
      sheenColor = 'rgba(255, 255, 255, 0.15)';
    } else if (this.textureType === 'gold_mask') {
      baseColor = `rgba(235, 185, 20, ${op * 0.88})`;
      highlightColor = `rgba(255, 235, 120, ${op * 0.8})`;
      shadowColor = `rgba(180, 130, 0, ${op * 0.5})`;
      strokeColor = `rgba(245, 195, 30, ${op * 0.9})`;
      sheenColor = 'rgba(255, 245, 180, 0.45)';
    } else if (this.textureType === 'hydrogel_mask') {
      baseColor = `rgba(6, 182, 212, ${op * 0.5})`;
      highlightColor = `rgba(165, 243, 252, ${op * 0.7})`;
      shadowColor = `rgba(8, 145, 178, ${op * 0.4})`;
      strokeColor = `rgba(56, 189, 248, ${op * 0.85})`;
      sheenColor = 'rgba(255, 255, 255, 0.4)';
    }

    // A: Full Spa Mask Mode or Hybrid Mode: Renders complete face with cutouts
    if (this.maskDisplayMode === 'full_spa' || this.maskDisplayMode === 'hybrid' || this.showFullMask) {
      ctx.beginPath();
      ctx.moveTo(faceOval[0].x, faceOval[0].y);
      for (let i = 1; i < faceOval.length; i++) {
        ctx.lineTo(faceOval[i].x, faceOval[i].y);
      }
      ctx.closePath();

      // Left eye & eyebrow orbital cutout (counter-clockwise)
      if (leftEye.length > 2) {
        ctx.moveTo(leftEye[0].x, leftEye[0].y);
        for (let i = leftEye.length - 1; i >= 0; i--) {
          ctx.lineTo(leftEye[i].x, leftEye[i].y);
        }
        ctx.closePath();
      }

      // Right eye & eyebrow orbital cutout (counter-clockwise)
      if (rightEye.length > 2) {
        ctx.moveTo(rightEye[0].x, rightEye[0].y);
        for (let i = rightEye.length - 1; i >= 0; i--) {
          ctx.lineTo(rightEye[i].x, rightEye[i].y);
        }
        ctx.closePath();
      }

      // Mouth cutout (counter-clockwise)
      if (mouth.length > 2) {
        ctx.moveTo(mouth[0].x, mouth[0].y);
        for (let i = mouth.length - 1; i >= 0; i--) {
          ctx.lineTo(mouth[i].x, mouth[i].y);
        }
        ctx.closePath();
      }

      let minX = width,
        maxX = 0,
        minY = height,
        maxY = 0;
      for (const p of faceOval) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }

      // Directional light gradient following head rotation
      const lightOffsetX = (this.currentHeadPose.yaw || 0) * (maxX - minX) * 0.3;
      const grad = ctx.createLinearGradient(
        minX + lightOffsetX,
        minY,
        maxX + lightOffsetX,
        maxY
      );
      grad.addColorStop(0, highlightColor);
      grad.addColorStop(0.4, baseColor);
      grad.addColorStop(1, shadowColor);

      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 6;
      ctx.fill('evenodd');

      // Soft feathered rim stroke (brush boundary)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = strokeColor;
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Organic Spatula Brushstroke highlights across forehead and cheeks
      ctx.save();
      ctx.clip('evenodd');

      ctx.lineWidth = 4.0;
      ctx.strokeStyle = sheenColor;
      ctx.lineCap = 'round';

      // Forehead curved stroke
      const pTop = faceOval[0];
      if (pTop) {
        ctx.beginPath();
        ctx.arc(pTop.x, pTop.y + (maxY - minY) * 0.18, (maxX - minX) * 0.28, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();
      }

      // Left Cheek upward stroke
      if (zonePolygons.leftCheek && zonePolygons.leftCheek.length > 2) {
        const lc = this.getPolygonCenter(zonePolygons.leftCheek);
        ctx.beginPath();
        ctx.moveTo(lc.x - 25, lc.y + 15);
        ctx.quadraticCurveTo(lc.x, lc.y - 10, lc.x + 20, lc.y - 25);
        ctx.stroke();
      }

      // Right Cheek upward stroke
      if (zonePolygons.rightCheek && zonePolygons.rightCheek.length > 2) {
        const rc = this.getPolygonCenter(zonePolygons.rightCheek);
        ctx.beginPath();
        ctx.moveTo(rc.x + 25, rc.y + 15);
        ctx.quadraticCurveTo(rc.x, rc.y - 10, rc.x - 20, rc.y - 25);
        ctx.stroke();
      }

      ctx.restore();
    }

    // B: Zone Application Mode: Delineates and coats the specific skincare zone progressively
    if (this.maskDisplayMode === 'zone_application') {
      for (const zoneKey of this.activeTutorialZones) {
        const poly = zonePolygons[zoneKey];
        const cov = this.coverage[zoneKey] || 0;
        if (!poly || poly.length < 3) continue;

        const zoneAlpha = Math.max(0.2, (cov / 100) * op);

        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i].x, poly[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = `rgba(184, 216, 200, ${zoneAlpha})`;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.lineWidth = 1.8;
        ctx.strokeStyle = cov >= 100 ? '#10B981' : strokeColor;
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Extract polygonal coordinates for each of the 7 skincare zones
  public static extractZonePolygons(
    landmarks: FaceLandmarkPoint[],
    width: number,
    height: number
  ): Record<FaceZoneKey, { x: number; y: number }[]> & {
    leftEyeContour?: { x: number; y: number }[];
    rightEyeContour?: { x: number; y: number }[];
  } {
    if (landmarks.length >= 400) {
      const p10 = landmarks[10] || { x: 0.5, y: 0.2 };
      const pBridge = landmarks[168] || landmarks[197] || { x: 0.5, y: 0.35 };
      const foreheadSpan = Math.max(0.08, Math.abs(pBridge.y - p10.y));
      const liftAmount = foreheadSpan * 0.32;
      const upperForeheadIndices = new Set([10, 338, 297, 332, 284, 251, 21, 54, 103, 67, 109]);

      const p = (idx: number) => {
        const pt = landmarks[idx] || { x: 0.5, y: 0.5 };
        let py = pt.y;
        if (upperForeheadIndices.has(idx)) {
          const distFromCenter = Math.abs(pt.x - p10.x);
          const weight = Math.max(0.25, 1.0 - distFromCenter * 3.0);
          py = Math.max(0.01, py - liftAmount * weight);
        }
        return {
          x: pt.x * width,
          y: py * height,
        };
      };

      // LEFT UNDER-EYE CRESCENT (ojeras, bolsas y contorno inferior debajo de los ojos)
      const leftUnderEye = [
        p(33), p(7), p(163), p(144), p(145), p(153), p(154), p(155), p(133),
        p(243), p(112), p(26), p(22), p(23), p(24), p(110), p(25), p(130), p(247), p(30), p(29), p(27),
      ];

      // RIGHT UNDER-EYE CRESCENT (ojeras, bolsas y contorno inferior debajo de los ojos)
      const rightUnderEye = [
        p(263), p(249), p(390), p(373), p(374), p(380), p(381), p(382), p(362),
        p(463), p(341), p(256), p(252), p(253), p(254), p(339), p(255), p(359), p(467), p(260), p(259), p(257),
      ];

      return {
        forehead: [p(10), p(338), p(297), p(332), p(284), p(251), p(21), p(54), p(103), p(67), p(109)],
        nose: [p(168), p(197), p(195), p(5), p(4), p(1), p(2), p(98), p(97), p(326), p(327)],
        leftCheek: [p(116), p(123), p(147), p(213), p(192), p(214), p(210), p(205), p(50), p(101), p(118), p(187)],
        rightCheek: [p(345), p(352), p(376), p(433), p(416), p(434), p(430), p(425), p(280), p(330), p(347), p(411)],
        chin: [p(175), p(199), p(200), p(18), p(152), p(377), p(400), p(378), p(379), p(365)],
        eyeContour: leftUnderEye,
        leftEyeContour: leftUnderEye,
        rightEyeContour: rightUnderEye,
        neck: [p(152), p(377), p(400), p(176), p(148), p(152)],
      };
    }

    // Adaptive fallback geometry calibrated to landmarks bounding box
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (const pt of landmarks) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const hasBounds = minX < maxX && minY < maxY;
    const cx = hasBounds ? ((minX + maxX) / 2) * width : width * 0.50;
    const cy = hasBounds ? ((minY + maxY) / 2) * height : height * 0.48;
    const rx = hasBounds ? ((maxX - minX) / 2) * width : width * 0.38;
    const ry = hasBounds ? ((maxY - minY) / 2) * height : height * 0.44;

    // Smooth Under-Eye fallback crescents (each completely independent)
    const leftEyeUnderFallback: { x: number; y: number }[] = [];
    const lx = cx - rx * 0.42;
    const ly = cy - ry * 0.08;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      leftEyeUnderFallback.push({
        x: lx + Math.cos(a) * (rx * 0.20),
        y: ly + Math.sin(a) * (ry * 0.10),
      });
    }

    const rightEyeUnderFallback: { x: number; y: number }[] = [];
    const rxCenter = cx + rx * 0.42;
    const ryCenter = cy - ry * 0.08;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      rightEyeUnderFallback.push({
        x: rxCenter + Math.cos(a) * (rx * 0.20),
        y: ryCenter + Math.sin(a) * (ry * 0.10),
      });
    }

    return {
      forehead: [
        { x: cx - rx * 0.68, y: cy - ry * 0.62 },
        { x: cx - rx * 0.45, y: cy - ry * 0.80 },
        { x: cx - rx * 0.20, y: cy - ry * 0.88 },
        { x: cx, y: cy - ry * 0.90 },
        { x: cx + rx * 0.20, y: cy - ry * 0.88 },
        { x: cx + rx * 0.45, y: cy - ry * 0.80 },
        { x: cx + rx * 0.68, y: cy - ry * 0.62 },
        { x: cx + rx * 0.54, y: cy - ry * 0.32 },
        { x: cx, y: cy - ry * 0.28 },
        { x: cx - rx * 0.54, y: cy - ry * 0.32 },
      ],
      nose: [
        { x: cx - rx * 0.14, y: cy - ry * 0.26 },
        { x: cx + rx * 0.14, y: cy - ry * 0.26 },
        { x: cx + rx * 0.18, y: cy + ry * 0.08 },
        { x: cx + rx * 0.22, y: cy + ry * 0.16 },
        { x: cx, y: cy + ry * 0.22 },
        { x: cx - rx * 0.22, y: cy + ry * 0.16 },
        { x: cx - rx * 0.18, y: cy + ry * 0.08 },
      ],
      leftCheek: [
        { x: cx - rx * 0.26, y: cy + ry * 0.06 },
        { x: cx - rx * 0.65, y: cy + ry * 0.06 },
        { x: cx - rx * 0.76, y: cy + ry * 0.20 },
        { x: cx - rx * 0.66, y: cy + ry * 0.35 },
        { x: cx - rx * 0.44, y: cy + ry * 0.38 },
        { x: cx - rx * 0.24, y: cy + ry * 0.28 },
        { x: cx - rx * 0.22, y: cy + ry * 0.16 },
      ],
      rightCheek: [
        { x: cx + rx * 0.26, y: cy + ry * 0.06 },
        { x: cx + rx * 0.65, y: cy + ry * 0.06 },
        { x: cx + rx * 0.76, y: cy + ry * 0.20 },
        { x: cx + rx * 0.66, y: cy + ry * 0.35 },
        { x: cx + rx * 0.44, y: cy + ry * 0.38 },
        { x: cx + rx * 0.24, y: cy + ry * 0.28 },
        { x: cx + rx * 0.22, y: cy + ry * 0.16 },
      ],
      chin: [
        { x: cx - rx * 0.30, y: cy + ry * 0.46 },
        { x: cx + rx * 0.30, y: cy + ry * 0.46 },
        { x: cx + rx * 0.24, y: cy + ry * 0.78 },
        { x: cx, y: cy + ry * 0.86 },
        { x: cx - rx * 0.24, y: cy + ry * 0.78 },
      ],
      eyeContour: leftEyeUnderFallback,
      leftEyeContour: leftEyeUnderFallback,
      rightEyeContour: rightEyeUnderFallback,
      neck: [
        { x: cx - rx * 0.45, y: cy + ry * 0.88 },
        { x: cx + rx * 0.45, y: cy + ry * 0.88 },
        { x: cx + rx * 0.55, y: cy + ry * 1.20 },
        { x: cx - rx * 0.55, y: cy + ry * 1.20 },
      ],
    };
  }

  // Active Hand Movement & Rubbing Detection using offscreen downsampled video
  private detectZoneRubbingMotion(
    zonePolygons: Record<FaceZoneKey, { x: number; y: number }[]>,
    width: number,
    height: number
  ) {
    if (!this.isTrackingMotion || this.isCalibrating) {
      this.hasRecentHandMotion = false;
      this.handMotionCooldown = 0;
      return;
    }
    if (!this.video || this.video.readyState < 2) return;

    const sampleW = 160;
    const sampleH = 120;

    if (!this.motionCanvas) {
      if (typeof document !== 'undefined') {
        this.motionCanvas = document.createElement('canvas');
        this.motionCanvas.width = sampleW;
        this.motionCanvas.height = sampleH;
        this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });
      }
    }

    if (!this.motionCtx || !this.motionCanvas) return;

    // 1. Draw video with mirror compensation so sample pixels match landmarks 1:1!
    try {
      this.motionCtx.save();
      if (this.mirrorMode) {
        this.motionCtx.translate(sampleW, 0);
        this.motionCtx.scale(-1, 1);
      }
      this.motionCtx.drawImage(this.video, 0, 0, sampleW, sampleH);
      this.motionCtx.restore();
    } catch {
      return;
    }

    let currentData: ImageData;
    try {
      currentData = this.motionCtx.getImageData(0, 0, sampleW, sampleH);
    } catch {
      return;
    }

    if (!this.prevFrameData || this.prevFrameWidth !== sampleW || this.prevFrameHeight !== sampleH) {
      this.prevFrameData = new Uint8ClampedArray(currentData.data);
      this.prevFrameWidth = sampleW;
      this.prevFrameHeight = sampleH;
      return;
    }

    const cur = currentData.data;
    const prev = this.prevFrameData;
    const activeZones = this.activeTutorialZones;
    const scaleX = sampleW / width;
    const scaleY = sampleH / height;

    // 2. Global Exposure / Lighting Drift Subtraction
    // Neutral corner sampling removes whole-screen flicker from camera auto-exposure
    let exposureDiffSum = 0;
    let exposureSamples = 0;
    const cornerPoints = [
      [6, 6], [12, 12], [sampleW - 12, 6], [sampleW - 6, 12],
      [6, sampleH - 12], [sampleW - 12, sampleH - 12],
    ];
    for (const [cx, cy] of cornerPoints) {
      const idx = (cy * sampleW + cx) * 4;
      const lCur = 0.299 * cur[idx] + 0.587 * cur[idx + 1] + 0.114 * cur[idx + 2];
      const lPrev = 0.299 * prev[idx] + 0.587 * prev[idx + 1] + 0.114 * prev[idx + 2];
      exposureDiffSum += (lCur - lPrev);
      exposureSamples++;
    }
    const globalExposureShift = exposureSamples > 0 ? (exposureDiffSum / exposureSamples) : 0;

    // 3. Detect dominant hand position in the frame (center of mass of vigorous movement)
    let dominantMotionY = 0;
    let dominantMotionX = 0;
    let totalHighDeltaWeight = 0;
    let globalMovingPixelCount = 0;

    const stepGlobal = 3;
    for (let y = 4; y < sampleH - 4; y += stepGlobal) {
      for (let x = 4; x < sampleW - 4; x += stepGlobal) {
        const idx = (y * sampleW + x) * 4;
        const lumCur = 0.299 * cur[idx] + 0.587 * cur[idx + 1] + 0.114 * cur[idx + 2];
        const lumPrev = 0.299 * prev[idx] + 0.587 * prev[idx + 1] + 0.114 * prev[idx + 2];
        const adjustedDelta = Math.abs((lumCur - lumPrev) - globalExposureShift);

        if (adjustedDelta > 26) {
          dominantMotionX += x * adjustedDelta;
          dominantMotionY += y * adjustedDelta;
          totalHighDeltaWeight += adjustedDelta;
          globalMovingPixelCount++;
        }
      }
    }

    const hasActiveHandMotion = globalMovingPixelCount >= 28 && totalHighDeltaWeight > 700;
    this.hasRecentHandMotion = hasActiveHandMotion;
    if (hasActiveHandMotion) {
      this.handMotionCooldown = 6;
    } else if (this.handMotionCooldown > 0) {
      this.handMotionCooldown--;
      this.hasRecentHandMotion = true;
    }
    const handCenterY = hasActiveHandMotion ? dominantMotionY / totalHighDeltaWeight : -1;

    // 4. Evaluate each facial zone independently with strict spatial boundary checks
    for (const zoneKey of activeZones) {
      const origPoly = zonePolygons[zoneKey];
      if (!origPoly || origPoly.length === 0) continue;

      // Project polygon to sample dimensions
      const poly = origPoly.map((pt) => ({
        x: pt.x * scaleX,
        y: pt.y * scaleY,
      }));

      let minX = sampleW;
      let maxX = 0;
      let minY = sampleH;
      let maxY = 0;
      let sumY = 0;
      for (const pt of poly) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
        sumY += pt.y;
      }
      const zoneCenterY = sumY / poly.length;
      const zoneHeight = maxY - minY;

      // STRICT SPATIAL ISOLATION:
      // If the dominant hand movement is elsewhere in the image (e.g., hand is at mouth y~85 while
      // forehead is y~25), REJECT motion for this zone!
      if (hasActiveHandMotion) {
        const verticalDist = Math.abs(handCenterY - zoneCenterY);
        const maxAllowedDist = Math.max(14, zoneHeight * 1.25);
        if (verticalDist > maxAllowedDist) {
          continue; // Hand is physically in another region of the face! Skip!
        }
      } else {
        continue;
      }

      minX = Math.max(0, Math.floor(minX));
      maxX = Math.min(sampleW - 1, Math.ceil(maxX));
      minY = Math.max(0, Math.floor(minY));
      maxY = Math.min(sampleH - 1, Math.ceil(maxY));

      const step = 2;
      let activeMovingPixels = 0;
      let totalZoneSamples = 0;
      let zoneMotionEnergy = 0;
      let zoneSumMovingX = 0;
      let zoneSumMovingY = 0;
      let zoneMovingCount = 0;

      for (let y = minY; y <= maxY; y += step) {
        for (let x = minX; x <= maxX; x += step) {
          if (this.isPointInPolygon(x, y, poly)) {
            totalZoneSamples++;
            const idx = (y * sampleW + x) * 4;
            const lumCur = 0.299 * cur[idx] + 0.587 * cur[idx + 1] + 0.114 * cur[idx + 2];
            const lumPrev = 0.299 * prev[idx] + 0.587 * prev[idx + 1] + 0.114 * prev[idx + 2];
            const adjustedDelta = Math.abs((lumCur - lumPrev) - globalExposureShift);

            if (adjustedDelta > 26) {
              activeMovingPixels++;
              zoneMotionEnergy += adjustedDelta;
              zoneSumMovingX += x;
              zoneSumMovingY += y;
              zoneMovingCount++;
            }
          }
        }
      }

      if (totalZoneSamples >= 8) {
        const activeRatio = activeMovingPixels / totalZoneSamples;
        const avgMotionDelta = activeMovingPixels > 0 ? (zoneMotionEnergy / activeMovingPixels) : 0;

        // Realistic hand rubbing criteria:
        // Hand must cover and actively move across at least 18% of this specific zone
        // with substantial contrast delta (fingers/palm moving across skin)
        if (activeRatio >= 0.18 && avgMotionDelta >= 30) {
          const increment = Math.min(5.0, activeRatio * 15 * this.sensitivityMultiplier);
          this.increaseZoneCoverage(zoneKey, increment);
        }
      }
    }

    this.prevFrameData.set(cur);
  }

  private isPointInPolygon(x: number, y: number, poly: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x;
      const yi = poly[i].y;
      const xj = poly[j].x;
      const yj = poly[j].y;
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Render Zone Progress Outlines, Glowing Nodes, HUD Badges & Clinical Brackets
  private renderZoneProgressVisuals(
    zonePolygons: Record<FaceZoneKey, { x: number; y: number }[]>,
    contours: {
      faceOval: { x: number; y: number }[];
      leftEye: { x: number; y: number }[];
      rightEye: { x: number; y: number }[];
      mouth: { x: number; y: number }[];
    },
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.save();

    // 1. Clinical Bounding Reticle & Sci-Fi Corner Brackets around Face
    if (contours.faceOval.length >= 8) {
      let minX = width;
      let maxX = 0;
      let minY = height;
      let maxY = 0;

      for (const pt of contours.faceOval) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }

      const padX = (maxX - minX) * 0.08;
      const padY = (maxY - minY) * 0.08;
      const bLeft = Math.max(8, minX - padX);
      const bRight = Math.min(width - 8, maxX + padX);
      const bTop = Math.max(8, minY - padY);
      const bBottom = Math.min(height - 8, maxY + padY);
      const cornerLen = Math.min(22, (bRight - bLeft) * 0.12);

      ctx.lineWidth = 2.0;
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.75)'; // Clinical Emerald
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.setLineDash([]);

      // Top-Left Corner Bracket
      ctx.beginPath();
      ctx.moveTo(bLeft, bTop + cornerLen);
      ctx.lineTo(bLeft, bTop);
      ctx.lineTo(bLeft + cornerLen, bTop);
      ctx.stroke();

      // Top-Right Corner Bracket
      ctx.beginPath();
      ctx.moveTo(bRight - cornerLen, bTop);
      ctx.lineTo(bRight, bTop);
      ctx.lineTo(bRight, bTop + cornerLen);
      ctx.stroke();

      // Bottom-Left Corner Bracket
      ctx.beginPath();
      ctx.moveTo(bLeft, bBottom - cornerLen);
      ctx.lineTo(bLeft, bBottom);
      ctx.lineTo(bLeft + cornerLen, bBottom);
      ctx.stroke();

      // Bottom-Right Corner Bracket
      ctx.beginPath();
      ctx.moveTo(bRight - cornerLen, bBottom);
      ctx.lineTo(bRight, bBottom);
      ctx.lineTo(bRight, bBottom - cornerLen);
      ctx.stroke();

      // Subtle Biometric Scanner Top Pill
      const pillW = 210;
      const pillH = 22;
      const pillX = (bLeft + bRight) / 2 - pillW / 2;
      const pillY = Math.max(10, bTop - 28);

      ctx.fillStyle = 'rgba(6, 15, 10, 0.85)';
      ctx.beginPath();
      if ((ctx as any).roundRect) {
        (ctx as any).roundRect(pillX, pillY, pillW, pillH, 11);
      } else {
        ctx.rect(pillX, pillY, pillW, pillH);
      }
      ctx.fill();

      ctx.lineWidth = 1.0;
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
      ctx.stroke();

      ctx.fillStyle = '#6EE7B7';
      ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText('BIOMETRÍA FACIAL IA • DETECCIÓN EN VIVO', (bLeft + bRight) / 2, pillY + pillH / 2);
    }

    // 2. Render Biometric Face Zones (Zona T, Mejillas, Barbilla, Ojos)
    const zoneMetadata: Record<
      FaceZoneKey,
      { name: string; icon: string; color: string; glowRgb: string }
    > = {
      forehead: { name: 'Zona T', icon: '☀️', color: '#F59E0B', glowRgb: '245, 158, 11' },
      nose: { name: 'Zona T', icon: '☀️', color: '#F59E0B', glowRgb: '245, 158, 11' },
      leftCheek: { name: 'Mejilla Izq.', icon: '🌿', color: '#10B981', glowRgb: '16, 185, 129' },
      rightCheek: { name: 'Mejilla Der.', icon: '🌿', color: '#10B981', glowRgb: '16, 185, 129' },
      chin: { name: 'Barbilla', icon: '✨', color: '#A855F7', glowRgb: '168, 85, 247' },
      eyeContour: { name: 'Ojos', icon: '👁️', color: '#EC4899', glowRgb: '236, 72, 153' },
      neck: { name: 'Cuello', icon: '💧', color: '#06B6D4', glowRgb: '6, 182, 212' },
    };

    const pulse = Math.sin(timestamp * 0.006);

    for (const [key, poly] of Object.entries(zonePolygons)) {
      const zoneKey = key as FaceZoneKey;
      const cov = this.coverage[zoneKey] || 0;
      const isActive = this.activeTutorialZones.includes(zoneKey);
      const isComplete = cov >= 100;
      const meta = zoneMetadata[zoneKey] || { name: zoneKey, icon: '•', color: '#10B981', glowRgb: '16, 185, 129' };

      if (!poly || poly.length < 3) continue;

      // Draw Zone Outline Polygon
      if (zoneKey === 'eyeContour' && (zonePolygons as any).leftEyeContour && (zonePolygons as any).rightEyeContour) {
        const leftP = (zonePolygons as any).leftEyeContour;
        const rightP = (zonePolygons as any).rightEyeContour;
        ctx.beginPath();
        ctx.moveTo(leftP[0].x, leftP[0].y);
        for (let i = 1; i < leftP.length; i++) ctx.lineTo(leftP[i].x, leftP[i].y);
        ctx.closePath();
        ctx.moveTo(rightP[0].x, rightP[0].y);
        for (let i = 1; i < rightP.length; i++) ctx.lineTo(rightP[i].x, rightP[i].y);
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i].x, poly[i].y);
        }
        ctx.closePath();
      }

      // Translucent Fill Glow
      if (isComplete) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 16;
        ctx.fill();
      } else if (isActive) {
        const fillAlpha = 0.12 + Math.max(0, pulse * 0.05);
        ctx.fillStyle = `rgba(${meta.glowRgb}, ${fillAlpha})`;
        ctx.shadowColor = meta.color;
        ctx.shadowBlur = 12;
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${meta.glowRgb}, 0.04)`;
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      // Stroke Boundary (Dashed or Solid)
      if (isComplete) {
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 14;
        ctx.setLineDash([]);
      } else if (isActive) {
        ctx.lineWidth = 2.0;
        ctx.strokeStyle = meta.color;
        ctx.shadowColor = meta.color;
        ctx.shadowBlur = 10;
        ctx.setLineDash([6, 4]);
        ctx.lineDashOffset = -((timestamp * 0.015) % 10);
      } else {
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = `rgba(${meta.glowRgb}, 0.55)`;
        ctx.shadowBlur = 0;
        ctx.setLineDash([4, 6]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Node Indicator
      const center = this.getPolygonCenter(poly);

      if (isComplete) {
        // Green completed badge with checkmark
        ctx.beginPath();
        ctx.arc(center.x, center.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(center.x - 3.5, center.y);
        ctx.lineTo(center.x - 1, center.y + 3);
        ctx.lineTo(center.x + 4, center.y - 3);
        ctx.stroke();
      } else if (isActive) {
        // Glowing Center Pulse Node
        const outerRadius = 6 + Math.max(0, pulse * 4);
        ctx.beginPath();
        ctx.arc(center.x, center.y, outerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${meta.glowRgb}, ${0.7 - pulse * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(center.x, center.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = meta.color;
        ctx.shadowColor = meta.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      } else {
        // Subtle idle dot
        ctx.beginPath();
        ctx.arc(center.x, center.y, 2.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${meta.glowRgb}, 0.6)`;
        ctx.shadowBlur = 0;
        ctx.fill();
      }

      // Sleek Biometric Floating HUD Badge (forehead, cheeks, chin)
      if ((isActive || isComplete || cov > 0) && zoneKey !== 'nose') {
        const badgeLabel = isComplete
          ? `✓ ${meta.name} 100%`
          : `${meta.icon} ${meta.name} ${Math.round(cov)}%`;

        ctx.font = 'bold 10px sans-serif';
        const textWidth = ctx.measureText(badgeLabel).width;
        const bW = textWidth + 16;
        const bH = 20;

        let bX = center.x - bW / 2;
        let bY = center.y - (zoneKey === 'forehead' ? 18 : 22);

        bX = Math.max(6, Math.min(width - bW - 6, bX));
        bY = Math.max(6, Math.min(height - bH - 6, bY));

        ctx.fillStyle = 'rgba(8, 14, 10, 0.9)';
        ctx.beginPath();
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(bX, bY, bW, bH, 10);
        } else {
          ctx.rect(bX, bY, bW, bH);
        }
        ctx.fill();

        ctx.lineWidth = 1.0;
        ctx.strokeStyle = isComplete ? '#10B981' : meta.color;
        ctx.shadowColor = isComplete ? '#10B981' : meta.color;
        ctx.shadowBlur = isComplete ? 8 : 4;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(badgeLabel, bX + bW / 2, bY + bH / 2);
      }
    }

    // 3. Render Particles in Active / Scrubbed Zones
    if (this.showParticles) {
      this.renderZoneParticles(zonePolygons, width, height, timestamp);
    }

    ctx.restore();
  }

  // Micro-particles: foam or hydration droplets in active / rubbed zones
  private renderZoneParticles(
    zonePolygons: Record<FaceZoneKey, { x: number; y: number }[]>,
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx) return;
    const ctx = this.ctx;

    for (const p of this.foamParticles) {
      const poly = zonePolygons[p.zone];
      if (!poly || poly.length < 3) continue;

      const center = this.getPolygonCenter(poly);
      const isComplete = (this.coverage[p.zone] || 0) >= 100;
      const isActive = this.activeTutorialZones.includes(p.zone);

      if (!isActive && !isComplete) continue;

      p.wobbleOffset += p.wobbleSpeed;
      const px = center.x + Math.sin(p.wobbleOffset) * (width * 0.05 * p.x);
      const py = center.y + Math.cos(p.wobbleOffset) * (height * 0.04 * p.y);

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);

      if (isComplete) {
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha * 0.5})`;
      } else {
        ctx.fillStyle = `rgba(153, 246, 228, ${p.alpha * 0.6})`;
      }
      ctx.fill();
    }
  }

  private getPolygonCenter(poly: { x: number; y: number }[]): { x: number; y: number } {
    let sx = 0;
    let sy = 0;
    for (const pt of poly) {
      sx += pt.x;
      sy += pt.y;
    }
    return { x: sx / poly.length, y: sy / poly.length };
  }

  // Holographic Cyber-Mesh Rendering
  private renderHolographicMesh(
    landmarks: FaceLandmarkPoint[],
    width: number,
    height: number,
    timestamp: number
  ) {
    if (!this.ctx || landmarks.length < 30) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';

    const stride = landmarks.length >= 400 ? 14 : 2;
    const count = Math.min(landmarks.length, 120);

    for (let i = 0; i < count - stride; i += stride) {
      const p1 = landmarks[i];
      const p2 = landmarks[i + stride];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    const pulseRadius = 2.0 + Math.sin(timestamp * 0.008) * 0.8;
    ctx.fillStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 6;

    for (let i = 0; i < count; i += stride * 2) {
      const p = landmarks[i];
      if (p) {
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
