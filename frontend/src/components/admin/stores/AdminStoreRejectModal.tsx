import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface AdminStoreRejectModalProps {
  store: any;
  reason: string;
  onReasonChange: (val: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function AdminStoreRejectModal({
  store,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
}: AdminStoreRejectModalProps) {
  if (!store) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-md max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold">Rechazar Comercio</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          ¿Deseas rechazar la solicitud de <strong>{store.name}</strong>? Especifica el motivo para notificar al comerciante:
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Ej: Información de RIF o contacto inconsistente..."
          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500"
        />

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
            className="px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs"
          >
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  );
}
