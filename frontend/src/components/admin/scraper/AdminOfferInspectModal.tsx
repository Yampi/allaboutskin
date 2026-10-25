import React from 'react';
import { X, ExternalLink, Package, DollarSign, Store, Tag } from 'lucide-react';
import { formatUsd, formatLocalPrice } from '@/lib/formatters';

interface AdminOfferInspectModalProps {
  offer: any;
  onClose: () => void;
}

export default function AdminOfferInspectModal({
  offer,
  onClose,
}: AdminOfferInspectModalProps) {
  if (!offer) return null;

  const productName = offer.product?.name || offer.name || 'Producto';
  const brand = offer.product?.brand || offer.brand || 'Dermatología';
  const storeName = offer.store?.name || 'Comercio';
  const priceUsd = offer.price ?? offer.price_usd ?? 0;
  const priceVes = offer.price_ves;
  const inStock = Boolean(offer.in_stock);
  const inci = offer.product?.inci_declaration || offer.inci_declaration;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg max-w-lg w-full p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#4A6B5B]" />
            <h3 className="text-sm font-bold text-slate-900">Inspección de Oferta</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <div className="font-bold text-sm text-slate-900">{productName}</div>
            <div className="text-[11px] text-slate-500">Marca: {brand} • Tienda: {storeName}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio USD</span>
              <span className="text-base font-black text-slate-900">{formatUsd(priceUsd)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio Bs</span>
              <span className="text-base font-black text-slate-900 font-mono">
                {priceVes ? formatLocalPrice(priceVes, 'Bs.') : '—'}
              </span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Estado de inventario:</span>
              <span className={`font-bold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                {inStock ? 'Disponible en stock' : 'Agotado'}
              </span>
            </div>
          </div>

          {inci && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-700 block text-[11px]">Fórmula / INCI:</span>
              <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600 font-mono text-[10px] max-h-24 overflow-y-auto">
                {inci}
              </p>
            </div>
          )}

          {offer.product_url && (
            <a
              href={offer.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#4A6B5B] hover:underline font-semibold"
            >
              <span>Ver ficha en tienda original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-semibold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
