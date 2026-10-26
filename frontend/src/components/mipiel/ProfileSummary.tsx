import React from 'react';
import Link from 'next/link';
import type { SkinProfileData } from '@/lib/api';
import { BARRIER_LABELS, SKIN_TYPE_LABELS, conditionLabel } from '@/components/dashboard/usuario/labels';

const FITZPATRICK_SWATCHES = [
  { type: 'I', label: 'Muy clara (se quema siempre)', color: '#FBF0E4' },
  { type: 'II', label: 'Clara (se quema con facilidad)', color: '#F3DCBE' },
  { type: 'III', label: 'Morena clara (se quema moderadamente)', color: '#DFB28B' },
  { type: 'IV', label: 'Morena (se quema mínimamente)', color: '#BC865A' },
  { type: 'V', label: 'Oscura (raramente se quema)', color: '#8D5832' },
  { type: 'VI', label: 'Muy oscura (nunca se quema)', color: '#4D2C1D' },
];

const card = 'bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-2xs space-y-3';
const heading = 'text-[11px] font-bold text-[#66615C] uppercase tracking-wider block';

export default function ProfileSummary({ profile }: { profile: SkinProfileData }) {
  const conditions = profile.active_conditions ?? [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className={card}>
        <span className={heading}>Biotipo de piel</span>
        <div className="text-xl font-extrabold text-[#2D2825]">{SKIN_TYPE_LABELS[profile.skin_type] ?? profile.skin_type}</div>
      </div>

      <div className={card}>
        <span className={heading}>Fototipo (Fitzpatrick)</span>
        <div className="text-xl font-extrabold text-[#2D2825]">
          {profile.fitzpatrick_type ? `Fototipo ${FITZPATRICK_SWATCHES[profile.fitzpatrick_type - 1]?.type}` : 'No indicado'}
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {FITZPATRICK_SWATCHES.map((s, i) => (
            <span
              key={s.type}
              title={s.label}
              style={{ backgroundColor: s.color }}
              className={`w-6 h-6 rounded-full border ${profile.fitzpatrick_type === i + 1 ? 'ring-2 ring-[#2E7D5B]' : 'border-[#E8E1D7]'}`}
            />
          ))}
        </div>
        {profile.fitzpatrick_type && <p className="text-xs text-[#66615C]">{FITZPATRICK_SWATCHES[profile.fitzpatrick_type - 1]?.label}</p>}
      </div>

      <div className={card}>
        <span className={heading}>Estado de la barrera cutánea</span>
        <div className="text-xl font-extrabold text-[#2D2825]">{BARRIER_LABELS[profile.barrier_status] ?? profile.barrier_status}</div>
      </div>

      <div className={card}>
        <span className={heading}>Focos activos</span>
        {conditions.length === 0 ? (
          <p className="text-xs text-[#66615C]">Ninguno registrado.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {conditions.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-semibold">{conditionLabel(c)}</span>
            ))}
          </div>
        )}
        <Link href="/escaner" className="text-xs font-bold text-[#2E7D5B] hover:underline">Hacer un escaneo</Link>
      </div>
    </div>
  );
}
