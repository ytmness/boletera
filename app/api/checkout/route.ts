import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/supabase-auth";

// Marcar como dinámica porque usa cookies
export const dynamic = 'force-dynamic';

/**
 * Calcula la cantidad reservada pendiente para un ticketType
 * Considera solo Sales PENDING no expiradas
 */
async function getReservedPendingQuantity(ticketTypeId: string, isTable: boolean): Promise<number> {
  const now = new Date();
  
  // Obtener todas las Sales PENDING no expiradas que tienen items de este ticketType
  const pendingSales = await prisma.sale.findMany({
    where: {
      status: "PENDING",
      expiresAt: {
        gt: now, // No expiradas
      },
      saleItems: {
        some: {
          ticketTypeId,
        },
      },
    },
    include: {
      saleItems: {
        where: {
          ticketTypeId,
        },
      },
    },
  });

  // Sumar las cantidades reservadas
  let reserved = 0;
  for (const sale of pendingSales) {
    for (const item of sale.saleItems) {
      if (isTable) {
        // Para mesas: contar cantidad de mesas (quantity)
        reserved += item.quantity;
      } else {
        // Para boletos normales: contar cantidad de boletos
        reserved += item.quantity;
      }
    }
  }

  return reserved;
}

/**
 * POST /api/checkout
 * Crear una orden/venta desde el carrito (reserva temporal)
 * NO crea tickets ni incrementa soldQuantity hasta que el pago esté confirmado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, items, buyerName, buyerEmail, buyerPhone } = body;

    // Validar datos requeridos
    if (!eventId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Datos inválidos: se requiere eventId e items" },
        { status: 400 }
      );
    }

    if (!buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: "Se requiere nombre y email del comprador" },
        { status: 400 }
      );
    }

    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTypes: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // Calcular totales y validar disponibilidad considerando reservas pendientes
    let subtotal = 0;
    const saleItemsData: Array<{
      ticketTypeId: string;
      quantity: number;
      isTable: boolean;
      seatsPerTable?: number;
      tableNumber?: number;
    }> = [];

    // Usar transacción para garantizar consistencia
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.table) {
          // Es una mesa VIP
          const ticketType = event.ticketTypes.find(
            (tt) => tt.isTable === true && Number(tt.price) === item.table.price
          );

          if (!ticketType) {
            throw new Error(`Tipo de boleto no encontrado para mesa ${item.table.number}`);
          }

          // Verificar disponibilidad: maxQuantity - soldQuantity - reservedPending
          const reservedPending = await getReservedPendingQuantity(ticketType.id, true);
          const available = ticketType.maxQuantity - ticketType.soldQuantity - reservedPending;

          if (available < 1) {
            throw new Error(`No hay disponibilidad para mesa ${item.table.number}`);
          }

          subtotal += Number(ticketType.price);
          saleItemsData.push({
            ticketTypeId: ticketType.id,
            quantity: 1, // 1 mesa
            isTable: true,
            seatsPerTable: ticketType.seatsPerTable || 4,
            tableNumber: item.table.number,
          });
        } else if (item.section && item.quantity) {
          // Es una sección (GENERAL, PREFERENTE)
          const ticketType = event.ticketTypes.find(
            (tt) => tt.id === item.section.id || tt.name === item.section.name
          );

          if (!ticketType) {
            throw new Error(`Tipo de boleto no encontrado para ${item.section.name}`);
          }

          // Verificar disponibilidad considerando reservas pendientes
          const reservedPending = await getReservedPendingQuantity(ticketType.id, false);
          const available = ticketType.maxQuantity - ticketType.soldQuantity - reservedPending;

          if (item.quantity > available) {
            throw new Error(`Solo hay ${available} boletos disponibles para ${item.section.name}`);
          }

          subtotal += Number(ticketType.price) * item.quantity;
          saleItemsData.push({
            ticketTypeId: ticketType.id,
            quantity: item.quantity,
            isTable: false,
          });
        }
      }

      const tax = subtotal * 0.16; // IVA 16%
      const total = subtotal + tax;
      const totalAmount = Math.round(total * 100); // Convertir a centavos

      // Obtener usuario si está autenticado
      const user = await getSession();
      const userId = user?.id || null;

      // Crear la venta con reserva temporal (10 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const sale = await tx.sale.create({
        data: {
          eventId,
          userId,
          channel: "ONLINE",
          status: "PENDING",
          subtotal: subtotal,
          tax: tax,
          total: total,
          totalAmount: totalAmount,
          currency: "MXN",
          buyerName,
          buyerEmail,
          buyerPhone: buyerPhone || null,
          paymentStatus: "PENDING",
          expiresAt,
          saleItems: {
            create: saleItemsData.map((item) => ({
              ticketTypeId: item.ticketTypeId,
              quantity: item.quantity,
              isTable: item.isTable,
              seatsPerTable: item.seatsPerTable || null,
              tableNumber: item.tableNumber || null,
            })),
          },
        },
        include: {
          saleItems: {
            include: {
              ticketType: true,
            },
          },
        },
      });

      return { sale, totalAmount, currency: "MXN" };
    });

    return NextResponse.json({
      success: true,
      message: "Reserva creada exitosamente",
      data: {
        saleId: result.sale.id,
        amount: result.totalAmount,
        currency: result.currency,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al procesar la orden" },
      { status: 500 }
    );
  }
}
