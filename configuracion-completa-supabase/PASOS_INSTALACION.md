# 🚀 GUÍA DE INSTALACIÓN - PASO A PASO

## ✅ Tu Configuración Está Lista

He configurado tu `.env.local` con todas las credenciales correctas de tu proyecto Supabase `hlvhuwwatnzqiviopqrj`.

---

## 📋 PASOS A SEGUIR

### 1️⃣ Copiar el archivo .env.local

**Opción A - Manual:**
```bash
# Abre el archivo .env.local incluido en este paquete
# Cópialo a la raíz de tu proyecto boletera-main
```

**Opción B - Terminal:**
```bash
# Desde la raíz de tu proyecto
cp /ruta/al/archivo/.env.local .
```

**IMPORTANTE:** 
- El archivo debe llamarse `.env.local` (con el punto al inicio)
- Debe estar en la raíz del proyecto (mismo nivel que package.json)
- NO uses `.env.example`

---

### 2️⃣ Verificar que el archivo existe

```bash
# En la raíz de tu proyecto
ls -la | grep env
```

Debes ver:
```
.env.local        ← Este es el bueno (configurado)
.env.example      ← Este es solo plantilla
```

---

### 3️⃣ Probar la conexión

```bash
# En la raíz de tu proyecto
npx prisma studio
```

**Si funciona:**
- Se abrirá http://localhost:5555
- Verás "Prisma Studio" funcionando
- ✅ ¡La conexión está funcionando!

**Si NO funciona:**
- Copia el error completo
- Ejecuta el script de diagnóstico (ver paso 6)

---

### 4️⃣ Aplicar el schema a la base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar schema (crear todas las tablas)
npx prisma db push
```

**Debes ver:**
```
🚀 Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

**Tablas que se crearán:**
- User (usuarios del sistema)
- Event (eventos)
- TicketType (tipos de boleto)
- Sale (ventas)
- Ticket (boletos individuales)
- TicketScan (escaneos)
- TicketReprint (reimpresiones)
- AuditLog (auditoría)
- SystemConfig (configuración)

---

### 5️⃣ Crear usuarios de prueba

```bash
# Ejecutar seed
npx tsx prisma/seed.ts
```

**Esto crea:**
- ✅ Admin: `admin@grupoRegia.com` / `admin123`
- ✅ Vendedor: `vendedor@grupoRegia.com` / `vendedor123`
- ✅ Evento: Víctor Mendivil (ejemplo)

**Debes ver:**
```
🌱 Seeding database...
✅ Usuario admin creado
✅ Usuario vendedor creado
✅ Evento de ejemplo creado
🎉 Seed completado!
```

---

### 6️⃣ Iniciar la aplicación

```bash
npm run dev
```

Abre: **http://localhost:3000**

---

### 7️⃣ Probar el Login

1. Ve a: **http://localhost:3000/login**
2. Ingresa:
   - Email: `admin@grupoRegia.com`
   - Password: `admin123`
3. Click en "Ingresar"
4. Deberías ser redirigido a `/admin`

---

## 🔍 Script de Diagnóstico (si hay problemas)

Si algo falla en los pasos anteriores:

```bash
# Ejecutar diagnóstico
node diagnostico-conexion.js
```

Te mostrará:
- ✅ Estado de variables de entorno
- ✅ Conectividad con Supabase
- ✅ Conexión de Prisma
- ❌ Errores específicos

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Cannot find module '.env.local'"
→ El archivo no está en la raíz del proyecto

**Solución:**
```bash
# Verifica que estás en la raíz
pwd
# Debe mostrar: /ruta/a/boletera-main

# Verifica que .env.local existe
ls .env.local
```

### Error: "Environment variable not found: DATABASE_URL"
→ Next.js no está cargando el .env.local

**Solución:**
```bash
# Reinicia el servidor
# Ctrl+C para detener
npm run dev
```

### Error: "password authentication failed"
→ La contraseña cambió o es incorrecta

**Solución:**
1. Ve a Supabase Dashboard
2. Settings > Database > Reset password
3. Copia nueva password
4. Actualiza `.env.local`

### Error: "P1001: Can't reach database"
→ Supabase no es accesible

**Solución:**
1. Verifica que el proyecto no está pausado
2. Ve a Supabase Dashboard
3. Si dice "Paused" → Click "Restore"

---

## 📊 Verificar en Supabase Dashboard

Ve a: https://supabase.com/dashboard/project/hlvhuwwatnzqiviopqrj

### Table Editor
Después de `npx prisma db push`, deberías ver 9 tablas:
- ✅ User
- ✅ Event
- ✅ TicketType
- ✅ Sale
- ✅ Ticket
- ✅ TicketScan
- ✅ TicketReprint
- ✅ AuditLog
- ✅ SystemConfig

### SQL Editor
Puedes ejecutar queries manualmente:
```sql
-- Ver usuarios
SELECT * FROM "User";

-- Ver eventos
SELECT * FROM "Event";
```

---

## 🎯 Resumen de Archivos

Tu proyecto debe tener:
```
boletera-main/
├── .env.local              ← NUEVO (configurado)
├── .env.example            ← Plantilla (ignorar)
├── prisma/
│   ├── schema.prisma       ← Schema de BD
│   └── seed.ts             ← Script de usuarios
├── app/
│   ├── login/              ← Página login
│   ├── admin/              ← Panel admin
│   └── api/
│       ├── auth/           ← APIs de auth
│       └── events/         ← APIs de eventos
└── package.json
```

---

## ✅ Checklist Final

Antes de continuar, verifica:

- [ ] `.env.local` está en la raíz del proyecto
- [ ] `npx prisma studio` abre sin errores
- [ ] `npx prisma db push` ejecutó exitosamente
- [ ] `npx tsx prisma/seed.ts` creó usuarios
- [ ] `npm run dev` inicia sin errores
- [ ] http://localhost:3000 carga la homepage
- [ ] http://localhost:3000/login muestra la página de login
- [ ] Puedes iniciar sesión con admin@grupoRegia.com
- [ ] `/admin` muestra el panel de administración

---

## 🎉 ¡Todo Listo!

Una vez completados todos los pasos, tendrás:
- ✅ Base de datos configurada en Supabase
- ✅ Sistema de login funcionando
- ✅ Panel de admin operativo
- ✅ Usuarios de prueba creados
- ✅ CRUD de eventos funcionando

---

## 📞 Si Necesitas Ayuda

Si algo falla, ejecuta el diagnóstico y comparte el output:
```bash
node diagnostico-conexion.js > diagnostico.txt
```

Envía el archivo `diagnostico.txt` para ayuda específica.

---

**Siguiente paso:** Una vez que todo funcione, podemos agregar:
1. Dashboard de vendedor
2. Sistema de ventas
3. Generación de PDFs
4. App de escaneo

¡Éxito! 🚀
