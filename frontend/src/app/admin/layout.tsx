import React from 'react';
import AdminGuard from '@/components/AdminGuard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Panel de Administración & Seguridad | All About Skin',
  description: 'Gestión de roles de usuario, permisos, configuraciones del sistema y monitoreo de seguridad.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </div>
    </AdminGuard>
  );
}
