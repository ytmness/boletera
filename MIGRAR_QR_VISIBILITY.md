# 🔄 Migración: Agregar Control de Visibilidad de QR

## ⚠️ **IMPORTANTE: Ejecutar en el servidor**

Esta migración agrega el campo `isQrVisible` a la tabla `Ticket` para controlar cuándo los clientes pueden ver sus QR codes.

---

## 📋 **Paso 1: Conectar al servidor**

```bash
ssh root@vultr
cd /var/www/boletera
```

---

## 📋 **Paso 2: Pull de los cambios**

```bash
git pull origin main
```

---

## 📋 **Paso 3: Aplicar migración**

```bash
npx prisma migrate dev --name add_qr_visibility
```

O si no funciona, aplicar directamente el SQL:

```bash
npx prisma db push
```

---

## 📋 **Paso 4: Verificar en Supabase**

Ve al **SQL Editor** de Supabase y ejecuta:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Ticket' 
  AND column_name = 'isQrVisible';
```

**Resultado esperado:**
```
| column_name  | data_type | column_default |
|--------------|-----------|----------------|
| isQrVisible  | boolean   | false          |
```

---

## 📋 **Paso 5: Actualizar tickets existentes (OPCIONAL)**

Si quieres que todos los tickets existentes sean visibles:

```sql
UPDATE "Ticket"
SET "isQrVisible" = true
WHERE "isQrVisible" = false;
```

O mantenerlos ocultos (comportamiento por defecto) y activarlos manualmente desde el admin.

---

## 📋 **Paso 6: Rebuild y reiniciar**

```bash
npm run build
pm2 restart boletera
```

---

## ✅ **Verificación**

Después de la migración:
- ✅ Los nuevos tickets se crean con `isQrVisible = false` (QR oculto)
- ✅ Desde el admin podrás mostrar/ocultar QR individualmente
- ✅ Los clientes solo verán el QR si `isQrVisible = true`

---

## 🎯 **¿Qué hace esto?**

**ANTES:**
- Cliente compra → Ve el QR inmediatamente

**AHORA:**
- Cliente compra → Ve la orden pero **SIN QR** 🔒
- Admin decide cuándo mostrar el QR → Cliente puede acceder 🔓

---

**¡Ejecuta estos pasos en el servidor!** 🚀
