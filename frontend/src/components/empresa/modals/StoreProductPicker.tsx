'use client';

import React, { useState, useEffect } from 'react';
import { Search, Package, CheckCircle2, Loader2 } from 'lucide-react';
import { searchCatalogProducts } from '@/lib/api';

interface StoreProductPickerProps {
  selectedProduct: any | null;
  onSelectProduct: (prod: any | null) => void;
}

export default function StoreProductPicker({
  selectedProduct,
  onSelectProduct,
}: StoreProductPickerProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        setResults(await searchCatalogProducts(query));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <label className="font-bold text-slate-700 block mb-1">1. Buscar Producto *</label>
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Nombre o marca..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (selectedProduct) onSelectProduct(null);
          }}
          className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#4A6B5B]"
        />
        {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      </div>

      {results.length > 0 && !selectedProduct && (
        <div className="mt-1 bg-white border border-slate-200 rounded-md max-h-36 overflow-y-auto divide-y divide-slate-100 shadow-xs">
          {results.map((prod) => (
            <div
              key={prod.id}
              onClick={() => {
                onSelectProduct(prod);
                setQuery(prod.name);
                setResults([]);
              }}
              className="p-1.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
            >
              <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-800 truncate">{prod.name} ({prod.brand?.name})</span>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="mt-1 p-2 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {selectedProduct.name}
          </span>
          <button type="button" onClick={() => onSelectProduct(null)} className="text-[10px] text-slate-500 hover:underline">
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
}
