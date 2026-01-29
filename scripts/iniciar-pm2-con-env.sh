#!/bin/bash

# Script para iniciar PM2 con variables de entorno desde .env
# Ejecutar en el servidor: bash scripts/iniciar-pm2-con-env.sh

set -e

echo "=========================================="
echo "🔧 INICIAR PM2 CON VARIABLES DE ENTORNO"
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
echo "=== PASO 2: Crear archivo de configuración PM2 con variables de entorno ==="

# Leer variables de entorno del archivo .env y crear el archivo de configuración
cat > ecosystem.config.js << 'ECOSYSTEM_EOF'
module.exports = {
  apps: [{
    name: 'boletera',
    script: 'npm',
    args: 'start',
    cwd: process.env.PWD || '/var/www/boletera',
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
ECOSYSTEM_EOF

echo "✅ Archivo ecosystem.config.js creado"

echo ""
echo "=== PASO 3: Iniciar PM2 con dotenv ==="
# Usar dotenv-cli para cargar variables de entorno
if ! command -v dotenv &> /dev/null; then
    echo "📦 Instalando dotenv-cli..."
    npm install -g dotenv-cli 2>/dev/null || echo "⚠️ No se pudo instalar dotenv-cli globalmente, intentando localmente..."
    npm install --save-dev dotenv-cli 2>/dev/null || true
fi

# Intentar iniciar con dotenv-cli si está disponible
if command -v dotenv &> /dev/null; then
    echo "✅ Usando dotenv-cli para cargar variables de entorno"
    dotenv -e .env -- pm2 start ecosystem.config.js
else
    # Alternativa: usar node con dotenv
    echo "⚠️ dotenv-cli no disponible, usando método alternativo..."
    # Cargar variables manualmente usando node
    node -e "
    const fs = require('fs');
    const env = fs.readFileSync('.env', 'utf8');
    const envVars = {};
    env.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^[\"']|[\"']$/g, '');
        }
      }
    });
    const config = require('./ecosystem.config.js');
    config.apps[0].env = { ...config.apps[0].env, ...envVars };
    fs.writeFileSync('ecosystem.config.js', 'module.exports = ' + JSON.stringify(config, null, 2) + ';');
    " && pm2 start ecosystem.config.js
fi

echo ""
echo "=== PASO 4: Guardar configuración PM2 ==="
pm2 save

echo ""
echo "=== PASO 5: Verificar estado ==="
pm2 status

echo ""
echo "=== PASO 6: Ver logs (últimas 20 líneas) ==="
sleep 2
pm2 logs boletera --lines 20 --nostream

echo ""
echo "=========================================="
echo "✅ PM2 INICIADO CON VARIABLES DE ENTORNO"
echo "=========================================="
echo ""
echo "Comandos útiles:"
echo "  - Ver logs: pm2 logs boletera"
echo "  - Ver estado: pm2 status"
echo "  - Reiniciar: pm2 restart boletera"
echo "  - Detener: pm2 stop boletera"
echo ""
