# 🧹 Limpiar Caché del Cliente - Solución Definitiva

## Problema

Aunque el código del servidor está actualizado, el navegador todavía está usando código JavaScript antiguo que llama a `create-link`.

## Solución: Limpiar Caché del Cliente

### Opción 1: Limpiar Caché del Navegador (Recomendado)

1. **Chrome/Edge:**
   - Presiona `Ctrl+Shift+Delete` (Windows) o `Cmd+Shift+Delete` (Mac)
   - Selecciona "Caché e imágenes almacenadas"
   - Marca "Todo el tiempo"
   - Click en "Borrar datos"

2. **Firefox:**
   - Presiona `Ctrl+Shift+Delete`
   - Selecciona "Caché"
   - Marca "Todo"
   - Click en "Aceptar"

3. **Safari:**
   - `Cmd+Option+E` para limpiar caché
   - O ve a Safari > Preferencias > Avanzado > "Mostrar menú de desarrollo"
   - Luego Desarrollo > "Vaciar cachés"

### Opción 2: Modo Incógnito/Privado

Abre una ventana de incógnito/privado y prueba ahí:
- Chrome/Edge: `Ctrl+Shift+N`
- Firefox: `Ctrl+Shift+P`
- Safari: `Cmd+Shift+N`

### Opción 3: Hard Reload

1. Abre las herramientas de desarrollador (F12)
2. Click derecho en el botón de recargar
3. Selecciona "Vaciar caché y recargar de forma forzada"
   - O usa `Ctrl+Shift+R` (Windows/Linux) 
   - O `Cmd+Shift+R` (Mac)

### Opción 4: Limpiar Service Workers (Si aplica)

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" (Chrome) o "Almacenamiento" (Firefox)
3. En el menú lateral, busca "Service Workers"
4. Click en "Unregister" para cada service worker
5. Ve a "Cache Storage" y elimina todos los cachés
6. Recarga la página

## Verificación en el Servidor

Ejecuta estos comandos para verificar que el código compilado está correcto:

```bash
ssh root@216.128.139.41

cd ~/boletera

# Verificar que el código fuente está correcto
grep -A 3 "router.push" app/eventos/\[id\]/mesas/page.tsx | grep checkout
# Debe mostrar: router.push(`/checkout/${saleId}`);

# Verificar que NO tiene create-link en el código fuente
grep -i "create-link" app/eventos/\[id\]/mesas/page.tsx
# NO debe mostrar nada relacionado con create-link

# Verificar el código compilado del cliente (más importante)
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \;
# Si encuentra archivos, necesitas hacer otro rebuild

# Si encuentra archivos, hacer rebuild completo otra vez
rm -rf .next
npm run build
pm2 restart boletera --update-env
```

## Verificación en el Navegador

Después de limpiar la caché:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Marca "Disable cache" (esto evita que use caché mientras las DevTools están abiertas)
4. Recarga la página
5. Intenta hacer un checkout
6. En la pestaña "Network", busca requests a `create-link`
7. **NO debe haber ninguna request a `create-link`**
8. Debe haber una request a `/checkout/[saleId]` cuando hagas click en "Pagar"

## Si el Problema Persiste

### Verificar qué archivo está haciendo la llamada

1. En las herramientas de desarrollador (F12)
2. Ve a "Network" > busca la request a `create-link`
3. Click en la request
4. Ve a la pestaña "Initiator"
5. Esto te mostrará qué archivo JavaScript está haciendo la llamada
6. El archivo debería ser algo como: `/_next/static/chunks/app/eventos/[id]/mesas/page-[hash].js`

### Verificar el contenido del archivo

1. En "Initiator", click en el nombre del archivo
2. Esto abrirá el archivo en la pestaña "Sources"
3. Busca `create-link` en el archivo (Ctrl+F)
4. **NO debe aparecer** ninguna llamada a `create-link`
5. Debe aparecer `router.push` con `/checkout/`

## Solución Definitiva: Invalidar Caché de Next.js

Si nada funciona, puedes forzar a Next.js a generar nuevos hashes:

```bash
# En el servidor
cd ~/boletera

# Eliminar todo el código compilado
rm -rf .next
rm -rf node_modules/.cache

# Rebuild con hash diferente (cambiar versión temporalmente)
# Editar package.json y cambiar la versión (ej: de 1.0.0 a 1.0.1)
# Luego:
npm run build
pm2 restart boletera --update-env
```

Esto generará nuevos nombres de archivos JavaScript, forzando a los navegadores a descargar la versión nueva.

## Nota Final

El código fuente ya está correcto. El problema es **100% caché del navegador**. Una vez que limpies la caché correctamente, el nuevo flujo funcionará.
