#!/bin/bash
# Script para verificar firewall y conexión a Supabase
# Ejecutar en el servidor: bash scripts/verificar-firewall-y-conexion.sh

set -e

echo "🔍 Verificando firewall y conexión a Supabase..."
echo ""

cd /var/www/boletera || { echo "❌ Error: No se encontró el directorio /var/www/boletera"; exit 1; }

# 1. Verificar si hay firewall activo
echo "📋 Paso 1: Verificando firewall..."
if command -v ufw &> /dev/null; then
    echo "UFW está instalado. Estado:"
    ufw status
    echo ""
    
    # Verificar reglas específicas para PostgreSQL
    echo "Reglas relacionadas con PostgreSQL:"
    ufw status | grep -i postgres || echo "No hay reglas específicas para PostgreSQL"
    echo ""
fi

if command -v iptables &> /dev/null; then
    echo "Reglas de iptables para salida (OUTPUT):"
    iptables -L OUTPUT -n -v | head -20
    echo ""
fi

# 2. Verificar conectividad básica
echo "📋 Paso 2: Verificando conectividad..."
echo "Probando ping a Supabase..."
ping -c 2 db.hlvhuwwatnzqiviopqrj.supabase.co 2>&1 | head -5
echo ""

# 3. Verificar resolución DNS
echo "📋 Paso 3: Verificando DNS..."
echo "Resolución IPv4:"
getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | grep -v "::" || nslookup db.hlvhuwwatnzqiviopqrj.supabase.co | grep -A 2 "Name:" | head -5
echo ""

# 4. Probar conexión al puerto 5432 forzando IPv4
echo "📋 Paso 4: Probando conexión al puerto 5432 (IPv4)..."
if command -v nc &> /dev/null; then
    # Obtener IP IPv4
    IPV4=$(getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | awk '{print $1}' | grep -v "::" | head -1)
    if [ -n "$IPV4" ]; then
        echo "IP IPv4 encontrada: $IPV4"
        echo "Probando conexión a $IPV4:5432..."
        timeout 5 nc -zv -4 $IPV4 5432 2>&1 || echo "❌ Conexión falló"
    else
        echo "⚠️  No se pudo obtener IP IPv4"
    fi
else
    echo "⚠️  nc no está instalado"
fi
echo ""

# 5. Probar con psql forzando IPv4
echo "📋 Paso 5: Probando conexión con psql (IPv4)..."
if command -v psql &> /dev/null; then
    # Cargar contraseña del .env
    if [ -f ".env" ]; then
        source .env 2>/dev/null || true
        DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/postgres:\([^@]*\)@.*/\1/p')
        
        if [ -n "$DB_PASSWORD" ]; then
            echo "Probando conexión directa..."
            PGPASSWORD="$DB_PASSWORD" psql -h db.hlvhuwwatnzqiviopqrj.supabase.co -p 5432 -U postgres -d postgres -c "SELECT version();" 2>&1 | head -5
            
            # Si falla, probar con IP directa
            IPV4=$(getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | awk '{print $1}' | grep -v "::" | head -1)
            if [ -n "$IPV4" ]; then
                echo ""
                echo "Probando con IP directa ($IPV4)..."
                PGPASSWORD="$DB_PASSWORD" psql -h $IPV4 -p 5432 -U postgres -d postgres -c "SELECT version();" 2>&1 | head -5
            fi
        else
            echo "⚠️  No se pudo extraer la contraseña del .env"
        fi
    else
        echo "⚠️  Archivo .env no encontrado"
    fi
else
    echo "⚠️  psql no está instalado. Instalando..."
    apt-get update -qq && apt-get install -y postgresql-client > /dev/null 2>&1
    echo "✅ psql instalado"
fi
echo ""

# 6. Verificar configuración de red
echo "📋 Paso 6: Verificando configuración de red..."
echo "Interfaces de red:"
ip addr show | grep -E "^[0-9]+:|inet " | head -10
echo ""

# 7. Sugerencias
echo "💡 Sugerencias:"
echo ""
echo "Si la conexión falla, prueba:"
echo ""
echo "1. Permitir conexiones salientes en el firewall:"
echo "   ufw allow out 5432/tcp"
echo "   # O si usas iptables:"
echo "   iptables -A OUTPUT -p tcp --dport 5432 -j ACCEPT"
echo ""
echo "2. Deshabilitar IPv6 temporalmente:"
echo "   sysctl -w net.ipv6.conf.all.disable_ipv6=1"
echo ""
echo "3. Verificar restricciones de IP en Supabase:"
echo "   Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database"
echo "   Busca 'Connection pooling' o 'IP Restrictions'"
echo ""
echo "4. Probar con Connection Pooling:"
echo "   Usa: aws-0-us-east-1.pooler.supabase.com:6543"
echo "   Usuario: postgres.hlvhuwwatnzqiviopqrj"
echo ""

echo "✅ Verificación completada"
