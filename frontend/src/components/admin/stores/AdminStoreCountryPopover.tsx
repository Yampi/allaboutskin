import React, { useState } from 'react';
import { X, Globe } from 'lucide-react';

interface AdminStoreCountryPopoverProps {
  store: any;
  onUpdateCountry: (storeId: number, code: string, name?: string, flag?: string) => void;
  onClose: () => void;
}

const countries = [
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
];

export default function AdminStoreCountryPopover({
  store,
  onUpdateCountry,
  onClose,
}: AdminStoreCountryPopoverProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-md max-w-sm w-full p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Globe className="w-4 h-4 text-[#4A6B5B]" />
            <h3 className="text-xs font-bold">Cambiar País de {store.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          {countries.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => onUpdateCountry(store.id, c.code, c.name, c.flag)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-slate-50 border border-slate-100 transition text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>{c.flag}</span>
                <span className="font-medium text-slate-800">{c.name}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{c.code}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
