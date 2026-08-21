'use client';

import { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { AuditReport, auditInci } from '@/lib/api';

const PRESETS = [
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    inci: 'Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin.',
  },
  {
    name: "Paula's Choice 2% BHA Liquid Exfoliant",
    inci: 'Water (Aqua), Methylpropanediol, Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera (Green Tea) Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA.',
  },
  {
    name: 'Fórmula con Conflicto Químico (Retinol + Ácido Glicólico)',
    inci: 'Aqua, Retinol, Glycolic Acid, Caprylic/Capric Triglyceride, Glycerin, Dimethicone, Cetearyl Alcohol, Polysorbate 60.',
  }
];

export default function FormulaAuditor() {
  const [inciInput, setInciInput] = useState('');
  const [productName, setProductName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  const handleAudit = async (customInci?: string, customName?: string) => {
    const textToAudit = customInci ?? inciInput;
    if (!textToAudit.trim()) {
      setError('Por favor ingresa la lista de ingredientes (INCI) o selecciona un ejemplo.');
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-teal-600" />
              Auditor Científico de Fórmulas INCI
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Ingresa la lista de ingredientes o el texto extraído por OCR para normalizarlo contra CosIng y PubMed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-500 self-center">Ejemplos:</span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(preset)}
                className="text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors text-left"
              >
                {preset.name.split(' ')[0]} {preset.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nombre Comercial del Producto (Opcional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: The Ordinary Niacinamide 10% + Zinc 1%"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Lista de Componentes (Texto INCI o Salida OCR)
            </label>
            <textarea
              rows={4}
              value={inciInput}
              onChange={(e) => setInciInput(e.target.value)}
              placeholder="Aqua, Niacinamide, Zinc PCA, Phenoxyethanol, Ethylhexylglycerin..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleAudit()}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-teal-600/20 flex items-center gap-2 text-sm transition"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Auditoría en curso (CosIng + PubMed)...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auditar Fórmula Científicamente
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Section */}
      {report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Grado de Evidencia
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold px-2.5 py-0.5 rounded-lg ${
                  report.scientific_evidence.overall_evidence_grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                  report.scientific_evidence.overall_evidence_grade === 'B' ? 'bg-teal-100 text-teal-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  Nivel {report.scientific_evidence.overall_evidence_grade}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {report.scientific_evidence.total_referenced_studies} estudios indexados
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Momento de Aplicación
              </span>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                {report.layering_and_usage.recommended_timing === 'AM' && <Sun className="w-5 h-5 text-amber-500" />}
                {report.layering_and_usage.recommended_timing === 'PM' && <Moon className="w-5 h-5 text-indigo-500" />}
                {report.layering_and_usage.recommended_timing === 'BOTH' && (
                  <div className="flex text-teal-600"><Sun className="w-4 h-4" /><Moon className="w-4 h-4 -ml-1" /></div>
                )}
                <span>Rutina {report.layering_and_usage.recommended_timing === 'BOTH' ? 'AM y PM' : report.layering_and_usage.recommended_timing}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Protector Solar (FPS 50+)
              </span>
              <div className="flex items-center gap-2">
                {report.layering_and_usage.requires_sunscreen ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    OBLIGATORIO (AM)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Recomendado
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Tiempo a Resultados
              </span>
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-lg">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>{report.results_timeline.min_weeks} - {report.results_timeline.max_weeks} semanas</span>
              </div>
            </div>
          </div>

          {/* Chemical Conflicts Alert (If any) */}
          {report.chemical_conflicts.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-300/80 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-rose-900 font-bold text-lg">
                <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                <span>Incompatibilidad Química y Conflicto de Activos Detectado</span>
              </div>

              {report.chemical_conflicts.map((conflict, idx) => (
                <div key={idx} className="bg-white/80 border border-rose-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900">{conflict.warning_message}</span>
                    <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-rose-600 text-white">
                      Severidad: {conflict.severity}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    <strong>Razón Clínica:</strong> {conflict.clinical_rationale}
                  </p>
                  <p className="text-teal-800 text-xs font-semibold bg-teal-50/80 p-2.5 rounded-lg border border-teal-200">
                    💡 <strong>Estrategia de Mitigación:</strong> {conflict.mitigation_strategy}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Clinical Indications & Evidence Studies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Indicaciones Clínicas de la Fórmula
              </h3>

              <div className="space-y-3">
                {report.clinical_indications.map((ind, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{ind.name}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                        Evidencia Nivel {ind.highest_evidence_level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{ind.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ind.supporting_actives.map((act, aIdx) => (
                        <span key={aIdx} className="text-[11px] bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded font-mono">
                          {act.inci_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PubMed Evidence Studies */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  Estudios Médicos en PubMed (NCBI)
                </h3>
                <span className="text-xs text-slate-500 font-medium">Verificación Científica</span>
              </div>

              <div className="space-y-3">
                {report.scientific_evidence.studies.map((study, idx) => (
                  <a
                    key={idx}
                    href={study.pubmed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700 leading-snug line-clamp-2">
                        {study.title}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-medium">
                      <span>PMID: <strong>{study.pmid}</strong></span>
                      <span>•</span>
                      <span>{study.journal} ({study.pub_year})</span>
                      <span>•</span>
                      <span className="font-bold text-teal-700">{study.study_type}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Layering & Order of Application */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Protocolo y Orden de Aplicación (Layering por pH y Densidad)
            </h3>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-slate-800">
                Paso Sugerido en Rutina: <span className="text-teal-700 font-bold">Paso {report.layering_and_usage.layering_step_order} de 6</span>
              </p>
              <p className="text-slate-600">{report.layering_and_usage.layering_rule}</p>
              <p className="text-slate-600"><strong>Fundamento de horario:</strong> {report.layering_and_usage.timing_rationale}</p>
            </div>
          </div>

          {/* Full INCI Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Desglose de Ingredientes Normalizados CosIng ({report.ingredients_breakdown.length})
            </h3>

            <div className="overflow-x-auto">
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
                          <span className="block text-[11px] text-slate-500 font-normal">{item.common_name}</span>
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
