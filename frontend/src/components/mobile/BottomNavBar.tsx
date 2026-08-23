'use client';

import React from 'react';
import { Home, Repeat, BookOpen, User, Scan } from 'lucide-react';
import { NavTab } from './types';

interface BottomNavBarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export default function BottomNavBar({ activeTab, onChangeTab }: BottomNavBarProps) {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Inicio',
      icon: Home,
    },
    {
      id: 'cycle' as NavTab,
      label: 'Mi Ciclo',
      icon: Repeat,
    },
    {
      id: 'scanner' as NavTab,
      label: 'Escanear',
      icon: Scan,
      isHighlight: true,
    },
    {
      id: 'library' as NavTab,
      label: 'Biblioteca',
      icon: BookOpen,
    },
    {
      id: 'profile' as NavTab,
      label: 'Mi Perfil',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#FAF8F5] border-t border-[#E8E1D7] px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.02)] safe-bottom">
      <div className="max-w-md mx-auto h-full grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isHighlight) {
            return (
              <button
                key={tab.id}
                onClick={() => onChangeTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 group cursor-pointer focus:outline-none"
                aria-label="Escáner AR de Ingredientes"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? 'bg-[#4A6B5B] text-white shadow-[0_6px_20px_rgba(74,107,91,0.35)] scale-105'
                      : 'bg-[#8FA89B] text-white shadow-[0_4px_16px_rgba(143,168,155,0.3)] group-hover:bg-[#7D978A]'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <span
                  className={`text-[10px] font-sans font-medium mt-1 tracking-tight ${
                    isActive ? 'text-[#4A6B5B] font-semibold' : 'text-[#7E756F]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full py-1 transition-colors duration-200 cursor-pointer focus:outline-none relative ${
                isActive ? 'text-[#4A6B5B]' : 'text-[#9D948B] hover:text-[#7E756F]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1.5 w-1 h-1 bg-[#4A6B5B] rounded-full" />
                )}
              </div>
              <span
                className={`text-[10.5px] font-sans mt-1 tracking-tight ${
                  isActive ? 'font-semibold text-[#4A6B5B]' : 'font-normal'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}