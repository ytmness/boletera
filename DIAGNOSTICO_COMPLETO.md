# 🔍 Diagnóstico Completo - Problema create-link

## Paso 1: Verificar en el Navegador (MUY IMPORTANTE)

1. Abre https://scenario.com.mx en el navegador
2. Abre las herramientas de desarrollador (F12)
3. Ve a la pestaña **"Network"**
4. Marca **"Disable cache"** (arriba)
5. Intenta hacer un checkout (selecciona boletos y haz click en "Pagar")
6. Cuando aparezca el error de `create-link`:
   - Click en la request que falla (la que dice `create-link`)
   - Ve a la pestaña **"Initiator"**
   - **Copia el nombre del archivo** que aparece ahí
   - Debería ser algo como: `/_next/static/chunks/app/eventos/[id]/mesas/page-[hash].js`
7. Click en el nombre del archivo para abrirlo en "Sources"
8. Busca `create-link` en ese archivo (Ctrl+F)
9. **Copia las líneas donde aparece `create-link`** y envíamelas

## Paso 2: Verificar en el Servidor

Ejecuta estos comandos en el servidor:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Verificar código fuente
echo "=== VERIFICAR CÓDIGO FUENTE ==="
grep -A 10 "handleCheckout" app/eventos/\[id\]/mesas/page.tsx | head -20
# Debe mostrar router.push, NO debe mostrar create-link

# 2. Buscar create-link en código fuente (NO debe aparecer)
echo "=== BUSCAR create-link EN CÓDIGO FUENTE ==="
grep -n "create-link" app/eventos/\[id\]/mesas/page.tsx
# NO debe mostrar nada

# 3. Verificar fecha del último commit
echo "=== ÚLTIMO COMMIT ==="
git log --oneline -3

# 4. Buscar create-link en código compilado del CLIENTE
echo "=== BUSCAR create-link EN CÓDIGO COMPILADO CLIENTE ==="
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null | head -10
# Si encuentra archivos, esos son el problema

# 5. Si encuentra archivos, ver el contenido
# (reemplaza [archivo] con uno de los archivos encontrados)
# echo "=== CONTENIDO DEL ARCHIVO ==="
# grep -A 5 -B 5 "create-link" [archivo] | head -20

# 6. Verificar fecha de modificación de archivos compilados
echo "=== FECHAS DE ARCHIVOS COMPILADOS ==="
ls -lah .next/static/chunks/app/eventos/ 2>/dev/null | head -10
ls -lah .next/server/app/eventos/\[id\]/mesas/ 2>/dev/null | head -10

# 7. Verificar que el build fue reciente
echo "=== FECHA DEL BUILD ==="
stat .next/BUILD_ID 2>/dev/null || echo "No existe BUILD_ID"
```

## Paso 3: Si Encuentra Archivos con create-link

Si el paso 2 encuentra archivos con `create-link` en `.next/static`, ejecuta:

```bash
cd ~/boletera

# Eliminar TODO el código compilado
rm -rf .next
rm -rf node_modules/.cache

# Rebuild completo
./node_modules/.bin/prisma generate
npm run build

# Verificar que NO tiene create-link ahora
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
# NO debe encontrar nada

# Reiniciar
pm2 restart boletera --update-env
```

## Paso 4: Verificar en el Navegador Después del Rebuild

1. **Cierra completamente el navegador** (no solo la pestaña)
2. Abre el navegador de nuevo
3. Abre https://scenario.com.mx
4. Abre herramientas de desarrollador (F12)
5. Ve a "Network" > Marca "Disable cache"
6. Intenta hacer checkout
7. Verifica que NO aparece request a `create-link`

## Información que Necesito

Por favor, envíame:

1. **El nombre del archivo JavaScript** que aparece en "Initiator" (del Paso 1)
2. **Las líneas de código** donde aparece `create-link` en ese archivo
3. **El resultado del comando** `find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \;` (del Paso 2)
4. **La fecha de los archivos compilados** (del Paso 2, punto 6)

Con esta información podré identificar exactamente dónde está el problema.
