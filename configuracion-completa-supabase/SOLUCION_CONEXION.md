# 🔧 Solución: Error de Conexión Supabase (P1001)

## 🚨 Problema
Error `P1001: Can't reach database server` - Prisma no puede conectarse a Supabase.

Tu proyecto Supabase: `hlvhuwwatnzqiviopqrj`

---

## ✅ Solución Paso a Paso

### 1. Obtener Credenciales Correctas de Supabase

Ve a tu proyecto Supabase: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj

#### A. Settings > API
Copia:
- **Project URL**: `https://hlvhuwwatnzqiviopqrj.supabase.co`
- **anon/public key**: La key larga que empieza con `eyJ...`
- **service_role key**: La otra key (solo para backend)

#### B. Settings > Database
Ve a **Connection string** y selecciona **URI**

Verás algo como:
```
postgresql://postgres.hlvhuwwatnzqiviopqrj:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**IMPORTANTE**: 
- Reemplaza `[YOUR-PASSWORD]` con tu contraseña real
- Usa el **connection pooler** (puerto 6543) para mejor rendimiento

---

### 2. Configurar `.env.local` Correctamente

Crea/edita `.env.local` en la raíz de tu proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (tu anon key completa)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)

# Database (Prisma) - CON CONNECTION POOLER
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Database - CONEXIÓN DIRECTA (para migraciones)
DIRECT_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"

# QR Code Configuration
QR_SECRET_KEY=cambiar-en-produccion-12345

# Auth (genera uno nuevo)
JWT_SECRET=genera-uno-nuevo-con-el-comando-de-abajo
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. Probar Conexión

#### Opción A: Con Prisma Studio
```bash
# Esto intentará conectarse a la BD
npx prisma studio
```

Si abre Prisma Studio (http://localhost:5555), ¡la conexión funciona! ✅

#### Opción B: Con un script de prueba

Crea `test-connection.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Probando conexión...')
  
  try {
    await prisma.$connect()
    console.log('✅ Conexión exitosa!')
    
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 Versión PostgreSQL:', result)
  } catch (error) {
    console.error('❌ Error de conexión:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

Ejecuta:
```bash
node test-connection.js
```

---

### 4. Errores Comunes y Soluciones

#### Error: "password authentication failed"
❌ La contraseña es incorrecta

**Solución:**
1. Ve a Supabase > Settings > Database
2. Click en **Reset database password**
3. Copia la nueva contraseña
4. Actualiza `.env.local`

#### Error: "timeout" o "ETIMEDOUT"
❌ El firewall o red bloquea la conexión

**Solución:**
1. Verifica tu conexión a internet
2. Desactiva VPN si usas
3. Verifica que el proyecto Supabase esté activo (no pausado)

#### Error: "SSL connection required"
❌ Falta `?sslmode=require` en la URL

**Solución:**
Agrega al final de `DATABASE_URL`:
```
...postgres?sslmode=require
```

#### Error: "too many connections"
❌ Límite de conexiones alcanzado

**Solución:**
Usa **connection pooler**:
```
postgresql://postgres.hlvhuwwatnzqiviopqrj:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

### 5. Verificar en Supabase Dashboard

Ve a tu proyecto y verifica:

1. **Project Settings > General**
   - Estado: Active ✅
   - Si dice "Paused" → Click en "Restore"

2. **Database > Connection pooler**
   - Debe estar habilitado (toggle ON)

3. **Database > Tables**
   - Si está vacío = normal, aplicaremos schema después

---

### 6. Aplicar Schema de Prisma

Una vez que la conexión funcione:

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar schema a Supabase
npx prisma db push

# Confirmar cuando pregunte
# Esto creará todas las tablas
```

Deberías ver:
```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

---

### 7. Crear Usuarios de Prueba (Seed)

```bash
# Ejecutar seed
npx tsx prisma/seed.ts
```

Esto crea:
- Usuario Admin: `admin@grupoRegia.com` / `admin123`
- Usuario Vendedor: `vendedor@grupoRegia.com` / `vendedor123`
- Evento de prueba: Víctor Mendivil

---

## 🔍 Debugging Avanzado

### Ver logs de Prisma
```bash
# Activar logs de debug
export DEBUG="prisma:*"
npx prisma db push
```

### Probar conexión con psql
```bash
# Si tienes PostgreSQL instalado
psql "postgresql://postgres.hlvhuwwatnzqiviopqrj:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

### Revisar variables de entorno
```bash
# Ver si están cargadas
node -e "console.log(process.env.DATABASE_URL)"
```

---

## 📋 Checklist de Conexión

Antes de ejecutar `prisma db push`, verifica:

- [ ] Proyecto Supabase está **Active** (no paused)
- [ ] Copiaste la contraseña correcta (la que generaste/reseteaste)
- [ ] Reemplazaste `[YOUR-PASSWORD]` en `.env.local`
- [ ] Usaste el **connection pooler** (puerto 6543)
- [ ] El archivo es `.env.local` (NO `.env.example`)
- [ ] Reiniciaste terminal después de editar `.env.local`
- [ ] `npx prisma studio` abre sin errores

---

## 🆘 Si Nada Funciona

### Opción 1: Crear nuevo proyecto Supabase
Si el proyecto está corrupto o inaccesible:
1. Crea nuevo proyecto en Supabase
2. Copia las nuevas credenciales
3. Aplica el schema

### Opción 2: Usar Railway/Neon
Si Supabase sigue sin funcionar:
1. Crea base de datos en Railway o Neon
2. Usa esa connection string
3. Más simple que Supabase

### Opción 3: PostgreSQL local
Para desarrollo local:
```bash
# Con Docker
docker run --name postgres-local -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/boletera"
```

---

## ✅ Cuando Funcione

Deberías poder:
1. ✅ `npx prisma studio` - Ver la BD
2. ✅ `npx prisma db push` - Crear tablas
3. ✅ `npx tsx prisma/seed.ts` - Crear usuarios
4. ✅ `npm run dev` - Correr app
5. ✅ Ir a `/login` y entrar

---

## 📞 Información de tu Proyecto

**Project Reference**: `hlvhuwwatnzqiviopqrj`
**Region**: AWS us-east-1 (probablemente)
**Pool Mode**: Transaction
**Connection Pooler Port**: 6543
**Direct Connection Port**: 5432

---

**Siguiente paso**: Una vez que me confirmes que la conexión funciona (con `npx prisma studio`), puedo ayudarte con el siguiente paso.

¿Qué error específico ves cuando ejecutas `npx prisma db push`?
