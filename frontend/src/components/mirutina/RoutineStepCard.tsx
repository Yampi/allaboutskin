import React from 'react';
import type { RoutineItem } from '@/lib/userDashboardApi';
import { daysUntilExpiry } from '@/components/dashboard/usuario/labels';

const TIMING: Record<string, string> = { AM: 'Día', PM: 'Noche', BOTH: 'Día y noche' };

function paoText(item: RoutineItem): string | null {
  const days = daysUntilExpiry(item.opened_at, item.product?.pao_months);
  if (days === null) return null;
  if (days < 0) return `PAO vencido hace ${Math.abs(days)} días`;
  return `PAO: ${days} días restantes`;
}

export default function RoutineStepCard({ item, order }: { item: RoutineItem; order: number }) {
  const p = item.product;
  const facts = [
    p?.dosage_per_application_ml ? `Dosis: ${p.dosage_per_application_ml} ml por aplicación` : null,
    p?.texture_type ? `Textura: ${p.texture_type.replace(/_/g, ' ').toLowerCase()}` : null,
    p?.recommended_timing ? `Uso recomendado: ${TIMING[p.recommended_timing] ?? p.recommended_timing}` : null,
    paoText(item),
  ].filter((f): f is string => f !== null);

  return (
    <li className="p-4 rounded-2xl bg-white border border-[#E8E1D7] space-y-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[11px] font-bold text-[#8C827A]">Paso {order}</span>
        <h3 className="text-sm font-extrabold text-[#2D2825]">{p?.name ?? item.custom_name ?? 'Paso sin nombre'}</h3>
        {p?.brand?.name && <span className="text-xs text-[#66615C]">· {p.brand.name}</span>}
      </div>
      {facts.length > 0 && (
        <ul className="text-xs text-[#66615C] space-y-0.5">
          {facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
      )}
      {item.notes && <p className="text-xs text-[#2D2825]">{item.notes}</p>}
    </li>
  );
}
