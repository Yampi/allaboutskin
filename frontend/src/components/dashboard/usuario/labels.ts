export const SKIN_TYPE_LABELS: Record<string, string> = {
  OILY: 'Grasa',
  DRY: 'Seca',
  COMBINATION: 'Mixta',
  NORMAL: 'Normal / Equilibrada',
  SENSITIVE: 'Sensible',
};

export const BARRIER_LABELS: Record<string, string> = {
  HEALTHY: 'Saludable',
  COMPROMISED: 'Comprometida',
  ACUTELY_DAMAGED: 'Dañada (aguda)',
};

// Las condiciones activas llegan como códigos libres; si no hay etiqueta se muestran legibles, no inventadas.
export function conditionLabel(code: string): string {
  const known: Record<string, string> = {
    DESHIDRATACION: 'Deshidratación',
    BARRERA_COMPROMETIDA: 'Barrera comprometida',
    ACNE: 'Acné',
    SEBUM_EXCESS: 'Exceso de sebo',
    MELASMA: 'Melasma',
  };
  if (known[code]) return known[code];
  const text = code.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const CYCLE_STEPS = [
  { phase: 'EXFOLIATION', title: 'Exfoliación' },
  { phase: 'RETINOID', title: 'Retinoide' },
  { phase: 'RECOVERY_1', title: 'Recuperación' },
  { phase: 'RECOVERY_2', title: 'Recuperación' },
];

export function daysUntilExpiry(openedAt: string | null, paoMonths: number | null | undefined): number | null {
  if (!openedAt || !paoMonths) return null;
  const expiry = new Date(openedAt);
  expiry.setMonth(expiry.getMonth() + paoMonths);
  return Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
}
