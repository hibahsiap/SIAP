import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/activity";
import { TicketStatus, TicketUrgency } from "@prisma/client";

const ALLOWED_STATUSES: TicketStatus[] = [
  "TO_DO",
  "IN_PROGRESS",
  "ON_HOLD",
  "DONE",
  "CANCELLED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "OPD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { opdId: true },
  });
  if (!user?.opdId)
    return NextResponse.json({ error: "OPD not assigned" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const {
    status,
    note,
    attachments,
    categoryId,
    urgency,
  }: {
    status?: string;
    note?: string;
    attachments?: { url: string; fileName: string; mimeType: string; sizeBytes: number }[];
    categoryId?: string | null;
    urgency?: string | null;
  } = body;

  if (!status || !ALLOWED_STATUSES.includes(status as TicketStatus))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

  // OPD may only mutate tickets assigned to their own OPD.
  if (existing.assignedOpdId !== user.opdId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const next = status as TicketStatus;
  const prevStatus = existing.status;

  const data: Record<string, unknown> = { status: next, updatedAt: new Date() };

  if (categoryId !== undefined) data.categoryId = categoryId;
  if (urgency !== undefined) data.urgency = urgency ? (urgency as TicketUrgency) : null;

  // Stamp lifecycle timestamps consistently with the admin route.
  if (next === "IN_PROGRESS" && !existing.startDate) {
    data.startDate = new Date();
  }
  if (next === "DONE") {
    if (prevStatus !== "DONE") data.resolvedAt = new Date();
  } else if (existing.resolvedAt) {
    data.resolvedAt = null;
  }
  if (next === "CANCELLED") {
    if (prevStatus !== "CANCELLED") data.closedAt = new Date();
  } else if (existing.closedAt) {
    data.closedAt = null;
  }

  const ticket = await prisma.$transaction(async (tx) => {
    const updated = await tx.ticket.update({ where: { id }, data });

    // Record a progress entry (status change + note) when something meaningful happened.
    if (next !== prevStatus || (note && note.trim())) {
      const last = await tx.ticketProgress.findFirst({
        where: { ticketId: id },
        orderBy: { seqNo: "desc" },
        select: { seqNo: true },
      });
      await tx.ticketProgress.create({
        data: {
          ticketId: id,
          seqNo: (last?.seqNo ?? 0) + 1,
          fromStatus: prevStatus,
          toStatus: next,
          note: note?.trim() || null,
          changedById: auth.userId,
        },
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

    return updated;
  });

  await logActivity({
    userId: auth.userId,
    action: "TICKET_STATUS_CHANGED",
    entityType: "Ticket",
    entityId: ticket.id,
    description: `Ticket ${ticket.ticketNumber} status changed from ${prevStatus} to ${ticket.status}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
  });
}
