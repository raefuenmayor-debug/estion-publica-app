"use client";

import React, { useState } from 'react';
import { Plus, X, Search, Filter, FileText, CheckCircle2, Circle, UploadCloud, File, AlertCircle, LayoutGrid, Package } from 'lucide-react';

// Checklist legal LCP
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

type TareaType = {
  id: number;
  nombre: string;
  estado: string;
  archivosSubidosCount: number;
};

export default function Home() {
  // Estado de Tareas Dinámicas del Tablero
  const [tareas, setTareas] = useState<TareaType[]>([
    { id: 1, nombre: "1. Solicitud U.U. Insumos Médicos", estado: "Culminada", archivosSubidosCount: 0 },
    { id: 2, nombre: "2. Pliego de Condiciones", estado: "En Revisión", archivosSubidosCount: 0 }
  ]);

  // Estado general de UI
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  // Estados del Formulario "Nueva Tarea"
  const [taskName, setTaskName] = useState("");
  const [area, setArea] = useState<"Contrataciones" | "Bienes">("Contrataciones");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [bienesTipo, setBienesTipo] = useState("");

  // Estados del Drag and Drop
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Funciones Interactivas del Tablero
  const toggleDoc = (id: number) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevaTarea: TareaType = {
      id: Date.now(),
      nombre: taskName,
      estado: "Asignada", // Empieza siempre en Asignada
      archivosSubidosCount: 0
    };
    
    // Hacemos que "Nueva tarea" sí haga algo visible añadiéndola a la lista
    setTareas([...tareas, nuevaTarea]);
    
    setIsNewTaskModalOpen(false);
    setSelectedDocs([]);
    setTaskName("");
  };

  const handleCycleStatus = (id: number) => {
    setTareas(tareas.map(t => {
      if (t.id === id) {
        const currentIndex = ESTADOS_CICLO.indexOf(t.estado);
        const nextIndex = (currentIndex + 1) % ESTADOS_CICLO.length;
        return { ...t, estado: ESTADOS_CICLO[nextIndex] };
      }
      return t;
    }));
  };

  // Funciones del Drag and Drop
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const uploadToStorage = () => {
    if (activeTaskId !== null) {
      setTareas(tareas.map(t => {
        if (t.id === activeTaskId) {
          return { ...t, archivosSubidosCount: t.archivosSubidosCount + files.length };
        }
        return t;
      }));
    }
    setIsFileModalOpen(false);
    setFiles([]);
    setActiveTaskId(null);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
      
      {/* Filters & Actions Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => alert("Los Filtros estarán activos cuando conectemos Supabase para filtrar la base de datos real.")}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all"
          >
            <Filter size={16} />
            Filtros
          </button>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64 text-gray-800"
            />
          </div>
        </div>

        <button 
          onClick={() => setIsNewTaskModalOpen(true)}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2 border border-transparent"
        >
          <Plus size={16} strokeWidth={3} />
          Nuevo Registro Administrativo
        </button>
      </div>

      {/* Board Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Group */}
        <div className="bg-transparent px-2 py-3 flex items-center border-b-[3px] border-b-indigo-500 group">
          <div className="w-[30px] flex justify-center cursor-pointer text-indigo-500">
             <LayoutGrid size={16} />
          </div>
          <h2 className="text-indigo-500 font-semibold text-lg flex-1">Procesos de Licitación Activos</h2>
          <span className="text-gray-400 font-medium text-sm pr-4">{tareas.length} Tareas</span>
        </div>

        {/* Labels Row */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-medium">
          <div className="w-[50px] border-r border-gray-200/50"></div>
          <div className="flex-1 py-1.5 px-3 border-r border-gray-200/50 flex flex-col justify-end">Expediente</div>
          <div className="w-[140px] py-1.5 px-3 text-center border-r border-gray-200/50 flex flex-col justify-end">Estado (Clic para cambiar)</div>
          <div className="w-[150px] py-1.5 px-3 text-center flex flex-col justify-end">Bóveda Documental</div>
        </div>

        <div className="flex flex-col">
          {tareas.map((tarea, index) => (
            <div key={tarea.id} className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100/80 leading-[2.5rem]">
              <div className="w-[5px] bg-indigo-500 transition-all group-hover:w-[8px]"></div>
              <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
                 <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white shadow-sm"></div>
              </div>
              <div className="flex-1 px-3 border-r border-gray-200/50 font-medium text-slate-800">
                {tarea.nombre}
              </div>
              
              {/* STATUS MOCKUP INTERACTIVO */}
              <div 
                onClick={() => handleCycleStatus(tarea.id)}
                className={`w-[140px] border-r border-white text-white font-semibold text-center hover:opacity-90 cursor-pointer transition-colors ${getColorEstado(tarea.estado)}`}
              >
                {tarea.estado}
              </div>
              
              <div className="w-[150px] flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors relative">
                {tarea.estado === "Culminada" ? (
                  tarea.archivosSubidosCount > 0 ? (
                    <button 
                      onClick={() => { setActiveTaskId(tarea.id); setIsFileModalOpen(true); }}
                      className="text-xs flex items-center justify-center w-full max-w-[130px] gap-1.5 font-bold px-2 py-1.5 my-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-all border border-blue-200"
                    >
                      <FileText size={14} /> {tarea.archivosSubidosCount} Archivos
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setActiveTaskId(tarea.id); setIsFileModalOpen(true); }}
                      className="text-xs flex items-center justify-center w-full max-w-[130px] gap-1.5 font-bold px-2 py-1.5 my-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-all border border-emerald-200"
                    >
                      <FileText size={14} /> Anexar PDFs
                    </button>
                  )
                ) : (
                  <span className="text-xs text-gray-400 font-medium cursor-not-allowed flex items-center justify-center gap-1 w-full">
                    <AlertCircle size={14} /> Falso (Exige Culminada)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: Formulario Nueva Tarea Dual (Fase 6) */}
      {isNewTaskModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-xl font-black text-slate-800">Configurador de Expedientes</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Creación de Base Administrativa</p>
              </div>
              <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="text-gray-400 hover:text-slate-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              <form id="new-task-form" onSubmit={handleCreateTask} className="space-y-6">
                
                {/* Selector de Área */}
                <div className="flex gap-4">
                  <div 
                    onClick={() => setArea("Contrataciones")}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${area === 'Contrataciones' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <FileText size={28} />
                    <span className="font-bold text-sm">Contrataciones</span>
                  </div>
                  <div 
                    onClick={() => setArea("Bienes")}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${area === 'Bienes' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Package size={28} />
                    <span className="font-bold text-sm">Bienes Públicos</span>
                  </div>
                </div>

                {/* Input Título Constante */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-indigo-600">Identificación del Proceso</label>
                  <input 
                    type="text" required value={taskName} onChange={(e) => setTaskName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ej. LP-GCA-2024-001..."
                  />
                </div>

                {/* Sub-formulario Contrataciones */}
                {area === 'Contrataciones' && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <label className="block text-sm font-bold text-slate-800 flex items-center gap-2 mb-2 border-b pb-2">
                       Checklist LCP Obligatorio <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selectedDocs.length} seleccionados</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {DOCUMENTOS_LCP.map(doc => {
                        const isSelected = selectedDocs.includes(doc.id);
                        return (
                          <div key={doc.id} onClick={() => toggleDoc(doc.id)} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${isSelected ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <div className={isSelected ? 'text-indigo-600' : 'text-gray-300'}>{isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}</div>
                            <span className={`text-sm font-medium leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{doc.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sub-formulario Bienes */}
                {area === 'Bienes' && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <label className="block text-sm font-bold text-slate-800 mb-2">Clasificación del Movimiento (SUDEBIP)</label>
                    <select 
                      required value={bienesTipo} onChange={(e) => setBienesTipo(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                    >
                      <option value="" disabled>Seleccione el tipo de trámite de Bienes...</option>
                      {TIPOS_BIENES.map(tb => (
                        <option key={tb} value={tb}>{tb}</option>
                      ))}
                    </select>
                  </div>
                )}
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-gray-200 rounded-lg">Cancelar</button>
              <button 
                type="submit" form="new-task-form" 
                disabled={!taskName || (area === 'Contrataciones' && selectedDocs.length === 0) || (area === 'Bienes' && !bienesTipo)}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                Insertar Fila Interactiva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Drag and Drop de Subida de Archivos (Fase 7) */}
      {isFileModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col p-6 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Repositorio Documental</h3>
                <p className="text-sm text-gray-500 mt-1">Sube la documentación final (PDF, JPG) para esta tarea.</p>
              </div>
              <button onClick={() => { setIsFileModalOpen(false); setFiles([]); }} className="text-gray-400 hover:bg-gray-100 p-1 rounded-md"><X size={20}/></button>
            </div>

            {/* Zona de Drop */}
            <div 
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-300 bg-gray-50'}`}
            >
              <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-gray-200 text-gray-500'}`}>
                 <UploadCloud size={32} />
              </div>
              <p className="text-slate-700 font-bold mb-1">Arrastra tus archivos aquí</p>
              <p className="text-gray-400 text-sm font-medium">Archivos permitidos: PDF, CSV, Excel, PNG</p>
              
              <div className="mt-6 flex items-center gap-3">
                 <div className="h-px w-10 bg-gray-300"></div><span className="text-xs text-gray-500 uppercase font-bold">o</span><div className="h-px w-10 bg-gray-300"></div>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleFileInput} className="hidden" multiple accept=".pdf,.csv,.xlsx,.xls,.png,.jpg" />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 border border-gray-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
              >
                Explorar mi Mac
              </button>
            </div>

            {/* Archivos Seleccionados */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, i) => (
                  <div key={i} className="flex flex-row items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <File size={16} className="text-indigo-600" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 truncate w-48">{file.name}</span>
                        <span className="text-[10px] font-medium text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={uploadToStorage}
              disabled={files.length === 0}
              className="mt-6 w-full py-3 bg-slate-800 text-white font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validar y Subir a Bóveda ({files.length} archivos)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
