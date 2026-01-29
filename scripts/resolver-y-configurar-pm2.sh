#!/bin/bash

# Script para resolver conflictos y configurar PM2 con variables de entorno
# Ejecutar en el servidor: bash scripts/resolver-y-configurar-pm2.sh

set -e

echo "=========================================="
echo "🔧 RESOLVER CONFLICTOS Y CONFIGURAR PM2"
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
echo "=== PASO 1: Resolver conflictos de merge ==="
# Guardar cambios locales si existen
git stash 2>/dev/null || true

# Descargar cambios
git pull origin main

# Aplicar cambios guardados (si había alguno)
git stash pop 2>/dev/null || true

echo "✅ Conflictos resueltos"

echo ""
echo "=== PASO 2: Detener PM2 si está corriendo ==="
pm2 delete boletera 2>/dev/null || echo "PM2 no tenía proceso boletera corriendo"

echo ""
echo "=== PASO 3: Crear script wrapper para cargar .env ==="
cat > start-app.sh << 'WRAPPER_EOF'
#!/bin/bash
set -a
source .env
set +a
exec npm start
WRAPPER_EOF

chmod +x start-app.sh
echo "✅ Script wrapper start-app.sh creado"

echo ""
echo "=== PASO 4: Crear archivo de configuración PM2 ==="
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'boletera',
    script: './start-app.sh',
    cwd: '/var/www/boletera',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    interpreter: '/bin/bash',
    error_file: '/root/.pm2/logs/boletera-error.log',
    out_file: '/root/.pm2/logs/boletera-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
EOF

echo "✅ Archivo ecosystem.config.js creado"

echo ""
echo "=== PASO 5: Iniciar PM2 con configuración ==="
pm2 start ecosystem.config.js

echo ""
echo "=== PASO 6: Guardar configuración PM2 ==="
pm2 save

echo ""
echo "=== PASO 7: Verificar estado ==="
pm2 status

echo ""
echo "=== PASO 8: Esperar 3 segundos y ver logs ==="
sleep 3
pm2 logs boletera --lines 30 --nostream

echo ""
echo "=========================================="
echo "✅ PM2 CONFIGURADO CON VARIABLES DE ENTORNO"
echo "=========================================="
echo ""
echo "Si ves errores de autenticación de Prisma, verifica:"
echo "  1. Que el archivo .env existe y tiene DATABASE_URL correcto"
echo "  2. Que las credenciales de la base de datos son válidas"
echo ""
echo "Comandos útiles:"
echo "  - Ver logs: pm2 logs boletera"
echo "  - Ver estado: pm2 status"
echo "  - Reiniciar: pm2 restart boletera"
echo ""
