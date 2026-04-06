"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === '/login') {
    return <main className="w-full h-full min-h-screen">{children}</main>;
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 bg-[#292f4c] text-white flex flex-col transition-all duration-300 relative z-0">
        <div className="h-20 flex items-center px-4 border-b border-white/10 overflow-hidden bg-white/5 justify-center py-2">
           <img src="/concepto.png" alt="Logo COP Concepto" className="max-h-16 w-auto object-contain drop-shadow-md" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="/" className="flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Tablero Principal
          </a>
          <a href="/usuarios" className="flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 default 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Usuarios y Roles
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
            Inventario Bienes
          </a>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg group-hover:from-red-500 group-hover:to-orange-500 transition-all">A</div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Mi Perfil</span>
              <span className="text-xs text-white/50 group-hover:text-red-300">Cerrar Sesión</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-tl-2xl shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] ml-[-10px] z-10 transition-all duration-300 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 bg-white flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">Control de Operaciones Públicas (COP)</h1>
        </header>
        
        <div className="flex-1 overflow-auto p-8 bg-[#F4F5f7] relative">
          {children}
        </div>
      </main>
    </div>
  );
}
