'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isUserAdmin, StoredUser } from '@/lib/api';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      setIsAuthorized(false);
    } else if (isUserAdmin(currentUser)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight mb-2">Acceso Restringido</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Esta sección está reservada exclusivamente para administradores del sistema. No cuentas con los privilegios requeridos.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar al Inicio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
