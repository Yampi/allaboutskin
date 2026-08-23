'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import FormulaSearchCard from '@/components/home/FormulaSearchCard';
import { 
  Microscope, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Moon, 
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
  ArrowRight,
  ShieldCheck,
  Flame,
  X,
  ScanLine,
  Check,
  Calendar as CalendarIcon,
  Plus,
  ThumbsUp,
  ThumbsDown,
  Bot,
  Send,
  Cpu,
  BookOpen,
  User,
  ShieldAlert,
  Info,
  CheckCircle
} from 'lucide-react';
import { 
  AuditReport, 
  auditInci, 
  getRecentAudits, 
  saveRecentAudit, 
  RecentAuditItem,
  getStoredRoutineProducts,
  setStoredRoutineProducts,
  saveAuditFeedback,
  saveDailyRoutine,
  UserDailyRoutine,
  fetchAiDiagnosis,
  sendCopilotMessage,
  scanImageWithGeminiVision
} from '@/lib/api';
import type { FaceSkinAnalysis } from '@/lib/gemini';
import { UserRoutineProduct } from '@/types/skinCycling';
import { 
  performOpticalCharacterRecognition, 
  analyzeCosmeticLabel, 
  OcrDetectionResult, 
  cleanOcrCosmeticText 
} from '@/lib/ocrService';


export default function FormulaAuditor({ hideSearchUI = false }: { hideSearchUI?: boolean }) {
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

  // Collapsibles & UI state
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [showCopilotChat, setShowCopilotChat] = useState(false);
  const [productPrice, setProductPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');

  // Feedback State
  const [feedbackGiven, setFeedbackGiven] = useState<'HELPFUL' | 'NOT_HELPFUL' | null>(null);

  // Skin Biotype State
  const [userSkinType, setUserSkinType] = useState<string>('COMBINATION');
  const [isSkinEvaluated, setIsSkinEvaluated] = useState(false);

  // Routine Builder State
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

  // Multi-route Classifier States (Face Diagnosis & Rejection Handling)
  const [faceSkinResult, setFaceSkinResult] = useState<FaceSkinAnalysis | null>(null);
  const [isFaceAnalysisModalOpen, setIsFaceAnalysisModalOpen] = useState(false);
  const [isScanRejected, setIsScanRejected] = useState(false);
  const [scanRejectionMessage, setScanRejectionMessage] = useState<string | null>(null);
  const [skinTypeToast, setSkinTypeToast] = useState<string | null>(null);

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
              content: `He completado el análisis clínico de **${data.meta?.product_name || productNameCandidate || 'este cosmético'}**. ¿Tienes dudas sobre cómo combinarlo, su momento exacto de aplicación o precauciones para tu piel?`
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
      setCopilotMessages([...newHistory, { role: 'assistant', content: 'No pudimos procesar tu consulta en este momento.' }]);
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

  const getProductStepInfo = () => {
    if (!report) return { stepNumber: 2, stepName: 'Tratamiento Activo', category: 'EXFOLIANT', timing: 'PM' as const };
    const name = report.meta.product_name.toLowerCase();
    const timing = report.layering_and_usage.recommended_timing === 'AM' ? 'AM' as const :
                   report.layering_and_usage.recommended_timing === 'PM' ? 'PM' as const : 'BOTH' as const;

    if (name.includes('limpiad') || name.includes('cleanser') || name.includes('gel de baño') || name.includes('agua micelar')) {
      return { stepNumber: 1, stepName: 'Paso 1: Limpieza', category: 'CLEANSER', timing };
    }
    if (name.includes('solar') || name.includes('spf') || name.includes('fps') || name.includes('sunscreen') || name.includes('ozono')) {
      return { stepNumber: 4, stepName: 'Paso 4: Fotoprotección (SPF)', category: 'SPF', timing: 'AM' as const };
    }
    if (name.includes('crema') || name.includes('hidrat') || name.includes('baume') || name.includes('balsamo') || name.includes('lotion') || name.includes('moistur')) {
      return { stepNumber: 3, stepName: 'Paso 3: Hidratación & Barrera', category: 'MOISTURIZER', timing };
    }
    if (name.includes('retin')) {
      return { stepNumber: 2, stepName: 'Paso 2: Retinoide / Renovación', category: 'RETINOID', timing: 'PM' as const };
    }
    return { stepNumber: 2, stepName: 'Paso 2: Tratamiento Activo', category: 'EXFOLIANT', timing };
  };

  const getComplementaryRoutine = () => {
    const current = getProductStepInfo();
    const isDay = current.timing === 'AM';

    return [
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
        productName: current.stepNumber === 2 ? report?.meta.product_name || 'Tratamiento Activo' : 'Sérum Hidratante Reparador',
        brand: current.stepNumber === 2 ? report?.meta.brand_name || 'Tu producto' : 'The Ordinary / Geek & Gorgeous',
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
        stepName: isDay ? 'Fotoprotección (SPF)' : 'Sellado Nocturno',
        productName: current.stepNumber === 4 ? report?.meta.product_name || 'Protector Solar FPS 50+' : (isDay ? 'Protector Solar Fluido FPS 50+' : 'Bálsamo Calmante Cica'),
        brand: current.stepNumber === 4 ? report?.meta.brand_name || 'Tu producto' : (isDay ? 'Isdin / Eucerin' : 'Cicaplast B5+'),
        isCurrentProduct: current.stepNumber === 4,
      }
    ];
  };

  const handleSaveRoutineConfig = () => {
    if (!report) return;
    const stepInfo = getProductStepInfo();
    const existingRoutineProducts = getStoredRoutineProducts();

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

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    setOcrImagePreview(previewUrl);
    setIsOcrModalOpen(true);
    setIsOcrScanning(true);
    setIsScanRejected(false);
    setScanRejectionMessage(null);
    setOcrProgress(0.1);
    setOcrStatusText(ocrEngine === 'GEMINI_VISION' ? 'Clasificando imagen con Gemini Vision IA...' : 'Analizando imagen del cosmético...');
    setOcrResult(null);
    setEditableOcrText('');

    try {
      if (ocrEngine === 'GEMINI_VISION') {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            setOcrStatusText('Analizando cosmético o rostro...');
            const scanData = await scanImageWithGeminiVision(base64Data, file.type || 'image/jpeg');

            if (scanData.classification === 'SKINCARE_PRODUCT') {
              const detectedName = scanData.productName ? `${scanData.brand ? `${scanData.brand} ` : ''}${scanData.productName}` : '';
              const detectedInci = scanData.inciText || scanData.rawDetectedText || '';
              const combined = detectedName ? `${detectedName}: ${detectedInci}` : detectedInci;
              
              setEditableOcrText(combined);
              setOcrResult({
                cleanedText: combined,
                detectedProductName: detectedName || undefined,
                confidence: scanData.confidence || 0.95,
                rawText: scanData.rawDetectedText || '',
                labelType: 'INCI_BACK_PANEL',
                isCosmeticValid: true,
              } as any);
            } else if (scanData.classification === 'HUMAN_FACE') {
              setIsOcrModalOpen(false);
              setFaceSkinResult(scanData.faceAnalysis);
              setIsFaceAnalysisModalOpen(true);
            } else {
              // INVALID
              setIsScanRejected(true);
              setScanRejectionMessage(
                scanData.userFriendlyMessage || 
                'No hemos detectado un producto de skincare ni el rostro de una persona en la foto. Asegúrate de enfocar la etiqueta de tu cosmético o tomar una selfie con buena luz.'
              );
            }
          } catch (err: any) {
            console.warn('Error en visión IA:', err);
            setIsScanRejected(true);
            setScanRejectionMessage(err?.message || 'No pudimos procesar la imagen con la IA. Verifica tu conexión o intenta con otra foto.');
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
      setIsScanRejected(true);
      setScanRejectionMessage('No pudimos procesar la foto con claridad. Intenta con mejor luz o escribe el nombre.');
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

    if (!analysis.isCosmeticValid) {
      setIsScanRejected(true);
      setScanRejectionMessage('No detectamos una lista de ingredientes cosméticos reconocible ni una etiqueta en la imagen.');
    } else {
      if (analysis.labelType === 'FRONT_BRANDING' && analysis.suggestedOfficialInci) {
        setEditableOcrText(`${analysis.detectedProductName || 'Producto'}: ${analysis.suggestedOfficialInci}`);
      } else {
        setEditableOcrText(analysis.cleanedText || cleanOcrCosmeticText(recognizedText));
      }
    }
    setIsOcrScanning(false);
  };

  const handleConfirmOcrAudit = () => {
    setIsOcrModalOpen(false);
    const finalQuery = editableOcrText.trim() || (ocrResult?.cleanedText ?? '');
    setOmniInput(finalQuery);
    handleAudit(finalQuery, ocrResult?.detectedPrice ?? null);
  };

  const stepInfo = getProductStepInfo();
  const complementarySteps = getComplementaryRoutine();

  return (
    <div className="w-full">
      {/* Hidden file input for OCR */}
      <input type="file" ref={fileInputRef} onChange={handleCameraCapture} accept="image/*" capture="environment" className="hidden" />

      {!hideSearchUI && (
        <FormulaSearchCard
          omniInput={omniInput}
          setOmniInput={setOmniInput}
          isLoading={isLoading}
          onAudit={handleAudit}
          onClear={handleClear}
          onCameraClick={() => fileInputRef.current?.click()}
          productPrice={productPrice}
          setProductPrice={setProductPrice}
        />
      )}

      {/* OCR MODAL */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1B1A]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-editorial-elevated border border-[#ECE6DC] w-full max-w-lg overflow-hidden my-auto">
            <div className="bg-[#2D4A3E] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ScanLine className="w-4 h-4 text-[#A2BAAD]" />
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base">Escanear etiqueta cosmética</h3>
                  <p className="text-[10px] text-white/80">Reconociendo fórmula o nombre comercial</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Engine Switcher */}
            <div className="px-5 pt-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#66615C] flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-[#4F6D60]" />
                Motor de lectura:
              </span>
              <div className="flex items-center gap-1 bg-[#F7F4EE] p-1 rounded-full border border-[#ECE6DC]">
                <button
                  type="button"
                  onClick={() => setOcrEngine('GEMINI_VISION')}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition flex items-center gap-1 ${
                    ocrEngine === 'GEMINI_VISION'
                      ? 'bg-[#2D4A3E] text-white'
                      : 'text-[#66615C] hover:text-[#1C1B1A]'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#A2BAAD]" />
                  <span>Gemini Vision IA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOcrEngine('LOCAL_OCR')}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full transition ${
                    ocrEngine === 'LOCAL_OCR'
                      ? 'bg-[#2D4A3E] text-white'
                      : 'text-[#66615C] hover:text-[#1C1B1A]'
                  }`}
                >
                  <span>OCR Local</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-[#ECE6DC] bg-[#FAF8F5] h-44 flex items-center justify-center">
                {ocrImagePreview && (
                  <img
                    src={ocrImagePreview}
                    alt="Foto del producto"
                    className={`h-full w-full object-contain ${isOcrScanning ? 'opacity-70 blur-[0.5px]' : ''}`}
                  />
                )}
                {isOcrScanning && (
                  <div className="absolute inset-0 bg-[#2D4A3E]/40 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <Activity className="w-6 h-6 text-white animate-spin mb-2" />
                    <span className="text-white font-semibold text-xs">{ocrStatusText}</span>
                  </div>
                )}
              </div>

              {/* REJECTION STATE ALERT */}
              {!isOcrScanning && isScanRejected && (
                <div className="space-y-3 p-4 bg-[#FDF2F0] border border-[#D97D75]/40 rounded-xl animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[#D97D75] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#943C36]">Imagen no reconocida</h4>
                      <p className="text-[11px] text-[#943C36]/90 mt-0.5 leading-relaxed">
                        {scanRejectionMessage}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-[#D97D75]/20 text-[11px] text-[#66615C] space-y-1.5">
                    <p className="font-semibold text-[#1C1B1A]">💡 Consejos para escanear:</p>
                    <p className="flex items-center gap-1.5">
                      <span>🧴</span>
                      <span><strong>Cosméticos:</strong> Enfoca la lista de ingredientes (INCI) o el frente con buena luz.</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span>👤</span>
                      <span><strong>Diagnóstico Facial:</strong> Toma una selfie clara de tu rostro sin maquillaje ni filtros.</span>
                    </p>
                  </div>
                </div>
              )}

              {/* SUCCESS RECOGNIZED PRODUCT STATE */}
              {!isOcrScanning && !isScanRejected && ocrResult && (
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#EEF4F0] border border-[#4F6D60]/30 rounded-xl flex items-center gap-2 text-xs text-[#2D4A3E]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Producto cosmético reconocido con éxito.</span>
                  </div>
                  <textarea
                    rows={3}
                    value={editableOcrText}
                    onChange={(e) => setEditableOcrText(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl p-2.5 text-xs text-[#1C1B1A] focus:bg-[#FFFFFF] focus:border-[#4F6D60] focus:outline-none"
                    placeholder="Texto detectado..."
                  />
                </div>
              )}
            </div>

            <div className="bg-[#FAF8F5] p-3.5 border-t border-[#ECE6DC] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOcrModalOpen(false)}
                className="text-xs font-semibold text-[#66615C] px-3.5 py-1.5 rounded-full hover:bg-[#ECE6DC] transition cursor-pointer"
              >
                Cerrar
              </button>
              {isScanRejected ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#2D4A3E] hover:bg-[#2A3A32] text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#A2BAAD]" />
                  <span>Tomar otra foto</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isOcrScanning || !editableOcrText.trim()}
                  onClick={handleConfirmOcrAudit}
                  className="bg-[#4F6D60] hover:bg-[#3D5B4E] disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Evaluar Fórmula</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FACIAL SKIN DIAGNOSIS MODAL */}
      {isFaceAnalysisModalOpen && faceSkinResult && (
        <div className="fixed inset-0 z-50 bg-[#1C1B1A]/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-editorial-elevated border border-[#ECE6DC] w-full max-w-lg overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-[#2D4A3E] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#A2BAAD]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm sm:text-base">Diagnóstico Facial de Piel</h3>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-sans tracking-wide">
                      IA Orientativa
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80">Evaluación visual basada en IA y biotipos dérmicos</p>
                </div>
              </div>
              <button
                onClick={() => setIsFaceAnalysisModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Face Preview thumbnail & Skin Type Banner */}
              <div className="flex items-center gap-3.5 bg-[#EEF4F0] p-4 rounded-xl border border-[#4F6D60]/30">
                {ocrImagePreview && (
                  <img
                    src={ocrImagePreview}
                    alt="Selfie del usuario"
                    className="w-14 h-14 rounded-xl object-cover border border-[#4F6D60]/40 shrink-0"
                  />
                )}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#2D4A3E] tracking-wider">
                    Biotipo Dérmico Estimado
                  </span>
                  <h4 className="text-lg font-serif font-bold text-[#1C1B1A]">
                    {faceSkinResult.skinTypeLabel || `Piel ${faceSkinResult.skinTypeEstimate}`}
                  </h4>
                  <span className="text-[11px] text-[#4F6D60] font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Nivel de certeza visual: {Math.round(faceSkinResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Zone Analysis Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ECE6DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1B1A] flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-[#4F6D60]" />
                      Zona T (Frente/Nariz)
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      faceSkinResult.zoneTAnalysis.shineLevel === 'HIGH' ? 'bg-[#FDF2F0] text-[#943C36]' :
                      faceSkinResult.zoneTAnalysis.shineLevel === 'MODERATE' ? 'bg-[#FFF8E6] text-[#8C6B1F]' :
                      'bg-[#EEF4F0] text-[#2D4A3E]'
                    }`}>
                      Brillo {faceSkinResult.zoneTAnalysis.shineLevel === 'HIGH' ? 'Alto' : faceSkinResult.zoneTAnalysis.shineLevel === 'MODERATE' ? 'Moderado' : 'Bajo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66615C] leading-relaxed">
                    {faceSkinResult.zoneTAnalysis.description}
                  </p>
                </div>

                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#ECE6DC] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1C1B1A] flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-[#4F6D60]" />
                      Mejillas & Contorno
                    </span>
                    <span className="text-[10px] font-bold bg-[#EEF4F0] text-[#2D4A3E] px-2 py-0.5 rounded-full">
                      {faceSkinResult.cheeksAnalysis.hydrationState === 'DRY' ? 'Seca / Tirante' :
                       faceSkinResult.cheeksAnalysis.hydrationState === 'BALANCED' ? 'Equilibrada' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66615C] leading-relaxed">
                    {faceSkinResult.cheeksAnalysis.description}
                  </p>
                </div>
              </div>

              {/* Suggested Focus Actives */}
              <div className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#ECE6DC] space-y-2">
                <span className="text-xs font-bold text-[#1C1B1A] block">
                  Enfoque cosmético sugerido para tu piel:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {faceSkinResult.suggestedFocus.map((focus, i) => (
                    <span key={i} className="text-[11px] bg-[#F7F4EE] text-[#2D4A3E] font-medium px-2.5 py-1 rounded-lg border border-[#ECE6DC]">
                      ✓ {focus}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dermatological Disclaimer */}
              <div className="p-3 bg-[#FFF8E6] border border-[#E6C673]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#8C6B1F]">
                <Info className="w-4 h-4 text-[#C2921E] shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">Aviso médico orientativo:</span> {faceSkinResult.disclaimer}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-[#FAF8F5] p-3.5 border-t border-[#ECE6DC] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsFaceAnalysisModalOpen(false)}
                className="text-xs font-semibold text-[#66615C] px-3.5 py-2 rounded-xl hover:bg-[#ECE6DC] transition text-center cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserSkinType(faceSkinResult.skinTypeEstimate);
                  setIsFaceAnalysisModalOpen(false);
                  setSkinTypeToast(`¡Tu perfil se actualizó a ${faceSkinResult.skinTypeLabel || faceSkinResult.skinTypeEstimate}!`);
                  setTimeout(() => setSkinTypeToast(null), 4500);
                }}
                className="bg-[#4F6D60] hover:bg-[#3D5B4E] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Adoptar para mi perfil de piel ({faceSkinResult.skinTypeEstimate})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST CONFIRMATION */}
      {skinTypeToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D4A3E] text-white px-4 py-3 rounded-2xl shadow-editorial-elevated border border-[#A2BAAD]/40 flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#A2BAAD] shrink-0" />
          <span className="font-semibold">{skinTypeToast}</span>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-[#FDF2F0] border border-[#D97D75]/40 text-[#943C36] rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-[#D97D75] flex-shrink-0 mt-0.5" />
          <div className="text-xs font-medium leading-relaxed">
            {error}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RESULTS DISPLAY: NARRATIVA EDITORIAL PROGRESIVA EN 8 PASOS           */}
      {/* ========================================================================= */}
      <div ref={resultsRef}>
        {report && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* CABECERA DEL INFORME (CANVAS EDITORIAL) */}
            <div className="border-b border-[#ECE6DC] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#2D4A3E] uppercase tracking-widest bg-[#EEF4F0] px-2.5 py-0.5 rounded-full">
                    Análisis Científico Completado
                  </span>
                  <span className="text-xs text-[#99938B]">
                    {report.meta.total_ingredients_count} ingredientes procesados
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1B1A] tracking-tight">
                  {report.meta.product_name}
                </h2>
                {report.meta.brand_name && (
                  <p className="text-xs text-[#66615C]">Marca / Laboratorio: <span className="font-semibold text-[#1C1B1A]">{report.meta.brand_name}</span></p>
                )}
              </div>

              <button
                onClick={handleClear}
                className="self-start sm:self-auto text-xs font-semibold text-[#66615C] hover:text-[#1C1B1A] bg-[#FFFFFF] px-3.5 py-1.5 rounded-full border border-[#ECE6DC] transition"
              >
                Nueva consulta
              </button>
            </div>

            {/* SECCIÓN 1: ¿TIENE EVIDENCIA CIENTÍFICA? */}
            <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-4">
              <div className="flex items-center justify-between border-b border-[#ECE6DC] pb-3">
                <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider flex items-center gap-1.5">
                  <Microscope className="w-4 h-4 text-[#4F6D60]" />
                  1. Evidencia Científica & Respaldo
                </span>
                <span className="text-[10px] font-bold bg-[#EEF4F0] text-[#2D4A3E] px-3 py-1 rounded-full">
                  Grado {report.scientific_evidence.overall_evidence_grade} · {report.scientific_evidence.overall_evidence_grade === 'A' ? 'Alta Certeza' : 'Moderada'}
                </span>
              </div>

              <p className="text-sm text-[#1C1B1A] leading-relaxed font-sans">
                {report.ai_clinical_copilot.plain_language_summary}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-[#66615C]">
                  Normalizado frente al inventario europeo CosIng y estudios clínicos indexados.
                </span>
                <Link
                  href="/ingrediente"
                  className="text-[#4F6D60] hover:text-[#2D4A3E] font-semibold inline-flex items-center gap-1 shrink-0"
                >
                  <span>Ver estudios en PubMed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* SECCIÓN 2: ¿PARA QUÉ SIRVE? (IDEAL PARA) */}
            <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-4">
              <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider block border-b border-[#ECE6DC] pb-3">
                2. ¿Para qué sirve? Indicaciones Clave
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.clinical_indications.map((ind, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#ECE6DC]/60">
                    <Check className="w-4 h-4 text-[#4F6D60] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[#1C1B1A] block">{ind.name}</span>
                      <span className="text-[11px] text-[#66615C]">Efecto comprobado en ensayos dermatológicos</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN 3: ¿CUÁNDO USARLO? (MOMENTO & FRECUENCIA) */}
            <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-4">
              <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider block border-b border-[#ECE6DC] pb-3">
                3. ¿Cuándo usarlo? Momento & Frecuencia
              </span>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F7F4EE] p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#2D4A3E]">
                    {report.layering_and_usage.recommended_timing === 'PM' ? (
                      <Moon className="w-4 h-4 text-[#2D4A3E]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#B89B7D]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1C1B1A] block">
                      {report.layering_and_usage.recommended_timing === 'PM' ? 'Aplicación Nocturna (PM)' :
                       report.layering_and_usage.recommended_timing === 'AM' ? 'Aplicación Diurna (AM)' : 'Uso Mañana & Noche (AM/PM)'}
                    </span>
                    <span className="text-[11px] text-[#66615C]">
                      {report.layering_and_usage.recommended_timing === 'PM' ? '2–3 veces por semana o en ciclo de exfoliación/retinol' : 'Uso diario con protector solar posterior'}
                    </span>
                  </div>
                </div>

                <span className="text-xs text-[#2D4A3E] font-semibold bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#ECE6DC]">
                  {report.layering_and_usage.layering_rule}
                </span>
              </div>
            </div>

            {/* SECCIÓN 4: COMPATIBILIDADES & QUÉ EVITAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Compatibles */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#ECE6DC] shadow-editorial space-y-3">
                <span className="text-xs font-serif font-bold text-[#2D4A3E] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#ECE6DC] pb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4F6D60]" />
                  4A. Combinar favorablemente con:
                </span>
                <p className="text-xs text-[#66615C]">
                  Activos que potencian sus resultados o protegen la barrera cutánea:
                </p>
                <div className="space-y-1.5 pt-1">
                  {(aiDiagnosis?.layeringAdvice?.combineWith && aiDiagnosis.layeringAdvice.combineWith.length > 0 ? aiDiagnosis.layeringAdvice.combineWith : ['Niacinamida', 'Ácido Hialurónico', 'Ceramidas', 'Pantenol (B5)']).map((item: string, i: number) => (
                    <div key={i} className="text-xs text-[#1C1B1A] bg-[#EEF4F0] px-3 py-2 rounded-xl flex items-center gap-2">
                      <span className="text-[#2D4A3E] font-bold">✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conflictos */}
              <div className="bg-[#FFFFFF] rounded-2xl p-6 border border-[#ECE6DC] shadow-editorial space-y-3">
                <span className="text-xs font-serif font-bold text-[#943C36] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#ECE6DC] pb-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#D97D75]" />
                  4B. Evitar combinar inicialmente con:
                </span>
                <p className="text-xs text-[#66615C]">
                  Evita aplicar en la misma capa para no saturar o irritar la piel:
                </p>
                <div className="space-y-1.5 pt-1">
                  {(report.chemical_conflicts.length > 0 ? report.chemical_conflicts.map(c => c.ingredient_b) : (aiDiagnosis?.layeringAdvice?.avoidCombiningWith && aiDiagnosis.layeringAdvice.avoidCombiningWith.length > 0 ? aiDiagnosis.layeringAdvice.avoidCombiningWith : ['Ácidos AHA/BHA simultáneos', 'Otros retinoides concentrados', 'Vitamina C pura si tu piel es reactiva'])).map((item: string, i: number) => (
                    <div key={i} className="text-xs text-[#943C36] bg-[#FDF2F0] px-3 py-2 rounded-xl flex items-center gap-2">
                      <span className="font-bold">⚠️</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: ¿DÓNDE VA EN TU RUTINA? */}
            <div className="bg-[#FFFFFF] rounded-2xl p-6 sm:p-8 border border-[#ECE6DC] shadow-editorial space-y-6">
              <div className="border-b border-[#ECE6DC] pb-3 flex items-center justify-between">
                <span className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider">
                  5. ¿Dónde va en tu rutina? Orden de Aplicación
                </span>
                <span className="text-[11px] text-[#4F6D60] font-semibold">
                  {stepInfo.stepName}
                </span>
              </div>

              {/* Visual Routine Sequence */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {complementarySteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                      step.isCurrentProduct
                        ? 'bg-[#EEF4F0] border-[#4F6D60] ring-2 ring-[#4F6D60]/20'
                        : 'bg-[#FAF8F5] border-[#ECE6DC]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-[#99938B] uppercase">
                          Paso {step.stepNumber}
                        </span>
                        {step.isCurrentProduct && (
                          <span className="text-[9px] font-bold bg-[#2D4A3E] text-white px-2 py-0.5 rounded-full">
                            Tu producto
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-[#1C1B1A]">{step.stepName}</h5>
                      <p className="text-xs text-[#2D4A3E] font-medium mt-1">{step.productName}</p>
                    </div>
                    <span className="text-[10px] text-[#99938B]">{step.brand}</span>
                  </div>
                ))}
              </div>

              {/* SECCIÓN 6: ACCIÓN PRINCIPAL (GUARDAR EN RUTINA) */}
              <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#ECE6DC] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-serif font-bold text-[#1C1B1A] uppercase tracking-wider">
                      ¿Cómo deseas integrar este producto?
                    </h4>
                    <p className="text-xs text-[#66615C]">
                      Guárdalo para seguir tu calendario de cuidado en Mi Rutina.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-[#1C1B1A] flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="routineMode"
                        checked={routineFrequencyChoice === 'DAILY'}
                        onChange={() => setRoutineFrequencyChoice('DAILY')}
                        className="text-[#4F6D60] focus:ring-[#4F6D60]"
                      />
                      <span>Diaria Fija</span>
                    </label>
                    <label className="text-xs font-semibold text-[#1C1B1A] flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="routineMode"
                        checked={routineFrequencyChoice === 'WEEKLY'}
                        onChange={() => setRoutineFrequencyChoice('WEEKLY')}
                        className="text-[#4F6D60] focus:ring-[#4F6D60]"
                      />
                      <span>Skin Cycling</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  {isRoutineSaved ? (
                    <div className="w-full bg-[#EEF4F0] border border-[#4F6D60]/30 text-[#2D4A3E] p-3 rounded-xl text-xs font-bold flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4F6D60]" />
                        <span>¡Guardado exitosamente en tu rutina!</span>
                      </div>
                      <Link href="/mi-rutina" className="underline flex items-center gap-1">
                        <span>Ver en Mi Rutina</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs text-[#99938B]">
                        Se sincronizará con tu calendario dérmico de uso.
                      </span>
                      <button
                        type="button"
                        onClick={handleSaveRoutineConfig}
                        className="w-full sm:w-auto bg-[#2D4A3E] hover:bg-[#2A3B32] text-white text-xs font-semibold px-6 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Añadir a mi rutina</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 7: COPILOTO CLÍNICO IA (DESPLEGABLE ELEGANTE) */}
            <div className="border border-[#ECE6DC] rounded-2xl bg-[#FFFFFF] p-6 shadow-editorial space-y-4">
              <button
                type="button"
                onClick={() => setShowCopilotChat(!showCopilotChat)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#EEF4F0] text-[#2D4A3E] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#4F6D60]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#1C1B1A]">
                      Consultar al Copiloto Clínico IA
                    </h4>
                    <p className="text-xs text-[#66615C]">
                      Hazle preguntas sobre orden, compatibilidad o dudas específicas de tu piel
                    </p>
                  </div>
                </div>
                {showCopilotChat ? <ChevronUp className="w-4 h-4 text-[#99938B]" /> : <ChevronDown className="w-4 h-4 text-[#99938B]" />}
              </button>

              {showCopilotChat && (
                <div className="pt-3 space-y-4 border-t border-[#ECE6DC] animate-in fade-in">
                  {/* Preset Questions */}
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
                        className="text-xs bg-[#FAF8F5] hover:bg-[#EEF4F0] hover:text-[#2D4A3E] text-[#66615C] font-medium px-3 py-1.5 rounded-full border border-[#ECE6DC] transition active:scale-95 cursor-pointer"
                      >
                        {presetQ}
                      </button>
                    ))}
                  </div>

                  {/* Chat Messages */}
                  {copilotMessages.length > 0 && (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto p-3.5 bg-[#FAF8F5] rounded-xl border border-[#ECE6DC]">
                      {copilotMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-6 h-6 rounded-full bg-[#EEF4F0] text-[#2D4A3E] flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5 text-[#4F6D60]" />
                            </div>
                          )}
                          <div
                            className={`p-3 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-[#2D4A3E] text-white'
                                : 'bg-[#FFFFFF] text-[#1C1B1A] border border-[#ECE6DC] shadow-2xs whitespace-pre-line'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {isCopilotSending && (
                        <div className="flex gap-2 justify-start">
                          <div className="w-6 h-6 rounded-full bg-[#EEF4F0] text-[#2D4A3E] flex items-center justify-center shrink-0">
                            <Activity className="w-3.5 h-3.5 text-[#4F6D60] animate-spin" />
                          </div>
                          <div className="p-2.5 bg-[#FFFFFF] border border-[#ECE6DC] rounded-xl text-xs text-[#99938B] italic">
                            Consultando modelo dermatológico...
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
                      placeholder="Escribe tu consulta dermatológica..."
                      className="flex-grow bg-[#FAF8F5] focus:bg-[#FFFFFF] border border-[#ECE6DC] focus:border-[#4F6D60] rounded-xl px-3.5 py-2 text-xs text-[#1C1B1A] focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendCopilotMessage()}
                      disabled={isCopilotSending || !copilotInput.trim()}
                      className="bg-[#4F6D60] hover:bg-[#3D5B4E] disabled:opacity-50 text-white p-2 rounded-xl transition active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 8: FICHA TÉCNICA INCI & DETALLES ADICIONALES (DESPLEGABLE) */}
            <div className="border border-[#ECE6DC] rounded-2xl bg-[#FFFFFF] p-6 shadow-editorial space-y-4">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#66615C] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#66615C]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-serif font-bold text-[#1C1B1A]">
                      Ficha Técnica INCI Detallada
                    </h4>
                    <p className="text-xs text-[#66615C]">
                      Desglose componente a componente y puntuación comedogénica
                    </p>
                  </div>
                </div>
                {showTechnicalDetails ? <ChevronUp className="w-4 h-4 text-[#99938B]" /> : <ChevronDown className="w-4 h-4 text-[#99938B]" />}
              </button>

              {showTechnicalDetails && (
                <div className="pt-3 space-y-3 border-t border-[#ECE6DC] animate-in fade-in">
                  <div className="max-h-56 overflow-y-auto divide-y divide-[#ECE6DC] text-xs">
                    {report.ingredients_breakdown.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <span className={`font-medium ${item.is_active ? 'text-[#2D4A3E] font-bold' : 'text-[#66615C]'}`}>
                          {item.position}. {item.inci_name} {item.common_name ? `(${item.common_name})` : ''}
                        </span>
                        <span className="text-[10px] text-[#99938B]">
                          Comedogénico: {item.comedogenic_rating}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN FEEDBACK & UTILIDAD */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#66615C]">
              <span>¿Te resultó claro y útil este análisis científico?</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFeedback(true)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    feedbackGiven === 'HELPFUL'
                      ? 'bg-[#2D4A3E] text-white'
                      : 'bg-[#FFFFFF] text-[#2D4A3E] border border-[#ECE6DC] hover:bg-[#EEF4F0]'
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>Sí, muy claro</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(false)}
                  className={`px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    feedbackGiven === 'NOT_HELPFUL'
                      ? 'bg-[#943C36] text-white'
                      : 'bg-[#FFFFFF] text-[#66615C] border border-[#ECE6DC] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>Regular</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
