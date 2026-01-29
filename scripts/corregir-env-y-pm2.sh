#!/bin/bash

# Script para corregir .env y configurar PM2 correctamente
# Ejecutar en el servidor: bash scripts/corregir-env-y-pm2.sh

set -e

echo "=========================================="
echo "🔧 CORREGIR .ENV Y CONFIGURAR PM2"
echo "=========================================="

# Detectar directorio de trabajo actual
CURRENT_DIR=$(pwd)
echo "📁 Directorio actual: $CURRENT_DIR"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que existe .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró .env. Por favor crea el archivo .env primero."
    exit 1
fi

echo ""
echo "=== PASO 1: Hacer backup del .env actual ==="
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

echo ""
echo "=== PASO 2: Leer valores actuales del .env ==="
# Función para extraer valor sin comillas
extract_value() {
    local line="$1"
    local value="${line#*=}"
    # Remover comillas al inicio y final
    value="${value#\"}"
    value="${value%\"}"
    value="${value#\'}"
    value="${value%\'}"
    echo "$value"
}

# Extraer valores actuales (sin comillas si las tienen)
SUPABASE_URL=$(extract_value "$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env)")
SUPABASE_ANON_KEY=$(extract_value "$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env)")
SERVICE_ROLE_KEY=$(extract_value "$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env)")
APP_URL=$(extract_value "$(grep "^NEXT_PUBLIC_APP_URL=" .env)")
APP_NAME=$(extract_value "$(grep "^NEXT_PUBLIC_APP_NAME=" .env)")
QR_SECRET=$(extract_value "$(grep "^QR_SECRET_KEY=" .env)")
JWT_SECRET=$(extract_value "$(grep "^JWT_SECRET=" .env)")
CLIP_API_KEY=$(extract_value "$(grep "^CLIP_API_KEY=" .env)")
CLIP_AUTH_TOKEN=$(extract_value "$(grep "^CLIP_AUTH_TOKEN=" .env)")
CLIP_WEBHOOK_SECRET=$(extract_value "$(grep "^CLIP_WEBHOOK_SECRET=" .env)")
CLIP_PUBLIC_KEY=$(extract_value "$(grep "^NEXT_PUBLIC_CLIP_API_KEY=" .env)")

# Extraer DATABASE_URL y DIRECT_URL (pueden tener diferentes formatos)
DB_URL_RAW=$(extract_value "$(grep "^DATABASE_URL=" .env)")
DIRECT_URL_RAW=$(extract_value "$(grep "^DIRECT_URL=" .env)")

# Extraer contraseña de DATABASE_URL si existe
if [[ "$DB_URL_RAW" == *"@"* ]]; then
    # Extraer la parte entre : y @ (puede ser postgres.hlvhuwwatnzqiviopqrj:password o postgres:password)
    if [[ "$DB_URL_RAW" =~ postgresql://([^:]+):([^@]+)@ ]]; then
        DB_PASSWORD="${BASH_REMATCH[2]}"
        echo "🔑 Contraseña detectada en DATABASE_URL"
    else
        DB_PASSWORD=""
    fi
else
    DB_PASSWORD=""
fi

# Si no se pudo extraer la contraseña, pedirla
if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  No se pudo extraer contraseña de DATABASE_URL"
    echo "Por favor, ingresa la contraseña de la base de datos manualmente:"
    read -s DB_PASSWORD
fi

echo "✅ Valores extraídos del .env actual"

echo ""
echo "=== PASO 3: Crear .env corregido con comillas ==="
cat > .env << ENVEOF
NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
# Session Pooler (IPv4) - Recomendado para VPS sin IPv6
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:${DB_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require"
# Conexión directa para migraciones de Prisma (sin pooler)
DIRECT_URL="postgresql://postgres:${DB_PASSWORD}@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_APP_URL="$APP_URL"
NEXT_PUBLIC_APP_NAME="$APP_NAME"
QR_SECRET_KEY="$QR_SECRET"
JWT_SECRET="$JWT_SECRET"

# Clip Payment Gateway Configuration
# API Key para Checkout Transparente (obtener desde Panel de Desarrolladores de Clip)
CLIP_API_KEY="$CLIP_API_KEY"
# Para compatibilidad con código legacy
CLIP_AUTH_TOKEN="$CLIP_AUTH_TOKEN"
CLIP_WEBHOOK_SECRET="$CLIP_WEBHOOK_SECRET"
# API Key pública para el SDK del frontend (Checkout Transparente)
NEXT_PUBLIC_CLIP_API_KEY="$CLIP_PUBLIC_KEY"
ENVEOF

echo "✅ Archivo .env recreado con comillas en todos los valores"

echo ""
echo "=== PASO 4: Verificar .env corregido ==="
echo "Línea 9 (NEXT_PUBLIC_APP_NAME):"
nl -ba .env | sed -n '9p'
echo ""
echo "DATABASE_URL y DIRECT_URL:"
grep -E "^DATABASE_URL=|^DIRECT_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'
echo ""

echo "=== PASO 5: Crear script wrapper mejorado ==="
cat > start-app.sh << 'WRAPPER_EOF'
#!/bin/bash
# Script wrapper para iniciar la aplicación con variables de entorno desde .env
# Este script carga el .env de forma segura y luego ejecuta npm start

# Cambiar al directorio del script
cd "$(dirname "$0")"

# Cargar variables de entorno de forma segura
# set -a exporta todas las variables automáticamente
# source .env ahora es seguro porque todos los valores tienen comillas
set -a
[ -f .env ] && source .env
set +a

# Ejecutar npm start con las variables de entorno cargadas
exec npm start
WRAPPER_EOF

chmod +x start-app.sh
echo "✅ Script wrapper start-app.sh creado/actualizado"

echo ""
echo "=== PASO 6: Detener PM2 si está corriendo ==="
pm2 delete boletera 2>/dev/null || echo "PM2 no tenía proceso boletera corriendo"

echo ""
echo "=== PASO 7: Crear archivo de configuración PM2 ==="
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'boletera',
    script: './start-app.sh',
    cwd: '$CURRENT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    interpreter: '/bin/bash',
    error_file: '/root/.pm2/logs/boletera-error.log',
    out_file: '/root/.pm2/logs/boletera-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

echo "✅ Archivo ecosystem.config.js creado con cwd: $CURRENT_DIR"

echo ""
echo "=== PASO 8: Iniciar PM2 con configuración ==="
pm2 start ecosystem.config.js

echo ""
echo "=== PASO 9: Guardar configuración PM2 ==="
pm2 save

echo ""
echo "=== PASO 10: Verificar estado ==="
pm2 status

echo ""
echo "=== PASO 11: Verificar variables de entorno en PM2 ==="
echo "Verificando DATABASE_URL y DIRECT_URL en PM2:"
pm2 env boletera 2>/dev/null | grep -E "DATABASE_URL|DIRECT_URL" || echo "⚠️  No se encontraron variables (puede ser normal si se cargan desde .env)"

echo ""
echo "=== PASO 12: Esperar 3 segundos y ver logs ==="
sleep 3
pm2 logs boletera --lines 30 --nostream

echo ""
echo "=========================================="
echo "✅ CONFIGURACIÓN COMPLETA"
echo "=========================================="
echo ""
echo "📋 Resumen de cambios:"
echo "  ✅ .env corregido con comillas en todos los valores"
echo "  ✅ DATABASE_URL configurado con pooler de Supabase"
echo "  ✅ DIRECT_URL configurado para migraciones"
echo "  ✅ Script start-app.sh mejorado"
echo "  ✅ PM2 configurado con directorio correcto"
echo ""
echo "🔍 Si ves errores de autenticación de Prisma:"
echo "  1. Verifica que la contraseña en .env sea correcta"
echo "  2. Verifica que el pooler de Supabase esté habilitado"
echo "  3. Prueba la conexión: psql \"\$DATABASE_URL\""
echo ""
echo "📝 Comandos útiles:"
echo "  - Ver logs: pm2 logs boletera"
echo "  - Ver estado: pm2 status"
echo "  - Reiniciar: pm2 restart boletera --update-env"
echo "  - Ver .env línea 9: nl -ba .env | sed -n '9p'"
echo ""
