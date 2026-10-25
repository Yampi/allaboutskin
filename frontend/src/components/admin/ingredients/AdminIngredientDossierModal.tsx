import React from 'react';
import { X, FlaskConical, ExternalLink, ShieldAlert, BookOpen } from 'lucide-react';
import { AdminIngredientDetail } from '@/lib/api';

interface AdminIngredientDossierModalProps {
  ingredient: AdminIngredientDetail | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export default function AdminIngredientDossierModal({
  ingredient,
  isOpen,
  isLoading,
  onClose,
}: AdminIngredientDossierModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4 text-xs max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-[#4A6B5B]" />
            <h3 className="text-sm font-bold text-slate-900">
              Dossier Científico & Ficha Técnica INCI
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !ingredient ? (
          <div className="py-12 text-center text-slate-400">Cargando ficha científica...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">{ingredient.inci_name}</h2>
              <div className="text-slate-500 text-[11px] mt-0.5">
                {ingredient.common_name && <span>{ingredient.common_name} • </span>}
                {ingredient.cas_number && <span>CAS: {ingredient.cas_number} • </span>}
                {ingredient.cosing_id && <span>CosIng ID: {ingredient.cosing_id}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-md border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Nivel Evidencia</span>
                <span className="text-sm font-bold text-slate-900">Grado {ingredient.evidence_level || 'C'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Clasificación</span>
                <span className="text-sm font-bold text-[#4A6B5B]">{ingredient.is_active ? 'Activo' : 'Excipiente'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Momento</span>
                <span className="text-sm font-bold text-slate-900">{ingredient.recommended_timing || 'Cualquiera'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Comedogénico</span>
                <span className="text-sm font-bold text-slate-900">
                  {ingredient.comedogenic_rating ?? 0}/5
                </span>
              </div>
            </div>

            {ingredient.clinical_summary && (
              <div className="space-y-1">
                <span className="font-bold text-slate-800 block text-xs">Resumen Clínico & Evidencia</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                  {ingredient.clinical_summary}
                </p>
              </div>
            )}

            {ingredient.conflicts_as_a && ingredient.conflicts_as_a.length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-rose-700 block text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Conflictos e Incompatibilidades Clínicas</span>
                </span>
                <div className="space-y-1.5">
                  {ingredient.conflicts_as_a.map((c: any) => (
                    <div key={c.id} className="p-2 rounded bg-rose-50/50 border border-rose-100 text-slate-700 text-[11px]">
                      <span className="font-bold text-rose-800">{c.conflict_type}:</span> {c.interaction_mechanism}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ingredient.pubmed_studies && ingredient.pubmed_studies.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block text-xs flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-[#4A6B5B]" />
                  <span>Evidencia Clínica Publicada (NLM / PubMed)</span>
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {ingredient.pubmed_studies.map((st: any) => (
                    <div key={st.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="font-semibold text-slate-900">{st.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {st.journal} ({st.publication_year}) • PMID: {st.pmid}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition cursor-pointer"
          >
            Cerrar Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
