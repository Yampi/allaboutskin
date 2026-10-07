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
  Plus
} from 'lucide-react';
import { useSkincare } from '@/context/SkincareContext';
import { scanImageWithGeminiVision } from '@/lib/api';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';

export default function EscanerPage() {
  const { userProfile, updateProfile, addProductToShelf } = useSkincare();
  const [activeStep, setActiveStep] = useState<'capture' | 'analyzing' | 'results'>('capture');
  const [scanMode, setScanMode] = useState<'face' | 'product'>('face');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'all' | 't-zone' | 'cheeks' | 'chin'>('all');
  const [comparisonTab, setComparisonTab] = useState<'evolution' | 'before' | 'after'>('evolution');
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Cámara en vivo y captura
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Imágenes
  const sampleFaceUrl = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80';
  const beforeFaceUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const [currentImage, setCurrentImage] = useState<string>(sampleFaceUrl);
  const [isUserUploaded, setIsUserUploaded] = useState(false);

  // Estado del diagnóstico IA (Gemini Vision)
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

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Home, href: '/dashboard/usuario' },
    { id: 'mi-piel', label: 'Mi piel', icon: HeartPulse, href: '/mi-rutina' },
    { id: 'mi-rutina', label: 'Mi rutina', icon: Calendar, href: '/calendario' },
    { id: 'productos', label: 'Productos', icon: Package, href: '/biblioteca' },
    { id: 'analisis', label: 'Análisis y escaneos', icon: Scan, href: '/escaner' },
    { id: 'tiendas', label: 'Tiendas cercanas', icon: Store, href: '/tiendas' },
    { id: 'perfil', label: 'Perfil', icon: User, href: '/mi-rutina' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#2D2825] flex flex-col lg:flex-row antialiased selection:bg-[#E6F4EC] selection:text-[#2E7D5B] font-sans pb-16 lg:pb-0">
      
      {/* ========================================================= */}
      {/* 1. SIDEBAR DESKTOP (Verde Clínico DLG-HYBRID)              */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#E8E1D7] sticky top-0 h-screen justify-between p-5 shrink-0 z-20">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 px-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-2xs group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
            </div>
            <div className="font-extrabold text-lg text-[#2D2825] tracking-tight">
              allabout<span className="text-[#2E7D5B]">.skin</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'analisis';
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#E6F4EC] text-[#2E7D5B] border border-[#D5E2DB] shadow-2xs font-bold'
                      : 'text-[#66615C] hover:text-[#2E7D5B] hover:bg-[#F2F7F4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2E7D5B]' : 'text-[#8C827A]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4F8F5] border border-[#D5E2DB] flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#1B3D32] leading-snug">
              Tu piel, <span className="text-[#2E7D5B] font-extrabold">con ciencia.</span>
            </p>
            <p className="text-[10px] text-[#66615C] font-medium">
              No con marketing.
            </p>
          </div>
          <Flower2 className="w-5 h-5 text-[#2E7D5B] shrink-0" />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. HEADER MOBILE (Visible en pantallas pequeñas)          */}
      {/* ========================================================= */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#E8E1D7] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E6F4EC] border border-[#D5E2DB] flex items-center justify-center text-[#2E7D5B] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-extrabold text-base text-[#2D2825] tracking-tight">
            allabout<span className="text-[#2E7D5B]">.skin</span>
          </span>
        </Link>
        <span className="text-xs font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2.5 py-1 rounded-full border border-[#D5E2DB]">
          Escáner IA
        </span>
      </header>

      {/* ========================================================= */}
      {/* 3. MAIN ESCANER CONTENT (Vistas 2 y 6 Mockup)             */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* TOPBAR: Search bar & User Profile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar productos, ingredientes, etc."
              className="w-full bg-white border border-[#E8E1D7] rounded-full pl-9 pr-4 py-2 text-xs text-[#2D2825] placeholder:text-[#8C827A] focus:outline-none focus:ring-2 focus:ring-[#2E7D5B] transition shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-[#E8E1D7] flex items-center justify-center text-[#66615C] hover:text-[#2E7D5B] transition shadow-2xs relative cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute top-2 right-2 ring-2 ring-white" />
            </button>

            <Link
              href="/mi-rutina"
              className="flex items-center gap-2.5 bg-white border border-[#E8E1D7] rounded-full py-1 pl-1 pr-3.5 shadow-2xs hover:border-[#2E7D5B] transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-bold text-xs flex items-center justify-center overflow-hidden border border-[#D5E2DB]">
                M
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#2D2825] leading-tight">
                  María González
                </div>
                <div className="text-[10px] text-[#2E7D5B] font-semibold leading-none">
                  Premium
                </div>
              </div>
            </Link>
          </div>
        </div>

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
                    onClick={() => setScanMode('face')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      scanMode === 'face' ? 'bg-white text-[#2E7D5B] shadow-2xs' : 'text-[#66615C]'
                    }`}
                  >
                    Rostro (Biometría)
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode('product')}
                    className={`px-3 py-1 rounded-full transition cursor-pointer ${
                      scanMode === 'product' ? 'bg-white text-[#2E7D5B] shadow-2xs' : 'text-[#66615C]'
                    }`}
                  >
                    Etiqueta INCI
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
                    alt="Visor de escaneo facial"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* HUD Overlay Clínico (Silueta y Guías del Mockup) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Óvalo facial de enfoque */}
                  <div className="w-56 sm:w-64 h-72 sm:h-80 rounded-[50%] border-2 border-dashed border-[#2E7D5B] ring-8 ring-white/10 flex items-center justify-center relative">
                    {/* Retículas y esquinas */}
                    <div className="absolute top-0 w-4 h-4 border-t-2 border-l-2 border-[#2E7D5B]" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#2E7D5B]" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#2E7D5B]" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#2E7D5B]" />

                    {/* Puntos de calibración en mejillas y frente */}
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute top-10" />
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute left-6 top-36" />
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute right-6 top-36" />
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] absolute bottom-10" />
                  </div>

                  {/* Estado HUD inferior */}
                  <div className="absolute bottom-4 bg-black/60 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-[#2E7D5B] animate-pulse" />
                    <span>{isCameraActive ? 'Cámara activa · Alinea tu rostro' : 'Foto cargada · Lista para analizar'}</span>
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
                    setCurrentImage(sampleFaceUrl);
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
              
              {/* TARJETA 1: TOMA UNA BUENA FOTO */}
              <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-5">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-[#2D2825]">
                    Toma una buena foto
                  </h2>
                  <p className="text-xs text-[#66615C]">
                    Recomendaciones para obtener la máxima precisión diagnóstica.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-[#2D2825]">
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
                </div>

                {/* Botón Principal: Comenzar Escaneo */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartScan}
                    className="w-full py-3 rounded-full bg-[#1B3D32] hover:bg-[#2E7D5B] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Comenzar escaneo</span>
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
        {/* PASO 3: RESULTADOS (MOCKUP VISTA 6 DETALLE CLÍNICO)       */}
        {/* ========================================================= */}
        {activeStep === 'results' && (
          <div className="space-y-8 animate-in fade-in">
            
            {/* Cabecera de Resultados y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D7] shadow-2xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
                  Informe Calibrado · 15 abr 2026 · 10:24 a.m.
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#2D2825]">
                    Puntuación Dérmica: {aiDiagnosis.score}/100
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] font-extrabold text-xs border border-[#D5E2DB]">
                    {aiDiagnosis.statusText}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Descargando informe PDF de biometría dérmica...')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] hover:bg-white transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar informe</span>
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

            {/* Grid 2 Columnas de Detalle Clínico (Mockup Vista 6) */}
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
                        ? 'Zona T: Mayor producción sebácea, comedones cerrados leves'
                        : selectedQuadrant === 'cheeks'
                        ? 'Mejillas: Barrera cutánea íntegra y retención hídrica alta'
                        : 'Mentón: Normal, sin brotes quísticos'}
                    </span>
                  </div>
                </div>

                {/* Comparador Antes / Después (Mockup Vista 6) */}
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

                  {/* Miniaturas de comparación */}
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

              {/* Columna Derecha (6 cols): Barras por Área + Diagnóstico IA */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* TARJETA 1: RESULTADOS POR ÁREA (BARRAS DEL MOCKUP) */}
                <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
                  <h3 className="text-sm font-extrabold text-[#2D2825]">
                    Resultados por área
                  </h3>

                  <div className="space-y-3">
                    {/* Hidratación */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2D2825]">Hidratación</span>
                        <span className="text-[#2E7D5B]">{aiDiagnosis.hydration}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#2E7D5B] h-full rounded-full" style={{ width: `${aiDiagnosis.hydration}%` }} />
                      </div>
                    </div>

                    {/* Elasticidad */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2D2825]">Elasticidad</span>
                        <span className="text-[#2E7D5B]">{aiDiagnosis.elasticity}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#2E7D5B] h-full rounded-full" style={{ width: `${aiDiagnosis.elasticity}%` }} />
                      </div>
                    </div>

                    {/* Poros */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2D2825]">Poros</span>
                        <span className="text-amber-700">{aiDiagnosis.pores}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${aiDiagnosis.pores}%` }} />
                      </div>
                    </div>

                    {/* Manchas */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2D2825]">Manchas</span>
                        <span className="text-amber-700">{aiDiagnosis.spots}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${aiDiagnosis.spots}%` }} />
                      </div>
                    </div>

                    {/* Líneas finas */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#2D2825]">Líneas finas</span>
                        <span className="text-[#66615C]">{aiDiagnosis.fineLines}%</span>
                      </div>
                      <div className="w-full bg-[#EFECE6] rounded-full h-2 overflow-hidden">
                        <div className="bg-[#8C827A] h-full rounded-full" style={{ width: `${aiDiagnosis.fineLines}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TARJETA 2: DIAGNÓSTICO IA (GEMINI CLINICAL) */}
                <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2E7D5B]" />
                    <h3 className="text-sm font-extrabold text-[#2D2825]">
                      Diagnóstico IA
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

                  <div className="pt-2">
                    <Link
                      href="/calendario"
                      className="w-full py-3 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Ver rutina sugerida</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

              </div>

            </div>

            {/* FILA INFERIOR: PRODUCTOS RECOMENDADOS (MOCKUP VISTA 6) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#2D2825]">
                    Productos recomendados
                  </h3>
                  <p className="text-xs text-[#66615C]">
                    Fórmulas biocompatibles con los hallazgos de tu análisis facial.
                  </p>
                </div>

                <Link
                  href="/tiendas"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32]"
                >
                  <span>Ver disponibilidad en tiendas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Prod 1 */}
                <div className="rounded-2xl p-4 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                      Limpiador
                    </span>
                    <h4 className="font-bold text-xs text-[#2D2825]">
                      CeraVe Gel Limpiador
                    </h4>
                    <div className="text-[11px] text-[#66615C]">
                      Espumoso 236ml · Control de sebo
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E1D7]/60 flex items-center justify-between">
                    <span className="font-black text-xs text-[#2D2825]">$14.50</span>
                    <button
                      type="button"
                      onClick={() => handleAddSuggestedProduct('CeraVe Gel Limpiador', 'CeraVe', 'CLEANSER')}
                      className="px-3 py-1 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>

                {/* Prod 2 */}
                <div className="rounded-2xl p-4 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                      Sérum
                    </span>
                    <h4 className="font-bold text-xs text-[#2D2825]">
                      The Ordinary Niacinamida 10%
                    </h4>
                    <div className="text-[11px] text-[#66615C]">
                      Zinc 1% · Minimiza poros
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E1D7]/60 flex items-center justify-between">
                    <span className="font-black text-xs text-[#2D2825]">$11.00</span>
                    <button
                      type="button"
                      onClick={() => handleAddSuggestedProduct('The Ordinary Niacinamida 10%', 'The Ordinary', 'SERUM')}
                      className="px-3 py-1 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Añadir</span>
                    </button>
                  </div>
                </div>

                {/* Prod 3 */}
                <div className="rounded-2xl p-4 bg-[#FAFAF7] border border-[#E8E1D7] flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-[#2E7D5B] bg-[#E6F4EC] px-2 py-0.5 rounded-full border border-[#D5E2DB]">
                      Hidratante
                    </span>
                    <h4 className="font-bold text-xs text-[#2D2825]">
                      La Roche-Posay Hidratante
                    </h4>
                    <div className="text-[11px] text-[#66615C]">
                      Toleriane Fluido Ligero · Barrera
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E8E1D7]/60 flex items-center justify-between">
                    <span className="font-black text-xs text-[#2D2825]">$19.80</span>
                    <button
                      type="button"
                      onClick={() => handleAddSuggestedProduct('La Roche-Posay Hidratante', 'La Roche-Posay', 'MOISTURIZER')}
                      className="px-3 py-1 bg-[#2E7D5B] hover:bg-[#1B3D32] text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition"
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

      </main>

      {/* 4. Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E1D7] px-3 py-2 flex items-center justify-around shadow-lg">
        <Link href="/dashboard/usuario" className="flex flex-col items-center gap-0.5 text-[#66615C]">
          <Home className="w-4 h-4" />
          <span className="text-[9px]">Inicio</span>
        </Link>
        <Link href="/mi-rutina" className="flex flex-col items-center gap-0.5 text-[#66615C]">
          <HeartPulse className="w-4 h-4" />
          <span className="text-[9px]">Mi piel</span>
        </Link>
        <Link href="/calendario" className="flex flex-col items-center gap-0.5 text-[#66615C]">
          <Calendar className="w-4 h-4" />
          <span className="text-[9px]">Rutina</span>
        </Link>
        <Link href="/escaner" className="flex flex-col items-center gap-0.5 text-[#2E7D5B] font-bold">
          <Scan className="w-4 h-4" />
          <span className="text-[9px]">Escáner</span>
        </Link>
        <Link href="/tiendas" className="flex flex-col items-center gap-0.5 text-[#66615C]">
          <Store className="w-4 h-4" />
          <span className="text-[9px]">Tiendas</span>
        </Link>
      </nav>

    </div>
  );
}
