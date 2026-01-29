# 🚀 EJECUTAR AHORA EN EL SERVIDOR

## ❌ Problema Actual

El build falló porque faltaban parámetros en la firma de tipo de `createClipCharge`. Esto ya está corregido en GitHub.

## ✅ Solución (Copia y pega EN ORDEN)

```bash
# 1. Ir al directorio correcto
cd /var/www/boletera

# 2. Detener PM2 (para que no esté reiniciando constantemente)
pm2 delete boletera

# 3. Actualizar código con el fix
git pull origin main

# 4. Rebuild completo
rm -rf .next node_modules/.cache
./node_modules/.bin/prisma generate
npm run build

# 5. Reiniciar PM2
pm2 start ecosystem.config.js
pm2 save

# 6. Ver logs
pm2 logs boletera --lines 30
```

---

## ✅ Qué Deberías Ver

### En el build:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (17/17)
```

### En los logs de PM2:
```
✓ Ready in 500ms
✅ SDK de Clip cargado exitosamente
✅ Formulario de Clip montado exitosamente
```

### NO deberías ver:
- ❌ `Failed to compile`
- ❌ `Type error: Object literal...`
- ❌ `Clip API error: 500`
- ❌ `Regia: command not found`
- ❌ `Authentication failed` (cuando navegas la página)

---

## 🧪 Probar en el Navegador

1. Abre: **https://scenario.com.mx**
2. Selecciona el evento "Víctor Mendivil en Concierto"
3. Agrega un boleto o mesa al carrito
4. Haz clic en "Proceder al Pago"
5. **Deberías ver:**
   - El formulario de Clip cargándose
   - Campos para ingresar datos de tarjeta
   - Botón "Pagar $XXX.XX MXN"

---

## 🆘 Si el Build Falla

```bash
# Ver el error completo
cd /var/www/boletera
npm run build 2>&1 | tee build-error.log

# Revisar el error
cat build-error.log
```

Copia el error y mándamelo para ayudarte.

---

¡Todo listo! Ejecuta los comandos arriba. 🎉
