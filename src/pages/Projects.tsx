import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProyectoEC } from '../types';
import { Plus, Search, Filter, MoreVertical, Calendar as CalendarIcon, Loader2, FolderGit2 } from 'lucide-react';
import { CreateProjectModal } from '../components/CreateProjectModal';

export default function Projects() {
  const [projects, setProjects] = useState<ProyectoEC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
    checkAuth();

    // Suscripción en tiempo real a la tabla proyectos_ec
    const channel = supabase
      .channel('proyectos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'proyectos_ec',
        },
        (payload) => {
          console.log('Cambio detectado:', payload);
          if (payload.eventType === 'INSERT') {
            setProjects((prev) => [payload.new as ProyectoEC, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setProjects((prev) =>
              prev.map((p) => (p.id === payload.new.id ? (payload.new as ProyectoEC) : p))
            );
          }
        }
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
      const { data, error } = await supabase
        .from('proyectos_ec')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'No se pudieron cargar los proyectos. Verifica la conexión a Supabase.');
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">Activo</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">Completado</span>;
      case 'on_hold':
        return <span className="px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">En Pausa</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-full border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Proyectos</h1>
          <p className="text-slate-500 mt-1">Gestiona los proyectos del área de Educación Continua.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar proyectos..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="inline-flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg border border-slate-300 font-medium transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="font-medium">Cargando proyectos...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Hubo un problema</h3>
            <p className="text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-4">
              <FolderGit2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No hay proyectos</h3>
            <p className="text-slate-500 max-w-sm mb-6">Aún no se han creado proyectos. Comienza añadiendo uno nuevo.</p>
            {isAdmin && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg border border-slate-300 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear el primer proyecto</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nombre del Proyecto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha de Inicio</th>
                  <th className="px-6 py-4">Fecha de Fin</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{project.name}</div>
                      {project.description && (
                        <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{project.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(project.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.start_date || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.end_date || 'N/A'}</span>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      <CreateProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
