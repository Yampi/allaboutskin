import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

// Muestra desde cuándo cuenta el ciclo del usuario y permite reiniciarlo en la noche 1 hoy.
export default function CycleStartBar({ startedOn, onRestart }: {
  startedOn: string;
  onRestart: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [y, m, d] = startedOn.split('-').map(Number);
  const startText = new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  const restart = async () => {
    if (!window.confirm('¿Reiniciar tu ciclo? Hoy pasará a ser la noche 1 (exfoliación).')) return;
    setSaving(true);
    setError(null);
    try {
      await onRestart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reiniciar el ciclo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E8E1D7] text-xs text-[#66615C]">
      <span>
        Tu ciclo empezó el <strong className="text-[#2D2825]">{startText}</strong> (noche 1).
      </span>
      <button
        type="button"
        onClick={restart}
        disabled={saving}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E1D7] font-bold text-[#2E7D5B] hover:bg-[#FAF8F5] cursor-pointer disabled:opacity-50"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {saving ? 'Reiniciando…' : 'Empezar de nuevo hoy'}
      </button>
      {error && <p role="alert" className="w-full text-red-700">{error}</p>}
    </div>
  );
}
