import React, { useState } from 'react';
import { Check } from 'lucide-react';
import type { RoutineItem, TodayRoutine } from '@/lib/userDashboardApi';
import type { Section } from '@/hooks/useUserDashboard';
import DashboardCard, { EmptyNote } from './DashboardCard';

interface TodayRoutineCardProps {
  routine: Section<TodayRoutine>;
  onRetry: () => void;
  onCompleteSlot: (slot: 'AM' | 'PM') => Promise<void>;
}

const itemName = (item: RoutineItem) => item.product?.name ?? item.custom_name ?? 'Paso sin nombre';

export default function TodayRoutineCard({ routine, onRetry, onCompleteSlot }: TodayRoutineCardProps) {
  const [slot, setSlot] = useState<'AM' | 'PM'>('AM');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = routine.data ? (slot === 'AM' ? routine.data.am_routine : routine.data.pm_routine) : null;

  const handleComplete = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onCompleteSlot(slot);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo registrar la rutina');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardCard
      title="Tu rutina de hoy"
      icon={
        <div className="flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7]">
          {(['AM', 'PM'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md transition cursor-pointer ${
                slot === s ? 'bg-white text-[#2E7D5B] shadow-2xs' : 'text-[#66615C] hover:text-[#2D2825]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      }
      section={routine}
      onRetry={onRetry}
      link={{ href: '/mi-rutina', label: 'Ver explicación completa de la rutina' }}
    >
      {current && current.items.length === 0 && (
        <EmptyNote text={`No tienes pasos ${slot} en tu rutina.`} cta={{ href: '/mi-rutina', label: 'Armar mi rutina' }} />
      )}
      {current && current.items.length > 0 && (
        <div className="space-y-2">
          {current.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-xl border border-[#E8E1D7] text-xs text-[#2D2825]">
              <span className="flex-1 font-medium">{itemName(item)}</span>
            </div>
          ))}
          {current.is_completed ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B]">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Rutina {slot} completada hoy
            </div>
          ) : (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleComplete}
              className="px-3 py-1.5 rounded-lg bg-[#2E7D5B] text-white text-xs font-bold disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? 'Guardando…' : `Marcar rutina ${slot} como completada`}
            </button>
          )}
          {saveError && <p role="alert" className="text-xs text-rose-700">{saveError}</p>}
        </div>
      )}
    </DashboardCard>
  );
}
