'use client';

import React, { useState } from 'react';
import { MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { BusinessStoreProfile } from '@/lib/api';

interface StoreOverviewWaGeneratorProps {
  store: BusinessStoreProfile | null;
}

export default function StoreOverviewWaGenerator({ store }: StoreOverviewWaGeneratorProps) {
  const [waQuery, setWaQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const phone = store?.whatsapp_contact?.replace(/[^0-9]/g, '') || '';
  const prefilled = waQuery.trim()
    ? `¡Hola! Vi en All About Skin que tienen disponibilidad de "${waQuery.trim()}". ¿Me confirman precio y stock?`
    : `¡Hola ${store?.name || 'equipo'}! Los encontré a través de All About Skin.`;
  const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(prefilled)}` : '';

  const handleCopy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider mb-1">
            <MessageSquare className="w-3 h-3 text-[#4A6B5B]" />
            Utilidad Rápida
          </div>
          <h3 className="text-xs font-bold text-slate-900">
            Generador de Enlaces WhatsApp para Redes Sociales
          </h3>
        </div>

        {phone ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ej. CeraVe Limpiador..."
              value={waQuery}
              onChange={(e) => setWaQuery(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-[#4A6B5B] w-48"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-md bg-[#4A6B5B] hover:bg-[#3d594b] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
            Configura tu número de WhatsApp en la pestaña <strong>Perfil</strong>.
          </div>
        )}
      </div>

      {phone && url && (
        <div className="p-2.5 bg-slate-50 rounded-md border border-slate-200 text-xs font-mono text-slate-600 truncate flex items-center justify-between gap-3">
          <span className="truncate">{url}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4A6B5B] hover:underline font-sans font-bold flex items-center gap-1 text-[11px] shrink-0"
          >
            <span>Probar</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
