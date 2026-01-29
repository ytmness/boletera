#!/bin/bash
# Script para configurar credenciales de Clip en el servidor
# Ejecutar en el servidor: bash scripts/configurar-clip-servidor.sh

echo "🔐 Configurando credenciales de Clip en el servidor..."
echo ""

# Ir al directorio del proyecto
cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    echo "❌ Error: El archivo .env no existe"
    echo "Por favor crea el archivo .env primero"
    exit 1
fi

# Credenciales de Clip
CLIP_AUTH_TOKEN="13120871-a17e-43e4-ab3c-e54d1ca503b4"
CLIP_WEBHOOK_SECRET="bfb49cda-a55d-40d6-9049-39987ba016f2"

# Verificar si las variables ya existen
if grep -q "CLIP_AUTH_TOKEN" .env; then
    echo "⚠️  Las variables de Clip ya existen en .env"
    echo "¿Deseas actualizarlas? (s/n)"
    read -r respuesta
    
    if [ "$respuesta" != "s" ] && [ "$respuesta" != "S" ]; then
        echo "Operación cancelada"
        exit 0
    fi
    
    # Actualizar las variables existentes
    echo "📝 Actualizando variables existentes..."
    sed -i "s|CLIP_AUTH_TOKEN=.*|CLIP_AUTH_TOKEN=$CLIP_AUTH_TOKEN|" .env
    sed -i "s|CLIP_WEBHOOK_SECRET=.*|CLIP_WEBHOOK_SECRET=$CLIP_WEBHOOK_SECRET|" .env
else
    # Agregar las variables al final del archivo
    echo "📝 Agregando variables de Clip al archivo .env..."
    echo "" >> .env
    echo "# Clip Payment Gateway Configuration" >> .env
    echo "CLIP_AUTH_TOKEN=$CLIP_AUTH_TOKEN" >> .env
    echo "CLIP_WEBHOOK_SECRET=$CLIP_WEBHOOK_SECRET" >> .env
fi

# Verificar que se agregaron correctamente
echo ""
echo "✅ Verificando configuración..."
if grep -q "CLIP_AUTH_TOKEN=$CLIP_AUTH_TOKEN" .env && grep -q "CLIP_WEBHOOK_SECRET=$CLIP_WEBHOOK_SECRET" .env; then
    echo "✅ Credenciales de Clip configuradas correctamente"
    echo ""
    echo "📋 Variables configuradas:"
    grep CLIP .env
    echo ""
    
    # Preguntar si desea reiniciar PM2
    echo "¿Deseas reiniciar la aplicación ahora? (s/n)"
    read -r reiniciar
    
    if [ "$reiniciar" = "s" ] || [ "$reiniciar" = "S" ]; then
        echo "🔄 Reiniciando aplicación..."
        pm2 restart boletera
        
        echo ""
        echo "✅ Aplicación reiniciada"
        echo ""
        echo "📊 Estado de PM2:"
        pm2 status
        
        echo ""
        echo "📝 Últimas líneas de log:"
        pm2 logs boletera --lines 10 --nostream
    else
        echo ""
        echo "⚠️  No olvides reiniciar la aplicación con:"
        echo "   pm2 restart boletera"
    fi
else
    echo "❌ Error: No se pudieron verificar las credenciales"
    echo "Por favor verifica el archivo .env manualmente"
    exit 1
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "🔗 Próximos pasos:"
echo "1. Configura el webhook en el panel de Clip:"
echo "   URL: https://scenario.com.mx/api/webhooks/clip"
echo "2. Prueba el flujo de pago desde el navegador"
echo "3. Verifica los logs con: pm2 logs boletera"
