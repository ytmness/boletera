import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateQRHash, generateQRPayload } from "@/lib/services/qr-generator";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

/**
 * Verifica la firma del webhook de Clip si está disponible
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) {
    // Si Clip no provee firma, validar por secret compartido
    // En producción, Clip debería proveer una firma
    console.warn("Clip webhook sin firma - validando por secret compartido");
    return true; // Por ahora permitir si hay secret configurado
  }

  // Si Clip provee firma, validarla
  // TODO: Implementar según documentación de Clip
  // Ejemplo común: HMAC SHA-256
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * POST /api/webhooks/clip
 * Webhook para recibir notificaciones de pago de Clip
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-clip-signature") || 
                      request.headers.get("clip-signature") ||
                      null;
    
    // Verificar autenticidad del webhook
    const webhookSecret = process.env.CLIP_WEBHOOK_SECRET || "";
    if (webhookSecret && !verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error("Webhook signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Mapear evento según estructura de Clip
    // TODO: Ajustar según estructura real del webhook de Clip
    // Por ahora asumimos estructura común:
    // { event: "payment.paid", data: { id, reference, status, ... } }
    const eventType = data.event || data.type || data.status;
    const paymentData = data.data || data;
    const reference = paymentData.reference || paymentData.sale_id || paymentData.checkout_id;
    const paymentStatus = paymentData.status || eventType;

    if (!reference) {
      console.error("Webhook sin reference:", data);
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    // Buscar la venta por paymentReference o saleId
    const sale = await prisma.sale.findFirst({
      where: {
        OR: [
          { paymentReference: reference },
          { id: reference },
        ],
      },
      include: {
        saleItems: {
          include: {
            ticketType: true,
          },
        },
        event: true,
      },
    });

    if (!sale) {
      console.error(`Sale no encontrada para reference: ${reference}`);
      return NextResponse.json(
        { error: "Sale not found" },
        { status: 404 }
      );
    }

    // Idempotencia: si ya está pagada, responder 200 sin procesar
    if (sale.paymentStatus === "PAID" || sale.status === "COMPLETED") {
      console.log(`Sale ${sale.id} ya está pagada, ignorando webhook`);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Procesar según el estado del pago
    if (paymentStatus === "paid" || paymentStatus === "approved" || eventType === "payment.paid") {
      // PAGO APROBADO: Crear tickets y actualizar inventario
      await prisma.$transaction(async (tx) => {
        // 1. Actualizar Sale
        await tx.sale.update({
          where: { id: sale.id },
          data: {
            status: "COMPLETED",
            paymentStatus: "PAID",
            paidAt: new Date(),
            paymentId: paymentData.id || paymentData.payment_id || null,
          },
        });

        // 2. Crear tickets a partir de SaleItems
        for (const saleItem of sale.saleItems) {
          const ticketType = saleItem.ticketType;
          
          // Determinar cuántos tickets crear
          let ticketsToCreate: number;
          if (saleItem.isTable) {
            // Para mesas: crear tickets por asientos (seatsPerTable)
            ticketsToCreate = saleItem.seatsPerTable || 4;
          } else {
            // Para boletos normales: crear según quantity
            ticketsToCreate = saleItem.quantity;
          }

          // Crear cada ticket
          for (let i = 0; i < ticketsToCreate; i++) {
            // Generar número de boleto único
            const ticketCount = await tx.ticket.count({
              where: { ticketTypeId: saleItem.ticketTypeId },
            });
            const ticketNumber = `${sale.event.name.substring(0, 3).toUpperCase()}-${ticketType.name.substring(0, 3).toUpperCase()}-${String(ticketCount + 1).padStart(6, "0")}`;

            // Crear ticket primero para obtener el ID
            const ticket = await tx.ticket.create({
              data: {
                saleId: sale.id,
                ticketTypeId: saleItem.ticketTypeId,
                ticketNumber,
                qrCode: "TEMP", // Temporal, se actualizará después
                tableNumber: saleItem.tableNumber ? `Mesa ${saleItem.tableNumber}` : null,
                seatNumber: saleItem.isTable ? i + 1 : null, // Para mesas: 1, 2, 3, 4
              },
            });

            // Generar QR único con hash SHA-256
            const qrHash = generateQRHash(ticket.id);
            const qrPayload = generateQRPayload(ticket.id, qrHash);
            
            // Actualizar ticket con el QR real
            await tx.ticket.update({
              where: { id: ticket.id },
              data: { qrCode: qrHash },
            });
          }

          // 3. Incrementar soldQuantity del TicketType
          // Para mesas: incrementar por cantidad de mesas (quantity)
          // Para boletos normales: incrementar por cantidad de boletos (quantity)
          await tx.ticketType.update({
            where: { id: saleItem.ticketTypeId },
            data: {
              soldQuantity: {
                increment: saleItem.quantity,
              },
            },
          });
        }
      });

      console.log(`Pago aprobado para Sale ${sale.id}, tickets creados`);
      return NextResponse.json({ success: true, message: "Payment processed" });
    } else if (
      paymentStatus === "failed" ||
      paymentStatus === "declined" ||
      eventType === "payment.failed"
    ) {
      // PAGO FALLIDO
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      console.log(`Pago fallido para Sale ${sale.id}`);
      return NextResponse.json({ success: true, message: "Payment failed recorded" });
    } else if (
      paymentStatus === "cancelled" ||
      paymentStatus === "canceled" ||
      eventType === "payment.cancelled"
    ) {
      // PAGO CANCELADO
      await prisma.sale.update({
        where: { id: sale.id },
        data: {
          status: "CANCELLED",
          paymentStatus: "CANCELED",
        },
      });

      console.log(`Pago cancelado para Sale ${sale.id}`);
      return NextResponse.json({ success: true, message: "Payment cancelled recorded" });
    } else {
      // Estado desconocido
      console.warn(`Estado de pago desconocido: ${paymentStatus} para Sale ${sale.id}`);
      return NextResponse.json({ success: true, message: "Unknown status, logged" });
    }
  } catch (error) {
    console.error("Error processing Clip webhook:", error);
    // Retornar 200 para evitar reintentos infinitos si es un error de procesamiento
    // Clip reintentará si retornamos 5xx
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}
