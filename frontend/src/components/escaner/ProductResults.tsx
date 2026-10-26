import React from 'react';
import ErrorState from '@/components/system/ErrorState';
import type { ProductResult } from '@/hooks/useScanAnalysis';

const TIMING: Record<string, string> = { AM: 'Día (AM)', PM: 'Noche (PM)', BOTH: 'Día y noche' };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="p-5 bg-white rounded-3xl border border-[#E8E1D7] space-y-2">
    <h3 className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">{title}</h3>
    {children}
  </section>
);

export default function ProductResults({ result, onRetry }: { result: ProductResult; onRetry: () => void }) {
  const { detected, audit, auditError } = result;
  const name = detected.productName ?? 'Producto sin nombre detectado';

  return (
    <div className="space-y-5 max-w-3xl">
      <header>
        <h2 className="text-lg font-extrabold text-[#2D2825]">{name}</h2>
        {detected.brand && <p className="text-xs text-[#66615C]">{detected.brand}</p>}
        <p className="text-[11px] text-[#8C827A]">Lectura de la etiqueta con confianza {Math.round(detected.confidence * 100)}%. Revisa que los ingredientes sean los correctos.</p>
      </header>

      <Section title="Ingredientes detectados (INCI)">
        <p className="text-xs text-[#2D2825] leading-relaxed">{detected.inciText}</p>
      </Section>

      {auditError && <ErrorState title="No se pudo auditar la fórmula" message={auditError} onRetry={onRetry} />}

      {audit && (
        <>
          <Section title="Resumen">
            <p className="text-xs text-[#2D2825] leading-relaxed">{audit.ai_clinical_copilot.plain_language_summary}</p>
            {audit.ai_clinical_copilot.barrier_warning && <p className="text-xs text-amber-800">{audit.ai_clinical_copilot.barrier_warning}</p>}
            <p className="text-[11px] text-[#8C827A]">
              {audit.meta.total_ingredients_count} ingredientes reconocidos, {audit.meta.active_ingredients_count} activos
              {audit.meta.unmatched_tokens_count > 0 ? `, ${audit.meta.unmatched_tokens_count} sin reconocer` : ''}. Fuente: {audit.ai_clinical_copilot.transparency_meta.source_label}.
            </p>
            {audit.meta.unmatched_tokens.length > 0 && (
              <p className="text-[11px] text-[#8C827A]">
                No están en nuestra base: {audit.meta.unmatched_tokens.join(', ')}.
                {audit.meta.unmatched_suggestions?.map((s) => ` ¿"${s.raw_token}" es ${s.suggested_inci_name}? Verifícalo en la etiqueta.`).join('')}
              </p>
            )}
          </Section>

          <Section title="Uso y evidencia">
            <p className="text-xs text-[#2D2825]"><b>Momento:</b> {TIMING[audit.layering_and_usage.recommended_timing]} · {audit.layering_and_usage.timing_rationale}</p>
            <p className="text-xs text-[#2D2825]"><b>Evidencia global:</b> {audit.scientific_evidence.evidence_grade_label}</p>
            {audit.scientific_evidence.by_ingredient?.map((i) => (
              <p key={i.inci_name} className="text-xs text-[#2D2825]">
                <b>{i.common_name || i.inci_name}:</b>{' '}
                {i.studies_count > 0 ? `${i.studies_count} estudio(s), evidencia ${i.evidence_grade}` : 'sin estudios en nuestra base'}
              </p>
            ))}
            {audit.layering_and_usage.requires_sunscreen && <p className="text-xs text-amber-800">{audit.layering_and_usage.sunscreen_rationale}</p>}
          </Section>

          {audit.chemical_conflicts.length > 0 && (
            <Section title="Posibles conflictos entre ingredientes">
              <ul className="space-y-2">
                {audit.chemical_conflicts.map((c) => (
                  <li key={`${c.ingredient_a}-${c.ingredient_b}`} className="text-xs text-[#2D2825]">
                    <b>{c.ingredient_a} + {c.ingredient_b}</b> ({c.severity}): {c.warning_message}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {audit.ai_clinical_copilot.contraindications.length > 0 && (
            <Section title="Contraindicaciones">
              <ul className="list-disc pl-4 text-xs text-[#2D2825]">{audit.ai_clinical_copilot.contraindications.map((c) => <li key={c}>{c}</li>)}</ul>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
