import React from 'react';
import type { WeekDay } from '@/hooks/useCalendarWeek';
import { phaseOf } from './phases';

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function WeekStrip({ days, selected, todayIso, onSelect }: {
  days: WeekDay[];
  selected: number;
  todayIso: string;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-[#E8E1D7] shadow-sm">
      <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
        {days.map((d, i) => {
          const phase = phaseOf(d.routine.skin_cycling_phase);
          const done = d.routine.pm_routine.is_completed;
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${DAY_NAMES[i]} ${d.date.getDate()}, ${phase.label}${done ? ', noche completada' : ''}`}
              className={`flex flex-col items-center p-2.5 sm:p-4 rounded-2xl transition cursor-pointer border ${selected === i ? 'bg-[#E6F4EC]/60 border-[#2E7D5B]' : 'border-transparent hover:bg-[#FAF8F5]'}`}
            >
              <span className="text-[11px] sm:text-xs text-[#7E756F] font-medium">{DAY_NAMES[i]}{d.iso === todayIso ? ' · Hoy' : ''}</span>
              <span className="text-base sm:text-xl font-extrabold text-[#2D2825] mt-0.5">{d.date.getDate()}</span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm my-2 border ${phase.badge}`}>{phase.num}</div>
              <span className="text-[9px] sm:text-[11px] font-semibold text-[#5D6B63] truncate max-w-full">{phase.label}</span>
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${done ? 'bg-[#2E7D5B]' : 'bg-[#E8E1D7]'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
