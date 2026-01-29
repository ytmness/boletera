#!/bin/bash
# Script para forzar rebuild completo del código del cliente

cd ~/boletera

echo "=== PASO 1: Verificar código fuente ==="
grep -A 5 "router.push" app/eventos/\[id\]/mesas/page.tsx | grep checkout
echo ""

echo "=== PASO 2: Buscar create-link en código fuente (NO debe aparecer) ==="
grep -n "create-link" app/eventos/\[id\]/mesas/page.tsx
echo ""

echo "=== PASO 3: Eliminar TODO el código compilado ==="
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
echo "✓ Código compilado eliminado"
echo ""

echo "=== PASO 4: Regenerar Prisma ==="
./node_modules/.bin/prisma generate
echo ""

echo "=== PASO 5: Build completo ==="
npm run build
echo ""

echo "=== PASO 6: Verificar que NO tiene create-link en código compilado ==="
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null | head -10
if [ $? -eq 0 ]; then
    echo "⚠️  ADVERTENCIA: Se encontraron archivos con create-link"
    echo "Archivos encontrados:"
    find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
else
    echo "✓ No se encontraron archivos con create-link"
fi
echo ""

echo "=== PASO 7: Reiniciar PM2 ==="
pm2 restart boletera --update-env
echo ""

echo "=== PASO 8: Ver logs ==="
pm2 logs boletera --lines 10 --nostream

echo ""
echo "✅ Rebuild completo. Ahora prueba en el navegador con caché limpia."
