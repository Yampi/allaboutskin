'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldAlert, Globe } from 'lucide-react';

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1B3D32] text-[#B8C7BF] text-xs border-t border-[#264D40] mt-16 pb-16 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* Top Grid: Logo + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-10">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-3">
            <Link href="/" className="flex items-center gap-2 text-white group">
              <div className="w-8 h-8 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                allabout<span className="text-[#8FA89B]">.skin</span>
              </span>
            </Link>
            <p className="text-[11px] font-medium text-[#8EA096] uppercase tracking-wider">
              Ciencia • Tecnología • Tu piel
            </p>
            <p className="text-[#A4B5AC] text-xs leading-relaxed max-w-sm pt-1">
              Plataforma dermatológica de análisis científico, seguimiento de Skin Cycling y conexión directa con inventario real en farmacias y comercios aliados.
            </p>
          </div>

          {/* Col 1: Producto */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Producto</h4>
            <ul className="space-y-2 text-xs text-[#A4B5AC]">
              <li>
                <Link href="/#como-funciona" className="hover:text-white transition-colors">
                  Cómo funciona
                </Link>
              </li>
              <li>
                <Link href="/tiendas" className="hover:text-white transition-colors">
                  Tiendas & Farmacias
                </Link>
              </li>
              <li>
                <Link href="/escaner" className="hover:text-white transition-colors">
                  Escáner Dermatológico IA
                </Link>
              </li>
              <li>
                <Link href="/calendario" className="hover:text-white transition-colors">
                  Calendario Skin Cycling
                </Link>
              </li>
              <li>
                <Link href="/mi-piel" className="hover:text-white transition-colors">
                  Mi Piel (Datos Clínicos)
                </Link>
              </li>
              <li>
                <Link href="/mi-rutina" className="hover:text-white transition-colors">
                  Mi Rutina Explicativa
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Compañía */}
          <div className="md:col-span-2 space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Compañía</h4>
            <ul className="space-y-2 text-xs text-[#A4B5AC]">
              <li>
                <Link href="/aviso-medico" className="hover:text-white transition-colors">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/estado" className="hover:text-white transition-colors">
                  Estado de servicios
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Soporte & Portales */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Portales & Soporte</h4>
            <ul className="space-y-2 text-xs text-[#A4B5AC]">
              <li>
                <Link href="/dashboard/usuario" className="text-rose-200 hover:text-white font-medium transition-colors flex items-center gap-1.5">
                  <span>Portal Paciente («Mi Piel»)</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/empresa" className="text-sky-200 hover:text-white font-medium transition-colors flex items-center gap-1.5">
                  <span>Portal Comercios & Farmacias</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-purple-200 hover:text-white font-medium transition-colors flex items-center gap-1.5">
                  <span>Centro de Control Administrativo</span>
                </Link>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-3 text-[#A4B5AC]">
                  <a href="#" className="hover:text-white transition" aria-label="Instagram">
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a href="#" className="hover:text-white transition" aria-label="Facebook">
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a href="#" className="hover:text-white transition" aria-label="YouTube">
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#264D40] text-[11px] flex flex-col sm:flex-row justify-between items-center text-[#8EA096] gap-3">
          <p>© {new Date().getFullYear()} Allabout.skin. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-[#A4B5AC]">
              <Globe className="w-3.5 h-3.5" />
              <span>Español (VE)</span>
            </div>
            <span className="text-[#264D40]">|</span>
            <span className="font-semibold text-[#8FA89B]">DLG-HYBRID</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
