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

  const { ticketId: conversationId } = await params; // It's actually chatId/conversationId
  const { messageIds, opdId } = await req.json();

  if (!Array.isArray(messageIds) || messageIds.length === 0)
    return NextResponse.json({ error: "No messages selected" }, { status: 400 });

  if (!opdId)
    return NextResponse.json({ error: "opdId is required" }, { status: 400 });

  const opd = await prisma.opd.findUnique({
    where: { id: opdId },
  });
  if (!opd)
    return NextResponse.json({ error: "OPD not found" }, { status: 404 });

  const result = await prisma.message.updateMany({
    where: { id: { in: messageIds }, forwardedToOpdId: null },
    data: { forwardedToOpdId: opdId },
  });

  return NextResponse.json({ forwarded: result.count });
}
