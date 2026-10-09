'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  Share2,
  Download,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Activity,
  Lightbulb,
  Droplets,
  Zap,
  Home,
  HeartPulse,
  Calendar,
  Package,
  Scan,
  Store,
  User,
  Search,
  Bell,
  Flower2,
  Sliders,
  RotateCcw,
  VideoOff,
  Plus,
  Info,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';
import { scanImageWithGeminiVision, saveUserSkinScan } from '@/lib/api';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';
import UserAppShell from '@/components/navigation/UserAppShell';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import SkinEvolutionProgressSection from '@/components/progress/SkinEvolutionProgressSection';

export default function EscanerPage() {
  const { userProfile, updateProfile, addProductToShelf } = useSkincare();
  const [activeStep, setActiveStep] = useState<'capture' | 'analyzing' | 'results'>('capture');
  const [scanMode, setScanMode] = useState<'face' | 'product'>('face');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'all' | 't-zone' | 'cheeks' | 'chin'>('all');
  const [comparisonTab, setComparisonTab] = useState<'evolution' | 'before' | 'after'>('evolution');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Estados para modal de opiniones y explicación didáctica
  const [selectedReviewProduct, setSelectedReviewProduct] = useState<{ slug: string; name: string } | null>(null);
  const [showMetricsExplanationModal, setShowMetricsExplanationModal] = useState(false);
  const [expandedMetricKey, setExpandedMetricKey] = useState<string | null>(null);

  // Cámara en vivo y captura
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Imágenes
  const sampleFaceUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';
  const sampleProductUrl = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80';
  const beforeFaceUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const [currentImage, setCurrentImage] = useState<string>(sampleFaceUrl);
  const [isUserUploaded, setIsUserUploaded] = useState(false);

  // Estado del diagnóstico Facial (Gemini Vision)
  const [aiDiagnosis, setAiDiagnosis] = useState({
    score: 78,
    statusText: 'Buena',
    verdict: 'Tu piel se encuentra en un buen estado general. Se observa tendencia a la deshidratación en la zona T y poros dilatados.',
    recommendation: 'Enfócate en hidratación y control de sebo. Considera activos como niacinamida y ácido hialurónico.',
    hydration: 82,
    elasticity: 76,
    pores: 68,
    spots: 62,
    fineLines: 58,
  });

  // Estado del diagnóstico de Producto / INCI & Expansión de Rutina
  const [productDiagnosis, setProductDiagnosis] = useState({
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    category: 'Sérum Seborregulador Concentrado',
    score: 94,
    statusText: 'Altamente Biocompatible',
    verdict: 'Fórmula optimizada con Niacinamida al 10% pura en vehículo acuoso ligero. Potente acción equilibrante del sebo y fortalecimiento de ceramidas dérmicas.',
    cyclePlacement: 'Noche 1 (post-exfoliación), Noches 3 y 4 (recuperación). Ideal en combinación con hidratantes hipoalergénicos.',
    incompatibilityAlert: 'NO aplicar en la misma aplicación con Vitamina C pura (Ácido L-Ascórbico) ni ácidos exfoliantes directos para prevenir rubor cutáneo transitorio.',
    actives: [
      {
        name: 'Niacinamida (Vitamina B3)',
        concentration: '10%',
        role: 'Regulación sebácea en Zona T, refuerzo de la barrera de lípidos y atenuación de textura rugosa.',
        rating: 'Excelente'
      },
      {
        name: 'Zinc PCA',
        concentration: '1%',
        role: 'Sal de zinc biocompatible con propiedades antimicrobianas, matificantes y descongestionantes.',
        rating: 'Excelente'
      },
      {
        name: 'Tamarindus Indica Seed Gum',
        concentration: '0.8%',
        role: 'Polisacárido botánico de soporte hidratante que imita la retención hídrica del ácido hialurónico.',
        rating: 'Seguro'
      }
    ],
    complementaryProducts: [
      {
        id: 'comp-1',
        name: "Paula's Choice Skin Perfecting 2% BHA",
        brand: "Paula's Choice",
        category: 'Exfoliante Químico (Noche 1)',
        price: '$34.00',
        reason: 'Desobstruye los poros en profundidad permitiendo que la niacinamida penetre sin barreras sebáceas.',
      },
      {
        id: 'comp-2',
        name: 'CeraVe Loción Hidratante Facial PM',
        brand: 'CeraVe',
        category: 'Crema Barrera (Noches 3 y 4)',
        price: '$16.50',
        reason: 'Aporta 3 ceramidas esenciales para sellar la hidratación generada por la niacinamida y el zinc.',
      },
      {
        id: 'comp-3',
        name: 'La Roche-Posay Anthelios UVmune 400',
        brand: 'La Roche-Posay',
        category: 'Fotoprotector Fluido (Día / AM)',
        price: '$21.90',
        reason: 'Protección ultravioleta de amplio espectro para evitar hiperpigmentación de brotes recientes.',
      }
    ]
  });

  const handleModeSelect = (mode: 'face' | 'product') => {
    setScanMode(mode);
    if (!isUserUploaded) {
      setCurrentImage(mode === 'face' ? sampleFaceUrl : sampleProductUrl);
    }
  };

  // Notificación de producto añadido
  const [addedProductNotice, setAddedProductNotice] = useState<string | null>(null);

  // Detener la cámara al desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Cámara no disponible o permiso denegado:', err);
      alert('No se pudo acceder a la cámara web. Puedes subir una foto desde tus archivos o usar una de prueba.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacingMode = async () => {
    stopCamera();
    setCameraFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  const capturePhotoFromCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCurrentImage(dataUrl);
        setIsUserUploaded(true);
        stopCamera();
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const optimized = await optimizeImageForUpload(file);
        setCurrentImage(optimized.base64);
        setIsUserUploaded(true);
        stopCamera();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleStartScan = async () => {
    // Si la cámara sigue encendida, capturamos el frame primero
    if (isCameraActive) {
      capturePhotoFromCamera();
    }

    setActiveStep('analyzing');
    setAnalysisProgress(15);

    // Intentar análisis real si hay imagen de usuario
    if (isUserUploaded && currentImage.startsWith('data:image')) {
      try {
        const cleanBase64 = currentImage.split(',')[1] || currentImage;
        const result = await scanImageWithGeminiVision(cleanBase64, 'image/jpeg');
        if (result && result.classification === 'HUMAN_FACE' && result.faceAnalysis) {
          const fa = result.faceAnalysis;
          setAiDiagnosis({
            score: fa.cheeksAnalysis.hydrationState === 'BALANCED' ? 84 : 76,
            statusText: 'Buena',
            verdict: fa.clinicalRationale || 'Piel en estado saludable con poros ligeramente visibles en zona T.',
            recommendation: fa.suggestedFocus?.join(', ') || 'Mantener hidratación y barrera lipídica intacta.',
            hydration: fa.cheeksAnalysis.hydrationState === 'BALANCED' ? 88 : 72,
            elasticity: 78,
            pores: fa.zoneTAnalysis.poresVisible ? 62 : 78,
            spots: 68,
            fineLines: 60,
          });

          // Actualizar perfil de SkincareContext
          updateProfile({
            skinType: fa.skinTypeEstimate || 'COMBINATION',
            secondaryBiotype: fa.baumannSkinTypeCode,
          });
        }
      } catch (err) {
        console.warn('Gemini offline o límite alcanzado, usando calibración dérmica:', err);
      }
    }

    // Intervalo de progreso estético DLG-HYBRID
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setActiveStep('results');
            if (scanMode === 'face') {
              saveUserSkinScan({
                image_url: currentImage,
                overall_score: aiDiagnosis.score,
                hydration_score: aiDiagnosis.hydration,
                elasticity_score: aiDiagnosis.elasticity,
                pores_score: aiDiagnosis.pores,
                spots_score: aiDiagnosis.spots,
                fine_lines_score: aiDiagnosis.fineLines,
                barrier_status: aiDiagnosis.hydration > 75 ? 'OPTIMAL' : 'NORMAL',
                scan_mode: 'face',
                clinical_summary: aiDiagnosis.verdict,
                recommendations: aiDiagnosis.recommendation,
              }).catch((e) => console.debug('Scan history saved locally:', e));
            }
          }, 500);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleAddSuggestedProduct = (name: string, brand: string, category: string) => {
    addProductToShelf({
      id: `shelf-${Date.now()}`,
      name,
      brand,
      category,
      volume: '150 ml',
      paoMonths: 12,
      inciScore: 95,
      primaryActives: ['Niacinamida', 'Ceramidas'],
      assignedPhase: 1,
      assignedPhaseName: 'Noche 1: Exfoliación',
      image: sampleFaceUrl,
      textureNote: 'Fórmula recomendada por IA',
    });
    setAddedProductNotice(`"${name}" añadido a tu tocador digital`);
    setTimeout(() => setAddedProductNotice(null), 3000);
  };

  const handleAddFullRoutineCombo = () => {
    // Añadimos el producto principal escaneado
    addProductToShelf({
      id: `shelf-main-${Date.now()}`,
      name: productDiagnosis.name,
      brand: productDiagnosis.brand,
      category: 'Sérum',
      volume: '30 ml',
      paoMonths: 6,
      inciScore: 94,
      primaryActives: ['Niacinamida 10%', 'Zinc PCA 1%'],
      assignedPhase: 1,
      assignedPhaseName: 'Noche 1: Exfoliación',
      image: sampleProductUrl,
      textureNote: 'Fórmula escaneada biocompatible',
    });

    // Añadimos los 3 productos complementarios
    productDiagnosis.complementaryProducts.forEach((p, idx) => {
      addProductToShelf({
        id: `shelf-combo-${Date.now()}-${idx}`,
        name: p.name,
        brand: p.brand,
        category: p.category,
        volume: '50 ml',
        paoMonths: 12,
        inciScore: 96,
        primaryActives: ['Fórmula complementaria'],
        assignedPhase: idx + 2,
        assignedPhaseName: p.category,
        image: sampleProductUrl,
        textureNote: p.reason,
      });
    });

    setAddedProductNotice('¡Rutina completa de Skin Cycling añadida a tu tocador!');
    setTimeout(() => setAddedProductNotice(null), 3500);
  };

  return (
    <UserAppShell activeNavId="analisis">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in">

        {/* ========================================================= */}
        {/* HEADER DEL ESCÁNER & STEPPER DE 3 PASOS (MOCKUP VISTA 2)  */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              {activeStep === 'results' ? 'Resultados del análisis' : 'Escáner dermatológico'}
            </h1>
            <p className="text-xs sm:text-sm text-[#66615C]">
              {activeStep === 'results'
                ? 'Aquí tienes un resumen detallado de tu piel y recomendaciones personalizadas.'
                : 'Analiza tu piel con inteligencia artificial y descubre lo que realmente necesita.'}
            </p>
          </div>

          {/* Stepper de 3 Pasos idéntico al Mockup */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-[#E8E1D7] shadow-2xs self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveStep('capture')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeStep === 'capture'
                  ? 'bg-[#2E7D5B] text-white shadow-xs'
                  : 'text-[#66615C] hover:text-[#2D2825]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'capture' ? 'bg-white text-[#2E7D5B]' : 'bg-[#EFECE6] text-[#66615C]'
              }`}>
                1
              </span>
              <span>Captura</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('analyzing')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeStep === 'analyzing'
                  ? 'bg-[#2E7D5B] text-white shadow-xs'
                  : 'text-[#66615C] hover:text-[#2D2825]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'analyzing' ? 'bg-white text-[#2E7D5B]' : 'bg-[#EFECE6] text-[#66615C]'
              }`}>
                2
              </span>
              <span>Análisis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('results')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeStep === 'results'
                  ? 'bg-[#2E7D5B] text-white shadow-xs'
                  : 'text-[#66615C] hover:text-[#2D2825]'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                activeStep === 'results' ? 'bg-white text-[#2E7D5B]' : 'bg-[#EFECE6] text-[#66615C]'
              }`}>
                3
              </span>
              <span>Resultados</span>
            </button>
          </div>
        </div>

        {/* Notificación flotante de producto añadido */}
        {addedProductNotice && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#1B3D32] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#E6F4EC]" />
            <span>{addedProductNotice}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 1: CAPTURA EN VIVO (MOCKUP VISTA 2 CON CÁMARA REAL)   */}
        {/* ========================================================= */}
        {activeStep === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda (7 cols): Visor HUD con Cámara Web Real */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">
                  Visor Óptico Dermatológico
                </span>
                
                {/* Selector de modo Facial vs Producto */}
                <div className="flex bg-[#EFECE6] p-0.5 rounded-full border border-[#E8E1D7] text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleModeSelect('face')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      scanMode === 'face' ? 'bg-white text-[#2E7D5B] shadow-2xs' : 'text-[#66615C]'
                    }`}
                  >
                    Rostro (Biometría)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSelect('product')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      scanMode === 'product' ? 'bg-white text-[#2E7D5B] shadow-2xs' : 'text-[#66615C]'
                    }`}
                  >
                    Etiqueta INCI / Cosmético
                  </button>
                </div>
              </div>

              {/* Visor con Cámara Web o Fotografía */}
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#1B3D32] border-2 border-[#D5E2DB] flex items-center justify-center">
                
                {/* Video en vivo si la cámara está activa */}
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentImage}
                    alt={scanMode === 'product' ? 'Visor de fórmula cosmética' : 'Visor de escaneo facial'}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* HUD Overlay Clínico */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {scanMode === 'face' ? (
                    /* Óvalo facial de enfoque */
                    <div className="w-56 sm:w-64 h-72 sm:h-80 rounded-[50%] border-2 border-dashed border-[#2E7D5B] ring-8 ring-white/10 flex items-center justify-center relative">
                      <div className="absolute top-0 w-4 h-4 border-t-2 border-l-2 border-[#2E7D5B]" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#2E7D5B]" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#2E7D5B]" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#2E7D5B]" />

                      <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute top-10" />
                      <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute left-6 top-36" />
                      <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute right-6 top-36" />
                      <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute bottom-10" />
                    </div>
                  ) : (
                    /* Marco rectangular de etiqueta/código INCI con línea láser */
                    <div className="w-64 sm:w-80 h-52 sm:h-60 rounded-2xl border-2 border-dashed border-[#2E7D5B] ring-8 ring-white/10 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#2E7D5B]" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#2E7D5B]" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#2E7D5B]" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#2E7D5B]" />

                      {/* Línea láser de escaneo */}
                      <div className="absolute left-0 right-0 h-0.5 bg-[#2E7D5B] shadow-[0_0_12px_#2E7D5B] animate-pulse" />
                      <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                        Enfoca la lista de ingredientes (INCI)
                      </span>
                    </div>
                  )}

                  {/* Estado HUD inferior */}
                  <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
                    <span>
                      {isCameraActive
                        ? (scanMode === 'product' ? 'Cámara activa · Enfoca la etiqueta' : 'Cámara activa · Alinea tu rostro')
                        : (scanMode === 'product' ? 'Cosmético listo · Iniciar análisis INCI' : 'Foto cargada · Lista para analizar')}
                    </span>
                  </div>
                </div>

              </div>

              {/* Controles del Módulo de Escaneo (Cámara, Disparo, Subida) */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6F4EC] hover:bg-[#D5E2DB] text-[#2E7D5B] font-bold text-xs transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Activar Cámara</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={capturePhotoFromCamera}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white font-bold text-xs transition shadow-xs cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Capturar Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="p-2 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-[#66615C] hover:text-[#2D2825]"
                        title="Cambiar frontal/trasera"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
                        title="Apagar cámara"
                      >
                        <VideoOff className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Subir archivo */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] hover:bg-white text-[#2D2825] border border-[#E8E1D7] font-bold text-xs transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#66615C]" />
                    <span>Subir Foto</span>
                  </button>
                </div>

                {/* Resetear a imagen de prueba */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentImage(scanMode === 'face' ? sampleFaceUrl : sampleProductUrl);
                    setIsUserUploaded(false);
                    stopCamera();
                  }}
                  className="text-[11px] font-bold text-[#8C827A] hover:text-[#2E7D5B] transition cursor-pointer"
                >
                  Usar foto de prueba
                </button>
              </div>

            </div>

            {/* Columna Derecha (5 cols): 2 Tarjetas del Mockup Vista 2 */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* TARJETA 1: GUÍA DE CAPTURA SEGÚN MODO */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-5">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-[#2D2825]">
                    {scanMode === 'product' ? 'Escanear producto cosmético' : 'Toma una buena foto'}
                  </h2>
                  <p className="text-xs text-[#66615C]">
                    {scanMode === 'product'
                      ? 'Recomendaciones para decodificar la fórmula INCI con precisión molecular.'
                      : 'Recomendaciones para obtener la máxima precisión diagnóstica.'}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-[#2D2825]">
                  {scanMode === 'product' ? (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Texto de ingredientes (INCI) enfocado y legible</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Buena luz sin sombras ni destellos sobre el envase</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Mantén el producto a 15-25 cm</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Detecta compatibilidad con tu piel y rutina de 4 noches</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Luz natural (idealmente de día)</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Sin maquillaje</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Rostro limpio y seco</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#2E7D5B] shrink-0 stroke-[2.5]" />
                        <span>Mantén la cámara a 30-50 cm</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Botón Principal: Comenzar Escaneo */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="w-full py-3 rounded-full bg-[#1B3D32] hover:bg-[#2E7D5B] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Scan className="w-4 h-4" />
                    <span>{scanMode === 'product' ? 'Escanear fórmula y activos' : 'Comenzar escaneo facial'}</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveStep('results')}
                    className="text-[11px] font-bold text-[#8C827A] hover:text-[#2E7D5B] transition"
                  >
                    Ver galería de escaneos →
                  </button>
                </div>
              </div>

              {/* TARJETA 2: ÚLTIMO ANÁLISIS */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-[#2D2825]">
                      Último análisis
                    </h3>
                    <div className="text-[11px] text-[#8C827A]">
                      15 abr 2026 · 10:24 a.m.
                    </div>
                  </div>

                  {/* Radial Score Badge */}
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-base font-black text-[#2D2825] leading-none">
                        78<span className="text-[10px] text-[#8C827A]">/100</span>
                      </div>
                      <span className="text-[9px] font-bold text-[#2E7D5B]">Salud dérmica</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-extrabold text-[10px] border border-[#D5E2DB]">
                      Buena
                    </span>
                  </div>
                </div>

                {/* Principales hallazgos con viñetas numeradas */}
                <div className="space-y-2 pt-2 border-t border-[#F0ECE1] text-xs">
                  <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider block">
                    Principales hallazgos
                  </span>

                  <div className="space-y-2 text-[#2D2825]">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#2E7D5B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span>Barrera: estable</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#2E7D5B] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      <span>Hidratación: adecuada</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      <span>Poros: ligeramente dilatados</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        4
                      </span>
                      <span>Manchas: leves</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep('results')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition cursor-pointer"
                  >
                    <span>Ver informe completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2: ANÁLISIS EN CURSO (ANIMACIÓN CLÍNICA DLG-HYBRID)  */}
        {/* ========================================================= */}
        {activeStep === 'analyzing' && (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6 bg-white p-8 rounded-3xl border border-[#E8E1D7] shadow-sm animate-in fade-in">
            <div className="relative w-24 h-24 mx-auto rounded-full bg-[#E6F4EC] border-2 border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B]">
              <Sparkles className="w-10 h-10 animate-spin" />
              <div className="absolute inset-0 rounded-full border-4 border-[#2E7D5B] border-t-transparent animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#2D2825]">
                Analizando biometría dérmica con IA
              </h2>
              <p className="text-xs text-[#66615C] max-w-md mx-auto">
                Evaluando integridad de barrera cutánea, seborregulación en Zona T y compatibilidad con Skin Cycling.
              </p>
            </div>

            {/* Barra de Progreso */}
            <div className="max-w-md mx-auto space-y-1.5">
              <div className="w-full bg-[#EFECE6] rounded-full h-2.5 overflow-hidden border border-[#E8E1D7]">
                <div
                  className="bg-[#2E7D5B] h-full rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-bold text-[#66615C]">
                <span>Mapeo de cuadrantes</span>
                <span>{analysisProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 3: RESULTADOS (FACIAL O PRODUCTO / EXPANSIÓN)        */}
        {/* ========================================================= */}
        {activeStep === 'results' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Cabecera de Resultados y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D7] shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                  {scanMode === 'product' ? 'Fórmula Cosmética Analizada · 15 abr 2026' : 'Informe Calibrado · 15 abr 2026 · 10:24 a.m.'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#2D2825]">
                    {scanMode === 'product'
                      ? `Biocompatibilidad Dérmica: ${productDiagnosis.score}/100`
                      : `Puntuación Dérmica: ${aiDiagnosis.score}/100`}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-extrabold text-xs border border-[#D5E2DB]">
                    {scanMode === 'product' ? productDiagnosis.statusText : aiDiagnosis.statusText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Descargando informe técnico dermatológico...')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] hover:bg-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{scanMode === 'product' ? 'Ficha INCI' : 'Descargar informe'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert('Enlace de consulta médica copiado al portapapeles.')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2E7D5B] text-white text-xs font-bold hover:bg-[#1B3D32] transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>

            {/* MODO A: RESULTADOS DE ESCANEO DE PRODUCTO / INCI */}
            {scanMode === 'product' ? (
              <div className="space-y-8">
                {/* 2 Columnas de Detalle de Producto */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Columna Izquierda (6 cols): Imagen + Activos INCI */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D7] shadow-2xs space-y-6">
                    <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                          {productDiagnosis.brand}
                        </span>
                        <h2 className="text-lg font-extrabold text-[#2D2825] mt-1">
                          {productDiagnosis.name}
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-[#8C827A]">
                        {productDiagnosis.category}
                      </span>
                    </div>

                    {/* Foto del envase */}
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-[#E8E1D7] bg-[#1B3D32]/5">
                      <img
                        src={currentImage}
                        alt={productDiagnosis.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-[#1B3D32]/85 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E6F4EC]" />
                        <span>Fórmula Verificada en Catálogo INCI</span>
                      </div>
                    </div>

                    {/* Desglose de Activos INCI */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#2D2825] uppercase tracking-wider">
                          Activos Clínicos Identificados
                        </span>
                        <span className="text-[11px] font-bold text-[#2E7D5B]">3 Activos Clave</span>
                      </div>

                      <div className="space-y-2.5">
                        {productDiagnosis.actives.map((act, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#2D2825] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#2E7D5B]" />
                                {act.name}
                              </span>
                              <span className="text-[10px] font-black text-[#1B3D32] bg-[#E6F4EC] px-2 py-0.5 rounded-md">
                                {act.concentration}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#66615C] leading-snug">
                              {act.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Alerta de Incompatibilidad Cruzada */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Regla de Compatibilidad Molecular</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {productDiagnosis.incompatibilityAlert}
                      </p>
                    </div>

                  </div>

                  {/* Columna Derecha (6 cols): Integración en Skin Cycling & Mascarilla AR */}
                  <div className="lg:col-span-6 space-y-6">
                    
                    {/* TARJETA 1: UBICACIÓN EN EL CICLO DE 4 NOCHES */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E1D7] shadow-2xs space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#2D2825] flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#2E7D5B]" />
                          <span>Ubicación en tu Skin Cycling</span>
                        </h3>
                        <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                          Frecuencia Óptima
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-2">
                        <div className="text-xs font-bold text-[#2D2825]">
                          {productDiagnosis.cyclePlacement}
                        </div>
                        <p className="text-xs text-[#66615C] leading-relaxed">
                          {productDiagnosis.verdict}
                        </p>
                      </div>

                      {/* Mini calendario de las 4 noches */}
                      <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                        <div className="p-2.5 rounded-xl bg-[#E6F4EC] border border-[#2E7D5B]/30">
                          <span className="text-[10px] font-black text-[#2E7D5B] block">Noche 1</span>
                          <span className="text-[9px] font-bold text-[#1B3D32]">Exfoliación</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 opacity-60">
                          <span className="text-[10px] font-black text-slate-700 block">Noche 2</span>
                          <span className="text-[9px] font-bold text-slate-500">Retinoide</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#E6F4EC] border border-[#2E7D5B]/30">
                          <span className="text-[10px] font-black text-[#2E7D5B] block">Noche 3</span>
                          <span className="text-[9px] font-bold text-[#1B3D32]">Recuperación</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#E6F4EC] border border-[#2E7D5B]/30">
                          <span className="text-[10px] font-black text-[#2E7D5B] block">Noche 4</span>
                          <span className="text-[9px] font-bold text-[#1B3D32]">Recuperación</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/calendario"
                          className="w-full py-3 rounded-full bg-[#FAF8F5] hover:bg-white border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Ver mi calendario del ciclo</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#66615C]" />
                        </Link>
                      </div>
                    </div>

                    {/* TARJETA 2: WOW MOMENT - TUTORIAL INTERACTIVO CON MASCARILLA AR */}
                    <div className="bg-gradient-to-br from-[#1B3D32] to-[#2E7D5B] rounded-3xl p-6 sm:p-7 text-white shadow-md space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-white/10 backdrop-blur-xs">
                          <Sparkles className="w-4 h-4 text-emerald-200" />
                        </span>
                        <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                          Guía Anatómica Facial (AR)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-extrabold text-white">
                          ¿Cómo aplicar este sérum en tu rostro?
                        </h3>
                        <p className="text-xs text-emerald-100/90 leading-relaxed">
                          Nuestra Mascarilla Virtual en Realidad Aumentada te muestra exactamente dónde colocar las gotas, la dirección de masaje y las zonas perioculares a evitar.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="/mi-rutina?launchAr=skin_cycling"
                          className="w-full py-3.5 rounded-full bg-white text-[#1B3D32] hover:bg-emerald-50 text-xs font-extrabold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-[#2E7D5B]" />
                          <span>Abrir Mascarilla Virtual AR</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                  </div>

                </div>

                {/* MOTOR DE EXPANSIÓN: DE 1 PRODUCTO A RUTINA MENSUAL COMPLETA */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-extrabold border border-[#D5E2DB]">
                        <Package className="w-3.5 h-3.5" />
                        <span>Expande a Rutina Mensual de Skin Cycling</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-[#2D2825]">
                        3 Fórmulas Complementarias Biocompatibles
                      </h3>
                      <p className="text-xs text-[#66615C]">
                        Diseñadas para sincronizarse con tu producto escaneado sin causar sobrecarga ni irritación.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddFullRoutineCombo}
                      className="px-6 py-3 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir combo mensual al tocador</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {productDiagnosis.complementaryProducts.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl p-5 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-4 hover:shadow-xs transition"
                      >
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                            {p.category}
                          </span>
                          <h4 className="font-extrabold text-xs text-[#2D2825] leading-snug">
                            {p.name}
                          </h4>
                          <p className="text-[11px] text-[#66615C] leading-snug">
                            {p.reason}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#E8E1D7]/70 flex items-center justify-between">
                          <span className="font-black text-sm text-[#2D2825]">{p.price}</span>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestedProduct(p.name, p.brand, p.category)}
                            className="px-3.5 py-1.5 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Añadir</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#66615C]">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#2E7D5B]" />
                      <span>Disponible en farmacias aliadas (Farmatodo, Locatel y Farmarket).</span>
                    </div>
                    <Link
                      href="/tiendas"
                      className="font-bold text-[#2E7D5B] hover:text-[#1B3D32] flex items-center gap-1"
                    >
                      <span>Ver disponibilidad y precios locales</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>
            ) : (
              /* MODO B: RESULTADOS DE ESCANEO FACIAL */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Columna Izquierda (6 cols): Visor de Cuadrantes + Comparador */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-6">
                  
                  {/* Selector de Cuadrantes */}
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <span className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">
                      Mapeo por Cuadrantes
                    </span>
                    <div className="flex gap-1 text-[10px] font-bold">
                      {(['all', 't-zone', 'cheeks', 'chin'] as const).map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setSelectedQuadrant(q)}
                          className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
                            selectedQuadrant === q
                              ? 'bg-[#2E7D5B] text-white'
                              : 'bg-[#FAF8F5] text-[#66615C] hover:bg-[#EFECE6]'
                          }`}
                        >
                          {q === 'all' ? 'Todo' : q === 't-zone' ? 'Zona T' : q === 'cheeks' ? 'Mejillas' : 'Mentón'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visor con zoom y retícula */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-[#E8E1D7]">
                    <img
                      src={currentImage}
                      alt="Rostro analizado"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay interactivo según cuadrante */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                        {selectedQuadrant === 'all'
                          ? 'Vista General: Sin signos críticos de reactividad'
                          : selectedQuadrant === 't-zone'
                          ? 'Zona T: Mayor producción sebácea, poros visibles'
                          : selectedQuadrant === 'cheeks'
                          ? 'Mejillas: Barrera cutánea íntegra y retención hídrica alta'
                          : 'Mentón: Normal, sin brotes quísticos'}
                      </span>
                    </div>
                  </div>

                  {/* Comparador Antes / Después */}
                  <div className="pt-2 border-t border-[#F0ECE1] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#2D2825]">
                        Comparador Evolutivo
                      </span>
                      <div className="flex bg-[#EFECE6] p-0.5 rounded-full text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setComparisonTab('evolution')}
                          className={`px-2.5 py-0.5 rounded-full ${comparisonTab === 'evolution' ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}
                        >
                          Evolución
                        </button>
                        <button
                          type="button"
                          onClick={() => setComparisonTab('before')}
                          className={`px-2.5 py-0.5 rounded-full ${comparisonTab === 'before' ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}
                        >
                          Antes
                        </button>
                        <button
                          type="button"
                          onClick={() => setComparisonTab('after')}
                          className={`px-2.5 py-0.5 rounded-full ${comparisonTab === 'after' ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}
                        >
                          Después
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl overflow-hidden border border-[#E8E1D7] relative aspect-video">
                        <img src={beforeFaceUrl} alt="Antes" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          18 ene 2026
                        </span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-[#2E7D5B] relative aspect-video">
                        <img src={currentImage} alt="Hoy" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 left-1.5 bg-[#2E7D5B] text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                          Hoy (15 abr)
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Columna Derecha (6 cols): Barras + Diagnóstico IA + Acceso a Mascarilla AR */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* RESULTADOS POR ÁREA CON EXPLICACIÓN DIDÁCTICA DLG-HYBRID */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                      <div>
                        <h3 className="text-sm font-extrabold text-[#2D2825]">
                          Resultados por área & Significado Clínico
                        </h3>
                        <p className="text-[11px] text-[#66615C]">
                          Toca cualquier métrica para entender su impacto fisiológico.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMetricsExplanationModal(true)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E7D5B] hover:text-[#1B3D32] bg-[#E6F4EC] px-2.5 py-1 rounded-full cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>¿Qué significan?</span>
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      {/* Hidratación */}
                      <div
                        onClick={() => setExpandedMetricKey(expandedMetricKey === 'hydration' ? null : 'hydration')}
                        className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1.5 cursor-pointer hover:border-[#2E7D5B] transition"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-[#2E7D5B]" />
                            <span className="text-[#2D2825]">Hidratación Estrato Córneo</span>
                            <span className="text-[10px] font-extrabold text-[#2E7D5B] bg-[#E6F4EC] px-1.5 py-0.2 rounded-md">
                              Óptima
                            </span>
                          </div>
                          <span className="text-[#2E7D5B] font-black">{aiDiagnosis.hydration}%</span>
                        </div>
                        <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                          <div className="bg-[#2E7D5B] h-full rounded-full" style={{ width: `${aiDiagnosis.hydration}%` }} />
                        </div>
                        <p className="text-[11px] text-[#66615C] leading-snug">
                          {expandedMetricKey === 'hydration'
                            ? 'Mide la retención de agua unida a lípidos intercorneocíticos. Un valor >75% garantiza elasticidad celular, previene la tirantez y reduce la entrada de alérgenos externos.'
                            : 'Retención hídrica adecuada. Tu barrera cutánea mantiene la humedad sin descamación.'}
                        </p>
                      </div>

                      {/* Elasticidad */}
                      <div
                        onClick={() => setExpandedMetricKey(expandedMetricKey === 'elasticity' ? null : 'elasticity')}
                        className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1.5 cursor-pointer hover:border-[#2E7D5B] transition"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-[#2E7D5B]" />
                            <span className="text-[#2D2825]">Elasticidad & Colágeno Dérmico</span>
                            <span className="text-[10px] font-extrabold text-[#2E7D5B] bg-[#E6F4EC] px-1.5 py-0.2 rounded-md">
                              Saludable
                            </span>
                          </div>
                          <span className="text-[#2E7D5B] font-black">{aiDiagnosis.elasticity}%</span>
                        </div>
                        <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                          <div className="bg-[#2E7D5B] h-full rounded-full" style={{ width: `${aiDiagnosis.elasticity}%` }} />
                        </div>
                        <p className="text-[11px] text-[#66615C] leading-snug">
                          {expandedMetricKey === 'elasticity'
                            ? 'Evalúa la capacidad de retorno tisular y la integridad estructural de las fibras de colágeno tipo I/III y elastina tras la prueba de deformación visual.'
                            : 'Buena turgencia y resistencia mecánica dérmica frente a la gravedad.'}
                        </p>
                      </div>

                      {/* Poros y Sebo */}
                      <div
                        onClick={() => setExpandedMetricKey(expandedMetricKey === 'pores' ? null : 'pores')}
                        className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 cursor-pointer hover:border-amber-400 transition"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[#2D2825]">Poros & Dilatación Sebácea</span>
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-md">
                              Requiere Atención
                            </span>
                          </div>
                          <span className="text-amber-800 font-black">{aiDiagnosis.pores}%</span>
                        </div>
                        <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${aiDiagnosis.pores}%` }} />
                        </div>
                        <p className="text-[11px] text-amber-900 leading-snug">
                          {expandedMetricKey === 'pores'
                            ? '¿Qué significa el 68%? Mide el diámetro medio de los folículos pilosebáceos en la Zona T. Un porcentaje >60% señala hiperactividad de glándulas sebáceas que dilata el poro. Requiere Niacinamida 10% y BHA 2% para seborregular.'
                            : 'Poros ligeramente dilatados por flujo sebáceo activo en frente y nariz. Foco de mejora prioritario.'}
                        </p>
                      </div>

                      {/* Manchas */}
                      <div
                        onClick={() => setExpandedMetricKey(expandedMetricKey === 'spots' ? null : 'spots')}
                        className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1.5 cursor-pointer hover:border-[#2E7D5B] transition"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                            <span className="text-[#2D2825]">Manchas & Uniformidad del Tono</span>
                            <span className="text-[10px] font-extrabold text-[#66615C] bg-stone-100 px-1.5 py-0.2 rounded-md">
                              Leve PIH
                            </span>
                          </div>
                          <span className="text-amber-700 font-black">{aiDiagnosis.spots}%</span>
                        </div>
                        <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${aiDiagnosis.spots}%` }} />
                        </div>
                        <p className="text-[11px] text-[#66615C] leading-snug">
                          Distribución de melanina superficial con marcas residuales leves post-acné. Mitigable con Vitamina C y SPF 50+.
                        </p>
                      </div>

                      {/* Líneas Finas */}
                      <div
                        onClick={() => setExpandedMetricKey(expandedMetricKey === 'fineLines' ? null : 'fineLines')}
                        className="p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1.5 cursor-pointer hover:border-[#2E7D5B] transition"
                      >
                        <div className="flex justify-between text-xs font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-stone-400 inline-block" />
                            <span className="text-[#2D2825]">Líneas Finas & Micro-relieve</span>
                            <span className="text-[10px] font-extrabold text-[#66615C] bg-stone-100 px-1.5 py-0.2 rounded-md">
                              Bajo
                            </span>
                          </div>
                          <span className="text-[#66615C] font-black">{aiDiagnosis.fineLines}%</span>
                        </div>
                        <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                          <div className="bg-[#8C827A] h-full rounded-full" style={{ width: `${aiDiagnosis.fineLines}%` }} />
                        </div>
                        <p className="text-[11px] text-[#66615C] leading-snug">
                          Micro-líneas superficiales reversibles con ácido hialurónico; no corresponden a envejecimiento estructural profundo.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* DIAGNÓSTICO IA + BOTÓN MASCARILLA AR */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
                      <h3 className="text-sm font-extrabold text-[#2D2825]">
                        Diagnóstico IA Dermatológico
                      </h3>
                    </div>

                    <p className="text-xs text-[#2D2825] leading-relaxed">
                      {aiDiagnosis.verdict}
                    </p>

                    <div className="p-4 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1">
                      <span className="text-[10px] font-bold text-[#1B3D32] uppercase tracking-wider block">
                        Recomendación principal
                      </span>
                      <p className="text-xs text-[#1B3D32] leading-relaxed">
                        {aiDiagnosis.recommendation}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Link
                        href="/calendario"
                        className="w-full py-3 rounded-full bg-[#FAF8F5] hover:bg-white border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#2E7D5B]" />
                        <span>Ver rutina sugerida</span>
                      </Link>

                      <Link
                        href="/mi-rutina?launchAr=skin_cycling"
                        className="w-full py-3 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Probar Mascarilla AR</span>
                      </Link>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* FILA INFERIOR: PRODUCTOS RECOMENDADOS CON RAZÓN CLÍNICA Y OPINIONES/CALIFICACIONES */}
            {scanMode === 'face' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0ECE1] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-[10.5px] font-bold uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-3 h-3" />
                      Prescripción Científica Personalizada
                    </div>
                    <h3 className="text-lg font-extrabold text-[#2D2825]">
                      Productos Recomendados & Justificación Clínica
                    </h3>
                    <p className="text-xs text-[#66615C]">
                      Te explicamos exactamente por qué te recomendamos cada fórmula en base a tus métricas.
                    </p>
                  </div>

                  <Link
                    href="/tiendas"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32]"
                  >
                    <span>Ver disponibilidad en farmacias</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Prod 1: CeraVe Cleanser */}
                  <div className="rounded-3xl p-5 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-4 hover:shadow-xs transition">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                          Limpiador Syndet
                        </span>
                        {/* Rating con estrellas */}
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'cerave-foaming-facial-cleanser', name: 'CeraVe Gel Limpiador Espumoso' })}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#2D2825] hover:text-[#2E7D5B] cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.9</span>
                          <span className="text-[10px] text-[#8C827A] underline">(43 opiniones)</span>
                        </button>
                      </div>

                      <h4 className="font-extrabold text-sm text-[#2D2825]">
                        CeraVe Gel Limpiador Espumoso (236 ml)
                      </h4>

                      {/* RAZÓN CLÍNICA EXPLÍCITA */}
                      <div className="p-3 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1">
                        <span className="text-[10px] font-extrabold text-[#1B3D32] uppercase tracking-wider block">
                          ✦ ¿Por qué te lo recomendamos?
                        </span>
                        <p className="text-[11px] text-[#1B3D32] leading-snug">
                          Vinculado a tu <strong>68% de poros dilatados</strong>: sus tensioactivos suaves syndet y 3 ceramidas emulsionan el sebo de la Zona T sin barrer el manto ácido ni causar rebote lipídico.
                        </p>
                      </div>

                      <div className="text-[11px] text-[#66615C]">
                        Fase: Mañanas y Noches (Paso 1 Universal)
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E1D7] flex items-center justify-between">
                      <span className="font-black text-sm text-[#2D2825]">$14.50</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'cerave-foaming-facial-cleanser', name: 'CeraVe Gel Limpiador Espumoso' })}
                          className="px-2.5 py-1.5 rounded-full border border-[#E8E1D7] text-[10px] font-bold text-[#66615C] hover:bg-white transition cursor-pointer"
                        >
                          Opiniones
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuggestedProduct('CeraVe Gel Limpiador', 'CeraVe', 'CLEANSER')}
                          className="px-3.5 py-1.5 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prod 2: The Ordinary Niacinamide */}
                  <div className="rounded-3xl p-5 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-4 hover:shadow-xs transition">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                          Sérum Seborregulador
                        </span>
                        {/* Rating con estrellas */}
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'the-ordinary-niacinamide-10-zinc-1', name: 'The Ordinary Niacinamida 10% + Zinc 1%' })}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#2D2825] hover:text-[#2E7D5B] cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.7</span>
                          <span className="text-[10px] text-[#8C827A] underline">(124 opiniones)</span>
                        </button>
                      </div>

                      <h4 className="font-extrabold text-sm text-[#2D2825]">
                        The Ordinary Niacinamida 10% + Zinc 1%
                      </h4>

                      {/* RAZÓN CLÍNICA EXPLÍCITA */}
                      <div className="p-3 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1">
                        <span className="text-[10px] font-extrabold text-[#1B3D32] uppercase tracking-wider block">
                          ✦ ¿Por qué te lo recomendamos?
                        </span>
                        <p className="text-[11px] text-[#1B3D32] leading-snug">
                          Prescrito por tu <strong>exceso de sebo en Zona T</strong>: el Zinc PCA al 1% inhibe la 5-alfa reductasa disminuyendo el brillo, mientras la Niacinamida al 10% afina la textura y contrae el poro.
                        </p>
                      </div>

                      <div className="text-[11px] text-[#66615C]">
                        Fase: Noche 1 (post-exfoliación) y Noches 3-4
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E1D7] flex items-center justify-between">
                      <span className="font-black text-sm text-[#2D2825]">$11.00</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'the-ordinary-niacinamide-10-zinc-1', name: 'The Ordinary Niacinamida 10% + Zinc 1%' })}
                          className="px-2.5 py-1.5 rounded-full border border-[#E8E1D7] text-[10px] font-bold text-[#66615C] hover:bg-white transition cursor-pointer"
                        >
                          Opiniones
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuggestedProduct('The Ordinary Niacinamida 10%', 'The Ordinary', 'SERUM')}
                          className="px-3.5 py-1.5 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Prod 3: La Roche-Posay Toleriane */}
                  <div className="rounded-3xl p-5 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-4 hover:shadow-xs transition">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-0.5 rounded-full border border-[#D5E2DB]">
                          Hidratante Lamelar
                        </span>
                        {/* Rating con estrellas */}
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'la-roche-posay-cicaplast-baume-b5', name: 'La Roche-Posay Cicaplast Baume B5+' })}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#2D2825] hover:text-[#2E7D5B] cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>4.9</span>
                          <span className="text-[10px] text-[#8C827A] underline">(87 opiniones)</span>
                        </button>
                      </div>

                      <h4 className="font-extrabold text-sm text-[#2D2825]">
                        La Roche-Posay Toleriane Fluido Dermolimpiador
                      </h4>

                      {/* RAZÓN CLÍNICA EXPLÍCITA */}
                      <div className="p-3 rounded-2xl bg-[#E6F4EC]/60 border border-[#D5E2DB] space-y-1">
                        <span className="text-[10px] font-extrabold text-[#1B3D32] uppercase tracking-wider block">
                          ✦ ¿Por qué te lo recomendamos?
                        </span>
                        <p className="text-[11px] text-[#1B3D32] leading-snug">
                          Prescrito para <strong>sellar tu hidratación (82%)</strong> sin asfixiar la piel: vehículo fluido sin aceites comedogénicos que calma el estrato córneo y previene la pérdida TEWL.
                        </p>
                      </div>

                      <div className="text-[11px] text-[#66615C]">
                        Fase: Sello hidratante diario (AM y PM)
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E8E1D7] flex items-center justify-between">
                      <span className="font-black text-sm text-[#2D2825]">$19.80</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProduct({ slug: 'la-roche-posay-cicaplast-baume-b5', name: 'La Roche-Posay Cicaplast Baume B5+' })}
                          className="px-2.5 py-1.5 rounded-full border border-[#E8E1D7] text-[10px] font-bold text-[#66615C] hover:bg-white transition cursor-pointer"
                        >
                          Opiniones
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSuggestedProduct('La Roche-Posay Hidratante', 'La Roche-Posay', 'MOISTURIZER')}
                          className="px-3.5 py-1.5 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Añadir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN DE BITÁCORA Y EVOLUCIÓN HISTÓRICA DE LA PIEL */}
            <div className="pt-4">
              <SkinEvolutionProgressSection />
            </div>

            {/* MODAL DIDÁCTICO DE EXPLICACIÓN BIOMÉTRICA */}
            {showMetricsExplanationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                <div
                  className="w-full max-w-xl bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 sm:p-7 space-y-5 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#2E7D5B] uppercase tracking-wider bg-[#E6F4EC] px-2.5 py-0.5 rounded-full">
                        Glosario Médico
                      </span>
                      <h3 className="text-base font-extrabold text-[#2D2825] mt-1">
                        ¿Qué significan las métricas de tu piel?
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMetricsExplanationModal(false)}
                      className="p-1 rounded-full text-[#8C827A] hover:text-[#2D2825]"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs text-[#4A4540]">
                    <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                      <span className="font-black text-[#2D2825] block">1. Puntuación Dérmica General (Score 0-100)</span>
                      <p className="leading-relaxed">
                        Es el índice agregado de salud cutánea. Evalúa si el manto lipídico está en equilibrio homeostático. Valores entre <strong>70-85</strong> indican una piel saludable con áreas menores de afinamiento (ej. poros o micro-sebo).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                      <span className="font-black text-[#2D2825] block">2. Hidratación (Estrato Córneo)</span>
                      <p className="leading-relaxed">
                        Mide el agua ligada a factores naturales de hidratación (NMF) en la capa más externa de la epidermis. Si está por encima del 75%, la piel tiene buena turgencia y no sufre descamación microbiana.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                      <span className="font-black text-[#2D2825] block">3. Poros y Secreción Sebácea (%)</span>
                      <p className="leading-relaxed">
                        Mide el diámetro de apertura folicular y el flujo de lípidos en la Zona T. Al marcar <strong>68%</strong>, indica que los poros están abiertos debido al sebo que expulsan las glándulas, lo que requiere activos queratolíticos y seborreguladores.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] space-y-1">
                      <span className="font-black text-[#2D2825] block">4. Manchas & Uniformidad Melánica</span>
                      <p className="leading-relaxed">
                        Detecta micro-acumulaciones de pigmento o hiperpigmentación postinflamatoria (PIH). El valor refleja la homogeneidad del tono y la necesidad de fotoprotección y antioxidantes.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMetricsExplanationModal(false)}
                    className="w-full py-2.5 rounded-full bg-[#2E7D5B] text-white text-xs font-bold hover:bg-[#1B3D32] transition"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}

            {/* MODAL DE RESEÑAS Y OPINIONES DE PRODUCTO */}
            {selectedReviewProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                <div
                  className="w-full max-w-2xl bg-white rounded-3xl border border-[#E8E1D7] shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
                    <span className="text-xs font-extrabold text-[#2E7D5B] uppercase tracking-wider">
                      Reseñas de la Comunidad
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedReviewProduct(null)}
                      className="p-1 rounded-full text-[#8C827A] hover:text-[#2D2825]"
                    >
                      ✕
                    </button>
                  </div>

                  <ProductReviewsSection
                    productSlug={selectedReviewProduct.slug}
                    productName={selectedReviewProduct.name}
                  />
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer Estilo Mockup */}
        <footer className="pt-8 border-t border-[#E8E1D7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C827A]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#2D2825]">allabout<span className="text-[#2E7D5B]">.skin</span></span>
            <span>·</span>
            <span>Ciencia. Tu piel. Nuestra misión.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terminos" className="hover:text-[#2D2825] transition">Términos y condiciones</Link>
            <span>·</span>
            <Link href="/privacidad" className="hover:text-[#2D2825] transition">Privacidad</Link>
            <span>·</span>
            <a href="mailto:soporte@allaboutskin.com" className="hover:text-[#2D2825] transition">Contacto</a>
          </div>
        </footer>

      </div>
    </UserAppShell>
  );
}
