// Presentación de las fases del Skin Cycling; la fase de cada día viene del backend.
export const PHASES: Record<string, { num: number; label: string; badge: string; rule: string }> = {
  EXFOLIATION: { num: 1, label: 'Exfoliación', badge: 'bg-rose-100 text-rose-800 border-rose-200', rule: 'Evita combinar la exfoliación con retinoides esta misma noche.' },
  RETINOID: { num: 2, label: 'Retinoide', badge: 'bg-sky-100 text-sky-800 border-sky-200', rule: 'Evita ácidos exfoliantes y vitamina C pura esta misma noche.' },
  RECOVERY_1: { num: 3, label: 'Recuperación', badge: 'bg-[#E6F4EC] text-[#2E7D5B] border-[#D5E2DB]', rule: 'Prioriza hidratación y reparación de la barrera, sin activos irritantes.' },
  RECOVERY_2: { num: 4, label: 'Recuperación', badge: 'bg-[#E6F4EC] text-[#2E7D5B] border-[#D5E2DB]', rule: 'Prioriza hidratación y reparación de la barrera, sin activos irritantes.' },
};

export const phaseOf = (key: string) =>
  PHASES[key] ?? { num: 0, label: 'Rutina estándar', badge: 'bg-slate-100 text-slate-700 border-slate-200', rule: '' };
