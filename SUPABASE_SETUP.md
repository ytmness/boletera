# 🔧 Guía de Configuración de Supabase

Esta guía te ayudará a configurar Supabase para el proyecto Boletera Regia.

---

## 1️⃣ Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** o **"New Project"**
3. Selecciona tu organización (o crea una nueva)
4. Completa los datos:
   - **Name**: `boletera-regia` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura y **guárdala**
   - **Region**: Selecciona la más cercana a México (ej: `us-east-1`)
   - **Pricing Plan**: Free (para desarrollo)

5. Haz clic en **"Create new project"**
6. Espera 2-3 minutos mientras se crea el proyecto

---

## 2️⃣ Obtener Credenciales

Una vez creado el proyecto:

### API Keys
1. Ve a **Settings** (⚙️) > **API**
2. Copia las siguientes keys:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGci...` (key pública)
   - **service_role**: `eyJhbGci...` (key privada - NUNCA expongas en cliente)

### Database Connection String
1. Ve a **Settings** (⚙️) > **Database**
2. Busca la sección **"Connection string"**
3. Selecciona el tab **"URI"**
4. Copia la connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Reemplaza `[YOUR-PASSWORD]` con la contraseña que generaste al crear el proyecto

---

## 3️⃣ Configurar Variables de Entorno

Edita tu archivo `.env.local`:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (tu anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (tu service role key)

# Database (Prisma)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
\`\`\`

**⚠️ IMPORTANTE**: 
- Reemplaza `[PASSWORD]` con tu contraseña real
- NO compartas estas keys en repositorios públicos
- El archivo `.env.local` ya está en `.gitignore`

---

## 4️⃣ Aplicar Schema de Base de Datos

Ahora que tienes Supabase configurado, aplica el schema de Prisma:

\`\`\`bash
# Generar cliente Prisma
npm run db:generate

# Aplicar el schema a Supabase
npm run db:push
\`\`\`

Si todo está correcto, verás un mensaje como:
\`\`\`
✔ Generated Prisma Client
Database is now in sync with your Prisma schema
\`\`\`

---

## 5️⃣ Verificar en Supabase Dashboard

1. Ve a tu proyecto en Supabase
2. Haz clic en **Table Editor** (📊)
3. Deberías ver todas las tablas creadas:
   - User
   - Event
   - TicketType
   - Sale
   - Ticket
   - TicketScan
   - TicketReprint
   - AuditLog
   - SystemConfig

---

## 6️⃣ (Opcional) Abrir Prisma Studio

Para visualizar y editar datos con una interfaz gráfica:

\`\`\`bash
npm run db:studio
\`\`\`

Esto abrirá Prisma Studio en [http://localhost:5555](http://localhost:5555)

---

## 🔐 Configurar Row Level Security (RLS)

Por seguridad, Supabase recomienda activar Row Level Security (RLS). 

### Opción 1: Desactivar RLS (Solo para desarrollo)
1. Ve a **Database** > **Tables**
2. Para cada tabla, haz clic en los 3 puntos (...) > **Edit table**
3. Desmarca **"Enable Row Level Security (RLS)"**

### Opción 2: Configurar Políticas RLS (Recomendado para producción)
Crearemos las políticas más adelante cuando implementemos autenticación.

Por ahora, puedes desactivar RLS para facilitar el desarrollo.

---

## 🌱 Seed de Datos (Opcional)

Si quieres datos de prueba, puedes crear un usuario admin:

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este query:

\`\`\`sql
-- Crear usuario admin de prueba
INSERT INTO "User" (id, email, password, name, role, "isActive")
VALUES (
  gen_random_uuid(),
  'admin@grupoRegia.com',
  '$2a$10$...',  -- En producción, usa bcrypt para hashear
  'Admin Regia',
  'ADMIN',
  true
);

-- Crear evento de prueba (Víctor Mendivil)
INSERT INTO "Event" (
  id, name, description, artist, tour, venue, address,
  "eventDate", "eventTime", "maxCapacity", "salesStartDate", "salesEndDate", "isActive"
)
VALUES (
  gen_random_uuid(),
  'Víctor Mendivil en Concierto',
  'Gran concierto de Víctor Mendivil',
  'Víctor Mendivil',
  'Tour 2025',
  'Arena Monterrey',
  'Av. Fundidora, Monterrey, NL',
  '2025-03-15 21:00:00',
  '21:00 hrs',
  5000,
  NOW(),
  '2025-03-15 18:00:00',
  true
);
\`\`\`

---

## ✅ Verificación Final

Ejecuta tu app en desarrollo:

\`\`\`bash
npm run dev
\`\`\`

1. Ve a [http://localhost:3000](http://localhost:3000)
2. Si no hay errores de conexión, ¡está todo configurado! ✅

---

## 🆘 Solución de Problemas

### Error: "Can't reach database server"
- Verifica que la connection string sea correcta
- Verifica que reemplazaste `[YOUR-PASSWORD]`
- Verifica que la IP de Supabase sea accesible

### Error: "Invalid API key"
- Verifica que copiaste correctamente las keys
- Verifica que no haya espacios al inicio/final
- Regenera las keys si es necesario (Settings > API > Reset)

### Error en `db:push`
- Verifica que la sintaxis del schema.prisma sea correcta
- Revisa los logs de error para ver qué tabla está causando problemas

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)

---

**¡Listo!** Tu base de datos Supabase está configurada y lista para usar. 🚀
