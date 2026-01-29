# ✅ Configuración Correcta del Connection Pooler

## Paso 1: Obtener Connection String del Pooler desde Supabase

1. Ve a: **https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database**
2. Busca **"Connection string"** o **"Connection pooling (PgBouncer)"**
3. Selecciona **"Transaction"** (recomendado para Next.js/serverless) o **"Session"** si Supabase lo sugiere
4. **Copia el URI completo** que te da el dashboard

El formato debería ser algo como:
```
postgresql://postgres.hlvhuwwatnzqiviopqrj:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**⚠️ IMPORTANTE**: 
- El usuario debe ser `postgres.hlvhuwwatnzqiviopqrj` (con el project ref)
- El host es tipo `aws-0-...pooler.supabase.com`
- El puerto típico es `6543`

## Paso 2: Configurar .env en el Servidor

Conéctate por SSH y ejecuta:

```bash
cd /var/www/boletera

# Hacer backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Editar .env
nano .env
```

**Actualiza las líneas `DATABASE_URL` y `DIRECT_URL` con este formato:**

```env
# Runtime (pooler IPv4) - Para la aplicación
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migraciones/Prisma introspection (directo)
# Nota: Si no puedes conectar desde el VPS por IPv6, puedes hacer migraciones desde tu laptop
DIRECT_URL="postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres"
```

**⚠️ Puntos clave:**
- Usuario del pooler: `postgres.hlvhuwwatnzqiviopqrj` (con el project ref)
- Parámetro `?pgbouncer=true` evita problemas con Prisma + PgBouncer
- Parámetro `&connection_limit=1` recomendado para serverless

**Guarda:** `Ctrl+O`, `Enter`, `Ctrl+X`

## Paso 3: Verificar schema.prisma

Verifica que tu `prisma/schema.prisma` tenga:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Paso 4: Generar Cliente Prisma

```bash
cd /var/www/boletera

# Generar cliente Prisma
./node_modules/.bin/prisma generate
```

## Paso 5: Probar Conectividad al Pooler

```bash
cd /var/www/boletera

# Probar conexión al puerto del pooler
nc -zv aws-0-us-east-1.pooler.supabase.com 6543

# Probar con psql
PGPASSWORD="7ianbJsQzipn2IFk" psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.hlvhuwwatnzqiviopqrj -d postgres -c "SELECT version();"
```

## Paso 6: Sincronizar Schema (si es necesario)

```bash
cd /var/www/boletera

# Si puedes conectar, sincronizar schema
./node_modules/.bin/prisma db push
```

**Nota**: Si `db push` falla porque `DIRECT_URL` no conecta desde el VPS (problema IPv6), puedes:
- Hacer las migraciones desde tu laptop local (donde sí funciona IPv6)
- O usar el pooler también para `DIRECT_URL` temporalmente

## Paso 7: Reiniciar PM2 con --update-env

**⚠️ IMPORTANTE**: PM2 no recarga `.env` automáticamente. Debes usar `--update-env`:

```bash
cd /var/www/boletera

# Reiniciar PM2 cargando el nuevo .env
pm2 restart boletera --update-env

# Ver logs
pm2 logs boletera --lines 30
```

## Paso 8: Verificar que la App Ve las Variables Correctas

Para verificar que Next.js está leyendo el `.env` correcto, puedes temporalmente agregar un log:

```bash
# Ver el contenido del .env
cat /var/www/boletera/.env | grep DATABASE_URL

# Ver logs de PM2 para confirmar que no hay errores de conexión
pm2 logs boletera --lines 50
```

## 📝 Comandos Completos en una Sola Ejecución

```bash
cd /var/www/boletera

# 1. Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# 2. Actualizar .env (edita manualmente con nano)
nano .env
# Pega el formato correcto de arriba

# 3. Verificar schema.prisma
cat prisma/schema.prisma | grep -A 3 "datasource db"

# 4. Generar Prisma
./node_modules/.bin/prisma generate

# 5. Probar conectividad
nc -zv aws-0-us-east-1.pooler.supabase.com 6543
PGPASSWORD="7ianbJsQzipn2IFk" psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.hlvhuwwatnzqiviopqrj -d postgres -c "SELECT version();"

# 6. Sincronizar schema (si conecta)
./node_modules/.bin/prisma db push

# 7. Build
rm -rf .next
npm run build

# 8. Reiniciar PM2 con --update-env
pm2 restart boletera --update-env

# 9. Verificar
pm2 status
pm2 logs boletera --lines 30
```

## 🔍 Si Necesitas Hacer Migraciones desde tu Laptop

Si `DIRECT_URL` no funciona desde el VPS (problema IPv6), puedes hacer migraciones desde tu máquina local:

```bash
# En tu laptop (donde sí funciona IPv6)
cd /ruta/a/boletera

# Usar DIRECT_URL para migraciones
./node_modules/.bin/prisma db push

# O generar migraciones
./node_modules/.bin/prisma migrate dev
```

## 🆘 Troubleshooting

### Error: "Tenant or user not found"
- Verifica que el usuario sea `postgres.hlvhuwwatnzqiviopqrj` (con el project ref)
- No uses solo `postgres` para el pooler

### Error: Prisma no conecta con pooler
- Asegúrate de tener `?pgbouncer=true` en la URL
- Verifica que `connection_limit=1` esté presente

### PM2 no carga el nuevo .env
- Usa `pm2 restart boletera --update-env` (no solo `restart`)
- O detén y vuelve a iniciar: `pm2 delete boletera && pm2 start npm --name boletera -- start --cwd /var/www/boletera`
