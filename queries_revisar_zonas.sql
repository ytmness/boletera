-- =====================================================
-- QUERIES PARA REVISAR ZONAS/SECCIONES EN SUPABASE
-- =====================================================

-- 1. Ver todos los tipos de boletos de un evento específico
-- (Reemplaza 'EVENT_ID' con el ID de tu evento)
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  tt."isTable" as es_mesa,
  tt."seatsPerTable" as asientos_por_mesa,
  tt."isActive" as activo,
  e.name as evento_nombre
FROM "TicketType" tt
JOIN "Event" e ON tt."eventId" = e.id
WHERE e.id = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
ORDER BY tt.category, tt.price;

-- 2. Ver solo las secciones (NO mesas) de un evento
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  (tt."maxQuantity" - tt."soldQuantity") as disponibles,
  tt."isActive" as activo,
  e.name as evento_nombre
FROM "TicketType" tt
JOIN "Event" e ON tt."eventId" = e.id
WHERE e.id = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
  AND tt."isTable" = false
  AND tt.category IN ('GENERAL', 'PREFERENTE')
ORDER BY tt.category, tt.price;

-- 3. Ver solo las mesas VIP de un evento
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.category,
  tt.price,
  tt."maxQuantity" as total_mesas,
  tt."soldQuantity" as mesas_vendidas,
  (tt."maxQuantity" - tt."soldQuantity") as mesas_disponibles,
  tt."seatsPerTable" as personas_por_mesa,
  tt."isActive" as activo,
  e.name as evento_nombre
FROM "TicketType" tt
JOIN "Event" e ON tt."eventId" = e.id
WHERE e.id = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
  AND tt."isTable" = true
ORDER BY tt.price;

-- 4. Ver todos los eventos y sus tipos de boletos (resumen)
SELECT 
  e.id as evento_id,
  e.name as evento_nombre,
  COUNT(tt.id) as total_tipos_boletos,
  COUNT(CASE WHEN tt."isTable" = true THEN 1 END) as total_mesas,
  COUNT(CASE WHEN tt."isTable" = false THEN 1 END) as total_secciones,
  COUNT(CASE WHEN tt.category = 'GENERAL' THEN 1 END) as secciones_general,
  COUNT(CASE WHEN tt.category = 'PREFERENTE' THEN 1 END) as secciones_preferente,
  COUNT(CASE WHEN tt.category = 'VIP' THEN 1 END) as secciones_vip
FROM "Event" e
LEFT JOIN "TicketType" tt ON e.id = tt."eventId"
WHERE e."isActive" = true
GROUP BY e.id, e.name
ORDER BY e."eventDate";

-- 5. Ver detalles completos de un evento con todos sus tipos de boletos
SELECT 
  e.id as evento_id,
  e.name as evento_nombre,
  e."eventDate",
  e."eventTime",
  e.venue,
  tt.id as tipo_boleto_id,
  tt.name as tipo_boleto_nombre,
  tt.category,
  tt.price,
  tt."maxQuantity",
  tt."soldQuantity",
  tt."isTable",
  tt."seatsPerTable",
  tt."isActive",
  CASE 
    WHEN tt."isTable" = true THEN 'Mesa VIP'
    WHEN tt.category = 'GENERAL' THEN 'Sección General'
    WHEN tt.category = 'PREFERENTE' THEN 'Sección Preferente'
    ELSE 'Otro'
  END as tipo
FROM "Event" e
LEFT JOIN "TicketType" tt ON e.id = tt."eventId"
WHERE e.id = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
ORDER BY 
  CASE WHEN tt."isTable" = true THEN 1 ELSE 2 END,
  tt.category,
  tt.price;

-- 6. Verificar si hay secciones GENERAL o PREFERENTE configuradas
SELECT 
  e.name as evento,
  tt.name as seccion,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  CASE 
    WHEN tt.category = 'GENERAL' THEN 'Debe tener capacidad alta (ej: 1000)'
    WHEN tt.category = 'PREFERENTE' THEN 'Debe tener capacidad media (ej: 300)'
    ELSE 'Revisar'
  END as nota
FROM "Event" e
JOIN "TicketType" tt ON e.id = tt."eventId"
WHERE e.id = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
  AND tt."isTable" = false
  AND tt.category IN ('GENERAL', 'PREFERENTE')
ORDER BY tt.category;

-- 7. Ver tickets vendidos por sección (para verificar estado real)
SELECT 
  tt.name as seccion,
  tt.category,
  COUNT(t.id) as tickets_vendidos,
  COUNT(DISTINCT t."saleId") as ventas,
  SUM(CASE WHEN t.status = 'VALID' THEN 1 ELSE 0 END) as tickets_validos,
  SUM(CASE WHEN t.status = 'USED' THEN 1 ELSE 0 END) as tickets_usados
FROM "TicketType" tt
LEFT JOIN "Ticket" t ON tt.id = t."ticketTypeId"
WHERE tt."eventId" = 'EVENT_ID'  -- Reemplaza con el ID de tu evento
  AND tt."isTable" = false
GROUP BY tt.id, tt.name, tt.category
ORDER BY tt.category;

-- =====================================================
-- QUERY RÁPIDA: Ver todas las secciones de un evento
-- =====================================================
-- Reemplaza 'TU_EVENT_ID' con el ID real de tu evento
SELECT 
  id,
  name,
  category,
  price,
  "maxQuantity" as capacidad,
  "soldQuantity" as vendidos,
  "isTable" as es_mesa
FROM "TicketType"
WHERE "eventId" = 'TU_EVENT_ID'
  AND "isTable" = false
ORDER BY category, price;

