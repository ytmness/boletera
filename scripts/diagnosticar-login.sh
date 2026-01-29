#!/bin/bash

echo "=== 🔍 DIAGNÓSTICO DE LOGIN ==="
echo ""

cd /var/www/boletera

echo "=== Verificando variables de entorno de Supabase ==="
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "✅ Variables de Supabase encontradas en .env"
    echo "   NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d'=' -f2 | cut -d'/' -f3)"
else
    echo "❌ Variables de Supabase NO encontradas en .env"
fi
echo ""

echo "=== PM2 logs de los últimos 50 errores ==="
pm2 logs boletera --lines 50 --err --nostream
echo ""

echo "=== Probar endpoint de login manualmente ==="
echo "Test con email: test@ejemplo.com"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com"}' \
  -w "\nHTTP Status: %{http_code}\n" 2>&1
echo ""

echo "=== Verificar si Supabase está accesible desde el servidor ==="
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env | cut -d'=' -f2)
if [ -n "$SUPABASE_URL" ]; then
    echo "Probando conexión a: $SUPABASE_URL"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$SUPABASE_URL"
else
    echo "❌ No se pudo extraer NEXT_PUBLIC_SUPABASE_URL"
fi
echo ""

echo "=== 🎯 ACCIONES RECOMENDADAS ==="
echo "1. Verificar que Supabase Auth esté habilitado en el dashboard"
echo "2. Configurar un Email Provider en Supabase (Settings > Authentication > Email Templates)"
echo "3. O usar el modo de desarrollo (los códigos aparecen en Supabase Dashboard > Logs)"
echo ""
