import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export default function ErrorState({ message, onRetry, title = 'No se pudieron cargar los datos' }: ErrorStateProps) {
  return (
    <div role="alert" className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center space-y-2">
      <AlertTriangle className="w-5 h-5 text-rose-500 mx-auto" />
      <div className="text-sm font-bold text-rose-800">{title}</div>
      <p className="text-xs text-rose-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reintentar
        </button>
      )}
    </div>
  );
}
