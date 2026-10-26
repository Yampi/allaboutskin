'use client';

import React from 'react';
import Link from 'next/link';
import UserAppShell from '@/components/navigation/UserAppShell';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import SkinStatusCard from '@/components/dashboard/usuario/SkinStatusCard';
import TodayRoutineCard from '@/components/dashboard/usuario/TodayRoutineCard';
import SkinCyclingCard from '@/components/dashboard/usuario/SkinCyclingCard';
import ProductsCards from '@/components/dashboard/usuario/ProductsCards';
import NearbyStoresCard from '@/components/dashboard/usuario/NearbyStoresCard';

export default function UserSkinDashboardPage() {
  const { user, profile, routine, stats, scans, stores, nearby, reload, locateNearby, completeSlot } = useUserDashboard();
  const firstName = (user?.name || user?.email?.split('@')[0] || '').split(' ')[0];

  return (
    <UserAppShell activeNavId="inicio">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in">
        <div className="bg-gradient-to-r from-[#EAF4EE] via-[#F4F9F6] to-white rounded-3xl border border-[#D5E2DB] p-5 sm:p-7 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
            {firstName ? `Hola, ${firstName}` : 'Hola'}
          </h1>
          <p className="text-xs sm:text-sm text-[#66615C] max-w-lg leading-relaxed">
            Resumen de tu estado dermatológico y tu rutina de hoy.
          </p>
        </div>

        {user === undefined ? null : !user ? (
          <div role="alert" className="p-5 rounded-3xl bg-white border border-[#E8E1D7] text-sm text-[#66615C] space-y-2">
            <p>Inicia sesión para ver tu dashboard.</p>
            <Link href="/login" className="font-bold text-[#2E7D5B] hover:underline">Ir a iniciar sesión</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <SkinStatusCard profile={profile} scans={scans} onRetry={reload} />
              <TodayRoutineCard routine={routine} onRetry={reload} onCompleteSlot={completeSlot} />
              <SkinCyclingCard routine={routine} stats={stats} onRetry={reload} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <ProductsCards routine={routine} onRetry={reload} />
              <NearbyStoresCard stores={stores} nearby={nearby} onRetry={reload} onLocate={locateNearby} />
            </div>
          </>
        )}
      </div>
    </UserAppShell>
  );
}
