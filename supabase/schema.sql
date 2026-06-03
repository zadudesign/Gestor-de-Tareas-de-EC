-- 1. Tipos de Datos (Enums)
CREATE TYPE public.user_role AS ENUM ('admin', 'member');
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed');

-- 2. Tabla de Perfiles (Se extiende auth.users de Supabase)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Tareas
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'pending' NOT NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  google_calendar_event_id TEXT, -- Para vincular con el evento de GCal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla de Notificaciones (Tiempo Real)
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) - Seguridad de base de datos
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Ejemplo)
-- Perfiles: Todos pueden leer perfiles, solo uno mismo puede editar el suyo o un admin.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

-- Tareas: Todo el mundo puede ver las tareas
CREATE POLICY "Tasks are viewable by everyone." 
  ON public.tasks FOR SELECT USING (true);

-- Función para manejar timestamps en update de tasks
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Función automática para crear perfil al registrar usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Tabla de Proyectos (proyectos_ec)
CREATE TABLE public.proyectos_ec (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) para proyectos_ec
ALTER TABLE public.proyectos_ec ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas para proyectos_ec (Ejemplo: Todos públicos)
CREATE POLICY "Proyectos viewable by everyone." 
  ON public.proyectos_ec FOR SELECT USING (true);

-- 6. Tabla de Tareas del Proyecto (notificaciones_tareas)
CREATE TABLE public.notificaciones_tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto UUID REFERENCES public.proyectos_ec(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'pending' NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) para notificaciones_tareas
ALTER TABLE public.notificaciones_tareas ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas para notificaciones_tareas
CREATE POLICY "notificaciones_tareas viewable by everyone." 
  ON public.notificaciones_tareas FOR SELECT USING (true);

-- Trigger para updated_at en notificaciones_tareas
CREATE TRIGGER notificaciones_tareas_updated_at
  BEFORE UPDATE ON public.notificaciones_tareas
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- 7. Tabla de Configuración de Tarifas (configuracion_tarifas)
CREATE TABLE public.configuracion_tarifas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_tipo TEXT UNIQUE NOT NULL,
  valor NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) para configuracion_tarifas
ALTER TABLE public.configuracion_tarifas ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas para configuracion_tarifas
CREATE POLICY "configuracion_tarifas viewable by everyone." 
  ON public.configuracion_tarifas FOR SELECT USING (true);
CREATE POLICY "configuracion_tarifas insertable by everyone." 
  ON public.configuracion_tarifas FOR INSERT WITH CHECK (true);
CREATE POLICY "configuracion_tarifas updatable by everyone." 
  ON public.configuracion_tarifas FOR UPDATE USING (true);

-- Trigger para updated_at en configuracion_tarifas
CREATE TRIGGER configuracion_tarifas_updated_at
  BEFORE UPDATE ON public.configuracion_tarifas
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Trigger para updated_at (requiere añadir columna updated_at si se desea, por ahora solo created_at está)

