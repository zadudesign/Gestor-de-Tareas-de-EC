import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ConfiguracionTarifa } from '../types';
import { Loader2, Plus, Trash2, Edit2, Check, X, DollarSign } from 'lucide-react';

export function TariffsConfig() {
  const [tariffs, setTariffs] = useState<ConfiguracionTarifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ nombre_tipo: string; valor: number }>({ nombre_tipo: '', valor: 0 });
  const [isAdding, setIsAdding] = useState(false);
  const [newTariff, setNewTariff] = useState({ nombre_tipo: '', valor: 0 });

  useEffect(() => {
    fetchTariffs();
  }, []);

  async function fetchTariffs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracion_tarifas')
        .select('*')
        .order('nombre_tipo', { ascending: true });

      if (error) throw error;
      setTariffs(data || []);
    } catch (error) {
      console.error('Error fetching tariffs:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!newTariff.nombre_tipo.trim()) return;
    try {
      setActionLoading(true);
      const { data, error } = await supabase
        .from('configuracion_tarifas')
        .insert([{ nombre_tipo: newTariff.nombre_tipo.trim(), valor: newTariff.valor }])
        .select()
        .single();
      
      if (error) throw error;
      setTariffs(prev => [...prev, data]);
      setIsAdding(false);
      setNewTariff({ nombre_tipo: '', valor: 0 });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValues.nombre_tipo.trim()) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('configuracion_tarifas')
        .update({ nombre_tipo: editValues.nombre_tipo.trim(), valor: editValues.valor })
        .eq('id', id);

      if (error) throw error;
      
      setTariffs(prev =>
        prev.map(t => (t.id === id ? { ...t, nombre_tipo: editValues.nombre_tipo.trim(), valor: editValues.valor } : t))
      );
      setEditingId(null);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta tarifa?')) return;
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('configuracion_tarifas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTariffs(prev => prev.filter(t => t.id !== id));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-slate-400" />
            Tarifas por Tipo de Tarea
          </h3>
          <p className="text-slate-500 text-sm mt-1">Configura el valor a pagar por cada tipo de tarea.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Tarifa</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isAdding && (
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <input
              type="text"
              placeholder="Nombre del tipo de tarea..."
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTariff.nombre_tipo}
              onChange={e => setNewTariff(prev => ({ ...prev, nombre_tipo: e.target.value }))}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="number"
                placeholder="Valor"
                className="w-32 pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newTariff.valor}
                onChange={e => setNewTariff(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleAdd}
                disabled={actionLoading}
                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsAdding(false)}
                disabled={actionLoading}
                className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {tariffs.map((tarifa, index) => (
          <div key={tarifa.id || index} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            {editingId === tarifa.id ? (
              <div className="flex items-center gap-3 w-full">
                <input
                  type="text"
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editValues.nombre_tipo}
                  onChange={e => setEditValues(prev => ({ ...prev, nombre_tipo: e.target.value }))}
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    className="w-32 pl-7 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editValues.valor}
                    onChange={e => setEditValues(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleUpdate(tarifa.id)}
                    disabled={actionLoading}
                    className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    disabled={actionLoading}
                    className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium text-slate-700">{tarifa.nombre_tipo}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-slate-500">
                    ${(Number(tarifa.valor) || 0).toLocaleString('es-CO')}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                    <button
                      onClick={() => {
                        setEditingId(tarifa.id);
                        setEditValues({ nombre_tipo: tarifa.nombre_tipo, valor: tarifa.valor });
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tarifa.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {!isAdding && tariffs.length === 0 && (
          <div className="text-center py-6 text-sm text-slate-500 border border-dashed border-slate-200 rounded-lg">
            No hay tarifas configuradas
          </div>
        )}
      </div>
    </div>
  );
}
