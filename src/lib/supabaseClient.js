import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Diagnóstico de variables de entorno
console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN SUPABASE ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Cargado' : '✗ No definido');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Cargado' : '✗ No definido');

if (!hasSupabaseConfig) {
  console.warn('⚠️ Variables de entorno de Supabase no están definidas. La app seguirá cargando con un cliente de respaldo.');
}

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase no configurado', status: 500 } }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: { message: 'Supabase no configurado' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Supabase no configurado' } })
      })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Supabase no configurado' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { code: 'PGRST116', message: 'Supabase no configurado' } })
        })
      })
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: { code: 'PGRST116', message: 'Supabase no configurado' } })
    })
  })
};

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : fallbackClient;
