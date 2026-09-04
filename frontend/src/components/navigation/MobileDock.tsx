'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scan, Calendar, BookOpen, GitCompare } from 'lucide-react';

export default function MobileDock() {
  const pathname = usePathname();

  // En la pantalla del escáner ocultamos el dock inferior para dar foco total a la cámara y al disparador
  if (pathname.startsWith('/escaner')) {
    return null;
  }

  const dockItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/calendario', label: 'Mi Ciclo', icon: Calendar },
    { href: '/escaner', label: 'Escáner', icon: Scan, isCenterCta: true },
    { href: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
    { href: '/comparador', label: 'Comparar', icon: GitCompare },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E8E1D7] px-2 py-1.5 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {dockItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenterCta) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5 group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-diffuse transition-all duration-200 ${
                    isActive
                      ? 'bg-[#4A6B5B] text-white scale-105 border-2 border-white'
                      : 'bg-[#8FA89B] text-white hover:bg-[#7D978A] border-2 border-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-[#4A6B5B] mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#4A6B5B] font-semibold'
                  : 'text-[#7E756F] hover:text-[#2D2825]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.7]'}`} />
              <span className="text-[10.5px] mt-0.5">{item.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#4A6B5B] mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
