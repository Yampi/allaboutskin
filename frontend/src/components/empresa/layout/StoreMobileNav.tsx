'use client';

import React from 'react';
import { Home, TrendingUp, Package, Building2, User } from 'lucide-react';
import { StoreTabKey } from './StoreSidebar';

interface StoreMobileNavProps {
  activeTab: StoreTabKey;
  onTabChange: (tab: StoreTabKey) => void;
}

const mobileItems = [
  { id: 'inicio' as StoreTabKey, label: 'Inicio', icon: Home },
  { id: 'analytics' as StoreTabKey, label: 'Analítica', icon: TrendingUp },
  { id: 'catalog' as StoreTabKey, label: 'Catálogo', icon: Package },
  { id: 'branches' as StoreTabKey, label: 'Sedes', icon: Building2 },
  { id: 'profile' as StoreTabKey, label: 'Perfil', icon: User },
];

export default function StoreMobileNav({ activeTab, onTabChange }: StoreMobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-3 py-2">
      <nav className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-0.5 cursor-pointer transition ${
                isActive ? 'text-[#4A6B5B] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
