# 🔍 Verificar Código Compilado del Cliente

## Comandos para Verificar en el Servidor

Ejecuta estos comandos para verificar que el código compilado del cliente está correcto:

```bash
# 1. Ver archivos dentro de [id]
ls -lah .next/static/chunks/app/eventos/\[id\]/

# 2. Ver archivos dentro de mesas (si existe)
ls -lah .next/static/chunks/app/eventos/\[id\]/mesas/ 2>/dev/null || echo "No existe carpeta mesas"

# 3. Buscar TODOS los archivos JavaScript compilados del cliente
find .next/static/chunks -name "*.js" -type f | head -20

# 4. Buscar create-link en TODOS los archivos JavaScript del cliente
echo "=== Buscar create-link en código compilado del CLIENTE ==="
find .next/static/chunks -name "*.js" -type f -exec grep -l "create-link" {} \; 2>/dev/null
# NO debe mostrar nada

# 5. Buscar router.push en código compilado del cliente
echo "=== Buscar router.push en código compilado del CLIENTE ==="
find .next/static/chunks -name "*.js" -type f -exec grep -l "checkout.*saleId\|router\.push.*checkout" {} \; 2>/dev/null | head -5
# Debe mostrar archivos

# 6. Ver el contenido de uno de los archivos que tiene router.push
echo "=== Contenido de archivo con router.push ==="
ARCHIVO=$(find .next/static/chunks -name "*.js" -type f -exec grep -l "checkout.*saleId\|router\.push.*checkout" {} \; 2>/dev/null | head -1)
if [ -n "$ARCHIVO" ]; then
    echo "Archivo: $ARCHIVO"
    grep -A 3 -B 3 "checkout.*saleId\|router\.push.*checkout" "$ARCHIVO" | head -10
else
    echo "No se encontró archivo con router.push"
fi

# 7. Verificar fechas de modificación de archivos principales
echo "=== Fechas de archivos principales ==="
ls -lah .next/static/chunks/app/eventos/\[id\]/mesas/*.js 2>/dev/null || echo "No hay archivos .js en mesas"
ls -lah .next/static/chunks/app/eventos/\[id\]/*.js 2>/dev/null || echo "No hay archivos .js en [id]"
```

## Interpretación de Resultados

### ✅ Si NO encuentra create-link:
- El código compilado del servidor está correcto
- El problema es caché del navegador
- Sigue las instrucciones en `FORZAR_ACTUALIZACION_CLIENTE.md`

### ❌ Si encuentra create-link:
- El código compilado del servidor todavía tiene la versión antigua
- Necesitas hacer rebuild completo:
  ```bash
  rm -rf .next
  sed -i 's/"version": "1.0.9"/"version": "1.0.10"/' package.json
  npm run build
  pm2 restart boletera --update-env
  ```

### ✅ Si encuentra router.push:
- El código compilado tiene la versión correcta
- El problema es caché del navegador

## Verificar Archivos Específicos

Si quieres ver el contenido de un archivo específico:

```bash
# Ver contenido de un archivo (reemplaza [archivo] con el nombre real)
cat .next/static/chunks/app/eventos/\[id\]/mesas/[archivo] | grep -A 5 -B 5 "create-link\|router.push" | head -20

# Ver tamaño y fecha de archivos
ls -lah .next/static/chunks/app/eventos/\[id\]/mesas/*.js 2>/dev/null
```
