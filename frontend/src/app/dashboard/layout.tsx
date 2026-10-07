import React, { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard | Allabout.skin',
  description: 'Consola integral personalizada para usuarios, comercios y administradores.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF5F7] flex items-center justify-center text-slate-800">
          <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
