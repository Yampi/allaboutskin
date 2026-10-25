'use client';

import React from 'react';
import { Package, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { BusinessOfferItem } from '@/lib/api';

interface StoreOffersTableProps {
  offers: BusinessOfferItem[];
  onToggleStock: (offer: BusinessOfferItem) => void;
  onDeleteOffer: (offerId: number) => void;
}

export default function StoreOffersTable({
  offers,
  onToggleStock,
  onDeleteOffer,
}: StoreOffersTableProps) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-xs text-slate-500 shadow-xs">
        No se encontraron productos con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-[#FAF8F5] text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Producto</th>
              <th className="py-2.5 px-4">Marca</th>
              <th className="py-2.5 px-4">Precio USD</th>
              <th className="py-2.5 px-4">Precio VES</th>
              <th className="py-2.5 px-4">Sede</th>
              <th className="py-2.5 px-4">Disponibilidad</th>
              <th className="py-2.5 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-slate-50/70 transition">
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 overflow-hidden border border-slate-200">
                      {offer.product?.image_url ? (
                        <img
                          src={offer.product.image_url}
                          alt={offer.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{offer.product?.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {offer.product?.category || 'Dermocosmética'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-4 font-semibold text-slate-600">
                  {offer.product?.brand?.name || 'Genérico / Importado'}
                </td>
                <td className="py-2.5 px-4 font-bold text-slate-900">${offer.price}</td>
                <td className="py-2.5 px-4 font-bold text-[#4A6B5B]">
                  {offer.price_ves ? `Bs. ${offer.price_ves}` : '-'}
                </td>
                <td className="py-2.5 px-4 text-[11px] text-slate-500">
                  {offer.branch?.name || 'Todas las sedes'}
                </td>
                <td className="py-2.5 px-4">
                  <button
                    type="button"
                    onClick={() => onToggleStock(offer)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                      offer.in_stock
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {offer.in_stock ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-600" />
                    )}
                    <span>{offer.in_stock ? 'En Stock' : 'Agotado'}</span>
                  </button>
                </td>
                <td className="py-2.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteOffer(offer.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                    title="Retirar de vitrina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
