import React from 'react';
import { Store, MapPin, BadgeCheck, Clock, AlertTriangle } from 'lucide-react';
import { AdminStoreItem } from '@/lib/api';

interface AdminStoresGroupedListProps {
  stores: AdminStoreItem[];
  selectedStoreId: number | null;
  onSelectStore: (store: AdminStoreItem) => void;
}

export default function AdminStoresGroupedList({
  stores,
  selectedStoreId,
  onSelectStore,
}: AdminStoresGroupedListProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs space-y-2 h-[750px] flex flex-col">
      <div className="px-2 py-1 text-xs font-bold text-slate-800 border-b border-slate-100 flex items-center justify-between">
        <span>Comercios ({stores.length})</span>
        <span className="text-[10px] text-slate-400 font-normal">Selecciona para ver catálogo</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {stores.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            No hay comercios que coincidan con los filtros.
          </div>
        ) : (
          stores.map((store) => {
            const isSelected = selectedStoreId === store.id;
            const offersCount = store.product_offers_count ?? (store as any).total_offers_count ?? 0;
            const branchesCount = (store as any).branches_count ?? 0;
            const isVerified = store.verification_status === 'VERIFIED';
            const isPending = store.verification_status === 'PENDING_REVIEW';

            return (
              <button
                key={store.id}
                type="button"
                onClick={() => onSelectStore(store)}
                className={`w-full text-left p-2.5 rounded-md border transition cursor-pointer flex items-start justify-between gap-2 text-xs ${
                  isSelected
                    ? 'bg-slate-100 border-[#4A6B5B] shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate block">
                      {store.name}
                    </span>
                    {isVerified && (
                      <span title="Verificada">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#4A6B5B] shrink-0" />
                      </span>
                    )}
                    {isPending && (
                      <span title="Pendiente">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {(store as any).primary_branch?.city || (store as any).country_code || 'Sede'} • {branchesCount} sede(s)
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      offersCount > 0
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {offersCount} ofertas
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
