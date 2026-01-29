# 🔧 Solucionar Conflicto en el Servidor

## Problema
El servidor tiene cambios locales en `package.json` que impiden hacer `git pull`. Además, el código compilado (.next) todavía tiene la versión antigua con transacción.

## Solución Rápida

Ejecuta estos comandos en el servidor:

```bash
cd /var/www/boletera

# 1. Ver qué cambios hay en package.json
git status
git diff package.json

# 2. Opción A: Si los cambios locales no son importantes, descartarlos
git reset --hard HEAD
git pull origin main

# 3. Opción B: Si necesitas los cambios locales, guardarlos primero
git stash
git pull origin main
git stash pop
# Si hay conflictos, resuélvelos manualmente:
nano package.json

# 4. Después de resolver el conflicto, FORZAR rebuild completo
rm -rf .next
rm -rf node_modules/.cache
./node_modules/.bin/prisma generate
npm run build

# 5. Reiniciar PM2
pm2 restart boletera --update-env

# 6. Verificar logs
pm2 logs boletera --lines 30
```

## Verificar que el código está actualizado

```bash
# Verificar que checkout NO tiene transacción
grep -n "\$transaction" app/api/checkout/route.ts
# No debería mostrar nada (si muestra algo, el código está desactualizado)

# Verificar que webhook tiene timeout de 20s
grep -A 2 "timeout:" app/api/webhooks/clip/route.ts
# Debería mostrar: timeout: 20000

# Verificar que el código compilado está actualizado
grep -r "transaction" .next/server/app/api/checkout/route.js | head -5
# Si muestra "transaction", necesitas hacer rebuild
```

## Comando Completo (Copia y Pega)

```bash
cd /var/www/boletera

# Resolver conflicto (descartar cambios locales si no son importantes)
git reset --hard HEAD
git pull origin main

# Rebuild completo (CRÍTICO: esto regenera el código compilado)
rm -rf .next
rm -rf node_modules/.cache
./node_modules/.bin/prisma generate
npm run build

# Reiniciar
pm2 restart boletera --update-env
pm2 logs boletera --lines 40
```
