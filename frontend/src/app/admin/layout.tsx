import React, { Suspense } from 'react';
import AdminGuard from '@/components/AdminGuard';
import SystemLayout from '@/components/system/SystemLayout';

export const metadata = {
  title: 'Consola de Administración & Seguridad | Allabout.skin',
  description: 'Gestión de roles de usuario, permisos, configuraciones del sistema, comercios y monitoreo de seguridad.',
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
          <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SystemLayout>
          {children}
        </SystemLayout>
      </Suspense>
    </AdminGuard>
  );
}
