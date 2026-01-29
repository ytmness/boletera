# 🔍 Verificar Código Compilado del Cliente

Ejecuta estos comandos en el servidor para verificar qué está pasando:

```bash
ssh root@216.128.139.41

cd ~/boletera

# 1. Verificar código fuente (debe estar correcto)
echo "=== CÓDIGO FUENTE ==="
grep -A 5 "router.push" app/eventos/\[id\]/mesas/page.tsx | grep checkout
# Debe mostrar: router.push(`/checkout/${saleId}`);

# 2. Buscar create-link en código fuente (NO debe aparecer)
echo "=== BUSCAR create-link EN CÓDIGO FUENTE ==="
grep -r "create-link" app/eventos/\[id\]/mesas/page.tsx
# NO debe mostrar nada

# 3. Buscar create-link en TODO el código compilado del cliente
echo "=== BUSCAR create-link EN CÓDIGO COMPILADO CLIENTE ==="
find .next/static -name "*.js" -type f -exec grep -l "create-link" {} \; | head -5
# Si encuentra archivos, esos son el problema

# 4. Si encuentra archivos, ver el contenido de uno
# (reemplaza [archivo] con el nombre del archivo encontrado)
# cat [archivo] | grep -A 3 -B 3 "create-link"

# 5. Buscar en el código compilado del servidor también
echo "=== BUSCAR create-link EN CÓDIGO COMPILADO SERVIDOR ==="
grep -r "create-link" .next/server/app/eventos/\[id\]/mesas/ 2>/dev/null | head -5

# 6. Verificar la fecha de modificación de los archivos compilados
echo "=== FECHAS DE ARCHIVOS COMPILADOS ==="
ls -lah .next/static/chunks/app/eventos/ 2>/dev/null | head -10
```

Si encuentra archivos con `create-link` en `.next/static`, necesitamos hacer un rebuild más agresivo.
