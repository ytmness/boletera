#!/bin/bash
# Script para configurar Connection Pooling correctamente
# Ejecutar en el servidor: bash scripts/configurar-pooler.sh

set -e

echo "🔧 Configurando Connection Pooling de Supabase..."
echo ""

cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

# Hacer backup
echo "📋 Paso 1: Creando backup del .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado: .env.backup.$(date +%Y%m%d_%H%M%S)"
echo ""

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo "❌ Error: El archivo .env no existe"
    exit 1
fi

echo "📋 Paso 2: Configurando Connection Pooling..."
echo ""
echo "⚠️  IMPORTANTE: Necesitas obtener el Connection String del pooler desde Supabase Dashboard"
echo "   1. Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
echo "   2. Busca 'Connection pooling (PgBouncer)'"
echo "   3. Selecciona 'Transaction'"
echo "   4. Copia el URI completo"
echo ""
echo "El formato debería ser:"
echo "   postgresql://postgres.hlvhuwwatnzqiviopqrj:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres"
echo ""

# Pedir confirmación
read -p "¿Ya tienes el Connection String del pooler? (s/n): " tiene_string

if [ "$tiene_string" != "s" ] && [ "$tiene_string" != "S" ]; then
    echo ""
    echo "Por favor obtén el Connection String del pooler primero."
    echo "Luego ejecuta este script de nuevo."
    exit 0
fi

echo ""
echo "📝 Ingresa los datos del pooler:"
echo ""

# Pedir host del pooler
read -p "Host del pooler (ej: aws-0-us-east-1.pooler.supabase.com): " POOLER_HOST

# Pedir puerto (default 6543)
read -p "Puerto del pooler [6543]: " POOLER_PORT
POOLER_PORT=${POOLER_PORT:-6543}

# Pedir usuario (debe incluir project ref)
read -p "Usuario del pooler (ej: postgres.hlvhuwwatnzqiviopqrj): " POOLER_USER

# Contraseña (ya la tenemos)
DB_PASSWORD="7ianbJsQzipn2IFk"

echo ""
echo "📋 Paso 3: Actualizando .env..."
echo ""

# Construir DATABASE_URL con formato correcto
DATABASE_URL="postgresql://${POOLER_USER}:${DB_PASSWORD}@${POOLER_HOST}:${POOLER_PORT}/postgres?pgbouncer=true&connection_limit=1"

# DIRECT_URL puede usar el pooler también si la conexión directa no funciona
DIRECT_URL="postgresql://${POOLER_USER}:${DB_PASSWORD}@${POOLER_HOST}:${POOLER_PORT}/postgres?pgbouncer=true&connection_limit=1"

# Actualizar .env
if grep -q "^DATABASE_URL=" .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DATABASE_URL}\"|" .env
else
    echo "DATABASE_URL=\"${DATABASE_URL}\"" >> .env
fi

if grep -q "^DIRECT_URL=" .env; then
    sed -i "s|^DIRECT_URL=.*|DIRECT_URL=\"${DIRECT_URL}\"|" .env
else
    echo "DIRECT_URL=\"${DIRECT_URL}\"" >> .env
fi

echo "✅ .env actualizado"
echo ""

# Verificar
echo "📋 Paso 4: Verificando configuración..."
echo ""
echo "DATABASE_URL:"
grep "^DATABASE_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'
echo ""
echo "DIRECT_URL:"
grep "^DIRECT_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'
echo ""

# Probar conectividad
echo "📋 Paso 5: Probando conectividad..."
echo ""

if command -v nc &> /dev/null; then
    echo "Probando conexión al puerto ${POOLER_PORT}..."
    if timeout 5 nc -zv ${POOLER_HOST} ${POOLER_PORT} 2>&1; then
        echo "✅ Puerto ${POOLER_PORT} accesible"
    else
        echo "⚠️  No se pudo conectar al puerto ${POOLER_PORT}"
    fi
    echo ""
fi

if command -v psql &> /dev/null; then
    echo "Probando conexión con psql..."
    if PGPASSWORD="${DB_PASSWORD}" psql -h ${POOLER_HOST} -p ${POOLER_PORT} -U ${POOLER_USER} -d postgres -c "SELECT version();" > /tmp/psql-test.log 2>&1; then
        echo "✅ Conexión exitosa con psql!"
        cat /tmp/psql-test.log | head -3
    else
        echo "❌ Error de conexión con psql"
        echo "Detalles:"
        cat /tmp/psql-test.log
    fi
    echo ""
else
    echo "⚠️  psql no está instalado"
fi

# Generar Prisma
echo "📋 Paso 6: Generando cliente Prisma..."
echo ""
if [ -f "node_modules/.bin/prisma" ]; then
    ./node_modules/.bin/prisma generate
    echo "✅ Cliente Prisma generado"
else
    echo "⚠️  Prisma no está instalado. Ejecuta 'npm install' primero"
fi
echo ""

echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo ""
echo "1. Si la conexión funciona, sincroniza el schema:"
echo "   ./node_modules/.bin/prisma db push"
echo ""
echo "2. Haz build de la aplicación:"
echo "   rm -rf .next && npm run build"
echo ""
echo "3. Reinicia PM2 con --update-env:"
echo "   pm2 restart boletera --update-env"
echo ""
echo "4. Verifica los logs:"
echo "   pm2 logs boletera --lines 30"
echo ""
