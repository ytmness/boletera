#!/bin/bash

# Script para SOLO corregir el .env (agregar comillas donde faltan)
# Ejecutar en el servidor: bash scripts/corregir-env-solo.sh

set -e

echo "=========================================="
echo "🔧 CORREGIR .ENV (SOLO COMILLAS)"
echo "=========================================="

# Verificar que estamos en el directorio correcto
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró .env en el directorio actual."
    exit 1
fi

echo ""
echo "=== PASO 1: Hacer backup del .env actual ==="
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

echo ""
echo "=== PASO 2: Mostrar línea 9 actual ==="
echo "Línea 9 antes de corregir:"
nl -ba .env | sed -n '9p'

echo ""
echo "=== PASO 3: Corregir valores sin comillas ==="

# Leer el .env línea por línea y corregir
TEMP_ENV=$(mktemp)
while IFS= read -r line; do
    # Si es comentario o línea vacía, copiar tal cual
    if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
        echo "$line" >> "$TEMP_ENV"
        continue
    fi
    
    # Si ya tiene comillas, copiar tal cual
    if [[ "$line" =~ =\" ]] || [[ "$line" =~ =\' ]]; then
        echo "$line" >> "$TEMP_ENV"
        continue
    fi
    
    # Si no tiene =, copiar tal cual
    if [[ ! "$line" =~ = ]]; then
        echo "$line" >> "$TEMP_ENV"
        continue
    fi
    
    # Extraer clave y valor
    KEY="${line%%=*}"
    VALUE="${line#*=}"
    
    # Si el valor tiene espacios o es una URL de PostgreSQL, agregar comillas
    if [[ "$VALUE" =~ [[:space:]] ]] || [[ "$VALUE" =~ ^postgresql:// ]]; then
        echo "${KEY}=\"${VALUE}\"" >> "$TEMP_ENV"
    else
        echo "$line" >> "$TEMP_ENV"
    fi
done < .env

# Reemplazar .env con el corregido
mv "$TEMP_ENV" .env
echo "✅ Archivo .env corregido"

echo ""
echo "=== PASO 4: Verificar línea 9 después de corregir ==="
echo "Línea 9 después de corregir:"
nl -ba .env | sed -n '9p'

echo ""
echo "=== PASO 5: Verificar DATABASE_URL y DIRECT_URL ==="
grep -E "^DATABASE_URL=|^DIRECT_URL=" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

echo ""
echo "=== PASO 6: Verificar que no haya valores problemáticos ==="
# Buscar líneas con espacios sin comillas
PROBLEMATIC=$(grep -E "^[^#]*=.*[[:space:]]" .env | grep -v '="' | grep -v "='")
if [ -z "$PROBLEMATIC" ]; then
    echo "✅ No se encontraron valores problemáticos"
else
    echo "⚠️  Se encontraron líneas que pueden causar problemas:"
    echo "$PROBLEMATIC"
fi

echo ""
echo "=========================================="
echo "✅ .ENV CORREGIDO"
echo "=========================================="
echo ""
echo "📝 Próximos pasos:"
echo "  1. Verifica que el .env esté correcto: cat .env"
echo "  2. Si usas PM2, reinicia: pm2 restart boletera --update-env"
echo "  3. Verifica logs: pm2 logs boletera --lines 50"
echo ""
