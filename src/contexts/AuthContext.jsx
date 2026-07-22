import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import Toast from '../components/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    console.log('=== INICIALIZANDO AUTHCONTEXT ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('window.location.href:', window.location.href);
    console.log('window.location.hash:', window.location.hash);
    console.log('window.location.search:', window.location.search);
    console.log('Estado inicial - session:', session, 'loading:', loading);

    // Verificar localStorage para tokens de Supabase
    console.log('=== VERIFICANDO LOCALSTORAGE ===');
    const localStorageKeys = Object.keys(localStorage);
    console.log('Keys en localStorage:', localStorageKeys);
    const authKeys = localStorageKeys.filter(key => key.includes('sb-') || key.includes('auth'));
    console.log('Auth-related keys:', authKeys);

    // Limpiar accessToken residual si existe (no es de Supabase)
    if (localStorageKeys.includes('accessToken')) {
      console.log('>>> Limpiando accessToken residual...');
      localStorage.removeItem('accessToken');
    }
    
    if (authKeys.length > 0) {
      authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? '✓ Presente' : '✗ Ausente');
        if (value) {
          try {
            const parsed = JSON.parse(value);
            console.log(`  - Tipo: ${typeof parsed}, Longitud: ${JSON.stringify(parsed).length}`);
          } catch (e) {
            console.log(`  - Longitud: ${value.length}`);
          }
        }
      });
    } else {
      console.warn('⚠️  No se encontraron tokens de autenticación en localStorage');
    }

    // Get initial session - envuelto en try-catch-finally para garantizar setLoading(false)
    const initializeSession = async () => {
      try {
        console.log('>>> Llamando a supabase.auth.getSession()...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('<<< supabase.auth.getSession() completado');
        console.log('=== SESIÓN INICIAL ===');
        console.log('Session:', session ? '✓ Presente' : '✗ Ausente');
        
        if (session?.user) {
          console.log('Usuario ID:', session.user.id);
          console.log('Usuario Email:', session.user.email);
          console.log('User Metadata:', JSON.stringify(session.user.user_metadata, null, 2));
          console.log('Session expires at:', session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
        } else {
          console.warn('⚠️  No hay sesión inicial - usuario no autenticado');
        }
        
        console.log('>>> Antes de setSession(session)');
        setSession(session);
        console.log('<<< Después de setSession(session)');
      } catch (error) {
        console.error('!!! ERROR en supabase.auth.getSession() !!!');
        console.error('Error:', error);
        console.error('Stack trace:', error.stack);
      } finally {
        // Garantizar que loading se establece a false independientemente del resultado
        console.log('>>> Ejecutando finally: setLoading(false)');
        setLoading(false);
        console.log('<<< finally completado');
      }
    };

    initializeSession();

    // Listen for auth changes
    console.log('>>> Configurando onAuthStateChange listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== EVENTO onAuthStateChange DISPARADO ===');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Evento:', event);
        console.log('Session:', session ? '✓ Presente' : '✗ Ausente');
        console.log('Estado actual - session:', session, 'loading:', loading);
        
        try {
          if (session?.user) {
            console.log('Usuario ID:', session.user.id);
            console.log('Usuario Email:', session.user.email);
            console.log('User Metadata:', JSON.stringify(session.user.user_metadata, null, 2));
            console.log('Provider:', session.user.app_metadata?.provider);
            console.log('Session expires at:', session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A');
          } else {
            console.warn('⚠️  Session es null en evento:', event);
          }
          
          console.log('>>> Antes de setSession(session) en onAuthStateChange');
          setSession(session);
          console.log('<<< Después de setSession(session) en onAuthStateChange');
          
          // Ensure loading is set to false after auth state changes
          setLoading(false);
          console.log('<<< setLoading(false) llamado en onAuthStateChange');
          
          // Create profile after first login
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('>>> Evento SIGNED_IN detectado, iniciando creación de perfil...');
            await createProfile(session.user);
            console.log('<<< Creación de perfil completada');
          } else if (event === 'SIGNED_OUT') {
            console.log('>>> Evento SIGNED_OUT detectado');
            console.log('>>> Limpiando estado de sesión');
            // setSession(null) ya se llama arriba con session=null
            // Asegurar limpieza adicional de localStorage por seguridad
            console.log('>>> Limpieza adicional de localStorage en SIGNED_OUT...');
            const localStorageKeys = Object.keys(localStorage);
            const supabaseKeys = localStorageKeys.filter(key => key.includes('sb-'));
            supabaseKeys.forEach(key => {
              console.log('Eliminando:', key);
              localStorage.removeItem(key);
            });
            console.log('✓ Sesión limpiada correctamente en onAuthStateChange');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('>>> Evento TOKEN_REFRESHED detectado');
          }
        } catch (error) {
          console.error('!!! ERROR en onAuthStateChange callback !!!');
          console.error('Error:', error);
          console.error('Stack trace:', error.stack);
        }
      }
    );
    console.log('<<< onAuthStateChange listener configurado');

    return () => {
      console.log('>>> Limpiando onAuthStateChange subscription...');
      subscription.unsubscribe();
      console.log('<<< onAuthStateChange subscription limpiada');
    };
  }, []);

  const createProfile = async (user) => {
    try {
      console.log('=== CREANDO PERFIL DE USUARIO ===');
      console.log('Usuario ID:', user.id);
      console.log('Usuario Email:', user.email);
      console.log('User Metadata:', JSON.stringify(user.user_metadata, null, 2));

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        console.log('Perfil no existe, creando nuevo perfil...');

        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.email,
              avatar_url: user.user_metadata?.avatar_url || null
            }
          ]);

        if (error) {
          console.error('Error al crear perfil:', error);
          // No mostrar toast - es un error de RLS que el usuario no puede resolver desde el cliente
          console.warn('⚠️  La creación del perfil falló (posiblemente por RLS). El login continuará normalmente.');
        } else {
          console.log('✓ Perfil creado exitosamente');
        }
      } else {
        console.log('✓ Perfil ya existe, omitiendo creación');
      }
    } catch (error) {
      console.error('Error en createProfile:', error);
      // No mostrar toast - es un error de RLS que el usuario no puede resolver desde el cliente
      console.warn('⚠️  La creación del perfil falló (posiblemente por RLS). El login continuará normalmente.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      // Validar que window.location.origin esté configurado correctamente
      if (!window.location.origin || window.location.origin === 'null') {
        setToast({ 
          message: 'Error: window.location.origin no está definido. Verifica que la app se esté ejecutando en un servidor.', 
          type: 'error' 
        });
        throw new Error('window.location.origin no está definido');
      }

      // Validar que la URL de redirección sea válida
      const validOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://localhost:3000',
        'https://localhost:5173'
      ];
      
      // En producción, validar que el origen coincida con el dominio configurado en Supabase
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      
      if (!isDevelopment) {
        console.warn('⚠️  Modo producción detectado');
        console.warn('⚠️  Asegúrate de que el dominio actual esté configurado en Supabase Dashboard > Authentication > URL Configuration');
      }

      console.log('=== DIAGNÓSTICO DE LOGIN ===');
      console.log('Origen actual:', window.location.origin);
      console.log('Hostname:', window.location.hostname);
      console.log('Entorno:', isDevelopment ? 'Desarrollo' : 'Producción');
      console.log('URL de redirección:', redirectUrl);
      console.log('Iniciando signInWithOAuth con argumentos:', {
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        // Mostrar notificación visual del error
        const errorMessage = error.message || 'Error desconocido al iniciar sesión con Google';
        
        if (error.status === 400 && errorMessage.includes('Unsupported provider')) {
          setToast({ 
            message: 'El proveedor de Google no está habilitado en Supabase. Habilita el proveedor en Authentication > Providers > Google', 
            type: 'error',
            duration: 10000
          });
        } else if (errorMessage.includes('redirect_uri_mismatch')) {
          setToast({ 
            message: 'Error de redirección: Verifica que las URIs en Google Cloud Console coincidan con ' + redirectUrl, 
            type: 'error',
            duration: 10000
          });
        } else {
          setToast({ 
            message: 'Error al iniciar sesión: ' + errorMessage, 
            type: 'error' 
          });
        }
        
        console.error('ERROR COMPLETO DE SUPABASE:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✓ signInWithOAuth ejecutado correctamente');
      console.log('Datos de respuesta:', data);
      return data;
    } catch (error) {
      console.error('ERROR EN try/catch de signInWithGoogle:', JSON.stringify(error, null, 2));
      console.error('Stack trace:', error.stack);
      throw error;
    }
  };

  const signOut = async () => {
    console.log('=== SIGNOUT INICIADO ===');
    try {
      // Cerrar sesión en Supabase con timeout
      console.log('>>> Llamando a supabase.auth.signOut()...');

      // Crear timeout para evitar que se quede colgado
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: signOut no respondió en 3 segundos')), 3000)
      );

      const { error } = await Promise.race([signOutPromise, timeoutPromise]);

      if (error) {
        console.error('!!! Error de Supabase al cerrar sesión:', error);
        throw error;
      }
      console.log('✓ Sesión cerrada exitosamente en Supabase');
      
      // Forzar limpieza manual adicional de localStorage
      console.log('>>> Limpiando tokens de Supabase del localStorage...');
      const localStorageKeys = Object.keys(localStorage);
      const supabaseKeys = localStorageKeys.filter(key => key.includes('sb-'));
      
      supabaseKeys.forEach(key => {
        console.log('Eliminando:', key);
        localStorage.removeItem(key);
      });
      
      // Limpiar datos de usuario (agencia, cotizaciones, configuración)
      console.log('>>> Limpiando datos de usuario del localStorage...');
      const userDataKeys = localStorageKeys.filter(key => 
        key.includes('agency') || 
        key.includes('quotation') || 
        key.includes('config') ||
        key.includes('user')
      );
      
      userDataKeys.forEach(key => {
        console.log('Eliminando:', key);
        localStorage.removeItem(key);
      });
      
      // Limpiar sessionStorage
      console.log('>>> Limpiando sessionStorage...');
      sessionStorage.clear();
      
      // Resetear estado de React
      console.log('>>> Resetenado estado de React...');
      setSession(null);
      // setUser no existe directamente, pero user se deriva de session
      
      console.log('✓ Estado de autenticación limpiado correctamente');
      setToast({ message: 'Sesión cerrada correctamente', type: 'success' });
      
      // Redirección fuerte para limpiar estados residuales
      console.log('>>> Redirigiendo a / para limpieza completa...');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error) {
      console.error('!!! ERROR EN SIGNOUT !!!');
      console.error('Error:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Forzar limpieza incluso si hay error
      console.log('>>> Forzando limpieza debido a error...');
      const localStorageKeys = Object.keys(localStorage);
      localStorageKeys.forEach(key => {
        if (key.includes('sb-') || key.includes('agency') || key.includes('quotation') || key.includes('config')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      setSession(null);
      
      setToast({ message: 'Error al cerrar sesión: ' + error.message, type: 'error' });
      
      // Redirección forzada incluso con error
      console.log('>>> Redirigiendo a / debido a error (fallback)...');
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
      throw error;
    }
  };

  const clearAuthState = useCallback(async () => {
    try {
      // Cerrar sesión en Supabase
      await supabase.auth.signOut();
      
      // Limpiar localStorage completamente
      localStorage.clear();
      
      // Limpiar sessionStorage
      sessionStorage.clear();
      
      // Recargar la página para limpiar estado de React
      window.location.reload();
      
      setToast({ message: 'Estado de autenticación limpiado completamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al limpiar estado: ' + error.message, type: 'error' });
      console.error('Error al limpiar estado:', error);
    }
  }, []);

  const value = {
    session,
    user: session?.user || null,
    loading,
    signInWithGoogle,
    signOut,
    clearAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration || 5000}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
