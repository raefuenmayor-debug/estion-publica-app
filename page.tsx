import React from 'react';

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col gap-6">
      
      {/* Board Header Actions */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filtros
          </button>
          <div className="h-4 w-px bg-gray-300 mx-2"></div>
          <span className="text-sm font-medium text-gray-500">Filtrando por:</span>
          <span className="text-sm font-semibold text-slate-700 bg-white px-2 py-1 object-contain rounded border border-gray-200 shadow-sm">Área: Contrataciones</span>
        </div>
      </div>

      {/* Tanstack Table / Monday Style Board Mockup */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Group Header */}
        <div className="bg-transparent px-2 py-3 flex items-center border-b-[3px] border-b-[#579BFC] group">
          <div className="w-[30px] flex justify-center cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#579BFC" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <h2 className="text-[#579BFC] font-semibold text-lg flex-1">Procesos de Licitación 2024</h2>
          <span className="text-gray-400 text-sm mr-4">3 Tareas</span>
        </div>

        {/* Table Head */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium">
          <div className="w-[50px] flex items-center justify-center border-r border-gray-200/50 py-2"></div>
          <div className="flex-1 py-2 px-3 border-r border-gray-200/50">Tarea / Documento</div>
          <div className="w-[140px] py-2 px-3 text-center border-r border-gray-200/50">Asignado a</div>
          <div className="w-[160px] py-2 px-3 text-center border-r border-gray-200/50">Estado</div>
          <div className="w-[120px] py-2 px-3 text-center border-r border-gray-200/50">Fecha</div>
          <div className="w-[150px] py-2 px-3 text-center">Verificación</div>
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {/* Row 1 */}
          <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 leading-[2.5rem]">
            <div className="w-[5px] bg-[#579BFC]"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
              <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white"></div>
            </div>
            <div className="flex-1 px-3 border-r border-gray-200/50 truncate font-medium text-slate-800">
              1. Solicitud de la unidad usuaria
            </div>
            <div className="w-[140px] px-3 border-r border-gray-200/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-purple-500 overflow-hidden text-center text-white text-xs font-bold leading-8 shadow-sm ring-2 ring-white">LF</div>
            </div>
            <div className="w-[160px] border-r border-gray-200/50 bg-[#00C875] text-white font-semibold text-center py-1 flex items-center justify-center">
              Culminada
            </div>
            <div className="w-[120px] px-3 border-r border-gray-200/50 text-center text-sm text-gray-600">
              15 Mar
            </div>
            <div className="w-[150px] flex items-center justify-center">
              <button className="p-1.5 text-[#00C875] bg-[#00C875]/10 rounded-md hover:bg-[#00C875]/20 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              </button>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 leading-[2.5rem]">
            <div className="w-[5px] bg-[#579BFC]"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
              <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white"></div>
            </div>
            <div className="flex-1 px-3 border-r border-gray-200/50 truncate font-medium text-slate-800">
              2. Documento de Autorización de Inicio
            </div>
            <div className="w-[140px] px-3 border-r border-gray-200/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 overflow-hidden text-center text-white text-xs font-bold leading-8 shadow-sm ring-2 ring-white">RF</div>
            </div>
            <div className="w-[160px] border-r border-gray-200/50 bg-[#E2445C] text-white font-semibold text-center flex items-center justify-center">
              En Revisión
            </div>
            <div className="w-[120px] px-3 border-r border-gray-200/50 text-center text-sm text-gray-600">
              18 Mar
            </div>
            <div className="w-[150px] flex items-center justify-center gap-2">
              <button className="text-xs font-semibold px-2 py-1 bg-white border shadow-sm rounded border-gray-200 text-gray-700 hover:bg-gray-50">Validar</button>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 leading-[2.5rem]">
            <div className="w-[5px] bg-[#579BFC]"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
              <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white"></div>
            </div>
            <div className="flex-1 px-3 border-r border-gray-200/50 truncate font-medium text-slate-800">
              3. Pliego de Condiciones
            </div>
            <div className="w-[140px] px-3 border-r border-gray-200/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-yellow-500 overflow-hidden text-center text-white text-xs font-bold leading-8 shadow-sm ring-2 ring-white">MC</div>
            </div>
            <div className="w-[160px] border-r border-gray-200/50 bg-[#FDAB3D] text-white font-semibold text-center flex items-center justify-center">
              En Proceso
            </div>
            <div className="w-[120px] px-3 border-r border-gray-200/50 text-center text-sm text-gray-600">
              22 Mar
            </div>
            <div className="w-[150px] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>

        </div>
        
        {/* Add new task area */}
        <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100/50 leading-[2.5rem]">
            <div className="w-[5px] bg-transparent"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-transparent relative"></div>
            <div className="flex-1 px-3 cursor-text text-gray-400">
              + Añadir Tarea
            </div>
        </div>

      </div>

    </div>
  );
}
