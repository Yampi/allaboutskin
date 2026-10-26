import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface AdminStoreDeleteModalProps {
  store: any;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AdminStoreDeleteModal({
  store,
  isDeleting,
  onConfirm,
  onClose,
}: AdminStoreDeleteModalProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-md max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-700">
            <Trash2 className="w-4 h-4" />
            <h3 className="text-sm font-bold">Eliminar Tienda</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          ¿Confirmas la eliminación permanente de <strong>{store.name}</strong>? Se purgarán todas sus ofertas, sucursales y datos vinculados. Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs disabled:opacity-50"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Permanentemente'}
          </button>
        </div>
      </div>
    </div>
  );
}
