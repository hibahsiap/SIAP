-- CreateTable
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "citizenId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_citizenId_channelId_key" ON "Conversation"("citizenId", "channelId");
CREATE INDEX IF NOT EXISTS "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");

ALTER TABLE "Conversation"
    DROP CONSTRAINT IF EXISTS "Conversation_citizenId_fkey",
    ADD CONSTRAINT "Conversation_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Conversation"
    DROP CONSTRAINT IF EXISTS "Conversation_channelId_fkey",
    ADD CONSTRAINT "Conversation_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON UPDATE CASCADE;

-- Message: ticketId becomes optional, add conversationId
ALTER TABLE "Message" ALTER COLUMN "ticketId" DROP NOT NULL;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "conversationId" TEXT;
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");

ALTER TABLE "Message"
    DROP CONSTRAINT IF EXISTS "Message_conversationId_fkey",
    ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Ticket: optional 1:1 link back to conversation
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "conversationId" TEXT;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'Ticket_conversationId_key'
    ) THEN
        ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_conversationId_key" UNIQUE ("conversationId");
    END IF;
END$$;

ALTER TABLE "Ticket"
    DROP CONSTRAINT IF EXISTS "Ticket_conversationId_fkey",
    ADD CONSTRAINT "Ticket_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON UPDATE CASCADE;

-- Belt-and-suspenders: ensure UUID defaults on tables the webhook touches
ALTER TABLE "Citizen"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "CitizenContact" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Ticket"         ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Message"        ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
ALTER TABLE "Conversation"   ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Grant API role privileges (Supabase normally does this automatically for tables created via its tooling,
-- but tables created by `prisma migrate deploy` bypass that and need explicit grants).
GRANT ALL PRIVILEGES ON TABLE public."Conversation" TO service_role;
GRANT ALL PRIVILEGES ON TABLE public."Conversation" TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public."Conversation" TO anon;
