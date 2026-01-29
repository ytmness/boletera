# 🔐 Configurar Supabase para scenario.com.mx

Esta guía te ayudará a configurar Supabase Auth para que funcione correctamente con el dominio `scenario.com.mx`.

## 📋 Pasos de Configuración

### 1. Acceder a la Configuración de Supabase

1. Ve a tu proyecto en [https://supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Authentication** → **URL Configuration**

### 2. Configurar Site URL

En la sección **Site URL**, actualiza:

```
https://scenario.com.mx
```

### 3. Configurar Redirect URLs

En la sección **Redirect URLs**, agrega las siguientes URLs permitidas:

```
https://scenario.com.mx/**
https://scenario.com.mx/auth/callback
https://scenario.com.mx/login
https://scenario.com.mx/verificar-email
http://localhost:3000/**
http://localhost:3000/auth/callback
```

**Nota**: Incluye `localhost:3000` para desarrollo local.

### 4. Verificar Configuración de Email

1. Ve a **Settings** → **Authentication** → **Email Templates**
2. Verifica que las URLs en los templates de email usen el dominio correcto
3. Si es necesario, actualiza manualmente las URLs en los templates

### 5. Actualizar Variables de Entorno en el Servidor

Conecta al servidor y actualiza el archivo `.env`:

```bash
ssh root@216.128.139.41
cd /var/www/boletera
nano .env
```

Asegúrate de que tenga:

```env
NEXT_PUBLIC_APP_URL="https://scenario.com.mx"
NEXT_PUBLIC_SUPABASE_URL="https://hlvhuwwatnzqiviopqrj.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"
```

### 6. Rebuild y Reiniciar

```bash
cd /var/www/boletera
npm run build
pm2 restart boletera
```

### 7. Verificar que Funciona

1. Abre `https://scenario.com.mx` en tu navegador
2. Intenta registrarte o iniciar sesión
3. Verifica que los emails de verificación lleguen correctamente
4. Verifica que el callback de autenticación funcione

## 🔍 Troubleshooting

### Error: "Invalid redirect URL"

- Verifica que `https://scenario.com.mx/auth/callback` esté en la lista de Redirect URLs
- Asegúrate de que el dominio esté correctamente configurado en DNS
- Verifica que el certificado SSL esté instalado correctamente

### Los emails no llegan

- Verifica la configuración de SMTP en Supabase (Settings → Authentication → SMTP Settings)
- Revisa los logs de Supabase para ver si hay errores de envío
- Verifica que el dominio esté correctamente configurado

### El callback no funciona

- Verifica que `NEXT_PUBLIC_APP_URL` esté configurado correctamente en `.env`
- Asegúrate de que el servidor esté accesible desde internet
- Verifica los logs de PM2: `pm2 logs boletera`

## ✅ Checklist de Configuración

- [ ] Site URL configurado en Supabase: `https://scenario.com.mx`
- [ ] Redirect URLs agregadas en Supabase
- [ ] Variables de entorno actualizadas en el servidor
- [ ] Aplicación reconstruida y reiniciada
- [ ] SSL/HTTPS funcionando correctamente
- [ ] Prueba de registro/login exitosa
- [ ] Emails de verificación funcionando

---

**Importante**: Después de cambiar la configuración en Supabase, puede tomar unos minutos para que los cambios se propaguen. Si algo no funciona inmediatamente, espera 5-10 minutos y vuelve a intentar.
