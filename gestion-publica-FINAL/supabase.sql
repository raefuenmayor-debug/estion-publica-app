-- Esquema de Base de Datos para Sistema COP (Supabase) - Arquitectura Jerárquica

-- 0. Limpieza (Wipe de tablas viejas/existentes)
DROP TABLE IF EXISTS task_checklists CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS sub_procesos CASCADE;
DROP TABLE IF EXISTS expedientes CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles (Jerarquía Triple: Administrador > Jefe > Analista)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (
    role IN (
      'Administrador', 
      'Jefe de Contrataciones', 
      'Jefe de Bienes', 
      'Analista de Contrataciones', 
      'Analista de Bienes'
    )
  ) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla Principal de Expedientes
CREATE TABLE expedientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  area TEXT CHECK (area IN ('Contrataciones', 'Bienes')) NOT NULL,
  analista_id UUID REFERENCES profiles(id), -- A quien se le delegó el componente operativo
  created_by UUID REFERENCES profiles(id) NOT NULL, -- Quien lo formalizó en sistema
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Sub-Procesos Administrativos (Los Actos dentro de un Expediente)
CREATE TABLE sub_procesos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  estado TEXT CHECK (estado IN ('Asignada', 'En Proceso', 'En Revisión', 'Culminada')) DEFAULT 'Asignada',
  visto_bueno BOOLEAN DEFAULT false,
  fecha_pautada DATE,
  orden_index INTEGER NOT NULL,
  tipo_financiero TEXT CHECK (tipo_financiero IN ('Ninguna', 'Presupuesto Base', 'Adjudicación', 'Disponibilidad', 'Contrato', 'Adenda')) DEFAULT 'Ninguna',
  monto_usd NUMERIC(15,2) DEFAULT 0,
  tasa_bcv NUMERIC(10,2) DEFAULT 36.25,
  archivos_subidos_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STORAGE: Bucket Reservado para Documentos PDF Oficiales
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_oficiales', 'documentos_oficiales', false) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 6. MATRIZ DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_procesos ENABLE ROW LEVEL SECURITY;

-- REGLA 1: Profiles
-- Todos pueden ver los perfiles para poder asignar expedientes.
CREATE POLICY "Directorio visible para personal autenticado" ON profiles FOR SELECT USING (auth.role() = 'authenticated');

-- REGLA 1B: SÓLO EL ADMINISTRADOR puede crear (invitar) nuevos usuarios y editar sus roles.
CREATE POLICY "Exclusivo Administrador para crear y editar usuarios" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Administrador')
);

-- REGLA 2: Expedientes
-- A) El Administrador lo ve TODO.
CREATE POLICY "Admin ve todos los expedientes" ON expedientes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Administrador')
);

-- B) Los Jefes ven SÓLO los de su área respectiva.
CREATE POLICY "Jefes ven su area asignada" ON expedientes FOR SELECT USING (
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Contrataciones') AND area = 'Contrataciones')
  OR
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Bienes') AND area = 'Bienes')
);

CREATE POLICY "Jefes pueden actualizar sus areas" ON expedientes FOR UPDATE USING (
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Contrataciones') AND area = 'Contrataciones')
  OR
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Bienes') AND area = 'Bienes')
);

CREATE POLICY "Jefes pueden crear en sus areas" ON expedientes FOR INSERT WITH CHECK (
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Contrataciones') AND area = 'Contrataciones')
  OR
  (EXISTS (SELECT 1 FROM profiles AS p WHERE p.id = auth.uid() AND p.role = 'Jefe de Bienes') AND area = 'Bienes')
);

-- C) Los Analistas SÓLO ven expedientes que específicamente se les hayan delegado (analista_id = auth.uid()).
CREATE POLICY "Analistas ven solo su carga operativa" ON expedientes FOR SELECT USING (
  analista_id = auth.uid()
);

CREATE POLICY "Analistas editan solo su carga operativa" ON expedientes FOR UPDATE USING (
  analista_id = auth.uid()
);

-- REGLA 3: Sub-Procesos
-- Los subprocesos se heredan: Si puedes ver el expediente, puedes ver los subprocesos.
CREATE POLICY "Subprocesos visibles por herencia del expediente" ON sub_procesos FOR SELECT USING (
  EXISTS (SELECT 1 FROM expedientes e WHERE e.id = sub_procesos.expediente_id)
);

CREATE POLICY "Insercion, actualizacion y borrado de procesos" ON sub_procesos FOR ALL USING (
  EXISTS (SELECT 1 FROM expedientes e WHERE e.id = sub_procesos.expediente_id)
);

-- REGLA 4: STORAGE SECURITY
-- Primero limpiamos politicas viejas si existen
DROP POLICY IF EXISTS "Autenticados suben archivos" ON storage.objects;
DROP POLICY IF EXISTS "Autenticados visuliazan documentos oficiales" ON storage.objects;
DROP POLICY IF EXISTS "Admins y Asignados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Visualización de archivos de verificación" ON storage.objects;

-- Todos pueden insertar o ver si estan autenticados
CREATE POLICY "Autenticados suben archivos" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'documentos_oficiales' AND auth.role() = 'authenticated');
CREATE POLICY "Autenticados visuliazan documentos oficiales" ON storage.objects FOR SELECT USING ( bucket_id = 'documentos_oficiales' AND auth.role() = 'authenticated');
