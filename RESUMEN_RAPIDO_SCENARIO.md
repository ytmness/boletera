# ⚡ Resumen Rápido - Configurar scenario.com.mx

## 📝 Información del Servidor
- **IP**: `216.128.139.41`
- **Usuario**: `root`
- **Directorio**: `~/boletera`
- **Proceso PM2**: `boletera`

---

## 🚨 Problema Actual
El registro A apunta a "WebsiteBuilder Site" (parking) → **Por eso no se ve nada**

---

## ✅ Solución en 3 Pasos

### 1️⃣ **GoDaddy - Cambiar DNS** (5 minutos)

1. Ve a: https://dcc.godaddy.com/
2. Busca dominio `scenario.com.mx` → Click en **"DNS"**
3. **Edita** el registro A con nombre `@`:
   - Cambia valor de **"WebsiteBuilder Site"** → `216.128.139.41`
   - Guarda
4. **Edita** el CNAME `www`:
   - Elimínalo y crea un registro **A** con valor `216.128.139.41`
   - O déjalo como CNAME apuntando a `scenario.com.mx.`

### 2️⃣ **Esperar Propagación DNS** (5-30 minutos)

```bash
# Verificar desde tu computadora
nslookup scenario.com.mx
# Debe mostrar: 216.128.139.41
```

### 3️⃣ **Servidor - Configurar Nginx** (10 minutos)

```bash
# Conectar al servidor
ssh root@216.128.139.41
# Contraseña: 6.QyP4EQ2fbYHU@h

# Editar configuración de Nginx
nano /etc/nginx/sites-available/boletera
# O si prefieres otro nombre:
# nano /etc/nginx/sites-available/scenario
```

**Reemplaza todo el contenido con:**

```nginx
server {
    listen 80;
    server_name scenario.com.mx www.scenario.com.mx;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Guardar**: `CTRL + O`, `ENTER`, `CTRL + X`

```bash
# Verificar y reiniciar
nginx -t
systemctl restart nginx
```

### 4️⃣ **Actualizar Variables de Entorno** (5 minutos)

```bash
cd ~/boletera
nano .env
```

**Cambia esta línea:**
```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
```

**Guardar**: `CTRL + O`, `ENTER`, `CTRL + X`

```bash
# Rebuild y reiniciar
npm run build
pm2 restart boletera
```

### 5️⃣ **SSL (Opcional pero Recomendado)** (5 minutos)

```bash
# Instalar Certbot (si no está instalado)
apt update
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
certbot --nginx -d scenario.com.mx -d www.scenario.com.mx

# Seguir instrucciones:
# - Email: tu email
# - Términos: A (aceptar)
# - Redirección: 2 (automática)
```

---

## 🎯 Verificar que Funciona

1. **DNS**: `nslookup scenario.com.mx` → Debe mostrar `216.128.139.41`
2. **HTTP**: Abre `http://scenario.com.mx` → Debe mostrar tu app
3. **HTTPS**: Abre `https://scenario.com.mx` → Debe mostrar tu app con 🔒

---

## 🔍 Si No Funciona

### El sitio sigue mostrando "WebsiteBuilder Site"
- ✅ Verifica que el registro A en GoDaddy apunta a `216.128.139.41` (NO "WebsiteBuilder Site")
- ✅ Espera más tiempo (hasta 24 horas)
- ✅ Limpia caché del navegador (Ctrl+Shift+Delete)
- ✅ Prueba en modo incógnito

### Error en Nginx
```bash
# Ver logs
tail -20 /var/log/nginx/error.log

# Verificar configuración
nginx -t
```

### La app no carga
```bash
# Verificar PM2
pm2 status
pm2 logs boletera --lines 50

# Verificar puerto 3000
ss -tlnp | grep 3000
```

---

## 📋 Checklist Rápido

- [ ] Registro A `@` = `216.128.139.41` (NO "WebsiteBuilder Site")
- [ ] Registro A `www` = `216.128.139.41`
- [ ] DNS propagado (nslookup funciona)
- [ ] Nginx configurado con `scenario.com.mx`
- [ ] `.env` actualizado
- [ ] App rebuild y reiniciada
- [ ] Sitio funciona en navegador

---

**¿Necesitas ayuda?** Revisa el archivo completo: `CONFIGURAR_DOMINIO_SCENARIO.md`
