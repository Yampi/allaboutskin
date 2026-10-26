import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface StoreToastProps {
  toast: { type: 'success' | 'error'; message: string } | null;
}

export default function StoreToast({ toast }: StoreToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`px-4 py-2.5 rounded-md shadow-sm border text-xs font-semibold flex items-center gap-2.5 ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
