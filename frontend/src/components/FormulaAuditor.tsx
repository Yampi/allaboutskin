'use client';

import { useState, useRef, useEffect } from 'react';
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
  Bot, 
  Search,
  SlidersHorizontal,
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
  Image as ImageIcon,
  Check,
  RefreshCw,
  Info,
  HeartHandshake,
  History,
  Calendar as CalendarIcon,
  Leaf,
  Plus
} from 'lucide-react';
import { 
  AuditReport, 
  auditInci, 
  getRecentAudits, 
  saveRecentAudit, 
  clearRecentAudits, 
  RecentAuditItem,
  getStoredRoutineProducts,
  setStoredRoutineProducts
} from '@/lib/api';
import { 
  performOpticalCharacterRecognition, 
  analyzeCosmeticLabel, 
  OcrDetectionResult,
  cleanOcrCosmeticText
} from '@/lib/ocrService';

const QUICK_PRESETS = [
  {
    label: 'Hawaiian Tropic Ozono 50+',
    badge: 'Solar / Ozono',
    input: 'Hawaiian Tropic Ozono Duo Defense FPS 50+: Aqua, Homosalate, Octocrylene, Ethylhexyl Salicylate, Butyl Methoxydibenzoylmethane, Cetearyl Alcohol, Glycerin, Dimethicone, Phenoxyethanol.',
    price: 14.99,
  },
  {
    label: 'Toallas Farmatodo',
    badge: 'Toallas / Miscelánea',
    input: 'Toallas Desmaquillantes Farmatodo x 25 und: Aqua, PEG-6 Caprylic/Capric Glycerides, Polysorbate 20, Chamomilla Recutita Extract, Aloe Barbadensis, Phenoxyethanol, Parfum.',
    price: 3.50,
  },
  {
    label: 'The Ordinary Niacinamida',
    badge: 'Poros & Sebo',
    input: 'The Ordinary Niacinamide 10% + Zinc 1%: Aqua, Niacinamide, Pentylene Glycol, Zinc PCA, Tamarindus Indica Seed Gum, Phenoxyethanol.',
    price: 6.50,
  },
  {
    label: "Paula's Choice BHA",
    badge: 'Acné & Puntos Negros',
    input: "Paula's Choice 2% BHA Liquid: Water, Methylpropanediol, Butylene Glycol, Salicylic Acid, Green Tea Extract, Sodium Hydroxide.",
    price: 35.00,
  },
  {
    label: 'Pomada Cicatrizante',
    badge: 'Farmacia / Pantenol',
    input: 'Pomada Regeneradora: Dexpantenol 5%, Alantoina 1%, Oxido de Zinc 10%, Vaselina liquida, Lanolina, Agua purificada.',
    price: 4.00,
  },
  {
    label: 'Retinol + Glicólico',
    badge: '⚠️ Conflicto Químico',
    input: 'Fórmula Ácida: Aqua, Retinol 1%, Glycolic Acid 7%, Glycerin, Dimethicone, Cetearyl Alcohol.',
    price: 22.00,
  }
];

export default function FormulaAuditor() {
  // Unified single input for anything: product name, brand, or INCI list
  const [omniInput, setOmniInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  // UX View Mode: Simple (for Novices/Tech) vs Scientific (for Skincare Experts/Doctors)
  const [viewMode, setViewMode] = useState<'SIMPLE' | 'SCIENTIFIC'>('SIMPLE');

  // Progressive disclosure: Advanced optional refinements
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [productPrice, setProductPrice] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [skinType, setSkinType] = useState('COMBINATION');

  // OCR Modal & Scanning State
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [ocrResult, setOcrResult] = useState<OcrDetectionResult | null>(null);
  const [editableOcrText, setEditableOcrText] = useState('');

  // Recent Audits & Routine Assignment State
  const [recentAudits, setRecentAudits] = useState<RecentAuditItem[]>([]);
  const [isAddedToRoutineSuccess, setIsAddedToRoutineSuccess] = useState(false);
  const [routineNightAssigned, setRoutineNightAssigned] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentAudits(getRecentAudits());
  }, []);

  const handleAudit = async (customQuery?: string, customPrice?: number | null) => {
    const query = (customQuery ?? omniInput).trim();
    if (!query) {
      setError('Por favor escribe el nombre de tu producto o pega sus ingredientes.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsAddedToRoutineSuccess(false);

    try {
      const parsedPrice = customPrice !== undefined 
        ? customPrice 
        : (productPrice.trim() ? parseFloat(productPrice) : null);

      // Distinguish if query is a name or full INCI or hybrid
      let productNameCandidate: string | undefined = undefined;
      let inciTextCandidate = query;

      if (query.includes(':')) {
        const parts = query.split(':');
        productNameCandidate = parts[0].trim();
        inciTextCandidate = parts.slice(1).join(':').trim();
      } else if (!query.includes(',') && !query.includes('+') && !query.includes(';') && !query.includes('\n') && query.length < 60) {
        productNameCandidate = query;
      } else {
        productNameCandidate = query.length < 90 ? query : 'Fórmula Personalizada';
        inciTextCandidate = query;
      }

      const data = await auditInci(
        inciTextCandidate, 
        productNameCandidate, 
        parsedPrice, 
        currency
      );
      
      setReport(data);

      // Calculate Beauty-Tech Safety Score
      const calculatedScore = Math.min(100, Math.max(45,
        data.ai_clinical_copilot?.friction_risk_level === 'HIGH' ? 55 :
        data.ai_clinical_copilot?.friction_risk_level === 'MODERATE' ? 72 :
        data.ai_clinical_copilot?.barrier_warning ? 84 : 95
      ));

      const ratingLabel = calculatedScore >= 88 ? 'Excelente' : calculatedScore >= 70 ? 'Seguro' : 'Precaución';

      // Save to recent audits
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

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'No pudimos procesar la fórmula. Revisa el texto o escribe el nombre del producto.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToSkinCycling = (targetPhase: number) => {
    if (!report) return;
    const existing = getStoredRoutineProducts();
    const newProduct = {
      id: 'prod_' + Math.random().toString(36).substring(7),
      phaseId: targetPhase,
      productName: report.meta.product_name,
      brand: report.meta.brand_name || undefined,
      category: (
        report.meta.product_name.toLowerCase().includes('bha') || report.meta.product_name.toLowerCase().includes('ácido') || report.meta.product_name.toLowerCase().includes('glicol') ? 'EXFOLIANT' :
        report.meta.product_name.toLowerCase().includes('retin') ? 'RETINOID' :
        targetPhase === 0 ? 'SPF' : 'MOISTURIZER'
      ) as any
    };
    const updated = [...existing, newProduct];
    setStoredRoutineProducts(updated);
    setIsAddedToRoutineSuccess(true);
    setRoutineNightAssigned(targetPhase);
  };

  const handleClearHistory = () => {
    clearRecentAudits();
    setRecentAudits([]);
  };

  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setOmniInput(preset.input);
    if (preset.price) setProductPrice(preset.price.toString());
    handleAudit(preset.input, preset.price);
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input for re-triggers
    e.target.value = '';

    // Create immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setOcrImagePreview(previewUrl);
    setIsOcrModalOpen(true);
    setIsOcrScanning(true);
    setOcrProgress(0.1);
    setOcrStatusText('Leyendo etiqueta del producto...');
    setOcrResult(null);
    setEditableOcrText('');

    try {
      const recognizedText = await performOpticalCharacterRecognition(file, (prog, status) => {
        setOcrProgress(prog);
        setOcrStatusText(status);
      });

      const analysis = analyzeCosmeticLabel(recognizedText);
      setOcrResult(analysis);

      if (analysis.labelType === 'FRONT_BRANDING' && analysis.suggestedOfficialInci) {
        setEditableOcrText(
          `${analysis.detectedProductName || 'Producto'}: ${analysis.suggestedOfficialInci}`
        );
      } else {
        setEditableOcrText(analysis.cleanedText || cleanOcrCosmeticText(recognizedText));
      }

      if (analysis.detectedPrice && !productPrice) {
        setProductPrice(analysis.detectedPrice.toString());
      }
    } catch (err: any) {
      setOcrStatusText('No se pudo leer la imagen.');
      setError('No pudimos leer la foto con claridad. Intenta con mayor iluminación o escribe el nombre.');
    } finally {
      setIsOcrScanning(false);
    }
  };

  const handleConfirmOcrAudit = () => {
    setIsOcrModalOpen(false);
    const finalQuery = editableOcrText.trim() || (ocrResult?.cleanedText ?? '');
    setOmniInput(finalQuery);
    handleAudit(finalQuery, ocrResult?.detectedPrice ?? null);
  };

  const handleClear = () => {
    setOmniInput('');
    setProductPrice('');
    setReport(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="bg-[#FFFFFF] rounded-3xl shadow-beauty border border-[#EFECE6] p-5 sm:p-7 transition-all duration-300">
        
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7A9A8B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7A9A8B]"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9C9790]">
              Asesoría de Fórmulas & Skincare
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 touch-target ${
              showAdvanced || productPrice
                ? 'bg-[#EFF5F1] text-[#4F6D60] border-[#7A9A8B]/40' 
                : 'bg-[#FAF8F5] text-[#6E6A66] border-[#EFECE6] hover:bg-[#F2EFE9]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#7A9A8B]" />
            <span>{showAdvanced ? 'Ocultar Opciones' : 'Ajustar (+ Precio / Biotipo)'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#FAF8F5] hover:bg-[#F5F2EC] focus-within:bg-[#FFFFFF] rounded-2xl sm:rounded-full border border-[#EFECE6] focus-within:border-[#7A9A8B] focus-within:ring-4 focus-within:ring-[#7A9A8B]/10 shadow-xs transition-all duration-300 p-2 sm:p-2.5 gap-2.5">
            
            <div className="hidden sm:flex items-center pl-3 text-[#9C9790]">
              <Search className="w-4 h-4 text-[#7A9A8B]" />
            </div>

            <textarea
              rows={omniInput.length > 80 ? 3 : 1}
              value={omniInput}
              onChange={(e) => setOmniInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAudit();
                }
              }}
              placeholder="Escribe un producto (ej: The Ordinary Niacinamida, Cerave, Protector Solar) o pega ingredientes..."
              className="w-full bg-transparent px-3 py-2 text-[#2B2A29] text-sm sm:text-base placeholder:text-[#9C9790] focus:outline-none resize-none leading-relaxed font-sans"
            />

            {omniInput && (
              <button
                type="button"
                onClick={handleClear}
                className="hidden sm:flex p-2 text-[#9C9790] hover:text-[#2B2A29] rounded-full transition-colors self-center"
                title="Limpiar búsqueda"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#EFECE6]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#2B2A29] border border-[#EFECE6] shadow-xs px-3.5 py-2.5 rounded-full transition-all duration-200 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
                title="Tomar foto a la etiqueta cosmética"
              >
                <Camera className="w-4 h-4 text-[#7A9A8B]" />
                <span className="inline">Foto</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCameraCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => handleAudit()}
                disabled={isLoading || !omniInput.trim()}
                className="flex-grow sm:flex-grow-0 bg-[#7A9A8B] hover:bg-[#688879] disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-full shadow-xs flex items-center justify-center gap-2 text-xs sm:text-sm transition-all duration-200 active:scale-95 flex-shrink-0 touch-target cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Evaluando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluar Fórmula</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[#EFECE6] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-[#6E6A66] mb-1">
                Precio Aproximado (Opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="ej: 14.99"
                  className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:bg-[#FFFFFF] focus:border-[#7A9A8B] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6E6A66] mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:bg-[#FFFFFF] focus:border-[#7A9A8B] focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="VES">VES (Bs.)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6E6A66] mb-1">
                Tipo de Piel / Biotipo
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EFECE6] rounded-xl px-3.5 py-2.5 text-sm focus:bg-[#FFFFFF] focus:border-[#7A9A8B] focus:outline-none"
              >
                <option value="COMBINATION">Piel Mixta</option>
                <option value="DRY">Piel Seca / Deshidratada</option>
                <option value="SENSITIVE">Piel Sensible / Reactiva</option>
                <option value="ACNE_PRONE">Tendencia a Imperfecciones</option>
                <option value="NORMAL">Piel Normal</option>
              </select>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-[#9C9790] uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-[#C4A482]" />
            Fórmulas de Ejemplo:
          </span>
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs bg-[#FAF8F5] hover:bg-[#EFF5F1] hover:text-[#4F6D60] hover:border-[#7A9A8B]/40 text-[#6E6A66] font-medium px-3 py-1.5 rounded-full border border-[#EFECE6] transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer touch-target"
            >
              <span className="text-[10px] text-[#7A9A8B] font-bold">[{preset.badge}]</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* RECENT AUDITS LOG CAROUSEL */}
        {recentAudits.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#EFECE6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#9C9790] uppercase tracking-wider flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-[#7A9A8B]" />
                Auditorías Recientes ({recentAudits.length})
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-[10px] text-[#9C9790] hover:text-[#A46864] transition cursor-pointer"
              >
                Limpiar historial
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {recentAudits.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setOmniInput(item.query);
                    if (item.price) setProductPrice(item.price.toString());
                    handleAudit(item.query, item.price);
                  }}
                  className="flex-shrink-0 bg-[#FAF8F5] hover:bg-[#EFF5F1] border border-[#EFECE6] hover:border-[#7A9A8B]/40 rounded-2xl px-3 py-2 text-left transition-all duration-200 shadow-2xs group flex items-center gap-2.5 cursor-pointer touch-target"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#EFECE6] flex items-center justify-center font-bold text-[11px] text-[#4F6D60] group-hover:border-[#7A9A8B]/40">
                    {item.safetyScore}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2B2A29] block truncate max-w-[130px] group-hover:text-[#4F6D60]">
                      {item.productName}
                    </span>
                    <span className="text-[9px] text-[#9C9790] block">
                      {item.safetyRating} • {new Date(item.auditedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F1721]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFCF9] rounded-3xl shadow-2xl border border-[#E8E0D8] w-full max-w-xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1A4D63] via-[#2D6680] to-[#1A2332] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#3A7A96]/60 rounded-xl border border-[#5FA8C2]/30">
                  <ScanLine className="w-5 h-5 text-[#A8D4E6]" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Foto de tu Cosmético</h3>
                  <p className="text-xs text-[#A8D4E6]/90">Analizamos el envase o la lista de ingredientes</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrModalOpen(false)}
                className="text-[#C5BBB2] hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Image Preview & Scanner Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-[#E8E0D8] bg-[#1A2332] h-48 flex items-center justify-center">
                {ocrImagePreview && (
                  <img
                    src={ocrImagePreview}
                    alt="Foto del producto"
                    className={`h-full w-full object-contain ${isOcrScanning ? 'opacity-70 blur-[0.5px]' : ''}`}
                  />
                )}
                
                {isOcrScanning && (
                  <div className="absolute inset-0 bg-[#0F3344]/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <Activity className="w-8 h-8 text-[#8EC5DB] animate-spin mb-3" />
                    <span className="text-white font-bold text-sm sm:text-base">{ocrStatusText}</span>
                    <div className="w-48 sm:w-64 bg-[#5A5A5A] rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className="bg-[#7BB8D0] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.round(ocrProgress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recognition Result - Friendly Context */}
              {!isOcrScanning && ocrResult && (
                <div className="space-y-3">
                  {ocrResult.labelType === 'FRONT_BRANDING' ? (
                    <div className="p-4 bg-amber-50/95 border-2 border-amber-300/80 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-amber-900 bg-amber-200 px-2.5 py-0.5 rounded-lg">
                          📸 Frente del Producto Detectado
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-amber-950">
                        Identificamos: <strong>{ocrResult.detectedProductName || 'Producto comercial'}</strong>.
                      </p>
                      <p className="text-[11px] text-amber-900/90 bg-white/70 p-2 rounded-xl border border-amber-200 leading-relaxed">
                        ✨ Cargamos la <strong>fórmula oficial registrada</strong> para este producto. Si deseas auditar un lote en específico, puedes girar el envase y tomar foto a los ingredientes al reverso.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border-2 border-emerald-300/80 rounded-2xl flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-xs text-emerald-950">
                        <span className="font-bold text-sm text-emerald-900">🧪 Ingredientes detectados con éxito.</span>
                        <p className="text-[11px] text-emerald-800 mt-0.5">Listo para analizar qué hace cada componente en tu piel.</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-[#5A5A5A] block mb-1">
                      Nombre o ingredientes identificados:
                    </label>
                    <textarea
                      rows={3}
                      value={editableOcrText}
                      onChange={(e) => setEditableOcrText(e.target.value)}
                      className="w-full bg-[#FAF7F4] border border-[#C5BBB2] rounded-xl p-2.5 text-xs text-[#2D2D2D] focus:bg-[#FFFCF9] focus:border-[#4A8BA8] focus:outline-none"
                      placeholder="Nombre del producto o lista de ingredientes..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF7F4] p-4 sm:p-5 border-t border-[#E8E0D8] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto text-xs font-bold text-[#5A5A5A] bg-[#FFFCF9] border border-[#C5BBB2] px-4 py-2.5 rounded-xl hover:bg-[#F5EDE6] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#6B6B6B]" />
                <span>Tomar otra foto</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOcrModalOpen(false)}
                  className="w-1/2 sm:w-auto text-xs font-semibold text-[#6B6B6B] px-4 py-2.5 rounded-xl hover:bg-[#E8E0D8] transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isOcrScanning || !editableOcrText.trim()}
                  onClick={handleConfirmOcrAudit}
                  className="w-1/2 sm:w-auto bg-gradient-to-r from-[#4A8BA8] to-[#3A7A96] hover:from-[#3A7A96] hover:to-[#2D6680] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-[#4A8BA8]/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Evaluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm font-medium">
            <span className="font-bold">Nota: </span>
            {error}
          </div>
        </div>
      )}

      {/* AUDIT RESULTS REPORT SECTION */}
      <div ref={resultsRef}>
        {report && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Summary Card - Beauty Editorial Design */}
            <div className="bg-[#2B2A29] text-[#FDFBF7] rounded-3xl p-6 sm:p-8 shadow-beauty relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#7A9A8B]/20 text-[#A3B899] border border-[#7A9A8B]/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Ficha de Formulación Cosmética
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#FFFFFF]">
                    {report.meta.product_name}
                  </h2>
                  <p className="text-[#C4A482] text-xs sm:text-sm">
                    {report.meta.active_ingredients_count} ingredientes botánicos y activos clave analizados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="bg-white/10 hover:bg-white/20 text-[#FDFBF7] text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-sm transition-all flex items-center gap-1.5 border border-white/10 touch-target"
                  >
                    <X className="w-4 h-4" />
                    <span>Nueva Búsqueda</span>
                  </button>
                </div>
              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#7A9A8B]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#E8D5D0]/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* VIEW MODE TOGGLE SWITCH (Guía Sencilla vs Ficha Técnica) */}
            <div className="bg-[#FFFFFF] p-1.5 rounded-full border border-[#EFECE6] shadow-beauty flex items-center justify-center gap-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setViewMode('SIMPLE')}
                className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                  viewMode === 'SIMPLE'
                    ? 'bg-[#7A9A8B] text-white shadow-xs'
                    : 'text-[#6E6A66] hover:bg-[#FAF8F5]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Guía Esencial</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('SCIENTIFIC')}
                className={`flex-1 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer touch-target ${
                  viewMode === 'SCIENTIFIC'
                    ? 'bg-[#7A9A8B] text-white shadow-xs'
                    : 'text-[#6E6A66] hover:bg-[#FAF8F5]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ficha Técnica INCI</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* VIEW 1: MODO SIMPLE (Guía Esencial de Belleza & Cuidado) */}
            {/* ======================================================== */}
            {viewMode === 'SIMPLE' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* TOP SCORE DIAL & BEAUTY CERTIFICATIONS CARD */}
                {(() => {
                  const safetyScore = Math.min(100, Math.max(45,
                    report.ai_clinical_copilot?.friction_risk_level === 'HIGH' ? 55 :
                    report.ai_clinical_copilot?.friction_risk_level === 'MODERATE' ? 72 :
                    report.ai_clinical_copilot?.barrier_warning ? 84 : 95
                  ));
                  const isExfoliant = report.meta.product_name.toLowerCase().includes('bha') || report.meta.product_name.toLowerCase().includes('ácido') || report.meta.product_name.toLowerCase().includes('salicyl') || report.meta.product_name.toLowerCase().includes('glicol');
                  const isRetinoid = report.meta.product_name.toLowerCase().includes('retin');
                  const suggestedNight = isExfoliant ? 1 : isRetinoid ? 2 : 3;

                  return (
                    <div className="bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#EFECE6] shadow-beauty flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        {/* Circular Animated SVG Progress Gauge */}
                        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="transparent"
                              stroke="#EFF5F1"
                              strokeWidth="8"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              fill="transparent"
                              stroke="#7A9A8B"
                              strokeWidth="8"
                              strokeDasharray="264"
                              strokeDashoffset={264 - (264 * safetyScore) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-xl font-bold font-serif text-[#2B2A29] leading-none">
                              {safetyScore}
                            </span>
                            <span className="text-[9px] font-bold text-[#9C9790] uppercase">
                              /100
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="bg-[#EFF5F1] text-[#4F6D60] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#7A9A8B]/30">
                              {safetyScore >= 88 ? 'Excelente Seguridad' : safetyScore >= 70 ? 'Seguridad Buena' : 'Uso con Precaución'}
                            </span>
                          </div>
                          <h3 className="text-lg font-serif font-bold text-[#2B2A29]">
                            Índice de Compatibilidad Dérmica
                          </h3>
                          <p className="text-xs text-[#6E6A66] max-w-md">
                            Fórmula biocompatible con {report.meta.active_ingredients_count} activos funcionales registrados.
                          </p>

                          {/* Beauty Certification Badges */}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 bg-[#FAF8F5] text-[#2B2A29] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#EFECE6]">
                              <Leaf className="w-3 h-3 text-[#7A9A8B]" />
                              <span>Clean Formula</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#FAF8F5] text-[#2B2A29] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#EFECE6]">
                              <ShieldCheck className="w-3 h-3 text-[#7A9A8B]" />
                              <span>Sin Alérgenos Críticos</span>
                            </span>
                            <span className="inline-flex items-center gap-1 bg-[#FAF8F5] text-[#2B2A29] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[#EFECE6]">
                              <Sparkles className="w-3 h-3 text-[#7A9A8B]" />
                              <span>No Comedogénico</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SKIN CYCLING INTEGRATION CTA */}
                      <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-[#EFECE6]">
                        {isAddedToRoutineSuccess ? (
                          <div className="bg-[#EFF5F1] text-[#4F6D60] border border-[#7A9A8B]/40 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#7A9A8B]" />
                            <span>¡Guardado en Noche {routineNightAssigned === 0 ? 'AM' : routineNightAssigned}!</span>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                            <button
                              type="button"
                              onClick={() => handleAssignToSkinCycling(suggestedNight)}
                              className="w-full sm:w-auto bg-[#4F6D60] hover:bg-[#3D554A] text-white text-xs font-bold px-5 py-3 rounded-full shadow-beauty flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] cursor-pointer touch-target"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Asignar a Ciclado (Noche {suggestedNight})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssignToSkinCycling(0)}
                              className="w-full sm:w-auto bg-[#FAF8F5] hover:bg-[#EFF5F1] text-[#2B2A29] hover:text-[#4F6D60] border border-[#EFECE6] text-xs font-bold px-4 py-3 rounded-full flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer touch-target"
                              title="Asignar a Mañanas (AM)"
                            >
                              <Sun className="w-3.5 h-3.5 text-[#C4A482]" />
                              <span>Rutina AM</span>
                            </button>
                          </div>
                        )}
                        <span className="text-[10px] text-[#9C9790]">
                          Sincroniza con tu calendario diario
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 3 Main Direct Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Card 1: ¿Qué hace en tu piel? */}
                  <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#EFF5F1] text-[#4F6D60] border border-[#7A9A8B]/30 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 text-[#7A9A8B]" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2B2A29]">
                        1. Propósito & Beneficios
                      </h3>
                      <p className="text-xs text-[#6E6A66] leading-relaxed">
                        {report.ai_clinical_copilot.plain_language_summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EFECE6]">
                      <span className="text-[11px] font-bold text-[#9C9790] block mb-1.5 uppercase tracking-wider">Acción cosmética:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.clinical_indications.slice(0, 3).map((ind, i) => (
                          <span key={i} className="text-[11px] bg-[#FAF8F5] border border-[#EFECE6] text-[#4F6D60] font-semibold px-2.5 py-1 rounded-full">
                            ✓ {ind.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ¿Cuándo y cómo ponértelo? */}
                  <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#F8EFEA] text-[#A46864] border border-[#E8D5D0] flex items-center justify-center font-bold">
                        {report.layering_and_usage.recommended_timing === 'PM' ? (
                          <Moon className="w-5 h-5 text-[#A46864]" />
                        ) : (
                          <Sun className="w-5 h-5 text-[#C4A482]" />
                        )}
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2B2A29]">
                        2. Ritual de Aplicación
                      </h3>
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 font-bold text-xs text-[#2B2A29] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EFECE6]">
                          <span>Momento:</span>
                          <span className="text-[#7A9A8B]">
                            {report.layering_and_usage.recommended_timing === 'AM' && '☀️ Por las Mañanas'}
                            {report.layering_and_usage.recommended_timing === 'PM' && '🌙 Solo por las Noches'}
                            {report.layering_and_usage.recommended_timing === 'BOTH' && '☀️/🌙 Mañanas y Noches'}
                          </span>
                        </div>
                        <p className="text-xs text-[#6E6A66] leading-relaxed">
                          <strong>Orden recomendado:</strong> {report.layering_and_usage.layering_rule}
                        </p>
                      </div>
                    </div>

                    {/* Sunscreen indicator */}
                    <div className="pt-3 border-t border-[#EFECE6]">
                      {report.layering_and_usage.requires_sunscreen ? (
                        <div className="p-2.5 bg-[#F8EFEA] border border-[#E8D5D0] rounded-2xl text-[11px] text-[#A46864] font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#A46864] shrink-0" />
                          <span>Uso imprescindible de protector solar FPS 50+ de día.</span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-[#EFF5F1] border border-[#7A9A8B]/30 rounded-2xl text-[11px] text-[#4F6D60] font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#7A9A8B] shrink-0" />
                          <span>Uso diurno seguro con tu protector solar habitual.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: ¿Es seguro o hay riesgos? */}
                  <div className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#EFECE6] shadow-beauty space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] text-[#7A9A8B] border border-[#EFECE6] flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5 text-[#7A9A8B]" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2B2A29]">
                        3. Armonía & Precauciones
                      </h3>
                      
                      {report.chemical_conflicts.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-[#A46864] block">
                            ⚠️ Incompatibilidades de capa:
                          </span>
                          {report.chemical_conflicts.map((c, idx) => (
                            <p key={idx} className="text-xs text-[#A46864] bg-[#F8EFEA] p-2.5 rounded-xl border border-[#E8D5D0]">
                              No combinar con <strong>{c.ingredient_b}</strong> en la misma rutina para evitar irritaciones.
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#4F6D60] bg-[#EFF5F1] p-2.5 rounded-2xl border border-[#7A9A8B]/20">
                          ✓ Fórmula equilibrada y compatible sin conflictos conocidos.
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#EFECE6] text-[11px] text-[#9C9790]">
                      {report.ai_clinical_copilot.barrier_warning ? (
                        <span className="text-[#C4A482] font-semibold">⚠️ {report.ai_clinical_copilot.barrier_warning}</span>
                      ) : (
                        <span>💡 Aplica sobre el rostro limpio y ligeramente húmedo o seco.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Helpful Switcher Prompt */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('SCIENTIFIC')}
                    className="text-xs text-[#7A9A8B] hover:text-[#4F6D60] font-bold inline-flex items-center gap-1.5 touch-target hover:underline"
                  >
                    <span>Consultar desglose técnico INCI y respaldo de literatura científica</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: MODO CIENTÍFICO (Para Elena y Valeria)           */}
            {/* ======================================================== */}
            {viewMode === 'SCIENTIFIC' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Quick Metrics KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Evidence Grade */}
                  <div className="bg-[#FFFCF9] p-4 sm:p-5 rounded-2xl border border-[#E8E0D8] shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider">
                      Evidencia Médica
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black ${
                        report.scientific_evidence.overall_evidence_grade === 'A' 
                          ? 'text-[#3A7A96] bg-[#E8F4FA] px-2 py-0.5 rounded-lg border border-[#A8D4E6]' 
                          : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200'
                      }`}>
                        Nivel {report.scientific_evidence.overall_evidence_grade}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B8178] truncate">
                      {report.scientific_evidence.total_referenced_studies} estudios en PubMed
                    </p>
                  </div>

                  {/* Routine Timing */}
                  <div className="bg-[#FFFCF9] p-4 sm:p-5 rounded-2xl border border-[#E8E0D8] shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider">
                      Uso en Rutina
                    </span>
                    <div className="flex items-center gap-1.5">
                      {report.layering_and_usage.recommended_timing === 'AM' && <Sun className="w-5 h-5 text-amber-500" />}
                      {report.layering_and_usage.recommended_timing === 'PM' && <Moon className="w-5 h-5 text-indigo-500" />}
                      {report.layering_and_usage.recommended_timing === 'BOTH' && (
                        <div className="flex items-center text-[#4A8BA8]">
                          <Sun className="w-4 h-4" />
                          <Moon className="w-4 h-4 -ml-1" />
                        </div>
                      )}
                      <span className="text-base sm:text-lg font-bold text-[#2D2D2D]">
                        Rutina {report.layering_and_usage.recommended_timing === 'BOTH' ? 'AM/PM' : report.layering_and_usage.recommended_timing}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B8178] truncate">
                      Paso #{report.layering_and_usage.layering_step_order} del layering
                    </p>
                  </div>

                  {/* Sunscreen Requirement */}
                  <div className="bg-[#FFFCF9] p-4 sm:p-5 rounded-2xl border border-[#E8E0D8] shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider">
                      Protector Solar
                    </span>
                    <div className="flex items-center gap-1.5">
                      {report.layering_and_usage.requires_sunscreen ? (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          Obligatorio FPS 50+
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#3A7A96] bg-[#E8F4FA] border border-[#A8D4E6] px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4A8BA8]" />
                          Recomendado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8B8178] truncate">
                      Previene fotosensibilización
                    </p>
                  </div>

                  {/* Format Quality Score */}
                  <div className="bg-[#FFFCF9] p-4 sm:p-5 rounded-2xl border border-[#E8E0D8] shadow-sm space-y-1">
                    <span className="text-[11px] font-bold text-[#8B8178] uppercase tracking-wider">
                      Calidad de Formato
                    </span>
                    <div className="flex items-baseline gap-1">
                      <Zap className="w-4 h-4 text-[#4A8BA8] self-center" />
                      <span className="text-2xl font-black text-[#2D2D2D]">
                        {report.ai_clinical_copilot.format_quality_score}
                      </span>
                      <span className="text-xs text-[#A69D94]">/ 10</span>
                    </div>
                    <p className="text-[11px] text-[#8B8178] truncate">
                      {report.ai_clinical_copilot.format_type.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* PubMed References & Indications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Indications */}
                  <div className="bg-[#FFFCF9] rounded-3xl border border-[#E8E0D8] shadow-sm p-5 sm:p-7 space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#F0E8E0] pb-3">
                      <Sparkles className="w-5 h-5 text-[#4A8BA8]" />
                      <h3 className="font-bold text-[#2D2D2D] text-base sm:text-lg">
                        Indicaciones Clínicas de la Fórmula
                      </h3>
                    </div>

                    {report.clinical_indications.length > 0 ? (
                      <div className="space-y-3">
                        {report.clinical_indications.map((ind, idx) => (
                          <div key={idx} className="p-3.5 bg-[#FAF7F4] rounded-2xl border border-[#E8E0D8]/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-[#2D2D2D]">{ind.name}</span>
                              <span className="text-[10px] font-bold text-[#3A7A96] bg-[#C5E3F0]/70 px-2 py-0.5 rounded-md">
                                Nivel {ind.highest_evidence_level}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B6B6B] leading-relaxed">{ind.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {ind.supporting_actives.map((act, aIdx) => (
                                <span key={aIdx} className="text-[10px] bg-[#FFFCF9] border border-[#E8E0D8] text-[#5A5A5A] px-2 py-0.5 rounded-md font-semibold">
                                  {act.inci_name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8B8178]">No se detectaron activos con indicaciones farmacológicas mayores.</p>
                    )}
                  </div>

                  {/* PubMed References */}
                  <div className="bg-[#FFFCF9] rounded-3xl border border-[#E8E0D8] shadow-sm p-5 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F0E8E0] pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#4A8BA8]" />
                        <h3 className="font-bold text-[#2D2D2D] text-base sm:text-lg">
                          Estudios Médicos en PubMed (NCBI)
                        </h3>
                      </div>
                      <span className="text-xs text-[#8B8178] font-medium">Verificación Médica</span>
                    </div>

                    {report.scientific_evidence.studies.length > 0 ? (
                      <div className="space-y-3">
                        {report.scientific_evidence.studies.map((study, idx) => (
                          <a
                            key={idx}
                            href={study.pubmed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3.5 bg-[#FAF7F4] hover:bg-[#E8F4FA]/60 rounded-2xl border border-[#E8E0D8]/80 hover:border-[#8EC5DB] transition group space-y-1.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-[#2D2D2D] group-hover:text-[#2D6680] leading-snug line-clamp-2">
                                {study.title}
                              </h4>
                              <ExternalLink className="w-3.5 h-3.5 text-[#A69D94] group-hover:text-[#4A8BA8] flex-shrink-0 mt-0.5" />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-[#8B8178]">
                              <span>PMID: {study.pmid}</span>
                              <span>•</span>
                              <span>{study.journal}</span>
                              <span>•</span>
                              <span className="font-bold text-[#3A7A96]">{study.study_type}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8B8178]">Fórmula de acondicionamiento básico o ingredientes no indexados.</p>
                    )}
                  </div>
                </div>

                {/* Layering & Chemical Conflicts */}
                <div className="bg-[#FFFCF9] rounded-3xl border border-[#E8E0D8] shadow-sm p-5 sm:p-7 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#F0E8E0] pb-3">
                    <Layers className="w-5 h-5 text-[#4A8BA8]" />
                    <h3 className="font-bold text-[#2D2D2D] text-base sm:text-lg">
                      Orden de Aplicación en Rutina (Layering)
                    </h3>
                  </div>

                  <div className="p-4 bg-[#E8F4FA]/70 border border-[#A8D4E6] rounded-2xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A4D63]">
                        Paso en Rutina: <span className="underline">Paso {report.layering_and_usage.layering_step_order} de 5</span>
                      </span>
                    </div>
                    <p className="text-xs text-[#2D6680] leading-relaxed">
                      {report.layering_and_usage.layering_rule}
                    </p>
                  </div>

                  {/* Chemical Conflicts if any */}
                  {report.chemical_conflicts.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                        ⚠️ Conflictos e Incompatibilidades Químicas Detectadas
                      </span>
                      {report.chemical_conflicts.map((conf, idx) => (
                        <div key={idx} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-900">
                              {conf.ingredient_a} ⚡ {conf.ingredient_b}
                            </span>
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-md">
                              Severidad {conf.severity}
                            </span>
                          </div>
                          <p className="text-xs text-rose-800">{conf.warning_message}</p>
                          <p className="text-[11px] text-rose-700 italic">Mitigación: {conf.mitigation_strategy}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ingredients Breakdown Table */}
                <div className="bg-[#FFFCF9] rounded-3xl border border-[#E8E0D8] shadow-sm p-5 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0E8E0] pb-3">
                    <h3 className="font-bold text-[#2D2D2D] text-base sm:text-lg">
                      Desglose Químico Oficial ({report.ingredients_breakdown.length} componentes)
                    </h3>
                    <span className="text-[11px] text-[#8B8178] font-semibold">Norma CosIng UE</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E8E0D8] text-[#8B8178] uppercase tracking-wider font-semibold">
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">Nombre INCI Oficial</th>
                          <th className="py-2.5 px-3">Funciones CosIng UE</th>
                          <th className="py-2.5 px-3 text-center">Comedogénico (Poros)</th>
                          <th className="py-2.5 px-3 text-center">Irritación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EDE6] text-[#5A5A5A]">
                        {report.ingredients_breakdown.map((item, idx) => (
                          <tr key={idx} className={item.is_active ? 'bg-[#E8F4FA]/40 font-medium' : ''}>
                            <td className="py-2.5 px-3 text-[#A69D94]">{item.position}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#2D2D2D]">
                              {item.inci_name}
                              {item.common_name && (
                                <span className="block text-[11px] text-[#3A7A96] font-normal">{item.common_name}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="flex flex-wrap gap-1">
                                {item.cosing_functions.map((fn, fIdx) => (
                                  <span key={fIdx} className="bg-[#F5EDE6] text-[#5A5A5A] px-1.5 py-0.5 rounded text-[10px]">
                                    {fn}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span className={item.comedogenic_rating >= 3 ? 'text-rose-600' : 'text-[#6B6B6B]'}>
                                {item.comedogenic_rating} / 5
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">
                              <span className={item.irritation_rating >= 2 ? 'text-amber-600' : 'text-[#6B6B6B]'}>
                                {item.irritation_rating} / 5
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
