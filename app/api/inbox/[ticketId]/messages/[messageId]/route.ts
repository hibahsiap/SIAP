import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendInstagramDM } from "@/lib/instagram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string; messageId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId, messageId } = await params;
  const body = await req.json().catch(() => ({}));
  const { content, approve } = body as { content?: string; approve?: boolean };

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      conversation: {
        include: {
          channel: true,
          citizen: { include: { contacts: true } },
        },
      },
    },
  });

  if (!message || message.conversationId !== conversationId)
    return NextResponse.json({ error: "Message not found" }, { status: 404 });

  if (message.isApproved)
    return NextResponse.json({ error: "Message already approved" }, { status: 400 });

  // Edit content only (no approval yet)
  if (content !== undefined && !approve) {
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { content: content.trim() },
    });
    return NextResponse.json(updated);
  }

  // Approve (with optional content edit)
  if (approve) {
    const finalContent = content?.trim() ?? message.content;
    const conv = message.conversation!;
    let deliveryError: string | null = null;

    if (conv.channel.platform === "INSTAGRAM" && conv.channel.accessToken) {
      const recipient = conv.citizen.contacts.find((c) => c.platform === "INSTAGRAM");
      if (recipient) {
        try {
          await sendInstagramDM({
            accessToken: conv.channel.accessToken,
            recipientPsid: recipient.handle,
            text: finalContent,
          });
        } catch (err) {
          console.error("[Approval IG send]", err);
          deliveryError = err instanceof Error ? err.message : "Unknown error";
        }
      }
    }

    const approval = await prisma.approval.create({
      data: {
        verdict: "APPROVED",
        decidedById: auth.userId,
      },
    });

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: finalContent,
        isApproved: true,
        approvalId: approval.id,
        sentAt: new Date(),
      },
    });

    return NextResponse.json(
      { ...updated, deliveryError },
      { status: deliveryError ? 207 : 200 }
    );
  }

  return NextResponse.json({ error: "Provide content or approve=true" }, { status: 400 });
}
