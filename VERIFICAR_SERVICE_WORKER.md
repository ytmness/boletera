# 🔍 Verificar Service Worker y Código que Llama a create-link

## Problema

Si el error de `create-link` aparece incluso en modo incógnito, puede ser:

1. **Service Worker** interceptando requests
2. **Código compilado del cliente** que todavía tiene create-link
3. **Código que se ejecuta antes** del router.push

## Verificación en el Navegador

### Paso 1: Ver qué archivo está haciendo la llamada

1. Abre DevTools (F12)
2. Ve a **Network**
3. Intenta hacer checkout
4. Cuando aparezca el error de `create-link`:
   - Click en la request que falla (`/api/payments/clip/create-link`)
   - Ve a la pestaña **"Initiator"** (o **"Iniciador"**)
   - **Copia el nombre del archivo** que aparece ahí
   - Debería ser algo como: `/_next/static/chunks/app/eventos/[id]/mesas/page-[hash].js`

### Paso 2: Verificar Service Worker

1. En DevTools, ve a **Application** (o **Aplicación**)
2. En el menú izquierdo, expande **Service Workers**
3. Si hay algún Service Worker registrado:
   - Click en **"Unregister"** (o **"Desregistrar"**)
   - Recarga la página
   - Intenta hacer checkout de nuevo

### Paso 3: Ver el código que hace la llamada

1. En DevTools, ve a **Sources** (o **Fuentes**)
2. Busca el archivo que encontraste en el Paso 1
3. Busca `create-link` en ese archivo (Ctrl+F)
4. **Copia las líneas donde aparece `create-link`** y envíamelas

## Verificación en el Servidor

Ejecuta estos comandos para verificar el código compilado del cliente:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Buscar create-link en código compilado del CLIENTE (más exhaustivo)
echo "=== Buscar create-link en código compilado del CLIENTE ==="
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
# NO debe mostrar nada

# 2. Buscar fetch/create-link específicamente
echo "=== Buscar fetch/create-link ==="
find .next/static -name "*.js" -type f -exec grep -l "fetch.*create-link\|/api/payments/clip/create-link" {} \; 2>/dev/null
# NO debe mostrar nada

# 3. Verificar archivos de la página de mesas
echo "=== Archivos de la página de mesas ==="
ls -lah .next/static/chunks/app/eventos/\[id\]/mesas/*.js 2>/dev/null

# 4. Ver contenido de uno de esos archivos (si existen)
ARCHIVO=$(ls .next/static/chunks/app/eventos/\[id\]/mesas/*.js 2>/dev/null | head -1)
if [ -n "$ARCHIVO" ]; then
    echo "Archivo: $ARCHIVO"
    grep -n "create-link\|fetch.*clip" "$ARCHIVO" | head -10
fi

# 5. Buscar en TODOS los archivos JavaScript del cliente
echo "=== Buscar en TODOS los archivos JS ==="
find .next/static -name "*.js" -type f | wc -l
echo "Archivos totales encontrados"

# 6. Buscar create-link en TODOS los archivos
find .next/static -name "*.js" -type f -exec grep -H "create-link" {} \; 2>/dev/null | head -10
# NO debe mostrar nada
```

## Si Encuentra create-link en el Código Compilado

Si el comando encuentra archivos con `create-link`:

1. **Eliminar código compilado completamente:**
   ```bash
   rm -rf .next/static
   rm -rf .next/server
   ```

2. **Cambiar versión:**
   ```bash
   sed -i 's/"version": "1.0.3"/"version": "1.0.10"/' package.json
   ```

3. **Rebuild completo:**
   ```bash
   npm run build
   ```

4. **Verificar de nuevo:**
   ```bash
   find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
   # NO debe mostrar nada
   ```

5. **Reiniciar:**
   ```bash
   pm2 restart boletera --update-env
   ```

## Información Necesaria

Para diagnosticar mejor, necesito:

1. **El nombre del archivo** que hace la llamada (del Paso 1)
2. **Las líneas de código** donde aparece `create-link` (del Paso 3)
3. **El resultado del comando** `find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \;` (del servidor)
