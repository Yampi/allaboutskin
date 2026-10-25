import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

interface AdminCrawlerHealthBannerProps {
  health?: {
    status?: string;
    badge?: string;
    score?: number;
    message?: string;
  };
  summaryHours: number;
  onHoursChange: (hours: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AdminCrawlerHealthBanner({
  health,
  summaryHours,
  onHoursChange,
  onRefresh,
  isLoading,
}: AdminCrawlerHealthBannerProps) {
  const status = health?.status || 'OPERATIONAL';
  const isOk = status === 'OPERATIONAL';
  const isWarn = status === 'ATTENTION';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#4A6B5B]" />
            <span>Diagnóstico de Red & Crawler</span>
          </h3>
          {health && (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                isOk
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isWarn
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {health.badge || status} (Score: {health.score ?? 100}/100)
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {health?.message || 'Auditoría de ofertas sincronizadas y salud de conectores.'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md p-0.5 text-xs">
          <span className="text-slate-400 px-1.5 text-[11px]">Ventana:</span>
          {[2, 6, 12, 24, 48].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onHoursChange(h)}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition cursor-pointer ${
                summaryHours === h
                  ? 'bg-[#4A6B5B] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  );
}
