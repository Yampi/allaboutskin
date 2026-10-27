'use client';

import { AlertCircle, Clock, FlaskConical, Loader2, ShieldCheck, Sun, X } from 'lucide-react';
import { useIngredientDetail, IngredientDetail } from '@/hooks/useIngredientDetail';
import { IngredientRecommendation } from './ingredientRecommendations';

interface IngredientExplainerProps {
  recommendation: IngredientRecommendation;
  onClose: () => void;
}

const TIMING_LABELS: Record<string, string> = {
  AM: 'Por la mañana',
  PM: 'Por la noche',
  BOTH: 'Mañana y noche',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h5>
      <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function UsageTips({ detail }: { detail: IngredientDetail }) {
  const { results_timeline_weeks_min: min, results_timeline_weeks_max: max } = detail;
  const tips: Array<{ icon: React.ReactNode; text: string }> = [];

  if (detail.recommended_timing && TIMING_LABELS[detail.recommended_timing]) {
    tips.push({ icon: <Clock className="w-3.5 h-3.5" />, text: TIMING_LABELS[detail.recommended_timing] });
  }
  if (min && max) {
    tips.push({ icon: <FlaskConical className="w-3.5 h-3.5" />, text: `Resultados visibles en ${min}–${max} semanas de uso constante` });
  }
  if (detail.requires_sunscreen || detail.is_uv_sensitizing) {
    tips.push({ icon: <Sun className="w-3.5 h-3.5" />, text: 'Aumenta la sensibilidad al sol: usa protector solar de día' });
  }
  if ((detail.irritation_rating ?? 0) >= 1) {
    tips.push({ icon: <AlertCircle className="w-3.5 h-3.5" />, text: 'Puede irritar al principio: empieza pocas veces por semana' });
  }
  if (tips.length === 0) return null;

  return (
    <Section title="Cómo usarlo">
      <ul className="space-y-1.5">
        {tips.map((tip) => (
          <li key={tip.text} className="flex items-start gap-2">
            <span className="text-emerald-700 mt-0.5 shrink-0">{tip.icon}</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default function IngredientExplainer({ recommendation, onClose }: IngredientExplainerProps) {
  const { detail, isLoading, error, retry } = useIngredientDetail(recommendation.slug);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-emerald-200 shadow-2xs space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">{detail?.common_name || recommendation.label}</h4>
          {detail && <span className="text-[11px] text-slate-500 font-medium">INCI: {detail.inci_name}</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar explicación"
          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <Section title="Por qué te lo recomendamos">{recommendation.reason}</Section>

      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Cargando la ficha del ingrediente…</span>
        </div>
      )}

      {error && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={retry} className="font-bold underline cursor-pointer">
            Reintentar
          </button>
        </div>
      )}

      {detail && (
        <>
          {detail.description && <Section title="Qué es">{detail.description}</Section>}
          {detail.clinical_summary && <Section title="Qué hace en la piel">{detail.clinical_summary}</Section>}
          <UsageTips detail={detail} />
          {detail.evidence_grade_description && (
            <p className="flex items-start gap-2 text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200/70 rounded-xl px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Evidencia científica — {detail.evidence_grade_description}</span>
            </p>
          )}
        </>
      )}

      <p className="text-[10.5px] text-slate-500 leading-snug">
        Información educativa sobre ingredientes cosméticos. No es un diagnóstico ni sustituye la consulta con un dermatólogo.
      </p>
    </div>
  );
}
