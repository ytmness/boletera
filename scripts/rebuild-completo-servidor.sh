#!/bin/bash

# Script para hacer rebuild completo y eliminar código compilado antiguo
# Ejecutar en el servidor: bash scripts/rebuild-completo-servidor.sh

set -e  # Salir si hay error

echo "=========================================="
echo "🔧 REBUILD COMPLETO DEL SERVIDOR"
echo "=========================================="
echo ""

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. ¿Estás en el directorio correcto?"
    exit 1
fi

echo "✅ Directorio correcto"
echo ""

# 2. Actualizar código desde Git
echo "=== PASO 1: Actualizar código desde Git ==="
git pull origin main
echo "✅ Código actualizado"
echo ""

# 3. Verificar código fuente (debe tener router.push)
echo "=== PASO 2: Verificar código fuente ==="
if grep -q "router.push(\`/checkout/\${saleId}\`)" app/eventos/\[id\]/mesas/page.tsx; then
    echo "✅ Código fuente correcto: usa router.push"
else
    echo "❌ ERROR: El código fuente NO tiene router.push. Verifica el código."
    exit 1
fi

# Verificar que NO tiene create-link en código fuente
if grep -q "create-link" app/eventos/\[id\]/mesas/page.tsx; then
    echo "❌ ERROR: El código fuente todavía tiene create-link. Esto no debería pasar."
    exit 1
else
    echo "✅ Código fuente NO tiene create-link"
fi
echo ""

# 4. Eliminar TODO el código compilado (MUY AGRESIVO)
echo "=== PASO 3: Eliminar código compilado ==="
echo "Eliminando .next..."
rm -rf .next
echo "Eliminando node_modules/.cache..."
rm -rf node_modules/.cache
echo "Eliminando .next/cache si existe..."
rm -rf .next/cache 2>/dev/null || true
echo "Eliminando .next/server si existe..."
rm -rf .next/server 2>/dev/null || true
echo "✅ Código compilado eliminado completamente"
echo ""

# 5. Cambiar versión para invalidar caché del navegador
echo "=== PASO 4: Cambiar versión para invalidar caché ==="
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."($3+1)}')
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
echo "✅ Versión cambiada de $CURRENT_VERSION a $NEW_VERSION"
echo ""

# 6. Regenerar Prisma
echo "=== PASO 5: Regenerar Prisma ==="
./node_modules/.bin/prisma generate
echo "✅ Prisma regenerado"
echo ""

# 7. Build completo
echo "=== PASO 6: Build completo ==="
npm run build
echo "✅ Build completado"
echo ""

# 8. Verificar que NO tiene create-link en código compilado
echo "=== PASO 7: Verificar código compilado ==="
if grep -q "create-link" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null; then
    echo "⚠️  ADVERTENCIA: El código compilado todavía tiene create-link"
    echo "Archivos encontrados:"
    grep -n "create-link" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | head -5
    echo ""
    echo "Esto puede indicar que hay código en caché. Intenta eliminar .next/server y rebuild de nuevo."
else
    echo "✅ Código compilado NO tiene create-link"
fi
echo ""

# 9. Reiniciar PM2
echo "=== PASO 8: Reiniciar PM2 ==="
pm2 restart boletera --update-env
echo "✅ PM2 reiniciado"
echo ""

# 10. Mostrar estado
echo "=== PASO 9: Estado de PM2 ==="
pm2 status
echo ""

echo "=========================================="
echo "✅ REBUILD COMPLETO"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Verifica los logs: pm2 logs boletera --lines 30"
echo "2. Prueba hacer checkout en el navegador"
echo "3. Limpia el caché del navegador completamente"
echo "4. NO debe aparecer error de create-link"
echo ""
