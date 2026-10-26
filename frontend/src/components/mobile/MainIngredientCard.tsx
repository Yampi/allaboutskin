import React from 'react';
import { ExternalLink, FlaskConical } from 'lucide-react';
import type { MainIngredientEvidence } from './types';

// Mismas etiquetas que el motor de auditoría del backend (FormulaAuditEngine)
const EVIDENCE_LABELS: Record<string, string> = {
  A: 'Evidencia clínica muy alta (revisiones sistemáticas / ensayos RCT)',
  B: 'Evidencia clínica moderada (ensayos controlados en humanos)',
  C: 'Evidencia preliminar (estudios in vivo / observacionales)',
  D: 'Evidencia teórica / mecanística',
};

interface MainIngredientCardProps {
  ingredients: MainIngredientEvidence[];
  onScanBackLabel: () => void;
}

/** Producto identificado en el catálogo: muestra su ingrediente principal y la evidencia que lo respalda. */
export default function MainIngredientCard({ ingredients, onScanBackLabel }: MainIngredientCardProps) {
  return (
    <div className="card-white p-5 sm:p-6 border border-[#8FA89B]/50 rounded-[24px] shadow-diffuse-elevated space-y-4">
      <div className="border-b border-[#E8E1D7] pb-3">
        <h3 className="font-serif text-[18px] font-semibold text-[#2D2825]">
          {ingredients.length === 1 ? 'Su ingrediente principal' : 'Sus ingredientes principales'}
        </h3>
        <p className="text-[12px] text-[#7E756F] mt-0.5">
          Lo que promociona el producto y lo que dice la ciencia sobre ello
        </p>
      </div>

      {ingredients.map((ing) => (
        <div key={ing.inci} className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF1EE] text-[#4A6B5B] flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-[17px] font-semibold text-[#2D2825] block">{ing.name}</span>
              <span className="text-[11px] font-mono text-[#7E756F] block">{ing.inci}</span>
            </div>
          </div>

          {ing.description && <p className="text-[12.5px] text-[#4A433E] leading-relaxed">{ing.description}</p>}

          <div className="p-3 rounded-[16px] bg-[#FAF8F5] border border-[#E8E1D7] text-[12.5px] text-[#2D2825]">
            {ing.evidenceGrade ? (
              <>
                <strong>Nivel {ing.evidenceGrade}:</strong> {EVIDENCE_LABELS[ing.evidenceGrade] ?? 'Nivel de evidencia registrado'}
                {ing.studiesCount > 0 && <span className="text-[#7E756F]"> · {ing.studiesCount} estudios enlazados</span>}
              </>
            ) : (
              <span className="text-[#7E756F]">Aún no tenemos estudios enlazados para este ingrediente.</span>
            )}
          </div>

          {ing.studies.length > 0 && (
            <ul className="space-y-1.5">
              {ing.studies.map((study) => (
                <li key={study.url}>
                  <a
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-[12px] text-[#4A6B5B] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>
                      {study.title} <span className="text-[#7E756F]">({study.journal}, {study.year})</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onScanBackLabel}
        className="w-full pt-3 border-t border-[#E8E1D7] text-[12px] text-[#7E756F] hover:text-[#2D2825] text-left cursor-pointer"
      >
        ¿Quieres revisar todos los ingredientes (por ejemplo, por alergias)? <strong>Fotografía la etiqueta trasera.</strong>
      </button>
    </div>
  );
}
