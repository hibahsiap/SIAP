import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/activity";
import { TicketStatus, TicketUrgency, TicketType } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json();
  const {
    title,
    description,
    type,
    urgency,
    location,
    categoryId,
    assignedOpdId,
    status,
    attachments,
    removedAttachmentIds,
  }: {
    title?: string;
    description?: string;
    type?: string;
    urgency?: string;
    location?: string;
    categoryId?: string | null;
    assignedOpdId?: string | null;
    status?: string;
    attachments?: { url: string; fileName: string; mimeType: string; sizeBytes: number }[];
    removedAttachmentIds?: string[];
  } = body;

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  const data: Record<string, unknown> = { updatedAt: new Date() };

  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (type !== undefined) data.type = type as TicketType;
  if (urgency !== undefined) data.urgency = urgency as TicketUrgency;
  if (location !== undefined) data.location = location;
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (assignedOpdId !== undefined) data.assignedOpdId = assignedOpdId;

  const prevStatus = existing.status;
  if (status !== undefined) {
    const next = status as TicketStatus;
    data.status = next;

    // Track lifecycle timestamps so reports can measure solving time / refusals.
    if (next === "DONE") {
      // Stamp resolvedAt only on the transition into DONE (preserve original time on edits).
      if (prevStatus !== "DONE") data.resolvedAt = new Date();
    } else if (existing.resolvedAt) {
      // Reopened: it is no longer resolved.
      data.resolvedAt = null;
    }

    if (next === "CANCELLED") {
      if (prevStatus !== "CANCELLED") data.closedAt = new Date();
    } else if (existing.closedAt) {
      data.closedAt = null;
    }
  }

  const ticket = await prisma.$transaction(async (tx) => {
    if (removedAttachmentIds && removedAttachmentIds.length > 0) {
      await tx.attachment.deleteMany({
        where: { id: { in: removedAttachmentIds }, ticketId: id },
      });
    }

    if (attachments && attachments.length > 0) {
      await tx.attachment.createMany({
        data: attachments.map((a) => ({
          url: a.url,
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          ticketId: id,
          uploadedById: auth.userId,
        })),
      });
    }

    return tx.ticket.update({
      where: { id },
      data,
      include: {
        citizen: { select: { displayName: true } },
        assignedOpd: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  });

  const statusChanged = status !== undefined && ticket.status !== prevStatus;
  await logActivity({
    userId: auth.userId,
    action: statusChanged ? "TICKET_STATUS_CHANGED" : "TICKET_UPDATED",
    entityType: "Ticket",
    entityId: ticket.id,
    description: statusChanged
      ? `Ticket ${ticket.ticketNumber} status changed from ${prevStatus} to ${ticket.status}`
      : `Updated ticket ${ticket.ticketNumber}`,
    ipAddress: getClientIp(req),
  });

  const isApproved = prevStatus === "ON_HOLD" && ticket.status !== "ON_HOLD";
  const statusLabel =
    ticket.status === "TO_DO"
      ? "diterima dan sedang diproses"
      : ticket.status === "IN_PROGRESS"
        ? "sedang dalam pengerjaan"
        : "ditindaklanjuti";

  return NextResponse.json({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    urgency: ticket.urgency,
    type: ticket.type,
    location: ticket.location,
    citizenName: ticket.citizen.displayName,
    opdName: ticket.assignedOpd?.name ?? null,
    categoryName: ticket.category?.name ?? null,
    isApproved,
    statusLabel,
  });
}
