#!/bin/bash

# Script de Instalación Automática - Boletera Regia
# Este script configura todo el proyecto automáticamente

set -e  # Detener en caso de error

echo "🚀 Instalación Automática - Boletera Regia"
echo "=========================================="
echo ""

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No estás en la raíz del proyecto"
    echo "   Navega a la carpeta boletera-main y ejecuta de nuevo"
    exit 1
fi

echo "✅ Directorio correcto"
echo ""

# 1. Copiar .env.local
echo "📝 Paso 1/6: Configurando variables de entorno..."
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local ya existe. ¿Sobrescribir? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "   Saltando configuración de .env.local"
    else
        cp .env.local.template .env.local
        echo "✅ .env.local actualizado"
    fi
else
    # Crear .env.local con las credenciales
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hlvhuwwatnzqiviopqrj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NjQyNTcsImV4cCI6MjA1MTA0MDI1N30.7gXNIQm2lDvQVK2_GN_Vl3fSwLMb4Og4MzZCw3fCmyI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmh1d3dhdG56cWl2aW9wcXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ2NDI1NywiZXhwIjoyMDUxMDQwMjU3fQ.lTXPRwm3XlsXDEF_zJVqZQm9OxXCOKQ8eTqZqZqD8U4

# Database Configuration
DATABASE_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:xzEFcqe731uTgnmi@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.hlvhuwwatnzqiviopqrj:xzEFcqe731uTgnmi@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Grupo Regia - Boletera"

# Security
QR_SECRET_KEY=gr-qr-secret-2025-cambiar-en-produccion
JWT_SECRET=8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a
EOF
    echo "✅ .env.local creado"
fi
echo ""

# 2. Instalar dependencias
echo "📦 Paso 2/6: Instalando dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# 3. Generar cliente Prisma
echo "🔨 Paso 3/6: Generando cliente Prisma..."
npx prisma generate
echo "✅ Cliente Prisma generado"
echo ""

# 4. Probar conexión
echo "🔍 Paso 4/6: Probando conexión con Supabase..."
if node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$connect().then(() => { console.log('✅ Conexión exitosa'); p.\$disconnect(); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); })"; then
    echo "✅ Conexión con Supabase funcionando"
else
    echo "❌ Error de conexión. Ejecuta: node diagnostico-conexion.js"
    exit 1
fi
echo ""

# 5. Aplicar schema
echo "🗄️  Paso 5/6: Aplicando schema a la base de datos..."
npx prisma db push --accept-data-loss
echo "✅ Schema aplicado - Tablas creadas"
echo ""

# 6. Seed de datos
echo "🌱 Paso 6/6: Creando usuarios de prueba..."
npx tsx prisma/seed.ts
echo "✅ Usuarios y datos de prueba creados"
echo ""

# Resumen
echo "=========================================="
echo "✅ ¡INSTALACIÓN COMPLETADA!"
echo "=========================================="
echo ""
echo "📝 Credenciales de acceso:"
echo "   Admin:"
echo "   - Email: admin@grupoRegia.com"
echo "   - Password: admin123"
echo ""
echo "   Vendedor:"
echo "   - Email: vendedor@grupoRegia.com"
echo "   - Password: vendedor123"
echo ""
echo "🚀 Para iniciar el proyecto:"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   - Homepage: http://localhost:3000"
echo "   - Login: http://localhost:3000/login"
echo "   - Admin: http://localhost:3000/admin"
echo ""
echo "🎉 ¡Todo listo para usar!"
