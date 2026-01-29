# 🔥 Forzar Actualización del Código del Cliente

## Problema

El navegador está usando código compilado antiguo (`page-7a96d04f764b6423.js`) que todavía llama a `create-link`. Esto es un problema de caché del navegador y del servidor.

## Solución: Rebuild Completo + Invalidar Caché

### Paso 1: En el Servidor

Ejecuta estos comandos para hacer un rebuild completo y cambiar el hash de los archivos:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Actualizar código
git pull origin main

# 2. Verificar código fuente (debe tener router.push)
grep -A 3 "router.push" app/eventos/\[id\]/mesas/page.tsx | grep checkout
# Debe mostrar: router.push(`/checkout/${saleId}`);

# 3. Eliminar TODO el código compilado
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache 2>/dev/null
rm -rf .next/server 2>/dev/null

# 4. Cambiar versión para forzar nuevos hashes
sed -i 's/"version": "1.0.0"/"version": "1.0.9"/' package.json

# 5. Regenerar Prisma
./node_modules/.bin/prisma generate

# 6. Build completo
npm run build

# 7. Verificar que el nuevo build NO tiene create-link
echo "=== Verificar código compilado del CLIENTE ==="
find .next/static/chunks -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
# NO debe mostrar nada

# 8. Verificar que el nuevo build tiene router.push
echo "=== Verificar que tiene router.push ==="
find .next/static/chunks -name "*.js" -type f -exec grep -l "checkout.*saleId" {} \; 2>/dev/null | head -3
# Debe mostrar archivos

# 9. Reiniciar PM2
pm2 restart boletera --update-env

# 10. Ver logs
pm2 logs boletera --lines 20
```

### Paso 2: En el Navegador (MUY IMPORTANTE)

Después del rebuild, debes limpiar completamente el caché del navegador:

#### Opción A: Limpiar Caché Manualmente (Recomendado)

1. **Cierra completamente el navegador** (cierra todas las ventanas)
2. Abre el navegador de nuevo
3. Abre DevTools (F12)
4. Ve a **Application** (o **Aplicación** en español)
5. En el menú izquierdo, expande **Storage** (o **Almacenamiento**)
6. Click en **Clear site data** (o **Borrar datos del sitio**)
7. Marca **todas las casillas**:
   - ✅ Cache storage
   - ✅ Cookies
   - ✅ Local storage
   - ✅ Session storage
   - ✅ Service Workers
   - ✅ IndexedDB
8. Click en **Clear site data**
9. Ve a la pestaña **Network** (o **Red**)
10. Marca **"Disable cache"** (o **"Deshabilitar caché"**)
11. **Cierra y vuelve a abrir el navegador**
12. Intenta hacer checkout de nuevo

#### Opción B: Modo Incógnito (Para Probar)

1. Abre una ventana de incógnito (Ctrl+Shift+N o Cmd+Shift+N)
2. Ve a https://scenario.com.mx
3. Intenta hacer checkout
4. Si funciona en incógnito, el problema es caché del navegador

#### Opción C: Hard Refresh (Puede no ser suficiente)

1. Abre DevTools (F12)
2. Click derecho en el botón de recargar
3. Selecciona **"Empty Cache and Hard Reload"** (o **"Vaciar caché y recargar de forma forzada"**)

### Paso 3: Verificar que Funciona

Después de limpiar el caché:

1. Abre DevTools (F12) → **Network**
2. Marca **"Disable cache"**
3. Intenta hacer checkout
4. En la pestaña **Network**, busca requests a `create-link`
5. **NO debe** aparecer ninguna request a `create-link`
6. Debe aparecer una request a `/api/checkout` (crear reserva)
7. Debe redirigir a `/checkout/[saleId]`
8. El formulario de Clip debe cargarse

### Paso 4: Si Todavía Aparece el Error

Si después de todo esto todavía ves `page-7a96d04f764b6423.js` llamando a `create-link`:

1. **Verifica que el servidor tiene el código correcto compilado:**
   ```bash
   # En el servidor
   find .next/static/chunks -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
   # NO debe mostrar nada
   ```

2. **Verifica que el servidor tiene nuevos archivos compilados:**
   ```bash
   # En el servidor
   ls -lah .next/static/chunks/app/eventos/ | head -10
   # Debe mostrar archivos con fechas recientes
   ```

3. **Verifica que el servidor está sirviendo los nuevos archivos:**
   ```bash
   # En el servidor
   pm2 logs boletera --lines 50 | grep "GET.*page-"
   # Debe mostrar requests a archivos con nuevos hashes
   ```

4. **Si el servidor tiene código antiguo, haz rebuild de nuevo:**
   ```bash
   rm -rf .next
   sed -i 's/"version": "1.0.9"/"version": "1.0.10"/' package.json
   npm run build
   pm2 restart boletera --update-env
   ```

5. **Si el servidor tiene código nuevo pero el navegador sigue usando el antiguo:**
   - El problema es caché del navegador o CDN
   - Limpia el caché completamente (ver Paso 2)
   - Prueba en modo incógnito
   - Espera unos minutos (si hay CDN, puede tardar en actualizar)

## Nota sobre el Hash del Archivo

El hash `7a96d04f764b6423` en el nombre del archivo (`page-7a96d04f764b6423.js`) es generado por Next.js basado en el contenido del archivo. Si el contenido cambia, el hash cambia automáticamente.

Si después del rebuild todavía ves el mismo hash, significa que:
1. El código compilado no cambió (el servidor tiene código antiguo)
2. O el navegador está usando un archivo en caché con ese hash

Por eso es crítico:
- Eliminar completamente `.next` antes del build
- Cambiar la versión en `package.json` para forzar nuevos hashes
- Limpiar completamente el caché del navegador
