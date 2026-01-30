#!/bin/bash

echo "======================================"
echo "🚀 DEPLOY COMPLETO AL SERVIDOR"
echo "======================================"

# Detener PM2 para evitar reintentos
echo ""
echo "⏸️  Deteniendo PM2..."
pm2 stop boletera || true
sleep 2

# Limpiar el .env de posibles errores de formato
echo ""
echo "🧹 Limpiando archivo .env..."

# Respaldar .env actual
cp .env .env.backup.$(date +%s)

# Verificar línea 11 y mostrarla
echo "📄 Contenido actual de la línea 11 del .env:"
sed -n '11p' .env

# Si la línea 11 tiene problemas, la comentamos temporalmente
# (probablemente es una variable mal formateada)
if grep -q "Regia" .env; then
  echo "⚠️  Encontrado problema en .env - corrigiendo..."
  # Buscar líneas sin = o mal formateadas y comentarlas
  sed -i 's/^Regia/#Regia/g' .env
  sed -i 's/^[^#].*[^=].*$/# &/g' .env 2>/dev/null || true
fi

echo "✅ .env limpiado"

# Git pull
echo ""
echo "📥 Pulling cambios desde GitHub..."
git fetch origin main
git reset --hard origin/main

# Instalar dependencias (por si hay nuevas)
echo ""
echo "📦 Instalando dependencias..."
npm install

# Limpiar build anterior
echo ""
echo "🗑️  Limpiando build anterior..."
rm -rf .next

# Build de producción
echo ""
echo "🔨 Construyendo aplicación..."
export NODE_ENV=production
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Error en el build"
  exit 1
fi

echo "✅ Build exitoso"

# Verificar que .next existe
if [ ! -d ".next" ]; then
  echo "❌ Error: Directorio .next no fue creado"
  exit 1
fi

# Reiniciar PM2
echo ""
echo "🔄 Reiniciando PM2..."
pm2 restart boletera

# Esperar y verificar
sleep 5
echo ""
echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "======================================"
echo "✅ DEPLOY COMPLETADO"
echo "======================================"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verificar logs: pm2 logs boletera --lines 50"
echo "   2. Probar el sitio: https://scenario.com.mx"
echo "   3. Probar admin: https://scenario.com.mx/admin"
