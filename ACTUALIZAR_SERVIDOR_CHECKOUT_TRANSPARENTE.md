# 🚀 Comandos para Actualizar Servidor - Checkout Transparente

## 📋 Información del Servidor

- **IP**: 216.128.139.41
- **Usuario**: root
- **Contraseña**: 6.QyP4EQ2fbYHU@h
- **Directorio**: ~/boletera

## 🔧 Comandos Completos para el Servidor

### Opción 1: Comandos Individuales (Copia y pega uno por uno)

```bash
# 1. Conectar al servidor
ssh root@216.128.139.41

# 2. Navegar al directorio del proyecto
cd ~/boletera

# 3. Verificar cambios antes de hacer pull
git status

# 4. Hacer pull de los últimos cambios
git pull origin main

# 5. Verificar que se actualizó correctamente
git log --oneline -1

# 6. Verificar que la variable de entorno existe (debe estar en .env)
grep NEXT_PUBLIC_CLIP_API_KEY .env

# 7. Si NO existe, agregarla al .env
echo "NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4" >> .env

# 8. Limpiar build anterior
rm -rf .next

# 9. Limpiar cache de node_modules
rm -rf node_modules/.cache

# 10. Regenerar Prisma (por si hay cambios en schema)
./node_modules/.bin/prisma generate

# 11. Instalar dependencias (por si hay nuevas)
npm install

# 12. Build del proyecto
npm run build

# 13. Reiniciar PM2 con variables de entorno actualizadas
pm2 restart boletera --update-env

# 14. Ver logs para verificar que todo está bien
pm2 logs boletera --lines 50
```

### Opción 2: Script Completo (Todo en uno)

```bash
ssh root@216.128.139.41 << 'EOF'
cd ~/boletera
git pull origin main
if ! grep -q "NEXT_PUBLIC_CLIP_API_KEY" .env; then
  echo "NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4" >> .env
fi
rm -rf .next
rm -rf node_modules/.cache
./node_modules/.bin/prisma generate
npm install
npm run build
pm2 restart boletera --update-env
pm2 logs boletera --lines 50
EOF
```

### Opción 3: Comandos Rápidos (Tu versión mejorada)

```bash
ssh root@216.128.139.41

cd ~/boletera
git pull origin main

# Verificar/agregar variable de entorno
if ! grep -q "NEXT_PUBLIC_CLIP_API_KEY" .env; then
  echo "NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4" >> .env
  echo "✅ Variable NEXT_PUBLIC_CLIP_API_KEY agregada al .env"
else
  echo "✅ Variable NEXT_PUBLIC_CLIP_API_KEY ya existe"
fi

rm -rf .next
rm -rf node_modules/.cache
./node_modules/.bin/prisma generate
npm run build
pm2 restart boletera --update-env
pm2 logs boletera --lines 50
```

## ✅ Verificación Post-Deploy

Después de ejecutar los comandos, verifica:

### 1. Verificar que el código está actualizado

```bash
# Verificar que el nuevo endpoint existe
ls -la app/api/payments/clip/create-charge/route.ts

# Verificar que la página de checkout existe
ls -la app/checkout/[saleId]/page.tsx

# Verificar que el componente existe
ls -la components/payments/ClipCheckoutForm.tsx
```

### 2. Verificar variables de entorno

```bash
# Ver todas las variables de Clip
grep CLIP .env

# Deberías ver:
# CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
# CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
# NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4
```

### 3. Verificar logs de PM2

```bash
# Ver logs en tiempo real
pm2 logs boletera

# Ver últimas 100 líneas
pm2 logs boletera --lines 100

# Verificar que no hay errores
pm2 logs boletera --err --lines 50
```

### 4. Verificar que el build fue exitoso

```bash
# Verificar que .next existe y tiene contenido
ls -la .next/server/app/api/payments/clip/create-charge/

# Verificar que la página está compilada
ls -la .next/server/app/checkout/
```

## 🧪 Probar el Checkout Transparente

1. **Accede a tu sitio**: https://scenario.com.mx
2. **Selecciona un evento** y agrega boletos al carrito
3. **Completa los datos** del comprador
4. **Haz clic en "Pagar"**
5. **Deberías ser redirigido** a `/checkout/[saleId]`
6. **El formulario de Clip** debería cargarse en la página

## 🐛 Troubleshooting

### Si hay errores en el build:

```bash
# Ver errores detallados
npm run build 2>&1 | tee build-error.log

# Si hay errores de TypeScript
npx tsc --noEmit
```

### Si PM2 no inicia:

```bash
# Ver estado de PM2
pm2 status

# Ver detalles del proceso
pm2 describe boletera

# Reiniciar desde cero
pm2 delete boletera
pm2 start npm --name "boletera" -- start
pm2 save
```

### Si la variable de entorno no se carga:

```bash
# Verificar que PM2 está usando las variables correctas
pm2 env boletera | grep CLIP

# Si no aparece, reiniciar con --update-env
pm2 restart boletera --update-env

# O editar el ecosystem.config.js si existe
pm2 ecosystem
```

### Si el SDK de Clip no carga:

1. Abre las herramientas de desarrollador del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores relacionados con:
   - `ClipCheckout`
   - `js.clip.mx`
   - `NEXT_PUBLIC_CLIP_API_KEY`
4. Verifica que la variable esté disponible en el frontend:
   ```bash
   # En el servidor, verificar que está en .env
   grep NEXT_PUBLIC_CLIP_API_KEY .env
   ```

## 📝 Notas Importantes

1. **Variable de Entorno**: Asegúrate de que `NEXT_PUBLIC_CLIP_API_KEY` esté en el `.env` del servidor. Las variables que empiezan con `NEXT_PUBLIC_` son expuestas al frontend.

2. **Rebuild Necesario**: Después de cambiar variables de entorno de Next.js, siempre haz `rm -rf .next` y `npm run build` para que se incluyan en el build.

3. **PM2 Update Env**: Usa `--update-env` al reiniciar PM2 para que cargue las nuevas variables de entorno.

4. **PCI-DSS**: Recuerda que el Checkout Transparente requiere certificación PCI-DSS Nivel 1. Si no la tienes, el SDK puede no funcionar correctamente.

## 🔄 Rollback (Si algo sale mal)

Si necesitas volver a la versión anterior:

```bash
cd ~/boletera
git log --oneline -5  # Ver últimos commits
git reset --hard HEAD~1  # Volver al commit anterior
rm -rf .next
npm run build
pm2 restart boletera --update-env
```

O volver a un commit específico:

```bash
git reset --hard 98613ae  # Commit anterior al checkout transparente
rm -rf .next
npm run build
pm2 restart boletera --update-env
```
