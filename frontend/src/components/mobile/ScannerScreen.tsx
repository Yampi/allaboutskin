'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  BookOpen,
  Layers,
  ShieldCheck,
  Zap,
  Edit3,
  VideoOff,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  FileText,
  User,
  Sun,
  Moon,
  Info,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ExternalLink,
  Award,
} from 'lucide-react';
import { InciScanResult, InciIngredientResult, ActiveIngredient, ProductShelfItem, UserProfile } from './types';
import { sampleScanPresets } from './skincareData';
import { performOpticalCharacterRecognition, analyzeCosmeticLabel } from '@/lib/ocrService';
import { scanImageWithGeminiVision } from '@/lib/api';
import { optimizeImageForUpload } from '@/lib/imageOptimizer';
import { FaceSkinAnalysis } from '@/lib/gemini';

export const CURATED_BIOTYPE_PRODUCTS: Record<string, Array<{
  id: string;
  name: string;
  brand: string;
  category: string;
  night: number;
  nightName: string;
  matchScore: number;
  activeTag: string;
  image: string;
  price: string;
  affiliateUrl: string;
}>> = {
  COMBINATION: [
    {
      id: 'curated-comb-1',
      name: 'Gel Limpiador Espumoso con Niacinamida',
      brand: 'CeraVe',
      category: 'Limpieza Fisiológica',
      night: 1,
      nightName: 'Noche 1 - 4 (Limpieza)',
      matchScore: 98,
      activeTag: 'Niacinamida + Ceramidas',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      price: '$16.50',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-comb-2',
      name: 'Niacinamide 10% + Zinc 1% High-Strength',
      brand: 'The Ordinary',
      category: 'Sérum Seborregulador',
      night: 2,
      nightName: 'Noche 2: Tratamiento',
      matchScore: 99,
      activeTag: 'Niacinamida 10% + Zinc PCA',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      price: '$8.20',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-comb-3',
      name: 'Toleriane Dermallergo Fluido Ligero',
      brand: 'La Roche-Posay',
      category: 'Hidratante Barrera',
      night: 3,
      nightName: 'Noches 3 & 4: Recuperación',
      matchScore: 97,
      activeTag: 'Neurosensina + Esfingobioma',
      image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
      price: '$24.90',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
  ],
  OILY: [
    {
      id: 'curated-oily-1',
      name: 'Effaclar Gel Purificante Micro-Exfoliante',
      brand: 'La Roche-Posay',
      category: 'Limpieza Profunda Purificante',
      night: 1,
      nightName: 'Noche 1 - 4 (Limpieza)',
      matchScore: 99,
      activeTag: 'Zinc PCA + LHA Purificante',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      price: '$18.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-oily-2',
      name: 'Skin Perfecting 2% BHA Liquid Exfoliant',
      brand: "Paula's Choice",
      category: 'Exfoliante Químico BHA',
      night: 1,
      nightName: 'Noche 1: Exfoliación',
      matchScore: 99,
      activeTag: 'Ácido Salicílico 2% + Té Verde',
      image: 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?auto=format&fit=crop&w=400&q=80',
      price: '$36.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-oily-3',
      name: 'Hydro Boost Water Gel Oil-Free',
      brand: 'Neutrogena',
      category: 'Gel de Hidratación Ligero',
      night: 3,
      nightName: 'Noches 3 & 4: Recuperación',
      matchScore: 96,
      activeTag: 'Ácido Hialurónico Purificado',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      price: '$15.90',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
  ],
  DRY: [
    {
      id: 'curated-dry-1',
      name: 'Limpiadora Hidratante Loción Cremosa',
      brand: 'CeraVe',
      category: 'Limpieza sin Espuma',
      night: 1,
      nightName: 'Noche 1 - 4 (Limpieza)',
      matchScore: 99,
      activeTag: 'Tecnología MVE + 3 Ceramidas',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      price: '$14.50',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-dry-2',
      name: 'Hyalu B5 Serum Concentrado Reparador',
      brand: 'La Roche-Posay',
      category: 'Sérum Reparador Hidratante',
      night: 3,
      nightName: 'Noches 3 & 4: Recuperación',
      matchScore: 98,
      activeTag: 'Ácido Hialurónico + Pantenol 5%',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      price: '$42.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-dry-3',
      name: 'Cicaplast Baume B5+ Ultra-Reparador',
      brand: 'La Roche-Posay',
      category: 'Bálsamo Calmante Multirreparador',
      night: 4,
      nightName: 'Noche 4: Sellado de Barrera',
      matchScore: 99,
      activeTag: 'Madecassoside + Tribioma',
      image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
      price: '$17.50',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
  ],
  SENSITIVE: [
    {
      id: 'curated-sens-1',
      name: 'Sensibio H2O Gel Moussant Calmante',
      brand: 'Bioderma',
      category: 'Limpieza Micelar Suave',
      night: 1,
      nightName: 'Noche 1 - 4 (Limpieza)',
      matchScore: 99,
      activeTag: 'Patente D.A.F. + Coco-Glucoside',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      price: '$15.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-sens-2',
      name: 'Tolérance Control Bálsamo Calmante',
      brand: 'Avène',
      category: 'Crema Restauradora Alta Tolerancia',
      night: 3,
      nightName: 'Noches 3 & 4: Recuperación',
      matchScore: 98,
      activeTag: 'D-Sensinose™ Postbiótico',
      image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
      price: '$23.50',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-sens-3',
      name: 'Mineral 89 Booster Fortificante',
      brand: 'Vichy',
      category: 'Concentrado Fortalecedor Diario',
      night: 2,
      nightName: 'Noche 2: Preparación',
      matchScore: 97,
      activeTag: '89% Agua Volcánica + Hialurónico',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      price: '$26.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
  ],
  NORMAL: [
    {
      id: 'curated-norm-1',
      name: 'Hydrating Facial Cleanser Balance',
      brand: 'CeraVe',
      category: 'Limpieza Equilibrante',
      night: 1,
      nightName: 'Noche 1 - 4 (Limpieza)',
      matchScore: 98,
      activeTag: 'Ceramidas + Ácido Hialurónico',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      price: '$15.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-norm-2',
      name: 'Retinol 0.3% Anti-Aging Serum',
      brand: 'SkinCeuticals',
      category: 'Sérum Renovador Celular',
      night: 2,
      nightName: 'Noche 2: Retinoides',
      matchScore: 97,
      activeTag: 'Retinol Puro 0.3% + Bisabolol',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      price: '$78.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
    {
      id: 'curated-norm-3',
      name: 'Ultra Facial Cream 24h Barrier Hydration',
      brand: "Kiehl's",
      category: 'Hidratación Barrera Lamelar',
      night: 3,
      nightName: 'Noches 3 & 4: Recuperación',
      matchScore: 98,
      activeTag: 'Escualano Vegetal + Glicoproteína Glacial',
      image: 'https://images.unsplash.com/photo-1608248597359-25f0a82b3d7a?auto=format&fit=crop&w=400&q=80',
      price: '$38.00',
      affiliateUrl: 'https://amazon.es?tag=allaboutskin-21',
    },
  ],
};

interface ScannerScreenProps {
  onAddProductToShelf: (product: ProductShelfItem) => void;
  onSelectIngredient?: (ing: ActiveIngredient) => void;
  onUpdateProfile?: (profile: Partial<UserProfile>) => void;
  userProfile?: UserProfile;
}

export default function ScannerScreen({
  onAddProductToShelf,
  onSelectIngredient,
  onUpdateProfile,
  userProfile,
}: ScannerScreenProps) {
  // Input modes: 'camera' | 'upload' | 'text' | 'preset'
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'text' | 'preset'>('camera');

  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // OCR & Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [manualInciText, setManualInciText] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [manualBrandName, setManualBrandName] = useState('');
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  // Result States: 'PRODUCT' | 'FACE' | 'INVALID' | null
  const [scanTypeResult, setScanTypeResult] = useState<'PRODUCT' | 'FACE' | 'INVALID' | null>(null);
  const [faceSkinResult, setFaceSkinResult] = useState<FaceSkinAnalysis | null>(null);
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);
  const [adoptedProfileSuccess, setAdoptedProfileSuccess] = useState(false);

  // Face Zone AR Overlay States
  const [showFaceZones, setShowFaceZones] = useState(true);
  const [selectedZone, setSelectedZone] = useState<'ALL' | 'ZONE_T' | 'CHEEKS'>('ALL');

  // Product Result State
  const [auditResult, setAuditResult] = useState<InciScanResult | null>(null);
  const [selectedInciItem, setSelectedInciItem] = useState<InciIngredientResult | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);

  // Start real device camera
  const startCamera = async (mode = facingMode) => {
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La API de cámara no está disponible en este navegador o contexto.');
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
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setIsCameraActive(false);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado. Puedes usar la subida de foto o pegar el INCI directamente.'
          : 'No se pudo iniciar la cámara en este dispositivo. Usa la opción de foto o texto.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Switch camera front/back
  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Read URL query parameters on mount (mode=face, mode=product, q=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const queryParam = params.get('q');

      if (queryParam) {
        setScanMode('text');
        setManualInciText(queryParam);
      } else if (modeParam === 'face') {
        setFacingMode('user');
        if (scanMode === 'camera') {
          startCamera('user');
        }
      } else if (modeParam === 'product') {
        setFacingMode('environment');
        if (scanMode === 'camera') {
          startCamera('environment');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (scanMode === 'camera' && !isProcessing && scanTypeResult === null) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [scanMode, scanTypeResult]);

  // Reset entire scanner to take another photo or re-open camera
  const handleResetScan = () => {
    setScanTypeResult(null);
    setFaceSkinResult(null);
    setAuditResult(null);
    setRejectionMessage(null);
    setCapturedImagePreview(null);
    setImageDimensions(null);
    setIsProcessing(false);
    setOcrProgress(0);
    setOcrStatusText('');
    setAdoptedProfileSuccess(false);
    setSelectedZone('ALL');
    setShowFaceZones(true);
    if (scanMode === 'camera') {
      startCamera();
    }
  };

  // Capture frame from video and immediately transition to analyzing
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImagePreview(dataUrl);

    // Stop camera feed immediately so the user clearly sees their captured photo & analyzing animation
    stopCamera();

    canvas.toBlob(async (blob) => {
      if (blob) {
        await processImageWithVision(blob, dataUrl, 'Captura de Cámara en Vivo');
      }
    }, 'image/jpeg', 0.85);
  };

  // Handle uploaded photo from file system / gallery
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // Reset input to allow selecting same file again

    stopCamera();

    try {
      setIsProcessing(true);
      setOcrProgress(15);
      setOcrStatusText('Optimizando foto para escaneo...');
      const optimized = await optimizeImageForUpload(file, { maxDimension: 1400, quality: 0.82 });
      setCapturedImagePreview(optimized.base64);
      await processImageWithVision(optimized.blob, optimized.base64, file.name);
    } catch (err) {
      console.warn('Direct upload fallback:', err);
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setCapturedImagePreview(dataUrl);
        await processImageWithVision(file, dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Unified Multimodal Vision & Classification Pipeline
  const processImageWithVision = async (imageSource: File | Blob, dataUrlString?: string, fallbackName = 'Producto Escaneado') => {
    setIsProcessing(true);
    setOcrProgress(20);
    setOcrStatusText('Iniciando Visión Dermatológica IA...');
    setAuditResult(null);
    setFaceSkinResult(null);
    setRejectionMessage(null);
    setScanTypeResult(null);
    setAdoptedProfileSuccess(false);

    let base64 = dataUrlString || '';
    let optimizedBlob: Blob = imageSource;
    let mimeType = imageSource.type || 'image/jpeg';

    if (!base64 || (typeof imageSource === 'object' && imageSource.size > 800 * 1024)) {
      try {
        const optimized = await optimizeImageForUpload(imageSource, { maxDimension: 1400, quality: 0.82 });
        base64 = optimized.base64;
        optimizedBlob = optimized.blob;
        mimeType = optimized.mimeType;
      } catch (optErr) {
        console.warn('Image optimization skipped:', optErr);
        if (!base64) {
          base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageSource);
          });
        }
      }
    }

    setCapturedImagePreview(base64);

    try {
      setOcrProgress(35);
      setOcrStatusText('Identificando si es Selfie o Producto Cosmético...');

      const scanData = await scanImageWithGeminiVision(base64, mimeType);

      setOcrProgress(70);

      if (scanData.classification === 'HUMAN_FACE') {
        // 1. SELFIE / ROSTRO HUMANO DETECTADO
        setOcrProgress(90);
        setOcrStatusText('Mapeando Zona T, mejillas y biotipo cutáneo...');
        setScanTypeResult('FACE');
        setFaceSkinResult(scanData.faceAnalysis);
        setOcrProgress(100);
        setOcrStatusText('¡Diagnóstico facial completado!');
        setIsProcessing(false);
        return;
      } else if (scanData.classification === 'SKINCARE_PRODUCT') {
        // 2. PRODUCTO DE SKINCARE DETECTADO
        setScanTypeResult('PRODUCT');
        const detectedName = scanData.productName ? `${scanData.brand ? `${scanData.brand} ` : ''}${scanData.productName}` : manualProductName || fallbackName;
        const detectedBrand = scanData.brand || manualBrandName || 'Marca Cosmética';
        let detectedInci = scanData.inciText || scanData.rawDetectedText || '';

        setManualProductName(detectedName);
        setManualBrandName(detectedBrand);
        setManualInciText(detectedInci);

        setOcrProgress(85);
        setOcrStatusText('Auditando fórmula con taxonomía CosIng UE y PubMed...');

        if (!detectedInci || detectedInci.length < 10) {
          try {
            setOcrStatusText('Extrayendo texto INCI detallado...');
            const rawText = await performOpticalCharacterRecognition(optimizedBlob, (p, s) => {
              setOcrProgress(70 + Math.round(p * 15));
            });
            const analysis = analyzeCosmeticLabel(rawText);
            detectedInci = analysis.suggestedOfficialInci || analysis.cleanedText || rawText;
            setManualInciText(detectedInci);
          } catch (ocrErr) {
            console.warn('Fallback OCR warning:', ocrErr);
          }
        }

        await runApiInciAudit(detectedInci || 'Aqua, Glycerin, Niacinamide, Sodium Hyaluronate', detectedName, detectedBrand);
        setOcrProgress(100);
        setIsProcessing(false);
        return;
      } else {
        // 3. INVALID (No es cosmético ni rostro, o foto no legible)
        setScanTypeResult('INVALID');
        setRejectionMessage(
          scanData.userFriendlyMessage ||
          'No detectamos un producto de skincare ni el rostro de una persona en la foto. Por favor enfoca la etiqueta de tu cosmético o tómate una selfie con buena luz natural.'
        );
        setOcrProgress(100);
        setOcrStatusText('Imagen no identificada');
        setIsProcessing(false);
        return;
      }
    } catch (err: any) {
      console.warn('Vision API error, fallback to OCR/heuristic:', err);
      try {
        setOcrStatusText('Analizando imagen...');
        const rawText = await performOpticalCharacterRecognition(optimizedBlob, (p, s) => {
          setOcrProgress(Math.round(p * 70));
          setOcrStatusText(s);
        });

        const analysis = analyzeCosmeticLabel(rawText);
        if (analysis.isCosmeticValid || (analysis.cleanedText && analysis.cleanedText.length > 15)) {
          setScanTypeResult('PRODUCT');
          const formulaToAudit = analysis.suggestedOfficialInci || analysis.cleanedText || rawText;
          const detectedName = analysis.detectedProductName || manualProductName || fallbackName;
          const detectedBrand = analysis.detectedBrand || manualBrandName || 'Marca Detectada';
          setManualInciText(formulaToAudit);
          setManualProductName(detectedName);
          setManualBrandName(detectedBrand);
          await runApiInciAudit(formulaToAudit, detectedName, detectedBrand);
        } else {
          setScanTypeResult('INVALID');
          const isNetworkOrApiError = err?.message && (err.message.includes('API') || err.message.includes('Gemini') || err.message.includes('fetch') || err.message.includes('límite') || err.message.includes('servidor') || err.message.includes('Error'));
          setRejectionMessage(
            isNetworkOrApiError
              ? `No se pudo conectar con el servicio de visión por IA (${err.message}). Por favor reintenta en unos momentos o ingresa los datos manualmente.`
              : 'No pudimos clasificar automáticamente si la foto es un rostro o un cosmético. Por favor, asegúrate de tomar una selfie frontal de tu rostro o enfocar la etiqueta de ingredientes de tu producto.'
          );
          setOcrProgress(100);
          setOcrStatusText(isNetworkOrApiError ? 'Error de servicio' : 'Imagen no reconocida');
        }
      } catch (ocrErr: any) {
        setScanTypeResult('INVALID');
        setRejectionMessage('No fue posible procesar la imagen. Intenta de nuevo o ingresa el texto de los ingredientes.');
      } finally {
        setIsProcessing(false);
        setOcrProgress(100);
      }
    }
  };

  // Execute actual API Audit Call to /api/audit/inci
  const runApiInciAudit = async (formulaText: string, prodName?: string, brandName?: string) => {
    if (!formulaText.trim()) {
      alert('Por favor ingresa o escanea una lista de ingredientes INCI.');
      return;
    }

    setIsProcessing(true);
    setOcrProgress(90);
    setOcrStatusText('Consultando compatibilidad con Skin Cycling...');
    setScanTypeResult('PRODUCT');

    try {
      const response = await fetch('/api/audit/inci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inci_text: formulaText,
          formula: formulaText,
          product_name: prodName || manualProductName || 'Cosmético Auditado',
        }),
      });

      const json = await response.json();

      if (json.status === 'success' && json.data) {
        const report = json.data;
        const breakdown = report.ingredients_breakdown || [];

        const mappedIngredients: InciIngredientResult[] = breakdown.map((item: any, i: number) => {
          let trafficLight: 'SAFE' | 'HYDRATING' | 'CAUTION' = 'SAFE';
          let label = 'Eficaz / Seguro';

          if (item.irritation_rating >= 2 || item.comedogenic_rating >= 3) {
            trafficLight = 'CAUTION';
            label = 'Precaución en Piel Reactiva';
          } else if (
            item.cosing_functions?.some((f: string) =>
              ['HUMECTANT', 'MOISTURIZING', 'SOOTHING', 'SKIN CONDITIONING', 'EMOLLIENT'].includes(f)
            ) ||
            item.common_name?.toLowerCase().includes('hialur') ||
            item.common_name?.toLowerCase().includes('glicerin') ||
            item.common_name?.toLowerCase().includes('ceramida')
          ) {
            trafficLight = 'HYDRATING';
            label = 'Hidratante / Reparador';
          }

          return {
            id: `api-inci-${i}`,
            name: item.common_name || item.inci_name,
            inci: item.inci_name,
            category: item.cosing_functions?.[0] || 'Acondicionador Dérmico',
            function: item.clinical_rationale || item.cosing_functions?.join(', ') || 'Función dermatológica cosmética',
            trafficLight,
            trafficLightLabel: label,
            safetyScore: Math.max(70, 100 - (item.irritation_rating || 0) * 10 - (item.comedogenic_rating || 0) * 5),
            comedogenicRating: item.comedogenic_rating || 0,
            cosingRef: item.cas_number || 'UE-CosIng',
            pubmedStudiesCount: item.matched_studies_count || 120,
            description: item.clinical_rationale || 'Ingrediente verificado conforme a la regulación cosmética internacional.',
          };
        });

        const isExfoliant = breakdown.some((b: any) => b.inci_name.includes('SALICYLIC') || b.inci_name.includes('GLYCOLIC'));
        const isRetinoid = breakdown.some((b: any) => b.inci_name.includes('RETIN'));
        let recommendedNights = [3, 4];
        if (isExfoliant) recommendedNights = [1];
        else if (isRetinoid) recommendedNights = [2];

        const maxIrrit = report.safety_and_skin_tolerance?.max_irritation_score || 0;
        const compScore = Math.max(60, Math.min(100, 100 - maxIrrit * 8 + (breakdown.length > 2 ? 5 : 0)));

        const finalResult: InciScanResult = {
          productName: prodName || manualProductName || 'Fórmula Auditada',
          brand: brandName || manualBrandName || 'Cosmética Científica',
          category: report.ai_clinical_copilot?.format_type || 'Tratamiento Tópico',
          compatibilityScore: compScore,
          fitForCycling: true,
          cycleNightsRecommended: recommendedNights,
          summary:
            report.ai_clinical_copilot?.plain_language_summary ||
            `Fórmula de ${breakdown.length} ingredientes analizada con rigor clínico. Nivel de evidencia científica indexado en PubMed y CosIng.`,
          ingredients: mappedIngredients.length > 0 ? mappedIngredients : sampleScanPresets[0].ingredients,
        };

        setAuditResult(finalResult);
      } else {
        setAuditResult(sampleScanPresets[0]);
      }
    } catch (error) {
      console.error('Audit API error:', error);
      setAuditResult(sampleScanPresets[0]);
    } finally {
      setIsProcessing(false);
      setOcrProgress(100);
    }
  };

  // Add evaluated product to user's real shelf
  const handleSaveToShelf = () => {
    if (!auditResult) return;

    const newProduct: ProductShelfItem = {
      id: `shelf-${Date.now()}`,
      name: auditResult.productName,
      brand: auditResult.brand,
      category: auditResult.category,
      volume: '50 ml',
      paoMonths: 12,
      inciScore: auditResult.compatibilityScore,
      primaryActives: auditResult.ingredients.slice(0, 3).map((i) => i.name),
      assignedPhase: auditResult.cycleNightsRecommended[0] || 3,
      assignedPhaseName: `Noche ${auditResult.cycleNightsRecommended[0] || 3}: Recuperación`,
      image: capturedImagePreview || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      textureNote: 'Fórmula auditada en tiempo real',
    };

    onAddProductToShelf(newProduct);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Apply Facial Skin Diagnosis to Profile
  const handleAdoptFaceDiagnosis = () => {
    if (!faceSkinResult || !onUpdateProfile) return;

    onUpdateProfile({
      skinType: faceSkinResult.skinTypeEstimate,
      conditions: faceSkinResult.visibleConcerns,
    });

    setAdoptedProfileSuccess(true);
    setTimeout(() => setAdoptedProfileSuccess(false), 4000);
  };

  // Traffic light subsets
  const safeIngredients = auditResult?.ingredients.filter((i) => i.trafficLight === 'SAFE') || [];
  const hydratingIngredients = auditResult?.ingredients.filter((i) => i.trafficLight === 'HYDRATING') || [];
  const cautionIngredients = auditResult?.ingredients.filter((i) => i.trafficLight === 'CAUTION') || [];

  // Active dynamic facial regions (from AI vision or proportional neoclassical fallback)
  const activeFaceRegions = faceSkinResult?.faceRegions || {
    faceBox: { top: 12, left: 18, width: 64, height: 72 },
    zoneTBox: { top: 18, left: 32, width: 36, height: 38 },
    leftCheekBox: { top: 44, left: 18, width: 22, height: 24 },
    rightCheekBox: { top: 44, left: 60, width: 22, height: 24 },
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-300">
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ========================================================================= */}
      {/* STATE 1: CLINICAL PROCESSING / ANALYZING VIEW (MUTUALLY EXCLUSIVE)        */}
      {/* ========================================================================= */}
      {isProcessing && (
        <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {/* Clinical Scan Viewport with Laser Beam */}
          <div className="relative w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] rounded-[28px] overflow-hidden bg-[#151D18] border-2 border-[#8FA89B] shadow-diffuse-elevated flex items-center justify-center">
            {capturedImagePreview ? (
              <img
                src={capturedImagePreview}
                alt="Fotografía capturada"
                className="w-full h-full object-cover filter brightness-90 contrast-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/50 space-y-2">
                <Sparkles className="w-12 h-12 text-[#8FA89B] animate-spin" />
                <span className="text-[12px] font-mono">Procesando imagen...</span>
              </div>
            )}

            {/* Sweeping Laser Beam */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#8FA89B] to-transparent shadow-[0_0_16px_4px_#8FA89B] animate-scan-beam" />

            {/* High-Tech HUD Reticle Focus Corners */}
            <div className="absolute inset-5 pointer-events-none">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-[#8FA89B] rounded-tl-[16px]" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-[#8FA89B] rounded-tr-[16px]" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-[#8FA89B] rounded-bl-[16px]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-[#8FA89B] rounded-br-[16px]" />

              {/* Pulsing center circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 border border-[#8FA89B]/40 rounded-full flex items-center justify-center animate-ping" />
                <div className="absolute w-36 h-36 border border-dashed border-[#8FA89B]/30 rounded-full" />
              </div>
            </div>

            {/* Status Pill in Preview */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11.5px] font-sans font-medium text-white/90">
                  Escaneo Multimodal Activo
                </span>
              </div>
              <span className="font-mono text-[12px] font-bold text-[#DFCAAC]">
                {ocrProgress}%
              </span>
            </div>
          </div>

          {/* Clinical Status & Step Tracker Card */}
          <div className="card-white p-6 rounded-[24px] border border-[#8FA89B]/50 shadow-diffuse space-y-4 max-w-md mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-[#4A6B5B]" />
              <span>Visión Dermatológica IA</span>
            </div>

            <div>
              <h3 className="font-serif text-[20px] font-semibold text-[#2D2825]">
                Analizando tu Fotografía
              </h3>
              <p className="text-[13px] text-[#7E756F] mt-1 font-sans">
                {ocrStatusText || 'Extrayendo biomarcadores y morfología dérmica...'}
              </p>
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#8FA89B] to-[#4A6B5B] transition-all duration-300 rounded-full shadow-xs"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2 text-left pt-2 border-t border-[#E8E1D7]">
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#4A6B5B] block">Paso 1</span>
                <span className="text-[11px] font-medium text-[#2D2825] block">Captura Óptica</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#4A6B5B] block">Paso 2</span>
                <span className="text-[11px] font-medium text-[#2D2825] block">Biomarcadores</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#8FA89B] block">Paso 3</span>
                <span className="text-[11px] font-medium text-[#7E756F] block">Diagnóstico</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 2: DEDICATED RESULTS VIEW (REPLACES CAMERA COMPLETELY)              */}
      {/* ========================================================================= */}
      {!isProcessing && scanTypeResult !== null && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Navigation & Reset Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E1D7]">
            <button
              onClick={handleResetScan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#F2ECE4] border border-[#E2D9CD] text-[#2D2825] text-[13px] font-semibold transition cursor-pointer shadow-xs group"
            >
              <ArrowLeft className="w-4 h-4 text-[#4A6B5B] group-hover:-translate-x-0.5 transition-transform" />
              <span>Tomar Otra Foto / Reabrir Cámara</span>
            </button>

            <div className="flex items-center gap-2">
              {scanTypeResult === 'FACE' && (
                <span className="px-3.5 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-bold uppercase tracking-wider border border-[#8FA89B]/30 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Rostro Detectado • Diagnóstico Facial</span>
                </span>
              )}
              {scanTypeResult === 'PRODUCT' && (
                <span className="px-3.5 py-1 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[11px] font-bold uppercase tracking-wider border border-[#8FA89B]/30 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cosmético Detectado • Auditoría INCI</span>
                </span>
              )}
              {scanTypeResult === 'INVALID' && (
                <span className="px-3.5 py-1 rounded-full bg-[#FAF0ED] text-[#943C36] text-[11px] font-bold uppercase tracking-wider border border-[#D8A899]/50 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Imagen no Clasificada</span>
                </span>
              )}
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* 2.A: FACIAL RESULT WITH INTERACTIVE AR ZONE MAPPING ON SELFIE        */}
          {/* --------------------------------------------------------------------- */}
          {scanTypeResult === 'FACE' && faceSkinResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Interactive Photo with Face Zones Overlay (col-span-5) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="card-white p-4 sm:p-5 rounded-[24px] border border-[#8FA89B]/50 shadow-diffuse-elevated space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#7E756F] tracking-wider block">
                        Visor Dermatológico AR
                      </span>
                      <h3 className="font-serif text-[17px] font-semibold text-[#2D2825]">
                        Zonas Dérmicas Identificadas
                      </h3>
                    </div>

                    {/* Toggle button */}
                    <button
                      onClick={() => setShowFaceZones(!showFaceZones)}
                      className="px-3 py-1.5 rounded-full bg-[#F2ECE4] hover:bg-[#E8E1D7] text-[#2D2825] text-[11.5px] font-semibold flex items-center gap-1.5 transition cursor-pointer border border-[#E2D9CD]"
                      title="Ocultar o ver zonas identificadas sobre la foto"
                    >
                      {showFaceZones ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-[#7E756F]" />
                          <span>Ocultar Zonas</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-[#4A6B5B]" />
                          <span>Ver Zonas</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Photo Container with Overlays */}
                  <div
                    className="relative w-full rounded-[20px] overflow-hidden bg-[#1E2822] border-2 border-[#8FA89B] shadow-inner select-none transition-all duration-300 mx-auto"
                    style={{
                      aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : '3/4',
                      maxHeight: '68vh',
                    }}
                  >
                    {capturedImagePreview ? (
                      <img
                        src={capturedImagePreview}
                        alt="Selfie analizada"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth && img.naturalHeight) {
                            setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                          }
                        }}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#2D3830] text-[#8FA89B]">
                        <User className="w-20 h-20 opacity-40" />
                      </div>
                    )}

                    {/* HUD Reticle Corners */}
                    <div className="absolute inset-3 pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8FA89B]/80 rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8FA89B]/80 rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8FA89B]/80 rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8FA89B]/80 rounded-br-lg" />
                    </div>

                    {/* AR OVERLAY BOXES ON PHOTO */}
                    {showFaceZones && (
                      <>
                        {/* 0. FACIAL CALIBRATION RETICLE (Adaptado al rostro del sujeto) */}
                        <div
                          className="absolute pointer-events-none transition-all duration-500 rounded-[22px] border border-white/25 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                          style={{
                            top: `${activeFaceRegions.faceBox.top}%`,
                            left: `${activeFaceRegions.faceBox.left}%`,
                            width: `${activeFaceRegions.faceBox.width}%`,
                            height: `${activeFaceRegions.faceBox.height}%`,
                          }}
                        >
                          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-white/70 rounded-tl" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-white/70 rounded-tr" />
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-white/70 rounded-bl" />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-white/70 rounded-br" />
                        </div>

                        {/* 1. ZONA T (Frente y Puente Nasal) */}
                        {(selectedZone === 'ALL' || selectedZone === 'ZONE_T') && (
                          <div
                            onClick={() => setSelectedZone(selectedZone === 'ZONE_T' ? 'ALL' : 'ZONE_T')}
                            className={`absolute transition-all duration-300 cursor-pointer ${
                              selectedZone === 'ZONE_T'
                                ? 'ring-2 ring-amber-400 bg-amber-400/25 shadow-[0_0_22px_rgba(251,191,36,0.55)]'
                                : 'border-2 border-dashed border-amber-300/80 bg-amber-300/15 hover:bg-amber-300/25'
                            } rounded-[22px] flex flex-col items-center justify-between p-1.5 z-10`}
                            style={{
                              top: `${activeFaceRegions.zoneTBox.top}%`,
                              left: `${activeFaceRegions.zoneTBox.left}%`,
                              width: `${activeFaceRegions.zoneTBox.width}%`,
                              height: `${activeFaceRegions.zoneTBox.height}%`,
                            }}
                          >
                            <div className="bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-300/70 shadow-lg text-white flex items-center gap-1.5 animate-pulse-subtle max-w-full">
                              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="text-[10.5px] font-bold text-amber-300 font-sans tracking-tight shrink-0">
                                Zona T
                              </span>
                              <span className="text-[9px] font-medium text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full truncate">
                                Sebo {faceSkinResult.zoneTAnalysis?.shineLevel === 'HIGH' ? 'Alto' : faceSkinResult.zoneTAnalysis?.shineLevel === 'MODERATE' ? 'Medio' : 'Bajo'}
                              </span>
                            </div>
                            <div className="my-auto w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-400/40 animate-pulse" />
                          </div>
                        )}

                        {/* 2. MEJILLAS / ZONA U (Bilateral Malar) */}
                        {(selectedZone === 'ALL' || selectedZone === 'CHEEKS') && (
                          <>
                            {/* Mejilla Izquierda en foto */}
                            <div
                              onClick={() => setSelectedZone(selectedZone === 'CHEEKS' ? 'ALL' : 'CHEEKS')}
                              className={`absolute transition-all duration-300 cursor-pointer ${
                                selectedZone === 'CHEEKS'
                                  ? 'ring-2 ring-emerald-400 bg-emerald-400/25 shadow-[0_0_22px_rgba(52,211,153,0.55)]'
                                  : 'border-2 border-dashed border-emerald-300/80 bg-emerald-300/15 hover:bg-emerald-300/25'
                              } rounded-[22px] flex items-center justify-center z-10`}
                              style={{
                                top: `${activeFaceRegions.leftCheekBox.top}%`,
                                left: `${activeFaceRegions.leftCheekBox.left}%`,
                                width: `${activeFaceRegions.leftCheekBox.width}%`,
                                height: `${activeFaceRegions.leftCheekBox.height}%`,
                              }}
                            >
                              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/40 animate-pulse" />
                            </div>

                            {/* Mejilla Derecha en foto */}
                            <div
                              onClick={() => setSelectedZone(selectedZone === 'CHEEKS' ? 'ALL' : 'CHEEKS')}
                              className={`absolute transition-all duration-300 cursor-pointer ${
                                selectedZone === 'CHEEKS'
                                  ? 'ring-2 ring-emerald-400 bg-emerald-400/25 shadow-[0_0_22px_rgba(52,211,153,0.55)]'
                                  : 'border-2 border-dashed border-emerald-300/80 bg-emerald-300/15 hover:bg-emerald-300/25'
                              } rounded-[22px] flex items-center justify-center z-10`}
                              style={{
                                top: `${activeFaceRegions.rightCheekBox.top}%`,
                                left: `${activeFaceRegions.rightCheekBox.left}%`,
                                width: `${activeFaceRegions.rightCheekBox.width}%`,
                                height: `${activeFaceRegions.rightCheekBox.height}%`,
                              }}
                            >
                              <div className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/40 animate-pulse" />
                            </div>

                            {/* Cheeks Floating Pill */}
                            <div
                              onClick={() => setSelectedZone(selectedZone === 'CHEEKS' ? 'ALL' : 'CHEEKS')}
                              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-300/70 shadow-lg text-white flex items-center gap-1.5 cursor-pointer animate-pulse-subtle z-20"
                            >
                              <Moon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="text-[11px] font-bold text-emerald-300 font-sans tracking-tight">
                                Mejillas
                              </span>
                              <span className="text-[9.5px] font-medium text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full">
                                {faceSkinResult.cheeksAnalysis?.hydrationState === 'DRY'
                                  ? 'Seca / Tirante'
                                  : faceSkinResult.cheeksAnalysis?.hydrationState === 'BALANCED'
                                  ? 'Equilibrada'
                                  : 'Normal'}
                              </span>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    {/* Confidence Pill */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-white text-[10px] font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {Math.round(faceSkinResult.confidence * 100)}% Certeza
                    </div>
                  </div>

                  {/* Zone Filter Pill Buttons */}
                  <div className="flex items-center justify-center gap-1.5 p-1 rounded-full bg-[#F2ECE4] border border-[#E2D9CD]">
                    <button
                      onClick={() => setSelectedZone('ALL')}
                      className={`flex-1 py-1.5 px-2 rounded-full text-[11.5px] font-medium transition cursor-pointer text-center ${
                        selectedZone === 'ALL'
                          ? 'bg-[#4A6B5B] text-white font-semibold shadow-xs'
                          : 'text-[#7E756F] hover:text-[#2D2825]'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setSelectedZone('ZONE_T')}
                      className={`flex-1 py-1.5 px-2 rounded-full text-[11.5px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                        selectedZone === 'ZONE_T'
                          ? 'bg-amber-600 text-white font-semibold shadow-xs'
                          : 'text-[#7E756F] hover:text-[#2D2825]'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>Zona T</span>
                    </button>
                    <button
                      onClick={() => setSelectedZone('CHEEKS')}
                      className={`flex-1 py-1.5 px-2 rounded-full text-[11.5px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                        selectedZone === 'CHEEKS'
                          ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                          : 'text-[#7E756F] hover:text-[#2D2825]'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      <span>Mejillas</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-[#7E756F] text-center leading-relaxed">
                    💡 Toca los botones o las zonas en la foto para inspeccionar los biomarcadores identificados por la IA.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Clinical Diagnosis & Profile Integration (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-panel p-6 sm:p-8 rounded-[30px] shadow-2xl space-y-5 border border-white/80">
                  
                  {/* ENCABEZADO DEL BIOTIPO: LIMPIO Y DIRECTO */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/70">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-900 border border-emerald-500/25">
                        <span>Diagnóstico Facial Completado</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
                        Tu Biotipo: {faceSkinResult.skinTypeLabel || `Piel ${faceSkinResult.skinTypeEstimate}`}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                        Clasificación Baumann: <strong className="text-slate-800 font-mono">{faceSkinResult.baumannSkinTypeCode || 'ORNT'}</strong> • Fototipo Fitzpatrick: {faceSkinResult.fitzpatrickType || 'III'}
                      </p>
                    </div>

                    {/* Certeza IA Badge */}
                    <div className="self-start sm:self-auto px-4 py-2.5 rounded-2xl glass-subcard border border-emerald-500/30 text-center shadow-xs">
                      <span className="text-2xl font-extrabold text-emerald-800 block leading-none">
                        {Math.round(faceSkinResult.confidence * 100)}%
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mt-0.5">
                        Precisión IA
                      </span>
                    </div>
                  </div>

                  {/* ANÁLISIS DE ZONAS CON BARRAS MÉTRICAS VISUALES (SIN PÁRRAFOS DENSOS) */}
                  {(() => {
                    const isHighShine = faceSkinResult.zoneTAnalysis?.shineLevel === 'HIGH';
                    const isModShine = faceSkinResult.zoneTAnalysis?.shineLevel === 'MODERATE';
                    const sebumPercent = isHighShine ? 85 : isModShine ? 68 : 32;
                    const sebumLabel = isHighShine ? '85% (Alto)' : isModShine ? '68% (Medio-Alto)' : '32% (Controlado)';
                    
                    const poresPercent = faceSkinResult.zoneTAnalysis?.poresVisible ? 55 : 20;
                    const poresLabel = faceSkinResult.zoneTAnalysis?.poresVisible ? 'Visibles' : 'Imperceptibles';
                    
                    const isBalancedHydration = faceSkinResult.cheeksAnalysis?.hydrationState === 'BALANCED';
                    const isDryHydration = faceSkinResult.cheeksAnalysis?.hydrationState === 'DRY';
                    const hydrationPercent = isBalancedHydration ? 84 : isDryHydration ? 35 : 70;
                    const hydrationLabel = isBalancedHydration ? '84% (Óptima)' : isDryHydration ? '35% (Baja / Tirante)' : '70% (Equilibrada)';
                    
                    const hasRedness = faceSkinResult.cheeksAnalysis?.rednessPresent;
                    const rednessPercent = hasRedness ? 45 : 15;
                    const rednessLabel = hasRedness ? 'Leve detectada' : 'Sin rojez visible';

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Card Zona T */}
                        <div
                          onClick={() => setSelectedZone('ZONE_T')}
                          className={`p-5 rounded-3xl glass-subcard space-y-4 border transition cursor-pointer ${
                            selectedZone === 'ZONE_T'
                              ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-sm bg-amber-500/5'
                              : 'border-white hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">☀️</span>
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Zona T (Frente y Nariz)</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 text-xs font-bold">
                              {isHighShine ? 'Brillo Alto' : isModShine ? 'Brillo Moderado' : 'Brillo Bajo'}
                            </span>
                          </div>

                          {/* Métrica 1: Sebo */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>Nivel de Sebo</span>
                              <span className="text-amber-800 font-bold">{sebumLabel}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200/70 overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-500 transition-all duration-500"
                                style={{ width: `${sebumPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Métrica 2: Poros */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>Visibilidad de Poros</span>
                              <span className="text-slate-600 font-bold">{poresLabel}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200/70 overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                                style={{ width: `${poresPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Mejillas */}
                        <div
                          onClick={() => setSelectedZone('CHEEKS')}
                          className={`p-5 rounded-3xl glass-subcard space-y-4 border transition cursor-pointer ${
                            selectedZone === 'CHEEKS'
                              ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm bg-emerald-500/5'
                              : 'border-white hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">🌙</span>
                              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Mejillas & Contorno</h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 text-xs font-bold">
                              {faceSkinResult.cheeksAnalysis?.hydrationState === 'DRY' ? 'Tirante' : 'Equilibrada'}
                            </span>
                          </div>

                          {/* Métrica 1: Hidratación */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>Hidratación de Barrera</span>
                              <span className="text-emerald-800 font-bold">{hydrationLabel}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200/70 overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
                                style={{ width: `${hydrationPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Métrica 2: Rojez */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold text-slate-700">
                              <span>Nivel de Rojez / Eritema</span>
                              <span className="text-emerald-800 font-bold">{rednessLabel}</span>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-200/70 overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${rednessPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3 ACTIVOS CLAVE RECOMENDADOS (EN LUGAR DE LISTA DE PÁRRAFOS) */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Ingredientes Clave Recomendados para tu Piel:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl glass-subcard flex items-center gap-3 border border-white">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                          🧪
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {faceSkinResult.skinTypeEstimate === 'DRY' ? 'Ceramidas NP + AP' : 'Niacinamida 2-5%'}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {faceSkinResult.skinTypeEstimate === 'DRY' ? 'Reparación de barrera' : 'Control de sebo en zona T'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl glass-subcard flex items-center gap-3 border border-white">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
                          🧬
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {faceSkinResult.skinTypeEstimate === 'SENSITIVE' ? 'Centella Asiática (Cica)' : 'Ceramidas NP'}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {faceSkinResult.skinTypeEstimate === 'SENSITIVE' ? 'Calmante vascular' : 'Sellado de barrera'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl glass-subcard flex items-center gap-3 border border-white">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">
                          💧
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {faceSkinResult.skinTypeEstimate === 'DRY' ? 'Ácido Hialurónico' : 'Ácido Salicílico 2%'}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {faceSkinResult.skinTypeEstimate === 'DRY' ? 'Retención de agua' : 'Limpieza de poros'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PRESCRIPCIÓN CURADA EN 3 PASOS SIMPLES (SKIN CYCLING) */}
                  {(() => {
                    const skinKey = faceSkinResult.skinTypeEstimate || 'COMBINATION';
                    const products = CURATED_BIOTYPE_PRODUCTS[skinKey] || CURATED_BIOTYPE_PRODUCTS.COMBINATION;

                    return (
                      <div className="pt-4 border-t border-white/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900">
                              Tu Rutina Sugerida para Skin Cycling
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              3 fórmulas seleccionadas para tu biotipo
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 text-xs font-bold">
                            ✓ 100% Compatibles
                          </span>
                        </div>

                        {/* Product Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          {products.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-2xl glass-subcard border border-white flex flex-col justify-between space-y-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-xl object-cover border border-white shadow-2xs shrink-0"
                                />
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold uppercase text-emerald-800 block truncate">
                                    {item.nightName}
                                  </span>
                                  <h5 className="text-xs font-bold text-slate-900 truncate">
                                    {item.brand} {item.name}
                                  </h5>
                                  <span className="text-[11px] text-slate-500 font-medium block truncate">
                                    {item.activeTag}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onAddProductToShelf({
                                      id: `shelf-${Date.now()}-${item.id}`,
                                      name: item.name,
                                      brand: item.brand,
                                      category: item.category,
                                      volume: '50 ml',
                                      paoMonths: 12,
                                      inciScore: item.matchScore,
                                      primaryActives: [item.activeTag],
                                      assignedPhase: item.night,
                                      assignedPhaseName: item.nightName,
                                      image: item.image,
                                      textureNote: 'Prescripción oficial de Allabout.skin',
                                    });
                                  }}
                                  className="w-full py-1.5 rounded-full text-xs font-bold text-[#1E3A2B] bg-emerald-500/10 hover:bg-emerald-500/20 transition cursor-pointer text-center block"
                                >
                                  Añadir al Neceser
                                </button>

                                <a
                                  href={item.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full py-1 rounded-full text-[11px] font-medium text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <span>Ver en tienda ({item.price})</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Medical Disclaimer */}
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/50 rounded-2xl flex items-start gap-2.5 text-[11.5px] text-amber-900 leading-relaxed">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Aviso médico preventivo:</span> {faceSkinResult.disclaimer}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleAdoptFaceDiagnosis}
                      disabled={adoptedProfileSuccess}
                      className={`w-full py-3.5 rounded-full font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        adoptedProfileSuccess
                          ? 'bg-emerald-800 text-white'
                          : 'glass-button text-white'
                      }`}
                    >
                      {adoptedProfileSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>¡Biotipo ({faceSkinResult.skinTypeEstimate}) Guardado en tu Perfil!</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-200" />
                          <span>Aplicar Diagnóstico a mi Perfil ({faceSkinResult.skinTypeEstimate})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleResetScan}
                      className="w-full py-3.5 rounded-full glass-subcard border border-white text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Camera className="w-4 h-4 text-emerald-800" />
                      <span>Escanear Otra Vez</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* 2.B: PRODUCT RESULT (COSMÉTICO / PRODUCTO DE SKINCARE AUDITADO)       */}
          {/* --------------------------------------------------------------------- */}
          {scanTypeResult === 'PRODUCT' && auditResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Product Header & Score (col-span-5) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="card-white p-5 sm:p-6 border border-[#8FA89B]/50 rounded-[24px] shadow-diffuse-elevated space-y-4">
                  {capturedImagePreview && (
                    <div className="relative w-full aspect-video rounded-[18px] overflow-hidden border border-[#E8E1D7] bg-[#FAF8F5]">
                      <img
                        src={capturedImagePreview}
                        alt="Producto auditado"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10.5px] font-bold uppercase tracking-wider">
                      Auditoría Científica de Producto
                    </span>
                    <h2 className="font-serif text-[22px] sm:text-[24px] font-bold text-[#2D2825] mt-1.5">
                      {auditResult.productName}
                    </h2>
                    <p className="text-[13px] font-sans text-[#7E756F]">
                      {auditResult.brand} • {auditResult.category}
                    </p>
                  </div>

                  {/* Compatibility Score */}
                  <div className="flex items-center justify-between p-4 rounded-[18px] bg-[#FAF8F5] border border-[#E8E1D7]">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-[#7E756F] tracking-wider block">
                        Compatibilidad Skin Cycling
                      </span>
                      <span className="text-[12px] text-[#4A6B5B] font-medium block mt-0.5">
                        Fórmula balanceada para uso continuado
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif text-[30px] font-bold text-[#4A6B5B] block leading-none">
                        {auditResult.compatibilityScore}/100
                      </span>
                      <span className="text-[9.5px] font-sans font-semibold text-[#8FA89B] uppercase">
                        Score Dérmico
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded-[18px] bg-[#FAF8F5] border border-[#E8E1D7] text-[12.5px] text-[#4A433E] leading-relaxed">
                    {auditResult.summary}
                  </div>

                  {/* Assigned Nights */}
                  <div className="flex items-center justify-between p-3.5 rounded-[18px] bg-[#EBF1EE] border border-[#8FA89B]/30 text-[12.5px]">
                    <span className="font-medium text-[#2D4A3E]">
                      Asignación recomendada:
                    </span>
                    <div className="flex gap-1.5">
                      {auditResult.cycleNightsRecommended.map((n) => (
                        <span
                          key={n}
                          className="px-3 py-1 rounded-full bg-[#4A6B5B] text-white font-bold text-[11.5px]"
                        >
                          Noche {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Add to Shelf Button */}
                  <button
                    onClick={handleSaveToShelf}
                    disabled={addedSuccess}
                    className={`w-full py-3.5 rounded-full font-sans font-semibold text-[13.5px] shadow-diffuse transition flex items-center justify-center gap-2 cursor-pointer ${
                      addedSuccess
                        ? 'bg-[#4A6B5B] text-white'
                        : 'bg-[#8FA89B] hover:bg-[#7D978A] text-white'
                    }`}
                  >
                    {addedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>¡Añadido con Éxito a tus Cosméticos de Ciclado!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Añadir a mi Estantería de Ciclado</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* INCI Traffic Light List (col-span-7) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="card-white p-5 sm:p-6 border border-[#8FA89B]/50 rounded-[24px] shadow-diffuse-elevated space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E1D7] pb-3">
                    <h3 className="font-serif text-[18px] font-semibold text-[#2D2825]">
                      Semáforo de Seguridad INCI ({auditResult.ingredients.length} Ingredientes)
                    </h3>
                    <span className="text-[11px] text-[#7E756F]">
                      Indexado con CosIng UE & PubMed
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {/* Safe Ingredients */}
                    {safeIngredients.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#4A6B5B]">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8FA89B]" />
                          <span>🟢 EFICAZ / SEGURO ({safeIngredients.length})</span>
                        </div>
                        <div className="space-y-1">
                          {safeIngredients.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedInciItem(item)}
                              className="p-3 rounded-[14px] bg-[#FAF8F5] border border-[#E8E1D7] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer"
                            >
                              <div>
                                <span className="font-semibold text-[13px] text-[#2D2825] block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-[#7E756F] font-mono">
                                  {item.function}
                                </span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10.5px] font-bold">
                                {item.safetyScore}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hydrating Ingredients */}
                    {hydratingIngredients.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#7A5E43]">
                          <Droplets className="w-3.5 h-3.5 text-[#4A6B5B]" />
                          <span>💧 HIDRATANTE / REPARADOR ({hydratingIngredients.length})</span>
                        </div>
                        <div className="space-y-1">
                          {hydratingIngredients.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedInciItem(item)}
                              className="p-3 rounded-[14px] bg-[#F2ECE4] border border-[#E2D9CD] flex items-center justify-between hover:border-[#8FA89B] transition cursor-pointer"
                            >
                              <div>
                                <span className="font-semibold text-[13px] text-[#2D2825] block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-[#7E756F] font-mono">
                                  {item.function}
                                </span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#4A6B5B] text-[10.5px] font-bold">
                                {item.safetyScore}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Caution Ingredients */}
                    {cautionIngredients.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#943C36]">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#D8A899]" />
                          <span>⚠️ PRECAUCIÓN EN PIEL REACTIVA ({cautionIngredients.length})</span>
                        </div>
                        <div className="space-y-1">
                          {cautionIngredients.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedInciItem(item)}
                              className="p-3 rounded-[14px] bg-[#FAF0ED] border border-[#D8A899]/50 flex items-center justify-between hover:border-[#D8A899] transition cursor-pointer"
                            >
                              <div>
                                <span className="font-semibold text-[13px] text-[#2D2825] block">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-[#70332E]">
                                  {item.function}
                                </span>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-white text-[#943C36] text-[10.5px] font-bold">
                                {item.safetyScore}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* 2.C: INVALID / REJECTION CARD (NO ES ROSTRO NI COSMÉTICO)            */}
          {/* --------------------------------------------------------------------- */}
          {scanTypeResult === 'INVALID' && (
            <div className="max-w-2xl mx-auto card-white p-6 sm:p-8 border border-[#D8A899] rounded-[24px] shadow-diffuse-elevated space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF0ED] border border-[#D8A899] flex items-center justify-center text-[#943C36] shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-[20px] font-semibold text-[#2D2825]">
                    No pudimos clasificar la imagen
                  </h3>
                  <span className="text-[12px] text-[#943C36] font-medium">
                    Imagen no reconocida como cosmético ni rostro
                  </span>
                </div>
              </div>

              {capturedImagePreview && (
                <div className="w-36 h-36 mx-auto rounded-[18px] overflow-hidden border border-[#E8E1D7]">
                  <img
                    src={capturedImagePreview}
                    alt="Foto descartada"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4 rounded-[18px] bg-[#FAF8F5] border border-[#E8E1D7] text-[13px] text-[#4A433E] leading-relaxed text-center">
                {rejectionMessage || 'No detectamos un producto de skincare ni el rostro de una persona en la foto.'}
              </div>

              {/* Friendly Tips Box */}
              <div className="p-4 rounded-[18px] bg-[#F2ECE4] border border-[#E2D9CD] space-y-2.5 text-[12.5px] text-[#2D2825]">
                <span className="font-bold text-[#4A6B5B] uppercase text-[10.5px] tracking-wider block">
                  💡 Consejos para una captura exitosa:
                </span>
                <div className="space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none">🤳</span>
                    <p>
                      <strong>Para evaluar tu piel (Selfie):</strong> Tómate una foto frontal con buena luz natural, sin filtros y con el rostro despejado.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-base leading-none">🧴</span>
                    <p>
                      <strong>Para auditar un cosmético:</strong> Enfoca la etiqueta posterior donde aparece la lista de ingredientes (INCI) o el nombre visible de la marca.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleResetScan}
                  className="py-3.5 px-4 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-semibold text-[13px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Reintentar con Cámara</span>
                </button>
                <button
                  onClick={() => {
                    handleResetScan();
                    setScanMode('upload');
                  }}
                  className="py-3.5 px-4 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] hover:bg-[#F2ECE4] text-[#2D2825] font-semibold text-[13px] shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Subir otra Foto</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STATE 3: CAPTURE / INPUT VIEW (IDLE STATE BEFORE SCANNING)                */}
      {/* ========================================================================= */}
      {!isProcessing && scanTypeResult === null && (
        <div className="space-y-6">
          {/* Header Editorial */}
          <div className="text-center max-w-2xl mx-auto mb-4">
            <span className="text-[11px] font-sans font-bold text-[#4A6B5B] uppercase tracking-widest block">
              Auditor INCI y Diagnóstico Facial con IA
            </span>
            <h1 className="font-serif text-[26px] sm:text-[32px] lg:text-[36px] font-semibold text-[#2D2825] mt-1">
              Escáner Dermatológico y Visión AR
            </h1>
            <p className="text-[13px] sm:text-[14px] font-sans text-[#7E756F] mt-1.5 leading-relaxed">
              Toma una selfie para evaluar tu biotipo cutáneo, enfoca la etiqueta de tu cosmético para auditar ingredientes en tiempo real o sube una fotografía.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {/* Mode Selector Tabs (Cámara Real / Subir Foto / Escribir INCI / Muestras) */}
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-full bg-[#F2ECE4] border border-[#E2D9CD]">
              <button
                onClick={() => setScanMode('camera')}
                className={`py-2.5 rounded-full text-[12px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scanMode === 'camera'
                    ? 'bg-white text-[#4A6B5B] shadow-xs font-semibold'
                    : 'text-[#7E756F] hover:text-[#2D2825]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Cámara</span>
              </button>

              <button
                onClick={() => setScanMode('upload')}
                className={`py-2.5 rounded-full text-[12px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scanMode === 'upload'
                    ? 'bg-white text-[#4A6B5B] shadow-xs font-semibold'
                    : 'text-[#7E756F] hover:text-[#2D2825]'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Subir Foto</span>
              </button>

              <button
                onClick={() => setScanMode('text')}
                className={`py-2.5 rounded-full text-[12px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scanMode === 'text'
                    ? 'bg-white text-[#4A6B5B] shadow-xs font-semibold'
                    : 'text-[#7E756F] hover:text-[#2D2825]'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Pegar INCI</span>
              </button>

              <button
                onClick={() => {
                  setScanMode('preset');
                  setScanTypeResult('PRODUCT');
                  setAuditResult(sampleScanPresets[selectedPresetIndex]);
                }}
                className={`py-2.5 rounded-full text-[12px] font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scanMode === 'preset'
                    ? 'bg-white text-[#4A6B5B] shadow-xs font-semibold'
                    : 'text-[#7E756F] hover:text-[#2D2825]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Muestras</span>
              </button>
            </div>

            {/* MODE 1: REAL CAMERA FEED VIEWPORT */}
            {scanMode === 'camera' && (
              <div className="space-y-3">
                <div className="relative w-full h-[380px] sm:h-[420px] rounded-[24px] overflow-hidden bg-[#1E2822] border-2 border-[#8FA89B] shadow-diffuse-elevated flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* If camera is not active / error */}
                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-black/75 space-y-3">
                      <VideoOff className="w-12 h-12 text-[#8FA89B]" />
                      <p className="text-[13.5px] text-white/90 max-w-sm">
                        {cameraError || 'Iniciando sensor óptico de cámara...'}
                      </p>
                      <button
                        onClick={() => startCamera()}
                        className="px-5 py-2.5 rounded-full bg-[#8FA89B] text-white text-[13px] font-medium cursor-pointer shadow-xs hover:bg-[#7D978A] transition"
                      >
                        Reintentar Acceso a Cámara
                      </button>
                    </div>
                  )}

                  {/* AR Reticle HUD Focus Corners */}
                  <div className="absolute inset-6 pointer-events-none">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-[#8FA89B] rounded-tl-[14px]" />
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-[#8FA89B] rounded-tr-[14px]" />
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-[#8FA89B] rounded-bl-[14px]" />
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-[#8FA89B] rounded-br-[14px]" />

                    {/* Animated Scanning Laser */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#8FA89B] to-transparent shadow-[0_0_12px_#8FA89B] animate-scan-beam" />
                    </div>
                  </div>

                  {/* Live Controls on Camera */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
                    <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono flex items-center gap-1.5 border border-white/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Detección Auto: Selfie o Cosmético
                    </span>

                    <button
                      onClick={toggleCameraFacing}
                      className="p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 transition cursor-pointer"
                      title="Cambiar Cámara Frontal/Trasera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Single Capture CTA Shutter Button */}
                <button
                  onClick={handleCaptureSnapshot}
                  disabled={!isCameraActive || isProcessing}
                  className="w-full py-4 rounded-full bg-[#4A6B5B] hover:bg-[#3D5A4C] disabled:opacity-50 text-white font-sans font-bold text-[15px] shadow-diffuse hover:shadow-diffuse-elevated transition flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-[#8FA89B]/25"
                >
                  <Camera className="w-5 h-5 text-[#DFCAAC]" />
                  <span>Capturar Foto & Diagnosticar</span>
                </button>
              </div>
            )}

            {/* MODE 2: UPLOAD IMAGE FROM GALLERY */}
            {scanMode === 'upload' && (
              <div className="card-white p-6 sm:p-8 border-2 border-dashed border-[#8FA89B] rounded-[24px] text-center space-y-4 shadow-diffuse">
                <div className="w-16 h-16 rounded-full bg-[#EBF1EE] border border-[#8FA89B]/40 flex items-center justify-center text-[#4A6B5B] mx-auto">
                  <Upload className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="font-serif text-[20px] font-semibold text-[#2D2825]">
                    Selecciona una Foto de tu Galería o Archivo
                  </h3>
                  <p className="text-[13px] font-sans text-[#7E756F] max-w-md mx-auto mt-1.5">
                    Sube una selfie para evaluar tu piel o una fotografía de tu cosmético para auditoría de fórmula INCI.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white font-semibold text-[14px] shadow-diffuse transition cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Elegir Foto / Archivo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* MODE 3: MANUAL INCI TEXT INPUT */}
            {scanMode === 'text' && (
              <div className="card-white p-5 sm:p-6 border border-[#E8E1D7] rounded-[24px] space-y-4 shadow-diffuse">
                <div className="flex items-center gap-2 text-[#4A6B5B]">
                  <Edit3 className="w-5 h-5" />
                  <h3 className="font-serif text-[18px] font-semibold text-[#2D2825]">
                    Ingreso Manual o Copiar y Pegar Fórmula
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={manualProductName}
                      onChange={(e) => setManualProductName(e.target.value)}
                      placeholder="Nombre del Producto (ej: Sérum Niacinamida 10%)"
                      className="w-full px-4 py-3 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-[13px] text-[#2D2825] focus:outline-none focus:border-[#8FA89B]"
                    />
                    <input
                      type="text"
                      value={manualBrandName}
                      onChange={(e) => setManualBrandName(e.target.value)}
                      placeholder="Marca Comercial (ej: The Ordinary, CeraVe)"
                      className="w-full px-4 py-3 rounded-full bg-[#FAF8F5] border border-[#E8E1D7] text-[13px] text-[#2D2825] focus:outline-none focus:border-[#8FA89B]"
                    />
                  </div>
                  <textarea
                    rows={5}
                    value={manualInciText}
                    onChange={(e) => setManualInciText(e.target.value)}
                    placeholder="Pega la lista de ingredientes separada por comas (ej: Aqua, Niacinamide, Zinc PCA, Glycerin, Phenoxyethanol, Ethylhexylglycerin...)"
                    className="w-full p-4 rounded-[20px] bg-[#FAF8F5] border border-[#E8E1D7] text-[13px] font-mono text-[#2D2825] focus:outline-none focus:border-[#8FA89B] resize-none leading-relaxed"
                  />
                </div>

                <button
                  onClick={() => runApiInciAudit(manualInciText, manualProductName, manualBrandName)}
                  disabled={!manualInciText.trim() || isProcessing}
                  className="w-full py-3.5 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] disabled:opacity-50 text-white font-semibold text-[14px] shadow-diffuse transition cursor-pointer"
                >
                  {isProcessing ? 'Auditando...' : 'Evaluar Fórmula INCI'}
                </button>
              </div>
            )}

            {/* MODE 4: QUICK PRESETS */}
            {scanMode === 'preset' && (
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase text-[#7E756F] tracking-wider block">
                  Selecciona una Fórmula Predefinida de Ejemplo:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {sampleScanPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setScanTypeResult('PRODUCT');
                        setAuditResult(preset);
                      }}
                      className={`p-4 rounded-[20px] text-left transition cursor-pointer border ${
                        selectedPresetIndex === idx
                          ? 'bg-[#EBF1EE] border-[#8FA89B] shadow-xs'
                          : 'bg-white border-[#E8E1D7] hover:border-[#8FA89B]'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase text-[#7E756F] block">
                        {preset.brand}
                      </span>
                      <h4 className="font-serif text-[16px] font-semibold text-[#2D2825] mt-0.5">
                        {preset.productName}
                      </h4>
                      <span className="text-[11.5px] text-[#4A6B5B] font-medium block mt-1.5">
                        Compatibilidad: {preset.compatibilityScore}% • {preset.ingredients.length} activos
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Informational Guidance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-4 rounded-[20px] border border-[#E8E1D7] space-y-1">
                <span className="text-[12px] font-bold text-[#4A6B5B] flex items-center gap-1.5">
                  🤳 Modo Selfie Facial
                </span>
                <p className="text-[11.5px] text-[#7E756F] leading-relaxed">
                  Identifica automáticamente tu biotipo cutáneo, zonas de brillo en Zona T y niveles de hidratación en mejillas con mapeo AR.
                </p>
              </div>
              <div className="bg-white p-4 rounded-[20px] border border-[#E8E1D7] space-y-1">
                <span className="text-[12px] font-bold text-[#4A6B5B] flex items-center gap-1.5">
                  🧴 Modo Cosmético INCI
                </span>
                <p className="text-[11.5px] text-[#7E756F] leading-relaxed">
                  Audita la fórmula cosmética con taxonomía CosIng UE y PubMed, semáforo de seguridad y asignación de noche de Skin Cycling.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INGREDIENT DETAIL MODAL                                                   */}
      {/* ========================================================================= */}
      {selectedInciItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#FAF8F5] rounded-[24px] border border-[#E8E1D7] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] text-[10.5px] font-bold">
                  {selectedInciItem.category}
                </span>
                <h4 className="font-serif text-[20px] font-semibold text-[#2D2825] mt-1.5">
                  {selectedInciItem.name}
                </h4>
                <p className="text-[12px] font-mono text-[#7E756F]">
                  INCI: {selectedInciItem.inci}
                </p>
              </div>
              <button
                onClick={() => setSelectedInciItem(null)}
                className="p-1.5 rounded-full bg-[#F2ECE4] text-[#7E756F] hover:text-[#2D2825] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[13px] text-[#4A433E] leading-relaxed">
              {selectedInciItem.description}
            </p>

            <div className="grid grid-cols-2 gap-3 text-center text-[12px]">
              <div className="bg-[#F2ECE4] p-3 rounded-[14px]">
                <span className="text-[#7E756F] block text-[11px]">Comedogenicidad</span>
                <span className="font-bold text-[#2D2825] text-[15px]">
                  {selectedInciItem.comedogenicRating} / 5
                </span>
              </div>
              <div className="bg-[#F2ECE4] p-3 rounded-[14px]">
                <span className="text-[#7E756F] block text-[11px]">Citas PubMed</span>
                <span className="font-bold text-[#4A6B5B] text-[15px]">
                  {selectedInciItem.pubmedStudiesCount}+ papers
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInciItem(null)}
              className="w-full py-3 rounded-full bg-[#8FA89B] hover:bg-[#7D978A] text-white text-[13px] font-medium cursor-pointer"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
}