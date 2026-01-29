# 🔍 Verificar Otras Fuentes del Problema

Como el código compilado del cliente NO tiene `create-link`, el problema puede estar en:

1. **Caché del navegador** (muy probable)
2. **Service Worker** activo
3. **Código compilado del servidor** que todavía tiene la versión antigua

## Verificación en el Servidor

Ejecuta estos comandos:

```bash
cd ~/boletera

# 1. Verificar código compilado del SERVIDOR (no del cliente)
echo "=== BUSCAR create-link EN CÓDIGO COMPILADO SERVIDOR ==="
grep -r "create-link" .next/server/app/eventos/\[id\]/mesas/ 2>/dev/null | head -10

# 2. Verificar si hay algún código que esté haciendo fetch a create-link
echo "=== BUSCAR fetch/create-link EN CÓDIGO COMPILADO SERVIDOR ==="
grep -r "fetch.*create-link\|/api/payments/clip/create-link" .next/server/app/eventos/\[id\]/mesas/ 2>/dev/null | head -10

# 3. Ver el código compilado del servidor completo de la función handleCheckout
echo "=== CÓDIGO COMPILADO SERVIDOR - handleCheckout ==="
grep -A 30 "handleCheckout" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | head -40

# 4. Verificar si hay algún archivo de build antiguo
echo "=== FECHA DEL BUILD ==="
ls -lah .next/BUILD_ID 2>/dev/null
stat .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | grep Modify
```

## Verificación en el Navegador (CRÍTICO)

1. Abre https://scenario.com.mx
2. Abre herramientas de desarrollador (F12)
3. Ve a la pestaña **"Application"** (Chrome) o **"Almacenamiento"** (Firefox)
4. En el menú lateral:
   - Busca **"Service Workers"** y verifica si hay alguno registrado
   - Si hay, haz click en **"Unregister"**
   - Ve a **"Cache Storage"** y elimina todos los cachés
5. Ve a la pestaña **"Network"**
6. Marca **"Disable cache"**
7. Intenta hacer checkout
8. Cuando aparezca el error:
   - Click en la request a `create-link`
   - Ve a **"Initiator"**
   - **Copia el nombre del archivo** que aparece ahí
   - Click en el archivo para ver su contenido
   - Busca `create-link` y **copia las líneas donde aparece**

## Solución Temporal: Invalidar Caché con Nueva Versión

Si nada funciona, podemos forzar a Next.js a generar nuevos hashes:

```bash
cd ~/boletera

# Cambiar temporalmente la versión en package.json para generar nuevos hashes
# (Esto hará que Next.js genere nuevos nombres de archivos)
sed -i 's/"version": "1.0.0"/"version": "1.0.1"/' package.json

# Rebuild
rm -rf .next
npm run build

# Reiniciar
pm2 restart boletera --update-env

# Revertir el cambio
sed -i 's/"version": "1.0.1"/"version": "1.0.0"/' package.json
```

Esto generará nuevos nombres de archivos JavaScript, forzando a los navegadores a descargar la versión nueva.
