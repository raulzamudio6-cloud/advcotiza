import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Método de emergencia para limpiar sesión desde la consola
window.debugLogout = () => {
  console.log('=== DEBUG LOGOUT EMERGENCY ===');
  console.log('Limpiando localStorage...');
  
  // Limpiar todos los items de localStorage
  const keys = Object.keys(localStorage);
  console.log('Keys en localStorage:', keys);
  
  keys.forEach(key => {
    if (key.includes('sb-') || key.includes('auth')) {
      console.log('Eliminando:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  
  console.log('LocalStorage limpiado. Recargando página...');
  console.log('Keys restantes:', Object.keys(localStorage));
  
  // Recargar página
  window.location.reload();
};

// Método para verificar estado de localStorage
window.debugCheckAuth = () => {
  console.log('=== DEBUG CHECK AUTH STATE ===');
  console.log('LocalStorage keys:', Object.keys(localStorage));
  
  const authKeys = Object.keys(localStorage).filter(key => key.includes('sb-') || key.includes('auth'));
  console.log('Auth-related keys:', authKeys);
  
  authKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}:`, value ? 'Presente' : 'Ausente');
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`  - Contenido (primeros 200 chars):`, JSON.stringify(parsed).substring(0, 200));
      } catch (e) {
        console.log(`  - Contenido (primeros 200 chars):`, value.substring(0, 200));
      }
    }
  });
  
  console.log('SessionStorage keys:', Object.keys(sessionStorage));
};

// Método para verificar estado de React
window.debugReactState = () => {
  console.log('=== DEBUG REACT STATE ===');
  console.log('React version:', React.version);
  console.log('DOM root:', document.getElementById('root'));
  console.log('URL actual:', window.location.href);
  console.log('Hash:', window.location.hash);
  console.log('Search:', window.location.search);
};

console.log('=== DEBUG METHODS AVAILABLE ===');
console.log('window.debugLogout() - Limpiar localStorage y recargar');
console.log('window.debugCheckAuth() - Verificar estado de autenticación en localStorage');
console.log('window.debugReactState() - Verificar estado de React');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
