"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, Search, Filter, FileText, CheckCircle2, Circle, UploadCloud, File, LayoutGrid, Package, ChevronDown, ChevronRight, Trash2, Users, ShieldCheck, ArrowUp, ArrowDown, Calculator, AlertTriangle, Info } from 'lucide-react';

type TipoFinanciero = "Ninguna" | "Presupuesto Base" | "Adjudicación" | "Disponibilidad" | "Contrato" | "Adenda";

type DocumentoLCP = { id: number; name: string; category: string; preTipo?: TipoFinanciero };
const DOCUMENTOS_LCP: DocumentoLCP[] = [
  { id: 1, name: "Solicitud de la unidad usuaria", category: "Inicio", preTipo: "Ninguna" },
  { id: 2, name: "Disponibilidad Presupuestaria", category: "Inicio", preTipo: "Disponibilidad" },
  { id: 3, name: "Autorización de Inicio", category: "Inicio", preTipo: "Ninguna" },
  { id: 4, name: "Presupuesto Base", category: "Inicio", preTipo: "Presupuesto Base" },
  { id: 5, name: "Pliego de Condiciones", category: "Inicio", preTipo: "Ninguna" },
  { id: 10, name: "Informe de Recomendación", category: "Selección", preTipo: "Ninguna" },
  { id: 11, name: "Adjudicación", category: "Selección", preTipo: "Adjudicación" },
  { id: 14, name: "Contrato o Módulo SUCOP", category: "Formalización", preTipo: "Contrato" }
];



const TIPOS_BIENES: string[] = ["Toma Física / Inventario General", "Ingreso / Alta de Bien", "Desincorporación / Baja", "Traspaso o Transferencia Interna", "Corrección de Seriales"];

const ESTADOS_CICLO: string[] = ["Asignada", "En Proceso", "En Revisión", "Culminada"];
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
  id: string;
  nombre: string;
  estado: string;
  vistoBueno: boolean;
  archivosSubidosCount: number;
  fecha?: string;
  tipoFinanciero?: TipoFinanciero;
  montoUsd?: number;
  tasaBcv?: number;
};

type ExpedienteType = {
  id: string;
  nombre: string;
  area: string;
  analistaId?: string;
  procesos: SubProcesoType[];
};

import { createClient } from '@/lib/supabase';

export default function Home() {
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [analistasDB, setAnalistasDB] = useState<any[]>([]);

  const [expedientes, setExpedientes] = useState<ExpedienteType[]>([]);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState<boolean>(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState<boolean>(false);
  const [activeIds, setActiveIds] = useState<{expId: string, procId: string} | null>(null);
  const [analystModalOpen, setAnalystModalOpen] = useState<string | null>(null);

  const [taskName, setTaskName] = useState<string>("");
  const [area, setArea] = useState<"Contrataciones" | "Bienes">("Contrataciones");
  const [selectedAnalista, setSelectedAnalista] = useState<string>("");
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [bienesTipo, setBienesTipo] = useState<string>("");

  const toggleDoc = (id: number) => {
    setSelectedDocs((prev: number[]) => prev.includes(id) ? prev.filter((d: number) => d !== id) : [...prev, id]);
  };

  const [newProcessName, setNewProcessName] = useState<string>("");
  const [newProcessDate, setNewProcessDate] = useState<string>("");
  const [newProcessFinType, setNewProcessFinType] = useState<TipoFinanciero>("Ninguna");
  
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchData = async (user: any) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if(profile) setCurrentUserProfile(profile);

    const { data: analistas } = await supabase.from('profiles').select('*').ilike('role', 'Analista%');
    if(analistas) setAnalistasDB(analistas);

    const { data: exps } = await supabase.from('expedientes').select('*, sub_procesos(*)').order('created_at', { ascending: false });
    
    if (exps) {
      const mappedExps = exps.map((e:any) => ({
        id: e.id,
        nombre: e.nombre,
        area: e.area,
        analistaId: e.analista_id,
        procesos: e.sub_procesos.sort((a:any, b:any) => a.orden_index - b.orden_index).map((p:any) => ({
          id: p.id,
          nombre: p.nombre,
          estado: p.estado,
          vistoBueno: p.visto_bueno,
          archivosSubidosCount: p.archivos_subidos_count,
          fecha: p.fecha_pautada,
          tipoFinanciero: p.tipo_financiero,
          montoUsd: p.monto_usd,
          tasaBcv: p.tasa_bcv
        }))
      }));
      setExpedientes(mappedExps);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login';
      else {
        setSession(session);
        fetchData(session.user);
      }
    });
  }, []);

  const cargasPorAnalista = useMemo(() => {
    const cargas: Record<string, number> = {};
    analistasDB.forEach((a: any) => cargas[a.id] = 0);
    expedientes.forEach((exp: ExpedienteType) => {
      if(exp.analistaId && cargas[exp.analistaId] !== undefined) cargas[exp.analistaId]++;
    });
    return cargas;
  }, [expedientes, analistasDB]);

  const totalVistosBuenos = useMemo(() => {
    let cant = 0;
    expedientes.forEach(e => {
       e.procesos.forEach(p => { if (p.vistoBueno) cant++; });
    });
    return cant;
  }, [expedientes]);

  const getSumaFinanciera = (procesos: SubProcesoType[], tipo: TipoFinanciero) => {
    return procesos.filter(p => p.tipoFinanciero === tipo).reduce((acc, p) => acc + (p.montoUsd || 0), 0);
  };

  const handleCreateExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!session) return;
    
    const { data: nuevoExp, error } = await supabase.from('expedientes').insert({
      nombre: taskName,
      area: area,
      analista_id: selectedAnalista || null,
      created_by: session.user.id
    }).select().single();

    if (error || !nuevoExp) { alert("Error al crear expediente: " + error?.message); return; }

    let subProcesosInsert: any[] = [];
    if(area === "Contrataciones") {
      subProcesosInsert = selectedDocs.map((docId: number, idx: number) => {
        const docInfo = DOCUMENTOS_LCP.find((d: DocumentoLCP) => d.id === docId);
        return {
          expediente_id: nuevoExp.id,
          nombre: docInfo ? docInfo.name : "Proceso",
          orden_index: idx,
          tipo_financiero: docInfo?.preTipo || "Ninguna"
        };
      });
    } else {
      subProcesosInsert = [{
        expediente_id: nuevoExp.id,
        nombre: `Trámite: ${bienesTipo}`,
        orden_index: 0,
        tipo_financiero: "Ninguna"
      }];
    }

    if (subProcesosInsert.length > 0) {
       await supabase.from('sub_procesos').insert(subProcesosInsert);
    }
    
    await fetchData(session.user);
    setIsNewTaskModalOpen(false);
    setSelectedDocs([]);
    setTaskName("");
    setSelectedAnalista("");
    setBienesTipo("");
  };

  const handleCycleStatus = async (expId: string, procId: string) => {
    const exp = expedientes.find(e => e.id === expId);
    if(!exp) return;
    const proc = exp.procesos.find(p => p.id === procId);
    if(!proc) return;

    if(currentUserProfile?.role.startsWith('Jefe')) {
      alert("Nivel de Seguridad: Los Jefes evalúan actos mediante el Visto Bueno, no alteran su estado.");
      return;
    }

    const currentIndex = ESTADOS_CICLO.indexOf(proc.estado);
    const nextIndex = (currentIndex + 1) % ESTADOS_CICLO.length;
    const nextEstado = ESTADOS_CICLO[nextIndex];

    await supabase.from('sub_procesos').update({ estado: nextEstado }).eq('id', procId);
    fetchData(session.user);
  };

  const handleToggleVistoBueno = async (expId: string, procId: string) => {
    const exp = expedientes.find(e => e.id === expId);
    if(!exp) return;
    const proc = exp.procesos.find(p => p.id === procId);
    if(!proc) return;

    if(!currentUserProfile?.role.startsWith('Jefe') && currentUserProfile?.role !== 'Administrador') {
      alert("Sólo las Jefaturas tienen autonomía para impartir un Visto Bueno de verificación.");
      return;
    }

    await supabase.from('sub_procesos').update({ visto_bueno: !proc.vistoBueno }).eq('id', procId);
    fetchData(session.user);
  };

  const handleChangeDate = async (expId: string, procId: string, newDate: string) => {
    await supabase.from('sub_procesos').update({ fecha_pautada: newDate }).eq('id', procId);
    setExpedientes((prev: ExpedienteType[]) => prev.map((exp: ExpedienteType) => {
      if(exp.id !== expId) return exp;
      return {
        ...exp,
        procesos: exp.procesos.map((proc: SubProcesoType) => {
          if(proc.id !== procId) return proc;
          return { ...proc, fecha: newDate };
        })
      };
    }));
  };

  const handleMontoChange = async (expId: string, procId: string, field: 'montoUsd' | 'tasaBcv', value: number) => {
    const dbField = field === 'montoUsd' ? 'monto_usd' : 'tasa_bcv';
    await supabase.from('sub_procesos').update({ [dbField]: value }).eq('id', procId);
    setExpedientes((prev: ExpedienteType[]) => prev.map((exp: ExpedienteType) => {
      if(exp.id !== expId) return exp;
      return {
        ...exp,
        procesos: exp.procesos.map((proc: SubProcesoType) => {
          if(proc.id !== procId) return proc;
          return { ...proc, [field]: value };
        })
      };
    }));
  };

  const handleMoveProceso = async (expId: string, index: number, direction: 'up' | 'down') => {
    const exp = expedientes.find(e => e.id === expId);
    if(!exp) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exp.procesos.length - 1) return;
    
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentProc = exp.procesos[index];
    const targetProc = exp.procesos[targetIndex];
    
    // Swap orden_index on backend
    await supabase.from('sub_procesos').update({ orden_index: targetIndex }).eq('id', currentProc.id);
    await supabase.from('sub_procesos').update({ orden_index: index }).eq('id', targetProc.id);
    
    fetchData(session.user);
  };

  const handleCreateSubProceso = async (expId: string) => {
    if(!newProcessName.trim()) return;
    const exp = expedientes.find(e => e.id === expId);
    if(!exp) return;

    await supabase.from('sub_procesos').insert({
      expediente_id: expId,
      nombre: newProcessName,
      orden_index: exp.procesos.length,
      fecha_pautada: newProcessDate || null,
      tipo_financiero: newProcessFinType,
      monto_usd: newProcessFinType !== "Ninguna" ? 0 : 0,
      tasa_bcv: newProcessFinType !== "Ninguna" ? 36.25 : 36.25
    });

    setNewProcessName("");
    setNewProcessDate("");
    setNewProcessFinType("Ninguna");
    fetchData(session.user);
  };

  const handleDeleteSubProceso = async (expId: string, procId: string) => {
    await supabase.from('sub_procesos').delete().eq('id', procId);
    fetchData(session.user);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFiles((prev: File[]) => [...prev, ...Array.from(e.target.files!)]);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev: File[]) => [...prev, ...Array.from(e.dataTransfer.files!)]);
    }
  };

  const uploadToStorage = async () => {
    if (activeIds !== null && files.length > 0) {
      const proc = expedientes.find(e => e.id === activeIds.expId)?.procesos.find(p => p.id === activeIds.procId);
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${activeIds.expId}/${activeIds.procId}_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('documentos_oficiales').upload(fileName, file);
        if(error) alert(`Error subiendo ${file.name}: ${error.message}`);
      }

      await supabase.from('sub_procesos').update({ archivos_subidos_count: (proc?.archivosSubidosCount || 0) + files.length }).eq('id', activeIds.procId);
      fetchData(session.user);
    }
    setIsFileModalOpen(false);
    setFiles([]);
    setActiveIds(null);
  };

  const formatearMonto = (num: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VEF', minimumFractionDigits: 2 }).format(num).replace('VEF', '');
  };

  return (
    <div className="w-full min-h-full flex flex-col gap-6 relative pb-12">
      
      {/* Indicadores Superiores */}
      <div className="flex justify-between items-center">
        
        {/* Carga de Analistas Widget */}
        <div className="flex gap-4 items-center bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm">
          <div className="text-sm font-black text-slate-700 flex items-center gap-2 pr-2 border-r border-gray-300">
            <Users size={16} /> Carga Operativa
          </div>
          <div className="flex gap-3">
            {analistasDB.map((a: any) => {
              const bgColors = ['bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-teal-500', 'bg-rose-500', 'bg-indigo-500'];
              const bColor = bgColors[a.id.charCodeAt(0) % bgColors.length];
              const nameParts = a.first_name ? [a.first_name, a.last_name] : [a.email];
              const initials = nameParts[0].substring(0, 2).toUpperCase();

              return (
              <div key={a.id} onClick={() => setAnalystModalOpen(a.id)} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-100 transition-all active:scale-95">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${bColor}`}>{initials}</div>
                <span className="text-xs font-semibold text-slate-700">{nameParts[0].split(' ')[0]}</span>
                <span className={`text-xs font-black ${cargasPorAnalista[a.id] > 3 ? 'text-red-500' : 'text-slate-400'}`}>({cargasPorAnalista[a.id]})</span>
              </div>
              );
            })}
          </div>
        </div>

        {/* Global Metric Metric */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-5 py-2.5 rounded-xl shadow-sm text-white">
          <ShieldCheck size={20} className="text-fuchsia-200"/>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-100 leading-none mb-1">Registro de Aprobaciones</span>
            <span className="font-black text-base leading-none">{totalVistosBuenos} Vistos Buenos por Jefatura</span>
          </div>
        </div>

      </div>

      {/* Controles de búsqueda */}
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

      {/* Tabla Maestro-Detalle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto overflow-y-visible">
        <div className="min-w-[1160px] inline-block w-full">
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
          {expedientes.map((expediente: ExpedienteType) => {
            const isExpanded = expandedRow === expediente.id;
            const culminados = expediente.procesos.filter((p: SubProcesoType) => p.estado === 'Culminada').length;
            const isGlobalCompleted = expediente.procesos.length > 0 && culminados === expediente.procesos.length;

            const sPresupuesto = getSumaFinanciera(expediente.procesos, "Presupuesto Base");
            const sAdjudicacion = getSumaFinanciera(expediente.procesos, "Adjudicación");
            const sDisponibilidades = getSumaFinanciera(expediente.procesos, "Disponibilidad");

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
                     {expediente.analistaId ? (
                        <div className="flex items-center gap-2 w-full justify-center" title="Delegado">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm bg-blue-500`}>
                            {analistasDB.find((a:any) => a.id === expediente.analistaId)?.first_name?.substring(0,2).toUpperCase() || 'OP'}
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
                      <div className="w-[130px] py-1.5 px-3 text-center border-r border-gray-200/50">Fecha Pautada</div>
                      <div className="w-[110px] py-1.5 px-3 text-center border-r border-gray-200/50 text-fuchsia-600">Revisión Jefe</div>
                      <div className="w-[125px] py-1.5 px-3 text-center border-r border-gray-200/50">Estado Interno</div>
                      <div className="w-[130px] py-1.5 px-3 text-center border-r border-gray-200/50">Documentos</div>
                      <div className="w-[100px] py-1.5 text-center px-1 text-[10px] flex items-center justify-center">Reorganizar</div>
                    </div>

                    {expediente.procesos.map((proceso: SubProcesoType, pIndex: number) => {
                      const mUsd = proceso.montoUsd || 0;
                      const mBs = mUsd * (proceso.tasaBcv || 0);

                      let errorAlert = null;
                      if (proceso.tipoFinanciero === "Adjudicación" && mUsd > sPresupuesto) {
                        errorAlert = "Límite: Supera Presupuesto Base";
                      } else if (proceso.tipoFinanciero === "Disponibilidad" && sDisponibilidades > sAdjudicacion) {
                        errorAlert = "Límite: Supera Adjudicación Total";
                      } else if (proceso.tipoFinanciero === "Contrato" && mUsd > sDisponibilidades) {
                        errorAlert = "Límite: Supera Disponibilidad";
                      } else if (proceso.tipoFinanciero === "Adenda" && mUsd > sDisponibilidades) {
                        errorAlert = "Límite: Sume Adendas > Disponibilidad"; // Ideal checking would be Contrato+Adendas vs Disp, but simplified
                      }

                      return (
                        <React.Fragment key={proceso.id}>
                          {/* Fila Estándar Del Acto */}
                          <div className={`flex w-full group transition-colors border-b border-gray-200/40 leading-[2.6rem] pl-[50px] ${proceso.tipoFinanciero !== "Ninguna" ? 'bg-indigo-50/10' : 'hover:bg-white'}`}>
                            <div className="w-[5px] bg-slate-300 group-hover:bg-indigo-300"></div>
                            
                            <div className="flex-1 px-5 border-r border-gray-200/50 font-medium text-slate-700 text-sm flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full border border-slate-400"></div>
                              {proceso.nombre}
                            </div>

                            {/* Fecha Setter */}
                            <div className="w-[130px] border-r border-gray-200/50 flex items-center justify-center hover:bg-white transition-colors px-1">
                               <input 
                                 type="date" 
                                 value={proceso.fecha || ""} 
                                 onChange={(e) => handleChangeDate(expediente.id, proceso.id, e.target.value)}
                                 className="text-xs text-slate-700 bg-transparent border border-transparent focus:border-indigo-300 rounded focus:ring-0 max-w-[120px] transition-colors"
                               />
                            </div>
                            
                            <div className="w-[110px] border-r border-gray-200/50 flex items-center justify-center bg-fuchsia-50/10 hover:bg-fuchsia-50 transition-colors">
                               <button 
                                 onClick={() => handleToggleVistoBueno(expediente.id, proceso.id)} 
                                 className={`text-xs font-bold px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all outline-none ${proceso.vistoBueno ? 'bg-fuchsia-600 text-white border-fuchsia-600' : 'bg-white text-fuchsia-600 border-fuchsia-200 hover:border-fuchsia-400 hover:bg-fuchsia-50'}`}
                               >
                                 {proceso.vistoBueno ? <CheckCircle2 size={14} /> : <Circle size={14} />} V.B.
                               </button>
                            </div>

                            <div onClick={() => handleCycleStatus(expediente.id, proceso.id)} className={`w-[125px] border-r text-xs border-white text-white font-semibold text-center hover:opacity-90 cursor-pointer transition-colors ${getColorEstado(proceso.estado)}`}>
                              {proceso.estado}
                            </div>
                            
                            <div className="w-[130px] flex items-center border-r border-gray-200/50 justify-center group-hover:bg-blue-50/20 transition-colors relative px-2">
                              {proceso.estado === "Culminada" ? (
                                proceso.archivosSubidosCount > 0 ? (
                                  <button onClick={() => { setActiveIds({expId: expediente.id, procId: proceso.id}); setIsFileModalOpen(true); }} className="text-xs flex items-center justify-center w-full gap-1.5 font-bold px-2 py-1 my-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 border border-blue-200"><FileText size={12} /> {proceso.archivosSubidosCount} Ver PDFs</button>
                                ) : (
                                  <button onClick={() => { setActiveIds({expId: expediente.id, procId: proceso.id}); setIsFileModalOpen(true); }} className="text-xs flex items-center justify-center w-full gap-1.5 font-bold px-2 py-1 my-1 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 border border-emerald-200"><FileText size={12} /> Anexar PDF</button>
                                )
                              ) : (
                                <span className="text-[10px] text-gray-400 font-bold uppercase cursor-not-allowed text-center leading-tight mt-1">Status Cero</span>
                              )}
                            </div>

                            {/* Mecanismos de Reordenamiento y Eliminación */}
                            <div className="w-[100px] flex items-center justify-center gap-1.5 px-3 bg-gray-50/50 border-gray-100 border-l group-hover:bg-indigo-50/20">
                              <button onClick={() => handleMoveProceso(expediente.id, pIndex, 'up')} disabled={pIndex === 0} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 p-1 rounded transition-colors disabled:opacity-20"><ArrowUp size={14}/></button>
                              <button onClick={() => handleMoveProceso(expediente.id, pIndex, 'down')} disabled={pIndex === expediente.procesos.length - 1} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 p-1 rounded transition-colors disabled:opacity-20"><ArrowDown size={14}/></button>
                              
                              <div className="w-px h-6 bg-gray-200 mx-1"></div>
                              
                              <button onClick={() => handleDeleteSubProceso(expediente.id, proceso.id)} title="Eliminar este Acto" className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors outline-none"><Trash2 size={15} /></button>
                            </div>
                          </div>

                          {/* Sub-Panel Financiero Desplegable para Actos Contables */}
                          {proceso.tipoFinanciero && proceso.tipoFinanciero !== "Ninguna" && (
                            <div className={`flex w-full ${errorAlert ? 'bg-red-50/80 shadow-inner' : 'bg-slate-100/60 shadow-inner'} border-b border-gray-200/80 pl-[70px] pr-6 py-2.5 pb-3 transition-colors`}>
                               <div className={`flex flex-1 flex-wrap lg:flex-nowrap items-center gap-4 px-4 py-2 bg-white border ${errorAlert ? 'border-red-300' : 'border-gray-200'} rounded-lg shadow-sm w-full`}>
                                  
                                  {/* Etiqueta */}
                                  <div className="flex items-center gap-2 w-48 border-r pr-2 border-gray-100">
                                     <Calculator size={16} className={errorAlert ? "text-red-500" : "text-emerald-600"} />
                                     <span className="text-xs font-bold text-slate-600 uppercase tracking-wide leading-tight">{proceso.tipoFinanciero}</span>
                                  </div>

                                  {/* Input Dólares */}
                                  <div className="flex flex-col flex-1 max-w-[160px]">
                                      <span className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">Asignación USD ($)</span>
                                      <div className="relative">
                                        <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-bold ${errorAlert ? 'text-red-500' : 'text-emerald-600'}`}>$</span>
                                        <input type="number" 
                                               value={proceso.montoUsd || ""} 
                                               onChange={(e) => handleMontoChange(expediente.id, proceso.id, 'montoUsd', Number(e.target.value))}
                                               className={`w-full text-sm font-semibold pl-6 pr-2 py-1 focus:outline-none focus:ring-1 rounded-md border ${errorAlert ? 'bg-red-50 border-red-300 focus:border-red-500 text-red-900 focus:ring-red-500' : 'bg-gray-50 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-slate-800'}`} />
                                      </div>
                                  </div>

                                  <div className="text-gray-300 hidden lg:block"><X size={12} /></div>

                                  {/* Input Tasa */}
                                  <div className="flex flex-col flex-1 max-w-[120px]">
                                      <span className="text-[10px] font-bold uppercase text-gray-500 mb-0.5">Tasa BCV (Bs/$)</span>
                                      <div className="relative">
                                        <input type="number" 
                                               value={proceso.tasaBcv || ""} 
                                               onChange={(e) => handleMontoChange(expediente.id, proceso.id, 'tasaBcv', Number(e.target.value))}
                                               className="w-full text-sm font-semibold px-2 py-1 bg-gray-50 border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-md text-slate-800" />
                                      </div>
                                  </div>

                                  <div className="font-bold text-gray-300 hidden lg:block">=</div>

                                  {/* Resultado BS */}
                                  <div className="flex flex-col flex-1 max-w-[160px] bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
                                      <span className="text-[10px] font-bold uppercase text-slate-500 mb-0.5">Total Bolívares (Bs)</span>
                                      <span className="text-sm font-black text-slate-800">Bs. {formatearMonto(mBs)}</span>
                                  </div>

                                  {/* Warning Condicional */}
                                  {errorAlert && (
                                    <div className="flex items-center gap-1.5 ml-auto text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded flex-shrink-0 animate-pulse">
                                       <AlertTriangle size={14} /> {errorAlert}
                                    </div>
                                  )}
                                  
                                  {!errorAlert && proceso.montoUsd! > 0 && (
                                    <div className="flex items-center gap-1.5 ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded flex-shrink-0">
                                       <CheckCircle2 size={14} /> Aprobado Contablemente
                                    </div>
                                  )}
                               </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}

                    <div className="flex w-full px-6 pl-[55px] mt-4">
                      <form className="flex w-full items-center gap-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 shadow-sm" onSubmit={(e) => { e.preventDefault(); handleCreateSubProceso(expediente.id); }}>
                         <div className="flex flex-col">
                           <span className="text-[10px] font-bold uppercase text-indigo-800 ml-1 mb-1">Nombre Libre</span>
                           <input type="text" placeholder="Ej. Presentación Oficio Legal" value={newProcessName} onChange={e => setNewProcessName(e.target.value)} className="w-[300px] text-xs px-3 py-2 bg-white border border-gray-300 focus:outline-none focus:border-indigo-500 rounded-md transition-colors shadow-sm" />
                         </div>
                         
                         <div className="flex flex-col">
                           <span className="text-[10px] font-bold uppercase text-indigo-800 ml-1 mb-1">Fecha</span>
                           <input type="date" value={newProcessDate} onChange={e => setNewProcessDate(e.target.value)} title="Fecha Estimada" className="w-[125px] text-xs px-3 py-2 bg-white border border-gray-300 text-slate-700 focus:outline-none focus:border-indigo-500 rounded-md shadow-sm transition-colors cursor-pointer" />
                         </div>

                         <div className="flex flex-col flex-1 pl-2 border-l border-indigo-200">
                           <span className="text-[10px] font-bold uppercase text-indigo-800 ml-1 mb-1 flex items-center gap-1"><Calculator size={10} /> Naturaleza Financiera</span>
                           <select value={newProcessFinType} onChange={e => setNewProcessFinType(e.target.value as TipoFinanciero)} className="w-full text-xs px-3 py-2 bg-white border border-gray-300 text-slate-700 focus:outline-none focus:border-indigo-500 rounded-md shadow-sm">
                             <option value="Ninguna">-- Actividad Regular --</option>
                             <option value="Presupuesto Base">Monto Madre: Presupuesto Base ($)</option>
                             <option value="Adjudicación">Monto Aprobado: Adjudicación ($)</option>
                             <option value="Disponibilidad">Bloqueo: Disponibilidad Acumulativa ($)</option>
                             <option value="Contrato">Monto Legal: Contrato Oficial ($)</option>
                             <option value="Adenda">Anexo: Adenda Cuentas Extra ($)</option>
                           </select>
                         </div>
                         
                         <button type="submit" disabled={!newProcessName} className="text-xs bg-indigo-600 text-white font-bold px-6 py-2 h-max self-end rounded-md hover:bg-indigo-700 shadow-sm disabled:opacity-50 mt-4">Inyectar Acto</button>
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
                    {analistasDB.map((a: any) => <option key={a.id} value={a.id}>{a.first_name || a.email} ({cargasPorAnalista[a.id]} expedientes en curso)</option>)}
                  </select>
                </div>

                {area === 'Contrataciones' && (
                  <div className="pt-2">
                    <label className="block text-sm font-bold text-slate-800 flex items-center gap-2 mb-2 border-b pb-2">Selecciona la Base del Checklist Legal LCP <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{selectedDocs.length} marcados</span></label>
                    <div className="flex bg-blue-50/50 border border-blue-100 p-2 rounded-lg mb-3">
                      <Info size={14} className="text-blue-500 mt-0.5 mr-2" />
                      <p className="text-[10px] text-blue-800 font-medium">Nota: Los documentos marcados de fábrica como financieros llevarán auto-integrada la calculadora BCV dentro del expediente.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {DOCUMENTOS_LCP.map((doc: DocumentoLCP) => {
                        const isSelected = selectedDocs.includes(doc.id);
                        return (
                          <div key={doc.id} onClick={() => toggleDoc(doc.id)} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer relative ${isSelected ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                            <div className={isSelected ? 'text-indigo-600' : 'text-gray-300'}>{isSelected ? <CheckCircle2 size={18} /> : <Circle size={18} />}</div>
                            <div className="flex flex-col">
                              <span className={`text-xs font-medium leading-tight ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{doc.name}</span>
                              {doc.preTipo !== "Ninguna" && <span className="text-[9px] font-bold text-emerald-600 mt-1 uppercase"><Calculator size={8} className="inline mr-0.5"/> Naturaleza Matemática</span>}
                            </div>
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
                      {TIPOS_BIENES.map((tb: string) => <option key={tb} value={tb}>{tb}</option>)}
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
                {files.map((file: File, i: number) => (
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

      {/* MODAL 3: Detalles del Analista */}
      {analystModalOpen !== null && (
        <div className="absolute z-50 inset-0 -mx-8 -my-8 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl w-[500px] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-blue-500`}>
                  {analistasDB.find((a: any) => a.id === analystModalOpen)?.first_name?.substring(0, 2).toUpperCase() || 'OP'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{analistasDB.find((a: any) => a.id === analystModalOpen)?.first_name || analistasDB.find((a: any) => a.id === analystModalOpen)?.email}</h3>
                  <p className="text-xs text-gray-500 font-medium">Asignaciones en curso: {cargasPorAnalista[analystModalOpen]}</p>
                </div>
              </div>
              <button onClick={() => setAnalystModalOpen(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors"><X size={18}/></button>
            </div>

            <div className="overflow-y-auto max-h-[50vh] pr-2 space-y-3">
              {expedientes.filter((e: ExpedienteType) => e.analistaId === analystModalOpen).length > 0 ? (
                expedientes.filter((e: ExpedienteType) => e.analistaId === analystModalOpen).map((exp: ExpedienteType) => {
                  const culminados = exp.procesos.filter((p: SubProcesoType) => p.estado === 'Culminada').length;
                  const total = exp.procesos.length;
                  const isGlobalCompleted = total > 0 && culminados === total;
                  return (
                    <div key={exp.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-700 leading-tight pr-4">{exp.nombre}</h4>
                        {isGlobalCompleted ? (
                           <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                           <div className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                             {culminados}/{total} Listos
                           </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                        {exp.area === "Contrataciones" ? <FileText size={12} /> : <Package size={12}/>}
                        {exp.area}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400">
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2"><CheckCircle2 size={24} className="text-gray-300" /></div>
                   <p className="text-sm font-medium">No tiene expedientes activos asignados</p>
                </div>
              )}
            </div>
            
            <button onClick={() => setAnalystModalOpen(null)} className="mt-6 w-full py-2.5 bg-slate-800 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-700 transition-colors">
              Cerrar Vista
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
