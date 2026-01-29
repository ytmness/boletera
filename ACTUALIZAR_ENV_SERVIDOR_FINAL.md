# 🔧 Actualizar .env en el Servidor (Session Pooler IPv4)

## Comando Completo para Copiar y Pegar

```bash
cd /var/www/boletera

# Backup del env actual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Escribir .env correcto (SESSION POOLER IPv4)
cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjY5NzU4MTIsImV4cCI6MjA4MjU1MTgxMn0.s51DalBawxuiRGIVXnHnrmuNhzPOsSOvHgoPwxIzido
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk3NTgxMiwiZXhwIjoyMDgyNTUxODEyfQ.AeCe9UxLT2T_-Mbwpc6JI8nECNKC653DPcm8J7x1Z4A

# Session Pooler (IPv4)
DATABASE_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:t6tCl2AyNaQDMTFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:t6tCl2AyNaQDMTFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require

NEXT_PUBLIC_APP_URL=https://scenario.com.mx
NEXT_PUBLIC_APP_NAME=Grupo Regia - Boletera

QR_SECRET_KEY=gr-qr-secret-2025-cambiar-en-produccion
JWT_SECRET=8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a

CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
ENVEOF

# Verificación rápida
grep -E '^(DATABASE_URL|DIRECT_URL|NEXT_PUBLIC_SUPABASE_URL)=' .env
```

## Probar Conexión a Supabase

```bash
# Prueba TCP
nc -zv aws-1-us-east-2.pooler.supabase.com 5432

# Prueba login real (SSL requerido)
PGPASSWORD="t6tCl2AyNaQDMTFk" \
psql "host=aws-1-us-east-2.pooler.supabase.com port=5432 dbname=postgres user=postgres.hlvhuwwatnzqiviopqrj sslmode=require" \
-c "select now();"
```

## Después de Actualizar .env

```bash
cd /var/www/boletera

# Generar Prisma
./node_modules/.bin/prisma generate

# Rebuild
rm -rf .next
npm run build

# Reiniciar PM2 con --update-env
pm2 restart boletera --update-env

# Verificar logs
pm2 logs boletera --lines 60
```

## Optimizaciones Aplicadas

✅ **Webhook de Clip optimizado:**
- `count()` movido fuera del loop (una sola consulta por ticketType)
- Timeout aumentado a 20 segundos
- Contador local incrementado en lugar de hacer count() cada vez

✅ **Checkout optimizado:**
- Transacción eliminada (compatible con pooler)
- Consultas de disponibilidad fuera de la transacción

## Nota de Seguridad

⚠️ **IMPORTANTE**: Las keys en este documento están expuestas. Después de confirmar que funciona:

1. **Rota la contraseña de la base de datos** en Supabase Dashboard
2. **Genera nuevas keys** de Supabase (ANON_KEY y SERVICE_ROLE_KEY)
3. **Rota JWT_SECRET y QR_SECRET_KEY**
4. **Rota los tokens de Clip** si es necesario
