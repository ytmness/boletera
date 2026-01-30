#!/bin/bash

echo "======================================"
echo "🔧 FIX COMPLETO DEL .ENV Y DEPLOY"
echo "======================================"

# Detener PM2 para que deje de reintentar
echo ""
echo "⏸️  Deteniendo PM2..."
pm2 stop boletera
pm2 delete boletera
sleep 2

# Respaldar .env corrupto
echo ""
echo "💾 Respaldando .env corrupto..."
if [ -f .env ]; then
  cp .env .env.corrupto.backup.$(date +%s)
  echo "✅ Backup creado"
fi

# Crear .env limpio desde cero
echo ""
echo "📝 Creando .env limpio..."
cat > .env << 'ENVFILE'
# Database URLs
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:GDFHGAkbbC1l3Jz3@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
DIRECT_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:GDFHGAkbbC1l3Jz3@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://hlvhuwwatnzqiviopqrj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzU4MTIsImV4cCI6MjA4MjU1MTgxMn0.s51DalBawxuiRGIVXnHnrmuNhzPOsSOvHgoPwxIzido"

# App Configuration
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"

# Security
QR_SECRET_KEY="gr-qr-secret-2025-cambiar-en-produccion"
JWT_SECRET="8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a"

# Clip Payment Gateway
CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_AUTH_TOKEN="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_WEBHOOK_SECRET="bfb49cda-a55d-40d6-9049-39987ba016f2"
NEXT_PUBLIC_CLIP_API_KEY="13120871-a17e-43e4-ab3c-e54d1ca503b4"
ENVFILE

echo "✅ .env recreado"

# Verificar que las variables críticas existen
echo ""
echo "🔍 Verificando variables críticas..."
grep "NEXT_PUBLIC_SUPABASE_URL" .env
grep "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env | head -c 80
echo "..."
grep "DATABASE_URL" .env | head -c 80
echo "..."

# Limpiar build anterior
echo ""
echo "🗑️  Limpiando build anterior..."
rm -rf .next
rm -rf node_modules/.cache

# Build de producción
echo ""
echo "🔨 Construyendo aplicación..."
export NODE_ENV=production
npm run build

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Error en el build"
  echo "Revisa los errores arriba"
  exit 1
fi

echo "✅ Build exitoso"

# Configurar PM2
echo ""
echo "🚀 Iniciando con PM2..."
pm2 start npm --name "boletera" -- start
pm2 save

# Esperar y verificar
sleep 5
echo ""
echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "======================================"
echo "✅ DEPLOY COMPLETADO"
echo "======================================"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verificar logs: pm2 logs boletera --lines 50"
echo "   2. Probar el sitio: https://scenario.com.mx"
echo "   3. Probar admin: https://scenario.com.mx/admin"
