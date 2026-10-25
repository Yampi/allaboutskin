import React from 'react';
import Link from 'next/link';
import { Search, Bell, ExternalLink } from 'lucide-react';

interface AdminTopbarProps {
  onSearch?: (term: string) => void;
}

export default function AdminTopbar({ onSearch }: AdminTopbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar usuarios, tiendas, productos..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B] focus:border-[#4A6B5B] transition shadow-xs"
        />
      </div>

      <div className="flex items-center justify-end gap-2 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
          title="Ver Vitrina Pública"
        >
          <span>Sitio Público</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition shadow-xs relative"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B5B] absolute top-1.5 right-1.5 ring-1 ring-white" />
        </button>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md py-1 px-2.5 shadow-xs">
          <div className="w-6 h-6 rounded-md bg-[#4A6B5B]/10 text-[#4A6B5B] font-bold text-xs flex items-center justify-center border border-[#4A6B5B]/20">
            A
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">Super Admin</div>
            <div className="text-[10px] text-slate-500 leading-none">Operaciones</div>
          </div>
        </div>
      </div>
    </div>
  );
}
