'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Shield,
  Calendar,
  LogOut,
  Bell,
  Sparkles,
  HeartPulse,
  Package,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronRight,
  Sliders
} from 'lucide-react';
import UserAppShell from '@/components/navigation/UserAppShell';
import { getCurrentUser, logoutUser, StoredUser, fetchUserProfile } from '@/lib/api';

export default function PerfilUsuarioPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [paoAlertsEnabled, setPaoAlertsEnabled] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    fetchUserProfile()
      .then((res) => {
        if (res?.data) {
          setUserProfile(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setCurrentUser(null);
      router.push('/');
    }
  };

  const userName = currentUser?.name || 'Tu cuenta';
  const userEmail = currentUser?.email || 'maria.gonzalez@allabout.skin';
  const userRole = currentUser?.role === 'super_admin' ? 'Administrador'
    : currentUser?.role === 'business_owner' ? 'Comercio Afiliado'
    : 'Paciente / Usuario Premium';

  return (
    <UserAppShell activeNavId="perfil">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in">
        
        {/* HEADER */}
        <div className="border-b border-[#E8E1D7] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#D5E2DB]">
              <User className="w-3.5 h-3.5" />
              <span>Cuenta y Seguridad</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D2825] tracking-tight">
              Perfil de usuario
            </h1>
            <p className="text-xs sm:text-sm text-[#5D6B63] mt-0.5">
              Administra tus datos personales, preferencias de protocolo y seguridad de acceso.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>

        {/* TARJETA PRINCIPAL DEL USUARIO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E1D7] shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#E6F4EC] border-2 border-[#D5E2DB] text-[#2E7D5B] font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-2xs">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-[#2D2825] truncate">
                {userName}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-[#E6F4EC] text-[#2E7D5B] text-[11px] font-bold border border-[#D5E2DB]">
                {userRole}
              </span>
            </div>
            <p className="text-xs text-[#7E756F] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#8C827A]" />
              <span>{userEmail}</span>
            </p>
            <p className="text-[11px] text-[#2E7D5B] font-semibold flex items-center justify-center sm:justify-start gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Identidad dermatológica verificada</span>
            </p>
          </div>

          <Link
            href="/mi-piel"
            className="px-4 py-2.5 rounded-full bg-[#2E7D5B] hover:bg-[#1B3D32] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Ver mi piel</span>
          </Link>
        </div>

        {/* SECCIONES DE CONFIGURACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PREFERENCIAS DE PROTOCOLO */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4EC] text-[#2E7D5B] flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#2D2825]">
                Notificaciones y Avisos
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#2D2825] block">
                    Recordatorio de Skin Cycling
                  </span>
                  <span className="text-[10px] text-[#7E756F]">
                    Aviso a las 20:30 para la rutina de noche según fase
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#2E7D5B] rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFAF7] border border-[#E8E1D7] cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-[#2D2825] block">
                    Alertas de PAO y Vencimiento
                  </span>
                  <span className="text-[10px] text-[#7E756F]">
                    Notificar cuando a un frasco le queden menos de 15 días
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={paoAlertsEnabled}
                  onChange={(e) => setPaoAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#2E7D5B] rounded"
                />
              </label>
            </div>
          </div>

          {/* PRIVACIDAD Y SEGURIDAD */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E1D7] shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#2D2825]">
                Privacidad y Datos Clínicos
              </h3>
            </div>

            <p className="text-xs text-[#5D6B63] leading-relaxed pt-1">
              Tus fotos de escaneo facial y datos biológicos nunca se comparten con comercios ni farmacias. Los reportes externos son 100% anonimizados (Zero-PII).
            </p>

            <div className="pt-2 border-t border-[#E8E1D7] flex items-center justify-between text-xs text-[#2E7D5B] font-semibold">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Cifrado TLS 1.3 activo</span>
              </span>
              <Link href="/privacidad" className="hover:underline">
                Política médica →
              </Link>
            </div>
          </div>

        </div>

        {/* ZONA DE CIERRE DE SESIÓN */}
        <div className="bg-rose-50/60 rounded-3xl p-6 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              ¿Deseas cerrar tu sesión?
            </h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Se guardará el progreso de tu ciclo en el almacenamiento local seguro y en la nube.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión ahora'}</span>
          </button>
        </div>

      </div>
    </UserAppShell>
  );
}
