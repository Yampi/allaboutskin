'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUser, registerUser, StoredUser, isUserAdmin, isUserBusiness } from '@/lib/api';
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Store,
  CheckCircle,
  AlertCircle,
  Microscope,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const socialToken = searchParams.get('social_token');
  const socialUserRaw = searchParams.get('social_user');
  const isNew = searchParams.get('is_new');
  const urlError = searchParams.get('error');
  const modeParam = searchParams.get('mode');

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(modeParam === 'register' ? 'REGISTER' : 'LOGIN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
  const [isSocialProcessing, setIsSocialProcessing] = useState(false);

  // Procesar retorno automático de autenticación social (Laravel Socialite)
  React.useEffect(() => {
    if (socialToken) {
      setIsSocialProcessing(true);
      try {
        let parsedUser: any = null;
        if (socialUserRaw) {
          try {
            parsedUser = JSON.parse(decodeURIComponent(socialUserRaw));
          } catch {
            parsedUser = null;
          }
        }

        const storedUser: StoredUser = {
          id: parsedUser?.id || 1,
          name: parsedUser?.name || 'Usuario Allabout.skin',
          email: parsedUser?.email || '',
          role: parsedUser?.role || 'standard_user',
          is_active: true,
          token: socialToken,
        };

        // Guardar sesión
        if (typeof window !== 'undefined') {
          localStorage.setItem('allabout_user', JSON.stringify(storedUser));
        }

        // Redirigir según rol o estado de nuevo registro
        if (redirectPath) {
          router.push(redirectPath);
        } else if (isUserAdmin(storedUser)) {
          router.push('/admin');
        } else if (isUserBusiness(storedUser)) {
          router.push('/dashboard/empresa');
        } else if (isNew === '1') {
          router.push('/dashboard/usuario?welcome=1');
        } else {
          router.push('/dashboard/usuario');
        }
      } catch (err: any) {
        setError('Error al procesar el inicio de sesión social. Intenta nuevamente.');
        setIsSocialProcessing(false);
      }
    }
  }, [socialToken, socialUserRaw, isNew, redirectPath, router]);

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    window.location.href = `${apiUrl}/auth/google/redirect`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const user: StoredUser = await loginUser(email, password);

        // Determine where to redirect
        if (redirectPath) {
          router.push(redirectPath);
        } else if (isUserAdmin(user)) {
          router.push('/admin');
        } else if (isUserBusiness(user)) {
          router.push('/dashboard/empresa');
        } else {
          router.push('/dashboard/usuario');
        }
      } else {
        // REGISTRO DE USUARIO NUEVO
        if (!name.trim()) {
          throw new Error('Por favor introduce tu nombre o apodo.');
        }
        if (password.length < 8) {
          throw new Error('La contraseña debe tener al menos 8 caracteres.');
        }

        const user: StoredUser = await registerUser(name.trim(), email.trim(), password);
        router.push(redirectPath || '/dashboard/usuario?welcome=1');
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
            <Microscope className="w-5 h-5" />
          </div>
          <span className="text-2xl font-serif font-black tracking-tight text-white">
            Allabout<span className="text-teal-400">.skin</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {authMode === 'LOGIN' ? 'Iniciar Sesión' : 'Crear Cuenta de Usuario'}
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          {authMode === 'LOGIN'
            ? 'Accede a tu tocador digital, consulta tus análisis o administra tu consola.'
            : 'Audita productos, descubre ingredientes compatibles y crea tu rutina científica.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-6 sm:px-8 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
          {/* Selector de Modo: Iniciar Sesión vs Crear Cuenta */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                authMode === 'LOGIN'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                authMode === 'REGISTER'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Botón de Autenticación Social (Google) - Válido para entrar o registrarse */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSocialProcessing}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition shadow-md flex items-center justify-center gap-3 border border-slate-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSocialProcessing ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800" />
              <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                o con correo electrónico
              </span>
              <div className="flex-grow border-t border-slate-800" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'REGISTER' && (
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                  Nombre o Apodo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder={authMode === 'REGISTER' ? 'Mínimo 8 caracteres' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-sm rounded-xl transition shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : authMode === 'LOGIN' ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Entrar a mi Cuenta</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Crear mi Cuenta Gratis</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Info & Navigation links */}
          <div className="pt-4 border-t border-slate-800/80 text-center space-y-3">
            {authMode === 'LOGIN' ? (
              <p className="text-xs text-slate-400">
                ¿No tienes cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setError(null);
                  }}
                  className="text-teal-400 hover:underline font-bold"
                >
                  Regístrate como usuario gratis
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                ¿Ya tienes una cuenta registrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setError(null);
                  }}
                  className="text-teal-400 hover:underline font-bold"
                >
                  Inicia sesión aquí
                </button>
              </p>
            )}

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-center gap-2">
              <Store className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>
                ¿Eres farmacia o tienda?{' '}
                <Link href="/tiendas/registrar" className="text-teal-400 hover:underline font-bold">
                  Registra tu vitrina comercial
                </Link>
              </span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la portada principal</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
