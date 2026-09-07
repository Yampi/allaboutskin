'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Microscope,
  Store,
  Users,
  ShieldCheck,
  Settings,
  TrendingUp,
  Package,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  UserCheck,
  Building2,
} from 'lucide-react';
import { getCurrentUser, logoutUser, StoredUser, isUserAdmin } from '@/lib/api';

interface SystemLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function SystemLayout({
  children,
  activeSection,
  onSectionChange,
}: SystemLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams ? searchParams.get('tab') : null;

  const effectiveSection = activeSection || urlTab || (pathname === '/admin' ? 'stores' : 'analytics');

  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  const isAdmin = isUserAdmin(currentUser);

  const navigationItems = [
    {
      group: 'Plataforma & Supervisión',
      items: [
        {
          id: 'stores',
          name: 'Tiendas & Comercios',
          href: '/admin?tab=stores',
          icon: Store,
          badge: 'Supervisión',
          active: pathname === '/admin' && effectiveSection === 'stores',
        },
        {
          id: 'users',
          name: 'Usuarios & RBAC',
          href: '/admin?tab=users',
          icon: Users,
          active: pathname === '/admin' && effectiveSection === 'users',
        },
        {
          id: 'merchant_portal',
          name: 'Portal Comercial (Vitrinas)',
          href: '/dashboard/empresa',
          icon: Building2,
          badge: 'B2B',
          active: pathname === '/dashboard/empresa' && (!urlTab || urlTab === 'branches' || urlTab === 'profile'),
        },
      ],
    },
    {
      group: 'Inventario & Ciencia',
      items: [
        {
          id: 'catalog',
          name: 'Catálogo & Precios USD/Bs',
          href: '/dashboard/empresa?tab=catalog',
          icon: Package,
          active: pathname.startsWith('/dashboard') && effectiveSection === 'catalog',
        },
        {
          id: 'analytics',
          name: 'Métricas de Leads & WhatsApp',
          href: '/dashboard/empresa?tab=analytics',
          icon: TrendingUp,
          active: pathname.startsWith('/dashboard') && effectiveSection === 'analytics' && urlTab === 'analytics',
        },
      ],
    },
    {
      group: 'Seguridad & Infraestructura',
      items: [
        {
          id: 'security',
          name: 'Auditoría & Logs Anti-Ataque',
          href: '/admin?tab=security',
          icon: ShieldCheck,
          active: pathname === '/admin' && effectiveSection === 'security',
        },
        {
          id: 'settings',
          name: 'Configuración & Salud API',
          href: '/admin?tab=settings',
          icon: Settings,
          active: pathname === '/admin' && effectiveSection === 'settings',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col lg:flex-row antialiased font-sans selection:bg-teal-500 selection:text-white">
      {/* MOBILE HEADER (visible on small screens) */}
      <div className="lg:hidden h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Microscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">
            Allabout<span className="text-teal-400">.skin</span>
          </span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
            Console
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* SYSTEM SIDEBAR (Fixed on desktop, drawer on mobile) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0B101B] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {/* Brand header */}
          <div className="px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner shrink-0">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-white text-lg tracking-tight leading-none">
                  Allabout<span className="text-teal-400">.skin</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                    System Core v1.2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {navigationItems.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {group.group}
                </div>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = item.active;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setIsSidebarOpen(false);
                          if (onSectionChange && pathname === '/admin' && (item.id === 'stores' || item.id === 'users' || item.id === 'security' || item.id === 'settings')) {
                            onSectionChange(item.id);
                          } else {
                            router.push(item.href);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left group ${
                          isItemActive
                            ? 'bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition ${
                              isItemActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              item.badge === 'Supervisión'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Card & Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.name || 'Brian Baloa'}
                </div>
                <div className="text-[10px] text-teal-400 uppercase font-extrabold truncate">
                  {currentUser?.role || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>Abrir Web Pública</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* MAIN SYSTEM BODY */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP SYSTEM APP BAR */}
        <header className="hidden lg:flex h-16 bg-[#0B101B]/80 backdrop-blur-md border-b border-slate-800/80 px-6 lg:px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Sistema</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-bold">
              {pathname === '/admin'
                ? effectiveSection === 'stores'
                  ? 'Supervisión de Tiendas & Comercios'
                  : effectiveSection === 'users'
                  ? 'Gestión de Usuarios & RBAC'
                  : effectiveSection === 'security'
                  ? 'Auditoría & Logs de Seguridad'
                  : 'Configuraciones del Sistema'
                : effectiveSection === 'catalog'
                ? 'Catálogo & Precios USD/Bs'
                : effectiveSection === 'analytics'
                ? 'Métricas de Leads & Conversión'
                : effectiveSection === 'branches'
                ? 'Sucursales Físicas'
                : 'Portal Comercial & Vitrinas'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>API v1: En Línea</span>
            </div>

            {pathname === '/admin' ? (
              <Link
                href="/dashboard/empresa"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Ver Portal Empresa</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Ver Consola Admin</span>
              </Link>
            )}
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
