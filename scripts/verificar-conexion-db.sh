#!/bin/bash
# Script para verificar la conexión a la base de datos de Supabase
# Ejecutar en el servidor: bash scripts/verificar-conexion-db.sh

echo "🔍 Verificando conexión a la base de datos de Supabase..."
echo ""

# Ir al directorio del proyecto
cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    echo "❌ Error: El archivo .env no existe"
    exit 1
fi

# Cargar variables del .env
source .env 2>/dev/null || true

echo "📋 Verificando configuración actual..."
echo ""

# Mostrar DATABASE_URL (sin mostrar la contraseña completa)
if [ -n "$DATABASE_URL" ]; then
    echo "DATABASE_URL encontrada:"
    # Ocultar la contraseña mostrando solo los primeros y últimos caracteres
    DB_URL_MASKED=$(echo "$DATABASE_URL" | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/')
    echo "   $DB_URL_MASKED"
    echo ""
    
    # Extraer componentes de la URL
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "Componentes extraídos:"
    echo "   Host: $DB_HOST"
    echo "   Port: $DB_PORT"
    echo "   User: $DB_USER"
    echo "   Database: $DB_NAME"
    echo ""
else
    echo "❌ DATABASE_URL no está definida en .env"
    exit 1
fi

# Verificar si psql está instalado
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql no está instalado. Instalando..."
    apt-get update -qq && apt-get install -y postgresql-client > /dev/null 2>&1
fi

echo "🔌 Intentando conectar a la base de datos..."
echo ""

# Intentar conexión usando psql directamente
# Extraer la contraseña de la URL
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/postgres:\([^@]*\)@.*/\1/p')

# Probar conexión
echo "Probando conexión con psql..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexión exitosa con psql!"
    echo ""
    echo "Información de la base de datos:"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>&1 | head -3
else
    echo "❌ Error de conexión con psql"
    echo ""
    echo "Detalles del error:"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" 2>&1
    echo ""
fi

echo ""
echo "🔍 Verificando con Prisma..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules no existe. Ejecuta 'npm install' primero."
    exit 1
fi

# Verificar si Prisma está instalado
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo "⚠️  Prisma no está instalado. Ejecuta 'npm install' primero."
    exit 1
fi

# Probar con Prisma
echo "Ejecutando: ./node_modules/.bin/prisma db pull --dry-run"
if ./node_modules/.bin/prisma db pull --dry-run > /tmp/prisma-test.log 2>&1; then
    echo "✅ Prisma puede conectarse correctamente!"
else
    echo "❌ Error de conexión con Prisma"
    echo ""
    echo "Detalles del error:"
    cat /tmp/prisma-test.log
    echo ""
    echo ""
    echo "💡 Posibles soluciones:"
    echo "1. Verifica que la contraseña sea correcta en Supabase Dashboard"
    echo "2. Asegúrate de usar la conexión DIRECTA (db.xxx.supabase.co), no el pooler"
    echo "3. Verifica que no haya espacios o caracteres especiales en la contraseña"
    echo "4. Si la contraseña tiene caracteres especiales, codifícalos en la URL:"
    echo "   - @ → %40"
    echo "   - # → %23"
    echo "   - % → %25"
    echo "   - & → %26"
    echo "   - + → %2B"
    echo "   - espacio → %20"
    echo ""
    echo "5. Obtén la contraseña directamente desde Supabase:"
    echo "   - Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
    echo "   - Busca 'Database password'"
    echo "   - Haz clic en 'Reset database password' si no la recuerdas"
    echo "   - Copia la contraseña EXACTA (sin espacios al inicio o final)"
fi

echo ""
echo "✅ Diagnóstico completado"
