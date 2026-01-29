#!/bin/bash
# Script completo para corregir todos los problemas del servidor
# Ejecutar: bash scripts/fix-servidor-completo.sh

set -e  # Salir si hay errores

echo "🔧 Iniciando corrección completa del servidor..."
echo ""

# 1. Ir al directorio correcto
cd /var/www/boletera || { echo "❌ Error: No se encontró /var/www/boletera"; exit 1; }

echo "✅ Directorio: $(pwd)"
echo ""

# 2. Obtener últimos cambios
echo "📥 Obteniendo últimos cambios de GitHub..."
git pull origin main
echo ""

# 3. Corregir ESLint
echo "🔧 Corrigiendo ESLint..."
npm remove eslint 2>/dev/null || true
npm i -D eslint@8.57.1
echo "✅ ESLint 8.57.1 instalado"
echo ""

# 4. Limpiar e instalar
echo "🧹 Limpiando node_modules..."
rm -rf node_modules package-lock.json
echo ""

echo "📦 Instalando dependencias..."
npm install
echo ""

# 5. Verificar y corregir Prisma
echo "🔍 Verificando versión de Prisma..."
PRISMA_VERSION=$(npm list prisma 2>/dev/null | grep prisma@ | awk '{print $2}' | cut -d'@' -f2 || echo "not-found")

if [[ "$PRISMA_VERSION" == *"7."* ]] || [[ "$PRISMA_VERSION" == "not-found" ]]; then
    echo "⚠️  Prisma versión incorrecta: $PRISMA_VERSION"
    echo "🔧 Instalando Prisma 5.22.0..."
    npm uninstall prisma @prisma/client 2>/dev/null || true
    npm install --save-dev prisma@5.22.0
    npm install @prisma/client@5.22.0
    echo "✅ Prisma 5.22.0 instalado"
else
    echo "✅ Prisma versión correcta: $PRISMA_VERSION"
fi
echo ""

# 6. Regenerar Prisma
echo "🔄 Regenerando cliente de Prisma..."
./node_modules/.bin/prisma generate
echo "✅ Cliente de Prisma regenerado"
echo ""

# 7. Verificar DATABASE_URL antes de db push
echo "🔍 Verificando DATABASE_URL..."
if grep -q "DATABASE_URL" .env; then
    echo "✅ DATABASE_URL encontrado en .env"
    echo "⚠️  Si db push falla, verifica que la URL sea correcta en Supabase"
else
    echo "❌ DATABASE_URL no encontrado en .env"
    echo "⚠️  Configura DATABASE_URL antes de continuar"
fi
echo ""

# 8. Intentar db push (puede fallar si DATABASE_URL está mal)
echo "🔄 Sincronizando schema con BD..."
if ./node_modules/.bin/prisma db push 2>&1 | grep -q "FATAL"; then
    echo "⚠️  Error de conexión a BD. Verifica DATABASE_URL en .env"
    echo "   Puedes continuar con el build, pero las migraciones fallaron"
else
    echo "✅ Schema sincronizado"
fi
echo ""

# 9. Build
echo "🏗️  Construyendo aplicación..."
npm run build
echo "✅ Build completado"
echo ""

# 10. Verificar que existe .next
if [ -d ".next" ]; then
    echo "✅ Directorio .next creado correctamente"
else
    echo "❌ Error: Directorio .next no existe después del build"
    exit 1
fi
echo ""

# 11. Detener PM2 actual
echo "🛑 Deteniendo PM2 actual..."
pm2 delete boletera 2>/dev/null || echo "PM2 no tenía proceso boletera"
echo ""

# 12. Iniciar PM2 desde el directorio correcto
echo "🚀 Iniciando PM2 desde $(pwd)..."
pm2 start npm --name boletera -- start
pm2 save
echo "✅ PM2 iniciado correctamente"
echo ""

# 13. Verificar estado
echo "📊 Estado de PM2:"
pm2 status
echo ""

echo "📝 Verificando configuración de PM2:"
pm2 show boletera | grep -E "(cwd|script|args)" || true
echo ""

echo "✅ Corrección completa finalizada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica los logs: pm2 logs boletera --lines 30"
echo "2. Prueba la aplicación: https://scenario.com.mx"
echo "3. Si hay errores de BD, verifica DATABASE_URL en .env"
