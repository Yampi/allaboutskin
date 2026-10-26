import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
import ErrorState from '@/components/system/ErrorState';
import { useAdminB2BMetrics } from '@/hooks/admin/useAdminB2BMetrics';

interface MetricProps {
  label: string;
  value: string | number;
  hint: string;
}

function Metric({ label, value, hint }: MetricProps) {
  return (
    <div className="p-3.5 rounded-md bg-slate-50 border border-slate-100 space-y-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{label}</span>
      <div className="text-xl font-black text-slate-900">{value}</div>
      <span className="text-[10px] text-slate-400">{hint}</span>
    </div>
  );
}

export default function AdminB2BIntelligence() {
  const { summary, crawler, error, reload } = useAdminB2BMetrics();

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#4A6B5B]/10 text-[#4A6B5B]">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Inteligencia B2B: leads y catálogo (datos agregados)
            </h2>
          </div>
          <p className="text-xs text-slate-500">Métricas reales de hoy y de las últimas 24 h, sin datos personales.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 self-start">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sin PII</span>
        </span>
      </div>

      {error && <ErrorState message={error} onRetry={reload} />}
      {!error && (!summary || !crawler) && <p className="text-xs text-slate-500">Cargando métricas...</p>}
      {summary && crawler && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Metric label="Leads a tiendas (hoy)" value={summary.today_leads_count} hint="Clics hacia comercios registrados hoy" />
          <Metric label="Usuarios nuevos (hoy)" value={summary.today_users_count} hint={`${summary.total_users_count} usuarios en total`} />
          <Metric
            label="Ofertas en stock"
            value={`${crawler.kpis.in_stock_offers}/${crawler.kpis.total_offers}`}
            hint={`${crawler.kpis.stock_rate_percentage}% con stock`}
          />
          <Metric
            label="Cobertura de ingredientes"
            value={`${crawler.kpis.coverage_rate_percentage}%`}
            hint={`${crawler.kpis.crawled_ingredients_period} de ${crawler.kpis.total_active_ingredients} rastreados en 24 h`}
          />
        </div>
      )}
    </div>
  );
}
