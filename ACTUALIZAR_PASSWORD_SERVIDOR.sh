#!/bin/bash

echo "==========================================
🔐 ACTUALIZAR CONTRASEÑA DE BASE DE DATOS
==========================================
"

cd /var/www/boletera

# Nueva contraseña
NEW_PASSWORD="t6tCl2AyNaQDMTFk"

echo "=== Paso 1: Backup del .env actual ==="
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

echo ""
echo "=== Paso 2: Actualizar contraseña en DATABASE_URL ==="
sed -i "s/postgresql:\/\/postgres\.hlvhuwwatnzqiviopqrj:[^@]*@/postgresql:\/\/postgres.hlvhuwwatnzqiviopqrj:${NEW_PASSWORD}@/g" .env
echo "✅ DATABASE_URL actualizado"

echo ""
echo "=== Paso 3: Actualizar contraseña en DIRECT_URL ==="
sed -i "s/postgresql:\/\/postgres:[^@]*@db\./postgresql:\/\/postgres:${NEW_PASSWORD}@db./g" .env
echo "✅ DIRECT_URL actualizado"

echo ""
echo "=== Paso 4: Verificar los cambios ==="
echo "DATABASE_URL:"
grep "^DATABASE_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'
echo ""
echo "DIRECT_URL:"
grep "^DIRECT_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

echo ""
echo "=== Paso 5: Probar conexión con psql ==="
if psql "postgresql://postgres.hlvhuwwatnzqiviopqrj:${NEW_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require" -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Conexión a base de datos exitosa"
else
    echo "❌ Error de conexión - verifica la contraseña"
    exit 1
fi

echo ""
echo "=== Paso 6: Crear script wrapper para PM2 ==="
cat > start-app.sh << 'WRAPPER_EOF'
#!/bin/bash
set -a
source /var/www/boletera/.env
set +a
exec npm start
WRAPPER_EOF

chmod +x start-app.sh
echo "✅ Wrapper creado"

echo ""
echo "=== Paso 7: Actualizar ecosystem.config.js ==="
cat > ecosystem.config.js << 'ECO_EOF'
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
ECO_EOF
echo "✅ ecosystem.config.js actualizado"

echo ""
echo "=== Paso 8: Limpiar logs de PM2 ==="
pm2 flush boletera 2>/dev/null || true

echo ""
echo "=== Paso 9: Reiniciar PM2 ==="
pm2 delete boletera 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "=== Paso 10: Esperar inicio completo ==="
sleep 8

echo ""
echo "=== Paso 11: Ver logs nuevos ==="
pm2 logs boletera --lines 30 --nostream

echo ""
echo "==========================================
✅ CONTRASEÑA ACTUALIZADA Y PM2 REINICIADO
==========================================
"
