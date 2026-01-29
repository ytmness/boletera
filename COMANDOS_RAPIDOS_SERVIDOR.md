# ⚡ Comandos Rápidos para Corregir el Servidor

## PROBLEMA ACTUAL

```
.env: line 9: Regia: command not found
Authentication failed against database server
```

## SOLUCIÓN EN 2 PASOS

### Paso 1: Corregir el .env

Copia y pega **TODO** este bloque en tu terminal SSH:

```bash
cd /root/boletera

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Crear .env corregido
cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL="https://hlvhuwwatnzqiviopqrj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4"
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"
QR_SECRET_KEY="gr-qr-secret-2025-cambiar-en-produccion"
JWT_SECRET="8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a"
CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_AUTH_TOKEN="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_WEBHOOK_SECRET="bfb49cda-a55d-40d6-9049-39987ba016f2"
NEXT_PUBLIC_CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
ENVEOF

echo "✅ .env creado"
```

### Paso 2: Verificar y reiniciar

```bash
# Verificar línea 9 (debe mostrar: NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera")
nl -ba .env | sed -n '9p'

# Verificar DATABASE_URL
grep "^DATABASE_URL=" .env | head -c 80
echo "..."

# Reiniciar PM2
pm2 restart boletera --update-env

# Ver logs
pm2 logs boletera --lines 30
```

## Verificación de Éxito

Después de ejecutar los comandos, verifica:

### ✅ NO debe aparecer:
- ❌ `.env: line 9: Regia: command not found`

### ✅ Debe aparecer:
- ✅ `Next.js 14.2.35`
- ✅ `Ready in XXXms`
- ✅ Sin errores de autenticación de Prisma

## Si Persiste el Error de Autenticación de Prisma

El error de autenticación significa que la contraseña es incorrecta o el formato del `DATABASE_URL` está mal.

### Verificar contraseña en Supabase

1. Ve a https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database
2. En la sección "Connection string", selecciona **"Session pooler"**
3. Copia la contraseña que aparece
4. Reemplaza `7ianbJsQzipn2IFk` en el `.env` con la contraseña correcta

### Comando para probar conexión directa

```bash
cd /root/boletera

# Cargar variables
source .env

# Probar conexión
psql "$DATABASE_URL" -c "SELECT 1;"
```

Si funciona, verás:
```
 ?column?
----------
        1
(1 row)
```

Si no funciona, la contraseña es incorrecta.

## Comandos de Diagnóstico

```bash
# Ver todo el .env (sin mostrar contraseñas)
cat .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

# Ver solo las líneas problemáticas
grep -E "^[^#]*=.*[[:space:]]" .env | grep -v '="'

# Ver estado de PM2
pm2 status

# Ver logs en tiempo real
pm2 logs boletera --lines 100

# Ver variables de entorno cargadas
pm2 env boletera 2>/dev/null | head -20
```

## Notas Importantes

1. **Todos los valores con espacios DEBEN ir entre comillas**
2. **Las URLs de PostgreSQL DEBEN ir entre comillas**
3. **El pooler de Supabase requiere el usuario** `postgres.hlvhuwwatnzqiviopqrj` (con project ref)
4. **El parámetro** `?pgbouncer=true` es necesario para evitar problemas con Prisma
5. **PM2** carga el `.env` a través de `start-app.sh` que usa `source .env`
