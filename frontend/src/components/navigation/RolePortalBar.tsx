'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Store, ShieldCheck, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, setCurrentUser, loginUser, StoredUser } from '@/lib/api';

const rolePortals = [
  { href: '/dashboard/usuario', label: '1. Usuario', icon: Users, color: 'text-sky-400', activeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { href: '/dashboard/empresa', label: '2. Comercio', icon: Store, color: 'text-amber-400', activeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { href: '/admin', label: '3. SuperAdmin', icon: ShieldCheck, color: 'text-rose-400', activeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
];

const mockAccounts = [
  { label: '👤 Paciente', email: 'paciente@allaboutskin.com', path: '/dashboard/usuario', role: 'standard_user', name: 'Paciente de Prueba' },
  { label: '🏪 Tienda', email: 'tienda@allaboutskin.com', path: '/dashboard/empresa', role: 'business_owner', name: 'Comercio Farmacia' },
  { label: '🛡️ Admin', email: 'admin@allaboutskin.com', path: '/admin', role: 'super_admin', name: 'Super Administrador' },
];

export default function RolePortalBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUserState] = useState<StoredUser | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, [pathname]);

  const handleQuickLogin = async (acc: typeof mockAccounts[0]) => {
    setIsLoggingIn(true);
    setFeedbackMsg(null);
    try {
      const user = await loginUser(acc.email, 'Password123!');
      setCurrentUserState(user);
      setFeedbackMsg(`Sesión activa: ${user.name}`);
    } catch {
      const mock: StoredUser = { id: 999, name: acc.name, email: acc.email, role: acc.role as any, token: 'dev-token' };
      setCurrentUser(mock);
      setCurrentUserState(mock);
      setFeedbackMsg(`Modo Simulado: ${acc.name}`);
    } finally {
      setTimeout(() => setFeedbackMsg(null), 3000);
      setIsLoggingIn(false);
      router.push(acc.path);
      router.refresh();
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
          <div className="hidden lg:flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{feedbackMsg}</span>
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
              {mockAccounts.map((acc) => (
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
