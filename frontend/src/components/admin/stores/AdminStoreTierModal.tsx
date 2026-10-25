import React from 'react';
import { X, Check } from 'lucide-react';

interface AdminStoreTierModalProps {
  store: any;
  selectedTier: string;
  onTierChange: (tier: string) => void;
  selectedFeatured: boolean;
  onFeaturedChange: (featured: boolean) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AdminStoreTierModal({
  store,
  selectedTier,
  onTierChange,
  selectedFeatured,
  onFeaturedChange,
  onConfirm,
  onClose,
}: AdminStoreTierModalProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-md max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">
            Actualizar Plan de {store.name}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          <label className="font-semibold text-slate-700 block">Nivel de Suscripción</label>
          <select
            value={selectedTier}
            onChange={(e) => onTierChange(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#4A6B5B]"
          >
            <option value="FREE">Plan FREE (Hasta 3 sucursales, 50 productos)</option>
            <option value="PRO_LOCAL">Plan PRO_LOCAL (Hasta 10 sucursales, 500 productos)</option>
            <option value="ENTERPRISE">Plan ENTERPRISE (Sucursales ilimitadas, catálogo masivo)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            id="featured_check"
            checked={selectedFeatured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="rounded border-slate-300 text-[#4A6B5B] focus:ring-[#4A6B5B]"
          />
          <label htmlFor="featured_check" className="font-medium text-slate-700 cursor-pointer">
            Destacar en la página de inicio y directorio de tiendas
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-md bg-[#4A6B5B] hover:bg-[#3d594b] text-xs font-semibold text-white shadow-xs"
          >
            Guardar Plan
          </button>
        </div>
      </div>
    </div>
  );
}
