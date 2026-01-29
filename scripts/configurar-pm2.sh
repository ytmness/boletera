#!/bin/bash

# Script para configurar PM2 correctamente con variables de entorno
# Ejecutar en el servidor: bash scripts/configurar-pm2.sh

set -e

echo "=========================================="
echo "🔧 CONFIGURAR PM2 CON VARIABLES DE ENTORNO"
echo "=========================================="

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
echo "=== PASO 1: Detener PM2 si está corriendo ==="
pm2 delete boletera 2>/dev/null || echo "PM2 no tenía proceso boletera corriendo"

echo ""
echo "=== PASO 2: Crear archivo de configuración PM2 ==="
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'boletera',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/boletera',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_file: '.env',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/root/.pm2/logs/boletera-error.log',
    out_file: '/root/.pm2/logs/boletera-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

echo "✅ Archivo ecosystem.config.js creado"

echo ""
echo "=== PASO 3: Iniciar PM2 con configuración ==="
pm2 start ecosystem.config.js

echo ""
echo "=== PASO 4: Guardar configuración PM2 ==="
pm2 save

echo ""
echo "=== PASO 5: Verificar estado ==="
pm2 status

echo ""
echo "=== PASO 6: Ver logs (últimas 20 líneas) ==="
pm2 logs boletera --lines 20 --nostream

echo ""
echo "=========================================="
echo "✅ PM2 CONFIGURADO CORRECTAMENTE"
echo "=========================================="
echo ""
echo "Comandos útiles:"
echo "  - Ver logs: pm2 logs boletera"
echo "  - Ver estado: pm2 status"
echo "  - Reiniciar: pm2 restart boletera"
echo "  - Detener: pm2 stop boletera"
echo ""
