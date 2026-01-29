# 🚀 Comandos para Ejecutar en el Servidor

## Problema Actual

Los logs muestran que todavía se está llamando a `/v2/checkout` (create-link), lo cual causa error 500 porque tu cuenta de Clip no tiene ese endpoint habilitado.

El código fuente está correcto, pero el código compilado del servidor tiene la versión antigua.

## Solución: Ejecutar Script de Rebuild

Ejecuta estos comandos en el servidor:

```bash
ssh root@216.128.139.41

cd ~/boletera

# Descargar el script si no está
git pull origin main

# Hacer ejecutable
chmod +x scripts/rebuild-completo-servidor.sh

# Ejecutar el script
bash scripts/rebuild-completo-servidor.sh
```

El script hará:
1. ✅ Actualizar código desde Git
2. ✅ Verificar que el código fuente está correcto
3. ✅ Eliminar TODO el código compilado
4. ✅ Cambiar versión para invalidar caché
5. ✅ Regenerar Prisma
6. ✅ Build completo
7. ✅ Verificar que NO tiene create-link
8. ✅ Reiniciar PM2

## Verificación Manual (si prefieres hacerlo paso a paso)

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Actualizar código
git pull origin main

# 2. Verificar código fuente (debe mostrar router.push)
grep -A 3 "router.push" app/eventos/\[id\]/mesas/page.tsx | grep checkout
# Debe mostrar: router.push(`/checkout/${saleId}`);

# 3. Eliminar TODO el código compilado
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache 2>/dev/null
rm -rf .next/server 2>/dev/null

# 4. Cambiar versión
sed -i 's/"version": "1.0.0"/"version": "1.0.8"/' package.json

# 5. Regenerar Prisma
./node_modules/.bin/prisma generate

# 6. Build completo
npm run build

# 7. Verificar que NO tiene create-link en código compilado
grep -n "create-link" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null
# NO debe mostrar nada

# 8. Reiniciar
pm2 restart boletera --update-env

# 9. Ver logs
pm2 logs boletera --lines 30
```

## Después del Rebuild

### En el Navegador:

1. **Cierra completamente el navegador** (no solo la pestaña)
2. Abre DevTools (F12)
3. Ve a **Application** → **Clear storage** → **Clear site data**
4. En **Network**, marca **"Disable cache"**
5. Intenta hacer checkout
6. **NO debe** aparecer error de `create-link`
7. Debe redirigir a `/checkout/[saleId]`
8. El formulario de Clip debe cargarse

### Verificar en los Logs:

```bash
pm2 logs boletera --lines 50
```

**NO debe** aparecer:
- `Clip API Request: { url: 'https://api.payclip.com/v2/checkout'`
- `Error creating Clip checkout link`

**Debe** aparecer cuando hagas checkout:
- Redirección a `/checkout/[saleId]`
- Carga del SDK de Clip

## Si Todavía Aparece el Error

Si después del rebuild todavía ves el error de `/v2/checkout`:

1. Verifica que el código fuente está actualizado:
   ```bash
   git log --oneline -3
   # Debe mostrar commits recientes con "checkout transparente" o "router.push"
   ```

2. Verifica que el código compilado NO tiene create-link:
   ```bash
   grep -n "create-link" .next/server/app/eventos/\[id\]/mesas/page.js
   # NO debe mostrar nada
   ```

3. Si encuentra create-link, elimina `.next/server` completamente y rebuild:
   ```bash
   rm -rf .next/server
   npm run build
   pm2 restart boletera --update-env
   ```

4. Limpia el caché del navegador completamente (ver arriba)

5. Prueba en modo incógnito para evitar caché del navegador

## Nota sobre el Endpoint create-link

El endpoint `/api/payments/clip/create-link` todavía existe en el código (para compatibilidad con webhooks o futuras integraciones), pero **NO debe ser llamado** desde el frontend.

El nuevo flujo es:
1. Usuario completa datos → `POST /api/checkout` (crea reserva)
2. Redirige a `/checkout/[saleId]` → **NO llama a create-link**
3. SDK de Clip carga → Formulario en la página
4. Usuario ingresa tarjeta → SDK genera token
5. Token enviado → `POST /api/payments/clip/create-charge`
6. Backend hace `POST https://api.payclip.com/payments` con el token
7. Pago procesado → Tickets creados
