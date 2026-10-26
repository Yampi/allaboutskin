import React from 'react';
import Link from 'next/link';
import type { SkinScansSummary } from '@/lib/userDashboardApi';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ScanHistory({ scans }: { scans: SkinScansSummary }) {
  const latest = scans.latest_scan;

  if (scans.total_scans === 0) {
    return (
      <p className="p-4 rounded-2xl border border-dashed border-[#E8E1D7] text-xs text-[#66615C]">
        Aún no tienes escaneos. <Link href="/escaner" className="font-bold text-[#2E7D5B] hover:underline">Hacer mi primer escaneo</Link>
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E1D7] space-y-3">
        <h3 className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">Historial de análisis ({scans.total_scans})</h3>
        <ul className="divide-y divide-[#F0EBE3]">
          {scans.scans.map((s) => (
            <li key={s.id} className="py-2 flex items-center justify-between text-xs">
              <span className="text-[#2D2825] font-semibold">{formatDate(s.created_at)} · {s.scan_mode === 'product' ? 'Escaneo de producto' : 'Escaneo facial'}</span>
              <span className="font-extrabold text-[#2E7D5B]">{s.overall_score}/100</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] space-y-2">
        <h3 className="text-[11px] font-bold text-[#66615C] uppercase tracking-wider">Recomendaciones del último escaneo</h3>
        {latest?.recommendations ? (
          <p className="text-xs text-[#2D2825] leading-relaxed whitespace-pre-line">{latest.recommendations}</p>
        ) : (
          <p className="text-xs text-[#66615C]">El último escaneo no incluye recomendaciones.</p>
        )}
      </div>
    </div>
  );
}
