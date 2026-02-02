# 🔍 DIAGNÓSTICO DE PROBLEMAS CON CLIP

## ❌ PROBLEMA: Nadie puede pagar, todos los pagos son rechazados

Si **NINGÚN** usuario puede completar pagos (ni tú ni tus amigos, con diferentes tarjetas), el problema **NO es la tarjeta**, es la **configuración de tu cuenta Clip**.

---

## 🎯 CAUSA MÁS PROBABLE: Checkout Transparente NO está habilitado

### ¿Qué es Checkout Transparente?

Es una modalidad de Clip que permite procesar pagos directamente en tu sitio web sin redirigir al usuario a una página externa. **Requiere activación manual por parte de Clip**.

### ¿Cómo verificar si está habilitado?

1. **Inicia sesión en tu Dashboard de Clip:**
   - 🌐 https://dashboard.clip.mx o https://dashboard.payclip.com

2. **Ve a la sección "Desarrolladores" o "API":**
   - Busca opciones como "API Keys", "Credenciales", o "Integraciones"

3. **Verifica tu API Key:**
   - ¿Dice algo como "Checkout Transparente" o "Transparent Checkout"?
   - ¿Tiene algún estado como "Activo" o "Habilitado"?

4. **Busca restricciones:**
   - ¿Hay algún mensaje como "Verificación pendiente" o "Requiere activación"?

---

## 📋 CHECKLIST DE DIAGNÓSTICO

### ✅ 1. Verificación de Cuenta Clip

- [ ] Tu cuenta Clip está **completamente verificada** (identidad, documentos, etc.)
- [ ] Has completado el proceso de **KYC (Know Your Customer)**
- [ ] Tienes permisos de **desarrollador** habilitados
- [ ] **Checkout Transparente** está activado en tu cuenta

### ✅ 2. Verificación de API Key

Tu API Key actual: `13120871-a17e-43e4-ab3c-e54d1ca503b4`

- [ ] Esta API Key es para **producción** (no sandbox/pruebas)
- [ ] Esta API Key tiene permisos para **Checkout Transparente**
- [ ] Esta API Key **NO está restringida** por IP, dominio, o tipo de transacción

### ✅ 3. Verificación de Configuración del Comercio

En el Dashboard de Clip, verifica:

- [ ] **Tipos de tarjeta aceptados:** Crédito y Débito
- [ ] **Bancos aceptados:** Todos (o los principales)
- [ ] **Métodos de pago habilitados:** Checkout Transparente
- [ ] **Límites de transacción:** Sin restricciones excesivas

### ✅ 4. Verificación Técnica

En el servidor (`/var/www/boletera`):

```bash
# Ver variables de entorno de Clip
grep CLIP .env

# Deberías ver:
# CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4
# CLIP_AUTH_TOKEN=13120871-a17e-43e4-ab3c-e54d1ca503b4
# NEXT_PUBLIC_CLIP_API_KEY=13120871-a17e-43e4-ab3c-e54d1ca503b4
```

---

## 🚨 SÍNTOMAS COMUNES DE CHECKOUT TRANSPARENTE NO HABILITADO

### Síntoma 1: Todos los pagos se rechazan
- ✅ El SDK de Clip carga correctamente
- ✅ El token de tarjeta se genera
- ❌ Pero **todos** los cobros son rechazados
- ❌ Con diferentes tarjetas de diferentes bancos

### Síntoma 2: Mensajes de error genéricos
- "El comercio no permite el cobro con esta tarjeta"
- "Tu pago fue rechazado"
- Sin código de error específico del banco

### Síntoma 3: No se registran intentos en Dashboard
- En el Dashboard de Clip **NO aparecen** los intentos de pago
- O aparecen como "Rechazados" sin detalles

---

## 🔧 SOLUCIONES

### Solución 1: Contactar a Soporte de Clip (RECOMENDADO)

**📧 Email:** soporte@clip.mx  
**💬 Chat:** En dashboard.clip.mx  
**📞 Teléfono:** Busca en tu dashboard

**Mensaje sugerido:**

```
Hola,

Necesito habilitar Checkout Transparente en mi cuenta de Clip.

Detalles de mi cuenta:
- API Key: 13120871-a17e-43e4-ab3c-e54d1ca503b4
- Dominio: https://www.scenario.com.mx
- Problema: Todos los pagos son rechazados con diferentes tarjetas

¿Pueden verificar si mi cuenta tiene Checkout Transparente habilitado?
¿Necesito completar algún proceso de verificación adicional?

Gracias,
[Tu nombre]
```

### Solución 2: Verificar con una prueba manual

1. **Obtén los logs completos del servidor:**

```bash
# En el servidor
pm2 logs boletera --lines 100
```

2. **Busca esta línea después de intentar un pago:**

```
🔍 DETALLES DEL RECHAZO/ESTADO:
```

3. **Comparte esos detalles conmigo** para diagnóstico más preciso.

### Solución 3: Probar con API Key de prueba (si disponible)

Si Clip te proporcionó credenciales de prueba:

1. Reemplaza temporalmente en `.env`:
```bash
CLIP_API_KEY=tu_api_key_de_prueba
NEXT_PUBLIC_CLIP_API_KEY=tu_api_key_de_prueba
```

2. Rebuild y restart:
```bash
npm run build && pm2 restart boletera
```

3. Intenta un pago de prueba.

---

## 📊 CÓDIGOS DE ERROR COMUNES

Si ves alguno de estos en los logs, significa:

| Código | Significado | Solución |
|--------|-------------|----------|
| `401 Unauthorized` | API Key incorrecta o inválida | Verifica tu API Key en Dashboard |
| `403 Forbidden` | Checkout Transparente no habilitado | Contacta a Clip |
| `declined/rejected` sin código | Configuración de comercio | Contacta a Clip |
| `RE-ISS99` | Emisor rechaza (banco) | Problema del banco, no de Clip |

---

## 🧪 PRUEBA DE DIAGNÓSTICO

Voy a agregar logs detallados para diagnosticar. Después de hacer deploy:

1. **Intenta un pago**
2. **Captura los logs del servidor:**
```bash
pm2 logs boletera --lines 50
```

3. **Busca estas secciones:**
   - `📝 Preparando cargo Clip:`
   - `📥 RESPUESTA COMPLETA DE CLIP:`
   - `🔍 DETALLES DEL RECHAZO/ESTADO:`

4. **Comparte esos logs conmigo** (oculta datos sensibles como números de tarjeta)

---

## ✅ PRÓXIMOS PASOS

1. ✅ **Deploy del código con logs mejorados** (listo para hacerse)
2. 🔄 **Intentar un pago de prueba**
3. 📋 **Revisar los logs detallados**
4. 📞 **Contactar a Clip con la información específica**

---

## 🆘 NOTAS IMPORTANTES

- ❌ **NO** es problema de la tarjeta (si nadie puede pagar)
- ❌ **NO** es problema del código (el SDK carga y funciona)
- ✅ **ES** un problema de configuración de cuenta Clip
- ✅ Solo Clip puede habilitar Checkout Transparente

---

**Última actualización:** 2026-01-29
