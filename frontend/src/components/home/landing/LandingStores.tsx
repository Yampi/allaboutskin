'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, ShoppingBag } from 'lucide-react';
import { fetchPublicStores } from '@/lib/api';
import ErrorState from '@/components/system/ErrorState';

interface LandingStore {
  id: number;
  name: string;
  slug: string;
  country_flag?: string;
  country_name?: string;
  branches_count?: number;
  in_stock_offers_count?: number;
}

export default function LandingStores() {
  const [stores, setStores] = useState<LandingStore[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    fetchPublicStores()
      .then((res) => setStores(res.stores.slice(0, 4)))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error al obtener tiendas'));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <section className="bg-[#E6F4EC]/40 border-y border-[#D5E2DB] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D5E2DB] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Productos y tiendas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D2825] tracking-tight leading-tight">
            Lo que necesitas, <br />
            <span className="text-[#2E7D5B]">cerca de ti</span>
          </h2>
          <p className="text-sm sm:text-base text-[#5D6B63] leading-relaxed">
            Encuentra tus productos en farmacias y tiendas registradas en la plataforma.
          </p>
          <Link
            href="/tiendas"
            className="px-6 py-3.5 rounded-full bg-[#2E7D5B] hover:bg-[#246448] text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2 group"
          >
            <span>Explorar tiendas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#E8E1D7] shadow-lg space-y-3">
          <span className="text-xs font-bold text-[#2D2825] block">Tiendas registradas</span>
          {error && <ErrorState message={error} onRetry={load} />}
          {!error && stores === null && <p className="text-xs text-[#7E756F]">Cargando tiendas...</p>}
          {stores?.length === 0 && (
            <p className="text-xs text-[#7E756F]">Aún no hay tiendas registradas.</p>
          )}
          {stores?.map((store) => (
            <Link
              key={store.id}
              href="/tiendas"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#E8E1D7] transition group"
            >
              <div>
                <span className="text-sm font-bold text-[#2D2825] block group-hover:text-[#2E7D5B] transition">
                  {store.name}
                </span>
                <span className="text-[11px] text-[#7E756F]">
                  {store.country_flag} {store.country_name} · {store.branches_count ?? 0} sucursal(es)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#7E756F] group-hover:translate-x-0.5 transition" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
