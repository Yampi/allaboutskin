'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Sparkles,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Maximize2,
  RefreshCw,
  Layers,
  Activity,
  CheckCircle2,
  Sliders,
  ChevronRight,
  VideoOff,
} from 'lucide-react';
import { FaceSkinAnalysis } from '@/lib/gemini';
import { FaceMaskArEngine } from './FaceMaskArEngine';
import { VirtualTextureType, FaceZoneKey, FaceLandmarkPoint } from './types';

interface ClinicalFaceMaskVisorProps {
  capturedImagePreview: string | null;
  faceSkinResult: FaceSkinAnalysis;
  imageDimensions: { width: number; height: number } | null;
  onOpenFullArTutorial?: () => void;
}

export type VisorViewMode = '3d_mesh' | 'live_camera' | 'clean_photo';

function getPolygonCenter(poly: { x: number; y: number }[]): { x: number; y: number } {
  if (!poly || poly.length === 0) return { x: 0, y: 0 };
  let sumX = 0;
  let sumY = 0;
  for (const p of poly) {
    sumX += p.x;
    sumY += p.y;
  }
  return { x: sumX / poly.length, y: sumY / poly.length };
}

// Module-level singleton FaceLandmarker for static photo detection (prevents 30MB re-download)
let cachedStaticFaceLandmarker: any = null;
let staticLandmarkerLoadingPromise: Promise<any> | null = null;

async function getStaticFaceLandmarker() {
  if (cachedStaticFaceLandmarker) return cachedStaticFaceLandmarker;
  if (!staticLandmarkerLoadingPromise) {
    staticLandmarkerLoadingPromise = (async () => {
      const vision = await FaceMaskArEngine.loadMediaPipeTasksVision();
      const filesetResolver = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      try {
        cachedStaticFaceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          minFaceDetectionConfidence: 0.22,
        });
      } catch {
        cachedStaticFaceLandmarker = await vision.FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
          minFaceDetectionConfidence: 0.22,
        });
      }
      return cachedStaticFaceLandmarker;
    })();
  }
  return staticLandmarkerLoadingPromise;
}

function loadLocalImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Do NOT set crossOrigin for data: or blob: URLs (prevents browser security block)
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Error cargando imagen: ' + err));
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      resolve(img);
    }
  });
}

export default function ClinicalFaceMaskVisor({
  capturedImagePreview,
  faceSkinResult,
  imageDimensions,
  onOpenFullArTutorial,
}: ClinicalFaceMaskVisorProps) {
  // Visor Mode: '3d_mesh' (3D topology over photo) | 'live_camera' (Real-time AR FaceMesh) | 'clean_photo'
  const [viewMode, setViewMode] = useState<VisorViewMode>('3d_mesh');

  // Active highlighted zone in 3D: 'ALL' | 'ZONE_T' | 'CHEEKS' | 'EYES'
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'ZONE_T' | 'CHEEKS' | 'EYES'>('ALL');

  // 3D Mask Style: 'clinical_laser' (Láser Esmeralda/Ámbar) | 'cyber_mesh' (Malla 3D Poligonal) | 'spa_mask'
  const [meshStyle, setMeshStyle] = useState<'clinical_laser' | 'cyber_mesh' | 'spa_mask'>('clinical_laser');

  // Visibility toggle
  const [showOverlays, setShowOverlays] = useState(true);

  // Measured natural dimensions of the captured image
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const activeDimensions = naturalDimensions || imageDimensions || { width: 640, height: 480 };

  // Live Camera AR Engine references
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const liveStreamRef = useRef<MediaStream | null>(null);
  const arEngineRef = useRef<FaceMaskArEngine | null>(null);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [liveCameraError, setLiveCameraError] = useState<string | null>(null);

  // Static 3D Mesh Canvas references & Real MediaPipe Landmarks on Photo
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [imageLandmarks, setImageLandmarks] = useState<FaceLandmarkPoint[] | null>(null);
  const [isDetectingLandmarks, setIsDetectingLandmarks] = useState(false);

  // ---------------------------------------------------------------------------
  // 1. MEDIAPIPE NEURAL DETECTION ON STATIC PHOTO (Exact 478 3D Landmarks)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!capturedImagePreview) return;
    let isCancelled = false;

    const detectLandmarksOnPhoto = async () => {
      setIsDetectingLandmarks(true);
      const timer = setTimeout(() => {
        if (!isCancelled) setIsDetectingLandmarks(false);
      }, 4500);

      try {
        const img = await loadLocalImage(capturedImagePreview);
        if (isCancelled) return;

        const natW = img.naturalWidth || 640;
        const natH = img.naturalHeight || 480;
        setNaturalDimensions({ width: natW, height: natH });

        const landmarker = await getStaticFaceLandmarker();
        if (isCancelled || !landmarker) return;

        // Render to clean offscreen canvas to guarantee pristine pixels across all browsers
        const offCanvas = document.createElement('canvas');
        offCanvas.width = natW;
        offCanvas.height = natH;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, natW, natH);
          const results = landmarker.detect(offCanvas);
          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            const rawLandmarks: FaceLandmarkPoint[] = results.faceLandmarks[0].map((pt: any) => ({
              x: pt.x,
              y: pt.y,
              z: pt.z,
            }));
            setImageLandmarks(rawLandmarks);
          }
        }
      } catch (err) {
        console.warn('[MediaPipe Photo] Landmark detection error:', err);
      } finally {
        clearTimeout(timer);
        if (!isCancelled) setIsDetectingLandmarks(false);
      }
    };

    detectLandmarksOnPhoto();

    return () => {
      isCancelled = true;
    };
  }, [capturedImagePreview]);

  // ---------------------------------------------------------------------------
  // 2. LIVE CAMERA AR MASK ENGINE (MediaPipe 3D Face Mesh Tracking)
  // ---------------------------------------------------------------------------
  const startLiveArCamera = useCallback(async () => {
    setLiveCameraError(null);
    stopLiveArCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este dispositivo.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      liveStreamRef.current = stream;

      if (liveVideoRef.current && liveCanvasRef.current) {
        liveVideoRef.current.srcObject = stream;
        await liveVideoRef.current.play().catch(() => {});

        // Initialize and attach FaceMaskArEngine
        const engine = new FaceMaskArEngine();
        arEngineRef.current = engine;
        await engine.initMediaPipe();

        // Configure engine based on skin diagnosis
        engine.textureType =
          faceSkinResult.skinTypeEstimate === 'OILY' || faceSkinResult.skinTypeEstimate === 'COMBINATION'
            ? 'emerald_lines'
            : 'rose_lines';
        engine.showHoloMesh = meshStyle === 'cyber_mesh';
        engine.showZoneOutlines = true;
        engine.showFullMask = meshStyle === 'spa_mask';
        engine.mirrorMode = true;

        updateEngineZones(engine, selectedZone);

        const vw = liveVideoRef.current.videoWidth || 1280;
        const vh = liveVideoRef.current.videoHeight || 720;
        liveCanvasRef.current.width = vw;
        liveCanvasRef.current.height = vh;

        engine.attach(liveVideoRef.current, liveCanvasRef.current);
        setIsLiveCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Error starting live AR camera:', err);
      setIsLiveCameraActive(false);
      setLiveCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara no concedido.'
          : 'No se pudo iniciar la cámara para AR en vivo.'
      );
    }
  }, [faceSkinResult.skinTypeEstimate, meshStyle, selectedZone]);

  const stopLiveArCamera = useCallback(() => {
    if (arEngineRef.current) {
      arEngineRef.current.detach();
      arEngineRef.current = null;
    }
    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach((track) => track.stop());
      liveStreamRef.current = null;
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
  }, []);

  const updateEngineZones = (engine: FaceMaskArEngine, zone: 'ALL' | 'ZONE_T' | 'CHEEKS' | 'EYES') => {
    if (zone === 'ZONE_T') {
      engine.activeTutorialZones = ['forehead', 'nose'];
    } else if (zone === 'CHEEKS') {
      engine.activeTutorialZones = ['leftCheek', 'rightCheek'];
    } else if (zone === 'EYES') {
      engine.activeTutorialZones = ['eyeContour'];
    } else {
      engine.activeTutorialZones = ['forehead', 'nose', 'leftCheek', 'rightCheek', 'eyeContour', 'chin'];
    }
  };

  useEffect(() => {
    if (arEngineRef.current && isLiveCameraActive) {
      arEngineRef.current.showHoloMesh = meshStyle === 'cyber_mesh';
      arEngineRef.current.showFullMask = meshStyle === 'spa_mask';
      updateEngineZones(arEngineRef.current, selectedZone);
    }
  }, [meshStyle, selectedZone, isLiveCameraActive]);

  useEffect(() => {
    if (viewMode === 'live_camera') {
      startLiveArCamera();
    } else {
      stopLiveArCamera();
    }

    return () => {
      stopLiveArCamera();
    };
  }, [viewMode, startLiveArCamera, stopLiveArCamera]);

  // ---------------------------------------------------------------------------
  // 3. STATIC PHOTO 3D ANATOMICAL MESH RENDERER (Canvas Overlay)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (viewMode !== '3d_mesh' || !showOverlays) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      return;
    }

    const canvas = staticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animTime = 0;

    const renderStatic3DMesh = () => {
      animTime += 1;
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      // Use real MediaPipe landmarks if detected on image, or calibrated adaptive landmarks
      const activeLandmarks: FaceLandmarkPoint[] =
        imageLandmarks || FaceMaskArEngine.generateAdaptiveLandmarks(width, height, faceSkinResult?.faceRegions);

      // Extract high-precision anatomical contours and skincare zones using MediaPipe indices
      const contours = FaceMaskArEngine.extractFaceContours(activeLandmarks, width, height);
      const zonePolygons = FaceMaskArEngine.extractZonePolygons(activeLandmarks, width, height);

      const pulse = Math.sin(animTime * 0.05);
      const isZoneTActive = selectedZone === 'ALL' || selectedZone === 'ZONE_T';
      const isCheeksActive = selectedZone === 'ALL' || selectedZone === 'CHEEKS';
      const isEyesActive = selectedZone === 'ALL' || selectedZone === 'EYES';

      ctx.save();

      // -------------------------------------------------------------------------
      // A. 3D FACIAL OVAL PERIMETER (Real Hairline down to Temples, Jaw & Chin)
      // -------------------------------------------------------------------------
      if (contours.faceOval.length >= 3) {
        ctx.beginPath();
        const len = contours.faceOval.length;
        const startMidX = (contours.faceOval[len - 1].x + contours.faceOval[0].x) / 2;
        const startMidY = (contours.faceOval[len - 1].y + contours.faceOval[0].y) / 2;
        ctx.moveTo(startMidX, startMidY);
        for (let i = 0; i < len; i++) {
          const curr = contours.faceOval[i];
          const next = contours.faceOval[(i + 1) % len];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();

        ctx.lineWidth = 2.0;
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.75)'; // Clinical Emerald Laser
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Fiducial landmark alignment dots on hairline & jawline
        ctx.fillStyle = '#6EE7B7';
        for (let i = 0; i < contours.faceOval.length; i += 3) {
          const pt = contours.faceOval[i];
          if (pt) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // -------------------------------------------------------------------------
      // B. 3D CYBER-MESH TRIANGULATION (Holographic Wireframe Depth)
      // -------------------------------------------------------------------------
      if (meshStyle === 'cyber_mesh' && activeLandmarks.length >= 30) {
        ctx.lineWidth = 0.6;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Cyan holographic
        ctx.shadowBlur = 0;

        const stride = activeLandmarks.length >= 400 ? 14 : 2;
        const count = Math.min(activeLandmarks.length, 120);

        for (let i = 0; i < count; i += stride) {
          const p1 = activeLandmarks[i];
          const p2 = activeLandmarks[(i + stride) % count];
          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
          }
        }
      }

      // -------------------------------------------------------------------------
      // C. 3D SPA TEXTURE OVERLAY (Optional Full Mask)
      // -------------------------------------------------------------------------
      if (meshStyle === 'spa_mask' && contours.faceOval.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(contours.faceOval[0].x, contours.faceOval[0].y);
        for (let i = 1; i < contours.faceOval.length; i++) {
          ctx.lineTo(contours.faceOval[i].x, contours.faceOval[i].y);
        }
        ctx.closePath();

        // Eye cutouts
        const cut = (pts: { x: number; y: number }[]) => {
          if (!pts || pts.length < 3) return;
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();
        };

        cut(contours.leftEye);
        cut(contours.rightEye);
        cut(contours.mouth);

        ctx.fillStyle = 'rgba(184, 216, 200, 0.55)';
        ctx.shadowColor = 'rgba(52, 211, 153, 0.4)';
        ctx.shadowBlur = 8;
        ctx.fill('evenodd');
      }

      // -------------------------------------------------------------------------
      // D. 3D ZONA T (Forehead Arch + Nasal Pyramid & Alar Contour)
      // -------------------------------------------------------------------------
      const drawPoly = (
        poly: { x: number; y: number }[],
        isActive: boolean,
        glowColor: string,
        strokeColor: string,
        dashed = false
      ) => {
        if (!poly || poly.length < 3) return;
        ctx.beginPath();
        const len = poly.length;
        // Smooth quadratic spline through midpoints:
        const startMidX = (poly[len - 1].x + poly[0].x) / 2;
        const startMidY = (poly[len - 1].y + poly[0].y) / 2;
        ctx.moveTo(startMidX, startMidY);
        for (let i = 0; i < len; i++) {
          const curr = poly[i];
          const next = poly[(i + 1) % len];
          const midX = (curr.x + next.x) / 2;
          const midY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
        }
        ctx.closePath();

        if (isActive) {
          const fillAlpha = selectedZone === 'ZONE_T' || selectedZone === 'CHEEKS' || selectedZone === 'EYES'
            ? 0.22 + pulse * 0.04
            : 0.10 + pulse * 0.02;
          ctx.fillStyle = glowColor.replace('__A__', fillAlpha.toString());
          ctx.shadowColor = strokeColor;
          ctx.shadowBlur = 14;
          ctx.fill();

          ctx.lineWidth = 2.0;
          ctx.strokeStyle = strokeColor;
          if (dashed) {
            ctx.setLineDash([6, 4]);
            ctx.lineDashOffset = -((animTime * 0.3) % 10);
          } else {
            ctx.setLineDash([]);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = glowColor.replace('__A__', '0.04');
          ctx.shadowBlur = 0;
          ctx.fill();

          ctx.lineWidth = 1.0;
          ctx.strokeStyle = strokeColor.replace(')', ', 0.4)').replace('rgb', 'rgba');
          ctx.stroke();
        }
      };

      // Draw Forehead
      drawPoly(
        zonePolygons.forehead,
        isZoneTActive,
        'rgba(245, 158, 11, __A__)',
        '#FBBF24',
        selectedZone === 'ZONE_T'
      );

      // Draw Nose
      drawPoly(
        zonePolygons.nose,
        isZoneTActive,
        'rgba(245, 158, 11, __A__)',
        '#FBBF24',
        selectedZone === 'ZONE_T'
      );

      // -------------------------------------------------------------------------
      // E. 3D MALAR CHEEKS (Left and Right Zygomatic Curvature)
      // -------------------------------------------------------------------------
      drawPoly(
        zonePolygons.leftCheek,
        isCheeksActive,
        'rgba(16, 185, 129, __A__)',
        '#34D399',
        selectedZone === 'CHEEKS'
      );

      drawPoly(
        zonePolygons.rightCheek,
        isCheeksActive,
        'rgba(16, 185, 129, __A__)',
        '#34D399',
        selectedZone === 'CHEEKS'
      );

      // -------------------------------------------------------------------------
      // F. 3D PERIORBITAL / EYE CONTOUR (Under-Eye Orbital Rims - NO BOW-TIE!)
      // -------------------------------------------------------------------------
      const leftEyeZone = (zonePolygons as any).leftEyeContour || contours.leftEye;
      const rightEyeZone = (zonePolygons as any).rightEyeContour || contours.rightEye;

      if (leftEyeZone && leftEyeZone.length >= 3) {
        drawPoly(
          leftEyeZone,
          isEyesActive,
          'rgba(236, 72, 153, __A__)',
          '#F472B6',
          selectedZone === 'EYES'
        );
      }

      if (rightEyeZone && rightEyeZone.length >= 3) {
        drawPoly(
          rightEyeZone,
          isEyesActive,
          'rgba(236, 72, 153, __A__)',
          '#F472B6',
          selectedZone === 'EYES'
        );
      }

      // -------------------------------------------------------------------------
      // G. 3D BIOMETRIC NODES & HUD FLOATING BADGES (Anatomical Centroids)
      // -------------------------------------------------------------------------
      const drawNode = (nx: number, ny: number, color: string, label?: string) => {
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5 + Math.max(0, pulse * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(nx, ny, 7 + Math.max(0, pulse * 3), 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        if (label) {
          ctx.font = 'bold 9.5px ui-monospace, monospace';
          const tw = ctx.measureText(label).width;
          const bw = tw + 14;
          const bh = 18;
          let bx = nx - bw / 2;
          let by = ny - 24;

          bx = Math.max(6, Math.min(width - bw - 6, bx));
          by = Math.max(6, Math.min(height - bh - 6, by));

          ctx.fillStyle = 'rgba(8, 14, 10, 0.85)';
          ctx.beginPath();
          if ((ctx as any).roundRect) {
            (ctx as any).roundRect(bx, by, bw, bh, 9);
          } else {
            ctx.rect(bx, by, bw, bh);
          }
          ctx.fill();

          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowBlur = 0;
          ctx.fillText(label, bx + bw / 2, by + bh / 2);
        }
      };

      // Centroids for HUD anchors
      const foreheadCenter = getPolygonCenter(zonePolygons.forehead);
      const leftCheekCenter = getPolygonCenter(zonePolygons.leftCheek);
      const rightCheekCenter = getPolygonCenter(zonePolygons.rightCheek);
      const eyeCenter = getPolygonCenter(leftEyeZone);

      // Zona T Glabella Node
      if (isZoneTActive && foreheadCenter.x > 0) {
        drawNode(
          foreheadCenter.x,
          foreheadCenter.y,
          '#F59E0B',
          `☀️ Zona T • Sebo ${faceSkinResult.zoneTAnalysis?.shineLevel === 'HIGH' ? 'Alto' : 'Medio'}`
        );
      }

      // Left Cheek Malar Node
      if (isCheeksActive && leftCheekCenter.x > 0) {
        drawNode(
          leftCheekCenter.x,
          leftCheekCenter.y,
          '#10B981',
          '🌿 Mejilla Izq.'
        );
      }

      // Right Cheek Malar Node
      if (isCheeksActive && rightCheekCenter.x > 0) {
        drawNode(
          rightCheekCenter.x,
          rightCheekCenter.y,
          '#10B981',
          '🌿 Mejilla Der.'
        );
      }

      // Eyes Node (when isolated)
      if (selectedZone === 'EYES' && eyeCenter.x > 0) {
        drawNode(
          eyeCenter.x,
          eyeCenter.y,
          '#EC4899',
          `👁️ Ojeras ${faceSkinResult.periorbitalAnalysis?.darkCirclesType || 'Periocular'}`
        );
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(renderStatic3DMesh);
    };

    renderStatic3DMesh();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [viewMode, showOverlays, faceSkinResult, selectedZone, meshStyle, imageLandmarks]);

  return (
    <div className="card-white p-4 sm:p-5 rounded-[26px] border border-[#8FA89B]/50 shadow-diffuse-elevated space-y-4">
      {/* 1. Header with Mode Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10.5px] uppercase font-mono font-bold text-[#4A6B5B] tracking-wider">
              Mapeo Facial 3D • Biometría AR
            </span>
          </div>
          <h3 className="font-serif text-[18px] font-semibold text-[#2D2825] mt-0.5">
            {viewMode === 'live_camera'
              ? 'Máscara 3D AR en Tiempo Real'
              : 'Topología 3D de Zonas Dérmicas'}
          </h3>
        </div>

        {/* View Mode Pill Selector */}
        <div className="flex items-center p-1 rounded-full bg-[#F2ECE4] border border-[#E2D9CD] text-[11px] font-medium">
          <button
            onClick={() => setViewMode('3d_mesh')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
              viewMode === '3d_mesh'
                ? 'bg-white text-[#2D2825] shadow-xs font-semibold'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Malla 3D</span>
          </button>

          <button
            onClick={() => setViewMode('live_camera')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'live_camera'
                ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xs font-semibold ring-1 ring-emerald-400/40'
                : 'text-[#1E3A2B] hover:text-emerald-900 font-semibold'
            }`}
          >
            <Camera className="w-3 h-3" />
            <span>3D en Vivo</span>
          </button>

          <button
            onClick={() => setViewMode('clean_photo')}
            className={`px-3 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1 ${
              viewMode === 'clean_photo'
                ? 'bg-white text-[#2D2825] shadow-xs font-semibold'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Foto Pura</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3D Visor Viewport */}
      <div
        className="relative w-full rounded-[22px] overflow-hidden bg-[#151D18] border-2 border-[#8FA89B] shadow-inner select-none transition-all duration-300 mx-auto"
        style={{
          aspectRatio: `${activeDimensions.width} / ${activeDimensions.height}`,
          maxHeight: '68vh',
        }}
      >
        {/* A: STATIC PHOTO MODE (Underlay Image + 3D Mesh Canvas) */}
        {viewMode !== 'live_camera' && (
          <>
            {capturedImagePreview ? (
              <img
                src={capturedImagePreview}
                alt="Selfie con malla 3D anatómica"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  if (target.naturalWidth > 0 && target.naturalHeight > 0) {
                    setNaturalDimensions({ width: target.naturalWidth, height: target.naturalHeight });
                  }
                }}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#8FA89B]/50">
                <span>Fotografía no disponible</span>
              </div>
            )}

            {/* Canvas overlay for Static 3D Anatomical Mesh */}
            {viewMode === '3d_mesh' && showOverlays && (
              <canvas
                ref={staticCanvasRef}
                width={activeDimensions.width}
                height={activeDimensions.height}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              />
            )}

            {/* Loading indicator while MediaPipe neural model is fitting landmarks to photo */}
            {isDetectingLandmarks && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-25 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Alineando malla 3D al rostro...</span>
              </div>
            )}
          </>
        )}

        {/* B: LIVE CAMERA 3D AR MASK MODE (MediaPipe FaceLandmarker 60 FPS) */}
        {viewMode === 'live_camera' && (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={liveVideoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover -scale-x-100"
            />
            <canvas
              ref={liveCanvasRef}
              width={640}
              height={480}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
            />

            {!isLiveCameraActive && !liveCameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151D18]/90 text-white space-y-2 z-20">
                <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
                <span className="text-[12px] font-sans">Iniciando sensor 3D MediaPipe...</span>
              </div>
            )}

            {liveCameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#151D18]/95 p-6 text-center text-white space-y-3 z-20">
                <VideoOff className="w-8 h-8 text-rose-400" />
                <p className="text-[12.5px] text-white/90">{liveCameraError}</p>
                <button
                  onClick={() => setViewMode('3d_mesh')}
                  className="px-4 py-2 rounded-full bg-emerald-600 text-white text-[12px] font-semibold"
                >
                  Regresar a Malla 3D en Foto
                </button>
              </div>
            )}
          </div>
        )}

        {/* HUD Sci-Fi Calibration Reticle Corners */}
        <div className="absolute inset-3 pointer-events-none z-20">
          <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-emerald-400/80 rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-emerald-400/80 rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-emerald-400/80 rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-emerald-400/80 rounded-br-lg" />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-20 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-400/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>Farkas BSTI 3D</span>
        </div>

        <div className="absolute top-3 right-3 z-20 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[10px] font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{Math.round(faceSkinResult.confidence * 100)}% Certeza</span>
        </div>

        {/* Live Bottom Badge indicating diagnosed Biotype */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-300/60 shadow-xl text-white flex items-center gap-2 max-w-[92%]">
          <span className="text-[11px] font-bold text-emerald-300 font-sans truncate">
            {faceSkinResult.skinTypeLabel.split('(')[0].trim()}
          </span>
          <span className="text-[9.5px] font-mono text-emerald-200/90 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {faceSkinResult.baumannSkinTypeCode}
          </span>
        </div>
      </div>

      {/* 3. 3D Mask Style Controls (Láser Clínico vs Cyber-Mesh vs Spa) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E8E1D7]">
        <span className="text-[11px] font-sans font-semibold text-[#7E756F]">Estilo 3D:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMeshStyle('clinical_laser')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
              meshStyle === 'clinical_laser'
                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                : 'bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            Láser Clínico
          </button>
          <button
            onClick={() => setMeshStyle('cyber_mesh')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
              meshStyle === 'cyber_mesh'
                ? 'bg-sky-800 text-white font-semibold shadow-xs'
                : 'bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            Cyber-Mesh
          </button>
          <button
            onClick={() => setMeshStyle('spa_mask')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
              meshStyle === 'spa_mask'
                ? 'bg-[#4A6B5B] text-white font-semibold shadow-xs'
                : 'bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            Textura Spa
          </button>
        </div>
      </div>

      {/* 4. Interactive Zone Highlighting Filter Buttons */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-sans text-[#7E756F]">
          <span className="font-semibold">Iluminar Zona en Malla 3D:</span>
          <span>Toca para aislar</span>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F2ECE4] border border-[#E2D9CD]">
          <button
            onClick={() => setSelectedZone('ALL')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition cursor-pointer text-center ${
              selectedZone === 'ALL'
                ? 'bg-[#4A6B5B] text-white font-semibold shadow-xs'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            Todas
          </button>

          <button
            onClick={() => setSelectedZone('ZONE_T')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
              selectedZone === 'ZONE_T'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-300" />
            <span>Zona T</span>
          </button>

          <button
            onClick={() => setSelectedZone('CHEEKS')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
              selectedZone === 'CHEEKS'
                ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            <Moon className="w-3 h-3 text-emerald-300" />
            <span>Mejillas</span>
          </button>

          <button
            onClick={() => setSelectedZone('EYES')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
              selectedZone === 'EYES'
                ? 'bg-pink-700 text-white font-semibold shadow-xs'
                : 'text-[#7E756F] hover:text-[#2D2825]'
            }`}
          >
            <Eye className="w-3 h-3 text-pink-300" />
            <span>Ojeras</span>
          </button>
        </div>
      </div>

      {/* 5. Direct Launch to Fullscreen AR Guided Experience */}
      {onOpenFullArTutorial && (
        <button
          onClick={onOpenFullArTutorial}
          className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 hover:from-emerald-700 hover:to-teal-800 text-white text-[12.5px] font-sans font-bold shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center justify-center gap-2 cursor-pointer ring-2 ring-emerald-500/30 group"
        >
          <Sparkles className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform" />
          <span>Abrir Máscara 3D en Pantalla Completa & Rutina Guiada</span>
          <ChevronRight className="w-4 h-4 text-emerald-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
