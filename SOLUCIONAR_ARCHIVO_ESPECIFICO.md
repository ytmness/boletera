# 🔧 Solucionar Archivo Específico page-7a96d04f764b6423.js

El archivo `page-7a96d04f764b6423.js` es un archivo JavaScript compilado antiguo que está en caché.

## Verificación en el Servidor

Ejecuta estos comandos:

```bash
cd ~/boletera

# 1. Buscar si ese archivo existe en el servidor
find .next -name "*7a96d04f764b6423*" 2>/dev/null

# 2. Verificar el contenido de ese archivo si existe
# (reemplaza [ruta] con la ruta encontrada)
# grep -A 10 -B 10 "create-link" [ruta] | head -30

# 3. Ver todos los archivos page-*.js en .next/static
find .next/static -name "page-*.js" -type f | head -10

# 4. Verificar fechas de modificación
find .next/static -name "page-*.js" -type f -exec ls -lah {} \; | head -10
```

## Solución: Invalidar Caché Completamente

El archivo con hash `7a96d04f764b6423` es de un build anterior. Necesitamos generar nuevos hashes:

```bash
cd ~/boletera

# Ejecutar el script de invalidación
chmod +x INVALIDAR_CACHE_COMPLETO.sh
./INVALIDAR_CACHE_COMPLETO.sh
```

Esto cambiará la versión y generará nuevos hashes, forzando a los navegadores a descargar archivos nuevos.

## Solución Manual Rápida

Si el script no funciona, hazlo manualmente:

```bash
cd ~/boletera

# 1. Cambiar versión
sed -i 's/"version": "1.0.0"/"version": "1.0.1"/' package.json

# 2. Eliminar código compilado
rm -rf .next
rm -rf node_modules/.cache

# 3. Rebuild
./node_modules/.bin/prisma generate
npm run build

# 4. Reiniciar
pm2 restart boletera --update-env

# 5. Verificar que se generaron nuevos hashes
find .next/static -name "page-*.js" -type f | head -5
# Debe mostrar archivos con hashes DIFERENTES a 7a96d04f764b6423
```

## En el Navegador

Después del rebuild:

1. **Cierra completamente el navegador** (no solo la pestaña)
2. Abre el navegador de nuevo
3. Abre https://scenario.com.mx
4. Abre herramientas de desarrollador (F12)
5. Ve a "Application" > "Clear storage" > Click en "Clear site data"
6. O manualmente:
   - Ve a "Application" > "Cache Storage" > Elimina todos
   - Ve a "Application" > "Service Workers" > Unregister todos
7. Recarga la página (Ctrl+Shift+R o Cmd+Shift+R)
8. Intenta hacer checkout

El nuevo build generará archivos con hashes diferentes, y el navegador descargará la versión nueva automáticamente.
