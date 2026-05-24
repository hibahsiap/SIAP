import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId } = await params;
  const { messageIds, ticketId } = await req.json();

  if (!Array.isArray(messageIds) || messageIds.length === 0)
    return NextResponse.json({ error: "No messages selected" }, { status: 400 });

  if (!ticketId)
    return NextResponse.json({ error: "ticketId is required" }, { status: 400 });

  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, conversationId },
  });
  if (!ticket)
    return NextResponse.json({ error: "Ticket not found in this conversation" }, { status: 404 });

  const result = await prisma.message.updateMany({
    where: { id: { in: messageIds }, forwardedToTicketId: null },
    data: { forwardedToTicketId: ticketId },
  });

  return NextResponse.json({ forwarded: result.count });
}
