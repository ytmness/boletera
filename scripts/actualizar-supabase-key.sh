#!/bin/bash

echo "=== 🔑 ACTUALIZAR SUPABASE ANON KEY ==="
echo ""

cd /var/www/boletera

# Nueva ANON_KEY correcta
NEW_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NzU4MTIsImV4cCI6MjA4MjU1MTgxMn0.s51DalBawxuiRGIVXnHnrmuNhzPOsSOvHgoPwxIzido"

echo "=== Paso 1: Backup del .env actual ==="
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"
echo ""

echo "=== Paso 2: Actualizar NEXT_PUBLIC_SUPABASE_ANON_KEY ==="
# Usar sed de manera segura para reemplazar la línea completa
sed -i "/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/c\NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEW_ANON_KEY" .env

if grep -q "$NEW_ANON_KEY" .env; then
    echo "✅ ANON_KEY actualizada correctamente"
else
    echo "❌ Error al actualizar ANON_KEY"
    exit 1
fi
echo ""

echo "=== Paso 3: Verificar configuración ==="
echo "SUPABASE_URL: $(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d'=' -f2)"
echo "ANON_KEY (primeros 50 caracteres): $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env | cut -d'=' -f2 | cut -c1-50)..."
echo ""

echo "=== Paso 4: Rebuild de la aplicación ==="
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
else
    echo "❌ Error en el build"
    exit 1
fi
echo ""

echo "=== Paso 5: Reiniciar PM2 ==="
pm2 restart boletera
pm2 save
echo "✅ Servidor reiniciado"
echo ""

echo "=== Paso 6: Verificar estado ==="
sleep 3
pm2 status boletera
echo ""

echo "=== 🎯 PRUEBA EL LOGIN AHORA ==="
echo "1. Ve a https://scenario.com.mx/login"
echo "2. Ingresa tu email"
echo "3. Deberías recibir el código de verificación"
echo ""
echo "Si sigue fallando, ejecuta: pm2 logs boletera --lines 50"
echo ""
