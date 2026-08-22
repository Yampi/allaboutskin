'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Microscope, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Moon, 
  ShieldAlert, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  Activity, 
  Camera, 
  RotateCcw, 
  Search,
  ChevronDown,
  ChevronUp,
  Droplets,
  Zap,
  ArrowRight,
  ShieldCheck,
  Tag,
  Flame,
  HelpCircle,
  X,
  ScanLine,
  Check,
  RefreshCw,
  Info,
  History,
  Calendar as CalendarIcon,
  Leaf,
  Plus,
  ThumbsUp,
  ThumbsDown,
  SlidersHorizontal,
  Bot,
  Send,
  MessageSquare,
  Cpu,
  Wand2
} from 'lucide-react';
import { 
  AuditReport, 
  auditInci, 
  getRecentAudits, 
  saveRecentAudit, 
  clearRecentAudits, 
  RecentAuditItem,
  getStoredRoutineProducts,
  setStoredRoutineProducts,
  saveAuditFeedback,
  saveDailyRoutine,
  getSavedDailyRoutine,
  UserDailyRoutine,
  fetchAiDiagnosis,
  sendCopilotMessage,
  scanImageWithGeminiVision
} from '@/lib/api';
import { UserRoutineProduct } from '@/types/skinCycling';
import { 
  performOpticalCharacterRecognition, 
  analyzeCosmeticLabel, 
  OcrDetectionResult, 
  cleanOcrCosmeticText 
} from '@/lib/ocrService';

const QUICK_PRESETS = [
  {
    label: 'The Ordinary Niacinamida',
    badge: 'Poros & Sebo',
    input: 'The Ordinary Niacinamide 10% + Zinc 1%: Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Tamarindus Indica Seed Gum, Phenoxyethanol.',
    price: 6.50,
  },
  {
    label: "Paula's Choice BHA 2%",
    badge: 'Acné & Puntos Negros',
    input: "Paula's Choice 2% BHA Liquid: Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Green Tea Extract, Sodium Hydroxide.",
    price: 35.00,
  },
  {
    label: 'Hawaiian Tropic Ozono 50+',
    badge: 'Solar / Ozono',
    input: 'Hawaiian Tropic Ozono Duo Defense FPS 50+: Aqua, Homosalate, Octocrylene, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Cetearyl Alcohol, Glycerin, Dimethicone, Phenoxyethanol.',
    price: 14.99,
  },
  {
    label: 'Cicaplast Baume B5+',
    badge: 'Reparador / Cica',
    input: 'La Roche-Posay Cicaplast Baume B5+: Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii Butter, Panthenol, Centella Asiatica, Madecassoside, Zinc Gluconate.',
    price: 18.00,
  },
  {
    label: 'Retinol 0.5% en Escualano',
    badge: 'Renovación Celular',
    input: 'Retinol Anti-Edad: Squalane, Caprylic/Capric Triglyceride, Retinol, Solanum Lycopersicum Fruit Extract, Rosmarinus Officinalis Leaf Extract.',
    price: 9.80,
  }
];

export default function FormulaAuditor() {
  const [omniInput, setOmniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  // AI Gemini Clinical Diagnosis State
  const [aiDiagnosis, setAiDiagnosis] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // AI Skin Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [copilotInput, setCopilotInput] = useState('');
  const [isCopilotSending, setIsCopilotSending] = useState(false);

  // Progressive Disclosure: Additional technical details toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [productPrice, setProductPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');

  // Step 2: Feedback State
  const [feedbackGiven, setFeedbackGiven] = useState<'HELPFUL' | 'NOT_HELPFUL' | null>(null);

  // Step 3: Skin Diagnosis Form State
  const [userSkinType, setUserSkinType] = useState<string>('COMBINATION');
  const [isSkinEvaluated, setIsSkinEvaluated] = useState(false);

  // Step 4: Routine Builder State
  const [routineFrequencyChoice, setRoutineFrequencyChoice] = useState<'DAILY' | 'WEEKLY'>('DAILY');
  const [isRoutineSaved, setIsRoutineSaved] = useState(false);

  // OCR Modal State
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrResult, setOcrResult] = useState<OcrDetectionResult | null>(null);
  const [editableOcrText, setEditableOcrText] = useState('');
  const [ocrEngine, setOcrEngine] = useState<'GEMINI_VISION' | 'LOCAL_OCR'>('GEMINI_VISION');

  // Recent Audits
  const [recentAudits, setRecentAudits] = useState<RecentAuditItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentAudits(getRecentAudits());
  }, []);

  const handleAudit = async (customQuery?: string, customPrice?: number | null) => {
    const query = (customQuery ?? omniInput).trim();
    if (!query) {
      setError('Por favor escribe el nombre de tu cosmético o toma una foto a sus ingredientes.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedbackGiven(null);
    setIsSkinEvaluated(false);
    setIsRoutineSaved(false);

    try {
      const parsedPrice = customPrice !== undefined 
        ? customPrice 
        : (productPrice.trim() ? parseFloat(productPrice) : null);

      let productNameCandidate: string | undefined = undefined;
      let inciTextCandidate = query;

      if (query.includes(':')) {
        const parts = query.split(':');
        productNameCandidate = parts[0].trim();
        inciTextCandidate = parts.slice(1).join(':').trim();
      } else if (!query.includes(',') && !query.includes('+') && !query.includes(';') && !query.includes('\n') && query.length < 60) {
        productNameCandidate = query;
      } else {
        productNameCandidate = query.length < 90 ? query : 'Fórmula Evaluada';
        inciTextCandidate = query;
      }

      const data = await auditInci(
        inciTextCandidate, 
        productNameCandidate, 
        parsedPrice, 
        currency
      );
      
      setReport(data);

      const calculatedScore = Math.min(100, Math.max(45,
        data.ai_clinical_copilot?.friction_risk_level === 'HIGH' ? 55 :
        data.ai_clinical_copilot?.friction_risk_level === 'MODERATE' ? 72 :
        data.ai_clinical_copilot?.barrier_warning ? 84 : 95
      ));

      const ratingLabel = calculatedScore >= 88 ? 'Excelente' : calculatedScore >= 70 ? 'Seguro' : 'Precaución';

      saveRecentAudit({
        id: 'audit_' + Date.now(),
        query,
        productName: data.meta?.product_name || productNameCandidate || query,
        brandName: data.meta?.brand_name,
        safetyScore: calculatedScore,
        safetyRating: ratingLabel,
        cleanIngredientsCount: data.meta?.active_ingredients_count || 0,
        totalIngredientsCount: data.meta?.total_ingredients_count || 0,
        formatType: data.ai_clinical_copilot?.format_type,
        auditedAt: new Date().toISOString(),
        price: parsedPrice,
        currency
      });
      setRecentAudits(getRecentAudits());

      // Fetch AI Clinical Diagnosis in Background
      setIsAiLoading(true);
      fetchAiDiagnosis({
        inci_text: inciTextCandidate,
        skin_type: userSkinType,
        product_name: data.meta?.product_name || productNameCandidate
      })
        .then((aiRes) => {
          setAiDiagnosis(aiRes);
          setCopilotMessages([
            {
              role: 'assistant',
              content: `¡Hola! Soy tu Copiloto Clínico IA. He analizado la fórmula de **${data.meta?.product_name || productNameCandidate || 'este producto'}** para piel **${userSkinType}**. ¿Tienes dudas sobre cómo combinarlo con otros productos, su orden de aplicación o precauciones?`
            }
          ]);
        })
        .catch((err) => console.warn('AI Diagnosis warning:', err))
        .finally(() => setIsAiLoading(false));

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      setError(err.message || 'No pudimos procesar la fórmula. Revisa el texto o escribe el nombre del producto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setOmniInput('');
    setProductPrice('');
    setReport(null);
    setAiDiagnosis(null);
    setCopilotMessages([]);
    setError(null);
    setFeedbackGiven(null);
    setIsSkinEvaluated(false);
    setIsRoutineSaved(false);
  };

  const handleSendCopilotMessage = async (customQ?: string) => {
    const q = (customQ || copilotInput).trim();
    if (!q || !report) return;

    const newHistory = [...copilotMessages, { role: 'user' as const, content: q }];
    setCopilotMessages(newHistory);
    setCopilotInput('');
    setIsCopilotSending(true);

    try {
      const res = await sendCopilotMessage({
        question: q,
        inci_text: report.meta.product_name + ': ' + report.ingredients_breakdown.map(i => i.inci_name).join(', '),
        product_name: report.meta.product_name,
        skin_type: userSkinType,
        history: copilotMessages.slice(-6)
      });

      setCopilotMessages([...newHistory, { role: 'assistant', content: res.answer }]);
    } catch (err: any) {
      setCopilotMessages([...newHistory, { role: 'assistant', content: 'Lo sentimos, no pudimos procesar tu consulta en este momento.' }]);
    } finally {
      setIsCopilotSending(false);
    }
  };

  const handleFeedback = (isHelpful: boolean) => {
    if (!report) return;
    setFeedbackGiven(isHelpful ? 'HELPFUL' : 'NOT_HELPFUL');
    saveAuditFeedback(report.meta.product_name, isHelpful, userSkinType);
    setIsSkinEvaluated(true);
  };

  // Determine Routine Step & Category of the audited product
  const getProductStepInfo = () => {
    if (!report) return { stepNumber: 2, stepName: 'Tratamiento / Sérum', category: 'EXFOLIANT', timing: 'PM' as const };
    const name = report.meta.product_name.toLowerCase();
    const timing = report.layering_and_usage.recommended_timing === 'AM' ? 'AM' as const :
                   report.layering_and_usage.recommended_timing === 'PM' ? 'PM' as const : 'BOTH' as const;

    if (name.includes('limpiad') || name.includes('cleanser') || name.includes('gel de baño') || name.includes('agua micelar') || name.includes('toalla')) {
      return { stepNumber: 1, stepName: 'Paso 1: Limpieza Facial', category: 'CLEANSER', timing };
    }
    if (name.includes('solar') || name.includes('spf') || name.includes('fps') || name.includes('sunscreen') || name.includes('ozono')) {
      return { stepNumber: 4, stepName: 'Paso 4: Fotoprotección (SPF)', category: 'SPF', timing: 'AM' as const };
    }
    if (name.includes('crema') || name.includes('hidrat') || name.includes('baume') || name.includes('balsamo') || name.includes('lotion') || name.includes('moistur')) {
      return { stepNumber: 3, stepName: 'Paso 3: Hidratación & Sellado de Barrera', category: 'MOISTURIZER', timing };
    }
    if (name.includes('retin')) {
      return { stepNumber: 2, stepName: 'Paso 2: Tratamiento Renovador Nocturno', category: 'RETINOID', timing: 'PM' as const };
    }
    return { stepNumber: 2, stepName: 'Paso 2: Activo Concentrado / Tratamiento', category: 'EXFOLIANT', timing };
  };

  // Generate complementary routine steps
  const getComplementaryRoutine = () => {
    const current = getProductStepInfo();
    const isDay = current.timing === 'AM';

    const steps = [
      {
        stepNumber: 1,
        stepName: 'Limpieza',
        productName: current.stepNumber === 1 ? report?.meta.product_name || 'Limpiador suave' : 'Gel Limpiador Suave con pH 5.5',
        brand: current.stepNumber === 1 ? report?.meta.brand_name || 'Tu producto' : 'CeraVe / Bioderma',
        isCurrentProduct: current.stepNumber === 1,
      },
      {
        stepNumber: 2,
        stepName: 'Tratamiento Activo',
        productName: current.stepNumber === 2 ? report?.meta.product_name || 'Tratamiento Activo' : 'Sérum Hidratante / Reparador',
        brand: current.stepNumber === 2 ? report?.meta.brand_name || 'Tu producto' : 'The Ordinary / Paula\'s Choice',
        isCurrentProduct: current.stepNumber === 2,
      },
      {
        stepNumber: 3,
        stepName: 'Hidratación de Barrera',
        productName: current.stepNumber === 3 ? report?.meta.product_name || 'Crema Hidratante' : 'Crema con Ceramidas & Ácido Hialurónico',
        brand: current.stepNumber === 3 ? report?.meta.brand_name || 'Tu producto' : 'La Roche-Posay / CeraVe',
        isCurrentProduct: current.stepNumber === 3,
      },
      {
        stepNumber: 4,
        stepName: isDay ? 'Fotoprotección Diurna' : 'Sellado Nocturno',
        productName: current.stepNumber === 4 ? report?.meta.product_name || 'Protector Solar FPS 50+' : (isDay ? 'Protector Solar Fluido FPS 50+' : 'Bálsamo Calmante Cica'),
        brand: current.stepNumber === 4 ? report?.meta.brand_name || 'Tu producto' : (isDay ? 'Eucerin / Isdin' : 'Cicaplast B5+'),
        isCurrentProduct: current.stepNumber === 4,
      }
    ];

    return steps;
  };

  const handleSaveRoutineConfig = () => {
    if (!report) return;
    const stepInfo = getProductStepInfo();
    const existingRoutineProducts = getStoredRoutineProducts();

    // 1. Save product into routine products
    const newRoutineProduct = {
      id: 'prod_' + Math.random().toString(36).substring(7),
      phaseId: stepInfo.stepNumber === 2 && stepInfo.category === 'RETINOID' ? 2 : stepInfo.stepNumber === 2 ? 1 : 3,
      productName: report.meta.product_name,
      brand: report.meta.brand_name || undefined,
      category: stepInfo.category as any,
    };

    setStoredRoutineProducts([
      ...existingRoutineProducts.filter((p: UserRoutineProduct) => p.productName !== newRoutineProduct.productName),
      newRoutineProduct
    ]);

    // 2. Save structured daily routine
    const complementary = getComplementaryRoutine();
    const dailyRoutineData: UserDailyRoutine = {
      skinType: userSkinType,
      isDailyFixed: routineFrequencyChoice === 'DAILY',
      steps: complementary.map(c => ({
        stepNumber: c.stepNumber,
        stepName: c.stepName,
        productName: c.productName,
        brand: c.brand,
        timing: stepInfo.timing,
      })),
      updatedAt: new Date().toISOString(),
    };
    saveDailyRoutine(dailyRoutineData);
    setIsRoutineSaved(true);
  };

  // OCR & Gemini Vision Camera Handler
  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    setOcrImagePreview(previewUrl);
    setIsOcrModalOpen(true);
    setIsOcrScanning(true);
    setOcrProgress(0.1);
    setOcrStatusText(ocrEngine === 'GEMINI_VISION' ? 'Analizando envase con Gemini Vision...' : 'Analizando imagen del cosmético...');
    setOcrResult(null);
    setEditableOcrText('');

    try {
      if (ocrEngine === 'GEMINI_VISION') {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            setOcrStatusText('Extrayendo lista INCI con IA...');
            const scanData = await scanImageWithGeminiVision(base64Data, file.type || 'image/jpeg');
            
            const detectedName = scanData.productName ? `${scanData.brand ? `${scanData.brand} ` : ''}${scanData.productName}` : '';
            const detectedInci = scanData.inciText || scanData.rawDetectedText || '';
            const combined = detectedName ? `${detectedName}: ${detectedInci}` : detectedInci;
            
            setEditableOcrText(combined);
            setOcrResult({
              cleanedText: combined,
              detectedProductName: detectedName || undefined,
              confidence: scanData.confidence || 0.95,
              rawText: scanData.rawDetectedText || '',
              labelType: 'INCI_BACK_PANEL'
            } as any);
          } catch (err: any) {
            console.warn('Gemini vision fallback to local OCR:', err);
            await runLocalOcr(file);
          } finally {
            setIsOcrScanning(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        await runLocalOcr(file);
      }
    } catch (err: any) {
      setOcrStatusText('Error al leer imagen');
      setError('No pudimos leer la foto con claridad. Intenta con mejor luz o escribe el nombre.');
      setIsOcrScanning(false);
    }
  };

  const runLocalOcr = async (file: File) => {
    const recognizedText = await performOpticalCharacterRecognition(file, (prog, status) => {
      setOcrProgress(prog);
      setOcrStatusText(status);
    });

    const analysis = analyzeCosmeticLabel(recognizedText);
    setOcrResult(analysis);

    if (analysis.labelType === 'FRONT_BRANDING' && analysis.suggestedOfficialInci) {
      setEditableOcrText(`${analysis.detectedProductName || 'Producto'}: ${analysis.suggestedOfficialInci}`);
    } else {
      setEditableOcrText(analysis.cleanedText || cleanOcrCosmeticText(recognizedText));
    }
    setIsOcrScanning(false);
  };

  const handleConfirmOcrAudit = () => {
    setIsOcrModalOpen(false);
    const finalQuery = editableOcrText.trim() || (ocrResult?.cleanedText ?? '');
    setOmniInput(finalQuery);
    handleAudit(finalQuery, ocrResult?.detectedPrice ?? null);
  };

  // Evaluate Skin Compatibility text
  const getSkinCompatibilityAnalysis = () => {
    if (!report) return null;
    const isSensitive = userSkinType === 'SENSITIVE';
    const isOily = userSkinType === 'OILY' || userSkinType === 'ACNE_PRONE';

    const hasIrritants = report.safety_and_skin_tolerance.flagged_irritant_ingredients.length > 0;
    const hasComedogenic = report.safety_and_skin_tolerance.max_comedogenic_score >= 3;

    if (isSensitive && hasIrritants) {
      return {
        badge: 'Uso con Cautela',
        badgeColor: 'bg-[#F8EFEA] text-[#A46864] border-[#E8D5D0]',
        message: `Para tu piel sensible o reactiva, este producto tiene ingredientes que pueden causar ligera tirantez. Se recomienda hacer prueba de parche y combinarlo siempre con crema reparadora.`,
      };
    }

    if (isOily && hasComedogenic) {
      return {
        badge: 'Atención a Poros',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        message: `Para tu piel grasa o mixta, contiene activos algo oclusivos. Aplica poca cantidad para no obstruir los poros en la zona T.`,
      };
    }

    return {
      badge: 'Altamente Compatible',
      badgeColor: 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30',
      message: `¡Excelente compatibilidad con tu biotipo! Los ingredientes activos apoyan el equilibrio de tu piel sin saturar la barrera hidrolipídica.`,
    };
  };

  const skinCompat = getSkinCompatibilityAnalysis();
  const stepInfo = getProductStepInfo();
  const complementarySteps = getComplementaryRoutine();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. HERO SEARCH / OCR SCANNER CARD */}
      <div className="bg-[#FFFFFF] rounded-3xl shadow-beauty border border-[#EFECE6] p-6 sm:p-8 transition-all duration-300">
        <div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
          <span className="text-[10px] font-bold text-[#7A9A8B] uppercase tracking-widest bg-[#EFF5F1] px-3 py-1 rounded-full border border-[#7A9A8B]/20">
            Ciencia Cosmética & Respaldo INCI
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2B2A29] tracking-tight">
            Descubre la verdad de tu producto
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6A66]">
            Toma una foto o escribe el nombre para comprobar si cumple lo que promete o es solo publicidad.
          </p>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#FAF8F5] focus-within:bg-[#FFFFFF] rounded-2xl sm:rounded-full border border-[#EFECE6] focus-within:border-[#7A9A8B] focus-within:ring-4 focus-within:ring-[#7A9A8B]/10 shadow-xs transition-all duration-300 p-2 sm:p-2.5 gap-2.5">
            
            <div className="hidden sm:flex items-center pl-3 text-[#7A9A8B]">
              <Search className="w-4 h-4" />
            </div>

            <textarea
              rows={omniInput.length > 80 ? 2 : 1}
              value={omniInput}
              onChange={(e) => setOmniInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAudit();
                }
              }}
              placeholder="Escribe el nombre del cosmético o pega su lista de ingredientes..."
              className="w-full bg-transparent px-3 py-2 text-[#2B2A29] text-sm sm:text-base placeholder:text-[#9C9790] focus:outline-none resize-none leading-relaxed font-sans"
            />

            {omniInput && (
              <button
                type="button"
                onClick={handleClear}
                className="hidden sm:flex p-2 text-[#9C9790] hover:text-[#2B2A29] rounded-full transition-colors self-center"
                title="Limpiar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EFECE6]">
              {/* Photo OCR Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 text-xs font-bold bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#2B2A29] border border-[#EFECE6] shadow-xs px-4 py-2.5 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
                title="Tomar foto al envase o ingredientes"
              >
                <Camera className="w-4 h-4 text-[#7A9A8B]" />
                <span>Tomar Foto</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCameraCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* Evaluate Button */}
              <button
                type="button"
                onClick={() => handleAudit()}
                disabled={isLoading || !omniInput.trim()}
                className="flex-grow sm:flex-grow-0 bg-[#7A9A8B] hover:bg-[#688879] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-full shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all duration-200 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Example Presets Pills */}
        <div className="mt-4 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
          <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#C4A482]" />
            Ejemplos:
          </span>
          {QUICK_PRESETS.slice(0, 4).map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setOmniInput(preset.input);
                if (preset.price) setProductPrice(preset.price.toString());
                handleAudit(preset.input, preset.price);
              }}
              className="text-[11px] bg-[#FAF8F5] hover:bg-[#EFF5F1] hover:text-[#4F6D60] text-[#6E6A66] font-medium px-3 py-1 rounded-full border border-[#EFECE6] transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* OCR MODAL */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B2A29]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#EFECE6] w-full max-w-lg overflow-hidden my-auto">
            <div className="bg-[#4F6D60] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ScanLine className="w-5 h-5 text-[#A3B899]" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base font-serif">Foto de tu Cosmético</h3>
                  <p className="text-[11px] text-white/80">Reconociendo fórmula o nombre comercial</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Engine Switcher */}
            <div className="px-5 pt-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#6E6A66] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#7A9A8B]" />
                Motor de Escaneo:
              </span>
              <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1 rounded-full border border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setOcrEngine('GEMINI_VISION')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                    ocrEngine === 'GEMINI_VISION'
                      ? 'bg-[#4F6D60] text-white shadow-2xs'
                      : 'text-[#6E6A66] hover:text-[#2B2A29]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#A3B899]" />
                  <span>Gemini Vision IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOcrEngine('LOCAL_OCR')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition ${
                    ocrEngine === 'LOCAL_OCR'
                      ? 'bg-[#4F6D60] text-white shadow-2xs'
                      : 'text-[#6E6A66] hover:text-[#2B2A29]'
                  }`}
                >
                  <span>OCR Local</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#EFECE6] bg-[#FAF8F5] h-44 flex items-center justify-center">
                {ocrImagePreview && (
                  <img
                    src={ocrImagePreview}
                    alt="Foto del producto"
                    className={`h-full w-full object-contain ${isOcrScanning ? 'opacity-70 blur-[0.5px]' : ''}`}
                  />
                )}
                {isOcrScanning && (
                  <div className="absolute inset-0 bg-[#4F6D60]/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <Activity className="w-7 h-7 text-white animate-spin mb-2" />
                    <span className="text-white font-bold text-xs">{ocrStatusText}</span>
                  </div>
                )}
              </div>

              {!isOcrScanning && ocrResult && (
                <div className="space-y-2">
                  <div className="p-3 bg-[#EFF5F1] border border-[#7A9A8B]/30 rounded-2xl flex items-center gap-2.5 text-xs text-[#4F6D60]">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Texto reconocido con éxito. Puedes editarlo o pulsar Evaluar.</span>
                  </div>
                  <textarea
                    rows={3}
                    value={editableOcrText}
                    onChange={(e) => setEditableOcrText(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl p-2.5 text-xs text-[#2B2A29] focus:bg-[#FFFFFF] focus:border-[#7A9A8B] focus:outline-none"
                    placeholder="Texto detectado..."
                  />
                </div>
              )}
            </div>

            <div className="bg-[#FAF8F5] p-4 border-t border-[#EFECE6] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOcrModalOpen(false)}
                className="text-xs font-semibold text-[#6E6A66] px-4 py-2 rounded-full hover:bg-[#EFECE6] transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isOcrScanning || !editableOcrText.trim()}
                onClick={handleConfirmOcrAudit}
                className="bg-[#7A9A8B] hover:bg-[#688879] disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluar Fórmula</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-[#F8EFEA] border border-[#E8D5D0] text-[#A46864] rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-[#A46864] flex-shrink-0 mt-0.5" />
          <div className="text-xs font-medium">
            <span className="font-bold">Nota: </span>{error}
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY & GUIDED FLOW */}
      <div ref={resultsRef}>
        {report && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* ======================================================== */}
            {/* PASO 1: RESUMEN DE COMPONENTES & PUBLICIDAD VS CIENCIA   */}
            {/* ======================================================== */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6">
              
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#EFF5F1] text-[#4F6D60] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#7A9A8B]/30">
                      Análisis de Veracidad
                    </span>
                    <span className="text-xs text-[#9C9790]">
                      {report.meta.total_ingredients_count} ingredientes analizados
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2B2A29]">
                    {report.meta.product_name}
                  </h3>
                  {report.meta.brand_name && (
                    <p className="text-xs text-[#6E6A66] font-medium">Marca / Fabricante: {report.meta.brand_name}</p>
                  )}
                </div>

                <button
                  onClick={handleClear}
                  className="self-start sm:self-center text-xs font-semibold text-[#6E6A66] hover:text-[#2B2A29] bg-[#FAF8F5] px-3.5 py-1.5 rounded-full border border-[#EFECE6] transition"
                >
                  Nueva consulta
                </button>
              </div>

              {/* CARD: ¿PUBLICIDAD O RESPALDO CIENTÍFICO REAL? */}
              <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F5F1EA] rounded-2xl p-5 border border-[#EFECE6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A9A8B] flex items-center gap-1.5">
                    <Microscope className="w-4 h-4" />
                    ¿Es solo publicidad o tiene respaldo real?
                  </span>
                  <span className="text-[10px] font-bold bg-[#FFFFFF] px-2.5 py-0.5 rounded-full border border-[#EFECE6] text-[#4F6D60]">
                    Evidencia Grado {report.scientific_evidence.overall_evidence_grade}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#2B2A29] leading-relaxed">
                  {report.ai_clinical_copilot.plain_language_summary}
                </p>

                {/* Activos Clave Detectados */}
                <div className="pt-2 border-t border-[#EFECE6]/80 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#9C9790]">Activos funcionales:</span>
                  {report.clinical_indications.slice(0, 3).map((ind, i) => (
                    <span key={i} className="text-[11px] font-semibold bg-[#FFFFFF] text-[#4F6D60] px-2.5 py-1 rounded-full border border-[#7A9A8B]/30 shadow-2xs">
                      ✓ {ind.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Collapsible: Ficha Técnica & Desglose Completo INCI */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full text-xs font-bold text-[#7A9A8B] hover:text-[#4F6D60] py-2.5 px-4 rounded-xl bg-[#EFF5F1]/60 hover:bg-[#EFF5F1] transition flex items-center justify-between border border-[#7A9A8B]/20"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    {showTechnicalDetails ? 'Ocultar Ficha Técnica INCI y Estudios' : 'Ver Ficha Técnica INCI, Estudios PubMed y Conflictos'}
                  </span>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTechnicalDetails && (
                  <div className="mt-4 p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] space-y-4 animate-in fade-in">
                    {/* Layering & Chemical Conflicts */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#2B2A29] uppercase tracking-wider">Regla de Aplicación:</h4>
                      <p className="text-xs text-[#6E6A66]">{report.layering_and_usage.layering_rule}</p>
                      {report.chemical_conflicts.length > 0 && (
                        <div className="p-3 bg-[#F8EFEA] border border-[#E8D5D0] rounded-xl text-xs text-[#A46864] space-y-1">
                          <span className="font-bold">⚠️ Precaución de mezcla:</span>
                          {report.chemical_conflicts.map((c, idx) => (
                            <p key={idx}>No mezclar en la misma noche con {c.ingredient_b}.</p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* INCI Table Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#2B2A29] uppercase tracking-wider">Desglose INCI ({report.ingredients_breakdown.length} componentes):</h4>
                      <div className="max-h-48 overflow-y-auto divide-y divide-[#EFECE6] text-xs">
                        {report.ingredients_breakdown.map((item, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between">
                            <span className={`font-medium ${item.is_active ? 'text-[#4F6D60] font-bold' : 'text-[#6E6A66]'}`}>
                              {item.position}. {item.inci_name} {item.common_name ? `(${item.common_name})` : ''}
                            </span>
                            <span className="text-[10px] text-[#9C9790]">
                              Comedogénico: {item.comedogenic_rating}/5
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* SECCIÓN IA: VEREDICTO CLÍNICO PERSONALIZADO (GEMINI)     */}
            {/* ======================================================== */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#7A9A8B]/30 shadow-beauty space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EFF5F1] to-transparent rounded-bl-full pointer-events-none opacity-60" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFECE6] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center shadow-2xs">
                    <Sparkles className="w-5 h-5 text-[#7A9A8B]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-[#2B2A29] flex items-center gap-2">
                      Veredicto Clínico por IA
                      <span className="text-[10px] font-sans font-bold bg-[#EFF5F1] text-[#4F6D60] px-2.5 py-0.5 rounded-full border border-[#7A9A8B]/30">
                        Google Gemini
                      </span>
                    </h3>
                    <p className="text-xs text-[#6E6A66]">
                      Diagnóstico bioquímico y compatibilidad dermatológica avanzada
                    </p>
                  </div>
                </div>

                {aiDiagnosis?.suitabilityScore && (
                  <div className="flex items-center gap-2 bg-[#FAF8F5] px-3.5 py-1.5 rounded-2xl border border-[#EFECE6] self-start sm:self-auto">
                    <span className="text-[11px] font-bold text-[#9C9790]">Afinidad Dérmica:</span>
                    <span className="text-sm font-bold text-[#4F6D60]">{aiDiagnosis.suitabilityScore}%</span>
                  </div>
                )}
              </div>

              {isAiLoading && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <Activity className="w-7 h-7 text-[#7A9A8B] animate-spin" />
                  <p className="text-xs text-[#6E6A66] font-medium">
                    Consultando modelo dermatológico de Google Gemini...
                  </p>
                </div>
              )}

              {!isAiLoading && aiDiagnosis && (
                <div className="space-y-5">
                  {/* Headline & Clinical Verdict */}
                  <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#EFECE6] space-y-2">
                    <h4 className="font-bold text-sm text-[#2B2A29] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#7A9A8B]" />
                      {aiDiagnosis.headline}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#4F4B47] leading-relaxed whitespace-pre-line">
                      {aiDiagnosis.clinicalVerdict}
                    </p>
                  </div>

                  {/* Skin Type Compatibility Matrix */}
                  {aiDiagnosis.skinTypeMatch && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#9C9790] block">
                        Compatibilidad por Biotipo Cutáneo:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { label: 'Piel Seca', val: aiDiagnosis.skinTypeMatch.dry },
                          { label: 'Piel Grasa', val: aiDiagnosis.skinTypeMatch.oily },
                          { label: 'Piel Mixta', val: aiDiagnosis.skinTypeMatch.combination },
                          { label: 'Sensible', val: aiDiagnosis.skinTypeMatch.sensitive },
                          { label: 'Tendencia Acné', val: aiDiagnosis.skinTypeMatch.acneProne },
                        ].map((m, idx) => {
                          const isGreat = m.val === 'EXCELLENT' || m.val === 'GOOD';
                          const isCaution = m.val === 'CAUTION' || m.val === 'AVOID';
                          return (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border text-center text-xs ${
                                isGreat
                                  ? 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/30'
                                  : isCaution
                                  ? 'bg-[#F8EFEA] text-[#A46864] border-[#E8D5D0]'
                                  : 'bg-[#FAF8F5] text-[#6E6A66] border-[#EFECE6]'
                              }`}
                            >
                              <span className="font-bold block text-[11px]">{m.label}</span>
                              <span className="text-[10px] font-medium opacity-90">
                                {m.val === 'EXCELLENT' ? 'Excelente' : m.val === 'GOOD' ? 'Adecuado' : m.val === 'CAUTION' ? 'Precaución' : m.val === 'AVOID' ? 'Evitar' : 'Neutro'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Layering & Pairings */}
                  {aiDiagnosis.layeringAdvice && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6] space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F6D60] flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#7A9A8B]" />
                          Combinar favorablemente con:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiDiagnosis.layeringAdvice.combineWith?.map((c: string, i: number) => (
                            <span key={i} className="text-[11px] bg-[#FFFFFF] text-[#2B2A29] px-2.5 py-1 rounded-lg border border-[#EFECE6] font-medium">
                              + {c}
                            </span>
                          )) || <span className="text-xs text-[#9C9790]">Hidratantes neutros</span>}
                        </div>
                      </div>

                      <div className="p-4 bg-[#F8EFEA]/70 rounded-2xl border border-[#E8D5D0] space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#A46864] flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#A46864]" />
                          Evitar aplicar simultáneamente con:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiDiagnosis.layeringAdvice.avoidCombiningWith?.map((a: string, i: number) => (
                            <span key={i} className="text-[11px] bg-[#FFFFFF] text-[#A46864] px-2.5 py-1 rounded-lg border border-[#E8D5D0] font-medium">
                              ✕ {a}
                            </span>
                          )) || <span className="text-xs text-[#9C9790]">Sin colisiones críticas</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instructions Bar */}
                  {aiDiagnosis.layeringAdvice && (
                    <div className="p-3.5 bg-[#EFF5F1]/80 rounded-2xl border border-[#7A9A8B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#4F6D60]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7A9A8B] shrink-0" />
                        <span><strong>Momento & Frecuencia:</strong> {aiDiagnosis.layeringAdvice.timing === 'AM' ? '☀️ Solo Mañanas (AM)' : aiDiagnosis.layeringAdvice.timing === 'PM' ? '🌙 Solo Noches (PM)' : '☀️/🌙 Mañanas y Noches'} — {aiDiagnosis.layeringAdvice.frequency}</span>
                      </div>
                      <span className="text-[10px] text-[#7A9A8B] font-medium self-end sm:self-auto">{aiDiagnosis.modelUsed || 'Gemini Flash'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* SECCIÓN IA: COPILOTO DERMATOLÓGICO INTERACTIVO (CHAT)    */}
            {/* ======================================================== */}
            <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-5">
              <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#7A9A8B]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#2B2A29]">
                      Copiloto Clínico Interactivo
                    </h3>
                    <p className="text-xs text-[#6E6A66]">
                      Hazle preguntas sobre compatibilidad, orden o dudas de uso
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9C9790] block">
                  Preguntas frecuentes sugeridas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '¿Puedo usarlo con Retinol?',
                    '¿En qué orden lo aplico en mi rutina?',
                    '¿Es seguro para piel sensible o rosácea?',
                    '¿Puedo combinarlo con Vitamina C?'
                  ].map((presetQ, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={isCopilotSending}
                      onClick={() => handleSendCopilotMessage(presetQ)}
                      className="text-xs bg-[#FAF8F5] hover:bg-[#EFF5F1] hover:text-[#4F6D60] text-[#6E6A66] font-medium px-3 py-1.5 rounded-full border border-[#EFECE6] transition active:scale-95 cursor-pointer text-left"
                    >
                      {presetQ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Messages Transcript */}
              {copilotMessages.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFECE6]">
                  {copilotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4 text-[#7A9A8B]" />
                        </div>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#4F6D60] text-white rounded-br-xs'
                            : 'bg-[#FFFFFF] text-[#2B2A29] border border-[#EFECE6] shadow-2xs rounded-bl-xs whitespace-pre-line'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isCopilotSending && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-7 h-7 rounded-full bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4 text-[#7A9A8B] animate-spin" />
                      </div>
                      <div className="p-3 bg-[#FFFFFF] border border-[#EFECE6] rounded-2xl text-xs text-[#9C9790] italic">
                        El copiloto está analizando la fórmula...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendCopilotMessage();
                    }
                  }}
                  disabled={isCopilotSending}
                  placeholder="Escribe tu duda dermatológica sobre este producto..."
                  className="flex-grow bg-[#FAF8F5] focus:bg-[#FFFFFF] border border-[#EFECE6] focus:border-[#7A9A8B] rounded-full px-4 py-2.5 text-xs text-[#2B2A29] focus:outline-none transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleSendCopilotMessage()}
                  disabled={isCopilotSending || !copilotInput.trim()}
                  className="bg-[#7A9A8B] hover:bg-[#688879] disabled:opacity-50 text-white p-2.5 rounded-full shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
                  title="Enviar consulta"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PASO 2: ENCUESTA DE UTILIDAD & CERTIFICACIÓN DE RESULTADOS */}
            {/* ======================================================== */}
            <div className="bg-[#FFFFFF] rounded-3xl p-5 sm:p-6 border border-[#EFECE6] shadow-beauty space-y-3 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-wider block">
                    Confiabilidad & UX
                  </span>
                  <h4 className="text-sm sm:text-base font-serif font-bold text-[#2B2A29]">
                    ¿Te pareció útil esta información?
                  </h4>
                  <p className="text-xs text-[#6E6A66]">
                    Tu respuesta nos ayuda a certificar la confiabilidad de los análisis.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback(true)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target ${
                      feedbackGiven === 'HELPFUL'
                        ? 'bg-[#4F6D60] text-white shadow-xs'
                        : 'bg-[#EFF5F1] text-[#4F6D60] hover:bg-[#E2ECE5] border border-[#7A9A8B]/30'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Sí, muy útil</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFeedback(false)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer touch-target ${
                      feedbackGiven === 'NOT_HELPFUL'
                        ? 'bg-[#A46864] text-white shadow-xs'
                        : 'bg-[#FAF8F5] text-[#6E6A66] hover:bg-[#F2EFE9] border border-[#EFECE6]'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No mucho</span>
                  </button>
                </div>
              </div>

              {feedbackGiven && (
                <div className="p-3 bg-[#EFF5F1] border border-[#7A9A8B]/30 rounded-2xl text-xs text-[#4F6D60] flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#7A9A8B] shrink-0" />
                  <span>¡Muchas gracias por tu valoración! Hemos certificado este reporte.</span>
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* PASO 3: DIAGNÓSTICO DE PIEL (¿ES ADECUADO PARA TI?)      */}
            {/* ======================================================== */}
            {(feedbackGiven || isSkinEvaluated) && (
              <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#EFECE6] shadow-beauty space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#2B2A29]">
                      ¿Es adecuado para tu tipo de piel?
                    </h4>
                    <p className="text-xs text-[#6E6A66]">
                      Selecciona tu tipo de piel para comprobar si esta fórmula es compatible contigo:
                    </p>
                  </div>
                </div>

                {/* Skin Type Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: 'COMBINATION', label: 'Mixta', desc: 'Zona T con brillo' },
                    { id: 'OILY', label: 'Grasa', desc: 'Tendencia a sebo' },
                    { id: 'DRY', label: 'Seca', desc: 'Tirantez u opaca' },
                    { id: 'SENSITIVE', label: 'Sensible', desc: 'Se enrojece fácil' },
                    { id: 'NORMAL', label: 'Normal', desc: 'Equilibrada' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setUserSkinType(type.id)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer touch-target ${
                        userSkinType === type.id
                          ? 'bg-[#EFF5F1] border-[#7A9A8B] ring-2 ring-[#7A9A8B]/20 text-[#4F6D60]'
                          : 'bg-[#FAF8F5] border-[#EFECE6] hover:bg-[#F5F2EC] text-[#2B2A29]'
                      }`}
                    >
                      <span className="text-xs font-bold block">{type.label}</span>
                      <span className="text-[10px] text-[#9C9790] block mt-0.5">{type.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Compatibility Result */}
                {skinCompat && (
                  <div className={`p-4 rounded-2xl border ${skinCompat.badgeColor} space-y-1.5 animate-in fade-in`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/70 border border-current inline-block">
                      {skinCompat.badge}
                    </span>
                    <p className="text-xs leading-relaxed font-medium">
                      {skinCompat.message}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* PASO 4: CONSTRUCTOR INTELIGENTE DE RUTINA                */}
            {/* ======================================================== */}
            {(feedbackGiven || isSkinEvaluated) && (
              <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-8 border border-[#EFECE6] shadow-beauty space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EFF5F1] text-[#4F6D60] flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-serif font-bold text-[#2B2A29]">
                      Construye tu rutina con este producto
                    </h4>
                    <p className="text-xs text-[#6E6A66]">
                      El sistema identificó tu producto en el <strong>{stepInfo.stepName}</strong>. Aquí tienes los pasos complementarios para completar tu rutina:
                    </p>
                  </div>
                </div>

                {/* Complementary Steps of the Day */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {complementarySteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 ${
                        step.isCurrentProduct
                          ? 'bg-[#EFF5F1] border-[#7A9A8B] ring-2 ring-[#7A9A8B]/30'
                          : 'bg-[#FAF8F5] border-[#EFECE6]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-[#9C9790] uppercase">
                            Paso {step.stepNumber}
                          </span>
                          {step.isCurrentProduct && (
                            <span className="text-[9px] font-bold bg-[#4F6D60] text-white px-2 py-0.5 rounded-full">
                              Tu producto
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-[#2B2A29] line-clamp-1">{step.stepName}</h5>
                        <p className="text-xs text-[#4F6D60] font-semibold mt-1 line-clamp-2">{step.productName}</p>
                      </div>
                      <span className="text-[10px] text-[#9C9790] block">{step.brand}</span>
                    </div>
                  ))}
                </div>

                {/* Option: Daily Fixed vs Weekly Skin Cycling */}
                <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#EFECE6] space-y-3">
                  <span className="text-xs font-bold text-[#2B2A29] block">
                    ¿Cómo deseas seguir esta rutina?
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                      routineFrequencyChoice === 'DAILY'
                        ? 'bg-[#FFFFFF] border-[#7A9A8B] ring-2 ring-[#7A9A8B]/20'
                        : 'bg-[#FFFFFF]/60 border-[#EFECE6]'
                    }`}>
                      <input
                        type="radio"
                        name="routineFrequency"
                        checked={routineFrequencyChoice === 'DAILY'}
                        onChange={() => setRoutineFrequencyChoice('DAILY')}
                        className="mt-1 text-[#7A9A8B] focus:ring-[#7A9A8B]"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#2B2A29] block">Rutina Diaria Fija</span>
                        <span className="text-[11px] text-[#6E6A66]">Uso la misma rutina todos los días sin alternar noches.</span>
                      </div>
                    </label>

                    <label className={`p-3.5 rounded-2xl border cursor-pointer flex items-start gap-3 transition ${
                      routineFrequencyChoice === 'WEEKLY'
                        ? 'bg-[#FFFFFF] border-[#7A9A8B] ring-2 ring-[#7A9A8B]/20'
                        : 'bg-[#FFFFFF]/60 border-[#EFECE6]'
                    }`}>
                      <input
                        type="radio"
                        name="routineFrequency"
                        checked={routineFrequencyChoice === 'WEEKLY'}
                        onChange={() => setRoutineFrequencyChoice('WEEKLY')}
                        className="mt-1 text-[#7A9A8B] focus:ring-[#7A9A8B]"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#2B2A29] block">Rutina Semanal / Skin Cycling</span>
                        <span className="text-[11px] text-[#6E6A66]">Alternar noches de exfoliación, retinoides y descanso en el calendario.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Save CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  {isRoutineSaved ? (
                    <div className="w-full bg-[#EFF5F1] border border-[#7A9A8B]/40 text-[#4F6D60] p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#7A9A8B]" />
                        <span>¡Rutina guardada exitosamente en tu perfil!</span>
                      </div>
                      <Link
                        href="/mi-rutina"
                        className="underline hover:text-[#2B2A29] flex items-center gap-1 font-bold"
                      >
                        <span>Ver en Mi Rutina</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-[#9C9790]">
                        Guarda esta configuración para seguir tus días en el módulo de Rutina.
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveRoutineConfig}
                        className="w-full sm:w-auto bg-[#4F6D60] hover:bg-[#3D554A] text-white text-xs font-bold px-6 py-3 rounded-full shadow-beauty flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer touch-target"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span>Guardar en Mi Rutina</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
