'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { setCurrentUser, StoredUser } from '@/lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StoredUser) => void;
  initialMode?: 'REGISTER' | 'LOGIN';
  title?: string;
  subtitle?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'REGISTER',
  title = 'Guarda tu Calendario de Skin Cycling',
  subtitle = 'Crea tu cuenta gratuita para hacer seguimiento diario de tus noches, registrar tus productos y recibir alertas de incompatibilidad de ingredientes.',
}: AuthModalProps) {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulate / perform authentication
      await new Promise((r) => setTimeout(r, 600));

      const fakeUser: StoredUser = {
        name: mode === 'REGISTER' ? name || email.split('@')[0] : email.split('@')[0],
        email: email,
        token: 'sample_token_' + Math.random().toString(36).substring(7),
      };

      setCurrentUser(fakeUser);
      onSuccess(fakeUser);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1721]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#F0E8E0] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A69D94] hover:text-[#5A5A5A] hover:bg-[#F5EDE6] rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-[#4A8BA8] to-[#2D6680] p-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#C5E3F0] shadow-inner">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            {mode === 'REGISTER' ? title : 'Iniciar Sesión'}
          </h3>
          <p className="text-xs text-[#C5E3F0] mt-1 max-w-sm mx-auto leading-relaxed">
            {mode === 'REGISTER' ? subtitle : 'Ingresa a tu cuenta para consultar tu calendario de ciclado.'}
          </p>
        </div>

        {/* Benefits list for Register */}
        {mode === 'REGISTER' && (
          <div className="px-6 pt-4 pb-2 bg-[#E8F4FA]/50 border-b border-[#C5E3F0]/60">
            <div className="grid grid-cols-1 gap-1.5 text-xs text-[#5A5A5A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A8BA8] flex-shrink-0" />
                <span>Calendario interactivo día por día</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A8BA8] flex-shrink-0" />
                <span>Registro de tus productos por cada noche</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A8BA8] flex-shrink-0" />
                <span>Alertas científicas de conflictos químicos</span>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
                Tu Nombre
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A69D94] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D4E6]/20 focus:border-[#4A8BA8] transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A69D94] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D4E6]/20 focus:border-[#4A8BA8] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5A5A5A] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A69D94] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F4] border border-[#E8E0D8] rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A8D4E6]/20 focus:border-[#4A8BA8] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-[#4A8BA8] hover:bg-[#3A7A96] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#4A8BA8]/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'REGISTER' ? 'Guardar y Ver Mi Calendario' : 'Acceder'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Toggle between Register and Login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode(mode === 'REGISTER' ? 'LOGIN' : 'REGISTER');
              }}
              className="text-xs text-[#8B8178] hover:text-[#3A7A96] font-semibold"
            >
              {mode === 'REGISTER'
                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta aún? Regístrate gratis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
