#!/bin/bash

# Script para corregir el .env del servidor directamente
# Ejecutar en el servidor: bash scripts/corregir-env-servidor-directo.sh

set -e

echo "=========================================="
echo "🔧 CORREGIR .ENV DEL SERVIDOR"
echo "=========================================="

cd /root/boletera

echo ""
echo "=== PASO 1: Backup del .env actual ==="
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

echo ""
echo "=== PASO 2: Crear .env corregido ==="
cat > .env << 'EOF'
NEXT_PUBLIC_SUPABASE_URL="https://hlvhuwwatnzqiviopqrj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4"
# Session Pooler (IPv4) - Recomendado para VPS sin IPv6
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
# Conexión directa para migraciones de Prisma (sin pooler)
DIRECT_URL="postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"
QR_SECRET_KEY="gr-qr-secret-2025-cambiar-en-produccion"
JWT_SECRET="8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a"

# Clip Payment Gateway Configuration
# API Key para Checkout Transparente (obtener desde Panel de Desarrolladores de Clip)
CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
# Para compatibilidad con código legacy
CLIP_AUTH_TOKEN="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_WEBHOOK_SECRET="bfb49cda-a55d-40d6-9049-39987ba016f2"
# API Key pública para el SDK del frontend (Checkout Transparente)
NEXT_PUBLIC_CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
EOF

echo "✅ Archivo .env recreado"

echo ""
echo "=== PASO 3: Verificar línea 9 ==="
echo "Línea 9:"
nl -ba .env | sed -n '9p'

echo ""
echo "=== PASO 4: Verificar DATABASE_URL ==="
grep "^DATABASE_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

echo ""
echo "=== PASO 5: Reiniciar PM2 ==="
pm2 restart boletera --update-env

echo ""
echo "=== PASO 6: Ver logs (últimas 20 líneas) ==="
sleep 3
pm2 logs boletera --lines 20 --nostream

echo ""
echo "=========================================="
echo "✅ .ENV CORREGIDO Y PM2 REINICIADO"
echo "=========================================="
echo ""
echo "Verifica los logs con: pm2 logs boletera --lines 50"
echo "NO debe aparecer el error 'Regia: command not found'"
echo ""
