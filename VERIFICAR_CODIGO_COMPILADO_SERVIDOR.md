# 🔍 Verificar Código Compilado del Servidor

Los logs muestran que todavía se está llamando a `create-link`. Ejecuta estos comandos en el servidor para verificar:

```bash
cd ~/boletera

# 1. Verificar código fuente (debe estar correcto)
echo "=== CÓDIGO FUENTE ==="
grep -A 10 "handleCheckout" app/eventos/\[id\]/mesas/page.tsx | head -15
# Debe mostrar router.push, NO debe mostrar create-link

# 2. Verificar código compilado del SERVIDOR
echo "=== CÓDIGO COMPILADO SERVIDOR ==="
grep -A 10 "handleCheckout" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | head -20
# Verificar si tiene create-link

# 3. Buscar create-link en código compilado del servidor
echo "=== BUSCAR create-link EN SERVIDOR ==="
grep -n "create-link" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | head -5

# 4. Ver fecha de modificación del archivo compilado
echo "=== FECHA DEL ARCHIVO COMPILADO ==="
stat .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null | grep Modify

# 5. Ver fecha del BUILD_ID
echo "=== FECHA DEL BUILD ==="
stat .next/BUILD_ID 2>/dev/null | grep Modify
```

Si el código compilado del servidor todavía tiene `create-link`, necesitas hacer un rebuild más agresivo:

```bash
cd ~/boletera

# Eliminar TODO
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache
rm -rf .next/server

# Rebuild
npm run build

# Verificar que NO tiene create-link ahora
grep -n "create-link" .next/server/app/eventos/\[id\]/mesas/page.js 2>/dev/null
# NO debe mostrar nada

# Reiniciar
pm2 restart boletera --update-env
```
