import React from 'react';
import { Flame } from 'lucide-react';
import type { RoutineStats } from '@/lib/userDashboardApi';
import type { WeekDay } from '@/hooks/useCalendarWeek';

const RING = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

export default function ProgressCards({ days, stats, todayIso }: { days: WeekDay[]; stats: RoutineStats; todayIso: string }) {
  const pct = Math.min(100, Math.max(0, stats.compliance_percentage_last_30_days));
  const pastDays = days.filter((d) => d.iso <= todayIso);
  const nights = pastDays.filter((d) => d.routine.pm_routine.is_completed).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#7E756F] uppercase tracking-wider block">Tu progreso</span>
          <h3 className="text-2xl font-extrabold text-[#2D2825]">Racha: {stats.current_streak_days} {stats.current_streak_days === 1 ? 'día' : 'días'}</h3>
          <p className="text-xs text-[#5D6B63] flex items-center gap-1 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-current" />
            <span>{stats.total_routines_completed} rutinas registradas en total</span>
          </p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0" role="img" aria-label={`Constancia de los últimos 30 días: ${Math.round(pct)}%`}>
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path className="text-[#E6F4EC]" strokeWidth="3.5" stroke="currentColor" fill="none" d={RING} />
            <path className="text-[#2E7D5B]" strokeDasharray={`${pct}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d={RING} />
          </svg>
          <div className="absolute text-xs font-black text-[#2E7D5B]">{Math.round(pct)}%</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#66615C] font-semibold">Noches cumplidas esta semana</span>
          <span className="font-extrabold text-[#2E7D5B]">{nights} de {pastDays.length}</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const done = d.routine.pm_routine.is_completed;
            const future = d.iso > todayIso;
            return <div key={d.iso} className={`h-3 rounded-full ${done ? 'bg-[#2E7D5B]' : 'bg-[#E8E1D7]'}`} title={`${d.date.getDate()}: ${done ? 'cumplida' : future ? 'pendiente' : 'sin registro'}`} />;
          })}
        </div>
        <p className="text-[11px] text-[#8C827A]">El círculo cuenta los días con al menos un registro en los últimos 30 días.</p>
      </div>
    </div>
  );
}
