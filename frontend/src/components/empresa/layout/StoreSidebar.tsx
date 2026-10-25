import React from 'react';
import Link from 'next/link';
import { Store, Home, TrendingUp, Package, Building2, User } from 'lucide-react';

export type StoreTabKey = 'inicio' | 'analytics' | 'catalog' | 'branches' | 'profile';

interface StoreSidebarProps {
  activeTab: StoreTabKey;
  onTabChange: (tab: StoreTabKey) => void;
  storeName?: string;
  storeSlug?: string;
}

const navItems = [
  { id: 'inicio' as StoreTabKey, label: 'Inicio', icon: Home },
  { id: 'analytics' as StoreTabKey, label: 'Analítica & Demanda', icon: TrendingUp },
  { id: 'catalog' as StoreTabKey, label: 'Catálogo & Ofertas', icon: Package },
  { id: 'branches' as StoreTabKey, label: 'Sucursales (Sedes)', icon: Building2 },
  { id: 'profile' as StoreTabKey, label: 'Perfil Comercial', icon: User },
];

export default function StoreSidebar({
  activeTab,
  onTabChange,
  storeName,
  storeSlug,
}: StoreSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen justify-between p-4 shrink-0 z-20">
      <div className="space-y-5">
        <Link href="/" className="flex items-center gap-2.5 px-2 group">
          <div className="w-8 h-8 rounded-md bg-[#4A6B5B] flex items-center justify-center text-white shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div className="font-bold text-base text-slate-900 tracking-tight">
            allabout<span className="text-[#4A6B5B]">.skin</span>
            <span className="ml-1.5 text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
              Comercios
            </span>
          </div>
        </Link>

        {storeName && (
          <div className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-xs font-bold text-slate-900 truncate">{storeName}</p>
            {storeSlug && (
              <p className="text-[10px] text-slate-500 truncate">vitrina: /en-tienda/{storeSlug}</p>
            )}
          </div>
        )}

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
          Portal de Comercios & Farmacias v2.0
        </p>
      </div>
    </aside>
  );
}
