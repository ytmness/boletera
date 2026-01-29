#!/bin/bash
# Script para aplicar cambios de Prisma
# Ejecutar: bash scripts/apply-prisma-changes.sh

echo "🔄 Generando cliente de Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente generado exitosamente"
    
    echo "🔄 Aplicando cambios a la base de datos..."
    npx prisma db push
    
    if [ $? -eq 0 ]; then
        echo "✅ Cambios aplicados exitosamente"
    else
        echo "❌ Error al aplicar cambios"
        exit 1
    fi
else
    echo "❌ Error al generar cliente"
    exit 1
fi
