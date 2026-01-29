#!/bin/bash

echo "==========================================
🔧 ARREGLAR CONEXIÓN A BASE DE DATOS
==========================================
"

cd /var/www/boletera

echo "=== Paso 1: Verificar contraseña actual ==="
grep "DATABASE_URL" .env | head -1

echo ""
echo "=== Paso 2: Actualizar a contraseña correcta ==="
# Reemplazar CUALQUIER contraseña por la correcta
sed -i 's/postgresql:\/\/postgres\.hlvhuwwatnzqiviopqrj:[^@]*@/postgresql:\/\/postgres.hlvhuwwatnzqiviopqrj:d7KTP0tq7bxiMVKZ@/g' .env

echo "✅ Contraseña actualizada"

echo ""
echo "=== Paso 3: Verificar el cambio ==="
grep "DATABASE_URL" .env | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

echo ""
echo "=== Paso 4: Reiniciar PM2 ==="
pm2 restart boletera

sleep 3

echo ""
echo "=== Paso 5: Ver logs ==="
pm2 logs boletera --lines 40
