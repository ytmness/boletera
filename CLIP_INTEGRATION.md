# Integración de Pagos con Clip (PayClip)

Esta guía explica cómo configurar y probar la integración de pagos con Clip en la boletera.

## 📋 Requisitos Previos

1. Cuenta en Clip (https://payclip.com)
2. Credenciales de API (Token de autenticación)
3. Acceso a configuración de webhooks en el panel de Clip

## 🔧 Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Clip Payment Gateway Configuration
CLIP_AUTH_TOKEN=tu_token_de_autenticacion_clip_aqui
CLIP_WEBHOOK_SECRET=tu_secret_para_validar_webhooks_clip_aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.com  # URL pública de tu aplicación
```

### 2. Migración de Base de Datos

Ejecuta la migración de Prisma para agregar los nuevos campos y modelos:

```bash
# Generar el cliente de Prisma con los nuevos modelos
npx prisma generate

# Aplicar los cambios a la base de datos
npx prisma db push

# O crear una migración formal
npx prisma migrate dev --name add_clip_payment_fields
```

### 3. Configurar Webhook en Clip

1. Accede al panel de administración de Clip
2. Ve a la sección de Webhooks
3. Configura el webhook con la siguiente URL:
   ```
   https://tu-dominio.com/api/webhooks/clip
   ```
4. Selecciona los eventos que deseas recibir:
   - `payment.paid` (Pago aprobado)
   - `payment.failed` (Pago fallido)
   - `payment.cancelled` (Pago cancelado)
5. Copia el secret del webhook y guárdalo en `CLIP_WEBHOOK_SECRET`

## 🔄 Flujo de Pago

### Flujo Completo

1. **Usuario selecciona boletos** → Agrega items al carrito
2. **Usuario completa datos** → Nombre, email, teléfono
3. **Crear reserva** → `POST /api/checkout`
   - Crea una `Sale` con status `PENDING`
   - Crea `SaleItem`s para cada línea del carrito
   - NO crea tickets todavía
   - NO incrementa `soldQuantity`
   - Establece `expiresAt` (10 minutos)
4. **Crear link de pago** → `POST /api/payments/clip/create-link`
   - Llama a la API de Clip para crear un checkout link
   - Guarda `paymentReference` en la `Sale`
   - Retorna `paymentUrl`
5. **Redirigir a Clip** → Usuario completa el pago en Clip
6. **Webhook de Clip** → `POST /api/webhooks/clip`
   - Si pago aprobado:
     - Actualiza `Sale` a `COMPLETED` y `PAID`
     - Crea `Ticket`s a partir de `SaleItem`s
     - Incrementa `soldQuantity` de cada `TicketType`
   - Si pago fallido/cancelado:
     - Actualiza `paymentStatus` pero NO crea tickets
7. **Retorno del usuario** → `/checkout/success` o `/checkout/cancel`
   - La página de success hace polling a `/api/sales/{saleId}` hasta confirmar el pago

## 🧪 Pruebas

### Prueba Manual Completa

1. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

2. **Crear una venta de prueba:**
   ```bash
   curl -X POST http://localhost:3000/api/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "eventId": "tu-event-id",
       "items": [
         {
           "section": {
             "id": "ticket-type-id",
             "name": "General"
           },
           "quantity": 2
         }
       ],
       "buyerName": "Juan Pérez",
       "buyerEmail": "juan@example.com",
       "buyerPhone": "5551234567"
     }'
   ```

3. **Crear link de pago:**
   ```bash
   curl -X POST http://localhost:3000/api/payments/clip/create-link \
     -H "Content-Type: application/json" \
     -d '{
       "saleId": "sale-id-del-paso-anterior"
     }'
   ```

4. **Simular webhook de pago aprobado:**
   ```bash
   curl -X POST http://localhost:3000/api/webhooks/clip \
     -H "Content-Type: application/json" \
     -H "x-clip-signature: tu-signature-si-aplica" \
     -d '{
       "event": "payment.paid",
       "data": {
         "id": "payment-id-clip",
         "reference": "sale-id-del-paso-1",
         "status": "paid",
         "amount": 23200
       }
     }'
   ```

5. **Verificar estado de la venta:**
   ```bash
   curl http://localhost:3000/api/sales/sale-id-del-paso-1
   ```

### Prueba con Script Node

Ejecuta el script de prueba incluido:

```bash
tsx scripts/test-clip-integration.ts
```

## 📝 Notas Importantes

### Reservas Temporales

- Las reservas expiran después de 10 minutos
- Mientras una reserva está activa, esos boletos no están disponibles para otros usuarios
- Si el usuario no completa el pago, la reserva expira y los boletos se liberan automáticamente

### Inventario

- `soldQuantity` solo se incrementa cuando el pago está confirmado (webhook `paid`)
- Las reservas pendientes se calculan dinámicamente al verificar disponibilidad
- Para mesas VIP: `soldQuantity` representa mesas vendidas, no asientos

### Seguridad

- **NUNCA** hardcodees credenciales de Clip en el código
- Usa variables de entorno para todas las credenciales
- Valida la firma del webhook si Clip la provee
- Implementa idempotencia en el webhook para evitar procesar pagos duplicados

### Checkout Transparente (PCI)

El método implementado es **Checkout Redireccionado**, que no requiere certificación PCI porque el usuario completa el pago en los servidores de Clip.

Si necesitas implementar **Checkout Transparente** (el usuario paga sin salir de tu sitio):
- Requiere certificación PCI-DSS
- Necesitarías usar los endpoints de tokens y payments directos
- Referencia: https://docs.payclip.com (sección de Checkout Transparente)

## 🐛 Troubleshooting

### Error: "CLIP_AUTH_TOKEN no está configurado"
- Verifica que la variable `CLIP_AUTH_TOKEN` esté en tu `.env`
- Reinicia el servidor después de agregar variables de entorno

### Error: "Webhook signature verification failed"
- Verifica que `CLIP_WEBHOOK_SECRET` coincida con el configurado en Clip
- Si Clip no provee firma, el webhook permite el request pero registra una advertencia

### Los tickets no se crean después del pago
- Verifica los logs del servidor para ver si el webhook se recibió
- Verifica que el webhook esté retornando status 200
- Revisa que `paymentStatus` en la Sale sea `PAID`

### Reservas que no expiran
- Las reservas expiran automáticamente según `expiresAt`
- Puedes crear un job/cron para limpiar reservas expiradas si es necesario

## 📚 Referencias

- Documentación de Clip: https://docs.payclip.com
- API Reference: https://docs.payclip.com/api-reference
- Panel de Clip: https://payclip.com

## 🔍 Estructura de Archivos

```
app/
├── api/
│   ├── checkout/
│   │   └── route.ts              # Crea reservas temporales
│   ├── payments/
│   │   └── clip/
│   │       └── create-link/
│   │           └── route.ts       # Crea link de pago Clip
│   ├── sales/
│   │   └── [id]/
│   │       └── route.ts           # Consulta estado de venta
│   └── webhooks/
│       └── clip/
│           └── route.ts           # Procesa webhooks de Clip
├── checkout/
│   ├── success/
│   │   └── page.tsx               # Página de éxito
│   └── cancel/
│       └── page.tsx               # Página de cancelación
lib/
└── payments/
    └── clip.ts                    # Cliente de Clip
prisma/
└── schema.prisma                  # Modelos actualizados
```

## ✅ Checklist de Implementación

- [x] Schema de Prisma actualizado (SaleItem, campos de pago)
- [x] Endpoint de checkout modificado (reservas temporales)
- [x] Cliente de Clip creado
- [x] Endpoint para crear link de pago
- [x] Webhook de Clip implementado
- [x] Endpoint para consultar estado de venta
- [x] Páginas de success y cancel
- [x] Flujo frontend actualizado
- [x] Variables de entorno documentadas
- [ ] Migración de base de datos ejecutada
- [ ] Webhook configurado en panel de Clip
- [ ] Pruebas en sandbox de Clip completadas
- [ ] Pruebas en producción realizadas
