import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Home,
  Users,
  Store,
  FlaskConical,
  Radio,
  Server,
  Package,
} from 'lucide-react';

export type AdminTabKey = 'inicio' | 'users' | 'stores' | 'ingredients' | 'scraper' | 'security' | 'settings' | 'products';

interface AdminSidebarProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

const navItems = [
  { id: 'inicio' as AdminTabKey, label: 'Inicio', icon: Home },
  { id: 'users' as AdminTabKey, label: 'Usuarios & RBAC', icon: Users },
  { id: 'stores' as AdminTabKey, label: 'Tiendas & Comercios', icon: Store },
  { id: 'ingredients' as AdminTabKey, label: 'Ingredientes & INCI', icon: FlaskConical },
  { id: 'products' as AdminTabKey, label: 'Catálogo & Ofertas', icon: Package },
  { id: 'scraper' as AdminTabKey, label: 'Scrapers & Crawler', icon: Radio },
  { id: 'security' as AdminTabKey, label: 'Seguridad & Logs', icon: ShieldCheck },
  { id: 'settings' as AdminTabKey, label: 'Infraestructura', icon: Server },
];

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen justify-between p-4 shrink-0 z-20">
      <div className="space-y-5">
        <Link href="/" className="flex items-center gap-2.5 px-2 group">
          <div className="w-8 h-8 rounded-md bg-[#4A6B5B] flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="font-bold text-base text-slate-900 tracking-tight">
            allabout<span className="text-[#4A6B5B]">.skin</span>
            <span className="ml-1.5 text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
              Admin
            </span>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-100 text-[#4A6B5B] font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#4A6B5B]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-left">
        <p className="text-xs font-semibold text-slate-800 leading-snug">
          Gobernanza DLG-EXEC
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Centro de Control Corporativo v2.0
        </p>
      </div>
    </aside>
  );
}
