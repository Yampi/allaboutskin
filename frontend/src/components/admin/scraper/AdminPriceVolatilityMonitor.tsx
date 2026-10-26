import React from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatUsd, formatLocalPrice } from '@/lib/formatters';

interface AdminPriceVolatilityMonitorProps {
  recentPrices?: any[];
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  onInspectOffer?: (offer: any) => void;
}

export default function AdminPriceVolatilityMonitor({
  recentPrices = [],
  selectedCountry,
  onCountryChange,
  onInspectOffer,
}: AdminPriceVolatilityMonitorProps) {
  const filtered = selectedCountry === 'ALL'
    ? recentPrices
    : recentPrices.filter((p) => p.country_code === selectedCountry || (p.store as any)?.country_code === selectedCountry);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h4 className="text-xs font-bold text-slate-900">
            Monitor de Precios Recientes & Volatilidad
          </h4>
          <p className="text-[11px] text-slate-500">Últimas actualizaciones detectadas por los conectores</p>
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => onCountryChange(e.target.value)}
          className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
        >
          <option value="ALL">Todos los Países</option>
          <option value="VE">Venezuela (VE)</option>
          <option value="CO">Colombia (CO)</option>
          <option value="CL">Chile (CL)</option>
        </select>
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No hay variaciones de precios recientes registradas.
          </div>
        ) : (
          filtered.slice(0, 20).map((offer: any) => {
            const productName = offer.product?.name || offer.name || 'Producto';
            const storeName = offer.store?.name || 'Farmacia';
            const priceUsd = offer.price ?? offer.price_usd ?? 0;
            const priceVes = offer.price_ves;

            return (
              <div
                key={offer.id}
                className="p-2.5 rounded-md border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 flex items-center justify-between gap-3 text-xs transition"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{productName}</div>
                  <div className="text-[11px] text-slate-500">{storeName}</div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{formatUsd(priceUsd)}</span>
                    {priceVes && (
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {formatLocalPrice(priceVes, 'Bs.')}
                      </span>
                    )}
                  </div>

                  {onInspectOffer && (
                    <button
                      type="button"
                      onClick={() => onInspectOffer(offer)}
                      className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 transition cursor-pointer"
                    >
                      Ver
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
