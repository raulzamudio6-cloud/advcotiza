# Guía de Debugging para Autenticación

Este documento proporciona una guía completa para interpretar los logs de diagnóstico y identificar dónde se detiene el flujo de autenticación.

## Logs Implementados

### 1. AuthContext.jsx

#### Inicialización
```
=== INICIALIZANDO AUTHCONTEXT ===
Timestamp: [ISO timestamp]
window.location.href: [URL completa]
window.location.hash: [hash de la URL]
window.location.search: [parámetros de búsqueda]
Estado inicial - session: null, loading: true
```

**Qué indica:** El AuthContext se está inicializando. Si no ves esto, el AuthProvider no está envolviendo la aplicación.

#### getSession()
```
>>> Llamando a supabase.auth.getSession()...
<<< supabase.auth.getSession() completado
=== SESIÓN INICIAL ===
Session: ✓ Presente / ✗ Ausente
```

**Qué indica:** 
- Si ves "✓ Presente": Hay una sesión en localStorage
- Si ves "✗ Ausente": No hay sesión guardada
- Si no ves "<<< completado": La promesa nunca se resolvió (error crítico)

#### setLoading()
```
>>> Antes de setSession(session)
<<< Después de setSession(session)
>>> Antes de setLoading(false)
<<< Después de setLoading(false)
Estado final - session: Presente/Ausente, loading: false
```

**Qué indica:**
- Si ves "Antes de setLoading(false)" pero no "Después de setLoading(false)": El estado de React no se actualizó
- Si loading nunca cambia a false: ProtectedRoute quedará bloqueado mostrando el spinner

#### onAuthStateChange
```
>>> Configurando onAuthStateChange listener...
<<< onAuthStateChange listener configurado
=== EVENTO onAuthStateChange DISPARADO ===
Evento: [SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED / INITIAL_SESSION]
Session: ✓ Presente / ✗ Ausente
```

**Qué indica:**
- Si no ves "listener configurado": Error al suscribirse a cambios
- Si el evento es "INITIAL_SESSION": Es el evento inicial al cargar
- Si el evento es "SIGNED_IN": Usuario acaba de iniciar sesión
- Si el evento es "SIGNED_OUT": Usuario cerró sesión

### 2. ProtectedRoute.jsx

```
=== PROTECTEDROUTE RENDER ===
Estado: { loading: true/false, session: Presente/Ausente }
Session ID: [ID o undefined]
User Email: [email o undefined]
```

**Qué indica:**
- Si loading = true y session = Ausente: Mostrará spinner
- Si loading = false y session = Ausente: Mostrará Login
- Si loading = false y session = Presente: Mostrará children (app principal)

**Bloqueo potencial:** Si loading permanece en true indefinidamente, el usuario nunca verá nada más que el spinner.

### 3. Header.jsx

```
=== HEADER RENDER ===
Estado de auth: { user: Presente/Ausente, userEmail: [email], userName: [nombre] }
```

**Qué indica:**
- Si user = Ausente: Mostrará botón "Iniciar Sesión"
- Si user = Presente: Mostrará UserMenu con avatar/iniciales

### 4. AuthCallback.jsx

```
=== AUTHCALLBACK COMPONENTE MONTADO ===
Timestamp: [ISO timestamp]
window.location.href: [URL completa]
window.location.search: [parámetros de búsqueda]
window.location.hash: [hash]
```

**Qué indica:** El componente de callback se montó después del redirect de Google.

```
=== PROCESANDO CALLBACK DE AUTENTICACIÓN ===
>>> Esperando 500ms para que Supabase procese el callback...
<<< Espera completada
>>> Llamando a supabase.auth.getSession() en AuthCallback...
<<< supabase.auth.getSession() completado en AuthCallback
```

**Qué indica:**
- Si no ves "completado en AuthCallback": Error al obtener sesión
- Si session = null: Google no devolvió una sesión válida

## Escenarios de Fallo Comunes

### Escenario 1: "Auth session missing"

**Logs que verás:**
```
=== SESIÓN INICIAL ===
Session: ✗ Ausente
⚠️  No hay sesión inicial - usuario no autenticado
```

**Diagnóstico:** La sesión no se guardó en localStorage después del login.

**Posibles causas:**
1. URL de redirect incorrecta en Supabase Dashboard
2. Google Cloud Console no tiene la URL de redirect configurada
3. AuthCallback no procesó correctamente el callback

**Dónde se detiene:** En AuthCallback, cuando getSession() retorna null.

---

### Escenario 2: "Loading stuck at true"

**Logs que verás:**
```
>>> Antes de setLoading(false)
```

**Pero NO verás:**
```
<<< Después de setLoading(false)
```

**Diagnóstico:** El estado de React no se actualizó después de setLoading(false).

**Posibles causas:**
1. Error en setSession() que previene la actualización
2. El componente se desmontó antes de completar
3. Error no capturado en el useEffect

**Dónde se detiene:** En AuthContext, después de setSession(session) pero antes de setLoading(false).

---

### Escenario 3: "Session resolved but user is null"

**Logs que verás:**
```
=== SESIÓN INICIAL ===
Session: ✓ Presente
Usuario ID: undefined
Usuario Email: undefined
User Metadata: undefined
```

**Diagnóstico:** La sesión existe pero no tiene datos de usuario.

**Posibles causas:**
1. La sesión expiró
2. Error en la respuesta de Supabase
3. El objeto session está malformado

**Dónde se detiene:** En AuthContext, al intentar acceder a session.user.

---

### Escenario 4: "onAuthStateChange never fires"

**Logs que verás:**
```
>>> Configurando onAuthStateChange listener...
<<< onAuthStateChange listener configurado
```

**Pero NO verás:**
```
=== EVENTO onAuthStateChange DISPARADO ===
```

**Diagnóstico:** El listener de cambios de autenticación no recibe eventos.

**Posibles causas:**
1. Supabase client no está inicializado correctamente
2. Error en la configuración de Supabase
3. El usuario no está interactuando con la autenticación

**Dónde se detiene:** En AuthContext, el listener está configurado pero nunca se dispara.

---

### Escenario 5: "ProtectedRoute stuck on spinner"

**Logs que verás:**
```
=== PROTECTEDROUTE RENDER ===
Estado: { loading: true, session: Ausente }
⚠️  ProtectedRoute: loading = true, mostrando spinner
```

**Diagnóstico:** loading permanece en true indefinidamente.

**Posibles causas:**
1. setLoading(false) nunca se llamó
2. Error en AuthContext que previene setLoading(false)
3. El useEffect de AuthContext nunca se completó

**Dónde se detiene:** En ProtectedRoute, esperando que loading cambie a false.

---

### Escenario 6: "AuthCallback redirects but no session"

**Logs que verás:**
```
=== AUTHCALLBACK COMPONENTE MONTADO ===
>>> Llamando a supabase.auth.getSession() en AuthCallback...
<<< supabase.auth.getSession() completado en AuthCallback
⚠️  No se encontró sesión después del callback
data.session es null
>>> Redirigiendo a /?auth_error=no_session
```

**Diagnóstico:** Google OAuth completó pero Supabase no recibió la sesión.

**Posibles causas:**
1. URL de redirect incorrecta en Google Cloud Console
2. Supabase no tiene habilitado el provider de Google
3. Error en el flujo de OAuth

**Dónde se detiene:** En AuthCallback, cuando getSession() retorna null.

---

## Flujo Exitoso Completo

### Carga Inicial (sin sesión)

```
1. === INICIALIZANDO AUTHCONTEXT ===
2. >>> Llamando a supabase.auth.getSession()...
3. <<< supabase.auth.getSession() completado
4. === SESIÓN INICIAL ===
5. Session: ✗ Ausente
6. >>> Antes de setSession(session)
7. <<< Después de setSession(session)
8. >>> Antes de setLoading(false)
9. <<< Después de setLoading(false)
10. >>> Configurando onAuthStateChange listener...
11. <<< onAuthStateChange listener configurado
12. === PROTECTEDROUTE RENDER ===
13. Estado: { loading: false, session: Ausente }
14. ✓ ProtectedRoute: loading = false, session = null, mostrando Login
15. === HEADER RENDER ===
16. Estado de auth: { user: Ausente }
```

### Login con Google

```
1. >>> handleLogin iniciado
2. === DIAGNÓSTICO DE LOGIN ===
3. Origen actual: http://localhost:3000
4. URL de redirección: http://localhost:3000/auth/callback
5. [Usuario es redirigido a Google]
6. === AUTHCALLBACK COMPONENTE MONTADO ===
7. >>> Esperando 500ms para que Supabase procese el callback...
8. <<< Espera completada
9. >>> Llamando a supabase.auth.getSession() en AuthCallback...
10. <<< supabase.auth.getSession() completado en AuthCallback
11. ✓ Sesión establecida correctamente en AuthCallback
12. Usuario: user@example.com
13. Provider: google
14. >>> Redirigiendo a / (home) tras login exitoso
15. === INICIALIZANDO AUTHCONTEXT ===
16. === SESIÓN INICIAL ===
17. Session: ✓ Presente
18. Usuario ID: [ID]
19. Usuario Email: user@example.com
20. === EVENTO onAuthStateChange DISPARADO ===
21. Evento: SIGNED_IN
22. >>> Evento SIGNED_IN detectado, iniciando creación de perfil...
23. === CREANDO PERFIL DE USUARIO ===
24. ✓ Perfil creado exitosamente
25. === PROTECTEDROUTE RENDER ===
26. Estado: { loading: false, session: Presente }
27. ✓ ProtectedRoute: loading = false, session = presente, mostrando children
28. === HEADER RENDER ===
29. Estado de auth: { user: Presente, userEmail: user@example.com }
```

## Cómo Usar Esta Guía

1. **Abre la consola del navegador** (F12)
2. **Limpia la consola** para ver solo los logs nuevos
3. **Realiza la acción** que quieres debuggear (login, recargar página, etc.)
4. **Copia los logs** que aparecen
5. **Compara con los escenarios** de esta guía
6. **Identifica dónde se detiene** el flujo
7. **Revisa las posibles causas** para ese escenario
8. **Aplica la solución** sugerida

## Comandos Útiles

### Limpiar localStorage
```javascript
localStorage.clear()
location.reload()
```

### Ver sesión en localStorage
```javascript
console.log(JSON.parse(localStorage.getItem('sb-[project-id]-auth-token')))
```

### Ver estado de Supabase
```javascript
const { supabase } = await import('./src/lib/supabaseClient.js')
const { data } = await supabase.auth.getSession()
console.log(data)
```

### Forzar recarga de sesión
```javascript
window.location.href = '/auth/callback'
```

## Checklist de Debugging

- [ ] Abre la consola del navegador
- [ ] Limpia la consola
- [ ] Recarga la página
- [ ] Verifica que aparezca "=== INICIALIZANDO AUTHCONTEXT ==="
- [ ] Verifica que aparezca "<<< Después de setLoading(false)"
- [ ] Verifica que loading cambie a false en ProtectedRoute
- [ ] Intenta iniciar sesión con Google
- [ ] Verifica que aparezca "=== AUTHCALLBACK COMPONENTE MONTADO ==="
- [ ] Verifica que la sesión se establezca correctamente
- [ ] Verifica que aparezca "=== EVENTO onAuthStateChange DISPARADO ==="
- [ ] Verifica que el evento sea "SIGNED_IN"
- [ ] Verifica que el perfil se cree correctamente
- [ ] Verifica que Header muestre el usuario logueado
