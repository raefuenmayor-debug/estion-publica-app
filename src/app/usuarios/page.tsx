"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MoreVertical, X, Loader2, Shield, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const ROLES_DISPONIBLES = [
  "Administrador",
  "Jefe de Contrataciones",
  "Jefe de Bienes",
  "Analista de Contrataciones",
  "Analista de Bienes"
];

type Profile = {
  id: string;
  first_name: string;
  last_name: string; // lo usamos para iniciales temporalmente en este diseño
  email: string;
  role: string;
}

export default function UsuariosPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal para Crear Empleado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Analista de Contrataciones", password: "", initials: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Modal para Cambiar Clave (El propio usuario)
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwdUpdating, setPwdUpdating] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Verificar sesión (Para la UI base)
    const { data: { session } } = await supabase.auth.getSession();
    
    try {
      // Llamar a nuestra API absoluta que salta cualquier RLS bloqueado
      const res = await fetch('/api/users');
      const json = await res.json();
      
      if (json.error) {
        alert("Error de API: " + json.error);
      } else {
        setProfiles(json.profiles || []);
        
        // Revisar nosotros mismos si somos admin en base a esa lista ya bajada limpia
        if (session) {
           const me = json.profiles?.find((p: any) => p.id === session.user.id);
           if (me && me.role === 'Administrador') setIsAdmin(true);
        }
      }
    } catch (err: any) {
      alert("Error de conexión interno: " + err.message);
    }
    
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    try {
      const res = await fetch('/api/auth/admin-create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          nombre: newUser.name,
          rol: newUser.role,
          iniciales: newUser.initials
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falla al crear el usuario. Verifica las env vars.");
      }

      // Éxito
      alert(`¡Éxito! ${newUser.name} ha sido creado. Puede iniciar sesión con su contraseña.`);
      setIsModalOpen(false);
      setNewUser({ name: "", email: "", role: "Analista de Contrataciones", password: "", initials: "" });
      fetchData(); // recargar lista
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdUpdating(true);
    setPwdMsg("");

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setPwdMsg("Error: " + error.message);
    } else {
      setPwdMsg("Contraseña actualizada exitosamente.");
      setTimeout(() => {
        setIsPwdModalOpen(false);
      }, 2000);
    }
    setPwdUpdating(false);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Users size={28} className="text-monday-blue" />
          Directorio de Usuarios
        </h1>
        
        <div className="flex gap-3">
          <button 
            onClick={() => { setIsPwdModalOpen(true); setPwdMsg(""); setNewPassword(""); }}
            className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200"
          >
            <Lock size={16} />
            Cambiar Mi Contraseña
          </button>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-transparent"
            >
              <UserPlus size={16} strokeWidth={3} />
              Invitar Empleado
            </button>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-200 overflow-hidden flex-1 flex flex-col">
        
        {/* Cabecera Tabla */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-semibold uppercase tracking-wider">
          <div className="flex-1 py-3 px-6 border-r border-gray-200/50">Empleado</div>
          <div className="w-[300px] py-3 px-6 border-r border-gray-200/50">Correo Institucional</div>
          <div className="w-[200px] py-3 px-6 border-r border-gray-200/50 text-center">Rol del Sistema</div>
          <div className="w-[100px] py-3 px-4 text-center">Acciones</div>
        </div>

        {/* Filas */}
        <div className="flex flex-col flex-1 overflow-auto">
          {loading ? (
             <div className="p-10 flex justify-center text-gray-400"><Loader2 className="animate-spin" size={24}/></div>
          ) : profiles.map((user) => {
            const isBoss = user.role.startsWith('Jefe');
            const isAdmin = user.role === 'Administrador';
            const bgColor = isAdmin ? 'bg-purple-500' : isBoss ? 'bg-indigo-500' : 'bg-sky-500';

            return (
              <div key={user.id} className="flex w-full hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 items-center">
                <div className="flex-1 px-6 py-4 border-r border-gray-200/50 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {user.last_name || user.first_name?.charAt(0) || "U"}
                  </div>
                  <span className="font-semibold text-slate-800 text-[15px]">{user.first_name || 'Sin Nombre'}</span>
                </div>
                <div className="w-[300px] px-6 py-4 border-r border-gray-200/50 text-slate-600 font-medium truncate">
                  {user.email}
                </div>
                <div className="w-[200px] px-6 py-4 border-r border-gray-200/50 flex items-center justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isAdmin ? 'bg-purple-100 text-purple-700' :
                    isBoss ? 'bg-indigo-100 text-indigo-700' :
                    'bg-sky-100 text-sky-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="w-[100px] flex items-center justify-center">
                  <button className="p-2 text-gray-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" /> Nuevo Perfil Organizacional
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="px-6 py-6 flex flex-col gap-5">
              
              {createError && (
                 <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg text-center">
                   {createError}
                 </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre Completo</label>
                  <input
                    type="text" required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Ej. Roberto Finol"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Iniciales (Avatar)</label>
                  <input
                    type="text" required maxLength={2}
                    value={newUser.initials}
                    onChange={(e) => setNewUser({...newUser, initials: e.target.value.toUpperCase()})}
                    placeholder="RF"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white uppercase"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rol de Sistema</label>
                  <select 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {ROLES_DISPONIBLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-span-2 border-t border-gray-100 pt-3 mt-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico (Login)</label>
                  <input
                    type="email" required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="r.finol@gob.ve"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asignar Contraseña Temporal</label>
                  <input
                    type="text" required minLength={6}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Escribe la contraseña que le darás al usuario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">El usuario podrá cambiarla desde su cuenta luego.</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={creating}
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex gap-2 items-center"
                >
                  {creating ? <Loader2 size={18} className="animate-spin"/> : "Generar y Guardar Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {isPwdModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock size={20} className="text-slate-600" /> Cambio de Clave
              </h2>
              <button 
                onClick={() => setIsPwdModalOpen(false)}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="px-6 py-6 flex flex-col gap-4">
              
              {pwdMsg && (
                 <div className={`p-3 text-sm font-semibold rounded-lg text-center ${pwdMsg.includes('Error') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                   {pwdMsg}
                 </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Escribe la Nueva Contraseña Segura</label>
                <input
                  type="password" required minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <button
                  type="submit" disabled={pwdUpdating || !newPassword}
                  className="px-5 py-2 mt-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors flex gap-2 items-center justify-center disabled:opacity-50"
                >
                  {pwdUpdating ? <Loader2 size={18} className="animate-spin"/> : "Actualizar Contraseña Ahora"}
                </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
