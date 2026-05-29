import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Toast from './Toast';

const AuthCallback = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('=== PROCESANDO CALLBACK DE AUTENTICACIÓN ===');
        
        // Obtener la sesión actual después del redirect de OAuth
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error al obtener sesión en callback:', error);
          console.error('Error completo:', JSON.stringify(error, null, 2));
          setToast({ 
            message: 'Error al obtener sesión: ' + error.message, 
            type: 'error' 
          });
          // Redirigir a la página principal con error después de mostrar el toast
          setTimeout(() => {
            window.location.href = '/?auth_error=true';
          }, 3000);
          return;
        }

        if (data.session) {
          console.log('✓ Sesión establecida correctamente');
          console.log('Usuario:', data.session.user.email);
          console.log('Provider:', data.session.user.app_metadata.provider);
          
          setToast({ 
            message: 'Autenticación exitosa. Redirigiendo...', 
            type: 'success' 
          });
          
          // Redirigir a la página principal
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          console.warn('No se encontró sesión después del callback');
          setToast({ 
            message: 'No se encontró sesión después del callback', 
            type: 'warning' 
          });
          setTimeout(() => {
            window.location.href = '/?auth_error=no_session';
          }, 3000);
        }
      } catch (error) {
        console.error('Error crítico en AuthCallback:', error);
        console.error('Stack trace:', error.stack);
        setToast({ 
          message: 'Error crítico en el proceso de autenticación', 
          type: 'error' 
        });
        setTimeout(() => {
          window.location.href = '/?auth_error=exception';
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
