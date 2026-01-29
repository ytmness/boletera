# 🔧 Comandos Directos para el Servidor

## Verificar y Corregir .env

Ejecuta estos comandos directamente en el servidor:

```bash
cd /var/www/boletera

# 1. Hacer backup del .env actual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

# 2. Ver el contenido actual completo
echo "📋 Contenido actual:"
cat .env
echo ""

# 3. Verificar longitud de las URLs
echo "📋 Verificando URLs:"
DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
DIRECT_URL=$(grep "^DIRECT_URL=" .env | cut -d'=' -f2-)
echo "DATABASE_URL tiene $(echo -n "$DB_URL" | wc -c) caracteres"
echo "DIRECT_URL tiene $(echo -n "$DIRECT_URL" | wc -c) caracteres"
echo ""

# 4. Ver las URLs (sin mostrar contraseña completa)
echo "DATABASE_URL:"
echo "$DB_URL" | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/' | head -c 120
echo "..."
echo ""
echo "DIRECT_URL:"
echo "$DIRECT_URL" | sed 's/:\/\/postgres:[^@]*@/:\/\/postgres:***@/' | head -c 120
echo "..."
echo ""

# 5. Verificar si las URLs están completas
if [[ "$DB_URL" != *"supabase.co:5432/postgres"* ]]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL parece incompleta"
else
    echo "✅ DATABASE_URL parece completa"
fi

if [[ "$DIRECT_URL" != *"supabase.co:5432/postgres"* ]]; then
    echo "⚠️  ADVERTENCIA: DIRECT_URL parece incompleta"
else
    echo "✅ DIRECT_URL parece completa"
fi
echo ""

# 6. Recrear .env con formato correcto
cat > .env << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9zZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4
DATABASE_URL=postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_APP_URL=https://scenario.com.mx
NEXT_PUBLIC_APP_NAME=Grupo Regia - Boletera
QR_SECRET_KEY=gr-qr-secret-2025-cambiar-en-produccion
JWT_SECRET=8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a

# Clip Payment Gateway Configuration
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
ENVEOF

echo "✅ Archivo .env recreado"
echo ""

# 7. Verificar el nuevo contenido
echo "📋 Nuevo contenido (primeras líneas):"
head -5 .env
echo ""

# 8. Probar conexión con Prisma
echo "🧪 Probando conexión con Prisma..."
if [ -f "node_modules/.bin/prisma" ]; then
    if ./node_modules/.bin/prisma db pull > /tmp/prisma-test.log 2>&1; then
        echo "✅ ¡Conexión exitosa con Prisma!"
        echo ""
        echo "Puedes continuar con:"
        echo "  ./node_modules/.bin/prisma db push"
    else
        echo "❌ Error de conexión con Prisma"
        echo ""
        echo "Detalles del error:"
        cat /tmp/prisma-test.log
        echo ""
        echo "💡 La contraseña '7ianbJsQzipn2IFk' podría ser incorrecta."
        echo "   Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
        echo "   Y verifica o resetea la contraseña de la base de datos."
    fi
else
    echo "⚠️  Prisma no está instalado. Ejecuta: npm install"
fi
```

## Si la contraseña es incorrecta, actualizar manualmente:

```bash
cd /var/www/boletera
nano .env

# Busca las líneas:
# DATABASE_URL=postgresql://postgres:7ianbJsQzipn2IFk@...
# DIRECT_URL=postgresql://postgres:7ianbJsQzipn2IFk@...

# Reemplaza '7ianbJsQzipn2IFk' con la contraseña correcta
# Guarda: Ctrl+O, Enter, Ctrl+X
```

## Después de corregir, sincronizar schema y reiniciar:

```bash
cd /var/www/boletera

# Sincronizar schema
./node_modules/.bin/prisma db push

# Corregir PM2
pm2 delete boletera
npm run build  # Si no existe .next
pm2 start npm --name boletera -- start --cwd /var/www/boletera

# Verificar
pm2 status
pm2 logs boletera --lines 20
```
