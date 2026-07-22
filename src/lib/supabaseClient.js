import { createClient } from '@supabase/supabase-js';

const viteEnv = import.meta.env ?? {};
const rawSupabaseUrl = viteEnv.VITE_SUPABASE_URL;
const rawSupabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY;

const normalizeEnvValue = (value) => (typeof value === 'string' ? value.trim() : '');
const supabaseUrl = normalizeEnvValue(rawSupabaseUrl);
const supabaseAnonKey = normalizeEnvValue(rawSupabaseAnonKey);

const missingEnvVars = [];
if (!supabaseUrl) missingEnvVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingEnvVars.push('VITE_SUPABASE_ANON_KEY');

const hasSupabaseConfig = missingEnvVars.length === 0;

// Diagnóstico de variables de entorno
console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN SUPABASE ===');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓ Cargado' : '✗ No definido');
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Cargado' : '✗ No definido');

if (!hasSupabaseConfig) {
  console.warn(
    `[Supabase] No se inicializará el cliente porque faltan variables de entorno: ${missingEnvVars.join(', ')}.`
  );
}

const createConfigError = (context = 'Operación de Supabase') => ({
  message: `${context}: faltan variables de entorno (${missingEnvVars.join(', ')})`,
  status: 500
});

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: async () => ({ data: null, error: createConfigError('No se pudo iniciar OAuth') }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: null }, error: null })
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: createConfigError('No se pudo subir el archivo') }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: { code: 'PGRST116', message: createConfigError('No se pudo consultar la tabla').message } })
      })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: { code: 'PGRST116', message: createConfigError('No se pudo insertar el registro').message } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { code: 'PGRST116', message: createConfigError('No se pudo actualizar el registro').message } })
        })
      })
    }),
    delete: () => ({
      eq: async () => ({ data: null, error: { code: 'PGRST116', message: createConfigError('No se pudo eliminar el registro').message } })
    })
  })
};

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : fallbackClient;
