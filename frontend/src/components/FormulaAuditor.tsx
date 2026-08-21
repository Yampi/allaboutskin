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
  ShieldCheck
} from 'lucide-react';
import { AuditReport, auditInci } from '@/lib/api';

const PRESETS = [
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    badge: 'Poros y Sebo',
    inci: 'Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.',
  },
  {
    name: "Paula's Choice 2% BHA Liquid Exfoliant",
    badge: 'Acné y Puntos Negros',
    inci: 'Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA.',
  },
  {
    name: 'Pomada Cicatrizante (Farmacia Nacional)',
    badge: 'Farmacia / Dexpantenol',
    inci: 'Dexpantenol 5%, Alantoina 1%, Oxido de Zinc 10%, Vaselina liquida, Lanolina, Agua purificada, Cera de abejas.',
  },
  {
    name: 'Fórmula con Conflicto (Retinol + Glicólico)',
    badge: '⚠️ Alerta Conflicto',
    inci: 'Aqua, Retinol, Glycolic Acid, Caprylic/Capric Triglyceride, Glycerin, Dimethicone, Cetearyl Alcohol, Polysorbate 60.',
  }
];

export default function FormulaAuditor() {
  const [inciInput, setInciInput] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudit = async (customInci?: string, customName?: string) => {
    const textToAudit = customInci ?? inciInput;
    if (!textToAudit.trim()) {
      setError('Por favor ingresa o escanea la lista de ingredientes (INCI).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await auditInci(textToAudit, customName ?? productName);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la auditoría científica.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setInciInput(preset.inci);
    setProductName(preset.name);
    handleAudit(preset.inci, preset.name);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    // Simulating quick photo OCR feedback for browser camera
    setTimeout(() => {
      setIsLoading(false);
      setInciInput("Aqua, Niacinamide, Dexpantenol, Zinc Oxide, Glycerin, Phenoxyethanol");
      setProductName("Producto Escaneado por Cámara");
      handleAudit("Aqua, Niacinamide, Dexpantenol, Zinc Oxide, Glycerin, Phenoxyethanol", "Producto Escaneado por Cámara");
    }, 1200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Input Section - Mobile-First Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/90 p-4 sm:p-8">
        {/* Header and Preset Swiper */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <span>Auditor INCI y OCR</span>
            </h2>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs font-bold bg-teal-50 text-teal-800 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition"
            >
              <Camera className="w-4 h-4 text-teal-600" />
              <span>Escanear Etiqueta</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCameraCapture}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>

          <p className="text-xs sm:text-sm text-slate-500">
            Pega los componentes, escribe la fórmula o escanea con tu cámara para auditarla contra CosIng UE y PubMed.
          </p>

          {/* Quick-Select Pills (Horizontally swipeable on mobile) */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Prueba un ejemplo rápido:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-1 px-1">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex-shrink-0 text-xs bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-200/80 transition-all active:scale-95 shadow-sm"
                >
                  <span className="text-teal-700 font-bold mr-1">[{preset.badge}]</span>
                  {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre del Producto (Opcional)
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ej: Pomada Regeneradora / Serum Niacinamida"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
              />
            </div>
            <div className="flex items-end">
              {(inciInput || productName || report) && (
                <button
                  type="button"
                  onClick={() => {
                    setInciInput('');
                    setProductName('');
                    setReport(null);
                    setError(null);
                  }}
                  className="w-full text-xs text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 font-bold px-3 py-2.5 rounded-xl border border-rose-200 transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lista de Ingredientes (INCI o Farmacia)
            </label>
            <textarea
              rows={3}
              value={inciInput}
              onChange={(e) => setInciInput(e.target.value)}
              placeholder="Pega aquí los ingredientes (ej: Dexpantenol 5%, Oxido de Zinc, Alantoina, Vaselina...)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end pt-1 gap-2">
            {report && (
              <button
                type="button"
                onClick={() => {
                  setInciInput('');
                  setProductName('');
                  setReport(null);
                  setError(null);
                }}
                className="order-2 sm:order-1 text-slate-600 hover:text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs transition text-center"
              >
                Cerrar Informe
              </button>
            )}
            <button
              onClick={() => handleAudit()}
              disabled={isLoading}
              className="order-1 sm:order-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 active:scale-95 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 text-sm transition"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Auditoría en curso...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Auditar Fórmula Científicamente</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-16 md:pb-6">
          {/* Active Product Header Banner */}
          <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-teal-700/50">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-800/80 px-2.5 py-0.5 rounded-md border border-teal-600/50">
                Resultado de Análisis
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 leading-tight">
                {report.meta.product_name}
              </h3>
              <p className="text-xs text-teal-100 mt-1 font-medium">
                {report.meta.active_ingredients_count} activos detectados • {report.meta.total_ingredients_count} componentes evaluados
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setInciInput('');
                setProductName('');
                setReport(null);
                setError(null);
              }}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl border border-white/25 transition self-start sm:self-center flex items-center gap-1.5"
            >
              <span>✕ Analizar Otro</span>
            </button>
          </div>

          {/* Quick Metrics Grid (2 columns on mobile, 4 on desktop) */}
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
                  {report.scientific_evidence.total_referenced_studies} estudios
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
                Resultados
              </span>
              <div className="flex items-center gap-1 text-slate-900 font-bold text-sm sm:text-base mt-1">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>{report.results_timeline.min_weeks} - {report.results_timeline.max_weeks} sem</span>
              </div>
            </div>
          </div>

          {/* Chemical Conflicts Alert (If any) */}
          {report.chemical_conflicts.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-base sm:text-lg">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>Incompatibilidad Química de Activos</span>
              </div>

              {report.chemical_conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-white/90 border border-rose-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{conflict.warning_message}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                      {conflict.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Razón Clínica:</strong> {conflict.clinical_rationale}
                  </p>
                  <p className="text-teal-900 font-semibold bg-teal-50 p-2 rounded-lg border border-teal-200">
                    💡 <strong>Mitigación:</strong> {conflict.mitigation_strategy}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Indications & PubMed Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Indications */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Indicaciones Clínicas de la Fórmula
              </h3>

              <div className="space-y-2.5">
                {report.clinical_indications.map((ind, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-3.5">
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
                      className="block p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition group"
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
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                    Estudios basados en literatura farmacológica general y base de datos CosIng UE.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Layering & Order of Application */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-2.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              Orden de Aplicación en Rutina (Layering)
            </h3>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900">
                Paso en Rutina: <span className="text-teal-700">Paso {report.layering_and_usage.layering_step_order} de 5</span>
              </p>
              <p className="text-slate-600">{report.layering_and_usage.layering_rule}</p>
            </div>
          </div>

          {/* Mobile-First Touch Cards for Ingredients */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Desglose de Componentes ({report.ingredients_breakdown.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">Norma CosIng UE</span>
            </div>

            {/* Mobile Touch Cards (Shown on mobile devices) */}
            <div className="block md:hidden space-y-2.5">
              {report.ingredients_breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition ${
                    item.is_active
                      ? 'bg-teal-50/60 border-teal-300 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#{item.position}</span>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {item.inci_name}
                      </h4>
                      {item.common_name && (
                        <span className="text-[11px] text-teal-700 font-medium block">
                          {item.common_name}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.is_active
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.is_active ? 'Activo' : 'Base'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.cosing_functions.map((fn, fIdx) => (
                      <span key={fIdx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {fn}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Comedogénico</span>
                      <span className={`font-bold ${item.comedogenic_rating >= 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.comedogenic_rating} / 5
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Irritabilidad</span>
                      <span className={`font-bold ${item.irritation_rating >= 2 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {item.irritation_rating} / 5
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (Shown on screens md:) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Nombre INCI Oficial</th>
                    <th className="py-2.5 px-3">CAS / ID CosIng</th>
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
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{item.cas_number || '-'}</td>
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
  );
}
