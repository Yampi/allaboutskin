'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Camera, Check } from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import ErrorState from '@/components/system/ErrorState';
import VirtualFaceMaskTutorial from '@/components/ar/VirtualFaceMaskTutorial';
import RoutineStepCard from '@/components/mirutina/RoutineStepCard';
import { useMiRutina } from '@/hooks/useMiRutina';

type ArRoutine = 'skin_cycling' | 'spf_shield' | 'double_cleansing';

// Orientación general por fase del Skin Cycling; no sustituye la consulta dermatológica.
const PHASE_GUIDANCE: Record<string, string> = {
  EXFOLIATION: 'Noche de exfoliación química: evita combinarla con retinoides esta misma noche.',
  RETINOID: 'Noche de retinoide: evita combinarla con ácidos exfoliantes o vitamina C pura esta misma noche.',
  RECOVERY_1: 'Noche de recuperación: prioriza la hidratación y la reparación de la barrera, sin activos irritantes.',
  RECOVERY_2: 'Noche de recuperación: prioriza la hidratación y la reparación de la barrera, sin activos irritantes.',
};

function MiRutinaContent() {
  const searchParams = useSearchParams();
  const { user, routine, error, reload, completeSlot } = useMiRutina();
  const [slot, setSlot] = useState<'AM' | 'PM'>('PM');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [arRoutine, setArRoutine] = useState<ArRoutine | null>(null);

  useEffect(() => {
    const launch = searchParams.get('launchAr');
    if (launch === 'spf_shield' || launch === 'double_cleansing' || launch === 'skin_cycling') setArRoutine(launch);
    else if (searchParams.get('ar') === '1' || launch === 'true') setArRoutine('skin_cycling');
  }, [searchParams]);

  const current = routine ? (slot === 'AM' ? routine.am_routine : routine.pm_routine) : null;

  const handleComplete = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await completeSlot(slot);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'No se pudo registrar la rutina');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserAppShell activeNavId="mi-rutina">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">Mi rutina</h1>
          {routine && <p className="text-sm text-[#66615C]">Hoy: {routine.skin_cycling_label}</p>}
        </header>

        {user === null && (
          <p role="alert" className="p-4 rounded-2xl bg-white border border-[#E8E1D7] text-sm text-[#66615C]">
            Inicia sesión para ver tu rutina. <Link href="/login" className="font-bold text-[#2E7D5B] hover:underline">Ir a iniciar sesión</Link>
          </p>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {user && !error && !routine && <p className="text-xs text-[#8C827A]">Cargando tu rutina…</p>}

        {routine && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex bg-[#EFECE6] p-0.5 rounded-lg border border-[#E8E1D7]">
                {(['AM', 'PM'] as const).map((s) => (
                  <button key={s} type="button" onClick={() => setSlot(s)} className={`px-4 py-1 text-xs font-bold rounded-md cursor-pointer ${slot === s ? 'bg-white text-[#2E7D5B]' : 'text-[#66615C]'}`}>
                    {s === 'AM' ? 'Mañana (AM)' : 'Noche (PM)'}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setArRoutine(slot === 'PM' ? 'skin_cycling' : 'spf_shield')} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] cursor-pointer">
                <Camera className="w-4 h-4" /> Guía en vivo con cámara
              </button>
            </div>

            {slot === 'PM' && PHASE_GUIDANCE[routine.skin_cycling_phase] && (
              <p className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">{PHASE_GUIDANCE[routine.skin_cycling_phase]}</p>
            )}

            {current && current.items.length === 0 ? (
              <p className="p-4 rounded-2xl border border-dashed border-[#E8E1D7] text-xs text-[#66615C]">
                No tienes pasos {slot} en tu rutina de hoy. Añade productos desde la biblioteca para armarla.
              </p>
            ) : (
              <ol className="space-y-3">
                {current?.items.map((item, i) => <RoutineStepCard key={item.id} item={item} order={i + 1} />)}
              </ol>
            )}

            {current && current.items.length > 0 && (
              current.is_completed ? (
                <p className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B]"><Check className="w-4 h-4 stroke-[3]" /> Rutina {slot} completada hoy</p>
              ) : (
                <button type="button" disabled={isSaving} onClick={handleComplete} className="px-4 py-2 rounded-full bg-[#2E7D5B] text-white text-xs font-bold disabled:opacity-60 cursor-pointer">
                  {isSaving ? 'Guardando…' : `Marcar rutina ${slot} como completada`}
                </button>
              )
            )}
            {saveError && <p role="alert" className="text-xs text-rose-700">{saveError}</p>}
          </>
        )}
      </div>

      {arRoutine && <VirtualFaceMaskTutorial initialRoutine={arRoutine} onClose={() => setArRoutine(null)} />}
    </UserAppShell>
  );
}

export default function MiRutinaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-500">Cargando…</div>}>
      <MiRutinaContent />
    </Suspense>
  );
}
