# Configuración de Supabase para AdVCotiza

Este documento describe cómo configurar Supabase para el almacenamiento persistente de cotizaciones en la nube.

## Requisitos Previos

1. Cuenta en [Supabase](https://supabase.com)
2. Proyecto de Supabase creado

## Pasos de Configuración

### 1. Obtener Credenciales de Supabase

1. Inicia sesión en [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings > API**
4. Copia los siguientes valores:
   - `Project URL` (para `VITE_SUPABASE_URL`)
   - `anon public` key (para `VITE_SUPABASE_ANON_KEY`)

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu-project-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Ejemplo:**
```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar Base de Datos

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase para crear las tablas necesarias:

```sql
-- Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de agencias
CREATE TABLE IF NOT EXISTS agencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agency_name TEXT NOT NULL,
  agency_logo TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  agencia_id UUID REFERENCES agencias(id),
  quotation_title TEXT NOT NULL,
  commission_rate NUMERIC DEFAULT 20,
  client_info JSONB NOT NULL,
  trip_duration JSONB,
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  flights JSONB NOT NULL DEFAULT '[]'::jsonb,
  accommodations JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_services JSONB NOT NULL DEFAULT '{"transfers": {}, "extras": []}'::jsonb,
  calculations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS cotizaciones_user_id_idx ON cotizaciones(user_id);
CREATE INDEX IF NOT EXISTS cotizaciones_created_at_idx ON cotizaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS agencias_user_id_idx ON agencias(user_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas RLS para agencias
CREATE POLICY "Users can view own agency"
  ON agencias FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agency"
  ON agencias FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agency"
  ON agencias FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas RLS para cotizaciones
CREATE POLICY "Users can view own quotations"
  ON cotizaciones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotations"
  ON cotizaciones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotations"
  ON cotizaciones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotations"
  ON cotizaciones FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencias_updated_at
  BEFORE UPDATE ON agencias
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_updated_at
  BEFORE UPDATE ON cotizaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configurar Autenticación con Google

1. En Supabase Dashboard, ve a **Authentication > Providers**
2. Habilita **Google** como proveedor
3. Configura las credenciales de OAuth de Google:
   - Client ID
   - Client Secret
   - Redirect URL (debe ser tu URL de aplicación)

Para obtener las credenciales de Google:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un proyecto o selecciona uno existente
3. Habilita la API de Google+ y Google Identity
4. Crea credenciales OAuth 2.0
5. Configura las URLs de redirección autorizadas

### 5. Probar la Configuración

1. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en el navegador
3. Inicia sesión con Google
4. Crea una cotización y guárdala
5. Verifica que aparezca en "Mis Cotizaciones"
6. Prueba los filtros por nombre de cliente y fecha

## Funcionalidades Implementadas

### ✅ Almacenamiento en la Nube
- Las cotizaciones se guardan en Supabase en lugar de localStorage
- Los datos son persistentes y accesibles desde cualquier dispositivo
- Cada usuario solo ve sus propias cotizaciones (seguridad por usuario)

### ✅ Autenticación con Google
- Inicio de sesión seguro con Google OAuth
- Creación automática de perfil de usuario
- Protección de rutas con autenticación

### ✅ Indicador de "Guardando..."
- Feedback visual mientras se guarda la cotización
- Animación de carga en el botón de guardar
- Mensajes de éxito y error

### ✅ Vista "Mis Cotizaciones" con Filtros
- Lista de todas las cotizaciones del usuario
- Filtro por nombre de cliente (búsqueda parcial)
- Filtro por rango de fechas
- Estadísticas de cotizaciones (total, este mes, última guardada)
- Acciones: ver, cargar, eliminar, exportar, importar

### ✅ Upsert de Cotizaciones
- Las cotizaciones se actualizan si ya existen
- Se crean nuevas si no tienen ID
- Migración automática de cotizaciones de localStorage a Supabase

## Solución de Problemas

### Error: "User not authenticated"
- Asegúrate de haber iniciado sesión con Google
- Verifica que las políticas RLS estén configuradas correctamente

### Error: "Table does not exist"
- Ejecuta el script SQL de configuración de la base de datos
- Verifica que las tablas se hayan creado correctamente en Supabase

### Error: "Invalid API credentials"
- Verifica que las variables de entorno estén configuradas correctamente
- Asegúrate de usar las credenciales correctas de tu proyecto Supabase

### Las cotizaciones no se guardan
- Revisa la consola del navegador para errores
- Verifica que el usuario tenga permisos en las políticas RLS
- Comprueba que la conexión a Supabase esté funcionando

## Migración desde localStorage

Las cotizaciones existentes en localStorage se migrarán automáticamente cuando:
1. Guardes una cotización que tiene un ID de localStorage
2. El sistema detectará que es una cotización antigua y la guardará en Supabase
3. Se generará un nuevo UUID para la cotización en la nube

## Seguridad

- **Row Level Security (RLS):** Cada usuario solo puede acceder a sus propios datos
- **Autenticación:** Requerida para todas las operaciones
- **Validación:** Los datos se validan antes de guardar
- **Encriptación:** Supabase maneja la encriptación en tránsito y en reposo

## Soporte

Para más información, consulta:
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Auth de Supabase](https://supabase.com/docs/guides/auth)
