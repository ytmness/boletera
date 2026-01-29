# 🌐 Configurar Dominio scenario.com.mx

## 📝 Información del Servidor

- **IP del Servidor**: `216.128.139.41`
- **Usuario**: `root`
- **Directorio del Proyecto**: `~/boletera` (o `/root/boletera`)
- **Proceso PM2**: `boletera`
- **Configuración Nginx**: `/etc/nginx/sites-available/boletera` (o el nombre que uses)

---

## ⚠️ Problema Actual

Tu registro DNS A está apuntando a "WebsiteBuilder Site" (parking), por eso no se ve nada. Necesitas cambiarlo a la IP de tu servidor.

---

## 📋 Paso 1: Configurar DNS en GoDaddy

### 1.1 Editar el Registro A Principal

En tu panel de GoDaddy, edita el registro A que actualmente tiene "WebsiteBuilder Site":

```
Tipo: A
Nombre/Host: @
Valor/Datos: 216.128.139.41
TTL: 1 Hora (o 600 segundos si está disponible)
```

**Pasos específicos en GoDaddy:**
1. Ve a tu cuenta de GoDaddy: https://dcc.godaddy.com/
2. Busca el dominio `scenario.com.mx`
3. Haz clic en **"DNS"** o **"Manage DNS"**
4. Busca el registro tipo **A** con nombre `@`
5. Haz clic en **"Editar"** o el icono de lápiz
6. Cambia el valor de **"WebsiteBuilder Site"** a: `216.128.139.41`
7. Guarda los cambios

### 1.2 Configurar Registro A para www

Necesitas cambiar el CNAME de `www` por un registro A:

**Opción A: Cambiar CNAME a Registro A (Recomendado)**

1. **Elimina** el CNAME existente de `www` que apunta a `scenario.com.mx.`
2. **Crea** un nuevo registro tipo **A**:
   ```
   Tipo: A
   Nombre/Host: www
   Valor/Datos: 216.128.139.41
   TTL: 1 Hora
   ```

**Opción B: Mantener CNAME (Funciona pero menos eficiente)**

Si prefieres mantener el CNAME, déjalo como está:
```
Tipo: CNAME
Nombre/Host: www
Valor/Datos: scenario.com.mx.
TTL: 1 Hora
```

### 1.3 Registros que NO debes modificar

**NO elimines ni modifiques estos registros:**
- ✅ `ns @ ns33.domaincontrol.com.` - Servidor de nombres (requerido)
- ✅ `ns @ ns34.domaincontrol.com.` - Servidor de nombres (requerido)
- ✅ `cname _domainconnect _domainconnect.gd.domaincontrol.com.` - Para conexión de dominio
- ✅ `soa @` - Registro SOA (requerido)
- ✅ `txt _dmarc` - Para seguridad de email

### 1.4 Estado Final de tus Registros DNS

Después de los cambios, deberías tener:

| Tipo | Nombre | Valor | TTL | Estado |
|------|--------|-------|-----|--------|
| **A** | `@` | `216.128.139.41` | 1 Hora | ✅ Debe existir |
| **A** | `www` | `216.128.139.41` | 1 Hora | ✅ Debe existir |
| **NS** | `@` | `ns33.domaincontrol.com.` | 1 Hora | ✅ No modificar |
| **NS** | `@` | `ns34.domaincontrol.com.` | 1 Hora | ✅ No modificar |
| **CNAME** | `_domainconnect` | `_domainconnect.gd.domaincontrol.com.` | 1 Hora | ✅ No modificar |
| **SOA** | `@` | (automático) | 1 Hora | ✅ No modificar |
| **TXT** | `_dmarc` | (mantener) | 1 Hora | ✅ No modificar |

---

## ⏱️ Paso 2: Esperar Propagación DNS

Después de hacer los cambios:
- Espera **5-30 minutos** para que se propague el DNS
- Puedes verificar con estos comandos desde tu computadora:

```bash
# Verificar DNS
nslookup scenario.com.mx

# O con ping
ping scenario.com.mx

# Debe resolver a: 216.128.139.41
```

**Nota**: La propagación puede tardar hasta 24 horas en casos extremos, pero normalmente es 5-30 minutos.

---

## 🔧 Paso 3: Configuración en el Servidor

### 3.1 Conectar al Servidor

```bash
ssh root@216.128.139.41
# Contraseña: 6.QyP4EQ2fbYHU@h
```

### 3.2 Crear Configuración de Nginx para scenario.com.mx

Tienes dos opciones:

#### Opción A: Usar scenario.com.mx como Dominio Principal (Reemplaza somnus.live)

Si quieres que `scenario.com.mx` sea el único dominio activo:

```bash
# Editar configuración de Nginx
nano /etc/nginx/sites-available/somnus
```

Reemplaza el contenido con esto:

```nginx
server {
    listen 80;
    server_name scenario.com.mx www.scenario.com.mx;

    # Logs
    access_log /var/log/nginx/scenario-access.log;
    error_log /var/log/nginx/scenario-error.log;

    # Tamaño máximo de archivos subidos
    client_max_body_size 20M;

    # Proxy a Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Servir archivos estáticos de Next.js directamente
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon y otros archivos estáticos
    location /favicon.ico {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

**Guardar**: `CTRL + O`, `ENTER`, `CTRL + X`

#### Opción B: Usar Ambos Dominios (scenario.com.mx y somnus.live)

Si quieres que ambos dominios funcionen:

```bash
# Editar configuración de Nginx
nano /etc/nginx/sites-available/somnus
```

Reemplaza el contenido con esto:

```nginx
server {
    listen 80;
    server_name scenario.com.mx www.scenario.com.mx somnus.live www.somnus.live;

    # Logs
    access_log /var/log/nginx/scenario-access.log;
    error_log /var/log/nginx/scenario-error.log;

    # Tamaño máximo de archivos subidos
    client_max_body_size 20M;

    # Proxy a Next.js
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Servir archivos estáticos de Next.js directamente
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon y otros archivos estáticos
    location /favicon.ico {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

**Guardar**: `CTRL + O`, `ENTER`, `CTRL + X`

### 3.3 Verificar y Reiniciar Nginx

```bash
# Verificar que la configuración es correcta
nginx -t

# Si todo está bien, deberías ver:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Si hay errores, ver logs
tail -20 /var/log/nginx/error.log

# Reiniciar Nginx
systemctl restart nginx

# Verificar estado
systemctl status nginx
```

---

## 🔒 Paso 4: Configurar SSL/HTTPS (Opcional pero Recomendado)

### 4.1 Instalar Certbot (si no está instalado)

```bash
# Actualizar sistema
apt update

# Instalar Certbot
apt install -y certbot python3-certbot-nginx
```

### 4.2 Obtener Certificado SSL

**Si usas solo scenario.com.mx:**

```bash
certbot --nginx -d scenario.com.mx -d www.scenario.com.mx
```

**Si usas ambos dominios:**

```bash
certbot --nginx -d scenario.com.mx -d www.scenario.com.mx -d somnus.live -d www.somnus.live
```

**Durante la instalación te preguntará:**
1. **Email**: Ingresa tu email (para notificaciones de renovación)
2. **Términos**: Escribe `A` para aceptar
3. **Compartir email**: Escribe `N` (No) o `Y` (Yes), tu elección
4. **Redirección HTTP a HTTPS**: Escribe `2` para redirección automática

### 4.3 Verificar Certificado SSL

```bash
# Ver certificados instalados
certbot certificates

# Test de renovación (no renueva realmente)
certbot renew --dry-run
```

---

## 🔄 Paso 5: Actualizar Variables de Entorno

### 5.1 Actualizar .env

```bash
# Ir al directorio de la aplicación
cd ~/boletera

# Editar .env
nano .env
```

**Cambia esta línea:**

Si usas solo scenario.com.mx:
```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
```

Si usas ambos dominios, usa el principal:
```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
```

**Guardar**: `CTRL + O`, `ENTER`, `CTRL + X`

### 5.2 Rebuild y Reiniciar la Aplicación

```bash
# Rebuild de la aplicación
npm run build

# Reiniciar PM2 (el proceso se llama "boletera")
pm2 restart boletera

# Ver logs para verificar que todo está bien
pm2 logs boletera --lines 50
```

---

## ✅ Paso 6: Verificar que Todo Funciona

### 6.1 Verificar DNS

```bash
# Desde tu computadora local
nslookup scenario.com.mx
# Debe mostrar: 144.202.72.150

ping scenario.com.mx
# Debe responder desde 144.202.72.150
```

### 6.2 Verificar HTTP (antes de SSL)

Abre en tu navegador:
```
http://scenario.com.mx
```

Deberías ver tu aplicación (sin SSL todavía).

### 6.3 Verificar HTTPS (después de SSL)

Abre en tu navegador:
```
https://scenario.com.mx
```

Deberías ver tu aplicación con el candado verde 🔒

### 6.4 Verificar Redirección

Abre:
```
http://scenario.com.mx
```

Debería redirigir automáticamente a `https://scenario.com.mx`

---

## 🔍 Troubleshooting

### El dominio no resuelve

```bash
# Verificar DNS desde el servidor
dig scenario.com.mx
nslookup scenario.com.mx

# Si no resuelve, espera más tiempo (hasta 24 horas en casos extremos)
# Verifica que el registro A esté correcto en GoDaddy
```

### Error "Domain not found" en Certbot

- Verifica que el registro A esté apuntando correctamente a `216.128.139.41`
- Espera más tiempo para propagación DNS
- Verifica con: `nslookup scenario.com.mx` desde tu computadora

### Nginx no inicia

```bash
# Verificar configuración
nginx -t

# Ver logs de error
tail -f /var/log/nginx/error.log

# Verificar que no hay conflictos de puertos
sudo ss -tlnp | grep :80
```

### La aplicación no carga

```bash
# Verificar que PM2 está corriendo
pm2 status

# Ver logs
pm2 logs boletera --lines 100

# Verificar que Next.js está escuchando en puerto 3000
netstat -tlnp | grep 3000

# O con ss
ss -tlnp | grep 3000
```

### El sitio muestra "WebsiteBuilder Site" o página de parking

- Verifica que el registro A en GoDaddy apunta a `216.128.139.41` y NO a "WebsiteBuilder Site"
- Espera más tiempo para propagación DNS (puede tardar hasta 24 horas)
- Limpia la caché de tu navegador (Ctrl+Shift+Delete)
- Prueba en modo incógnito

---

## 📝 Resumen de Pasos

1. ✅ **GoDaddy**: Cambiar registro A de `@` de "WebsiteBuilder Site" a `216.128.139.41`
2. ✅ **GoDaddy**: Cambiar CNAME de `www` a registro A con `216.128.139.41`
3. ✅ **Esperar**: 5-30 minutos para propagación DNS
4. ✅ **Servidor**: Configurar Nginx con `server_name scenario.com.mx www.scenario.com.mx`
5. ✅ **Servidor**: Instalar Certbot y obtener certificado SSL
6. ✅ **Servidor**: Actualizar `.env` con `NEXT_PUBLIC_APP_URL="https://scenario.com.mx"`
7. ✅ **Servidor**: Rebuild y reiniciar aplicación con PM2
8. ✅ **Verificar**: Probar en navegador que funciona

---

## 🎯 Checklist Final

- [ ] Registro A `@` configurado apuntando a `216.128.139.41` (NO "WebsiteBuilder Site")
- [ ] Registro A `www` configurado apuntando a `216.128.139.41`
- [ ] DNS propagado (verificado con nslookup)
- [ ] Nginx configurado con `server_name scenario.com.mx www.scenario.com.mx`
- [ ] Certbot instalado
- [ ] Certificado SSL obtenido
- [ ] `.env` actualizado con `https://scenario.com.mx`
- [ ] Aplicación rebuild y reiniciada
- [ ] HTTPS funcionando correctamente
- [ ] Redirección HTTP → HTTPS funcionando
- [ ] Sitio accesible desde navegador

---

## 🚀 Comandos Rápidos

```bash
# Conectar al servidor
ssh root@216.128.139.41

# Ir al directorio del proyecto
cd ~/boletera

# Ver estado de Nginx
systemctl status nginx

# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Ver estado de PM2
pm2 status

# Ver logs de la aplicación
pm2 logs boletera --lines 50

# Reiniciar todo
systemctl restart nginx
pm2 restart boletera

# Verificar DNS
nslookup scenario.com.mx
```

---

## 📞 Notas Importantes

1. **Propagación DNS**: Puede tardar desde 5 minutos hasta 24 horas. Normalmente es 5-30 minutos.

2. **Renovación SSL**: Let's Encrypt renueva automáticamente cada 90 días. No necesitas hacer nada.

3. **Firewall**: Asegúrate de que los puertos 80 y 443 estén abiertos:
   ```bash
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw status
   ```

4. **Backup**: Antes de hacer cambios importantes, haz backup:
   ```bash
   cp /etc/nginx/sites-available/boletera /etc/nginx/sites-available/boletera.backup
   ```

5. **Múltiples Dominios**: Si quieres usar ambos `scenario.com.mx` y `somnus.live`, simplemente agrega ambos en `server_name` en Nginx.

---

¡Listo! Tu dominio `scenario.com.mx` debería estar funcionando con HTTPS. 🎉
