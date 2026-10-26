import React from 'react';
import { Store, ChevronRight, ExternalLink } from 'lucide-react';
import { getCountryFlag } from '@/lib/formatters';

interface AdminCrawledStoresAccordionProps {
  storesByCountry?: Record<string, any[]>;
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
  search: string;
  onSearchChange: (term: string) => void;
}

export default function AdminCrawledStoresAccordion({
  storesByCountry = {},
  selectedCountry,
  onSelectCountry,
  search,
  onSearchChange,
}: AdminCrawledStoresAccordionProps) {
  const countryCodes = Object.keys(storesByCountry);
  const activeStores = selectedCountry === 'ALL'
    ? Object.values(storesByCountry).flat()
    : storesByCountry[selectedCountry] || [];

  const filteredStores = activeStores.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-900">
          Cadenas y Tiendas en Red de Monitoreo
        </h4>

        {/* Country Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => onSelectCountry('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
              selectedCountry === 'ALL'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos
          </button>
          {countryCodes.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onSelectCountry(code)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                selectedCountry === code
                  ? 'bg-[#4A6B5B] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{getCountryFlag(code)}</span>
              <span>{code}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {filteredStores.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No hay cadenas indexadas para este país.
          </div>
        ) : (
          filteredStores.map((store: any, idx: number) => (
            <div
              key={store.id || idx}
              className="p-2.5 rounded-md border border-slate-100 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-xs transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base">{getCountryFlag(store.country_code || 'VE')}</span>
                <div className="truncate">
                  <span className="font-bold text-slate-900">{store.name}</span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    {store.branches_count || 0} sedes
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                  {store.offers_count ?? store.product_offers_count ?? 0} ofertas
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
