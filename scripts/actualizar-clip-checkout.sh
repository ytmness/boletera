#!/bin/bash
# Script para actualizar el Checkout Transparente de Clip en el servidor
# Este script reconstruye la aplicación con el SDK correcto de Clip

set -e

echo "=========================================="
echo "🔄 ACTUALIZAR CHECKOUT TRANSPARENTE DE CLIP"
echo "=========================================="

cd /var/www/boletera

echo ""
echo "=== PASO 1: Actualizar código fuente ==="
git pull origin main

echo ""
echo "=== PASO 2: Eliminar build antiguo ==="
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Build antiguo eliminado"

echo ""
echo "=== PASO 3: Regenerar Prisma Client ==="
./node_modules/.bin/prisma generate
echo "✅ Prisma Client regenerado"

echo ""
echo "=== PASO 4: Rebuild completo ==="
npm run build
echo "✅ Build completado"

echo ""
echo "=== PASO 5: Reiniciar PM2 ==="
pm2 restart boletera --update-env
echo "✅ PM2 reiniciado"

echo ""
echo "=== PASO 6: Verificar estado ==="
pm2 status boletera
echo ""
echo "=== ÚLTIMOS LOGS ==="
pm2 logs boletera --lines 30 --nostream

echo ""
echo "=========================================="
echo "✅ ¡ACTUALIZACIÓN COMPLETADA!"
echo "=========================================="
echo ""
echo "📋 Resumen de cambios:"
echo "  ✅ SDK de Clip actualizado a: https://sdk.clip.mx/js/clip-sdk.js"
echo "  ✅ Formulario de pago configurado con ClipSDK oficial"
echo "  ✅ API de payments usando el formato correcto"
echo "  ✅ Soporte para MSI (Meses Sin Intereses) habilitado"
echo ""
echo "🧪 Para probar:"
echo "  1. Abre: https://scenario.com.mx"
echo "  2. Selecciona un evento y boletos"
echo "  3. Procede al checkout"
echo "  4. El formulario de Clip debería cargarse correctamente"
echo ""
