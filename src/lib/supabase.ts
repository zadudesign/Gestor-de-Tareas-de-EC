import { createClient } from '@supabase/supabase-js';

// Inicialización del cliente de Supabase
// Utilizamos import.meta.env para Vite (equivalente a process.env en Next.js)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Faltan las variables de entorno de Supabase. El cliente no se inicializará correctamente.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
