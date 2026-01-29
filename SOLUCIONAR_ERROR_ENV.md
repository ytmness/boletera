# 🔧 Solucionar Error ".env: line 9: Regia: command not found"

Este error ocurre cuando se usa `source .env` en un script y hay variables con espacios sin comillas.

## Diagnóstico Actual

En tu servidor, la línea 9 del `.env` está vacía o mal formateada. El error persiste porque:

1. El `.env` del servidor NO tiene comillas en `NEXT_PUBLIC_APP_NAME`
2. El script `start-app.sh` ejecuta `source .env`, que intenta interpretar los valores como comandos
3. Prisma también falla porque `DATABASE_URL` no está correctamente configurado

## Solución DIRECTA (Más rápida)

Ejecuta estos comandos en el servidor **exactamente como aparecen**:

```bash
cd /root/boletera

# Descargar la última versión del código
git stash
git pull origin main

# Ejecutar el script de corrección
chmod +x scripts/corregir-env-servidor-directo.sh
bash scripts/corregir-env-servidor-directo.sh
```

Este script:
- ✅ Crea un `.env` completamente nuevo con todos los valores entre comillas
- ✅ Configura `DATABASE_URL` con el pooler correcto de Supabase
- ✅ Reinicia PM2 automáticamente
- ✅ Muestra los logs para verificar

## Soluciones Alternativas

### Opción A: Crear .env manualmente

```bash
cd /root/boletera

# Backup
cp .env .env.backup

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

# Verificar línea 9
nl -ba .env | sed -n '9p'

# Reiniciar PM2
pm2 restart boletera --update-env

# Ver logs
pm2 logs boletera --lines 30
```

## Verificación

Después de ejecutar cualquiera de los scripts:

```bash
# Verificar línea 9
nl -ba .env | sed -n '9p'
# Debe mostrar: NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"

# Verificar que no haya valores problemáticos
grep -E "^[^#]*=.*[[:space:]]" .env | grep -v '="' | grep -v "='"
# No debe mostrar nada

# Si usas PM2, reiniciar
pm2 restart boletera --update-env
pm2 logs boletera --lines 50
```

## Formato Correcto del .env

### ✅ CORRECTO (con comillas)
```bash
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:password@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres:password@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
```

### ❌ INCORRECTO (sin comillas)
```bash
NEXT_PUBLIC_APP_NAME=Grupo Regia - Boletera
DATABASE_URL=postgresql://postgres:password@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres
```

## Regla General

**Todo valor con espacios o caracteres especiales debe ir entre comillas dobles.**

## Solución del Error de Autenticación de Prisma

Si después de corregir el `.env` sigues viendo:
```
Authentication failed against database server at `aws-1-us-east-2.pooler.supabase.com`
```

### Verificar contraseña

1. **Confirma que la contraseña es correcta** en el panel de Supabase
2. **Verifica el formato de DATABASE_URL**:
   ```bash
   grep "^DATABASE_URL=" .env
   ```
   
   Debe ser:
   ```
   DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:TU_PASSWORD@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
   ```

3. **Si tu contraseña tiene caracteres especiales** (@, #, :, etc.), encódala:
   ```bash
   python3 - << 'PY'
   import urllib.parse
   pw = input("Password: ")
   print(urllib.parse.quote(pw, safe=""))
   PY
   ```

4. **Prueba la conexión directamente**:
   ```bash
   source .env
   psql "$DATABASE_URL"
   ```

### Verificar que PM2 carga las variables

```bash
pm2 restart boletera --update-env
pm2 env boletera | grep -E "DATABASE_URL|DIRECT_URL"
```

Si no aparecen, PM2 está cargando el `.env` desde `start-app.sh`, lo cual es correcto.

## Comandos Útiles

```bash
# Ver logs de PM2
pm2 logs boletera --lines 50

# Ver estado de PM2
pm2 status

# Reiniciar PM2 con nuevas variables
pm2 restart boletera --update-env

# Ver variables de entorno en PM2
pm2 env boletera

# Ver línea específica del .env
nl -ba .env | sed -n '9p'

# Ver todas las líneas con espacios
grep -E "^[^#]*=.*[[:space:]]" .env
```

## Notas Importantes

1. **No uses `source .env` directamente** en scripts bash si hay valores sin comillas
2. **Next.js/Node.js** lee el `.env` automáticamente con `dotenv`, no necesitas `source`
3. **PM2** debe cargar el `.env` a través de `start-app.sh` que usa `source` de forma segura
4. **El pooler de Supabase** requiere el formato `postgres.hlvhuwwatnzqiviopqrj` (con project ref) en el usuario
