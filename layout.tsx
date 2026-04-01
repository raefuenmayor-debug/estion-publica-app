import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Control de Gestión - Monday Style",
  description: "Plataforma SaaS para la gestión de expedientes y bienes públicos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-[#F4F5f7]`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-[#292f4c] text-white flex flex-col transition-all duration-300">
            <div className="h-16 flex items-center px-6 border-b border-white/10">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-monday-yellow"></div>
                <div className="w-4 h-4 rounded bg-monday-green -ml-4 mt-4"></div>
                GeoGestión
              </span>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              <a href="#" className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                Tablero Principal
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 default 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Usuarios y Roles
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 text-white/70 hover:bg-white/5 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
                Inventario Bienes
              </a>
            </nav>
            
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg">A</div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Administrador</span>
                  <span className="text-xs text-white/50">Admin Total</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white rounded-tl-2xl shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] ml-[-10px] z-10 transition-all duration-300">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-8 border-b border-gray-100 bg-white">
              <h1 className="text-2xl font-bold text-slate-800">Contrataciones Públicas</h1>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-monday-green text-white text-sm font-medium rounded-md shadow-sm hover:bg-opacity-90 transition-all flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                  Nueva Tarea
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-auto p-8 bg-[#F4F5f7]">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
