import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const conversationId = "3ebccd75-0c49-4246-8961-e7f662491c8e";
    const content = "Test message";
    const senderType = "ADMIN";
    const now = new Date();
    let externalId: string | null = null;

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        channel: true,
        citizen: { include: { contacts: true } },
      },
    });

    if (!conv) return NextResponse.json({ error: "No conv" });

    const msg = await prisma.message.create({
      data: {
        content,
        senderType,
        direction: "OUTBOUND",
        isInternal: false,
        isApproved: true,
        conversationId: conv.id,
        senderUserId: null,
        sentAt: now,
        externalId,
      },
    });

    return NextResponse.json({ msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, stack: err.stack, details: err });
  }
}
