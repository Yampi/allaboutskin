import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminToastProps {
  notification: { type: 'success' | 'error'; message: string } | null;
}

export default function AdminToast({ notification }: AdminToastProps) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';

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
        <span>{notification.message}</span>
      </div>
    </div>
  );
}
