import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Toast from './Toast';

const AuthCallback = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    console.log('=== AUTHCALLBACK COMPONENTE MONTADO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('window.location.href:', window.location.href);
    console.log('window.location.search:', window.location.search);
    console.log('window.location.hash:', window.location.hash);

    // Manejar hash fragments de Google OAuth
    // Supabase automáticamente procesa los hash fragments, pero necesitamos
    // asegurar que React Router no interfiera con ellos
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('>>> Detectado hash fragment con access_token de Google OAuth');
      console.log('>>> Supabase procesará automáticamente este hash fragment');
      // No necesitamos hacer nada manualmente, Supabase lo maneja
    }

    const handleAuthCallback = async () => {
      try {
        console.log('=== PROCESANDO CALLBACK DE AUTENTICACIÓN ===');
        
        // Esperar a que Supabase procese el callback de OAuth
        // Esto es necesario para asegurar que la sesión se establezca correctamente
        console.log('>>> Esperando 500ms para que Supabase procese el callback...');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('<<< Espera completada');
        
        // Obtener la sesión actual después del redirect de OAuth
        console.log('>>> Llamando a supabase.auth.getSession() en AuthCallback...');
        const { data, error } = await supabase.auth.getSession();
        console.log('<<< supabase.auth.getSession() completado en AuthCallback');
        
        if (error) {
          console.error('!!! ERROR al obtener sesión en callback !!!');
          console.error('Error:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
          setToast({ 
            message: 'Error al obtener sesión: ' + error.message, 
            type: 'error' 
          });
          // Redirigir a la página principal con error después de mostrar el toast
          setTimeout(() => {
            console.log('>>> Redirigiendo a /?auth_error=true');
            window.location.href = '/?auth_error=true';
          }, 3000);
          return;
        }

        if (data.session) {
          console.log('✓ Sesión establecida correctamente en AuthCallback');
          console.log('Usuario:', data.session.user.email);
          console.log('Provider:', data.session.user.app_metadata.provider);
          console.log('User Metadata:', JSON.stringify(data.session.user.user_metadata, null, 2));
          console.log('Session ID:', data.session.user.id);
          console.log('Session expires at:', data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'N/A');
          
          setToast({ 
            message: 'Autenticación exitosa. Redirigiendo...', 
            type: 'success' 
          });
          
          // Redirigir a la página principal después de asegurar que la sesión está establecida
          // Usar window.location.replace para evitar que el hash fragment quede en el historial
          setTimeout(() => {
            console.log('>>> Redirigiendo a / (home) tras login exitoso');
            window.location.replace('/');
          }, 1500);
        } else {
          console.warn('⚠️  No se encontró sesión después del callback');
          console.warn('data.session es null');
          setToast({ 
            message: 'No se encontró sesión después del callback', 
            type: 'warning' 
          });
          setTimeout(() => {
            console.log('>>> Redirigiendo a /?auth_error=no_session');
            window.location.replace('/?auth_error=no_session');
          }, 3000);
        }
      } catch (error) {
        console.error('!!! ERROR CRÍTICO en AuthCallback !!!');
        console.error('Error:', error);
        console.error('Stack trace:', error.stack);
        setToast({ 
          message: 'Error crítico en el proceso de autenticación', 
          type: 'error' 
        });
        setTimeout(() => {
          console.log('>>> Redirigiendo a /?auth_error=exception');
          window.location.replace('/?auth_error=exception');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Procesando autenticación...</p>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration || 3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AuthCallback;
