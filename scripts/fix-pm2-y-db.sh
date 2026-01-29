#!/bin/bash
# Script para corregir PM2 y verificar conexión a base de datos
# Ejecutar en el servidor: bash scripts/fix-pm2-y-db.sh

set -e

echo "🔧 Corrigiendo configuración de PM2 y base de datos..."
echo ""

# Ir al directorio correcto
cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

echo "📋 Paso 1: Verificando directorio actual..."
pwd
echo ""

echo "📋 Paso 2: Verificando que existe el build..."
if [ -d ".next" ]; then
    echo "✅ Directorio .next existe"
    ls -la .next | head -5
else
    echo "❌ Directorio .next NO existe. Ejecutando build..."
    npm run build
fi
echo ""

echo "📋 Paso 3: Verificando configuración de DATABASE_URL..."
if [ -f ".env" ]; then
    echo "Contenido de DATABASE_URL:"
    grep "DATABASE_URL" .env | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/'
    echo ""
    
    # Verificar si tiene comillas
    DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    echo "DATABASE_URL sin comillas:"
    echo "$DB_URL" | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/'
    echo ""
else
    echo "❌ Archivo .env no existe"
    exit 1
fi

echo "📋 Paso 4: Probando conexión con psql..."
if command -v psql &> /dev/null; then
    # Extraer componentes de la URL
    DB_HOST=$(echo "$DB_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DB_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo "$DB_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_NAME=$(echo "$DB_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    DB_PASSWORD=$(echo "$DB_URL" | sed -n 's/.*:\/\/postgres:\([^@]*\)@.*/\1/p')
    
    echo "Intentando conectar a: $DB_HOST:$DB_PORT"
    echo "Usuario: $DB_USER"
    echo "Base de datos: $DB_NAME"
    echo ""
    
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /tmp/psql-test.log 2>&1; then
        echo "✅ Conexión exitosa con psql!"
        cat /tmp/psql-test.log | head -3
    else
        echo "❌ Error de conexión con psql"
        echo "Detalles:"
        cat /tmp/psql-test.log
        echo ""
        echo "💡 La contraseña podría ser incorrecta o necesitar codificación URL"
    fi
    echo ""
else
    echo "⚠️  psql no está instalado. Instalando..."
    apt-get update -qq && apt-get install -y postgresql-client > /dev/null 2>&1
fi

echo "📋 Paso 5: Corrigiendo PM2..."
echo ""

# Detener PM2 si está corriendo
if pm2 list | grep -q "boletera"; then
    echo "Deteniendo proceso boletera actual..."
    pm2 delete boletera || true
fi

# Verificar que estamos en el directorio correcto
CURRENT_DIR=$(pwd)
if [ "$CURRENT_DIR" != "/var/www/boletera" ]; then
    echo "❌ Error: No estás en /var/www/boletera"
    echo "Directorio actual: $CURRENT_DIR"
    exit 1
fi

# Verificar que existe el build
if [ ! -d ".next" ]; then
    echo "⚠️  No existe .next. Ejecutando build..."
    npm run build
fi

# Iniciar PM2 desde el directorio correcto
echo "Iniciando PM2 desde: $(pwd)"
pm2 start npm --name boletera -- start --cwd /var/www/boletera

echo ""
echo "📋 Paso 6: Verificando estado de PM2..."
pm2 status

echo ""
echo "📋 Paso 7: Últimas líneas de log..."
pm2 logs boletera --lines 10 --nostream

echo ""
echo "✅ Proceso completado!"
echo ""
echo "💡 Si la conexión a la base de datos falla:"
echo "1. Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
echo "2. Haz clic en 'Reset database password'"
echo "3. Copia la nueva contraseña EXACTA"
echo "4. Actualiza el .env con: nano /var/www/boletera/.env"
echo "5. Si la contraseña tiene caracteres especiales (@, #, %, etc.), codifícalos en la URL"
