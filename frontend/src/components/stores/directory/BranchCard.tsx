'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Navigation, Phone } from 'lucide-react';
import { recordStoreInteraction } from '@/lib/api';
import { StoreBranchInfo } from '@/types/stores';

interface BranchCardProps {
  branch: StoreBranchInfo;
  locationLabel: string;
}

function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export default function BranchCard({ branch, locationLabel }: BranchCardProps) {
  const title = branch.store_name || branch.name;
  const phone = (branch.whatsapp || branch.phone || '').replace(/[^0-9]/g, '');
  const storeId = branch.store_id ?? branch.id;

  const handleWhatsApp = () => {
    recordStoreInteraction({
      store_id: storeId,
      branch_id: branch.id,
      interaction_type: 'WHATSAPP_CLICK',
      metadata: { city: locationLabel },
    });
    const msg = encodeURIComponent(
      `¡Hola! Los vi a través de All About Skin y deseo consultar disponibilidad en su sede de ${branch.name}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleRoute = () => {
    recordStoreInteraction({
      store_id: storeId,
      branch_id: branch.id,
      interaction_type: 'MAP_ROUTE',
      metadata: { city: locationLabel, address: branch.address },
    });
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`,
      '_blank'
    );
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-2xs hover:shadow-xs transition flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#2E7D5B] text-white font-black text-base flex items-center justify-center shrink-0">
            {title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-sm text-[#2D2825] leading-tight truncate">{title}</h3>
            <div className="text-[11px] text-[#8C827A] font-medium truncate">
              {branch.name !== title ? `${branch.name} · ` : ''}a {formatDistance(branch.distance_meters)}
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#66615C] line-clamp-2 leading-snug">
          {branch.address}
          {branch.city ? `, ${branch.city}` : ''}
        </p>
        {branch.opening_hours && (
          <p className="text-[11px] text-[#66615C] flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-[#8C827A] shrink-0" />
            <span className="truncate">{branch.opening_hours}</span>
          </p>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
        <div className={`grid gap-2 ${phone ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {phone && (
            <button
              type="button"
              onClick={handleWhatsApp}
              className="py-1.5 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleRoute}
            className="py-1.5 px-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-sky-600" />
            <span>Cómo llegar</span>
          </button>
        </div>

        <Link
          href={`/en-tienda/${branch.slug}`}
          className="w-full py-2 rounded-xl bg-[#FAFAF7] hover:bg-[#E6F4EC] hover:text-[#2E7D5B] border border-[#E8E1D7] text-xs font-bold text-[#2D2825] transition flex items-center justify-center gap-1"
        >
          <span>Ver productos</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
