"use client";

import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // Inicializamos el cliente de Supabase asumiendo que el usuario configuró .env.local
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Credenciales inválidas o servidor no configurado.');
      } else {
        // Redirigir al dashboard
        window.location.href = '/';
      }
    } catch (err) {
      setErrorMsg('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5f7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Cabecera Corporativa Gov */}
        <div className="bg-[#292f4c] px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-monday-blue/20 rounded-full -ml-8 -mb-8 blur-lg"></div>
          
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">COP</h1>
          <p className="text-white/60 text-sm mt-2 font-medium">Control de Operaciones Públicas</p>
        </div>

        {/* Formulario */}
        <div className="px-8 py-8">
          <h2 className="text-lg font-bold text-slate-800 mb-6 text-center">Inicia sesión en tu cuenta</h2>
          
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-monday-blue">Correo Institucional</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:border-monday-blue focus:ring-1 focus:ring-monday-blue focus:bg-white transition-all font-medium"
                  placeholder="usuario@institucion.gob.ve"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-monday-blue">Contraseña de Acceso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:border-monday-blue focus:ring-1 focus:ring-monday-blue focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-monday-blue text-white font-bold rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md shadow-monday-blue/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Verificando...</>
              ) : (
                <>Ingresar al Sistema <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-semibold text-gray-400">
            Acceso restringido para personal autorizado de Mantenimiento y Contrataciones Públicas.
          </p>
        </div>
      </div>
    </div>
  );
}
