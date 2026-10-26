import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Section } from '@/hooks/useUserDashboard';

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  section?: Pick<Section<unknown>, 'status' | 'error'>;
  onRetry?: () => void;
  link?: { href: string; label: string };
  children: React.ReactNode;
}

export function EmptyNote({ text, cta }: { text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="p-3.5 rounded-2xl bg-[#FAFAF7] border border-dashed border-[#E8E1D7] text-xs text-[#66615C] space-y-1.5">
      <p>{text}</p>
      {cta && (
        <Link href={cta.href} className="font-bold text-[#2E7D5B] hover:underline">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

export default function DashboardCard({ title, icon, section, onRetry, link, children }: DashboardCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E8E1D7] p-6 shadow-2xs flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">{title}</h2>
        {icon}
      </div>

      {section?.status === 'loading' && <div className="text-xs text-[#8C827A]">Cargando…</div>}

      {section?.status === 'error' && (
        <div role="alert" className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
          <p className="font-bold">No se pudo cargar esta sección</p>
          <p>{section.error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="font-bold underline cursor-pointer">
              Reintentar
            </button>
          )}
        </div>
      )}

      {(!section || section.status === 'ready') && children}

      {link && (
        <Link href={link.href} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] hover:text-[#1B3D32] transition pt-1">
          <span>{link.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
