import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, Users, Building, Shield, Loader2 } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Verificamos el rol real en la tabla profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        navigate('/');
        return;
      }

      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        console.warn('Acceso denegado: Se requiere rol de administrador.');
        navigate('/'); // Redirigir si no es admin
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
        <p className="text-slate-500 mt-1">Panel de administración para el Equipo de Educación Continua.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Gestión de Usuarios</h3>
            <p className="text-sm text-slate-500 mt-1">Invita miembros, asigna roles y gestiona accesos.</p>
            <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">Administrar &rarr;</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Datos de la Institución</h3>
            <p className="text-sm text-slate-500 mt-1">Configura detalles generales y personalización.</p>
            <button className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">Editar &rarr;</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
          <div className="bg-emerald-100 text-emerald-600 p-3 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Seguridad</h3>
            <p className="text-sm text-slate-500 mt-1">Políticas de acceso y configuración de sesiones.</p>
            <button className="mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700">Configurar &rarr;</button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-8">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center"><SettingsIcon className="w-5 h-5 mr-2 text-slate-400" /> Preferencias Generales</h3>
        <p className="text-slate-500 text-sm">Aquí se agregarán más opciones de configuración del sistema como integración de correos, notificaciones por defecto, etc.</p>
      </div>
    </div>
  );
}
