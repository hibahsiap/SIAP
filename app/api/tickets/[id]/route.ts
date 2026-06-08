import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
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
  }: {
    title?: string;
    description?: string;
    type?: string;
    urgency?: string;
    location?: string;
    categoryId?: string | null;
    assignedOpdId?: string | null;
    status?: string;
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
    data.status = status as TicketStatus;
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data,
    include: {
      citizen: { select: { displayName: true } },
      assignedOpd: { select: { name: true } },
      category: { select: { name: true } },
    },
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
