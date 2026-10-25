'use client';

import React from 'react';
import { Store, ShieldCheck, Sparkles } from 'lucide-react';
import { BusinessStoreProfile } from '@/lib/api';

interface StoreProfileBadgeCardProps {
  store: BusinessStoreProfile | null;
}

export default function StoreProfileBadgeCard({ store }: StoreProfileBadgeCardProps) {
  if (!store) return null;

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-md bg-[#FAF8F5] border border-slate-200 flex items-center justify-center text-[#4A6B5B] font-bold">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">{store.name}</h4>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verificado</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Suscripción: <span className="font-semibold text-slate-700">{store.subscription_tier_label || 'Plan Básico'}</span>
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md self-start sm:self-auto">
        <Sparkles className="w-3.5 h-3.5 text-[#4A6B5B]" />
        <span>Gobernanza DLG-EXEC Activa</span>
      </div>
    </div>
  );
}
