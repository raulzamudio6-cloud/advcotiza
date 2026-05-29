# Guía de Resolución: Error 400 (validation_failed: Unsupported provider)

## Problema
Error `400 (validation_failed: Unsupported provider)` al intentar autenticarse con Google OAuth en Supabase.

## Causa Raíz
El proveedor de Google no está configurado correctamente en el Dashboard de Supabase o las credenciales de OAuth no están configuradas en Google Cloud Console.

## Cambios Implementados

### 1. Sistema de Notificaciones Visuales (Toast)
- **Archivo**: `src/components/Toast.jsx` (nuevo)
- **Funcionalidad**: Reemplaza los `console.log` por notificaciones visuales en la UI
- **Tipos de notificaciones**: success, error, warning, info
- **Duración**: 5 segundos por defecto (configurable)

### 2. Validación de window.location.origin
- **Archivo**: `src/contexts/AuthContext.jsx`
- **Funcionalidad**: Valida que `window.location.origin` esté definido antes de iniciar OAuth
- **Error específico**: Muestra notificación si no está definido

### 3. Limpieza de Estado de Autenticación
- **Archivo**: `src/contexts/AuthContext.jsx`
- **Función**: `clearAuthState()`
- **Acciones**:
  - Ejecuta `supabase.auth.signOut()`
  - Limpia `localStorage` completamente
  - Limpia `sessionStorage` completamente
  - Recarga la página para limpiar estado de React

### 4. Botón Temporal de Limpieza
- **Archivo**: `src/components/Login.jsx`
- **Ubicación**: Debajo del botón de login con Google
- **Texto**: "[DEBUG] Limpiar estado de autenticación"
- **Función**: Ejecuta `clearAuthState()` para eliminar sesiones basura

### 5. Mejoras en AuthCallback
- **Archivo**: `src/components/AuthCallback.jsx`
- **Funcionalidad**: Usa notificaciones Toast en lugar de console.log
- **Redirección**: Muestra notificación de éxito antes de redirigir al dashboard

## Pasos de Resolución en Supabase Dashboard

### 1. Habilitar el Proveedor de Google en Supabase

1. Accede al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **Authentication** > **Providers**
4. Localiza **Google** en la lista de proveedores
5. Haz clic en el toggle para **habilitar** el proveedor de Google
6. El estado debe cambiar a "Enabled"

### 2. Configurar Credenciales en Google Cloud Console

1. Accede a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Navega a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Selecciona **Web application**
6. Configura los siguientes campos:

#### Authorized JavaScript Origins
- `http://localhost:5173` (para desarrollo local)
- `https://tu-dominio-de-produccion.com` (para producción)

#### Authorized Redirect URIs
- `http://localhost:5173/auth/callback` (para desarrollo local)
- `https://tu-dominio-de-produccion.com/auth/callback` (para producción)

7. Haz clic en **Create**
8. Copia el **Client ID** y **Client Secret** generados

### 3. Configurar Credenciales en Supabase

1. Regresa al Dashboard de Supabase
2. Navega a **Authentication** > **Providers** > **Google**
3. Pega el **Client ID** en el campo correspondiente
4. Pega el **Client Secret** en el campo correspondiente
5. Haz clic en **Save**

### 4. Verificar Configuración de Site URL en Supabase

1. En el Dashboard de Supabase, navega a **Settings** > **General**
2. Localiza la sección **Site URL**
3. Asegúrate de que esté configurada correctamente:
   - Desarrollo: `http://localhost:5173`
   - Producción: `https://tu-dominio-de-produccion.com`

### 5. Verificar Variables de Entorno en el Proyecto

Asegúrate de que tu archivo `.env.local` contenga:

```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

## Verificación de la Implementación en Código

### Archivo: `src/lib/supabaseClient.js`
✅ El cliente de Supabase se inicializa correctamente con diagnóstico de variables de entorno.

### Archivo: `src/contexts/AuthContext.jsx`
✅ La función `signInWithGoogle` utiliza la estructura correcta:
```javascript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
});
```

### Archivo: `src/components/AuthCallback.jsx`
✅ Componente creado para manejar el callback de OAuth de Google.

### Archivo: `src/App.jsx` y `src/main.jsx`
✅ Routing configurado con React Router para la ruta `/auth/callback`.

## Logs de Depuración

La aplicación ahora incluye logs detallados en la consola del navegador:

### Al Inicializar Supabase
```
=== DIAGNÓSTICO DE CONFIGURACIÓN SUPABASE ===
VITE_SUPABASE_URL: ✓ Cargado
VITE_SUPABASE_ANON_KEY: ✓ Cargado
```

### Al Iniciar Login con Google
```
=== DIAGNÓSTICO DE LOGIN ===
Iniciando signInWithOAuth con argumentos: {
  provider: 'google',
  options: {
    redirectTo: 'http://localhost:5173/auth/callback'
  }
}
URL de redirección completa: http://localhost:5173/auth/callback
```

### Al Procesar Callback
```
=== PROCESANDO CALLBACK DE AUTENTICACIÓN ===
✓ Sesión establecida correctamente
Usuario: usuario@email.com
Provider: google
```

## Pasos para Probar la Solución

### 1. Limpieza de Estado Previo
1. Abre la aplicación en `http://localhost:5173`
2. En la pantalla de login, haz clic en **"[DEBUG] Limpiar estado de autenticación"**
3. Esto eliminará cualquier sesión basura del error 400 anterior

### 2. Verificación de URL
1. Abre la consola del navegador (F12)
2. Al hacer clic en "Continuar con Google", verifica que aparezca:
   ```
   URL de redirección completa: http://localhost:5173/auth/callback
   ```
3. Esta URL debe coincidir exactamente con la configurada en Google Cloud Console

### 3. Prueba de Login
1. Haz clic en **"Continuar con Google"**
2. El navegador debe redirigir a la pantalla de selección de cuentas de Google
3. Si aparece un Toast de error:
   - **"El proveedor de Google no está habilitado en Supabase"**: Habilita el proveedor en Supabase Dashboard
   - **"Error de redirección: Verifica que las URIs en Google Cloud Console coincidan"**: Verifica las URIs en Google Cloud Console

### 4. Verificación de Callback
1. Después de seleccionar una cuenta de Google, deberías ver:
   - Pantalla de "Procesando autenticación..."
   - Toast: "Autenticación exitosa. Redirigiendo..."
   - Redirección automática al dashboard de la agencia

### 5. Verificación de Site URL en Supabase
Si recibes un error de "Site Not Found":
1. Accede a Supabase Dashboard > Settings > General
2. Verifica que **Site URL** sea `http://localhost:5173`
3. Si es diferente, actualízala y guarda

## Troubleshooting Adicional

### Error: "redirect_uri_mismatch"
- Verifica que las URIs de redirección en Google Cloud Console coincidan exactamente con las configuradas en tu aplicación
- Incluye la barra diagonal final si es necesario

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos
- Asegúrate de que no haya espacios en blanco adicionales

### Error: "access_denied"
- Verifica que el usuario haya autorizado la aplicación
- Revisa los scopes configurados en Google Cloud Console

## Referencias

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Documentación de Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
