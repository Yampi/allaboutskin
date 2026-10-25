import React from 'react';
import { Terminal, X } from 'lucide-react';

interface AdminScraperConsoleModalProps {
  output: string | null;
  onClose: () => void;
}

export default function AdminScraperConsoleModal({
  output,
  onClose,
}: AdminScraperConsoleModalProps) {
  if (!output) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-950 text-slate-100 rounded-lg border border-slate-800 shadow-xl max-w-2xl w-full p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span className="font-bold">Salida de Consola del Crawler</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap p-3 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300">
          {output}
        </pre>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs transition"
          >
            Cerrar Consola
          </button>
        </div>
      </div>
    </div>
  );
}
