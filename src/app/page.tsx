"use client";

import React, { useState, useMemo } from 'react';
import { Plus, X, Search, Filter, FileText, CheckCircle2, Circle, UploadCloud, File, LayoutGrid, Package, ChevronDown, ChevronRight, Trash2, Users } from 'lucide-react';

// Checklist legal LCP base
const DOCUMENTOS_LCP = [
  { id: 1, name: "Solicitud de la unidad usuaria", category: "Inicio" },
  { id: 2, name: "Disponibilidad Presupuestaria", category: "Inicio" },
  { id: 3, name: "Autorización de Inicio", category: "Inicio" },
  { id: 4, name: "Presupuesto Base", category: "Inicio" },
  { id: 5, name: "Pliego de Condiciones", category: "Inicio" },
  { id: 10, name: "Informe de Recomendación", category: "Selección" },
  { id: 11, name: "Adjudicación", category: "Selección" },
  { id: 14, name: "Contrato o Módulo SUCOP", category: "Formalización" }
];

const ANALISTAS = [
  { id: 1, nombre: "María Pérez", iniciales: "MP", color: "bg-pink-500" },
  { id: 2, nombre: "Carlos López", iniciales: "CL", color: "bg-cyan-500" },
  { id: 3, nombre: "Ana Gómez", iniciales: "AG", color: "bg-amber-500" },
  { id: 4, nombre: "Luis Ramírez", iniciales: "LR", color: "bg-teal-500" }
];

const TIPOS_BIENES = ["Toma Física / Inventario General", "Ingreso / Alta de Bien", "Desincorporación / Baja", "Traspaso o Transferencia Interna", "Corrección de Seriales"];

const ESTADOS_CICLO = ["Asignada", "En Proceso", "En Revisión", "Culminada"];
const getColorEstado = (estado: string) => {
  switch(estado) {
    case "Asignada": return "bg-gray-400";
    case "En Proceso": return "bg-blue-500";
    case "En Revisión": return "bg-orange-500";
    case "Culminada": return "bg-emerald-500";
    default: return "bg-gray-400";
  }
};

type SubProcesoType = {
  id: number;
  nombre: string;
  estado: string;
  archivosSubidosCount: number;
};

type ExpedienteType = {
  id: number;
  nombre: string;
  area: string;
  analistaId?: number;
  procesos: SubProcesoType[];
};

export default function Home() {
  const [expedientes, setExpedientes] = useState<ExpedienteType[]>([
    { 
      id: 1, 
      nombre: "LP-001 Compra de Insumos Médicos", 
      area: "Contrataciones",
      analistaId: 1, // Asignado a María Pérez
      procesos: [
        { id: 101, nombre: "1. Solicitud U.U.", estado: "Culminada", archivosSubidosCount: 1 },
        { id: 102, nombre: "2. Disponibilidad Presupuestaria", estado: "En Revisión", archivosSubidosCount: 0 }
      ] 
    }
  ]);

  const [expandedRow, setExpandedRow] = useState<number | null>(1);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [activeIds, setActiveIds] = useState<{expId: number, procId: number} | null>(null);

  // Estados Formulario Expediente
  const [taskName, setTaskName] = useState("");
  const [area, setArea] = useState<"Contrataciones" | "Bienes">("Contrataciones");
  const [selectedAnalista, setSelectedAnalista] = useState<number | "">("");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [bienesTipo, setBienesTipo] = useState("");

  const toggleDoc = (id: number) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const [newProcessName, setNewProcessName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Resumen de Cargas por Analista Calculada Dinámicamente
  const cargasPorAnalista = useMemo(() => {
    const cargas: Record<number, number> = {};
    ANALISTAS.forEach(a => cargas[a.id] = 0);
    expedientes.forEach(exp => {
      if(exp.analistaId) cargas[exp.analistaId]++;
    });
    return cargas;
  }, [expedientes]);

  const handleCreateExpediente = (e: React.FormEvent) => {
    e.preventDefault();
    
    let subProcesos: SubProcesoType[] = [];
    
    if(area === "Contrataciones") {
      subProcesos = selectedDocs.map((docId) => {
        const docInfo = DOCUMENTOS_LCP.find(d => d.id === docId);
        return {
          id: Date.now() + Math.random(),
          nombre: docInfo ? docInfo.name : "Proceso",
          estado: "Asignada",
          archivosSubidosCount: 0
        };
      });
    } else {
      subProcesos = [{
        id: Date.now() + Math.random(),
        nombre: `Trámite: ${bienesTipo}`,
        estado: "Asignada",
        archivosSubidosCount: 0
      }];
    }

    const nuevoExpediente: ExpedienteType = {
      id: Date.now(),
      nombre: taskName,
      area: area,
      analistaId: selectedAnalista !== "" ? Number(selectedAnalista) : undefined,
      procesos: subProcesos
    };
    
    setExpedientes([nuevoExpediente, ...expedientes]);
    setIsNewTaskModalOpen(false);
    setSelectedDocs([]);
    setTaskName("");
    setSelectedAnalista("");
    setBienesTipo("");
  };

  const handleCycleStatus = (expId: number, procId: number) => {
    setExpedientes(prev => prev.map(exp => {
      if(exp.id !== expId) return exp;
      return {
        ...exp,
        procesos: exp.procesos.map(proc => {
          if(proc.id !== procId) return proc;
          const currentIndex = ESTADOS_CICLO.indexOf(proc.estado);
          const nextIndex = (currentIndex + 1) % ESTADOS_CICLO.length;
          return { ...proc, estado: ESTADOS_CICLO[nextIndex] };
        })
      };
    }));
  };

  const handleCreateSubProceso = (expId: number) => {
    if(!newProcessName.trim()) return;
    setExpedientes(prev => prev.map(exp => {
      if(exp.id !== expId) return exp;
      return {
        ...exp,
        procesos: [...exp.procesos, { id: Date.now(), nombre: newProcessName, estado: "Asignada", archivosSubidosCount: 0 }]
      };
    }));
    setNewProcessName("");
  };

  const handleDeleteSubProceso = (expId: number, procId: number) => {
    setExpedientes(prev => prev.map(exp => {
      if(exp.id !== expId) return exp;
      return { ...exp, procesos: exp.procesos.filter(p => p.id !== procId) };
    }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const uploadToStorage = () => {
    if (activeIds !== null) {
      setExpedientes(prev => prev.map(exp => {
        if (exp.id !== activeIds.expId) return exp;
        return {
          ...exp,
          procesos: exp.procesos.map(proc => {
            if(proc.id !== activeIds.procId) return proc;
            return { ...proc, archivosSubidosCount: proc.archivosSubidosCount + files.length };
          })
        };
      }));
    }
    setIsFileModalOpen(false);
    setFiles([]);
    setActiveIds(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
      
      {/* Carga de Analistas Widget */}
      <div className="flex gap-4 items-center">
        <div className="text-sm font-black text-slate-700 flex items-center gap-2 pr-2 border-r border-gray-300">
          <Users size={16} /> Carga Operativa
        </div>
        <div className="flex gap-3">
          {ANALISTAS.map(a => (
            <div key={a.id} className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${a.color}`}>{a.iniciales}</div>
              <span className="text-xs font-semibold text-slate-700">{a.nombre.split(' ')[0]}</span>
              <span className={`text-xs font-black ${cargasPorAnalista[a.id] > 3 ? 'text-red-500' : 'text-slate-400'}`}>({cargasPorAnalista[a.id]})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
            <Filter size={16} /> Filtros
          </button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar expedientes..." className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 text-gray-800" />
          </div>
        </div>

        <button onClick={() => setIsNewTaskModalOpen(true)} className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-transparent">
          <Plus size={16} strokeWidth={3} /> Nuevo Expediente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-transparent px-2 py-3 flex items-center border-b-[3px] border-b-indigo-500 group">
          <div className="w-[30px] flex justify-center cursor-pointer text-indigo-500"><LayoutGrid size={16} /></div>
          <h2 className="text-indigo-500 font-semibold text-lg flex-1">Expedientes de Contratación Activos</h2>
          <span className="text-gray-400 font-medium text-sm pr-4">{expedientes.length} Registros Oficiales</span>
        </div>

        <div className="flex w-full border-b border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-medium">
          <div className="w-[50px] border-r border-gray-200/50"></div>
          <div className="flex-1 py-1.5 px-3 border-r border-gray-200/50 flex flex-col justify-end">Expediente</div>
          <div className="w-[120px] py-1.5 px-3 text-center border-r border-gray-200/50 flex flex-col justify-end">Delegado</div>
          <div className="w-[140px] py-1.5 px-3 text-center border-r border-gray-200/50 flex flex-col justify-end">Progreso Global</div>
        </div>

        <div className="flex flex-col">
          {expedientes.map((expediente) => {
            const isExpanded = expandedRow === expediente.id;
            const culminados = expediente.procesos.filter(p => p.estado === 'Culminada').length;
            const isGlobalCompleted = expediente.procesos.length > 0 && culminados === expediente.procesos.length;
            const analistaInfo = ANALISTAS.find(a => a.id === expediente.analistaId);

            return (
              <div key={expediente.id} className="flex flex-col w-full border-b border-gray-200/50 transition-colors">
                
                <div onClick={() => setExpandedRow(isExpanded ? null : expediente.id)} className={`flex w-full cursor-pointer leading-[3rem] transition-colors ${isExpanded ? 'bg-indigo-50/20' : 'hover:bg-gray-50'}`}>
                  <div className="w-[5px] bg-indigo-500 transition-all"></div>
                  
                  <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 text-indigo-400">
                     {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  <div className="flex-1 px-4 font-bold text-slate-800 text-base flex items-center gap-3 border-r border-gray-200/50">
                    <Package size={18} className="text-indigo-600 opacity-60" /> 
                    {expediente.nombre}
                  </div>
                  
                  <div className="w-[120px] px-3 flex items-center justify-center border-r border-gray-200/50">
                     {analistaInfo ? (
                        <div className="flex items-center gap-2 w-full justify-center" title={analistaInfo.nombre}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${analistaInfo.color}`}>
                            {analistaInfo.iniciales}
                          </div>
                        </div>
                     ) : (
                        <span className="text-xs text-gray-400 font-medium italic">Sin asignar</span>
                     )}
                  </div>

                  <div className="w-[140px] px-3 flex items-center justify-center">
                    {isGlobalCompleted ? (
                      <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1"><CheckCircle2 size={12}/> Oficializado</span>
                    ) : (
                      <div className="w-full flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${expediente.procesos.length ? (culminados / expediente.procesos.length) * 100 : 0}%` }}></div>
                        </div>
                        <span className="text-[10px] uppercase font-black text-slate-600">{culminados}/{expediente.procesos.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="flex flex-col bg-[#F9F9F9] shadow-inner pb-4">
                    <div className="flex w-full border-b border-gray-200 text-gray-500 text-xs font-bold uppercase tracking-wider pl-[50px]">
                      <div className="flex-1 py-1.5 px-6 border-r border-gray-200/50">Procesos Administrativos ({expediente.procesos.length})</div>
                      <div className="w-[140px] py-1.5 px-3 text-center border-r border-gray-200/50">Estado Interno</div>
                      <div className="w-[150px] py-1.5 px-3 text-center border-r border-gray-200/50">Documentos</div>
                      <div className="w-[50px] py-1.5 text-center"></div>
                    </div>

                    {expediente.procesos.map((proceso) => (
                      <div key={proceso.id} className="flex w-full group hover:bg-white transition-colors border-b border-gray-200/40 leading-[2.5rem] pl-[50px]">
                        <div className="w-[5px] bg-slate-300 group-hover:bg-indigo-300"></div>
                        <div className="flex-1 px-5 border-r border-gray-200/50 font-medium text-slate-700 text-sm flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full border border-slate-400"></div>
                          {proceso.nombre}
                        </div>
                        
                        <div onClick={() => handleCycleStatus(expediente.id, proceso.id)} className={`w-[140px] border-r text-sm border-white text-white font-semibold text-center hover:opacity-90 cursor-pointer transition-colors ${getColorEstado(proceso.estado)}`}>
                          {proceso.estado}
                        </div>
                        
                        <div className="w-[150px] flex items-center border-r border-gray-200/50 justify-center group-hover:bg-blue-50/20 transition-colors relative px-2">
                          {proceso.estado === "Culminada" ? (
                            proceso.archivosSubidosCount > 0 ? (
                              <button onClick={() => { setActiveIds({expId: expediente.id, procId: proceso.id}); setIsFileModalOpen(true); }} className="text-xs flex items-center justify-center w-full gap-1.5 font-bold px-2 py-1 my-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 border border-blue-200"><FileText size={12} /> {proceso.archivosSubidosCount} Archivos</button>
                            ) : (
                              <button onClick={() => { setActiveIds({expId: expediente.id, procId: proceso.id}); setIsFileModalOpen(true); }} className="text-xs flex items-center justify-center w-full gap-1.5 font-bold px-2 py-1 my-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 border border-emerald-200"><FileText size={12} /> Anexar PDF</button>
                            )
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase cursor-not-allowed">Pendiente Status</span>
                          )}
                        </div>

                        <div className="w-[50px] flex items-center justify-center">
                          <button onClick={() => handleDeleteSubProceso(expediente.id, proceso.id)} className="text-gray-300 hover:text-red-500 transition-colors outline-none"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}

                    <div className="flex w-full px-6 pl-[55px] mt-2">
                      <form className="flex w-full items-center gap-2 max-w-lg" onSubmit={(e) => { e.preventDefault(); handleCreateSubProceso(expediente.id); }}>
                         <input type="text" placeholder="+ Nombre del Proceso Administrativo extra..." value={newProcessName} onChange={e => setNewProcessName(e.target.value)} className="flex-1 text-xs px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 hover:bg-white focus:bg-white text-slate-800 focus:outline-none focus:border-indigo-500 rounded-md transition-colors" />
                         {newProcessName && <button type="submit" className="text-xs bg-slate-800 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-slate-700">Añadir</button>}
                      </form>
                    </div>

                  </div>
                )}

              </div>
            );
          })}

          {expedientes.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center text-gray-400">
              <Package size={48} className="opacity-20 mb-3" />
              <p>No hay Expedientes Activos Oficiales</p>
            </div>
          )}
        </div>
      </div>

      {isNewTaskModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-xl font-black text-slate-800">Creación de Expediente</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Licitaciones y Contrataciones Públicas</p>
              </div>
              <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="text-gray-400 hover:text-slate-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full"><X size={18} /></button>
            </div>

            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              <form id="new-exp-form" onSubmit={handleCreateExpediente} className="space-y-6">
                
                <div className="flex gap-4">
                  <div onClick={() => setArea("Contrataciones")} className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${area === 'Contrataciones' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <FileText size={18} /> <span className="font-bold text-sm">Contrataciones</span>
                  </div>
                  <div onClick={() => setArea("Bienes")} className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-center gap-2 ${area === 'Bienes' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <Package size={18} /> <span className="font-bold text-sm">Bienes Públicos</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Título Formal del Expediente</label>
                  <input type="text" required value={taskName} onChange={(e) => setTaskName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Ej. LP-GCA-2024-001 Contrato Materiales..." />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-indigo-600">Delegar a Analista Operativo</label>
                  <select value={selectedAnalista} onChange={e => setSelectedAnalista(e.target.value === "" ? "" : Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
                    <option value="">-- Sin asignar / Abierto --</option>
                    {ANALISTAS.map(a => <option key={a.id} value={a.id}>{a.nombre} ({cargasPorAnalista[a.id]} expedientes en curso)</option>)}
                  </select>
                </div>

                {area === 'Contrataciones' && (
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-slate-800 flex items-center gap-2 mb-2 border-b pb-2">Selecciona la Base del Checklist Legal LCP <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selectedDocs.length} marcados</span></label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {DOCUMENTOS_LCP.map(doc => {
                        const isSelected = selectedDocs.includes(doc.id);
                        return (
                          <div key={doc.id} onClick={() => toggleDoc(doc.id)} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${isSelected ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <div className={isSelected ? 'text-indigo-600' : 'text-gray-300'}>{isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}</div>
                            <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{doc.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {area === 'Bienes' && (
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-slate-800 mb-2">Clasificación del Movimiento (SUDEBIP)</label>
                    <select required value={bienesTipo} onChange={(e) => setBienesTipo(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 bg-white">
                      <option value="" disabled>Seleccione el tipo de trámite de Bienes...</option>
                      {TIPOS_BIENES.map(tb => <option key={tb} value={tb}>{tb}</option>)}
                    </select>
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button type="submit" form="new-exp-form" disabled={!taskName || (area === 'Contrataciones' && selectedDocs.length === 0) || (area === 'Bienes' && !bienesTipo)} className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">Oficializar Expediente</button>
            </div>
          </div>
        </div>
      )}

      {isFileModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col p-6 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Repositorio del Proceso</h3>
                <p className="text-sm text-gray-500 mt-1">Sube el PDF exclusivo para esta fase del checklist.</p>
              </div>
              <button onClick={() => { setIsFileModalOpen(false); setFiles([]); }} className="text-gray-400 hover:bg-gray-100 p-1 rounded-md"><X size={20}/></button>
            </div>

            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300 bg-gray-50'}`}>
              <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-gray-200 text-gray-500'}`}><UploadCloud size={32} /></div>
              <p className="text-slate-700 font-bold mb-1">Arrastra el archivo legal aquí</p>
              <div className="mt-6 flex items-center gap-3"><div className="h-px w-10 bg-gray-300"></div><span className="text-xs text-gray-500 uppercase font-bold">o</span><div className="h-px w-10 bg-gray-300"></div></div>
              <input type="file" ref={fileInputRef} onChange={handleFileInput} className="hidden" multiple accept=".pdf,.csv,.xlsx,.xls,.png,.jpg" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 border border-gray-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors shadow-sm">Explorar mi Mac</button>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto border border-gray-100 p-2 rounded-lg bg-gray-50">
                {files.map((file, i) => (
                  <div key={i} className="flex flex-row items-center justify-between p-2 rounded bg-white border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3"><File size={14} className="text-indigo-600" /><div className="flex flex-col"><span className="text-xs font-bold text-slate-700 truncate w-40">{file.name}</span></div></div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            )}

            <button onClick={uploadToStorage} disabled={files.length === 0} className="mt-6 w-full py-3 bg-slate-800 text-white font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Fijar {files.length} archivo(s) en este Proceso</button>
          </div>
        </div>
      )}

    </div>
  );
}
