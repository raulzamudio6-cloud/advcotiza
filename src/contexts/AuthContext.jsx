import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import Toast from '../components/Toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        // Create profile after first login
        if (event === 'SIGNED_IN' && session?.user) {
          await createProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createProfile = async (user) => {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
              avatar_url: user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString()
            }
          ]);

        if (error) {
          setToast({ message: 'Error al crear perfil: ' + error.message, type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: 'Error en createProfile: ' + error.message, type: 'error' });
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

      console.log('=== DIAGNÓSTICO DE LOGIN ===');
      console.log('Iniciando signInWithOAuth con argumentos:', {
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      console.log('URL de redirección completa:', redirectUrl);

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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setToast({ message: 'Error al cerrar sesión: ' + error.message, type: 'error' });
        throw error;
      }
      setToast({ message: 'Sesión cerrada correctamente', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error al cerrar sesión: ' + error.message, type: 'error' });
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
