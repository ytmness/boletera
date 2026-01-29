# 💳 Integración de Clip Checkout Transparente

Esta guía explica cómo configurar y usar el SDK de Checkout Transparente de Clip, que permite capturar los datos de la tarjeta directamente en tu sitio sin redirigir al usuario.

## ⚠️ Requisitos Importantes

### Verificación de Identidad con Clip

**IMPORTANTE**: Para usar Checkout Transparente, necesitas:

- ✅ **Verificar tu identidad con Clip** (no requiere certificación PCI-DSS)
- ✅ **Obtener una API Key** desde el Panel de Desarrolladores de Clip
- ✅ **El SDK NO requiere certificación PCI-DSS** ya que Clip maneja el formulario de tarjeta

**Nota**: A diferencia del método de redirección, el Checkout Transparente NO requiere certificación PCI-DSS porque Clip maneja directamente el formulario de captura de tarjeta en tu sitio.

### Ventajas del Checkout Transparente

- ✅ **NO requiere certificación PCI-DSS** (Clip maneja el formulario)
- ✅ **Control total de la experiencia** (el usuario no sale de tu sitio)
- ✅ **Formulario seguro** proporcionado por Clip
- ✅ **Tokenización automática** de los datos de tarjeta

## 🔧 Configuración

### 1. Variables de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
# API Key pública para Checkout Transparente (obtener desde panel de Clip)
NEXT_PUBLIC_CLIP_API_KEY=tu_api_key_publica_clip_aqui
```

**Importante**: Esta es una clave pública diferente a `CLIP_AUTH_TOKEN`. Debes obtenerla desde el panel de Clip después de activar el modo checkout transparente.

### 2. Obtener Credenciales de Clip

1. Accede al panel de administración de Clip
2. Contacta a soporte para activar "Checkout Transparente"
3. Obtén tu API Key pública desde la sección de configuración
4. Configura la variable `NEXT_PUBLIC_CLIP_API_KEY` en tu `.env`

## 🔄 Flujo de Pago con Checkout Transparente

### Flujo Completo

1. **Usuario selecciona boletos** → Agrega items al carrito
2. **Usuario completa datos** → Nombre, email, teléfono
3. **Crear reserva** → `POST /api/checkout`
   - Crea una `Sale` con status `PENDING`
   - Crea `SaleItem`s para cada línea del carrito
   - NO crea tickets todavía
   - NO incrementa `soldQuantity`
   - Establece `expiresAt` (10 minutos)
4. **Redirigir a página de checkout** → `/checkout/[saleId]`
   - Muestra resumen de la compra
   - Carga el SDK de Clip (`https://js.clip.mx/checkout/sdk.js`)
   - Muestra el formulario de pago de Clip en la misma página
5. **Usuario ingresa datos de tarjeta** → En el formulario de Clip
6. **SDK genera token** → `onTokenCreated` callback
7. **Enviar token al backend** → `POST /api/payments/clip/create-charge`
   - El backend hace `POST https://api.payclip.com/payments` con el token
   - Autenticación: `Authorization: Bearer {API_KEY}`
   - Si el pago es aprobado inmediatamente:
     - Actualiza `Sale` a `COMPLETED` y `PAID`
     - Crea `Ticket`s a partir de `SaleItem`s
     - Incrementa `soldQuantity` de cada `TicketType`
8. **Redirigir a éxito** → `/checkout/success?saleId=[saleId]`

## 📁 Archivos Implementados

### Backend

- **`lib/payments/clip.ts`**: 
  - Método `createCharge()` agregado para procesar tokens
  - Usa endpoint `POST https://api.payclip.com/payments`
  - Autenticación con `Bearer {API_KEY}`
  - Helper `createClipCharge()` exportado

- **`app/api/payments/clip/create-charge/route.ts`**: 
  - Nuevo endpoint para procesar tokens de Clip
  - Crea el cargo en Clip usando el token
  - Procesa tickets si el pago es aprobado inmediatamente

### Frontend

- **`components/payments/ClipCheckoutForm.tsx`**: 
  - Componente React que carga e inicializa el SDK de Clip
  - Maneja la creación del token y envío al backend
  - Muestra estados de carga y errores

- **`app/checkout/[saleId]/page.tsx`**: 
  - Nueva página de checkout que muestra:
    - Resumen de la compra
    - Formulario de pago de Clip integrado
  - Maneja el flujo completo de pago transparente

- **`types/clip.d.ts`**: 
  - Tipos TypeScript para el SDK de Clip
  - Interfaces para configuración y callbacks

### Actualizaciones

- **`app/eventos/[id]/mesas/page.tsx`**: 
  - Actualizado `handleCheckout()` para redirigir a `/checkout/[saleId]` en lugar de crear link de pago

- **`.env.example`**: 
  - Agregada variable `NEXT_PUBLIC_CLIP_API_KEY`

## 🧪 Pruebas

### Prueba Manual Completa

1. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Configurar variables de entorno:**
   - Asegúrate de tener `NEXT_PUBLIC_CLIP_API_KEY` configurada
   - Verifica que `CLIP_AUTH_TOKEN` esté configurado

3. **Probar el flujo:**
   - Selecciona boletos en un evento
   - Completa los datos del comprador
   - Haz clic en "Pagar"
   - Deberías ser redirigido a `/checkout/[saleId]`
   - El formulario de Clip debería cargarse
   - Ingresa datos de tarjeta de prueba
   - Verifica que el pago se procese correctamente

### Tarjetas de Prueba

Consulta la documentación de Clip para obtener tarjetas de prueba válidas para el ambiente de desarrollo.

## 🔐 Seguridad y Cumplimiento PCI-DSS

### Responsabilidades

Con Checkout Transparente, Clip NO tokeniza en sus servidores. Toda la carga de cumplimiento PCI-DSS es tuya, ya que el frontend manipula los datos crudos de la tarjeta.

### Requisitos Técnicos

Debes cumplir con:

- ✅ **HTTPS obligatorio** en todo el sitio
- ✅ **Firewalls** configurados correctamente
- ✅ **Requisitos técnicos del PCI DSS SAQ-D**
- ✅ **No almacenar datos de tarjeta** en logs o bases de datos
- ✅ **Validación de entrada** adecuada
- ✅ **Monitoreo y logging** de accesos

### Buenas Prácticas Implementadas

- ✅ El token se envía directamente al backend (nunca se almacena en el frontend)
- ✅ No se registran datos sensibles en logs
- ✅ HTTPS obligatorio (Next.js en producción)
- ✅ Validación de tokens en el backend antes de crear cargos

## 📚 Documentación de Referencia

- **Clip SDK Transparente**: https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
- **Endpoint de pago**: `POST https://api.payclip.com/payments`
- **Autenticación**: `Authorization: Bearer {API_KEY}`
- **Verificación de identidad**: Requerida para obtener API Key

## 🔄 Migración desde Checkout Redireccionado

Si actualmente usas checkout redireccionado y quieres migrar a checkout transparente:

1. ✅ Obtén certificación PCI-DSS Nivel 1
2. ✅ Contacta a Clip para activar checkout transparente
3. ✅ Configura `NEXT_PUBLIC_CLIP_API_KEY`
4. ✅ El código ya está implementado y listo para usar
5. ✅ El flujo automáticamente usará checkout transparente

**Nota**: El endpoint `/api/payments/clip/create-link` sigue disponible si necesitas volver al modo redireccionado.

## ❓ Troubleshooting

### El SDK no carga

- Verifica que `NEXT_PUBLIC_CLIP_API_KEY` esté configurada
- Revisa la consola del navegador para errores de red
- Verifica que la URL del SDK sea accesible: `https://js.clip.mx/checkout/sdk.js`

### Error al crear token

- Verifica que la API Key sea válida
- Asegúrate de tener permisos de checkout transparente activados en Clip
- Revisa los logs del servidor para más detalles

### Error al procesar el cargo

- Verifica que `CLIP_AUTH_TOKEN` sea válido
- Revisa que el token generado sea válido
- Consulta los logs del backend para detalles del error de Clip

## 🚀 Próximos Pasos

- [ ] Obtener certificación PCI-DSS Nivel 1
- [ ] Contactar a Clip para activar checkout transparente
- [ ] Configurar `NEXT_PUBLIC_CLIP_API_KEY` en producción
- [ ] Probar el flujo completo en ambiente de staging
- [ ] Monitorear logs y métricas de pagos procesados
