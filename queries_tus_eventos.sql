-- =====================================================
-- QUERIES ESPECÍFICOS PARA TUS EVENTOS
-- =====================================================

-- EVENTO 1: Víctor Mendivil en Concierto
-- ID: d624f1f1-c67f-4917-8c70-fb195ce62bbf

-- Ver TODOS los tipos de boletos de Víctor Mendivil
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  (tt."maxQuantity" - tt."soldQuantity") as disponibles,
  tt."isTable" as es_mesa,
  tt."seatsPerTable" as asientos_por_mesa,
  tt."isActive" as activo
FROM "TicketType" tt
WHERE tt."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
ORDER BY 
  CASE WHEN tt."isTable" = true THEN 1 ELSE 2 END,
  tt.category,
  tt.price;

-- Ver SOLO las secciones (GENERAL, PREFERENTE) de Víctor Mendivil
SELECT 
  tt.id,
  tt.name,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  (tt."maxQuantity" - tt."soldQuantity") as disponibles,
  tt.description
FROM "TicketType" tt
WHERE tt."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
  AND tt."isTable" = false
  AND tt.category IN ('GENERAL', 'PREFERENTE')
ORDER BY tt.category, tt.price;

-- Ver SOLO las mesas VIP de Víctor Mendivil
SELECT 
  tt.id,
  tt.name,
  tt.price,
  tt."maxQuantity" as total_mesas,
  tt."soldQuantity" as mesas_vendidas,
  (tt."maxQuantity" - tt."soldQuantity") as mesas_disponibles,
  tt."seatsPerTable" as personas_por_mesa
FROM "TicketType" tt
WHERE tt."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
  AND tt."isTable" = true;

-- =====================================================

-- EVENTO 2: Pal Norte 2025
-- ID: 4c875499-c609-4b11-9bdf-1ce5a9295b5c

-- Ver TODOS los tipos de boletos de Pal Norte
SELECT 
  tt.id,
  tt.name,
  tt.description,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  (tt."maxQuantity" - tt."soldQuantity") as disponibles,
  tt."isTable" as es_mesa,
  tt."seatsPerTable" as asientos_por_mesa,
  tt."isActive" as activo
FROM "TicketType" tt
WHERE tt."eventId" = '4c875499-c609-4b11-9bdf-1ce5a9295b5c'
ORDER BY 
  CASE WHEN tt."isTable" = true THEN 1 ELSE 2 END,
  tt.category,
  tt.price;

-- Ver SOLO las secciones (GENERAL, PREFERENTE) de Pal Norte
SELECT 
  tt.id,
  tt.name,
  tt.category,
  tt.price,
  tt."maxQuantity" as capacidad,
  tt."soldQuantity" as vendidos,
  (tt."maxQuantity" - tt."soldQuantity") as disponibles,
  tt.description
FROM "TicketType" tt
WHERE tt."eventId" = '4c875499-c609-4b11-9bdf-1ce5a9295b5c'
  AND tt."isTable" = false
  AND tt.category IN ('GENERAL', 'PREFERENTE')
ORDER BY tt.category, tt.price;

-- =====================================================
-- RESUMEN DE AMBOS EVENTOS
-- =====================================================

SELECT 
  e.name as evento,
  COUNT(tt.id) as total_tipos,
  COUNT(CASE WHEN tt."isTable" = true THEN 1 END) as mesas_vip,
  COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'GENERAL' THEN 1 END) as secciones_general,
  COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'PREFERENTE' THEN 1 END) as secciones_preferente
FROM "Event" e
LEFT JOIN "TicketType" tt ON e.id = tt."eventId"
WHERE e.id IN ('d624f1f1-c67f-4917-8c70-fb195ce62bbf', '4c875499-c609-4b11-9bdf-1ce5a9295b5c')
GROUP BY e.id, e.name;

-- =====================================================
-- VERIFICAR SI FALTAN SECCIONES
-- =====================================================

-- Para Víctor Mendivil
SELECT 
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'GENERAL' THEN 1 END) = 0 
    THEN '❌ FALTA sección GENERAL'
    ELSE '✅ Tiene sección GENERAL'
  END as estado_general,
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'PREFERENTE' THEN 1 END) = 0 
    THEN '❌ FALTA sección PREFERENTE'
    ELSE '✅ Tiene sección PREFERENTE'
  END as estado_preferente,
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = true THEN 1 END) = 0 
    THEN '❌ FALTA mesas VIP'
    ELSE '✅ Tiene mesas VIP'
  END as estado_mesas
FROM "TicketType" tt
WHERE tt."eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf';

-- Para Pal Norte
SELECT 
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'GENERAL' THEN 1 END) = 0 
    THEN '❌ FALTA sección GENERAL'
    ELSE '✅ Tiene sección GENERAL'
  END as estado_general,
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = false AND tt.category = 'PREFERENTE' THEN 1 END) = 0 
    THEN '❌ FALTA sección PREFERENTE'
    ELSE '✅ Tiene sección PREFERENTE'
  END as estado_preferente,
  CASE 
    WHEN COUNT(CASE WHEN tt."isTable" = true THEN 1 END) = 0 
    THEN '❌ FALTA mesas VIP'
    ELSE '✅ Tiene mesas VIP'
  END as estado_mesas
FROM "TicketType" tt
WHERE tt."eventId" = '4c875499-c609-4b11-9bdf-1ce5a9295b5c';

