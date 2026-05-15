-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPD');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('TO_DO', 'IN_PROGRESS', 'ON_HOLD', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TicketUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('COMPLAINT', 'FEEDBACK', 'QUESTION');

-- CreateEnum
CREATE TYPE "ChannelPlatform" AS ENUM ('WHATSAPP', 'INSTAGRAM', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('WARGA', 'ADMIN', 'OPD');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('COMMENT', 'MENTION');

-- CreateEnum
CREATE TYPE "ApprovalSubject" AS ENUM ('MESSAGE', 'QUESTION_MESSAGE');

-- CreateEnum
CREATE TYPE "ApprovalVerdict" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiSubjectType" AS ENUM ('TICKET', 'SOCIAL_INTERACTION');

-- CreateEnum
CREATE TYPE "VerificationVerdict" AS ENUM ('VALID', 'INVALID', 'NEEDS_REROUTE');

-- CreateTable
CREATE TABLE "Opd" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPD',
    "opdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citizen" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "nik" TEXT,
    "region" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Citizen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitizenContact" (
    "id" TEXT NOT NULL,
    "platform" "ChannelPlatform" NOT NULL,
    "handle" TEXT NOT NULL,
    "citizenId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CitizenContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "platform" "ChannelPlatform" NOT NULL,
    "accountHandle" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "defaultOpdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'TO_DO',
    "priority" "TicketPriority",
    "urgency" "TicketUrgency",
    "type" "TicketType",
    "citizenId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "categoryId" TEXT,
    "assignedOpdId" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketProgress" (
    "ticketId" TEXT NOT NULL,
    "seqNo" INTEGER NOT NULL,
    "fromStatus" "TicketStatus",
    "toStatus" "TicketStatus" NOT NULL,
    "note" TEXT,
    "changedById" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketProgress_pkey" PRIMARY KEY ("ticketId","seqNo")
);

-- CreateTable
CREATE TABLE "TicketVerification" (
    "ticketId" TEXT NOT NULL,
    "seqNo" INTEGER NOT NULL,
    "verdict" "VerificationVerdict" NOT NULL,
    "verifierUserId" TEXT,
    "overrideCategoryId" TEXT,
    "overrideOpdId" TEXT,
    "note" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketVerification_pkey" PRIMARY KEY ("ticketId","seqNo")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "subjectType" "ApprovalSubject" NOT NULL,
    "verdict" "ApprovalVerdict" NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderType" "SenderType" NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "sentAt" TIMESTAMP(3),
    "ticketId" TEXT NOT NULL,
    "senderUserId" TEXT,
    "approvalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "ticketId" TEXT,
    "messageId" TEXT,
    "uploadedById" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialInteraction" (
    "id" TEXT NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "permalink" TEXT,
    "isTicketCreated" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" TEXT NOT NULL,
    "convertedTicketId" TEXT,

    CONSTRAINT "SocialInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiClassification" (
    "id" TEXT NOT NULL,
    "subjectType" "AiSubjectType" NOT NULL,
    "predictedType" "TicketType",
    "predictedCategory" TEXT,
    "predictedUrgency" "TicketUrgency",
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelName" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ticketId" TEXT,
    "socialId" TEXT,
    "predictedOpdId" TEXT,
    "verifiedById" TEXT,

    CONSTRAINT "AiClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opd_name_key" ON "Opd"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CitizenContact_citizenId_platform_key" ON "CitizenContact"("citizenId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_platform_key" ON "Channel"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE INDEX "Ticket_status_idx" ON "Ticket"("status");

-- CreateIndex
CREATE INDEX "Ticket_citizenId_idx" ON "Ticket"("citizenId");

-- CreateIndex
CREATE INDEX "Ticket_assignedOpdId_idx" ON "Ticket"("assignedOpdId");

-- CreateIndex
CREATE INDEX "Ticket_channelId_idx" ON "Ticket"("channelId");

-- CreateIndex
CREATE INDEX "Ticket_categoryId_idx" ON "Ticket"("categoryId");

-- CreateIndex
CREATE INDEX "Ticket_createdAt_idx" ON "Ticket"("createdAt");

-- CreateIndex
CREATE INDEX "Message_ticketId_idx" ON "Message"("ticketId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialInteraction_convertedTicketId_key" ON "SocialInteraction"("convertedTicketId");

-- CreateIndex
CREATE INDEX "SocialInteraction_channelId_idx" ON "SocialInteraction"("channelId");

-- CreateIndex
CREATE INDEX "SocialInteraction_convertedTicketId_idx" ON "SocialInteraction"("convertedTicketId");

-- CreateIndex
CREATE INDEX "SocialInteraction_capturedAt_idx" ON "SocialInteraction"("capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SocialInteraction_channelId_externalId_key" ON "SocialInteraction"("channelId", "externalId");

-- CreateIndex
CREATE INDEX "AiClassification_ticketId_idx" ON "AiClassification"("ticketId");

-- CreateIndex
CREATE INDEX "AiClassification_socialId_idx" ON "AiClassification"("socialId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_opdId_fkey" FOREIGN KEY ("opdId") REFERENCES "Opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitizenContact" ADD CONSTRAINT "CitizenContact_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_defaultOpdId_fkey" FOREIGN KEY ("defaultOpdId") REFERENCES "Opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_assignedOpdId_fkey" FOREIGN KEY ("assignedOpdId") REFERENCES "Opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "Citizen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProgress" ADD CONSTRAINT "TicketProgress_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProgress" ADD CONSTRAINT "TicketProgress_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketVerification" ADD CONSTRAINT "TicketVerification_overrideCategoryId_fkey" FOREIGN KEY ("overrideCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketVerification" ADD CONSTRAINT "TicketVerification_overrideOpdId_fkey" FOREIGN KEY ("overrideOpdId") REFERENCES "Opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketVerification" ADD CONSTRAINT "TicketVerification_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketVerification" ADD CONSTRAINT "TicketVerification_verifierUserId_fkey" FOREIGN KEY ("verifierUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialInteraction" ADD CONSTRAINT "SocialInteraction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialInteraction" ADD CONSTRAINT "SocialInteraction_convertedTicketId_fkey" FOREIGN KEY ("convertedTicketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_predictedOpdId_fkey" FOREIGN KEY ("predictedOpdId") REFERENCES "Opd"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_socialId_fkey" FOREIGN KEY ("socialId") REFERENCES "SocialInteraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiClassification" ADD CONSTRAINT "AiClassification_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
