/**
 * Script de prueba para la integración con Clip
 * 
 * Uso:
 *   tsx scripts/test-clip-integration.ts
 * 
 * Requiere:
 *   - Variables de entorno configuradas (.env)
 *   - Base de datos con eventos y ticketTypes creados
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function testClipIntegration() {
  console.log("🧪 Iniciando pruebas de integración con Clip\n");

  try {
    // 1. Buscar un evento activo con ticketTypes
    console.log("1️⃣ Buscando evento activo...");
    const event = await prisma.event.findFirst({
      where: { isActive: true },
      include: {
        ticketTypes: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!event || event.ticketTypes.length === 0) {
      throw new Error("No se encontró un evento activo con ticketTypes");
    }

    const ticketType = event.ticketTypes[0];
    console.log(`   ✓ Evento encontrado: ${event.name}`);
    console.log(`   ✓ TicketType: ${ticketType.name} ($${ticketType.price})\n`);

    // 2. Crear una reserva (checkout)
    console.log("2️⃣ Creando reserva temporal...");
    const checkoutResponse = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        items: [
          {
            section: {
              id: ticketType.id,
              name: ticketType.name,
            },
            quantity: 1,
          },
        ],
        buyerName: "Test User",
        buyerEmail: "test@example.com",
        buyerPhone: "5551234567",
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      throw new Error(`Error en checkout: ${error.error}`);
    }

    const checkoutData = await checkoutResponse.json();
    const saleId = checkoutData.data.saleId;
    console.log(`   ✓ Reserva creada: ${saleId}`);
    console.log(`   ✓ Monto: $${checkoutData.data.amount / 100} ${checkoutData.data.currency}\n`);

    // 3. Verificar que la reserva existe y está pendiente
    console.log("3️⃣ Verificando reserva en BD...");
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { saleItems: true },
    });

    if (!sale) {
      throw new Error("La venta no se creó en la BD");
    }

    console.log(`   ✓ Status: ${sale.status}`);
    console.log(`   ✓ PaymentStatus: ${sale.paymentStatus}`);
    console.log(`   ✓ Items: ${sale.saleItems.length}`);
    console.log(`   ✓ Expira: ${sale.expiresAt}\n`);

    // 4. Verificar que NO se crearon tickets
    const ticketsCount = await prisma.ticket.count({
      where: { saleId },
    });
    console.log(`   ✓ Tickets creados: ${ticketsCount} (debe ser 0)\n`);

    // 5. Crear link de pago (requiere CLIP_AUTH_TOKEN)
    if (!process.env.CLIP_AUTH_TOKEN) {
      console.log("⚠️  CLIP_AUTH_TOKEN no configurado, saltando creación de link...\n");
    } else {
      console.log("4️⃣ Creando link de pago en Clip...");
      const linkResponse = await fetch(`${BASE_URL}/api/payments/clip/create-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saleId }),
      });

      if (!linkResponse.ok) {
        const error = await linkResponse.json();
        console.log(`   ⚠️  Error: ${error.error}`);
        console.log(`   (Esto es normal si Clip no está configurado correctamente)\n`);
      } else {
        const linkData = await linkResponse.json();
        console.log(`   ✓ Link creado: ${linkData.data.paymentUrl}\n`);
      }
    }

    // 6. Simular webhook de pago aprobado
    console.log("5️⃣ Simulando webhook de pago aprobado...");
    const webhookPayload = {
      event: "payment.paid",
      data: {
        id: `test-payment-${Date.now()}`,
        reference: saleId,
        status: "paid",
        amount: sale.totalAmount || Math.round(Number(sale.total) * 100),
      },
    };

    const webhookResponse = await fetch(`${BASE_URL}/api/webhooks/clip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clip-signature": "test-signature",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const error = await webhookResponse.json();
      console.log(`   ⚠️  Error: ${error.error}\n`);
    } else {
      const webhookData = await webhookResponse.json();
      console.log(`   ✓ Webhook procesado: ${webhookData.message}\n`);
    }

    // 7. Verificar que se crearon tickets después del webhook
    console.log("6️⃣ Verificando tickets creados...");
    const ticketsAfterWebhook = await prisma.ticket.count({
      where: { saleId },
    });
    console.log(`   ✓ Tickets creados: ${ticketsAfterWebhook}`);

    const updatedSale = await prisma.sale.findUnique({
      where: { id: saleId },
    });
    console.log(`   ✓ Status final: ${updatedSale?.status}`);
    console.log(`   ✓ PaymentStatus final: ${updatedSale?.paymentStatus}\n`);

    // 8. Verificar incremento de soldQuantity
    const updatedTicketType = await prisma.ticketType.findUnique({
      where: { id: ticketType.id },
    });
    console.log(`7️⃣ Verificando inventario...`);
    console.log(`   ✓ soldQuantity antes: ${ticketType.soldQuantity}`);
    console.log(`   ✓ soldQuantity después: ${updatedTicketType?.soldQuantity}`);
    console.log(
      `   ✓ Incremento: ${(updatedTicketType?.soldQuantity || 0) - ticketType.soldQuantity}\n`
    );

    console.log("✅ Pruebas completadas exitosamente!\n");

    // Limpiar datos de prueba (opcional)
    console.log("🧹 Limpiando datos de prueba...");
    await prisma.sale.delete({
      where: { id: saleId },
    });
    console.log("   ✓ Datos de prueba eliminados\n");
  } catch (error) {
    console.error("❌ Error en las pruebas:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar pruebas
testClipIntegration();
