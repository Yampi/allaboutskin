import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface AdminGoogleDiscoveryResultsProps {
  results: any;
  onClose: () => void;
}

export default function AdminGoogleDiscoveryResults({
  results,
  onClose,
}: AdminGoogleDiscoveryResultsProps) {
  if (!results) return null;

  const sites = results.discovered_sites || results.items || results.organic || [];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="font-bold text-slate-800">
          Resultados del Descubrimiento ({sites.length} sitios detectados)
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-semibold"
        >
          Cerrar
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {sites.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No se detectaron nuevas URLs.</p>
        ) : (
          sites.map((item: any, idx: number) => (
            <div
              key={idx}
              className="p-2.5 rounded bg-white border border-slate-200 flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-slate-900 truncate">
                  {item.title || item.name || item.link}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {item.link || item.url}
                </div>
                {item.snippet && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                    {item.snippet}
                  </p>
                )}
              </div>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded text-[#4A6B5B] hover:bg-slate-50 shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
