# 🚀 Comandos Rápidos para Configurar Clip en el Servidor

Copia y pega estos comandos directamente en tu servidor.

---

## 📋 Opción 1: Comandos Manuales (Recomendado)

Conecta al servidor y ejecuta estos comandos uno por uno:

```bash
# 1. Conectar al servidor
ssh root@216.128.139.41

# 2. Ir al directorio del proyecto
cd /var/www/boletera

# 3. Editar el archivo .env
nano .env
```

**En nano, agrega estas líneas al final del archivo:**

```env
# Clip Payment Gateway Configuration
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
```

**Guardar**: `CTRL + O`, luego `ENTER`, luego `CTRL + X`

**Luego ejecuta:**

```bash
# 4. Verificar que se agregaron correctamente
grep CLIP .env

# 5. Reiniciar la aplicación
pm2 restart boletera

# 6. Verificar que está corriendo
pm2 status

# 7. Ver logs (opcional)
pm2 logs boletera --lines 20
```

---

## 📋 Opción 2: Usar el Script Automático

```bash
# 1. Conectar al servidor
ssh root@216.128.139.41

# 2. Ir al directorio del proyecto
cd /var/www/boletera

# 3. Ejecutar el script
bash scripts/configurar-clip-servidor.sh
```

El script te guiará paso a paso y te preguntará si deseas reiniciar la aplicación.

---

## 📋 Opción 3: Comandos en una Línea (Avanzado)

Si prefieres hacerlo todo de una vez:

```bash
ssh root@216.128.139.41 "cd /var/www/boletera && \
echo '' >> .env && \
echo '# Clip Payment Gateway Configuration' >> .env && \
echo 'CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4' >> .env && \
echo 'CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2' >> .env && \
pm2 restart boletera && \
pm2 status"
```

---

## ✅ Verificación Rápida

Después de ejecutar los comandos, verifica que todo está bien:

```bash
# Verificar variables en .env
grep CLIP /var/www/boletera/.env

# Ver estado de PM2
pm2 status

# Ver logs recientes
pm2 logs boletera --lines 30 --nostream
```

---

## 🔄 Si las Variables Ya Existen

Si las variables de Clip ya están en el `.env` pero quieres actualizarlas:

```bash
cd /var/www/boletera

# Actualizar CLIP_AUTH_TOKEN
sed -i 's|CLIP_AUTH_TOKEN=.*|CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4|' .env

# Actualizar CLIP_WEBHOOK_SECRET
sed -i 's|CLIP_WEBHOOK_SECRET=.*|CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2|' .env

# Reiniciar
pm2 restart boletera
```

---

## 🐛 Troubleshooting

### Error: "No se puede conectar al servidor"

Verifica que tengas acceso SSH:
```bash
ping 216.128.139.41
```

### Error: "pm2: command not found"

PM2 no está instalado o no está en el PATH:
```bash
npm install -g pm2
pm2 startup
pm2 save
```

### Las variables no se aplican después de reiniciar

Verifica que el archivo `.env` esté en el directorio correcto:
```bash
cd /var/www/boletera
pwd
ls -la .env
cat .env | grep CLIP
```

---

## 📝 Notas

- ⚠️ Estos comandos agregan las credenciales al final del archivo `.env`
- ✅ Si las variables ya existen, usa la Opción 3 para actualizarlas
- ✅ Después de agregar las variables, siempre reinicia PM2
- ✅ Verifica los logs después de reiniciar para asegurarte de que no hay errores

---

¡Listo! 🎉
