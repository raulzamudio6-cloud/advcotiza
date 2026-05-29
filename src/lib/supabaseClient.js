import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Diagnóstico de variables de entorno
console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN SUPABASE ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Cargado' : '✗ No definido');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Cargado' : '✗ No definido');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Variables de entorno de Supabase no están definidas');
  console.error('Verifique que .env.local contenga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
