import React, { Suspense } from 'react';
import AdminGuard from '@/components/AdminGuard';

export const metadata = {
  title: 'Centro de Control — Super Admin | Allabout.skin',
  description: 'Visión global, control total, seguridad, estabilidad e infraestructura de la plataforma.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F5F3FF] flex flex-col items-center justify-center text-purple-900">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Cargando Centro de Control...</p>
          </div>
        }
      >
        {children}
      </Suspense>
    </AdminGuard>
  );
}
