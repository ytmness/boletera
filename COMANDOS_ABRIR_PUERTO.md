# 🔓 Abrir Puerto y Solucionar Conexión a Supabase

## Problema
El servidor no puede conectarse al puerto 5432 de Supabase, posiblemente por:
1. Firewall bloqueando conexiones salientes
2. Problema con IPv6 vs IPv4
3. Restricciones de IP en Supabase

## ✅ Solución Paso a Paso

### Paso 1: Verificar y abrir el puerto en el firewall

```bash
# Verificar estado del firewall
ufw status

# Si UFW está activo, permitir conexiones salientes al puerto 5432
ufw allow out 5432/tcp

# Verificar que se agregó la regla
ufw status numbered | grep 5432
```

### Paso 2: Si usas iptables directamente

```bash
# Permitir conexiones salientes al puerto 5432
iptables -A OUTPUT -p tcp --dport 5432 -j ACCEPT

# Guardar las reglas (si usas iptables-persistent)
iptables-save > /etc/iptables/rules.v4
```

### Paso 3: Deshabilitar IPv6 temporalmente (si es necesario)

```bash
# Deshabilitar IPv6 temporalmente
sysctl -w net.ipv6.conf.all.disable_ipv6=1

# Para hacerlo permanente, edita:
nano /etc/sysctl.conf

# Agrega estas líneas:
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# Aplicar cambios
sysctl -p
```

### Paso 4: Verificar restricciones de IP en Supabase

1. Ve a: **https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database**
2. Busca la sección **"Connection pooling"** o **"IP Restrictions"**
3. Verifica si hay restricciones de IP que bloqueen tu servidor
4. Si es necesario, agrega la IP de tu servidor a las IPs permitidas

**Para obtener la IP pública de tu servidor:**
```bash
curl -4 ifconfig.me
# O
curl ifconfig.me
```

### Paso 5: Probar conexión después de abrir el puerto

```bash
cd /var/www/boletera

# Instalar cliente PostgreSQL si no está instalado
apt-get update -qq && apt-get install -y postgresql-client > /dev/null 2>&1

# Cargar contraseña del .env
source .env 2>/dev/null || true
DB_PASSWORD="7ianbJsQzipn2IFk"

# Probar conexión
PGPASSWORD="$DB_PASSWORD" psql -h db.hlvhuwwatnzqiviopqrj.supabase.co -p 5432 -U postgres -d postgres -c "SELECT version();"
```

### Paso 6: Si sigue fallando, usar Connection Pooling

El Connection Pooling de Supabase puede ser más confiable:

```bash
cd /var/www/boletera
nano .env
```

**Actualiza `DATABASE_URL` para usar el pooler:**

```env
# Para la aplicación, usa el pooler (puerto 6543)
DATABASE_URL=postgresql://postgres.hlvhuwwatnzqiviopqrj:7ianbJsQzipn2IFk@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require

# Para migrations, intenta la conexión directa
DIRECT_URL=postgresql://postgres:7ianbJsQzipn2IFk@db.hlvhuwwatnzqiviopqrj.supabase.co:5432/postgres?sslmode=require
```

**⚠️ IMPORTANTE**: 
- Para el pooler, el usuario es `postgres.hlvhuwwatnzqiviopqrj` (con el project ref)
- El puerto del pooler es `6543` (no 5432)
- El host del pooler es `aws-0-us-east-1.pooler.supabase.com`

### Paso 7: Abrir también el puerto 6543 si usas pooler

```bash
# Permitir conexiones salientes al puerto 6543 (pooler)
ufw allow out 6543/tcp

# O con iptables:
iptables -A OUTPUT -p tcp --dport 6543 -j ACCEPT
```

### Paso 8: Probar con Prisma

```bash
cd /var/www/boletera

# Generar cliente Prisma
./node_modules/.bin/prisma generate

# Probar conexión
./node_modules/.bin/prisma db pull
```

## 🧪 Script de Verificación Completo

Ejecuta el script que creé para verificar todo:

```bash
cd /var/www/boletera
bash scripts/verificar-firewall-y-conexion.sh
```

## 📝 Comandos Completos en una Sola Ejecución

```bash
# 1. Abrir puertos en el firewall
ufw allow out 5432/tcp
ufw allow out 6543/tcp

# 2. Deshabilitar IPv6 (opcional, si IPv6 causa problemas)
sysctl -w net.ipv6.conf.all.disable_ipv6=1

# 3. Probar conexión
cd /var/www/boletera
apt-get update -qq && apt-get install -y postgresql-client > /dev/null 2>&1
PGPASSWORD="7ianbJsQzipn2IFk" psql -h db.hlvhuwwatnzqiviopqrj.supabase.co -p 5432 -U postgres -d postgres -c "SELECT version();"

# 4. Si funciona, sincronizar Prisma
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push

# 5. Hacer build
rm -rf .next
npm run build

# 6. Reiniciar PM2
pm2 delete boletera
pm2 start npm --name boletera -- start --cwd /var/www/boletera
pm2 logs boletera --lines 20
```

## 🆘 Si Nada Funciona

1. **Verifica la IP pública de tu servidor:**
   ```bash
   curl ifconfig.me
   ```

2. **En Supabase Dashboard**, verifica si hay restricciones de IP que bloqueen tu servidor

3. **Contacta al soporte de Supabase** si el proyecto está activo pero no puedes conectarte desde tu servidor

4. **Prueba desde tu máquina local** con la misma Connection String para verificar que funciona
