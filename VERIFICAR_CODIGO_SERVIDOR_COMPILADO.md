# 🔍 Verificar Código Compilado del SERVIDOR

## Problema

Los logs muestran que el error viene del código compilado del **SERVIDOR**:
```
at u.createCheckoutLink (/var/www/boletera/.next/server/app/api/payments/clip/create-link/route.js:1:1553)
```

Esto significa que el endpoint `/api/payments/clip/create-link` todavía existe y está siendo llamado desde algún lugar.

## Verificación en el Servidor

Ejecuta estos comandos para verificar el código compilado del SERVIDOR:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Verificar que el endpoint create-link existe (debe existir, pero NO debe ser llamado)
echo "=== Verificar endpoint create-link ==="
ls -lah .next/server/app/api/payments/clip/create-link/route.js 2>/dev/null
# Debe existir (el endpoint todavía existe para compatibilidad)

# 2. Verificar código compilado del SERVIDOR para la página de mesas
echo "=== Verificar código compilado del SERVIDOR (página mesas) ==="
grep -n "create-link\|createCheckoutLink" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | head -10
# NO debe mostrar nada (el código del servidor NO debe llamar a create-link)

# 3. Buscar TODAS las llamadas a create-link en código compilado del SERVIDOR
echo "=== Buscar TODAS las llamadas a create-link en SERVIDOR ==="
grep -r "create-link\|createCheckoutLink" .next/server/app/ 2>/dev/null | grep -v "route.js" | head -20
# NO debe mostrar nada en archivos que NO sean route.js

# 4. Verificar si hay algún código que llame a /api/payments/clip/create-link
echo "=== Buscar llamadas a /api/payments/clip/create-link ==="
grep -r "/api/payments/clip/create-link" .next/server/app/ 2>/dev/null | grep -v "route.js" | head -10
# NO debe mostrar nada

# 5. Verificar código fuente del servidor (página mesas)
echo "=== Verificar código fuente del servidor ==="
grep -n "create-link\|createCheckoutLink" app/eventos/\[id\]/mesas/page.tsx
# NO debe mostrar nada
```

## Interpretación

### ✅ Si NO encuentra create-link en código del servidor (página mesas):
- El código del servidor está correcto
- El problema es que algo está llamando al endpoint `/api/payments/clip/create-link` directamente
- Necesitas verificar qué está haciendo esa llamada

### ❌ Si encuentra create-link en código del servidor:
- El código compilado del servidor todavía tiene la versión antigua
- Necesitas hacer rebuild completo del servidor

## Verificar en el Navegador

1. Abre DevTools (F12) → **Network**
2. Intenta hacer checkout
3. Cuando aparezca el error de `create-link`:
   - Click en la request que falla (`/api/payments/clip/create-link`)
   - Ve a la pestaña **"Initiator"** (o **"Iniciador"**)
   - **Copia el nombre del archivo** que aparece ahí
   - Debería ser algo como: `/_next/static/chunks/app/eventos/[id]/mesas/page-[hash].js`

4. En DevTools → **Sources**, busca ese archivo
5. Busca `create-link` en ese archivo (Ctrl+F)
6. **Copia las líneas donde aparece `create-link`** y envíamelas

## Posibles Causas

1. **Código compilado del servidor antiguo**: El código compilado del servidor todavía tiene la versión antigua
2. **Llamada directa al endpoint**: Algún código está llamando directamente a `/api/payments/clip/create-link`
3. **Caché del servidor**: Next.js puede estar usando código compilado en caché

## Solución

Si el código compilado del servidor tiene create-link:

```bash
# Eliminar código compilado del servidor completamente
rm -rf .next/server

# Rebuild completo
npm run build

# Reiniciar
pm2 restart boletera --update-env
```
