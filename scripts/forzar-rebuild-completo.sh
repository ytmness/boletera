#!/bin/bash

# Script para forzar rebuild completo y limpiar caché
# Ejecutar en el servidor: bash scripts/forzar-rebuild-completo.sh

set -e

echo "=========================================="
echo "🔧 FORZAR REBUILD COMPLETO"
echo "=========================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

echo ""
echo "=== PASO 1: Actualizar código desde Git ==="
git pull origin main || echo "⚠️ No se pudo hacer git pull (continuando...)"

echo ""
echo "=== PASO 2: Eliminar TODO el código compilado ==="
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
echo "=== PASO 3: Cambiar versión para invalidar caché ==="
# Incrementar versión en package.json
CURRENT_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "Versión actual: $CURRENT_VERSION"

# Extraer números de versión
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Incrementar patch
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

# Actualizar package.json
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
else
    # Linux
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

echo "✅ Versión cambiada de $CURRENT_VERSION a $NEW_VERSION"

echo ""
echo "=== PASO 4: Regenerar Prisma ==="
npx prisma generate
echo "✅ Prisma regenerado"

echo ""
echo "=== PASO 5: Build completo ==="
npm run build
echo "✅ Build completado"

echo ""
echo "=== PASO 6: Verificar que NO tiene create-link en código compilado ==="
# Buscar create-link en código compilado del cliente
CLIENT_FILES=$(find .next/static/chunks -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null | head -5)

if [ -n "$CLIENT_FILES" ]; then
    echo "⚠️ ADVERTENCIA: Se encontraron archivos con create-link"
    echo "Archivos encontrados:"
    echo "$CLIENT_FILES"
    echo ""
    echo "Esto indica que el código fuente todavía tiene create-link."
    echo "Por favor verifica el código fuente."
else
    echo "✅ Código compilado NO tiene create-link"
fi

echo ""
echo "=== PASO 7: Reiniciar PM2 ==="
pm2 restart boletera --update-env
echo "✅ PM2 reiniciado"

echo ""
echo "=== PASO 8: Estado de PM2 ==="
pm2 status

echo ""
echo "=========================================="
echo "✅ REBUILD COMPLETO"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo "1. Verifica los logs: pm2 logs boletera --lines 30"
echo "2. Prueba hacer checkout en el navegador"
echo "3. Limpia el caché del navegador completamente (Ctrl+Shift+Delete)"
echo "4. O usa modo incógnito para evitar caché"
echo "5. NO debe aparecer error de create-link"
echo ""
echo "Si todavía ves create-link después de esto:"
echo "- Verifica que el código fuente NO tenga create-link"
echo "- Verifica que el navegador NO esté usando Service Workers"
echo "- Verifica que el CDN/proxy NO esté cacheando los archivos JS"
