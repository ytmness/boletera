# 🔧 Solucionar Error de create-link en el Servidor

## Problema

El servidor está usando código compilado antiguo que todavía llama a `/api/payments/clip/create-link` en lugar de redirigir a `/checkout/[saleId]`.

## Solución: Rebuild Completo

Ejecuta estos comandos en el servidor:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Verificar que el código fuente está actualizado
git pull origin main
git log --oneline -1  # Debe mostrar el commit con "checkout transparente"

# 2. Verificar que el código fuente tiene el cambio correcto
grep -A 5 "Redirigir a la página de checkout transparente" app/eventos/\[id\]/mesas/page.tsx
# Debe mostrar: router.push(`/checkout/${saleId}`);

# 3. LIMPIAR TODO el código compilado (CRÍTICO)
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache

# 4. Rebuild completo
./node_modules/.bin/prisma generate
npm run build

# 5. Verificar que el build fue exitoso
# Debe mostrar: ✓ Compiled successfully

# 6. Reiniciar PM2
pm2 restart boletera --update-env

# 7. Ver logs
pm2 logs boletera --lines 30
```

## Verificación Post-Deploy

### 1. Verificar código compilado

```bash
# Verificar que el código compilado tiene el cambio correcto
grep -A 3 "checkout" .next/server/app/eventos/\[id\]/mesas/page.js | head -10

# O mejor, buscar que NO tenga create-link
grep -i "create-link" .next/server/app/eventos/\[id\]/mesas/page.js
# NO debe mostrar nada (o solo comentarios)
```

### 2. Limpiar caché del navegador

En el navegador del usuario:
1. Abre las herramientas de desarrollador (F12)
2. Click derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar de forma forzada" (o "Empty Cache and Hard Reload")
4. O usa Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac)

### 3. Probar el flujo

1. Ve a https://scenario.com.mx
2. Selecciona un evento y agrega boletos
3. Completa los datos del comprador
4. Haz clic en "Pagar"
5. **NO debe** aparecer error de `create-link`
6. Debe redirigir a `/checkout/[saleId]`
7. El formulario de Clip debe cargarse

## Si el problema persiste

### Opción 1: Verificar que el código fuente está correcto

```bash
# En el servidor, verificar el código fuente
cat app/eventos/\[id\]/mesas/page.tsx | grep -A 10 "handleCheckout"
```

Debe mostrar algo como:
```typescript
const { saleId } = checkoutResult.data;

// Paso 2: Redirigir a la página de checkout transparente
router.push(`/checkout/${saleId}`);
```

**NO debe** mostrar:
```typescript
const paymentResponse = await fetch("/api/payments/clip/create-link", {
```

### Opción 2: Forzar rebuild desde cero

```bash
cd ~/boletera

# Eliminar TODO
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf .next/server

# Rebuild
npm run build

# Reiniciar
pm2 restart boletera --update-env
```

### Opción 3: Verificar que no hay código en caché de Next.js

```bash
# Verificar variables de entorno de Next.js
pm2 env boletera | grep NEXT

# Si hay problemas, reiniciar con variables explícitas
pm2 delete boletera
cd ~/boletera
npm run build
pm2 start npm --name "boletera" -- start
pm2 save
```

## Debugging

Si todavía ves el error, verifica en el navegador:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Filtra por "create-link"
4. Haz clic en la request que falla
5. Ve a la pestaña "Initiator" para ver qué archivo está haciendo la llamada
6. Verifica que el archivo JavaScript tenga el código nuevo

El archivo debería estar en algo como:
- `/_next/static/chunks/app/eventos/[id]/mesas/page-[hash].js`

Y NO debe contener `create-link` en el código.

## Nota Importante

El endpoint `/api/payments/clip/create-link` todavía existe en el código (para compatibilidad), pero **NO debe ser llamado** desde el frontend. El nuevo flujo redirige directamente a `/checkout/[saleId]` donde se carga el SDK de Clip.
