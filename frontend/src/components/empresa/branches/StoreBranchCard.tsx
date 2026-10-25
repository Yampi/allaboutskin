'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Clock, Edit2, Trash2, ShoppingBag, ExternalLink, Copy, Check } from 'lucide-react';
import { BusinessBranchItem } from '@/lib/api';

interface StoreBranchCardProps {
  branch: BusinessBranchItem;
  canDelete: boolean;
  onEdit: (b: BusinessBranchItem) => void;
  onDelete: (id: number) => void;
  onCopySlug: (slug: string) => void;
  isCopied: boolean;
}

export default function StoreBranchCard({
  branch,
  canDelete,
  onEdit,
  onDelete,
  onCopySlug,
  isCopied,
}: StoreBranchCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">{branch.name}</h4>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Activa
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {branch.address}, {branch.city}, {branch.state}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(branch)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded transition cursor-pointer"
              title="Editar sucursal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => onDelete(branch.id)}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                title="Eliminar sucursal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="text-[11px] text-slate-600 space-y-1 bg-[#FAF8F5] p-2.5 rounded-md border border-slate-200">
          {branch.whatsapp && (
            <p className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Phone className="w-3 h-3 text-[#4A6B5B]" />
              <span>WhatsApp: {branch.whatsapp}</span>
            </p>
          )}
          {branch.opening_hours && (
            <p className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{branch.opening_hours}</span>
            </p>
          )}
          <p className="text-[10px] text-slate-400">
            GPS: {branch.latitude}, {branch.longitude} (Detección: {branch.geofence_radius_meters}m)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <Link
          href={`/en-tienda/${branch.slug}`}
          target="_blank"
          className="flex-1 py-1.5 bg-[#FAF8F5] hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-md transition flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#4A6B5B]" />
          <span>Ver Vitrina</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>

        <button
          type="button"
          onClick={() => onCopySlug(branch.slug)}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md transition flex items-center gap-1 cursor-pointer"
          title="Copiar enlace público"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>
    </div>
  );
}
