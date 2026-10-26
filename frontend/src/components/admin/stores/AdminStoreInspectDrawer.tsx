import React from 'react';
import { X, MapPin, Phone, Globe, ExternalLink, Package, Building2 } from 'lucide-react';
import Link from 'next/link';

interface AdminStoreInspectDrawerProps {
  store: any;
  onClose: () => void;
  isLoading: boolean;
}

export default function AdminStoreInspectDrawer({
  store,
  onClose,
  isLoading,
}: AdminStoreInspectDrawerProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-lg border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">{store.name}</h2>
              <p className="text-xs text-slate-500">slug: {store.slug}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Cargando detalles...</div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800">Información General</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Estado: <span className="font-semibold text-slate-900">{store.verification_status}</span></div>
                  <div>Plan: <span className="font-semibold text-slate-900">{store.subscription_tier || 'FREE'}</span></div>
                  <div>País: <span className="font-semibold text-slate-900">{store.country_name || store.country_code || 'VE'}</span></div>
                  <div>WhatsApp: <span className="font-semibold text-slate-900">{store.whatsapp_contact || 'No especificado'}</span></div>
                </div>
              </div>

              {store.branches && store.branches.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#4A6B5B]" />
                    <span>Sucursales ({store.branches.length})</span>
                  </div>
                  <div className="space-y-2">
                    {store.branches.map((b: any) => (
                      <div key={b.id} className="p-2.5 rounded border border-slate-200 bg-white">
                        <div className="font-semibold text-slate-900">{b.name}</div>
                        <div className="text-[11px] text-slate-500">{b.address}, {b.city}</div>
                        {b.phone && <div className="text-[11px] text-slate-500">Telf: {b.phone}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {store.offers && store.offers.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-[#4A6B5B]" />
                    <span>Catálogo de Productos ({store.offers.length})</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {store.offers.slice(0, 20).map((o: any) => (
                      <div key={o.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800 truncate">{o.product?.name || o.name || 'Producto'}</span>
                        <span className="font-bold text-slate-900 shrink-0">${o.price ?? o.price_usd ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <Link
            href={`/en-tienda/${store.slug}`}
            target="_blank"
            className="text-xs font-semibold text-[#4A6B5B] hover:underline flex items-center gap-1"
          >
            <span>Ver vitrina digital</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
