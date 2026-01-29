# 🚀 Comandos Rápidos - Migración a scenario.com.mx

## 1. Conectar al Servidor

```bash
ssh root@216.128.139.41
```

## 2. Actualizar Configuración de Nginx

```bash
nano /etc/nginx/sites-available/boletera
```

**Reemplaza el contenido con:**

```nginx
server {
    listen 80;
    server_name scenario.com.mx www.scenario.com.mx 216.128.139.41;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Guardar:** `CTRL + O`, `ENTER`, `CTRL + X`

**Verificar y recargar:**

```bash
nginx -t
systemctl reload nginx
```

## 3. Instalar SSL con Certbot

```bash
apt update
apt install -y certbot python3-certbot-nginx
certbot --nginx -d scenario.com.mx -d www.scenario.com.mx
```

**Seguir las instrucciones:**
- Ingresa tu email
- Acepta términos (Y)
- Redirección HTTPS automática (2)

## 4. Actualizar Variables de Entorno

```bash
cd /var/www/boletera
nano .env
```

**Buscar y cambiar:**

```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
```

**Guardar:** `CTRL + O`, `ENTER`, `CTRL + X`

## 5. Rebuild y Reiniciar

```bash
cd /var/www/boletera
npm run build
pm2 restart boletera
```

## 6. Verificar que Todo Funciona

```bash
# Ver estado de PM2
pm2 status

# Ver logs
pm2 logs boletera --lines 50

# Verificar certificado SSL
certbot certificates

# Verificar Nginx
systemctl status nginx
```

## 7. Verificar DNS (Opcional)

```bash
nslookup scenario.com.mx
dig scenario.com.mx
```

---

## ⚠️ IMPORTANTE: Configurar Supabase

**Debes hacer esto manualmente en el navegador:**

1. Ve a: https://supabase.com → Tu proyecto
2. **Settings** → **Authentication** → **URL Configuration**
3. **Site URL**: `https://scenario.com.mx`
4. **Redirect URLs** (agregar):
   - `https://scenario.com.mx/**`
   - `https://scenario.com.mx/auth/callback`
   - `http://localhost:3000/**`

---

## 🔍 Comandos de Troubleshooting

```bash
# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Ver logs de la aplicación
pm2 logs boletera

# Reiniciar Nginx
systemctl restart nginx

# Reiniciar aplicación
pm2 restart boletera

# Verificar puertos
netstat -tulpn | grep :3000
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Verificar certificado SSL
openssl s_client -connect scenario.com.mx:443 -servername scenario.com.mx
```

---

## ✅ Checklist Rápido

```bash
# 1. Verificar que Nginx está corriendo
systemctl status nginx

# 2. Verificar que PM2 está corriendo
pm2 status

# 3. Verificar certificado SSL
certbot certificates

# 4. Verificar que el sitio responde
curl -I https://scenario.com.mx
```

---

**¡Listo!** Después de ejecutar estos comandos, tu sitio debería estar disponible en `https://scenario.com.mx`
