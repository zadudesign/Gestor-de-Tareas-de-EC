import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProyectoEC, NotificacionTarea } from '../types';
import { Plus, Search, Filter, MoreVertical, Loader2, FolderGit2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';

interface ProyectoWithTasks extends ProyectoEC {
  notificaciones_tareas: { count: number }[];
}

export default function Projects() {
  const [projects, setProjects] = useState<ProyectoWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [projectTasks, setProjectTasks] = useState<Record<string, NotificacionTarea[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
    checkAuth();

    const channel = supabase
      .channel('proyectos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'proyectos_ec' },
        () => fetchProjects()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  }

  async function fetchProjects() {
    try {
      setLoading(true);
      // Simplificamos la consulta para evitar el error de relación si no está propagado en Supabase
      const { data, error } = await supabase
        .from('proyectos_ec')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Inicializamos notificaciones_tareas como un arreglo vacío para evitar errores de renderizado
      const projectsWithData = (data || []).map(p => ({
        ...p,
        notificaciones_tareas: [] 
      }));

      setProjects(projectsWithData as ProyectoWithTasks[]);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Error al conectar con la base de datos. Asegúrate de haber ejecutado el SQL en Supabase.');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasksForProject(projectId: string) {
    if (projectTasks[projectId]) return;
    
    setLoadingTasks(projectId);
    try {
      const { data, error } = await supabase
        .from('notificaciones_tareas')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjectTasks(prev => ({ ...prev, [projectId]: data || [] }));
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(null);
    }
  }

  const toggleExpand = (projectId: string) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      fetchTasksForProject(projectId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">Activo</span>;
      case 'completed':
        return <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Completado</span>;
      case 'on_hold':
        return <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">En Pausa</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proyectos</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-bold tracking-widest">Educación Continua</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            <p className="font-medium">Sincronizando con Supabase...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-600 mb-4 border border-red-100">
              <FolderGit2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Error de Conexión</h3>
            <p className="text-slate-600 max-w-md mx-auto">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6">
              <FolderGit2 className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sin Proyectos Registrados</h3>
            <p className="text-slate-500 max-w-sm mb-8 text-sm">Comienza registrando tu primer proyecto para gestionar sus tareas asociadas.</p>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Crear Primer Proyecto
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12"></th>
                  <th className="px-6 py-4">Proyecto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Tareas Asociadas</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <React.Fragment key={project.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => toggleExpand(project.id)}>
                      <td className="px-6 py-4">
                        {expandedProject === project.id ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{project.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-300" />
                          <span className="font-medium text-slate-600">{project.notificaciones_tareas?.[0]?.count || 0} tareas</span>
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-300 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-all">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                    {expandedProject === project.id && (
                      <tr className="bg-slate-50/30">
                        <td colSpan={isAdmin ? 5 : 4} className="px-12 py-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tareas del Proyecto</h4>
                              {isAdmin && (
                                <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest">
                                  + Agregar Tarea
                                </button>
                              )}
                            </div>
                            
                            {loadingTasks === project.id ? (
                              <div className="flex items-center text-xs text-slate-400 py-4">
                                <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                Cargando tareas...
                              </div>
                            ) : projectTasks[project.id]?.length === 0 ? (
                              <div className="py-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                <p className="text-xs text-slate-400">No hay tareas asociadas a este proyecto.</p>
                              </div>
                            ) : (
                              <div className="grid gap-2">
                                {projectTasks[project.id]?.map((task) => (
                                  <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                      <span className="text-sm font-medium text-slate-700">{task.title}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-300 group-hover:text-slate-400 transition-colors uppercase font-bold">
                                      {task.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
