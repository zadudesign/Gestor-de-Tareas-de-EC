export type UserRole = 'admin' | 'member';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ProjectStatus = 'active' | 'completed' | 'on_hold';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface ProyectoEC {
  id: string;
  nombre: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface NotificacionTarea {
  id: string;
  proyecto: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConfiguracionTarifa {
  id: string;
  nombre_tipo: string;
  valor: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignee_id: string | null;
  creator_id: string | null;
  due_date: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}
