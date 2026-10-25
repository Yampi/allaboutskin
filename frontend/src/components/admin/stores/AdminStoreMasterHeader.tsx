import React from 'react';
import Link from 'next/link';
import { ExternalLink, BadgeCheck, ShieldAlert, Edit, Trash2 } from 'lucide-react';

interface AdminStoreMasterHeaderProps {
  storeDetail: any;
  onApprove: (id: number) => void;
  onRejectModal: (store: any) => void;
  onTierModal: (store: any) => void;
  onDeleteModal: (store: any) => void;
  onCountryModal: (store: any) => void;
}

export default function AdminStoreMasterHeader({
  storeDetail,
  onApprove,
  onRejectModal,
  onTierModal,
  onDeleteModal,
  onCountryModal,
}: AdminStoreMasterHeaderProps) {
  if (!storeDetail) return null;

  const isVerified = storeDetail.verification_status === 'VERIFIED';
  const isPending = storeDetail.verification_status === 'PENDING_REVIEW';
  const offersCount = storeDetail.product_offers_count ?? storeDetail.total_offers_count ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base font-bold text-slate-900">{storeDetail.name}</h2>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isVerified
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : isPending
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {storeDetail.verification_status}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {storeDetail.subscription_tier || 'FREE'}
          </span>
          <button
            onClick={() => onCountryModal(storeDetail)}
            className="text-[11px] font-mono text-slate-600 hover:text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50 cursor-pointer"
          >
            {storeDetail.country_flag || '🌐'} {storeDetail.country_code || 'VE'}
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>{offersCount} productos en catálogo</span>
          <span>•</span>
          <Link
            href={`/en-tienda/${storeDetail.slug}`}
            target="_blank"
            className="text-[#4A6B5B] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Ver vitrina</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {isPending && (
          <button
            onClick={() => onApprove(storeDetail.id)}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Aprobar
          </button>
        )}
        {isPending && (
          <button
            onClick={() => onRejectModal(storeDetail)}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold transition cursor-pointer"
          >
            Rechazar
          </button>
        )}
        <button
          onClick={() => onTierModal(storeDetail)}
          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
        >
          <Edit className="w-3 h-3" />
          <span>Cambiar Plan</span>
        </button>
        <button
          onClick={() => onDeleteModal(storeDetail)}
          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
}
