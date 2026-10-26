import React from 'react';
import Link from 'next/link';
import type { ClinicalSkinEvaluationResult } from '@/lib/clinicalVisionEngine';
import type { SaveStatus } from '@/hooks/useScanAnalysis';

type Face = ClinicalSkinEvaluationResult['faceAnalysis'];

interface FaceResultsProps {
  face: Face;
  saveStatus: SaveStatus;
  saveError: string | null;
  onRetrySave: () => void;
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[10px] font-bold text-[#8C827A] uppercase">{label}</dt>
    <dd className="text-xs font-semibold text-[#2D2825]">{value}</dd>
  </div>
);

const List = ({ title, items }: { title: string; items: string[] }) =>
  items.length === 0 ? null : (
    <section className="space-y-1">
      <h3 className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">{title}</h3>
      <ul className="list-disc pl-4 text-xs text-[#2D2825] space-y-0.5">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </section>
  );

function SaveNotice({ status, error, onRetry }: { status: SaveStatus; error: string | null; onRetry: () => void }) {
  if (status === 'saved') return <p className="text-xs font-bold text-[#2E7D5B]">Resumen guardado en tu historial.</p>;
  if (status === 'saving') return <p className="text-xs text-[#8C827A]">Guardando en tu historial…</p>;
  if (status === 'login_required') {
    return (
      <p className="text-xs text-[#66615C]">
        <Link href="/login" className="font-bold text-[#2E7D5B] hover:underline">Inicia sesión</Link> para guardar este resultado en tu historial.
      </p>
    );
  }
  if (status === 'error') {
    return (
      <p role="alert" className="text-xs text-rose-700">
        No se pudo guardar en tu historial: {error}{' '}
        <button type="button" onClick={onRetry} className="font-bold underline cursor-pointer">Reintentar</button>
      </p>
    );
  }
  return null;
}

export default function FaceResults({ face, saveStatus, saveError, onRetrySave }: FaceResultsProps) {
  const triage = face.triage;
  return (
    <div className="space-y-5 max-w-3xl">
      {triage?.medicalReferralRecommended && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
          <p className="font-bold">Se recomienda consultar con un profesional{triage.suggestedMedicalSpecialty ? ` (${triage.suggestedMedicalSpecialty})` : ''}.</p>
          {triage.referralReason && <p>{triage.referralReason}</p>}
        </div>
      )}

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-3xl border border-[#E8E1D7]">
        <Row label="Biotipo estimado" value={face.skinTypeLabel} />
        <Row label="Código Baumann" value={face.baumannSkinTypeCode} />
        <Row label="Fototipo estimado" value={`Fototipo ${face.fitzpatrickType}`} />
        <Row label="Confianza del análisis" value={`${Math.round(face.confidence * 100)}%`} />
      </dl>

      <section className="p-5 bg-white rounded-3xl border border-[#E8E1D7] space-y-2">
        <h3 className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">Observaciones</h3>
        <p className="text-xs text-[#2D2825]"><b>Zona T:</b> {face.zoneTAnalysis.description}</p>
        <p className="text-xs text-[#2D2825]"><b>Mejillas:</b> {face.cheeksAnalysis.description}</p>
        <p className="text-xs text-[#2D2825]"><b>Contorno de ojos:</b> {face.periorbitalAnalysis.description}</p>
        <p className="text-xs text-[#2D2825]"><b>Pigmentación:</b> {face.pigmentationAnalysis.description}</p>
        <p className="text-xs text-[#2D2825]"><b>Textura y líneas:</b> {face.textureAndLinesAnalysis.description}</p>
      </section>

      {face.clinicalRationale && <p className="text-xs text-[#2D2825] leading-relaxed">{face.clinicalRationale}</p>}
      <List title="Aspectos visibles" items={face.visibleConcerns ?? []} />
      <List title="Enfoque sugerido" items={face.suggestedFocus ?? []} />
      <List title="Alertas de seguridad" items={triage?.safetyAlerts ?? []} />
      {face.patchTestGuidance && <p className="text-xs text-[#66615C]"><b>Prueba de parche:</b> {face.patchTestGuidance}</p>}
      <List title="Referencias" items={face.scientificReferences ?? []} />

      <p className="text-[11px] text-[#8C827A]">{face.disclaimer}</p>
      <SaveNotice status={saveStatus} error={saveError} onRetry={onRetrySave} />
    </div>
  );
}
