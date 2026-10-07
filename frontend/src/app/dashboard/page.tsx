'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isUserAdmin, isUserBusiness } from '@/lib/api';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (isUserAdmin(user)) {
      router.replace('/admin');
    } else if (isUserBusiness(user)) {
      router.replace('/dashboard/empresa');
    } else {
      router.replace('/dashboard/usuario');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FFF9FA] flex flex-col items-center justify-center text-slate-700">
      <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-xs font-semibold text-slate-500">Cargando tu tocador digital...</p>
    </div>
  );
}
