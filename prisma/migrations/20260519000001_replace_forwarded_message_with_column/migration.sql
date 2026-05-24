-- Drop the ForwardedMessage junction table
DROP TABLE IF EXISTS "ForwardedMessage";

-- Add forwardedToTicketId column to Message
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "forwardedToTicketId" TEXT;

-- Add FK constraint
ALTER TABLE "Message" ADD CONSTRAINT "Message_forwardedToTicketId_fkey"
  FOREIGN KEY ("forwardedToTicketId") REFERENCES "Ticket"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index
CREATE INDEX IF NOT EXISTS "Message_forwardedToTicketId_idx" ON "Message"("forwardedToTicketId");
