import React from 'react';
import { Package, Eye } from 'lucide-react';
import { formatUsd } from '@/lib/formatters';

interface AdminProductsTableProps {
  products: any[];
  onInspectProduct: (product: any) => void;
}

export default function AdminProductsTable({
  products,
  onInspectProduct,
}: AdminProductsTableProps) {
  return (
    <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-800">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
            <tr>
              <th className="px-4 py-3">Producto & Marca</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Volumen</th>
              <th className="px-4 py-3">Código EAN</th>
              <th className="px-4 py-3">Fórmula INCI</th>
              <th className="px-4 py-3">Ofertas</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No se encontraron productos coincidentes.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const bestOffer = product.store_offers && product.store_offers.length > 0
                  ? [...product.store_offers].sort((a, b) => a.price - b.price)[0]
                  : null;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/60 transition cursor-pointer"
                    onClick={() => onInspectProduct(product)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block text-xs">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {product.brand?.name || 'Genérica'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {product.category || 'SKINCARE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.volume_amount ? `${product.volume_amount} ${product.volume_unit || 'ml'}` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {product.barcode_ean || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {product.ingredients?.length > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {product.ingredients.length} activos
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">En auditoría</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {bestOffer ? (
                        <div>
                          <span className="font-bold text-slate-900">{formatUsd(bestOffer.price)}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {product.store_offers.length} tienda(s)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin ofertas</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectProduct(product);
                        }}
                        className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-700 font-semibold transition"
                      >
                        Ver
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
