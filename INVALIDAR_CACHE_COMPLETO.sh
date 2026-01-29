#!/bin/bash
# Script para invalidar completamente el caché cambiando la versión

cd ~/boletera

echo "=== PASO 1: Backup del package.json ==="
cp package.json package.json.backup

echo "=== PASO 2: Cambiar versión para generar nuevos hashes ==="
# Leer la versión actual
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "Versión actual: $CURRENT_VERSION"

# Generar nueva versión (incrementar patch)
NEW_VERSION=$(echo $CURRENT_VERSION | awk -F. '{print $1"."$2"."($3+1)}')
echo "Nueva versión: $NEW_VERSION"

# Cambiar versión
sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
echo "✓ Versión actualizada en package.json"

echo ""
echo "=== PASO 3: Eliminar TODO el código compilado ==="
rm -rf .next
rm -rf node_modules/.cache
echo "✓ Código compilado eliminado"

echo ""
echo "=== PASO 4: Rebuild completo ==="
./node_modules/.bin/prisma generate
npm run build

echo ""
echo "=== PASO 5: Verificar build ==="
if [ -d ".next" ]; then
    echo "✓ Build exitoso"
else
    echo "✗ Error en el build"
    exit 1
fi

echo ""
echo "=== PASO 6: Verificar que NO tiene create-link ==="
FOUND_FILES=$(find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null | wc -l)
if [ "$FOUND_FILES" -eq 0 ]; then
    echo "✓ No se encontraron archivos con create-link"
else
    echo "⚠️  Se encontraron $FOUND_FILES archivos con create-link"
    find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null | head -5
fi

echo ""
echo "=== PASO 7: Reiniciar PM2 ==="
pm2 restart boletera --update-env

echo ""
echo "=== PASO 8: Verificar logs ==="
pm2 logs boletera --lines 5 --nostream

echo ""
echo "✅ Proceso completo"
echo ""
echo "📝 IMPORTANTE:"
echo "   - La versión se cambió de $CURRENT_VERSION a $NEW_VERSION"
echo "   - Esto generará nuevos nombres de archivos JavaScript"
echo "   - Los navegadores descargarán automáticamente la versión nueva"
echo ""
echo "🔄 Para revertir la versión (opcional):"
echo "   cp package.json.backup package.json"
