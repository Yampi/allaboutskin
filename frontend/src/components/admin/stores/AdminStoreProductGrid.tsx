import React from 'react';
import { Search, Package, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { formatUsd, formatLocalPrice } from '@/lib/formatters';

interface AdminStoreProductGridProps {
  products: any[];
  search: string;
  onSearchChange: (val: string) => void;
  stockFilter: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK';
  onStockFilterChange: (val: 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK') => void;
  isLoading: boolean;
  onInspectOffer?: (offer: any) => void;
}

export default function AdminStoreProductGrid({
  products,
  search,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  isLoading,
  onInspectOffer,
}: AdminStoreProductGridProps) {
  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.product?.name || p.name || '').toLowerCase().includes(search.toLowerCase());
    const stockMatch =
      stockFilter === 'ALL'
        ? true
        : stockFilter === 'IN_STOCK'
        ? Boolean(p.in_stock)
        : !p.in_stock;
    return nameMatch && stockMatch;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3 flex-1">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar productos de esta tienda..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(['ALL', 'IN_STOCK', 'OUT_OF_STOCK'] as const).map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              onClick={() => onStockFilterChange(filterKey)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                stockFilter === filterKey
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {filterKey === 'ALL' ? 'Todos' : filterKey === 'IN_STOCK' ? 'En Stock' : 'Agotados'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto max-h-[580px] space-y-2 pr-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Cargando catálogo...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No se encontraron productos para esta tienda con los filtros actuales.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const productName = p.product?.name || p.name || 'Producto sin nombre';
            const brand = p.product?.brand || p.brand || 'Dermatología';
            const priceUsd = p.price ?? p.price_usd ?? 0;
            const priceVes = p.price_ves;
            const inStock = Boolean(p.in_stock);

            return (
              <div
                key={p.id}
                className="p-3 rounded-md border border-slate-200 hover:border-slate-300 transition flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{productName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>{brand}</span>
                    <span>•</span>
                    <span className={inStock ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}>
                      {inStock ? 'En stock' : 'Agotado'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{formatUsd(priceUsd)}</div>
                    {priceVes && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {formatLocalPrice(priceVes, 'Bs.')}
                      </div>
                    )}
                  </div>

                  {onInspectOffer && (
                    <button
                      type="button"
                      onClick={() => onInspectOffer(p)}
                      className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-semibold transition cursor-pointer"
                    >
                      Inspeccionar
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
