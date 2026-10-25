import React from 'react';
import { AdminTabKey } from './AdminSidebar';

interface AdminNavTabsProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
  counts?: {
    stores?: number;
    users?: number;
    products?: number;
  };
}

const tabs: { id: AdminTabKey; label: string }[] = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'users', label: 'Usuarios' },
  { id: 'stores', label: 'Comercios' },
  { id: 'ingredients', label: 'Ingredientes' },
  { id: 'products', label: 'Catálogo' },
  { id: 'scraper', label: 'Scrapers' },
  { id: 'security', label: 'Seguridad' },
  { id: 'settings', label: 'Infraestructura' },
];

export default function AdminNavTabs({ activeTab, onTabChange, counts }: AdminNavTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count =
          tab.id === 'stores' ? counts?.stores : tab.id === 'users' ? counts?.users : tab.id === 'products' ? counts?.products : undefined;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              isActive
                ? 'bg-[#4A6B5B] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
