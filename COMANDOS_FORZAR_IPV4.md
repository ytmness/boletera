# 🔧 Forzar IPv4 y Conectar a Supabase

## Problema
El sistema sigue intentando usar IPv6 a pesar de haberlo deshabilitado.

## ✅ Solución: Forzar IPv4 Explícitamente

### Paso 1: Obtener la IP IPv4 de Supabase

```bash
# Obtener solo la IP IPv4 (sin IPv6)
getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | grep -v "::" | awk '{print $1}' | head -1

# O con nslookup
nslookup db.hlvhuwwatnzqiviopqrj.supabase.co | grep -A 2 "Name:" | grep "Address:" | grep -v "::" | awk '{print $2}' | head -1
```

### Paso 2: Probar conexión con IP IPv4 directa

```bash
cd /var/www/boletera

# Obtener IP IPv4
IPV4=$(getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | grep -v "::" | awk '{print $1}' | head -1)
echo "IP IPv4 encontrada: $IPV4"

# Probar conexión con IP directa
PGPASSWORD="7ianbJsQzipn2IFk" psql -h $IPV4 -p 5432 -U postgres -d postgres -c "SELECT version();"
```

### Paso 3: Si funciona, actualizar .env con IP directa (temporal)

```bash
cd /var/www/boletera

# Obtener IP
IPV4=$(getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | grep -v "::" | awk '{print $1}' | head -1)

# Hacer backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Actualizar .env con IP directa
sed -i "s|@db.hlvhuwwatnzqiviopqrj.supabase.co|@$IPV4|g" .env

# Verificar
cat .env | grep DATABASE_URL
```

### Paso 4: MEJOR OPCIÓN - Usar Connection Pooling

El Connection Pooling es más confiable y no tiene problemas con IPv6:

```bash
cd /var/www/boletera
nano .env
```

**Actualiza `DATABASE_URL` para usar el pooler:**

```env
DATABASE_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
DIRECT_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

**⚠️ IMPORTANTE**: 
- Usuario del pooler: `postgres.hlvhuwwatnzqiviopqrj` (con el project ref)
- Host: `aws-0-us-east-1.pooler.supabase.com`
- Puerto: `6543`

### Paso 5: Probar Connection Pooling

```bash
cd /var/www/boletera

# Probar conexión con pooler
PGPASSWORD="7ianbJsQzipn2IFk" psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.hlvhuwwatnzqiviopqrj -d postgres -c "SELECT version();"
```

### Paso 6: Si el pooler funciona, sincronizar Prisma

```bash
cd /var/www/boletera

# Generar cliente Prisma
./node_modules/.bin/prisma generate

# Sincronizar schema
./node_modules/.bin/prisma db push

# Si funciona, hacer build
rm -rf .next
npm run build

# Reiniciar PM2
pm2 delete boletera
pm2 start npm --name boletera -- start --cwd /var/www/boletera
pm2 logs boletera --lines 20
```

## 🔧 Configuración Permanente de IPv4

Para hacer que el sistema prefiera IPv4 permanentemente:

```bash
# Editar configuración de red
nano /etc/gai.conf

# Agregar esta línea (si no existe):
precedence ::ffff:0:0/96  100

# O crear el archivo si no existe:
cat > /etc/gai.conf << 'EOF'
precedence ::ffff:0:0/96  100
EOF
```

## 📝 Comandos Completos

```bash
cd /var/www/boletera

# Opción A: Probar con IP IPv4 directa
IPV4=$(getent hosts db.hlvhuwwatnzqiviopqrj.supabase.co | grep -v "::" | awk '{print $1}' | head -1)
echo "IP IPv4: $IPV4"
PGPASSWORD="7ianbJsQzipn2IFk" psql -h $IPV4 -p 5432 -U postgres -d postgres -c "SELECT version();"

# Opción B: Probar con Connection Pooling (RECOMENDADO)
PGPASSWORD="7ianbJsQzipn2IFk" psql -h aws-0-us-east-1.pooler.supabase.com -p 6543 -U postgres.hlvhuwwatnzqiviopqrj -d postgres -c "SELECT version();"
```
