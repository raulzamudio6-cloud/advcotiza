# AdvCotiza

Sistema web para que agencias de viajes creen, calculen, guarden y compartan cotizaciones profesionales.

## Estado de la arquitectura

La aplicación es un frontend SPA construido con React y Vite. El navegador consume directamente la API de Supabase mediante `@supabase/supabase-js`; no existe un backend Node.js propio en este repositorio.

La arquitectura de datos prevista tiene dos entornos aislados:

| Entorno | Aplicación | Persistencia | Propósito |
| --- | --- | --- | --- |
| Local / pruebas | Vite en `http://localhost:3000` | PostgreSQL local, expuesto mediante Supabase local | Desarrollo, pruebas manuales e integración local |
| Staging | Build desplegado en el entorno de staging | Proyecto Supabase independiente con PostgreSQL administrado | Validación antes de producción |

Supabase no reemplaza PostgreSQL: su base de datos es PostgreSQL y además proporciona Auth, PostgREST y Storage. Como el cliente usa autenticación y archivos además de tablas, el entorno local recomendado es la [instancia local de Supabase](https://supabase.com/docs/guides/cli/local-development), que incluye PostgreSQL local. Una conexión directa a un PostgreSQL crudo no es compatible con el frontend actual sin añadir un backend o una API intermedia.

**Importante:** nunca se deben compartir credenciales, usuarios, datos ni URLs entre local, staging y producción. Cada entorno debe tener su propio proyecto/base de datos y sus propias variables `VITE_*`.

## Funcionalidad

- Gestión de pasajeros, incluidos menores.
- Comparación y selección de opciones de vuelos.
- Comparación y selección de alojamientos.
- Traslados, tours y servicios adicionales.
- Cálculo en tiempo real de costos netos, comisión y precio final.
- Vista previa de la cotización.
- Exportación a PDF y Excel.
- Configuración de la agencia, logo, contacto, redes sociales y políticas.
- Historial de cotizaciones por usuario.
- Inicio de sesión con Google mediante Supabase Auth.
- Fallback a `localStorage` para guardar cotizaciones si Supabase no está disponible.

## Stack tecnológico

- React 18 y React Router 7.
- Vite 4 y Tailwind CSS 3.
- Supabase JS para Auth, PostgreSQL vía API y Storage.
- PostgreSQL para persistencia en local y staging.
- `jsPDF` y `html2canvas` para PDF.
- `xlsx` para Excel.
- `date-fns`, `clsx` y `lucide-react`.

## Requisitos

- Node.js 16 o superior.
- npm.
- Para pruebas con persistencia local: [Supabase CLI](https://supabase.com/docs/guides/cli) y Docker Desktop.
- Para staging: un proyecto Supabase independiente y un proveedor OAuth de Google configurado.

## Puesta en marcha local

### 1. Instalar la aplicación

```bash
npm install
```

### 2. Levantar PostgreSQL y los servicios locales

El repositorio contiene migraciones SQL, pero todavía no incluye un archivo `config.toml` ni scripts npm para administrar el stack local. Cuando se habilite Supabase CLI en el proyecto, el flujo esperado será:

```bash
supabase start
supabase db reset
```

`supabase db reset` aplica las migraciones de `supabase/migrations/` sobre el PostgreSQL local. La URL y la clave anon que imprime `supabase start` deben usarse en el archivo `.env.local`.

### 3. Configurar variables locales

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=tu-clave-anon-local
```

No subir `.env.local` al repositorio. Vite solo expone al navegador variables con prefijo `VITE_`; la clave anon es pública por diseño, pero el aislamiento y la seguridad real dependen de Auth y de las políticas RLS.

### 4. Ejecutar el frontend

```bash
npm run dev
```

La URL local es `http://localhost:3000`. Para comprobar un build de producción local:

```bash
npm run build
npm run preview
```

El script `npm run serve` no debe usarse actualmente: `package.json` lo declara, pero el repositorio no contiene `server.js`.

## Configuración de staging

Staging debe usar un proyecto Supabase separado del entorno local y de producción.

1. Crear el proyecto Supabase de staging.
2. Aplicar las migraciones de `supabase/migrations/` al proyecto de staging, preferiblemente con Supabase CLI.
3. Habilitar Google en **Authentication > Providers**.
4. Registrar la URL de staging como redirect URL de Supabase y de Google OAuth, incluyendo `/auth/callback`.
5. Configurar en el proveedor de despliegue:

```env
VITE_SUPABASE_URL=https://tu-proyecto-staging.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-staging
```

6. Ejecutar el build usando las variables de staging:

```bash
npm run build
```

`vercel.json` envía todas las rutas al `index.html`, lo que permite que React Router resuelva `/auth/callback` y las vistas de la SPA en Vercel.

## Arquitectura del código

```text
src/
├── main.jsx                         # Entrada, BrowserRouter y utilidades de diagnóstico
├── App.jsx                          # Composición de vistas y flujo principal
├── components/
│   ├── UI/                          # Componentes visuales reutilizables
│   ├── PassengerManager.jsx         # Pasajeros
│   ├── FlightModule.jsx             # Vuelos
│   ├── HotelModule.jsx              # Alojamientos
│   ├── AdditionalServicesModule.jsx # Traslados y extras
│   ├── PreviewPanel.jsx             # Vista previa y totales
│   ├── PricingLogic.jsx             # Configuración de comisión
│   ├── QuotationHistory.jsx         # Historial y acciones de cotizaciones
│   ├── AgencySettings.jsx           # Configuración de agencia
│   ├── PDFGenerator.jsx             # Exportación PDF
│   ├── ExcelExport.jsx              # Exportación Excel
│   └── AuthCallback.jsx             # Retorno de OAuth
├── hooks/
│   └── useTravelQuotation.js        # Estado del formulario y useReducer
├── contexts/
│   ├── AuthContext.jsx              # Sesión y Google OAuth
│   └── AgencyConfigContext.jsx       # Configuración de agencia
├── services/
│   ├── quotationService.js           # CRUD de cotizaciones en Supabase
│   ├── agencyService.js              # CRUD de agencias en Supabase
│   └── storageService.js             # Fallback de cotizaciones en localStorage
├── lib/
│   └── supabaseClient.js             # Cliente y fallback cuando faltan variables
└── utils/
    ├── calculations.js               # Validación, sanitización y cálculos
    ├── currencyUtils.js              # Monedas
    └── formatters.js                 # Formateo de datos
```

### Flujo de ejecución

1. `main.jsx` monta `BrowserRouter` y `App`.
2. `AuthProvider` recupera la sesión de Supabase y escucha cambios de autenticación.
3. `ProtectedRoute` restringe la aplicación a usuarios autenticados; `/auth/callback` procesa el retorno de Google.
4. `useTravelQuotation` mantiene el borrador de la cotización con `useReducer`.
5. Los módulos editan el estado mediante acciones y `calculations.js` produce valores derivados.
6. `App` muestra el formulario, la vista previa, el historial o ajustes, y delega persistencia a los servicios.
7. La cotización se guarda en `cotizaciones`; si la operación falla, se intenta `localStorage`.

## Modelo de datos y seguridad

Las migraciones actuales son la fuente de verdad del esquema:

- `agencias`: configuración de la agencia asociada a `auth.users`.
- `cotizaciones`: datos de la cotización en columnas `JSONB`, comisión, usuario, agencia y timestamps.
- Storage `agency-logos`: logos de agencia.

Las tablas tienen Row Level Security (RLS): cada usuario puede consultar y modificar sus propios registros. Las políticas del bucket restringen la escritura y eliminación a la carpeta del usuario, mientras que la lectura pública permite usar los logos en documentos.

`SUPABASE_SETUP.md` contiene instrucciones históricas y un esquema anterior. Para cambios nuevos o despliegues, usar `supabase/migrations/` y mantener ese documento alineado antes de reutilizar sus SQL.

### Pendientes de arquitectura

- Versionar la configuración de Supabase CLI (`supabase/config.toml`) y comandos de ciclo de vida local si el equipo va a ejecutar PostgreSQL local de forma habitual.
- `AuthContext` intenta crear registros en `profiles` después del primer login, pero esa tabla no está definida en las migraciones actuales. La creación falla de forma no bloqueante; si se necesita un perfil persistente, debe añadirse una migración y sus políticas RLS.
- Revisar la política de inserción de `cotizaciones` junto con el flujo de creación de agencia: la migración exige una `agencia_id` perteneciente al usuario, mientras el servicio contempla guardar sin agencia cuando no encuentra configuración.

## Comandos disponibles

| Comando | Uso |
| --- | --- |
| `npm run dev` | Servidor Vite en el puerto 3000 |
| `npm run build` | Build de producción |
| `npm run preview` | Servir localmente el build generado |
| `npm run serve` | Declarado, pero requiere un `server.js` que hoy no existe |

## Validación antes de publicar

- Confirmar que el build termina con `npm run build`.
- Verificar login de Google y retorno a `/auth/callback`.
- Crear, actualizar, listar y eliminar una cotización.
- Confirmar aislamiento entre usuarios mediante RLS.
- Probar configuración y logo de agencia.
- Generar PDF y Excel.
- Comprobar que el fallback local no se confunda con la persistencia de staging.

El proyecto todavía no tiene una suite automatizada configurada. Se recomienda añadir pruebas unitarias para `utils/`, pruebas de integración para los servicios y una prueba end-to-end del flujo login → cotización → guardado → exportación.

## Licencia

Este proyecto declara licencia MIT en `package.json`. No se incluye actualmente un archivo `LICENSE` en el repositorio.
