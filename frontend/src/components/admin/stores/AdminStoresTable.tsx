import React from 'react';
import Link from 'next/link';
import { Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import { AdminStoreItem } from '@/lib/api';

interface AdminStoresTableProps {
  stores: AdminStoreItem[];
  onInspect: (store: any) => void;
  onApprove: (id: number) => void;
  onRejectModal: (store: any) => void;
  onTierModal: (store: any) => void;
  onDeleteModal: (store: any) => void;
}

export default function AdminStoresTable({
  stores,
  onInspect,
  onApprove,
  onRejectModal,
  onTierModal,
  onDeleteModal,
}: AdminStoresTableProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-4 py-3">Comercio</th>
              <th className="px-4 py-3">País / Sedes</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron comercios registrados.
                </td>
              </tr>
            ) : (
              stores.map((store) => {
                const isVerified = store.verification_status === 'VERIFIED';
                const isPending = store.verification_status === 'PENDING_REVIEW';
                const offersCount = store.product_offers_count ?? (store as any).total_offers_count ?? 0;

                return (
                  <tr key={store.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{store.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {offersCount} productos • slug: {store.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{(store as any).country_name || (store as any).country_code || 'Venezuela'}</div>
                      <div className="text-[11px] text-slate-400">{(store as any).branches_count ?? 0} sucursales</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {store.subscription_tier || 'FREE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {store.verification_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onInspect(store)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded transition cursor-pointer"
                        title="Ver detalle de tienda"
                      >
                        <Eye className="w-3 h-3 inline mr-1" /> Ver
                      </button>
                      {isPending && (
                        <button
                          onClick={() => onApprove(store.id)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-semibold rounded transition cursor-pointer"
                        >
                          Aprobar
                        </button>
                      )}
                      {isPending && (
                        <button
                          onClick={() => onRejectModal(store)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-semibold rounded transition cursor-pointer"
                        >
                          Rechazar
                        </button>
                      )}
                      <button
                        onClick={() => onTierModal(store)}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold rounded transition cursor-pointer"
                        title="Editar plan"
                      >
                        <Edit className="w-3 h-3 inline" />
                      </button>
                      <button
                        onClick={() => onDeleteModal(store)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded transition cursor-pointer"
                        title="Eliminar tienda"
                      >
                        <Trash2 className="w-3 h-3 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
