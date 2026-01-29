#!/bin/bash
# Comando completo para actualizar .env en el servidor con Session Pooler correcto
# Ejecutar en el servidor: bash COMANDO_ACTUALIZAR_ENV_SERVIDOR.sh

cd /var/www/boletera

# Backup del env actual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

# Escribir .env correcto (SESSION POOLER IPv4)
cat > .env << 'ENVEOF'
# =========================
# SUPABASE PUBLIC
# =========================
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI

# =========================
# SUPABASE SERVICE (SERVER ONLY)
# =========================
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4

# =========================
# DATABASE (SESSION POOLER - IPv4)
# =========================
DATABASE_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:t6tCl2AyNaQDMTFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:t6tCl2AyNaQDMTFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# =========================
# APP
# =========================
NEXT_PUBLIC_APP_URL=https://scenario.com.mx
NEXT_PUBLIC_APP_NAME=Grupo Regia - Boletera

# =========================
# SECURITY
# =========================
JWT_SECRET=8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a
QR_SECRET_KEY=gr-qr-secret-2025-cambiar-en-produccion

# =========================
# CLIP
# =========================
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
ENVEOF

echo "✅ .env actualizado con Session Pooler correcto"
echo ""
echo "📋 Verificación:"
grep -E '^(DATABASE_URL|DIRECT_URL)=' .env
echo ""
echo "🧪 Prueba de conexión:"
PGPASSWORD="t6tCl2AyNaQDMTFk" psql "host=aws-1-us-east-2.pooler.supabase.com port=5432 dbname=postgres user=postgres.hlvhuwwatnzqiviopqrj sslmode=require" -c "select current_user, now();"
