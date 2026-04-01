-- Esquema de Base de Datos para Sistema Geogestión (Supabase)

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles (Se alimenta de auth.users a través de un trigger opcional)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('Administrador', 'Usuario-Contrataciones', 'Usuario-Bienes')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Tareas
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT CHECK (area IN ('Contrataciones', 'Bienes')) NOT NULL,
  type TEXT, -- (Para Bienes: Inventario, Entrada, Salida, Correcciones, Transferencias, Desincorporaciones, Enajenaciones)
  status TEXT CHECK (status IN ('Asignada', 'En Proceso', 'En Revisión', 'Culminada')) DEFAULT 'Asignada',
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  start_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  verification_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Checklists de Tareas (Específico para Contrataciones)
CREATE TABLE task_checklists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  is_mandatory BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklists ENABLE ROW LEVEL SECURITY;

-- Políticas de Profiles
CREATE POLICY "Public profiles are visible to everyone." ON profiles FOR SELECT USING (true);

-- Políticas de Tareas
CREATE POLICY "Admins pueden ver y editar todas las tareas" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Administrador')
  );

CREATE POLICY "Usuarios ven tareas de su area" ON tasks
  FOR SELECT USING (
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Usuario-Contrataciones') AND area = 'Contrataciones')
    OR
    (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Usuario-Bienes') AND area = 'Bienes')
  );

CREATE POLICY "Usuarios pueden actualizar tareas asignadas a ellos" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid()
  );

-- Políticas de Checklists
CREATE POLICY "Checklists visibles para autorizados de la tarea" ON task_checklists
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_checklists.task_id)
  );

CREATE POLICY "Admins editan checklists" ON task_checklists
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'Administrador')
  );

-- 6. Storage Bucket para Verificaciones
-- Debes ejecutar esto manualmente en SQL Editor o crearlo via Dashboard
INSERT INTO storage.buckets (id, name, public) VALUES ('verifications', 'verifications', false);

CREATE POLICY "Admins y Asignados pueden subir archivos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verifications'
  );

CREATE POLICY "Visualización de archivos de verificación" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verifications'
  );
