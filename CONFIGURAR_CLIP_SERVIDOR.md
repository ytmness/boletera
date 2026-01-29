# 🔐 Configurar Credenciales de Clip en el Servidor

Esta guía te ayudará a agregar las credenciales de Clip al archivo `.env` en tu servidor de producción.

## 📋 Información del Servidor

- **IP**: 216.128.139.41
- **Usuario**: root
- **Directorio del proyecto**: `/var/www/boletera`
- **Gestor de procesos**: PM2

---

## 🔧 Pasos para Configurar Clip

### Paso 1: Conectar al Servidor

Desde tu terminal local (PowerShell, CMD o Git Bash):

```bash
ssh root@216.128.139.41
```

Ingresa la contraseña cuando te la pida.

---

### Paso 2: Ir al Directorio del Proyecto

```bash
cd /var/www/boletera
```

---

### Paso 3: Editar el Archivo .env

```bash
nano .env
```

---

### Paso 4: Agregar las Credenciales de Clip

Busca la sección de Clip al final del archivo o agrega estas líneas:

```env
# Clip Payment Gateway Configuration
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
```

**Si ya existen estas líneas**, simplemente actualiza los valores.

**Guardar el archivo**:
- Presiona `CTRL + O` (guardar)
- Presiona `ENTER` (confirmar nombre)
- Presiona `CTRL + X` (salir)

---

### Paso 5: Verificar que las Variables Están Configuradas

```bash
# Verificar que las variables están en el archivo
grep CLIP .env
```

Deberías ver:
```
CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
CLIP_WEBHOOK_SECRET=bfb49cda-a55d-40d6-9049-39987ba016f2
```

---

### Paso 6: Reiniciar la Aplicación

Para que los cambios surtan efecto, necesitas reiniciar PM2:

```bash
# Reiniciar la aplicación
pm2 restart boletera

# Verificar que está corriendo
pm2 status

# Ver logs para verificar que no hay errores
pm2 logs boletera --lines 50
```

---

### Paso 7: Verificar que Funciona

Revisa los logs para asegurarte de que no hay errores relacionados con Clip:

```bash
pm2 logs boletera --err
```

Si ves algún error relacionado con `CLIP_AUTH_TOKEN`, verifica que:
1. Las variables estén correctamente escritas en `.env`
2. No haya espacios extra antes o después del `=`
3. No haya comillas alrededor de los valores (a menos que sean necesarias)

---

## 🔄 Si Necesitas Actualizar las Credenciales Más Tarde

Sigue los mismos pasos:

```bash
# 1. Conectar al servidor
ssh root@216.128.139.41

# 2. Ir al directorio
cd /var/www/boletera

# 3. Editar .env
nano .env

# 4. Actualizar los valores de CLIP_AUTH_TOKEN y CLIP_WEBHOOK_SECRET

# 5. Guardar (CTRL+O, ENTER, CTRL+X)

# 6. Reiniciar
pm2 restart boletera
```

---

## ✅ Verificación Final

Después de configurar, puedes probar que las credenciales están funcionando:

1. **Desde el navegador**: Ve a `https://scenario.com.mx` y prueba hacer una compra
2. **Desde los logs**: Verifica que no hay errores de autenticación con Clip

```bash
# Ver logs en tiempo real
pm2 logs boletera

# Buscar errores específicos de Clip
pm2 logs boletera | grep -i clip
```

---

## 🐛 Solución de Problemas

### Error: "CLIP_AUTH_TOKEN no está configurado"

**Solución**:
```bash
cd /var/www/boletera
nano .env
# Verifica que las líneas de Clip estén presentes y correctas
pm2 restart boletera
```

### Las variables no se cargan después de reiniciar

**Solución**:
```bash
# Verificar que el archivo .env existe y tiene las variables
cat .env | grep CLIP

# Si no aparecen, edita el archivo nuevamente
nano .env

# Reinicia PM2 completamente
pm2 delete boletera
pm2 start npm --name "boletera" -- start
pm2 save
```

### Error de conexión con Clip API

**Solución**:
1. Verifica que las credenciales sean correctas
2. Verifica que el servidor tenga acceso a internet:
   ```bash
   curl https://api.payclip.com
   ```
3. Revisa los logs para más detalles:
   ```bash
   pm2 logs boletera --err
   ```

---

## 📝 Notas Importantes

- ⚠️ **NUNCA** compartas las credenciales públicamente
- ✅ El archivo `.env` está en `.gitignore` y no se sube a GitHub
- ✅ Las credenciales son sensibles, mantén el acceso al servidor seguro
- ✅ Si cambias las credenciales, también actualiza el webhook en el panel de Clip

---

## 🔗 Configurar Webhook en Clip

Después de configurar las credenciales, asegúrate de configurar el webhook en el panel de Clip:

1. Ve al panel de administración de Clip
2. Configura el webhook con la URL:
   ```
   https://scenario.com.mx/api/webhooks/clip
   ```
3. Copia el secret del webhook y actualízalo en `.env` si es diferente

---

## ✅ Checklist

- [ ] Conectado al servidor
- [ ] Editado el archivo `.env`
- [ ] Agregadas las credenciales de Clip
- [ ] Verificado que las variables están presentes
- [ ] Reiniciado PM2
- [ ] Verificado logs sin errores
- [ ] Probado el flujo de pago
- [ ] Configurado webhook en panel de Clip

---

¡Listo! Las credenciales de Clip están configuradas en el servidor. 🎉
