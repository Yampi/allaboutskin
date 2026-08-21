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
  HelpCircle
} from 'lucide-react';
import { AuditReport, auditInci } from '@/lib/api';

const QUICK_PRESETS = [
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

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    // Simulating quick photo OCR feedback for camera scan
    setTimeout(() => {
      setIsLoading(false);
      const scannedSample = "Escaneo OCR: Aqua, Niacinamide, Dexpantenol, Zinc Oxide, Glycerin, Phenoxyethanol";
      setOmniInput(scannedSample);
      handleAudit(scannedSample, null);
    }, 1100);
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
              placeholder="Escribe el producto, marca o pega ingredientes (ej: Toallas Farmatodo, Niacinamida, Retinol)..."
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
                className="flex items-center gap-1.5 text-xs font-extrabold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm px-3.5 py-2.5 rounded-xl transition active:scale-95 flex-shrink-0"
                title="Abrir cámara para escanear etiqueta OCR"
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
                className="flex-grow sm:flex-grow-0 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition active:scale-95 flex-shrink-0"
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

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Progressive Disclosure Section (Optional Refinements) */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-2xl animate-fadeIn">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Precio Aproximado (Opcional)
              </label>
              <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="Ej: 3.50"
                  className="w-full px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-50 border-l border-slate-200 px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="VES">Bs VES</option>
                </select>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Permite a la IA calcular la relación coste-beneficio y buscar equivalentes más económicos.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tu Tipo de Piel Principal
              </label>
              <select
                value={skinType}
                onChange={(e) => setSkinType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                <option value="COMBINATION">Mixta (Zona T grasa, mejillas normales)</option>
                <option value="OILY">Grasa / Tendencia a Acné</option>
                <option value="SENSITIVE">Sensible / Reactiva / Rosácea</option>
                <option value="DRY">Seca / Deshidratada</option>
                <option value="NORMAL">Normal / Resistente</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Personaliza las advertencias de barrera y contraindicaciones de fricción.
              </span>
            </div>
          </div>
        )}

        {/* Quick Example Chips (Horizontal swipeable on mobile) */}
        <div className="mt-3.5 pt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar text-xs">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            Populares:
          </span>
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className="flex-shrink-0 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 hover:border-teal-300 text-slate-700 font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200/90 transition-all active:scale-95 text-[11px]"
            >
              <span className="text-teal-700 font-bold mr-1">[{preset.badge}]</span>
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS & AUDIT REPORT SECTION */}
      <div ref={resultsRef}>
        {report && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-16 md:pb-6">
            
            {/* Active Product Header Banner */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 text-white rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-teal-700/50">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-800/80 px-2.5 py-0.5 rounded-md border border-teal-600/50">
                    Evaluación Completa
                  </span>
                  {report.ai_clinical_copilot && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      {report.ai_clinical_copilot.transparency_meta.source_label}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-tight">
                  {report.meta.product_name}
                </h3>
                <p className="text-xs text-teal-100 mt-1 font-medium">
                  {report.meta.active_ingredients_count} activos principales • {report.meta.total_ingredients_count} componentes evaluados
                  {report.ai_clinical_copilot?.price_context?.price && (
                    <span> • Ref: {report.ai_clinical_copilot.price_context.price} {report.ai_clinical_copilot.price_context.currency}</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/25 transition self-start sm:self-center flex items-center gap-1.5"
              >
                <span>✕ Nueva Búsqueda</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Evidencia Médica
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-base sm:text-xl font-black px-2 py-0.5 rounded-lg w-max ${
                    report.scientific_evidence.overall_evidence_grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                    report.scientific_evidence.overall_evidence_grade === 'B' ? 'bg-teal-100 text-teal-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Nivel {report.scientific_evidence.overall_evidence_grade}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">
                    {report.scientific_evidence.total_referenced_studies} estudios en PubMed
                  </span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Uso en Rutina
                </span>
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm sm:text-base mt-1">
                  {report.layering_and_usage.recommended_timing === 'AM' && <Sun className="w-4 h-4 text-amber-500" />}
                  {report.layering_and_usage.recommended_timing === 'PM' && <Moon className="w-4 h-4 text-indigo-500" />}
                  {report.layering_and_usage.recommended_timing === 'BOTH' && (
                    <div className="flex text-teal-600"><Sun className="w-3.5 h-3.5" /><Moon className="w-3.5 h-3.5 -ml-1" /></div>
                  )}
                  <span>Rutina {report.layering_and_usage.recommended_timing === 'BOTH' ? 'AM/PM' : report.layering_and_usage.recommended_timing}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Protector Solar
                </span>
                <div className="mt-1">
                  {report.layering_and_usage.requires_sunscreen ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                      <ShieldAlert className="w-3 h-3" />
                      OBLIGATORIO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3 text-teal-600" />
                      Recomendado
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Calidad de Formato
                </span>
                <div className="flex items-center gap-1 text-slate-900 font-bold text-sm sm:text-base mt-1">
                  <Zap className="w-4 h-4 text-teal-600" />
                  <span>{report.ai_clinical_copilot?.format_quality_score ?? 8.5} / 10</span>
                </div>
              </div>
            </div>

            {/* AI Clinical Copilot & Format Analysis Card */}
            {report.ai_clinical_copilot && (
              <div className="bg-white rounded-3xl border-2 border-teal-600/30 p-5 sm:p-7 shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span>Evaluación de Formato & Copilot Clínico</span>
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Formato: <strong className="text-teal-700 uppercase">{report.ai_clinical_copilot.format_type.replace(/_/g, ' ')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Confidence Tag */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                      🏷️ Confianza: {Math.round(report.ai_clinical_copilot.transparency_meta.confidence_score * 100)}%
                    </span>
                  </div>
                </div>

                {/* Physical Rinse-Off Alert (for wipes / cleansers) */}
                {report.ai_clinical_copilot.is_rinse_off_required && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
                    <Droplets className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <strong className="text-amber-950 font-bold block text-sm">
                        ⚠️ Aclarado Posterior Obligatorio con Agua
                      </strong>
                      <p className="leading-relaxed">
                        Este producto contiene tensioactivos concentrados. <strong>Nunca debe dejarse secar sobre el rostro sin enjuagar</strong>, ya que disuelve los lípidos del manto protector y deshidrata el estrato córneo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary and Barrier Warning */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    💡 {report.ai_clinical_copilot.plain_language_summary}
                  </p>
                  {report.ai_clinical_copilot.barrier_warning && (
                    <p className="text-xs text-rose-800 bg-rose-50/80 p-3 rounded-xl border border-rose-200 font-medium">
                      ⚡ <strong>Impacto en Barrera Cutánea:</strong> {report.ai_clinical_copilot.barrier_warning}
                    </p>
                  )}
                </div>

                {/* Grid with Contraindications and How to use */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Contraindicaciones Clínicas
                    </span>
                    {report.ai_clinical_copilot.contraindications.length > 0 ? (
                      <ul className="space-y-1.5 text-slate-700">
                        {report.ai_clinical_copilot.contraindications.map((contra, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-500 font-bold">•</span>
                            <span>{contra}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500">Sin contraindicaciones físicas severas detectadas.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Protocolo de Uso Óptimo
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>¿Cuándo?:</strong> {report.ai_clinical_copilot.when_to_use || 'Uso habitual según rutina.'}
                    </p>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>¿Cómo?:</strong> {report.ai_clinical_copilot.how_to_use || 'Aplicar uniformemente sobre la piel.'}
                    </p>
                  </div>
                </div>

                {/* Superior Alternatives */}
                {report.ai_clinical_copilot.superior_alternatives.length > 0 && (
                  <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Alternativas Científicamente Superiores para tu Rutina
                    </span>
                    <div className="space-y-1.5">
                      {report.ai_clinical_copilot.superior_alternatives.map((alt, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-teal-950 font-medium bg-white p-2.5 rounded-xl border border-teal-100 shadow-sm">
                          <ArrowRight className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                          <span>{alt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chemical Conflicts Alert (If any) */}
            {report.chemical_conflicts.length > 0 && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-4 sm:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-base sm:text-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span>Incompatibilidad Química de Activos</span>
                </div>

                {report.chemical_conflicts.map((conflict, idx) => (
                  <div key={idx} className="bg-white/90 border border-rose-200 rounded-2xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900">{conflict.warning_message}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                        {conflict.severity}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>Razón Clínica:</strong> {conflict.clinical_rationale}
                    </p>
                    <p className="text-teal-900 font-semibold bg-teal-50 p-2 rounded-xl border border-teal-200">
                      💡 <strong>Mitigación:</strong> {conflict.mitigation_strategy}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Indications & PubMed Evidence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Indications */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Indicaciones Clínicas de la Fórmula
                </h3>

                <div className="space-y-2.5">
                  {report.clinical_indications.map((ind, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{ind.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                          Nivel {ind.highest_evidence_level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{ind.description}</p>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {ind.supporting_actives.map((act, aIdx) => (
                          <span key={aIdx} className="text-[10px] bg-white border border-slate-300 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {act.inci_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PubMed Evidence Studies */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    Estudios Médicos en PubMed (NCBI)
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Verificación Médica</span>
                </div>

                <div className="space-y-2.5">
                  {report.scientific_evidence.studies.length > 0 ? (
                    report.scientific_evidence.studies.map((study, idx) => (
                      <a
                        key={idx}
                        href={study.pubmed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-2xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-snug line-clamp-2">
                            {study.title}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 flex-shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-medium">
                          <span>PMID: <strong>{study.pmid}</strong></span>
                          <span>•</span>
                          <span>{study.journal}</span>
                          <span>•</span>
                          <span className="font-bold text-teal-700">{study.study_type}</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                      Estudios basados en literatura farmacológica general y base de datos CosIng UE.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Layering & Order of Application */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-2.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Orden de Aplicación en Rutina (Layering)
              </h3>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">
                  Paso en Rutina: <span className="text-teal-700">Paso {report.layering_and_usage.layering_step_order} de 5</span>
                </p>
                <p className="text-slate-600">{report.layering_and_usage.layering_rule}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
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
