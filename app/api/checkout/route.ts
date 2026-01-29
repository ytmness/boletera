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
  // Usar OR para manejar casos donde expiresAt puede ser null
  const pendingSales = await prisma.sale.findMany({
    where: {
      status: "PENDING",
      OR: [
        {
          expiresAt: {
            gt: now, // No expiradas
          },
        },
        {
          expiresAt: null, // Si no tiene expiración, considerar como válida
        },
      ],
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

    // Obtener usuario si está autenticado (fuera de la transacción)
    const user = await getSession();
    const userId = user?.id || null;

    // Pre-calcular reservas pendientes para todos los ticketTypes necesarios (fuera de la transacción)
    const ticketTypeIds = new Set<string>();
    for (const item of items) {
      if (item.table) {
        const ticketType = event.ticketTypes.find(
          (tt) => tt.isTable === true && Number(tt.price) === item.table.price
        );
        if (ticketType) ticketTypeIds.add(ticketType.id);
      } else if (item.section && item.quantity) {
        const ticketType = event.ticketTypes.find(
          (tt) => tt.id === item.section.id || tt.name === item.section.name
        );
        if (ticketType) ticketTypeIds.add(ticketType.id);
      }
    }

    // Obtener todas las reservas pendientes de una vez
    const now = new Date();
    const pendingSales = await prisma.sale.findMany({
      where: {
        status: "PENDING",
        OR: [
          { expiresAt: { gt: now } },
          { expiresAt: null },
        ],
        saleItems: {
          some: {
            ticketTypeId: { in: Array.from(ticketTypeIds) },
          },
        },
      },
      include: {
        saleItems: {
          where: {
            ticketTypeId: { in: Array.from(ticketTypeIds) },
          },
        },
      },
    });

    // Crear mapa de reservas por ticketTypeId
    const reservedByTicketType = new Map<string, number>();
    for (const sale of pendingSales) {
      for (const saleItem of sale.saleItems) {
        const current = reservedByTicketType.get(saleItem.ticketTypeId) || 0;
        reservedByTicketType.set(saleItem.ticketTypeId, current + saleItem.quantity);
      }
    }

    // Validar disponibilidad y preparar datos (fuera de la transacción)
    for (const item of items) {
      if (item.table) {
        // Es una mesa VIP
        const ticketType = event.ticketTypes.find(
          (tt) => tt.isTable === true && Number(tt.price) === item.table.price
        );

        if (!ticketType) {
          return NextResponse.json(
            { error: `Tipo de boleto no encontrado para mesa ${item.table.number}` },
            { status: 400 }
          );
        }

        // Verificar disponibilidad: maxQuantity - soldQuantity - reservedPending
        const reservedPending = reservedByTicketType.get(ticketType.id) || 0;
        const available = ticketType.maxQuantity - ticketType.soldQuantity - reservedPending;

        if (available < 1) {
          return NextResponse.json(
            { error: `No hay disponibilidad para mesa ${item.table.number}` },
            { status: 400 }
          );
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
          return NextResponse.json(
            { error: `Tipo de boleto no encontrado para ${item.section.name}` },
            { status: 400 }
          );
        }

        // Verificar disponibilidad considerando reservas pendientes
        const reservedPending = reservedByTicketType.get(ticketType.id) || 0;
        const available = ticketType.maxQuantity - ticketType.soldQuantity - reservedPending;

        if (item.quantity > available) {
          return NextResponse.json(
            { error: `Solo hay ${available} boletos disponibles para ${item.section.name}` },
            { status: 400 }
          );
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

    // Crear la venta con reserva temporal (10 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Crear la venta sin transacción (más rápido con pooler)
    // El pooler maneja mejor las operaciones simples sin transacciones complejas
    const sale = await prisma.sale.create({
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
    });

    const result = { sale, totalAmount, currency: "MXN" };

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
