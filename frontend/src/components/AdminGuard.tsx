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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  // Not authorized: show login or role mismatch
  if (!isAuthorized) {
    // Scenario 1: Logged in, but not an admin
    if (user && !isUserAdmin(user)) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight mb-1">Rol Insuficiente</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Has iniciado sesión con <span className="text-teal-400 font-semibold">{user.email}</span> (Rol: <code className="text-amber-400">{user.role}</code>), pero la consola central requiere privilegios de <span className="font-bold text-white">Administrador</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 border border-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión e Ingresar como Admin</span>
              </button>

              <Link
                href="/"
                className="w-full py-2.5 px-4 text-slate-400 hover:text-white text-xs font-semibold transition"
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Consola de Administración
            </h2>
            <p className="text-xs text-slate-400">
              Ingresa con tus credenciales de Super Administrador para gestionar el sistema.
            </p>
          </div>

          {loginError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-medium text-rose-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="brian.baloa@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu clave segura"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm rounded-xl transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
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

          <div className="pt-2 text-center border-t border-slate-800/80">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
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
