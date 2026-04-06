"use client";

import React, { useState } from 'react';
import { Users, UserPlus, Settings, MoreVertical, X, Mail, Shield, Check } from 'lucide-react';

const ROLES_DISPONIBLES = [
  "Administrador",
  "Jefe de Contrataciones",
  "Jefe de Bienes",
  "Analista de Contrataciones",
  "Analista de Bienes"
];

// Datos falsos para el mockup
const MOCK_USERS = [
  { id: 1, name: "Admin Total", email: "admin@gob.ve", role: "Administrador", initials: "A", color: "bg-purple-500" },
  { id: 2, name: "Luis Fernandez", email: "l.fernandez@gob.ve", role: "Jefe de Contrataciones", initials: "LF", color: "bg-indigo-500" },
  { id: 3, name: "Roberto Finol", email: "r.finol@gob.ve", role: "Analista de Bienes", initials: "RF", color: "bg-sky-500" }
];

export default function UsuariosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Analista de Contrataciones" });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Se registraría a ${newUser.name} como ${newUser.role} en la base de datos Supabase Auth y en la tabla Profiles.`);
    setIsModalOpen(false);
    setNewUser({ name: "", email: "", role: "Analista de Contrataciones" });
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Users size={28} className="text-monday-blue" />
          Directorio de Usuarios
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-transparent"
        >
          <UserPlus size={16} strokeWidth={3} />
          Invitar Empleado
        </button>
      </div>

      {/* Lista de Usuarios */}
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-200 overflow-hidden flex-1">
        
        {/* Cabecera Tabla */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-semibold uppercase tracking-wider">
          <div className="flex-1 py-3 px-6 border-r border-gray-200/50">Empleado</div>
          <div className="w-[300px] py-3 px-6 border-r border-gray-200/50">Correo Institucional</div>
          <div className="w-[200px] py-3 px-6 border-r border-gray-200/50 text-center">Rol del Sistema</div>
          <div className="w-[100px] py-3 px-4 text-center">Acciones</div>
        </div>

        {/* Filas */}
        <div className="flex flex-col">
          {MOCK_USERS.map((user) => (
            <div key={user.id} className="flex w-full hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 items-center">
              <div className="flex-1 px-6 py-4 border-r border-gray-200/50 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                  {user.initials}
                </div>
                <span className="font-semibold text-slate-800 text-[15px]">{user.name}</span>
              </div>
              <div className="w-[300px] px-6 py-4 border-r border-gray-200/50 text-slate-600 font-medium">
                {user.email}
              </div>
              <div className="w-[200px] px-6 py-4 border-r border-gray-200/50 flex items-center justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === 'Administrador' ? 'bg-purple-100 text-purple-700' :
                  user.role.startsWith('Jefe') ? 'bg-indigo-100 text-indigo-700' :
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
          ))}
        </div>
      </div>

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">Añadir Nuevo Empleado</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Se le enviará un correo de acceso al sistema</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-200 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 pb-8">
              <form id="user-form" onSubmit={handleCreateUser} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-monday-blue">Nombre Completo</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:border-monday-blue focus:bg-white"
                    placeholder="Ej. María Sánchez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-monday-blue">Correo Institucional</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-slate-800 focus:outline-none focus:border-monday-blue focus:bg-white"
                    placeholder="m.sanchez@institucion.gob.ve"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 mt-4 flex items-center gap-2">
                    <Shield size={16} className="text-monday-orange" />
                    Permisos y Rol del Sistema
                  </label>
                  <div className="space-y-2">
                    {ROLES_DISPONIBLES.map((role) => (
                      <label key={role} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${newUser.role === role ? 'border-monday-blue bg-blue-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${newUser.role === role ? 'text-monday-blue' : 'text-slate-700'}`}>{role}</span>
                          <span className="text-xs text-gray-400 font-medium">
                            {role === 'Administrador' ? 'Control total corporativo' : 
                             role.startsWith('Jefe') ? 'Aprueba actos (V.B) y asigna tareas (sin cambiar estatus)' :
                             `Ejecuta y procesa la carga operativa de ${role.split('de ')[1]}`}
                          </span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex flex-col items-center justify-center ${newUser.role === role ? 'border-monday-blue bg-monday-blue' : 'border-gray-300'}`}>
                          {newUser.role === role && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="user-form"
                disabled={!newUser.name || !newUser.email}
                className="px-6 py-2 bg-monday-blue text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                Enviar Invitación
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
