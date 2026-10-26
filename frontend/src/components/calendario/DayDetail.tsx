import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Moon, Sun } from 'lucide-react';
import RoutineStepCard from '@/components/mirutina/RoutineStepCard';
import type { WeekDay } from '@/hooks/useCalendarWeek';
import { phaseOf } from './phases';

export default function DayDetail({ day, isFuture, onComplete }: {
  day: WeekDay;
  isFuture: boolean;
  onComplete: (slot: 'AM' | 'PM', iso: string) => Promise<void>;
}) {
  const [slot, setSlot] = useState<'AM' | 'PM'>('PM');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const phase = phaseOf(day.routine.skin_cycling_phase);
  const current = slot === 'AM' ? day.routine.am_routine : day.routine.pm_routine;
  const dateText = day.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const complete = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onComplete(slot, day.iso);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo registrar la rutina');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-sm space-y-5">
      <div>
        <h2 className="text-lg font-bold text-[#2D2825] first-letter:uppercase">{dateText}</h2>
        <p className="text-xs text-[#7E756F] font-medium">{day.routine.skin_cycling_label}</p>
      </div>

      <div className="flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7] w-fit">
        {(['AM', 'PM'] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSlot(s)} className={`px-4 py-1 text-xs font-bold rounded-md cursor-pointer inline-flex items-center gap-1 ${slot === s ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}>
            {s === 'AM' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            {s === 'AM' ? 'Mañana' : 'Noche'}
          </button>
        ))}
      </div>

      {slot === 'PM' && phase.rule && (
        <p className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">{phase.rule}</p>
      )}

      {current.items.length === 0 ? (
        <p className="p-4 rounded-2xl border border-dashed border-[#E8E1D7] text-xs text-[#66615C]">
          No hay pasos {slot} programados este día. Añade productos desde la biblioteca para armar tu rutina.
        </p>
      ) : (
        <ol className="space-y-3">
          {current.items.map((item, i) => <RoutineStepCard key={item.id} item={item} order={i + 1} />)}
        </ol>
      )}

      {current.is_completed ? (
        <p className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B]"><Check className="w-4 h-4 stroke-[3]" /> Rutina {slot} completada</p>
      ) : (
        !isFuture && current.items.length > 0 && (
          <button type="button" disabled={saving} onClick={complete} className="px-4 py-2 rounded-full bg-[#2E7D5B] text-white text-xs font-bold disabled:opacity-60 cursor-pointer">
            {saving ? 'Guardando…' : `Marcar rutina ${slot} como completada`}
          </button>
        )
      )}
      {saveError && <p role="alert" className="text-xs text-rose-700">{saveError}</p>}

      <Link href="/mi-rutina" className="w-full py-3 rounded-full border border-[#2E7D5B] text-[#2E7D5B] text-xs font-bold flex items-center justify-center gap-2">
        <span>Ver mi rutina de hoy</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
