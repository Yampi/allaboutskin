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
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2825] flex flex-col lg:flex-row antialiased font-sans selection:bg-[#8FA89B] selection:text-white">
      {/* MOBILE HEADER (visible on small screens) */}
      <div className="lg:hidden h-16 bg-white/95 backdrop-blur-md border-b border-[#E8E1D7] px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EBF1EE] border border-[#D5E2DB] flex items-center justify-center text-[#4A6B5B]">
            <Microscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#2D2825] text-base tracking-tight">
            Allabout<span className="text-[#4A6B5B]">.skin</span>
          </span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#EBF1EE] text-[#4A6B5B] border border-[#D5E2DB]">
            Console
          </span>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-[#7E756F] hover:text-[#2D2825] rounded-xl bg-[#FAF8F5] border border-[#E8E1D7] transition"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#2D2825]/40 backdrop-blur-xs lg:hidden animate-in fade-in"
        />
      )}

      {/* SYSTEM SIDEBAR (Fixed on desktop, drawer on mobile) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#F8F5F0] border-r border-[#E8E1D7] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
          {/* Brand header */}
          <div className="px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF1EE] border border-[#D5E2DB] flex items-center justify-center text-[#4A6B5B] shadow-xs shrink-0">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-[#2D2825] text-lg tracking-tight leading-none">
                  Allabout<span className="text-[#4A6B5B]">.skin</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#4A6B5B] animate-pulse" />
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#7E756F]">
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
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#9D948B]">
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
                            ? 'bg-[#EBF1EE] text-[#3D5A4C] border border-[#8FA89B]/40 shadow-xs'
                            : 'text-[#7E756F] hover:text-[#2D2825] hover:bg-[#F2ECE4] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition ${
                              isItemActive ? 'text-[#4A6B5B]' : 'text-[#9D948B] group-hover:text-[#4A6B5B]'
                            }`}
                          />
                          <span>{item.name}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                              item.badge === 'Supervisión'
                                ? 'bg-[#FAF5EE] text-[#B45309] border border-[#DFCAAC]'
                                : 'bg-[#FAF0ED] text-[#7C3AED] border border-[#D8A899]/50'
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
        <div className="p-4 border-t border-[#E8E1D7] bg-[#F2ECE4]/40 space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E8E1D7] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#EBF1EE] border border-[#D5E2DB] flex items-center justify-center text-[#4A6B5B] font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#2D2825] truncate">
                  {currentUser?.name || 'Brian Baloa'}
                </div>
                <div className="text-[10px] text-[#4A6B5B] uppercase font-extrabold truncate">
                  {currentUser?.role || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#9D948B] hover:text-[#E11D48] hover:bg-[#FAF0ED] rounded-lg transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F8F5F0] border border-[#E8E1D7] text-[#7E756F] hover:text-[#2D2825] text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Abrir Web Pública</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </aside>

      {/* MAIN SYSTEM BODY */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP SYSTEM APP BAR */}
        <header className="hidden lg:flex h-16 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E1D7] px-6 lg:px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7E756F]">
            <span>Sistema</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9D948B]" />
            <span className="text-[#2D2825] font-bold">
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
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1EE] border border-[#D5E2DB] text-[#4A6B5B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#4A6B5B] animate-pulse" />
              <span>API v1: En Línea</span>
            </div>

            {pathname === '/admin' ? (
              <Link
                href="/dashboard/empresa"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F5F0] border border-[#E8E1D7] text-[#2D2825] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-[#4A6B5B]" />
                <span>Ver Portal Empresa</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8F5F0] border border-[#E8E1D7] text-[#2D2825] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A6B5B]" />
                <span>Ver Consola Admin</span>
              </Link>
            )}
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:px-10 max-w-[1750px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
