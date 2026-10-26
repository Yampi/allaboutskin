import React from 'react';
import Link from 'next/link';
import { Store, MapPin } from 'lucide-react';
import type { NearbyBranch, PublicStore } from '@/lib/userDashboardApi';
import type { Section } from '@/hooks/useUserDashboard';
import DashboardCard, { EmptyNote } from './DashboardCard';

interface NearbyStoresCardProps {
  stores: Section<PublicStore[]>;
  nearby: Section<NearbyBranch[]> | null;
  onRetry: () => void;
  onLocate: () => void;
}

const formatDistance = (meters: number) => (meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`);

function Row({ initial, name, detail }: { initial: string; name: string; detail: string }) {
  return (
    <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#FAFAF7] border border-[#E8E1D7]">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-[#2E7D5B] text-white font-black text-[10px] flex items-center justify-center shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[#2D2825] leading-tight truncate">{name}</div>
          <div className="text-[10px] text-[#66615C]">{detail}</div>
        </div>
      </div>
      <Link href="/tiendas" className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E1D7] text-[10px] font-bold shrink-0">
        Ver tiendas
      </Link>
    </div>
  );
}

export default function NearbyStoresCard({ stores, nearby, onRetry, onLocate }: NearbyStoresCardProps) {
  const nearbyReady = nearby?.status === 'ready' ? nearby.data ?? [] : null;
  const section = nearby && nearby.status !== 'ready' ? nearby : stores;

  return (
    <DashboardCard
      title="Dónde comprar cerca de ti"
      icon={<Store className="w-4 h-4 text-[#8C827A]" />}
      section={section}
      onRetry={nearby?.status === 'error' ? onLocate : onRetry}
      link={{ href: '/tiendas', label: 'Ver todas las tiendas' }}
    >
      <div className="space-y-2">
        {nearbyReady
          ? nearbyReady.length === 0
            ? <EmptyNote text="No hay sedes registradas en un radio de 15 km de tu ubicación." />
            : nearbyReady.slice(0, 3).map((b) => (
                <Row key={b.id} initial={b.store_name.charAt(0)} name={b.store_name} detail={`${formatDistance(b.distance_meters)}${b.city ? ` · ${b.city}` : ''}`} />
              ))
          : stores.data && (stores.data.length === 0
              ? <EmptyNote text="Aún no hay tiendas registradas." />
              : stores.data.slice(0, 3).map((s) => (
                  <Row
                    key={s.id}
                    initial={s.name.charAt(0)}
                    name={s.name}
                    detail={`${s.in_stock_offers_count} de ${s.total_offers_count} productos en stock · ${s.branches_count} sede(s)`}
                  />
                )))}
      </div>
      {!nearbyReady && nearby?.status !== 'loading' && (
        <button type="button" onClick={onLocate} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D5B] cursor-pointer">
          <MapPin className="w-3.5 h-3.5" /> Usar mi ubicación para ver distancias
        </button>
      )}
    </DashboardCard>
  );
}
