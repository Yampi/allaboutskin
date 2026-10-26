'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sliders, ArrowRight } from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import ErrorState from '@/components/system/ErrorState';
import SkinEvolutionProgressSection from '@/components/progress/SkinEvolutionProgressSection';
import ProfileSummary from '@/components/mipiel/ProfileSummary';
import ScanHistory from '@/components/mipiel/ScanHistory';
import EditProfileModal from '@/components/mipiel/EditProfileModal';
import { useMiPiel } from '@/hooks/useMiPiel';

export default function MiPielPage() {
  const { user, data, error, reload } = useMiPiel();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <UserAppShell activeNavId="mi-piel">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">Mi perfil dermatológico</h1>
            <p className="text-sm text-[#66615C]">Tu información personalizada para una rutina más efectiva y segura.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/mi-rutina" className="px-4 py-2 rounded-full bg-white border border-[#E8E1D7] text-xs font-bold text-[#2D2825] flex items-center gap-2">
              <span>Ver mi rutina activa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {user && (
              <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 bg-[#2E7D5B] text-white px-4 py-2 rounded-full text-xs font-bold cursor-pointer">
                <Sliders className="w-3.5 h-3.5" />
                <span>Actualizar perfil</span>
              </button>
            )}
          </div>
        </div>

        {user === null && (
          <p role="alert" className="p-4 rounded-2xl bg-white border border-[#E8E1D7] text-sm text-[#66615C]">
            Inicia sesión para ver tu perfil. <Link href="/login" className="font-bold text-[#2E7D5B] hover:underline">Ir a iniciar sesión</Link>
          </p>
        )}

        {error && <ErrorState message={error} onRetry={reload} />}
        {user && !error && !data && <p className="text-xs text-[#8C827A]">Cargando tu perfil…</p>}

        {data && (
          <>
            {data.profile ? (
              <ProfileSummary profile={data.profile} />
            ) : (
              <p className="p-4 rounded-2xl border border-dashed border-[#E8E1D7] text-xs text-[#66615C]">
                Todavía no has completado tu perfil dermatológico. Pulsa “Actualizar perfil” para empezar.
              </p>
            )}
            <ScanHistory scans={data.scans} />
            <SkinEvolutionProgressSection />
          </>
        )}
      </div>

      {isEditing && (
        <EditProfileModal
          current={data?.profile ?? null}
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            setIsEditing(false);
            reload();
          }}
        />
      )}
    </UserAppShell>
  );
}
