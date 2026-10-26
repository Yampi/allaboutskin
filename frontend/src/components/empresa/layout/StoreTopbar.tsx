'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, ExternalLink, Bell } from 'lucide-react';
import { BusinessStoreProfile } from '@/lib/api';

interface StoreTopbarProps {
  store: BusinessStoreProfile | null;
  branchSlug?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export default function StoreTopbar({
  store,
  branchSlug,
  searchQuery = '',
  onSearchChange,
}: StoreTopbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar catálogo, referencias, clientes..."
          className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B] focus:border-[#4A6B5B] transition shadow-xs"
        />
      </div>

      <div className="flex items-center justify-end gap-3 shrink-0">
        {branchSlug && (
          <Link
            href={`/en-tienda/${branchSlug}`}
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-md transition shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#4A6B5B]" />
            <span>Ver vitrina en vivo</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        )}

        <button
          type="button"
          className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-xs relative"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#4A6B5B] absolute top-1.5 right-1.5" />
        </button>

        <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-md py-1.5 px-3 shadow-xs">
          <div className="w-7 h-7 rounded-md bg-slate-100 text-[#4A6B5B] font-bold text-xs flex items-center justify-center overflow-hidden border border-slate-200">
            {store?.name ? store.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">
              {store?.name || 'Comercio Asociado'}
            </div>
            <div className="text-[10px] text-[#4A6B5B] font-semibold leading-none mt-0.5">
              Dueño de tienda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
