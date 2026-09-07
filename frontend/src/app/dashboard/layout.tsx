import React, { Suspense } from 'react';
import SystemLayout from '@/components/system/SystemLayout';

export const metadata = {
  title: 'Portal de Comercios & Vitrinas | Allabout.skin',
  description: 'Gestión de catálogo, sucursales físicas, precios en USD/VES y analíticas de leads.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SystemLayout>
        {children}
      </SystemLayout>
    </Suspense>
  );
}
