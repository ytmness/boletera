-- =====================================================
-- QUERY PARA VERIFICAR MESAS DEL EVENTO DE VÍCTOR
-- =====================================================

-- 1. Verificar si el evento tiene TicketType de mesas
SELECT 
  e.id as evento_id,
  e.name as evento_nombre,
  tt.id as ticket_type_id,
  tt.name as ticket_type_nombre,
  tt."isTable" as es_mesa,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  tt."seatsPerTable" as asientos_por_mesa
FROM "Event" e
LEFT JOIN "TicketType" tt ON e.id = tt."eventId"
WHERE e.id = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
ORDER BY tt."isTable" DESC, tt.category;

-- 2. Ver todos los TicketTypes del evento (para ver qué hay)
SELECT 
  id,
  name,
  category,
  "isTable",
  price,
  "maxQuantity",
  "soldQuantity"
FROM "TicketType"
WHERE "eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
ORDER BY "isTable" DESC;

-- 3. Ver tickets vendidos para este evento
SELECT 
  t.id,
  t."tableNumber",
  t."seatNumber",
  t.status,
  s.status as venta_status,
  s."buyerName",
  tt.name as tipo_boleto,
  tt."isTable" as es_mesa
FROM "Ticket" t
JOIN "Sale" s ON t."saleId" = s.id
JOIN "TicketType" tt ON t."ticketTypeId" = tt.id
WHERE s."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
  AND tt."isTable" = true
ORDER BY t."tableNumber", t."seatNumber";

-- 4. Contar mesas vendidas (agrupadas por número de mesa)
SELECT 
  t."tableNumber",
  COUNT(DISTINCT t.id) as tickets_por_mesa,
  s.status as venta_status
FROM "Ticket" t
JOIN "Sale" s ON t."saleId" = s.id
JOIN "TicketType" tt ON t."ticketTypeId" = tt.id
WHERE s."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
  AND tt."isTable" = true
  AND t."tableNumber" IS NOT NULL
GROUP BY t."tableNumber", s.status
ORDER BY t."tableNumber";

