# 🚀 Comandos para Actualizar Clip Checkout en el Servidor

## 📋 Copia y pega estos comandos EN ORDEN en tu servidor

```bash
# 1. Ir al directorio de la aplicación
cd /var/www/boletera

# 2. Descargar los cambios
git pull origin main

# 3. Eliminar build antiguo
rm -rf .next node_modules/.cache

# 4. Regenerar Prisma
./node_modules/.bin/prisma generate

# 5. Rebuild completo
npm run build

# 6. Reiniciar PM2
pm2 restart boletera --update-env

# 7. Ver logs (presiona Ctrl+C para salir)
pm2 logs boletera --lines 30
```

---

## ✅ Lo que deberías ver en los logs:

```
✅ SDK de Clip cargado exitosamente
🔧 Inicializando SDK de Clip con API Key: 13120871-a...
✅ Formulario de Clip montado exitosamente
✓ Ready in 500ms
```

---

## ❌ Si ves errores:

### Error: "Build failed"
```bash
# Ver el error completo
npm run build

# Si falta algún paquete
npm install
npm run build
```

### Error: "Cannot find module @prisma/client"
```bash
# Regenerar Prisma
./node_modules/.bin/prisma generate
npm run build
```

### Error: "PM2 restart failed"
```bash
# Detener y reiniciar desde cero
pm2 delete boletera
pm2 start ecosystem.config.js
pm2 save
```

---

## 🧪 Probar en el navegador:

1. Abre: **https://scenario.com.mx**
2. Selecciona un evento
3. Agrega boletos al carrito
4. Haz clic en "Proceder al pago"
5. **DEBERÍAS VER** el formulario de Clip con:
   - Campo de número de tarjeta
   - Fecha de expiración
   - CVV
   - Nombre del titular
   - (Opcional) Selector de MSI si el monto >= $300

---

## 📞 Si algo no funciona:

```bash
# Ver logs completos
pm2 logs boletera --lines 100

# Ver estado de PM2
pm2 status

# Ver .env (verifica que NEXT_PUBLIC_CLIP_API_KEY esté presente)
grep "CLIP" /var/www/boletera/.env
```

---

¡Listo! 🎉
