'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isUserAdmin, loginUser, logoutUser, StoredUser } from '@/lib/api';
import { ShieldAlert, ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Login form state inside guard
  const [email, setEmail] = useState('brian.baloa@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    if (!currentUser) {
      setIsAuthorized(false);
    } else if (isUserAdmin(currentUser)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await loginUser(email, password);
      setUser(loggedUser);

      if (isUserAdmin(loggedUser)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        setLoginError(`Tu cuenta (${loggedUser.email}) tiene rol "${loggedUser.role}" y no cuenta con privilegios de administrador.`);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setIsAuthorized(false);
    setPassword('');
  };

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center text-[#2D2825]">
        <div className="w-8 h-8 border-4 border-[#8FA89B] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#7E756F] text-sm font-medium">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  // Not authorized: show login or role mismatch
  if (!isAuthorized) {
    // Scenario 1: Logged in, but not an admin
    if (user && !isUserAdmin(user)) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-[#2D2825]">
          <div className="max-w-md w-full bg-white border border-[#E8E1D7] rounded-3xl p-8 text-center shadow-[0_8px_30px_rgba(45,40,37,0.08)] space-y-6">
            <div className="w-16 h-16 bg-[#FAF0ED] border border-[#D8A899]/50 text-[#9F1239] rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#2D2825] mb-1">Rol Insuficiente</h2>
              <p className="text-sm text-[#7E756F] leading-relaxed">
                Has iniciado sesión con <span className="text-[#4A6B5B] font-semibold">{user.email}</span> (Rol: <code className="text-[#B45309] bg-[#FAF5EE] px-1.5 py-0.5 rounded font-mono">{user.role}</code>), pero la consola central requiere privilegios de <span className="font-bold text-[#2D2825]">Administrador</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-[#4A6B5B] hover:bg-[#3D5A4C] text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión e Ingresar como Admin</span>
              </button>

              <Link
                href="/"
                className="w-full py-2.5 px-4 text-[#7E756F] hover:text-[#2D2825] text-xs font-semibold transition"
              >
                Regresar a la página principal
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Scenario 2: Unauthenticated - Show interactive Admin Login Form
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 text-[#2D2825]">
        <div className="max-w-md w-full bg-white border border-[#E8E1D7] rounded-3xl p-8 shadow-[0_8px_30px_rgba(45,40,37,0.08)] space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-[#EBF1EE] border border-[#D5E2DB] text-[#4A6B5B] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#2D2825]">
              Consola de Administración
            </h2>
            <p className="text-xs text-[#7E756F]">
              Ingresa con tus credenciales de Super Administrador para gestionar el sistema.
            </p>
          </div>

          {loginError && (
            <div className="p-4 bg-[#FAF0ED] border border-[#D8A899]/50 rounded-2xl text-xs font-medium text-[#9F1239] flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#9F1239] shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-[#7E756F] tracking-wider block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9D948B]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="brian.baloa@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D2825] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B]/30 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-[#7E756F] tracking-wider block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9D948B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu clave segura"
                  className="w-full bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#2D2825] focus:outline-none focus:border-[#8FA89B] focus:ring-1 focus:ring-[#8FA89B]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9D948B] hover:text-[#2D2825]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#4A6B5B] hover:bg-[#3D5A4C] text-white font-extrabold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Acceder al Panel de Control</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#E8E1D7]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#7E756F] hover:text-[#2D2825] transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la portada de Allabout.skin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
