"use client";

import React, { useState } from 'react';
import { Plus, X, Search, Filter, MoreHorizontal, FileText, CheckCircle2, Circle, UploadCloud, File, AlertCircle, LayoutGrid, Package } from 'lucide-react';

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

export default function Home() {
  // Estado general de UI
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  // Estados del Formulario "Nueva Tarea"
  const [taskName, setTaskName] = useState("");
  const [area, setArea] = useState<"Contrataciones" | "Bienes">("Contrataciones");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [bienesTipo, setBienesTipo] = useState("");

  // Estados del Drag and Drop
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [archivosSubidosCount, setArchivosSubidosCount] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const toggleDoc = (id: number) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Creando en Base de Datos: [${area}] ${taskName}.`);
    setIsNewTaskModalOpen(false);
    setSelectedDocs([]);
    setTaskName("");
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const uploadToStorage = () => {
    // Al presionar el botón de Subir a la Bóveda
    setArchivosSubidosCount(prev => prev + files.length);
    setIsFileModalOpen(false);
    setFiles([]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 relative">
      
      {/* Filters & Actions Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <button className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
            <Filter size={16} />
            Filtros
          </button>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-monday-blue w-64 text-gray-800"
            />
          </div>
        </div>

        <button 
          onClick={() => setIsNewTaskModalOpen(true)}
          className="px-4 py-2 bg-monday-blue text-white text-sm font-bold rounded-lg shadow-sm hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          Nuevo Registro Administrativo
        </button>
      </div>

      {/* Board Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Group */}
        <div className="bg-transparent px-2 py-3 flex items-center border-b-[3px] border-b-monday-blue group">
          <div className="w-[30px] flex justify-center cursor-pointer text-monday-blue">
             <LayoutGrid size={16} />
          </div>
          <h2 className="text-monday-blue font-semibold text-lg flex-1">Procesos de Licitación Activos</h2>
        </div>

        {/* Labels Row */}
        <div className="flex w-full border-b border-gray-200 bg-gray-50/80 text-gray-500 text-sm font-medium">
          <div className="w-[50px] border-r border-gray-200/50"></div>
          <div className="flex-1 py-1.5 px-3 border-r border-gray-200/50 flex flex-col justify-end">Expediente</div>
          <div className="w-[140px] py-1.5 px-3 text-center border-r border-gray-200/50 flex flex-col justify-end">Estado</div>
          <div className="w-[150px] py-1.5 px-3 text-center flex flex-col justify-end">Validación Documental</div>
        </div>

        <div className="flex flex-col">
          {/* Row 1: Tarea Culminada, permite archivos */}
          <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100/80 leading-[2.5rem]">
            <div className="w-[5px] bg-monday-blue transition-all group-hover:w-[8px]"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
               <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white"></div>
            </div>
            <div className="flex-1 px-3 border-r border-gray-200/50 font-medium text-slate-800">
              1. Solicitud U.U. Insumos Médicos
            </div>
            <div className="w-[140px] border-r border-white bg-monday-green text-white font-semibold text-center hover:opacity-90 cursor-pointer transition-opacity">
              Culminada
            </div>
            <div className="w-[150px] flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors">
              {archivosSubidosCount > 0 ? (
                <button 
                  onClick={() => setIsFileModalOpen(true)}
                  className="text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 my-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-all border border-blue-200"
                >
                  <FileText size={14} /> {archivosSubidosCount} Archivos Listos
                </button>
              ) : (
                <button 
                  onClick={() => setIsFileModalOpen(true)}
                  className="text-xs flex items-center gap-1.5 font-bold px-3 py-1.5 my-1 bg-monday-green/10 text-monday-green rounded-md hover:bg-monday-green/20 transition-all border border-monday-green/20"
                >
                  <FileText size={14} /> Anexar PDFs
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Tarea en proceso, PDF bloqueado según RLS de proceso */}
          <div className="flex w-full group hover:bg-gray-50 transition-colors border-b border-gray-100/80 leading-[2.5rem]">
            <div className="w-[5px] bg-monday-blue transition-all group-hover:w-[8px]"></div>
            <div className="w-[45px] flex items-center justify-center border-r border-gray-200/50 relative">
               <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 bg-white"></div>
            </div>
            <div className="flex-1 px-3 border-r border-gray-200/50 font-medium text-slate-800">
              2. Pliego de Condiciones
            </div>
            <div className="w-[140px] border-r border-white bg-monday-orange text-white font-semibold text-center hover:opacity-90 cursor-pointer transition-opacity">
              En Revisión
            </div>
            <div className="w-[150px] flex items-center justify-center bg-gray-50 group-hover:bg-white transition-colors relative">
              <span className="text-xs text-gray-400 font-medium cursor-not-allowed flex items-center gap-1">
                <AlertCircle size={14} /> Pendiente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Formulario Nueva Tarea Dual (Fase 6) */}
      {isNewTaskModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 bg-slate-50 flex justify-between items-center rounded-t-2xl">
              <div>
                <h3 className="text-xl font-black text-slate-800">Configurador de Expedientes</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Creación de Base Administrativa</p>
              </div>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-gray-400 hover:text-slate-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
              <form id="new-task-form" onSubmit={handleCreateTask} className="space-y-6">
                
                {/* Selector de Área */}
                <div className="flex gap-4">
                  <div 
                    onClick={() => setArea("Contrataciones")}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${area === 'Contrataciones' ? 'border-monday-blue bg-blue-50/50 text-monday-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <FileText size={28} />
                    <span className="font-bold text-sm">Contrataciones</span>
                  </div>
                  <div 
                    onClick={() => setArea("Bienes")}
                    className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${area === 'Bienes' ? 'border-monday-blue bg-blue-50/50 text-monday-blue' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    <Package size={28} />
                    <span className="font-bold text-sm">Bienes Públicos</span>
                  </div>
                </div>

                {/* Input Título Constante */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus-within:text-monday-blue">Identificación del Proceso</label>
                  <input 
                    type="text" required value={taskName} onChange={(e) => setTaskName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-slate-800 placeholder-gray-400 focus:outline-none focus:border-monday-blue focus:ring-1 focus:ring-monday-blue"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-slate-800 focus:outline-none focus:border-monday-blue focus:ring-1 focus:ring-monday-blue bg-white"
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
                className="px-6 py-2 bg-monday-blue text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                Crear Registro Oficial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Drag and Drop de Subida de Archivos (Fase 7) */}
      {isFileModalOpen && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col p-6 animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Repositorio Documental</h3>
                <p className="text-sm text-gray-500 mt-1">Sube la documentación final (PDF, JPG) para esta tarea.</p>
              </div>
              <button onClick={() => { setIsFileModalOpen(false); setFiles([]); }} className="text-gray-400 hover:text-slate-800"><X size={20}/></button>
            </div>

            {/* Zona de Drop */}
            <div 
              onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-monday-blue bg-blue-50/50' : 'border-gray-300 bg-gray-50'}`}
            >
              <div className={`p-4 rounded-full mb-3 ${isDragging ? 'bg-monday-blue text-white shadow-lg shadow-monday-blue/30' : 'bg-gray-200 text-gray-500'}`}>
                 <UploadCloud size={32} />
              </div>
              <p className="text-slate-700 font-bold mb-1">Arrastra tus archivos aquí</p>
              <p className="text-gray-400 text-sm font-medium">Archivos permitidos: PDF, CSV, Excel, PNG (Max. 10MB)</p>
              <div className="mt-6 flex items-center gap-3">
                 <div className="h-px w-10 bg-gray-300"></div><span className="text-xs text-gray-500 uppercase font-bold">o</span><div className="h-px w-10 bg-gray-300"></div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInput} 
                className="hidden" 
                multiple 
                accept=".pdf,.csv,.xlsx,.xls,.png,.jpg"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 border border-gray-300 text-slate-700 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors"
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
                      <File size={16} className="text-monday-blue" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 truncate w-48">{file.name}</span>
                        <span className="text-[10px] font-medium text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <CheckCircle2 size={16} className="text-monday-green" />
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={uploadToStorage}
              disabled={files.length === 0}
              className="mt-6 w-full py-3 bg-monday-blue text-white font-bold rounded-lg shadow-sm hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Validar y Subir a Bóveda ({files.length} archivos)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
