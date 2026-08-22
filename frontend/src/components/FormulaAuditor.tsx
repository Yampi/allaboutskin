'use client';

import { useState, useRef } from 'react';
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
  HeartHandshake
} from 'lucide-react';
import { AuditReport, auditInci } from '@/lib/api';
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAudit = async (customQuery?: string, customPrice?: number | null) => {
    const query = (customQuery ?? omniInput).trim();
    if (!query) {
      setError('Por favor escribe el nombre de tu producto o pega sus ingredientes.');
      return;
    }

    setIsLoading(true);
    setError(null);

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
      {/* App-Style Search & Evaluation Hero Box */}
      <div className="bg-[#FFFCF9]/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-[#1A4D63]/10 border border-[#E8E0D8]/90 p-4 sm:p-7 transition-all">
        
        {/* Top Tagline / Mode Switch */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7BB8D0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4A8BA8]"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B8178]">
              Evaluador de Cosméticos & Skincare
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition flex items-center gap-1.5 ${
              showAdvanced || productPrice
                ? 'bg-[#E8F4FA] text-[#2D6680] border-[#8EC5DB]' 
                : 'bg-[#FAF7F4] text-[#6B6B6B] border-[#E8E0D8] hover:bg-[#F5EDE6]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A8BA8]" />
            <span>{showAdvanced ? 'Ocultar Opciones' : 'Opciones (+ Precio / Tipo de Piel)'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* UNIFIED 1-INPUT SMART OMNI-SEARCH BAR */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#FAF7F4] hover:bg-[#FAF7F4]/90 focus-within:bg-[#FFFCF9] rounded-2xl border-2 border-[#E8E0D8]/90 focus-within:border-[#4A8BA8] focus-within:ring-4 focus-within:ring-[#5FA8C2]/15 shadow-inner transition-all p-1.5 sm:p-2 gap-2">
            
            {/* Search Icon / Indicator */}
            <div className="hidden sm:flex items-center pl-3 text-[#A69D94]">
              <Search className="w-5 h-5" />
            </div>

            {/* Main Omni Input */}
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
              placeholder="Escribe el nombre de tu crema (ej: Nivea, The Ordinary, Protector Solar) o pega sus ingredientes..."
              className="w-full bg-transparent px-3 py-2 text-[#2D2D2D] text-sm sm:text-base placeholder:text-[#A69D94] focus:outline-none resize-none leading-relaxed"
            />

            {/* Clear Button (If has text) */}
            {omniInput && (
              <button
                type="button"
                onClick={handleClear}
                className="hidden sm:flex p-1.5 text-[#A69D94] hover:text-[#5A5A5A] rounded-lg transition self-center"
                title="Limpiar búsqueda"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Action Group: Camera OCR Button + Audit Submit Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E8E0D8]/80">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-extrabold bg-[#FFFCF9] hover:bg-[#F5EDE6] text-[#5A5A5A] border border-[#C5BBB2] shadow-sm px-3.5 py-2.5 rounded-xl transition active:scale-95 flex-shrink-0 cursor-pointer"
                title="Tomar foto al producto o ingredientes"
              >
                <Camera className="w-4 h-4 text-[#4A8BA8]" />
                <span className="inline">Foto / Escanear</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleCameraCapture}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {/* Main Submit Button */}
              <button
                type="button"
                onClick={() => handleAudit()}
                disabled={isLoading || !omniInput.trim()}
                className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-[#4A8BA8] to-[#3A7A96] hover:from-[#3A7A96] hover:to-[#2D6680] disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-[#4A8BA8]/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-95 flex-shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluar Producto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* PROGRESSIVE DISCLOSURE: OPTIONAL FILTERS */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[#E8E0D8] grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                Precio que pagaste (Opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="ej: 14.99"
                  className="w-full bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl px-3 py-2 text-sm focus:bg-[#FFFCF9] focus:border-[#5FA8C2] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl px-3 py-2 text-sm focus:bg-[#FFFCF9] focus:border-[#5FA8C2] focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="VES">VES (Bs.)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                ¿Cómo es tu tipo de piel?
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl px-3 py-2 text-sm focus:bg-[#FFFCF9] focus:border-[#5FA8C2] focus:outline-none"
              >
                <option value="COMBINATION">Mixta (Brillo en frente/nariz)</option>
                <option value="DRY">Seca (Tirante o áspera)</option>
                <option value="SENSITIVE">Sensible (Se enrojece fácil)</option>
                <option value="ACNE_PRONE">Grasa o con granitos</option>
                <option value="NORMAL">Normal / Equilibrada</option>
              </select>
            </div>
          </div>
        )}

        {/* QUICK PRESET CHIPS */}
        <div className="mt-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            Ejemplos populares:
          </span>
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs bg-[#F5EDE6] hover:bg-[#E8F4FA] hover:text-[#2D6680] hover:border-[#8EC5DB] text-[#5A5A5A] font-medium px-2.5 py-1 rounded-lg border border-[#E8E0D8]/80 transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span className="text-[10px] text-[#3A7A96] font-bold">[{preset.badge}]</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* HUMANIZED OCR MODAL */}
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
            {/* Header / Summary Card */}
            <div className="bg-gradient-to-br from-[#1A4D63] via-[#2D6680] to-[#1A2332] text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#5FA8C2]/30 text-[#A8D4E6] border border-[#7BB8D0]/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Resultado de Evaluación
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {report.meta.product_name}
                  </h2>
                  <p className="text-[#A8D4E6]/80 text-xs sm:text-sm">
                    {report.meta.active_ingredients_count} ingredientes activos principales identificados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClear}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5 border border-white/10"
                  >
                    <X className="w-4 h-4" />
                    <span>Nueva Búsqueda</span>
                  </button>
                </div>
              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#5FA8C2]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#3A7A96]/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* VIEW MODE TOGGLE SWITCH (Simple vs Scientific) */}
            <div className="bg-[#FFFCF9] p-2 rounded-2xl border border-[#E8E0D8] shadow-sm flex items-center justify-center gap-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setViewMode('SIMPLE')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === 'SIMPLE'
                    ? 'bg-[#4A8BA8] text-white shadow-md'
                    : 'text-[#6B6B6B] hover:bg-[#F5EDE6]'
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Modo Simple (Fácil)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('SCIENTIFIC')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === 'SCIENTIFIC'
                    ? 'bg-[#1A4D63] text-white shadow-md'
                    : 'text-[#6B6B6B] hover:bg-[#F5EDE6]'
                }`}
              >
                <Microscope className="w-4 h-4" />
                <span>Modo Científico (INCI & Papers)</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* VIEW 1: MODO SIMPLE (Para María y Sofía)                 */}
            {/* ======================================================== */}
            {viewMode === 'SIMPLE' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* 3 Main Direct Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1: ¿Qué hace en tu piel? */}
                  <div className="bg-[#FFFCF9] rounded-3xl p-5 border border-[#E8E0D8] shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-[#E8F4FA] text-[#2D6680] flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5 text-[#4A8BA8]" />
                      </div>
                      <h3 className="font-extrabold text-base text-[#2D2D2D]">
                        1. ¿Para qué sirve?
                      </h3>
                      <p className="text-xs text-[#5A5A5A] leading-relaxed">
                        {report.ai_clinical_copilot.plain_language_summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F0E8E0]">
                      <span className="text-[11px] font-bold text-[#8B8178] block mb-1">Beneficios principales:</span>
                      <div className="flex flex-wrap gap-1">
                        {report.clinical_indications.slice(0, 3).map((ind, i) => (
                          <span key={i} className="text-[11px] bg-[#FAF7F4] border border-[#E8E0D8] text-[#3A7A96] font-semibold px-2 py-0.5 rounded-lg">
                            ✓ {ind.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: ¿Cuándo y cómo ponértelo? */}
                  <div className="bg-[#FFFCF9] rounded-3xl p-5 border border-[#E8E0D8] shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                        {report.layering_and_usage.recommended_timing === 'PM' ? (
                          <Moon className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Sun className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-[#2D2D2D]">
                        2. ¿Cuándo aplicarlo?
                      </h3>
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 font-bold text-sm text-[#2D2D2D] bg-[#FAF7F4] px-2.5 py-1 rounded-xl border border-[#E8E0D8]">
                          <span>Momento:</span>
                          <span className="text-[#3A7A96]">
                            {report.layering_and_usage.recommended_timing === 'AM' && '☀️ Por las Mañanas'}
                            {report.layering_and_usage.recommended_timing === 'PM' && '🌙 Solo por las Noches'}
                            {report.layering_and_usage.recommended_timing === 'BOTH' && '☀️/🌙 Mañanas y Noches'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A5A5A] leading-relaxed">
                          <strong>Orden:</strong> {report.layering_and_usage.layering_rule}
                        </p>
                      </div>
                    </div>

                    {/* Sunscreen indicator */}
                    <div className="pt-3 border-t border-[#F0E8E0]">
                      {report.layering_and_usage.requires_sunscreen ? (
                        <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>¡Obligatorio usar protector solar FPS 50+ durante el día!</span>
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Uso diurno seguro con protector solar habitual.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: ¿Es seguro o hay riesgos? */}
                  <div className="bg-[#FFFCF9] rounded-3xl p-5 border border-[#E8E0D8] shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-extrabold text-base text-[#2D2D2D]">
                        3. Seguridad & Precauciones
                      </h3>
                      
                      {report.chemical_conflicts.length > 0 ? (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-rose-700 block">
                            ⚠️ No mezcles con:
                          </span>
                          {report.chemical_conflicts.map((c, idx) => (
                            <p key={idx} className="text-xs text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200">
                              Evita usarlo junto con <strong>{c.ingredient_b}</strong> en la misma aplicación para no irritar tu piel.
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                          ✓ Fórmula compatible y sin incompatibilidades severas conocidas.
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#F0E8E0] text-[11px] text-[#8B8178]">
                      {report.ai_clinical_copilot.barrier_warning ? (
                        <span className="text-amber-800 font-medium">⚠️ {report.ai_clinical_copilot.barrier_warning}</span>
                      ) : (
                        <span>💡 Aplica sobre el rostro limpio y seco.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Helpful Switcher Prompt */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('SCIENTIFIC')}
                    className="text-xs text-[#3A7A96] hover:text-[#1A4D63] hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>¿Quieres ver la lista química INCI completa y estudios médicos en PubMed?</span>
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
