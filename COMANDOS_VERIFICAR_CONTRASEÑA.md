# 🔐 Verificar Contraseña de Supabase

## Problema
La contraseña `7ianbJsQzipn2IFk` está fallando la autenticación.

## Solución: Verificar la contraseña real

### Opción 1: Ver la contraseña actual (si está visible)

1. Ve a: **https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database**
2. Busca la sección **"Database password"**
3. Si ves un campo con asteriscos (`••••••••`), haz clic en **"Show"** o **"Reveal"**
4. Copia la contraseña EXACTA

### Opción 2: Resetear la contraseña (recomendado)

1. Ve a: **https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database**
2. Busca **"Database password"**
3. Haz clic en **"Reset database password"**
4. Confirma el reseteo
5. **Copia la nueva contraseña** que aparece
6. ⚠️ **IMPORTANTE**: Esta será la nueva contraseña, actualiza tu `.env` inmediatamente

### Opción 3: Usar la Connection String completa

1. Ve a: **https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj/settings/database**
2. Busca **"Connection string"**
3. Selecciona **"Direct connection"** (no "Connection pooling")
4. Haz clic en el ícono de **copiar** 📋
5. La URL completa incluye la contraseña correcta
6. Úsala directamente en tu `.env`:

```bash
# En el servidor:
cd /var/www/boletera
nano .env

# Reemplaza las líneas DATABASE_URL y DIRECT_URL con la URL que copiaste
# (Pega la URL completa tal cual, incluye la contraseña)
```

## Comandos en el servidor

### 1. Ejecutar script de verificación

```bash
cd /var/www/boletera
bash scripts/verificar-y-corregir-env.sh
```

Este script:
- Verifica que las URLs estén completas
- Recrea el `.env` con formato correcto
- Prueba la conexión con Prisma

### 2. Si la contraseña es diferente, actualizar manualmente

```bash
cd /var/www/boletera
nano .env

# Busca las líneas:
# DATABASE_URL=postgresql://postgres:7ianbJsQzipn2IFk@...
# DIRECT_URL=postgresql://postgres:7ianbJsQzipn2IFk@...

# Reemplaza '7ianbJsQzipn2IFk' con la contraseña correcta
# Guarda: Ctrl+O, Enter, Ctrl+X
```

### 3. Probar la conexión

```bash
cd /var/www/boletera
./node_modules/.bin/prisma db pull
```

Si funciona, verás:
```
✔ Introspected X models and wrote them into prisma/schema.prisma
```

### 4. Si funciona, sincronizar schema

```bash
./node_modules/.bin/prisma db push
```

### 5. Reiniciar la aplicación

```bash
# Corregir PM2
pm2 delete boletera
npm run build  # Si no existe .next
pm2 start npm --name boletera -- start --cwd /var/www/boletera

# Verificar
pm2 status
pm2 logs boletera --lines 20
```

## ⚠️ Notas Importantes

1. **La contraseña es sensible a mayúsculas/minúsculas** - copia exactamente
2. **No debe tener espacios** al inicio o final
3. **Si tiene caracteres especiales** (@, #, %, etc.), deben estar codificados en la URL
4. **Usa siempre la Connection String de Supabase** - es la forma más confiable

## 🆘 Si nada funciona

1. Resetea la contraseña desde Supabase Dashboard
2. Copia la **Connection String completa** (no solo la contraseña)
3. Pégala directamente en tu `.env` sin modificar nada
4. Prueba la conexión inmediatamente
