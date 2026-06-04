# Configuración de Supabase para Google OAuth

Este documento explica cómo configurar el dashboard de Supabase para que el flujo de autenticación con Google funcione correctamente.

## 1. Configuración de URL en Supabase Dashboard

### Site URL
1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a: **Authentication > URL Configuration**
3. En el campo **Site URL**, configura:
   - **Desarrollo (Localhost):** `http://localhost:3000` o `http://localhost:5173` (según el puerto que uses)
   - **Producción:** Tu dominio de producción (ej: `https://tu-dominio.com`)

### Redirect URLs
En la sección **Redirect URLs**, agrega las siguientes URLs (una por línea):

#### Para Desarrollo (Localhost):
```
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:5173/auth/callback
```

#### Para Producción:
```
https://tu-dominio.com/auth/callback
https://www.tu-dominio.com/auth/callback
```

**Importante:** La URL de callback debe coincidir exactamente con la configurada en el código:
```javascript
// En AuthContext.jsx
const redirectUrl = `${window.location.origin}/auth/callback`;
```

## 2. Habilitar Proveedor Google

1. En Supabase Dashboard, navega a: **Authentication > Providers**
2. Busca **Google** en la lista de proveedores
3. Haz clic en **Google** para expandir la configuración
4. Activa el toggle **Enable Google provider**
5. Configura los siguientes campos:

### Client ID y Client Secret
Para obtener estos valores:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea o selecciona un proyecto
3. Navega a: **APIs & Services > Credentials**
4. Crea un nuevo **OAuth 2.0 Client ID**
5. Tipo de aplicación: **Web application**
6. **Authorized redirect URIs:**
   - Desarrollo: `http://localhost:3000/auth/callback`
   - Producción: `https://tu-dominio.com/auth/callback`
7. Copia el **Client ID** y **Client Secret**
8. Pega estos valores en el dashboard de Supabase

### URL de Autorización y Token
Supabase configura automáticamente estas URLs. Verifica que sean:
- **Authorise URL:** `https://accounts.google.com/o/oauth2/v2/auth`
- **Access Token URL:** `https://oauth2.googleapis.com/token`

## 3. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Para obtener estos valores:**
1. En Supabase Dashboard, ve a: **Project Settings > API**
2. Copia **Project URL** → `VITE_SUPABASE_URL`
3. Copia **anon** / **public** key → `VITE_SUPABASE_ANON_KEY`

## 4. Verificación de Configuración

### Verificar en Desarrollo
1. Inicia la aplicación: `npm run dev`
2. Abre la consola del navegador
3. Intenta iniciar sesión con Google
4. Verifica los logs de diagnóstico:
   ```
   === DIAGNÓSTICO DE LOGIN ===
   Origen actual: http://localhost:3000
   Hostname: localhost
   Entorno: Desarrollo
   URL de redirección: http://localhost:3000/auth/callback
   ```

### Verificar en Producción
1. Despliega la aplicación (Vercel, Netlify, etc.)
2. Abre la consola del navegador
3. Intenta iniciar sesión con Google
4. Verifica que aparezca la advertencia:
   ```
   ⚠️  Modo producción detectado
   ⚠️  Asegúrate de que el dominio actual esté configurado en Supabase Dashboard
   ```

## 5. Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"
**Causa:** La URL de redirección en Google Cloud Console no coincide con la de Supabase.
**Solución:**
- Verifica que las URLs en Google Cloud Console coincidan exactamente con las configuradas en Supabase
- Incluye tanto `http://localhost:3000/auth/callback` como `https://tu-dominio.com/auth/callback`

### Error: "Auth session missing"
**Causa:** La sesión no se estableció correctamente después del callback.
**Solución:**
- Verifica que la ruta `/auth/callback` exista en tu aplicación
- Revisa los logs en AuthCallback.jsx para ver si se obtuvo la sesión
- Asegúrate de que el AuthProvider envuelva la aplicación completa

### Error: "Unsupported provider"
**Causa:** El proveedor de Google no está habilitado en Supabase.
**Solución:**
- Ve a Authentication > Providers en Supabase Dashboard
- Activa el toggle de Google provider

### Error: "window.location.origin no está definido"
**Causa:** La aplicación no se está ejecutando en un servidor HTTP.
**Solución:**
- Usa `npm run dev` para iniciar el servidor de desarrollo
- No abras el archivo HTML directamente en el navegador

## 6. Flujo Completo de Autenticación

1. **Usuario hace clic en "Iniciar Sesión"**
   - Header.jsx llama a `handleLogin()`
   - AuthContext.jsx ejecuta `signInWithGoogle()`
   - Redirige a Google OAuth

2. **Usuario autentica en Google**
   - Google redirige a: `{origin}/auth/callback`
   - AuthCallback.jsx procesa el callback
   - Obtiene la sesión con `supabase.auth.getSession()`
   - Redirige a la página principal

3. **AuthContext detecta el cambio**
   - `onAuthStateChange` se dispara con evento `SIGNED_IN`
   - Actualiza el estado `session` y `user`
   - Crea el perfil en la tabla `profiles` si no existe

4. **Header actualiza la UI**
   - Detecta que `user` existe
   - Muestra `UserMenu` en lugar de `LoginButton`
   - Muestra avatar/iniciales y botón de logout

## 7. Checklist de Configuración

- [ ] Site URL configurado en Supabase Dashboard
- [ ] Redirect URLs agregadas (desarrollo y producción)
- [ ] Google provider habilitado en Supabase
- [ ] Client ID y Client Secret de Google configurados
- [ ] Authorized redirect URIs en Google Cloud Console
- [ ] Variables de entorno `.env` creadas
- [ ] Ruta `/auth/callback` existe en App.jsx
- [ ] AuthProvider envuelve la aplicación completa
- [ ] Prueba de login exitosa en desarrollo
- [ ] Prueba de login exitosa en producción
