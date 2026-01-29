# 🔧 Comandos Finales - Corregir Problemas

## 1. Verificar dónde está el proyecto

```bash
# El proyecto está en ~/boletera, no en /var/www/boletera
cd ~/boletera
pwd
```

## 2. Actualizar .env con la nueva URL

```bash
cd ~/boletera
nano .env
```

**Busca esta línea y cámbiala:**

```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
```

**Guardar:** `CTRL + O`, `ENTER`, `CTRL + X`

## 3. Rebuild desde el directorio correcto

```bash
cd ~/boletera
npm run build
pm2 restart boletera
```

## 4. Verificar que funciona

```bash
pm2 logs boletera --lines 30
curl -I https://scenario.com.mx
```

## 5. Verificar configuración de Nginx

```bash
cat /etc/nginx/sites-available/boletera | grep server_name
```

Debería mostrar: `scenario.com.mx www.scenario.com.mx`

---

## ⚠️ Si hay error de PostgreSQL

El error de PostgreSQL puede ser temporal. Verifica:

```bash
# Ver logs de PM2
pm2 logs boletera --err

# Verificar variables de entorno
cd ~/boletera
cat .env | grep DATABASE_URL
```

Si el error persiste, puede ser un problema de conexión temporal con Supabase.
