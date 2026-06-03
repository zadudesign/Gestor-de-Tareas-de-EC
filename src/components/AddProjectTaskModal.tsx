import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProyectoEC, ConfiguracionTarifa } from '../types';

interface AddProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProjectId?: string | null;
}

export function AddProjectTaskModal({ isOpen, onClose, onSuccess, initialProjectId }: AddProjectTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [projects, setProjects] = useState<ProyectoEC[]>([]);
  const [tariffs, setTariffs] = useState<ConfiguracionTarifa[]>([]);
  
  const [formData, setFormData] = useState({
    proyecto: '',
    tipo_tarifa: '',
    titulo: '',
    descripcion: '',
    fecha_vencimiento: '',
    rol_destino: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        proyecto: initialProjectId || '',
        tipo_tarifa: '',
        titulo: '',
        descripcion: '',
        fecha_vencimiento: '',
        rol_destino: ''
      });
      fetchFormData();
    }
  }, [isOpen, initialProjectId]);

  async function fetchFormData() {
    setDataLoading(true);
    try {
      const [projectsRes, tariffsRes] = await Promise.all([
        supabase.from('proyectos_ec').select('*').order('nombre'),
        supabase.from('configuracion_tarifas').select('*').order('nombre_tipo')
      ]);
      
      if (projectsRes.error) throw projectsRes.error;
      if (tariffsRes.error) throw tariffsRes.error;
      
      setProjects(projectsRes.data || []);
      setTariffs(tariffsRes.data || []);
    } catch (error) {
      console.error('Error fetching data for modal:', error);
    } finally {
      setDataLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Construir el objeto a insertar, asegurando que si fecha_vencimiento está vacío lo ignoramos
      const taskObj: any = {
        proyecto: formData.proyecto,
        titulo: formData.titulo,
        descripcion: formData.descripcion || null,
        tipo_tarifa: formData.tipo_tarifa || null,
        rol_destino: formData.rol_destino || null,
        status: 'pending'
      };
      
      if (formData.fecha_vencimiento) {
        taskObj.fecha_vencimiento = new Date(formData.fecha_vencimiento).toISOString();
      }

      const { error } = await supabase
        .from('notificaciones_tareas')
        .insert([taskObj]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Error al crear la tarea: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Agregar Nueva Tarea</h2>
            <p className="text-sm text-slate-500 mt-1">Crea una tarea y asóciala a un proyecto.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dataLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Proyecto *
              </label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={formData.proyecto}
                onChange={e => setFormData({ ...formData, proyecto: e.target.value })}
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tarea (Título) *
              </label>
              <input
                required
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                placeholder="Ej. Revisión de documentos"
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tarifa
              </label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={formData.tipo_tarifa}
                onChange={e => setFormData({ ...formData, tipo_tarifa: e.target.value })}
              >
                <option value="">Selecciona una tarifa...</option>
                {tariffs.map(t => (
                  <option key={t.id} value={t.id}>{t.nombre_tipo} (${t.tarifa_hora})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Team Responsable
              </label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={formData.rol_destino}
                onChange={e => setFormData({ ...formData, rol_destino: e.target.value })}
              >
                <option value="">Selecciona un rol...</option>
                <option value="Diseño">Diseño</option>
                <option value="Soporte">Soporte</option>
                <option value="Multimedia">Multimedia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Fecha de Entrega
              </label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                value={formData.fecha_vencimiento}
                onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Detalle
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                placeholder="Detalle adicional de la tarea..."
                rows={3}
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Crear Tarea
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
