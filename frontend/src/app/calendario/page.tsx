'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import ErrorState from '@/components/system/ErrorState';
import WeekStrip from '@/components/calendario/WeekStrip';
import DayDetail from '@/components/calendario/DayDetail';
import ProgressCards from '@/components/calendario/ProgressCards';
import { toLocalDate, useCalendarWeek } from '@/hooks/useCalendarWeek';

export default function CalendarioSkinCyclingPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const { user, days, stats, error, reload, completeSlot } = useCalendarWeek(weekOffset);

  const todayIso = toLocalDate(new Date());
  const todayIdx = days ? days.findIndex((d) => d.iso === todayIso) : -1;
  const selected = picked ?? (todayIdx >= 0 ? todayIdx : 0);
  const day = days?.[selected];

  const go = (delta: number) => {
    setWeekOffset((w) => w + delta);
    setPicked(null);
  };
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const weekLabel = days ? `${fmt(days[0].date)} – ${fmt(days[6].date)}` : '…';

  return (
    <UserAppShell activeNavId="calendario">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E1D7] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#D5E2DB]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skin Cycling de 4 noches</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">Tu calendario</h1>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#E8E1D7] self-start md:self-auto">
            <button type="button" onClick={() => go(-1)} className="p-1 rounded-lg text-[#7E756F] hover:bg-[#FAF8F5] cursor-pointer" aria-label="Semana anterior"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-extrabold text-[#2D2825] px-2 min-w-[120px] text-center">{weekLabel}</span>
            <button type="button" onClick={() => go(1)} className="p-1 rounded-lg text-[#7E756F] hover:bg-[#FAF8F5] cursor-pointer" aria-label="Semana siguiente"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        {user === null && (
          <p role="alert" className="p-4 rounded-2xl bg-white border border-[#E8E1D7] text-sm text-[#66615C]">
            Inicia sesión para ver tu calendario. <Link href="/login" className="font-bold text-[#2E7D5B] hover:underline">Ir a iniciar sesión</Link>
          </p>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {user && !error && !days && <p className="text-xs text-[#8C827A]">Cargando tu calendario…</p>}

        {days && stats && day && (
          <>
            <WeekStrip days={days} selected={selected} todayIso={todayIso} onSelect={setPicked} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7"><DayDetail key={day.iso} day={day} isFuture={day.iso > todayIso} onComplete={completeSlot} /></div>
              <div className="lg:col-span-5"><ProgressCards days={days} stats={stats} todayIso={todayIso} /></div>
            </div>
          </>
        )}
      </div>
    </UserAppShell>
  );
}
