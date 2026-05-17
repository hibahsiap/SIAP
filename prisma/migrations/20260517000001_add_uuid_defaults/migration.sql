-- AlterTable: set default UUID generation for tables used by webhook Edge Function
ALTER TABLE "Citizen" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "CitizenContact" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Ticket" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
