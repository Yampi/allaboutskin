'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BusinessBranchItem } from '@/lib/api';
import StoreProductPicker from './StoreProductPicker';

interface StoreAddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    product_id: number;
    price: number;
    price_ves?: number;
    branch_id?: number | null;
    in_stock: boolean;
  }) => Promise<void>;
  branches: BusinessBranchItem[];
  defaultExchangeRate?: string;
  isSubmitting: boolean;
}

export default function StoreAddOfferModal({
  isOpen,
  onClose,
  onSubmit,
  branches,
  defaultExchangeRate = '45.00',
  isSubmitting,
}: StoreAddOfferModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [price, setPrice] = useState('');
  const [priceVes, setPriceVes] = useState('');
  const [branchId, setBranchId] = useState('');
  const [inStock, setInStock] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !price) return;
    await onSubmit({
      product_id: selectedProduct.id,
      price: parseFloat(price),
      price_ves: priceVes ? parseFloat(priceVes) : undefined,
      branch_id: branchId ? parseInt(branchId) : null,
      in_stock: inStock,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-lg p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Añadir Producto a tu Vitrina</h3>
            <p className="text-[11px] text-slate-500">Busca en la base científica y asigna tu precio.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <StoreProductPicker
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Precio USD ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="15.00"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  const val = parseFloat(e.target.value);
                  const rate = parseFloat(defaultExchangeRate) || 45;
                  if (val > 0) setPriceVes((val * rate).toFixed(2));
                }}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Precio Bs (VES)</label>
              <input
                type="number"
                step="0.10"
                value={priceVes}
                onChange={(e) => setPriceVes(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-[#4A6B5B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Sucursal</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
            >
              <option value="">Disponible en todas las sucursales</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="rounded text-[#4A6B5B]"
            />
            <span className="font-semibold text-slate-700">Disponible de Inmediato (En Stock)</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-md cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedProduct}
              className="px-4 py-1.5 bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold rounded-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Guardando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
