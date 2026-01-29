# ✅ Configuración del Checkout Transparente de Clip

## 🎯 Cambios Realizados

He actualizado tu aplicación para usar el **SDK oficial de Clip** para el Checkout Transparente. Los cambios incluyen:

### 1. Tipos TypeScript Actualizados (`types/clip.d.ts`)
- ✅ Tipos correctos para `ClipSDK` según documentación oficial
- ✅ Interfaz `ClipCardElement` para el formulario de tarjeta
- ✅ Soporte para MSI (Meses Sin Intereses)
- ✅ Manejo de errores específicos de Clip

### 2. Componente del Formulario (`components/payments/ClipCheckoutForm.tsx`)
- ✅ Usa el SDK correcto: `https://sdk.clip.mx/js/clip-sdk.js`
- ✅ Inicializa con `new ClipSDK(apiKey)`
- ✅ Crea elemento Card y lo monta en el contenedor
- ✅ Obtiene el Card Token ID con `card.cardToken()`
- ✅ Soporte para MSI (Meses Sin Intereses) cuando el monto >= $300 MXN
- ✅ Manejo completo de errores según códigos de Clip

### 3. API de Pagos (`lib/payments/clip.ts`)
- ✅ Payload correcto según documentación oficial
- ✅ Monto en PESOS (no centavos) como requiere Clip
- ✅ Estructura `payment_method.token` correcta
- ✅ Soporte para `installments` (MSI)
- ✅ Soporte para `customer` (email, phone)

### 4. Endpoint Create Charge (`app/api/payments/clip/create-charge/route.ts`)
- ✅ Convierte monto correctamente (en pesos)
- ✅ Pasa `installments` si aplica
- ✅ Pasa datos del cliente si están disponibles

---

## 🚀 Cómo Aplicar los Cambios en el Servidor

### Opción 1: Script Automático (Recomendado)

```bash
# En tu computadora local (PowerShell/Git Bash)
cd "c:\Users\sergi\Desktop\boletera-main (2)\boletera-main"

# Commit y push de los cambios
git add .
git commit -m "feat: Implementar SDK oficial de Clip Checkout Transparente"
git push origin main

# Conectar al servidor
ssh root@tu-servidor

# Ejecutar el script de actualización
cd /var/www/boletera
git pull origin main
chmod +x scripts/actualizar-clip-checkout.sh
bash scripts/actualizar-clip-checkout.sh
```

### Opción 2: Manual (Paso a Paso)

```bash
# Conectar al servidor
ssh root@tu-servidor

cd /var/www/boletera

# 1. Actualizar código
git pull origin main

# 2. Eliminar build antiguo
rm -rf .next
rm -rf node_modules/.cache

# 3. Regenerar Prisma
./node_modules/.bin/prisma generate

# 4. Rebuild
npm run build

# 5. Reiniciar PM2
pm2 restart boletera --update-env

# 6. Ver logs
pm2 logs boletera --lines 30
```

---

## ✅ Verificación Post-Actualización

### 1. Verificar que la app esté corriendo

```bash
pm2 status boletera
pm2 logs boletera --lines 30
```

Deberías ver:
```
✅ SDK de Clip cargado exitosamente
🔧 Inicializando SDK de Clip con API Key: 13120871-a...
✅ Formulario de Clip montado exitosamente
```

### 2. Probar en el navegador

1. Abre: `https://scenario.com.mx`
2. Selecciona un evento y agrega boletos al carrito
3. Procede al checkout
4. **DEBERÍAS VER:**
   - El formulario de Clip cargándose correctamente
   - Campos para ingresar número de tarjeta, fecha de expiración, CVV
   - Si el monto es >= $300 MXN, un dropdown para seleccionar MSI
   - Un botón "Pagar $XXX.XX MXN"

### 3. Errores Esperados (y soluciones)

#### ❌ "Error al cargar el SDK de Clip"
**Solución:** Verifica tu conexión a internet en el servidor. El SDK se carga desde `https://sdk.clip.mx/js/clip-sdk.js`

#### ❌ "API Key de Clip no configurada"
**Solución:** Verifica que `NEXT_PUBLIC_CLIP_API_KEY` esté en el `.env`:
```bash
grep "NEXT_PUBLIC_CLIP_API_KEY" /var/www/boletera/.env
```

#### ❌ "Clip API error: 401 - Unauthorized"
**Solución:** Tu API Key no es válida. Verifica que sea la correcta desde el panel de Clip.

#### ❌ "Clip API error: 500 - Internal Server Error"
**Solución:** Este error ya NO debería aparecer con el nuevo código. Si aparece, verifica los logs del servidor.

---

## 📚 Documentación de Referencia

- **SDK de Clip:** https://developer.clip.mx/docs/api/checkout-transparente/sdk/inicio
- **API de Payments:** https://developer.clip.mx/docs/api/checkout-transparente/payments
- **MSI (Meses Sin Intereses):** https://developer.clip.mx/docs/api/checkout-transparente/msi

---

## 🔐 Seguridad

- ✅ **NO requiere certificación PCI-DSS** - Clip maneja los datos de la tarjeta
- ✅ El formulario se carga en un iframe seguro desde Clip
- ✅ Tu servidor nunca ve los datos de la tarjeta
- ✅ Solo recibes un token que expira en 15 minutos y es de un solo uso

---

## 🧪 Tarjetas de Prueba

Para probar en el entorno de desarrollo de Clip, usa estas tarjetas:

| Número de Tarjeta     | Fecha | CVV | Resultado          |
|-----------------------|-------|-----|-------------------|
| 4111 1111 1111 1111  | 12/28 | 123 | Aprobado          |
| 4000 0000 0000 0002  | 12/28 | 123 | Rechazado         |
| 4000 0000 0000 3220  | 12/28 | 123 | Requiere 3DS      |

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs del servidor:**
   ```bash
   pm2 logs boletera --lines 50
   ```

2. **Revisa la consola del navegador** (F12) para errores de JavaScript

3. **Contacta a Clip:**
   - Email: developers@clip.mx
   - Panel de desarrolladores: https://dashboard.developer.clip.mx

---

## ✅ Checklist Final

- [ ] Código commiteado y pusheado a GitHub
- [ ] Script ejecutado en el servidor
- [ ] `pm2 status` muestra la app como "online"
- [ ] Navegador carga el formulario de Clip correctamente
- [ ] Puedes ingresar datos de tarjeta en el formulario
- [ ] El botón "Pagar" funciona
- [ ] Los logs no muestran errores 500 de Clip API

---

¡Todo listo! 🎉
