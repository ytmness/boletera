/**
 * Repara una venta que fue cobrada por Clip pero no generó tickets (error ticketNumber duplicado)
 * 
 * Uso: npx tsx scripts/fix-orphaned-sale.ts <saleId>
 * Ejemplo: npx tsx scripts/fix-orphaned-sale.ts abc123-def456-...
 * 
 * Primero busca ventas huérfanas con esta query en Supabase SQL Editor:
 * SELECT s.id, s."buyerEmail", s.total, s.status, s."paymentStatus"
 * FROM "Sale" s
 * LEFT JOIN "Ticket" t ON t."saleId" = s.id
 * WHERE s.status = 'COMPLETED' AND t.id IS NULL;
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { generateQRHash } from "../lib/services/qr-generator";

const prisma = new PrismaClient();

async function main() {
  const saleId = process.argv[2];
  if (!saleId) {
    console.error("Uso: npx tsx scripts/fix-orphaned-sale.ts <saleId>");
    process.exit(1);
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      saleItems: { include: { ticketType: true } },
      event: true,
    },
  });

  if (!sale) {
    console.error("Venta no encontrada");
    process.exit(1);
  }

  const ticketCount = await prisma.ticket.count({ where: { saleId } });
  if (ticketCount > 0) {
    console.error("La venta ya tiene tickets. Nada que hacer.");
    process.exit(1);
  }

  console.log("Reparando venta:", saleId, sale.buyerEmail);

  await prisma.$transaction(async (tx) => {
    for (const saleItem of sale.saleItems) {
      const ticketType = saleItem.ticketType;
      let ticketsToCreate =
        saleItem.isTable ? saleItem.seatsPerTable || 4 : saleItem.quantity;

      let ticketCount = await tx.ticket.count({
        where: { ticketTypeId: saleItem.ticketTypeId },
      });

      for (let i = 0; i < ticketsToCreate; i++) {
        ticketCount += 1;
        const ticketNumber = `${sale.event.name.substring(0, 3).toUpperCase()}-${ticketType.name.substring(0, 3).toUpperCase()}-${String(ticketCount).padStart(6, "0")}-${crypto.randomUUID().substring(0, 8)}`;

        const ticket = await tx.ticket.create({
          data: {
            saleId: sale.id,
            ticketTypeId: saleItem.ticketTypeId,
            ticketNumber,
            qrCode: "TEMP",
            tableNumber: saleItem.tableNumber ? `Mesa ${saleItem.tableNumber}` : null,
            seatNumber: saleItem.isTable ? i + 1 : null,
          },
        });

        const qrHash = generateQRHash(ticket.id);
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { qrCode: qrHash },
        });
      }

      await tx.ticketType.update({
        where: { id: saleItem.ticketTypeId },
        data: { soldQuantity: { increment: saleItem.quantity } },
      });
    }
  });

  console.log("✅ Tickets creados. El comprador puede verlos en Mis Boletos.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
