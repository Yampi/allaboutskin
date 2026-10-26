'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Store, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCurrentUser, loginUser, StoredUser } from '@/lib/api';

const rolePortals = [
  { href: '/dashboard/usuario', label: '1. Usuario', icon: Users, color: 'text-sky-400', activeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { href: '/dashboard/empresa', label: '2. Comercio', icon: Store, color: 'text-amber-400', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { href: '/admin', label: '3. SuperAdmin', icon: ShieldCheck, color: 'text-rose-400', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

const devAccounts = [
  { label: '👤 Paciente', email: 'paciente@allaboutskin.com', path: '/dashboard/usuario' },
  { label: '🏪 Tienda', email: 'tienda@allaboutskin.com', path: '/dashboard/empresa' },
  { label: '🛡️ Admin', email: 'admin@allaboutskin.com', path: '/admin' },
];

// Herramienta solo de desarrollo: en producción no se renderiza ni se incluye la contraseña de prueba.
export default function RolePortalBar() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <RolePortalBarDev />;
}

function RolePortalBarDev() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<StoredUser | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, [pathname]);

  const handleQuickLogin = async (acc: typeof devAccounts[0]) => {
    const devPassword = process.env.NEXT_PUBLIC_DEV_LOGIN_PASSWORD;
    if (!devPassword) {
      setFeedbackMsg({ type: 'error', text: 'Falta NEXT_PUBLIC_DEV_LOGIN_PASSWORD en frontend/.env.local' });
      return;
    }
    setIsLoggingIn(true);
    setFeedbackMsg(null);
    try {
      const user = await loginUser(acc.email, devPassword);
      setCurrentUserState(user);
      setFeedbackMsg({ type: 'ok', text: `Sesión activa: ${user.name}` });
      router.push(acc.path);
      router.refresh();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo iniciar sesión' });
    } finally {
      setTimeout(() => setFeedbackMsg(null), 6000);
      setIsLoggingIn(false);
    }
  };

  const isUserSection = pathname.startsWith('/dashboard/usuario') || pathname.startsWith('/escaner') || pathname.startsWith('/mi-rutina');
  const isBusinessSection = pathname.startsWith('/dashboard/empresa');
  const isAdminSection = pathname.startsWith('/admin');

  return (
    <aside aria-label="Navegación de Roles y Desarrollo" className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs select-none sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DLG-EXEC DEV BAR
          </span>
          <span className="hidden md:inline-block text-slate-400 text-[11px]">Portal:</span>
          {isAdminSection && <span className="font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">🛡️ SuperAdmin</span>}
          {isBusinessSection && <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">🏪 Comercios</span>}
          {isUserSection && <span className="font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">👤 Usuario</span>}
          {!isAdminSection && !isBusinessSection && !isUserSection && <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Público</span>}
        </div>

        {feedbackMsg && (
          <div
            role={feedbackMsg.type === 'error' ? 'alert' : 'status'}
            className={`flex items-center gap-1.5 font-medium ${feedbackMsg.type === 'error' ? 'text-rose-400' : 'hidden lg:flex text-emerald-400'}`}
          >
            {feedbackMsg.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {!isCollapsed && (
          <div className="flex items-center gap-1.5">
            {rolePortals.map((p) => {
              const Icon = p.icon;
              const isActive = (p.href === '/admin' && isAdminSection) || (p.href === '/dashboard/empresa' && isBusinessSection) || (p.href === '/dashboard/usuario' && isUserSection);
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded transition text-[11px] font-medium border ${
                    isActive ? `${p.activeBg} shadow-xs` : 'border-transparent hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className={`w-3 h-3 ${p.color}`} />
                  <span>{p.label}</span>
                </Link>
              );
            })}

            <span className="hidden sm:inline-block w-px h-3.5 bg-slate-700 mx-1" />

            <div className="hidden sm:flex items-center gap-1">
              <span className="text-[10px] text-slate-400 mr-0.5">Simular:</span>
              {devAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => handleQuickLogin(acc)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition cursor-pointer"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title={isCollapsed ? 'Expandir' : 'Minimizar'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}
