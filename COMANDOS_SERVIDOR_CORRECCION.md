# 🔧 Comandos para Servidor - Corrección de Error de Compilación

## ✅ Corrección Aplicada

Se corrigió el error de compilación en `app/api/payments/clip/create-charge/route.ts`:
- ✅ Agregado campo `ticketNumber` requerido
- ✅ Implementada generación correcta de QR codes
- ✅ Usada transacción para evitar problemas de concurrencia
- ✅ Lógica idéntica al webhook para consistencia

## 🚀 Comandos para el Servidor

```bash
ssh root@216.128.139.41

cd ~/boletera
git pull origin main

# Verificar que la variable de entorno existe
grep NEXT_PUBLIC_CLIP_API_KEY .env || echo "NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4" >> .env

# Limpiar y rebuild
rm -rf .next
rm -rf node_modules/.cache
./node_modules/.bin/prisma generate
npm run build

# Si el build es exitoso, reiniciar
pm2 restart boletera --update-env

# Ver logs para verificar
pm2 logs boletera --lines 50
```

## ⚠️ Sobre el Error 500 de Clip

Los logs muestran errores 500 de la API de Clip al intentar crear checkout links. Esto puede deberse a:

1. **Problema temporal de Clip**: Su API puede estar experimentando problemas
2. **Formato de request incorrecto**: Clip puede requerir un formato diferente
3. **Autenticación**: El token puede no tener permisos suficientes

### Nota Importante

El nuevo flujo de **Checkout Transparente** NO usa el endpoint `create-link`. En su lugar:
- Redirige directamente a `/checkout/[saleId]`
- El SDK de Clip se carga en el frontend
- El token se envía a `/api/payments/clip/create-charge`

Si sigues viendo errores de `create-link`, puede ser:
- Código en caché del navegador
- Alguna llamada antigua que todavía se está ejecutando
- El build anterior todavía está corriendo

## 🔍 Verificación Post-Deploy

### 1. Verificar que el build fue exitoso

```bash
# Verificar que no hay errores de TypeScript
ls -la .next/server/app/api/payments/clip/create-charge/route.js

# Verificar que la página de checkout existe
ls -la .next/server/app/checkout/
```

### 2. Verificar logs de PM2

```bash
# Ver logs en tiempo real
pm2 logs boletera

# Ver solo errores
pm2 logs boletera --err --lines 50

# Verificar que no hay errores de compilación
pm2 logs boletera | grep -i "error\|failed\|Type error"
```

### 3. Probar el flujo completo

1. Accede a https://scenario.com.mx
2. Selecciona un evento y agrega boletos
3. Completa los datos del comprador
4. Haz clic en "Pagar"
5. Deberías ser redirigido a `/checkout/[saleId]`
6. El formulario de Clip debería cargarse

## 🐛 Troubleshooting

### Si el build falla:

```bash
# Ver errores detallados
npm run build 2>&1 | tee build-error.log

# Verificar TypeScript
npx tsc --noEmit
```

### Si PM2 no inicia:

```bash
# Ver estado
pm2 status

# Ver detalles
pm2 describe boletera

# Reiniciar desde cero si es necesario
pm2 delete boletera
cd ~/boletera
npm run build
pm2 start npm --name "boletera" -- start
pm2 save
```

### Si el SDK de Clip no carga:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores relacionados con:
   - `ClipCheckout`
   - `js.clip.mx`
   - `NEXT_PUBLIC_CLIP_API_KEY`
4. Verifica que la variable esté en el `.env`:
   ```bash
   grep NEXT_PUBLIC_CLIP_API_KEY .env
   ```

## 📝 Notas

- El error 500 de Clip en los logs puede ser del método antiguo (create-link)
- El nuevo método (create-charge) usa un endpoint diferente
- Si el build es exitoso, el código debería funcionar correctamente
- El error 500 puede requerir contacto con soporte de Clip si persiste

## 🔄 Si Necesitas Rollback

```bash
cd ~/boletera
git log --oneline -3  # Ver últimos commits
git reset --hard HEAD~1  # Volver al commit anterior
rm -rf .next
npm run build
pm2 restart boletera --update-env
```
