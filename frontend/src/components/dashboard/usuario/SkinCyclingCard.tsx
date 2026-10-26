import React from 'react';
import { Flame } from 'lucide-react';
import type { RoutineStats, TodayRoutine } from '@/lib/userDashboardApi';
import type { Section } from '@/hooks/useUserDashboard';
import DashboardCard from './DashboardCard';
import { CYCLE_STEPS } from './labels';

interface SkinCyclingCardProps {
  routine: Section<TodayRoutine>;
  stats: Section<RoutineStats>;
  onRetry: () => void;
}

export default function SkinCyclingCard({ routine, stats, onRetry }: SkinCyclingCardProps) {
  const phase = routine.data?.skin_cycling_phase;
  const streak = stats.data?.current_streak_days;
  const section = routine.status === 'ready' ? stats : routine;

  return (
    <DashboardCard
      title="Skin Cycling"
      icon={<Flame className="w-4 h-4 text-amber-500" />}
      section={section}
      onRetry={onRetry}
      link={{ href: '/calendario', label: 'Ver calendario y niveles de envases' }}
    >
      <div className="text-xs font-medium text-[#66615C]">
        Racha actual: <span className="font-bold text-[#2E7D5B]">{streak ?? 0} {streak === 1 ? 'día' : 'días'}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {CYCLE_STEPS.map((step, idx) => {
          const active = step.phase === phase;
          return (
            <div key={step.phase} className={`space-y-1.5 ${active ? '' : 'opacity-60'}`}>
              <div
                className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                  active ? 'bg-[#2E7D5B] text-white ring-4 ring-[#E6F4EC]' : 'bg-[#FAFAF7] border border-[#E8E1D7] text-[#66615C]'
                }`}
              >
                {idx + 1}
              </div>
              <div className={`text-[10px] leading-tight ${active ? 'font-black text-[#2E7D5B]' : 'font-medium text-[#2D2825]'}`}>
                {step.title}
              </div>
              <div className="text-[9px] text-[#8C827A]">Noche {idx + 1}</div>
            </div>
          );
        })}
      </div>
      {routine.data && <p className="text-[10px] text-[#8C827A]">Hoy: {routine.data.skin_cycling_label}</p>}
    </DashboardCard>
  );
}
