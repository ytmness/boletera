#!/bin/bash
# Script para verificar y corregir el archivo .env en el servidor
# Ejecutar en el servidor: bash scripts/verificar-y-corregir-env.sh

set -e

echo "🔍 Verificando y corrigiendo archivo .env..."
echo ""

cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

# Hacer backup
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup creado: .env.backup.$(date +%Y%m%d_%H%M%S)"
else
    echo "❌ Archivo .env no existe"
    exit 1
fi

echo ""
echo "📋 Contenido actual del .env:"
echo "----------------------------------------"
cat .env
echo "----------------------------------------"
echo ""

# Verificar si las URLs están completas
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
DIRECT_URL=$(grep "^DIRECT_URL=" .env | cut -d'=' -f2-)

echo "📋 DATABASE_URL encontrada:"
echo "$DB_URL" | head -c 100
echo "..."
echo ""

echo "📋 DIRECT_URL encontrada:"
echo "$DIRECT_URL" | head -c 100
echo "..."
echo ""

# Verificar si las URLs están completas (deben terminar con ?sslmode=require o /postgres)
if [[ "$DB_URL" != *"supabase.co:5432/postgres"* ]]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL parece estar incompleta"
    echo "   Debería terminar con: @db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
fi

if [[ "$DIRECT_URL" != *"supabase.co:5432/postgres"* ]]; then
    echo "⚠️  ADVERTENCIA: DIRECT_URL parece estar incompleta"
    echo "   Debería terminar con: @db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
fi

echo ""
echo "🔧 Creando archivo .env corregido..."
echo ""

# Crear el archivo .env completo y correcto
cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4
DATABASE_URL=postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_URL=https://scenario.com.mx
NEXT_PUBLIC_APP_NAME=Grupo Regia - Boletera
QR_SECRET_KEY=gr-qr-secret-2025-cambiar-en-produccion
JWT_SECRET=8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a

# Clip Payment Gateway Configuration
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
ENVEOF

echo "✅ Archivo .env recreado con URLs completas"
echo ""

echo "📋 Verificando contenido nuevo:"
echo "----------------------------------------"
cat .env | grep -E "DATABASE_URL|DIRECT_URL" | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/'
echo "----------------------------------------"
echo ""

echo "🔍 Verificando longitud de las URLs:"
DB_URL_LEN=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | wc -c)
DIRECT_URL_LEN=$(grep "^DIRECT_URL=" .env | cut -d'=' -f2- | wc -c)
echo "DATABASE_URL tiene $DB_URL_LEN caracteres"
echo "DIRECT_URL tiene $DIRECT_URL_LEN caracteres"
echo ""

# Las URLs deberían tener aproximadamente 120-130 caracteres
if [ "$DB_URL_LEN" -lt 100 ]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL parece muy corta (debería tener ~120 caracteres)"
fi

echo ""
echo "🧪 Probando conexión con Prisma..."
echo ""

if [ -f "node_modules/.bin/prisma" ]; then
    if ./node_modules/.bin/prisma db pull > /tmp/prisma-test.log 2>&1; then
        echo "✅ ¡Conexión exitosa con Prisma!"
        echo ""
        echo "Puedes continuar con:"
        echo "  ./node_modules/.bin/prisma db push"
    else
        echo "❌ Error de conexión con Prisma"
        echo ""
        echo "Detalles del error:"
        cat /tmp/prisma-test.log
        echo ""
        echo "💡 La contraseña podría ser incorrecta."
        echo "   Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
        echo "   Y verifica o resetea la contraseña de la base de datos."
    fi
else
    echo "⚠️  Prisma no está instalado. Ejecuta: npm install"
fi

echo ""
echo "✅ Verificación completada!"
echo ""
echo "📝 Si la contraseña es incorrecta, actualiza el .env con:"
echo "   nano /var/www/boletera/.env"
echo ""
echo "   Y reemplaza '7ianbJsQzipn2IFk' con la contraseña correcta de Supabase"
