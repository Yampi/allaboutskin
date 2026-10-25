'use client';

import React from 'react';
import { Home, TrendingUp, Package, Building2, User } from 'lucide-react';
import { StoreTabKey } from './StoreSidebar';

interface StoreNavTabsProps {
  activeTab: StoreTabKey;
  onTabChange: (tab: StoreTabKey) => void;
}

const tabItems = [
  { id: 'inicio' as StoreTabKey, label: 'Inicio', icon: Home },
  { id: 'analytics' as StoreTabKey, label: 'Analítica & Demanda', icon: TrendingUp },
  { id: 'catalog' as StoreTabKey, label: 'Catálogo & Ofertas', icon: Package },
  { id: 'branches' as StoreTabKey, label: 'Sucursales', icon: Building2 },
  { id: 'profile' as StoreTabKey, label: 'Perfil Comercial', icon: User },
];

export default function StoreNavTabs({ activeTab, onTabChange }: StoreNavTabsProps) {
  return (
    <div className="flex lg:hidden overflow-x-auto pb-2 scrollbar-none gap-2 border-b border-slate-200">
      {tabItems.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              isActive
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
