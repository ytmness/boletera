-- =====================================================
-- VERIFICAR SI EL EVENTO TIENE TICKETTYPE DE MESAS
-- =====================================================

-- Ver TODOS los TicketTypes del evento de Víctor
SELECT 
  id,
  name,
  category,
  "isTable",
  price,
  "maxQuantity",
  "soldQuantity",
  "seatsPerTable",
  "isActive"
FROM "TicketType"
WHERE "eventId" = 'd624f1f1-c67f-4917-8c70-fb195ce62bbf'
ORDER BY "isTable" DESC, category;

-- Si NO hay un TicketType con isTable=true, necesitas crear uno:
-- INSERT INTO "TicketType" (
--   id,
--   "eventId",
--   name,
--   category,
--   price,
--   "maxQuantity",
--   "soldQuantity",
--   "isTable",
--   "seatsPerTable",
--   "isActive"
-- ) VALUES (
--   gen_random_uuid(),
--   'd624f1f1-c67f-4917-8c70-fb195ce62bbf',
--   'Mesa VIP 4 Personas',
--   'VIP',
--   2500.00,
--   144,  -- Total de mesas
--   0,    -- Inicialmente 0 vendidas
--   true, -- ES MESA
--   4,    -- 4 asientos por mesa
--   true  -- Activo
-- );

