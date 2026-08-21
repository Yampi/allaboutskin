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
  Info
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
  const [selectedOcrMode, setSelectedOcrMode] = useState<'AUTO' | 'OFFICIAL_FORMULA' | 'RAW_TEXT'>('AUTO');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAudit = async (customQuery?: string, customPrice?: number | null) => {
    const query = (customQuery ?? omniInput).trim();
    if (!query) {
      setError('Por favor escribe el nombre de un producto, pega sus ingredientes o escanea la etiqueta.');
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
      } else if (!query.includes(',') && query.length < 80) {
        productNameCandidate = query;
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
      setError(err.message || 'Error al procesar la auditoría científica.');
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
    setOcrStatusText('Analizando imagen de etiqueta cosmética...');
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
        setSelectedOcrMode('OFFICIAL_FORMULA');
      } else {
        setEditableOcrText(analysis.cleanedText || recognizedText);
        setSelectedOcrMode('RAW_TEXT');
      }

      if (analysis.detectedPrice && !productPrice) {
        setProductPrice(analysis.detectedPrice.toString());
      }
    } catch (err: any) {
      setOcrStatusText('No se pudo completar el reconocimiento óptico.');
      setError('Error al procesar la foto con OCR: ' + (err.message || 'Intente con mayor iluminación.'));
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
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-teal-900/10 border border-slate-200/90 p-4 sm:p-7 transition-all">
        
        {/* Top Tagline / Mode Switch */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Evaluador Científico & Misceláneas
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition flex items-center gap-1.5 ${
              showAdvanced || productPrice
                ? 'bg-teal-50 text-teal-800 border-teal-300' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>{showAdvanced ? 'Ocultar Filtros' : 'Afinar (+ Precio / Piel)'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* UNIFIED 1-INPUT SMART OMNI-SEARCH BAR */}
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-50 hover:bg-slate-50/90 focus-within:bg-white rounded-2xl border-2 border-slate-200/90 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-500/15 shadow-inner transition-all p-1.5 sm:p-2 gap-2">
            
            {/* Search Icon / Indicator */}
            <div className="hidden sm:flex items-center pl-3 text-slate-400">
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
              placeholder="Escribe el producto, marca o pega ingredientes (ej: Hawaiian Tropic Ozono 50+, Niacinamida, Retinol)..."
              className="w-full bg-transparent px-3 py-2 text-slate-900 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />

            {/* Clear Button (If has text) */}
            {omniInput && (
              <button
                type="button"
                onClick={handleClear}
                className="hidden sm:flex p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition self-center"
                title="Limpiar búsqueda"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Action Group: Camera OCR Button + Audit Submit Button */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/80">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm px-3.5 py-2.5 rounded-xl transition active:scale-95 flex-shrink-0 cursor-pointer"
                title="Escanear etiqueta con visión artificial OCR"
              >
                <Camera className="w-4 h-4 text-teal-600" />
                <span className="inline">Foto / OCR</span>
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
                className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-95 flex-shrink-0 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Evaluando...</span>
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

        {/* PROGRESSIVE DISCLOSURE: OPTIONAL FILTERS */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Precio del Producto (Opcional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="ej: 14.99"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="VES">VES (Bs.)</option>
                <option value="MXN">MXN ($)</option>
                <option value="COP">COP ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Perfil de Piel
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:bg-white focus:border-teal-500 focus:outline-none"
              >
                <option value="COMBINATION">Mixta a Grasa</option>
                <option value="DRY">Seca / Deshidratada</option>
                <option value="SENSITIVE">Sensible / Reactiva</option>
                <option value="ACNE_PRONE">Tendencia al Acné</option>
                <option value="NORMAL">Normal</option>
              </select>
            </div>
          </div>
        )}

        {/* QUICK PRESET CHIPS */}
        <div className="mt-4 flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            Populares:
          </span>
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200/80 transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span className="text-[10px] text-teal-700 font-bold">[{preset.badge}]</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* OCR SMART CONFIRMATION & VISION MODAL */}
      {isOcrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-700/60 rounded-xl border border-teal-500/30">
                  <ScanLine className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Escáner Óptico de Cosméticos & Fórmulas</h3>
                  <p className="text-xs text-teal-200/90">Visión artificial para reconocimiento de empaques e INCI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOcrModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Image Preview & Scanner Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-48 sm:h-56 flex items-center justify-center">
                {ocrImagePreview && (
                  <img
                    src={ocrImagePreview}
                    alt="Etiqueta escaneada"
                    className={`h-full w-full object-contain ${isOcrScanning ? 'opacity-70 blur-[0.5px]' : ''}`}
                  />
                )}
                
                {isOcrScanning && (
                  <div className="absolute inset-0 bg-teal-950/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                    <Activity className="w-8 h-8 text-teal-300 animate-spin mb-3" />
                    <span className="text-white font-bold text-sm sm:text-base">{ocrStatusText}</span>
                    <div className="w-48 sm:w-64 bg-slate-700 rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className="bg-teal-400 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${Math.round(ocrProgress * 100)}%` }}
                      />
                    </div>
                    <span className="text-teal-200 text-xs mt-1.5 font-mono">{Math.round(ocrProgress * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Recognition Result Analysis Card */}
              {!isOcrScanning && ocrResult && (
                <div className="space-y-3">
                  {/* Front vs Back Context Notice */}
                  {ocrResult.labelType === 'FRONT_BRANDING' ? (
                    <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                              Frente del Envase Detectado
                            </span>
                            {ocrResult.isSunscreen && (
                              <span className="text-xs font-bold text-amber-900 bg-orange-200 px-2 py-0.5 rounded-md">
                                Protector Solar
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-amber-900 leading-relaxed">
                            {ocrResult.detectedProductName ? (
                              <>
                                Identificamos el producto: <strong>{ocrResult.detectedProductName}</strong>
                                {ocrResult.detectedBrand && ` de ${ocrResult.detectedBrand}`}.
                              </>
                            ) : (
                              <>La foto corresponde a la cara comercial del envase.</>
                            )}
                          </p>
                          <p className="text-[11px] text-amber-800/90">
                            💡 <em>Tip de Dermatología:</em> El frente contiene el nombre y claims. Para auditar el lote específico de fabricación, gira el envase y fotografía la lista <strong>INCI / Ingredientes</strong> al reverso.
                          </p>
                        </div>
                      </div>

                      {ocrResult.suggestedOfficialInci && (
                        <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-amber-900 font-semibold">
                            Fórmula oficial en catálogo cargada automáticamente
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOcrMode('OFFICIAL_FORMULA');
                              setEditableOcrText(`${ocrResult.detectedProductName}: ${ocrResult.suggestedOfficialInci}`);
                            }}
                            className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                              selectedOcrMode === 'OFFICIAL_FORMULA'
                                ? 'bg-amber-800 text-white'
                                : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100'
                            }`}
                          >
                            Usar Fórmula Oficial
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs text-emerald-900">
                        <span className="font-bold">Reverso / Lista INCI detectada con éxito.</span>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Se extrajeron los componentes químicos de la fórmula cosmética.</p>
                      </div>
                    </div>
                  )}

                  {/* Editable OCR Payload */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Texto Extraído para Auditoría (Puedes editarlo si detectas un error tipográfico):
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditableOcrText(cleanOcrCosmeticText(ocrResult.rawText))}
                        className="text-[11px] text-teal-700 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Limpiar ruido OCR
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={editableOcrText}
                      onChange={(e) => setEditableOcrText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 focus:outline-none leading-relaxed font-mono"
                      placeholder="Lista INCI o nombre de producto..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto text-xs font-bold text-slate-700 bg-white border border-slate-300 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-slate-600" />
                <span>Tomar otra foto</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOcrModalOpen(false)}
                  className="w-1/2 sm:w-auto text-xs font-semibold text-slate-600 px-4 py-2.5 rounded-xl hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isOcrScanning || !editableOcrText.trim()}
                  onClick={handleConfirmOcrAudit}
                  className="w-1/2 sm:w-auto bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auditar Fórmula</span>
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
            <span className="font-bold">Aviso: </span>
            {error}
          </div>
        </div>
      )}

      {/* AUDIT RESULTS REPORT SECTION */}
      <div ref={resultsRef}>
        {report && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header / Summary Card */}
            <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-teal-500/30 text-teal-200 border border-teal-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Evaluación Completa
                    </span>
                    <span className="bg-amber-500/30 text-amber-200 border border-amber-400/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {report.ai_clinical_copilot.transparency_meta.source_label}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {report.meta.product_name}
                  </h2>
                  <p className="text-teal-200/80 text-xs sm:text-sm">
                    {report.meta.active_ingredients_count} activos principales • {report.meta.total_ingredients_count} componentes evaluados
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
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-700/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Quick Metrics KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Evidence Grade */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Evidencia Médica
                </span>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${
                    report.scientific_evidence.overall_evidence_grade === 'A' 
                      ? 'text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200' 
                      : 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200'
                  }`}>
                    Nivel {report.scientific_evidence.overall_evidence_grade}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {report.scientific_evidence.total_referenced_studies} estudios en PubMed
                </p>
              </div>

              {/* Routine Timing */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Uso en Rutina
                </span>
                <div className="flex items-center gap-1.5">
                  {report.layering_and_usage.recommended_timing === 'AM' && <Sun className="w-5 h-5 text-amber-500" />}
                  {report.layering_and_usage.recommended_timing === 'PM' && <Moon className="w-5 h-5 text-indigo-500" />}
                  {report.layering_and_usage.recommended_timing === 'BOTH' && (
                    <div className="flex items-center text-teal-600">
                      <Sun className="w-4 h-4" />
                      <Moon className="w-4 h-4 -ml-1" />
                    </div>
                  )}
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    Rutina {report.layering_and_usage.recommended_timing === 'BOTH' ? 'AM/PM' : report.layering_and_usage.recommended_timing}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Paso #{report.layering_and_usage.layering_step_order} del layering
                </p>
              </div>

              {/* Sunscreen Requirement */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Protector Solar
                </span>
                <div className="flex items-center gap-1.5">
                  {report.layering_and_usage.requires_sunscreen ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Obligatorio FPS 50+
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Recomendado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  Previene fotosensibilización
                </p>
              </div>

              {/* Format Quality Score */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Calidad de Formato
                </span>
                <div className="flex items-baseline gap-1">
                  <Zap className="w-4 h-4 text-teal-600 self-center" />
                  <span className="text-2xl font-black text-slate-900">
                    {report.ai_clinical_copilot.format_quality_score}
                  </span>
                  <span className="text-xs text-slate-400">/ 10</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {report.ai_clinical_copilot.format_type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* AI Clinical Copilot & Format Analysis */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      Evaluación de Formato & Copilot Clínico
                    </h3>
                    <p className="text-xs text-slate-500">
                      Formato: <span className="font-semibold text-teal-800">{report.ai_clinical_copilot.format_type.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-semibold">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Confianza: {Math.round(report.ai_clinical_copilot.transparency_meta.confidence_score * 100)}%</span>
                </div>
              </div>

              {/* Plain Language Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-200/70">
                💡 {report.ai_clinical_copilot.plain_language_summary}
              </div>

              {/* Physical Applicator / Barrier Friction Warning */}
              {report.ai_clinical_copilot.barrier_warning && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                      Advertencia de Fricción Mecánica y Barrera Cutánea
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {report.ai_clinical_copilot.barrier_warning}
                    </p>
                  </div>
                </div>
              )}

              {/* Split Protocol: Contraindications & How To Use */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Contraindicaciones Clínicas
                  </span>
                  {report.ai_clinical_copilot.contraindications.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {report.ai_clinical_copilot.contraindications.map((contra, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{contra}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">Sin contraindicaciones físicas severas detectadas.</p>
                  )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                    Protocolo de Uso Óptimo
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <p><strong>¿Cuándo?:</strong> {report.ai_clinical_copilot.when_to_use || 'Según indicación de activos'}</p>
                    <p><strong>¿Cómo?:</strong> {report.ai_clinical_copilot.how_to_use || 'Aplicar uniformemente sobre la piel limpia'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Split: Clinical Indications & PubMed Studies */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Indications */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    Indicaciones Clínicas de la Fórmula
                  </h3>
                </div>

                {report.clinical_indications.length > 0 ? (
                  <div className="space-y-3">
                    {report.clinical_indications.map((ind, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{ind.name}</span>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md">
                            Nivel {ind.highest_evidence_level}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{ind.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ind.supporting_actives.map((act, aIdx) => (
                            <span key={aIdx} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                              {act.inci_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No se detectaron activos con indicaciones farmacológicas mayores.</p>
                )}
              </div>

              {/* PubMed References */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      Estudios Médicos en PubMed (NCBI)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Verificación Médica</span>
                </div>

                {report.scientific_evidence.studies.length > 0 ? (
                  <div className="space-y-3">
                    {report.scientific_evidence.studies.map((study, idx) => (
                      <a
                        key={idx}
                        href={study.pubmed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3.5 bg-slate-50 hover:bg-teal-50/60 rounded-2xl border border-slate-200/80 hover:border-teal-300 transition group space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 leading-snug line-clamp-2">
                            {study.title}
                          </h4>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>PMID: {study.pmid}</span>
                          <span>•</span>
                          <span>{study.journal}</span>
                          <span>•</span>
                          <span className="font-bold text-teal-700">{study.study_type}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Fórmula de acondicionamiento básico o ingredientes no indexados.</p>
                )}
              </div>
            </div>

            {/* Layering & Chemical Conflicts */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Orden de Aplicación en Rutina (Layering)
                </h3>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-900">
                    Paso en Rutina: <span className="underline">Paso {report.layering_and_usage.layering_step_order} de 5</span>
                  </span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Desglose de Componentes ({report.ingredients_breakdown.length})
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">Norma CosIng UE</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Nombre INCI Oficial</th>
                      <th className="py-2.5 px-3">Funciones CosIng UE</th>
                      <th className="py-2.5 px-3 text-center">Comedogenicidad</th>
                      <th className="py-2.5 px-3 text-center">Irritación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {report.ingredients_breakdown.map((item, idx) => (
                      <tr key={idx} className={item.is_active ? 'bg-teal-50/40 font-medium' : ''}>
                        <td className="py-2.5 px-3 text-slate-400">{item.position}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.inci_name}
                          {item.common_name && (
                            <span className="block text-[11px] text-teal-700 font-normal">{item.common_name}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {item.cosing_functions.map((fn, fIdx) => (
                              <span key={fIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                {fn}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={item.comedogenic_rating >= 3 ? 'text-rose-600' : 'text-slate-600'}>
                            {item.comedogenic_rating} / 5
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          <span className={item.irritation_rating >= 2 ? 'text-amber-600' : 'text-slate-600'}>
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
    </div>
  );
}
