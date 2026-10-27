'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertCircle, Store } from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import BranchCard from '@/components/stores/directory/BranchCard';
import LocationBar from '@/components/stores/directory/LocationBar';
import { useNearbyBranches, SEARCH_RADIUS_METERS } from '@/hooks/useNearbyBranches';

const StoreInteractiveMap = dynamic(() => import('@/components/stores/StoreInteractiveMap'), {
  ssr: false,
  loading: () => <MapPlaceholder text="Cargando mapa…" />,
});

function MapPlaceholder({ text }: { text: string }) {
  return (
    <div className="w-full h-full rounded-3xl bg-[#FAFAF7] border border-[#E8E1D7] animate-pulse flex items-center justify-center text-xs text-[#8C827A]">
      {text}
    </div>
  );
}

export default function TiendasDirectorioPage() {
  const { location, status, branches, isLoading, error, retry, requestGps, selectCity } = useNearbyBranches();
  const radiusKm = SEARCH_RADIUS_METERS / 1000;

  return (
    <UserAppShell activeNavId="tiendas">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in">
        <header className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">Tiendas cercanas</h1>
          <p className="text-xs sm:text-sm text-[#66615C] leading-relaxed max-w-xl">
            Farmacias y tiendas aliadas a menos de {radiusKm} km de ti. Entra en cada una para ver qué productos tiene.
          </p>
          <LocationBar location={location} status={status} onRequestGps={requestGps} onSelectCity={selectCity} />
        </header>

        <section className="h-80 sm:h-[420px] w-full rounded-3xl overflow-hidden border border-[#E8E1D7]">
          {status === 'asking' ? (
            <MapPlaceholder text="Esperando tu ubicación…" />
          ) : (
            <StoreInteractiveMap
              userCoords={{ lat: location.lat, lng: location.lng }}
              branches={branches}
              radiusMeters={SEARCH_RADIUS_METERS}
              isGpsActive={status === 'gps'}
            />
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-[#2D2825] tracking-tight">
            {isLoading ? 'Buscando tiendas…' : `${branches.length} tiendas en ${location.shortName}`}
          </h2>

          {error && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={retry} className="px-3 py-1 rounded-full bg-white border border-rose-200 font-bold cursor-pointer">
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !error && branches.length === 0 && (
            <div className="p-6 rounded-3xl bg-white border border-[#E8E1D7] text-center space-y-2">
              <Store className="w-6 h-6 text-[#8C827A] mx-auto" />
              <p className="text-sm font-bold text-[#2D2825]">Aún no tenemos tiendas registradas en esta zona</p>
              <p className="text-xs text-[#66615C]">
                ¿Conoces una farmacia o tienda de cosméticos aquí?{' '}
                <Link href="/tiendas/registrar" className="font-bold text-[#2E7D5B] hover:underline">
                  Sugiérela
                </Link>
              </p>
            </div>
          )}

          {isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-52 rounded-3xl bg-white border border-[#E8E1D7] animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && branches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} locationLabel={location.shortName} />
              ))}
            </div>
          )}
        </section>
      </div>
    </UserAppShell>
  );
}
