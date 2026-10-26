import React from 'react';
import { ChevronDown } from 'lucide-react';
import type { SkinProfileData } from '@/lib/api';
import type { SkinScansSummary } from '@/lib/userDashboardApi';
import type { Section } from '@/hooks/useUserDashboard';
import DashboardCard, { EmptyNote } from './DashboardCard';
import { BARRIER_LABELS, SKIN_TYPE_LABELS, conditionLabel } from './labels';

interface SkinStatusCardProps {
  profile: Section<SkinProfileData | null>;
  scans: Section<SkinScansSummary>;
  onRetry: () => void;
}

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ScoreGauge({ score }: { score: number }) {
  return (
    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={RADIUS} className="stroke-[#E8E1D7]/50" strokeWidth="8" fill="transparent" />
        <circle
          cx="50" cy="50" r={RADIUS} className="stroke-[#2E7D5B]" strokeWidth="8" fill="transparent"
          strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE} strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-extrabold text-[#2D2825] leading-none">
          {score}<span className="text-[11px] font-medium text-[#8C827A]">/100</span>
        </span>
        <span className="block text-[8px] font-semibold text-[#66615C] mt-0.5">Último escaneo</span>
      </div>
    </div>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] font-bold text-[#8C827A] uppercase block">{label}</span>
      <span className="font-semibold text-[#2D2825]">{value}</span>
    </div>
  );
}

export default function SkinStatusCard({ profile, scans, onRetry }: SkinStatusCardProps) {
  const p = profile.data;
  const latest = scans.data?.latest_scan ?? null;
  const conditions = p?.active_conditions ?? [];

  return (
    <DashboardCard
      title="Estado de tu piel"
      icon={<ChevronDown className="w-4 h-4 text-[#8C827A]" />}
      section={profile.status === 'ready' ? scans : profile}
      onRetry={onRetry}
      link={{ href: '/mi-piel', label: 'Ver análisis completo de piel' }}
    >
      {!p ? (
        <EmptyNote text="Aún no has completado tu perfil dermatológico." cta={{ href: '/mi-piel', label: 'Completar mi perfil' }} />
      ) : (
        <div className="flex items-center gap-4">
          {latest?.overall_score != null ? (
            <ScoreGauge score={latest.overall_score} />
          ) : (
            <EmptyNote text={latest ? "Tu último escaneo no incluye una puntuación." : "Sin escaneos todavía."} cta={{ href: '/escaner', label: 'Hacer mi primer escaneo' }} />
          )}
          <div className="space-y-2 text-xs">
            <Attribute label="Biotipo cutáneo" value={SKIN_TYPE_LABELS[p.skin_type] ?? p.skin_type} />
            <Attribute label="Fototipo Fitzpatrick" value={p.fitzpatrick_type ? `Fototipo ${p.fitzpatrick_type}` : 'No indicado'} />
            <Attribute label="Barrera cutánea" value={BARRIER_LABELS[p.barrier_status] ?? p.barrier_status} />
            <Attribute label="Focos activos" value={conditions.length ? conditions.slice(0, 2).map(conditionLabel).join(' + ') : 'Ninguno registrado'} />
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
