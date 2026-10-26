import React from 'react';
import { ExternalLink, Sun, ShieldAlert } from 'lucide-react';
import type { CatalogIngredient } from '@/lib/ingredientCatalogApi';

const TIMING_LABELS: Record<string, string> = { AM: 'Día (AM)', PM: 'Noche (PM)', BOTH: 'Día y noche' };

export default function IngredientCard({ ingredient: ing }: { ingredient: CatalogIngredient }) {
  return (
    <article className="bg-white rounded-2xl border border-[#E8E1D7] p-5 space-y-3 shadow-2xs">
      <header>
        <h3 className="text-sm font-extrabold text-[#2D2825] leading-snug">{ing.common_name || ing.inci_name}</h3>
        <p className="text-[11px] font-mono text-[#8C827A]">INCI: {ing.inci_name}</p>
      </header>

      {ing.description && <p className="text-xs text-[#66615C] leading-relaxed">{ing.description}</p>}

      <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
        {ing.recommended_timing && (
          <span className="px-2 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B]">{TIMING_LABELS[ing.recommended_timing]}</span>
        )}
        {ing.is_uv_sensitizing && (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 inline-flex items-center gap-1">
            <Sun className="w-3 h-3" /> Fotosensibilizante
          </span>
        )}
        {ing.requires_sunscreen && (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Requiere protector solar
          </span>
        )}
        {ing.indications.map((ind) => (
          <span key={ind.id} className="px-2 py-0.5 rounded-full bg-[#EFECE6] text-[#66615C]">{ind.name ?? ind.slug}</span>
        ))}
      </div>

      <footer className="pt-2 border-t border-[#F0EBE3] text-[10px] text-[#8C827A] space-y-1">
        {ing.evidence_level && (
          <p>
            <span className="font-bold text-[#2D2825]">Evidencia {ing.evidence_level}</span>
            {ing.evidence_grade_description ? ` · ${ing.evidence_grade_description.replace(/^Nivel [A-D]: /, '')}` : ''}
          </p>
        )}
        {ing.source_name && (
          <p className="flex items-center gap-1">
            Fuente: {ing.source_name}
            {ing.source_url && (
              <a href={ing.source_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir fuente">
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </p>
        )}
        <p>{ing.pubmed_studies.length > 0 ? `${ing.pubmed_studies.length} estudio(s) vinculado(s)` : 'Sin estudios vinculados en el catálogo'}</p>
      </footer>
    </article>
  );
}
