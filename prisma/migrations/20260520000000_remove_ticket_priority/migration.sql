-- Remove priority column and enum from Ticket
ALTER TABLE "Ticket" DROP COLUMN IF EXISTS "priority";
DROP TYPE IF EXISTS "TicketPriority";
