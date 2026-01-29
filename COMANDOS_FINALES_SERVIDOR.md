# 🔧 Comandos Finales para el Servidor

## Problemas Actuales

1. **Checkout todavía tiene transacción** - El código compilado está desactualizado
2. **Error 500 en API de Clip** - Necesitamos ver los logs detallados

## Solución Completa

Ejecuta estos comandos en el servidor (copia y pega todo):

```bash
cd /var/www/boletera

# 1. Resolver conflicto de git (descartar cambios locales si no son importantes)
git reset --hard HEAD
git pull origin main

# 2. Verificar que el código fuente NO tiene transacción
echo "Verificando checkout route..."
grep -n "\$transaction" app/api/checkout/route.ts || echo "✅ No hay transacción en el código fuente"

# 3. REBUILD COMPLETO (CRÍTICO: esto regenera el código sin transacción)
echo "Limpiando build anterior..."
rm -rf .next
rm -rf node_modules/.cache

echo "Generando Prisma..."
./node_modules/.bin/prisma generate

echo "Haciendo build..."
npm run build

# 4. Verificar que el código compilado NO tiene transacción
echo "Verificando código compilado..."
grep -r "_transactionWithCallback" .next/server/app/api/checkout/route.js || echo "✅ No hay transacción en el código compilado"

# 5. Reiniciar PM2
pm2 restart boletera --update-env

# 6. Ver logs en tiempo real
echo "Esperando logs..."
sleep 2
pm2 logs boletera --lines 50
```

## Después del Rebuild

1. **Prueba el checkout de nuevo** - Debería funcionar sin error de transacción
2. **Si aparece error de Clip**, revisa los logs con:
   ```bash
   pm2 logs boletera --lines 100 | grep -A 10 "Clip API"
   ```

Los logs mejorados mostrarán:
- La URL que se está llamando
- El payload que se envía
- La respuesta completa de Clip (incluyendo el error detallado)

## Si el Error de Clip Persiste

El error 500 de Clip puede ser por:

1. **Formato incorrecto de la petición** - Los logs mostrarán el payload exacto
2. **Credenciales inválidas** - Verifica que `CLIP_AUTH_TOKEN` sea correcto
3. **Endpoint incorrecto** - Verifica la documentación de Clip
4. **Campos requeridos faltantes** - Los logs mostrarán qué se está enviando

Comparte los logs de Clip después de probar el checkout para diagnosticar el problema específico.
