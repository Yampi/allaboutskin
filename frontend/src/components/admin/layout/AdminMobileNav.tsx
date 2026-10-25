import React from 'react';
import { Home, Users, Store, Radio, ShieldCheck } from 'lucide-react';
import { AdminTabKey } from './AdminSidebar';

interface AdminMobileNavProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

const mobileItems = [
  { id: 'inicio' as AdminTabKey, label: 'Inicio', icon: Home },
  { id: 'stores' as AdminTabKey, label: 'Tiendas', icon: Store },
  { id: 'users' as AdminTabKey, label: 'Usuarios', icon: Users },
  { id: 'scraper' as AdminTabKey, label: 'Scrapers', icon: Radio },
  { id: 'security' as AdminTabKey, label: 'Seguridad', icon: ShieldCheck },
];

export default function AdminMobileNav({ activeTab, onTabChange }: AdminMobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1.5 flex items-center justify-around shadow-sm">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition text-[11px] ${
              isActive ? 'text-[#4A6B5B] font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
