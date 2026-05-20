-- Remove unique constraint on Ticket.conversationId to allow multiple tickets per conversation
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_conversationId_key";

-- Create ForwardedMessage junction table
CREATE TABLE "ForwardedMessage" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "forwardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForwardedMessage_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "ForwardedMessage" ADD CONSTRAINT "ForwardedMessage_messageId_fkey"
    FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ForwardedMessage" ADD CONSTRAINT "ForwardedMessage_ticketId_fkey"
    FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint to prevent duplicate forwarding of the same message to the same ticket
ALTER TABLE "ForwardedMessage" ADD CONSTRAINT "ForwardedMessage_messageId_ticketId_key"
    UNIQUE ("messageId", "ticketId");

-- Add index for efficient lookup by ticketId
CREATE INDEX "ForwardedMessage_ticketId_idx" ON "ForwardedMessage"("ticketId");
