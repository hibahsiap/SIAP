import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { TicketUrgency, TicketType } from "@prisma/client";
import { sendInstagramDM } from "@/lib/instagram";

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    conversationId, messageId, opdId, title, description, location, categoryId, urgency, type,
    attachments,
  }: {
    conversationId: string; messageId: string; opdId: string;
    title?: string; description?: string; location?: string; categoryId?: string;
    urgency?: string; type?: string;
    attachments?: { url: string; fileName: string; mimeType: string; sizeBytes: number }[];
  } = await req.json();

  if (!conversationId || !messageId || !opdId)
    return NextResponse.json({ error: "conversationId, messageId, opdId are required" }, { status: 400 });

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      channel: { select: { id: true, platform: true, accessToken: true } },
      citizen: { select: { id: true, contacts: { select: { platform: true, handle: true } } } },
    },
  });
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.ticket.count();
  const ticketNumber = `TKT-${datePart}-${String(count + 1).padStart(5, "0")}`;

  const triggerMessage = await prisma.message.findUnique({
    where: { id: messageId },
    select: { content: true },
  });

  const result = await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({
      data: {
        ticketNumber,
        title: title ?? (triggerMessage?.content ?? "").slice(0, 80),
        description: description ?? triggerMessage?.content ?? "",
        status: "TO_DO",
        citizenId: conv.citizen.id,
        channelId: conv.channel.id,
        conversationId,
        assignedOpdId: opdId,
        location: location ?? null,
        categoryId: categoryId ?? null,
        urgency: (urgency as TicketUrgency) ?? null,
        type: (type as TicketType) ?? null,
        updatedAt: new Date(),
      },
    });

    if (attachments && attachments.length > 0) {
      await tx.attachment.createMany({
        data: attachments.map((a) => ({
          url: a.url,
          fileName: a.fileName,
          mimeType: a.mimeType,
          sizeBytes: a.sizeBytes,
          ticketId: ticket.id,
        })),
      });
    }

    // Mark trigger message: ticketId = created from this message; forwardedToTicketId = OPD can see it
    await tx.message.update({
      where: { id: messageId },
      data: { ticketId: ticket.id, forwardedToTicketId: ticket.id },
    });

    // Auto-reply notification to citizen
    const typeLabel = type === "QUESTION" ? "Pertanyaan" : type === "FEEDBACK" ? "Masukan" : "Pengaduan";
    const notifText = `Terima kasih telah menghubungi kami. ${typeLabel} Anda telah kami terima dan dicatat dengan nomor tiket ${ticketNumber}. Tim kami akan segera menindaklanjuti.`;
    const now = new Date();
    await tx.message.create({
      data: {
        content: notifText,
        senderType: "ADMIN",
        direction: "OUTBOUND",
        isInternal: false,
        isApproved: true,
        conversationId,
        sentAt: now,
      },
    });
    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now },
    });

    return ticket;
  });

  // Deliver via Instagram DM (outside transaction — failure should not roll back ticket creation)
  if (conv.channel.platform === "INSTAGRAM" && conv.channel.accessToken) {
    const igContact = conv.citizen.contacts.find((c) => c.platform === "INSTAGRAM");
    if (igContact) {
      const typeLabel = type === "QUESTION" ? "Pertanyaan" : type === "FEEDBACK" ? "Masukan" : "Pengaduan";
      const notifText = `Terima kasih telah menghubungi kami. ${typeLabel} Anda telah kami terima dan dicatat dengan nomor tiket ${result.ticketNumber}. Tim kami akan segera menindaklanjuti.`;
      sendInstagramDM({
        accessToken: conv.channel.accessToken,
        recipientPsid: igContact.handle,
        text: notifText,
      }).catch((err) => console.error("[Ticket auto-reply IG]", err));
    }
  }

  return NextResponse.json(
    {
      id: result.id,
      ticketNumber: result.ticketNumber,
      status: result.status,
      conversationId: result.conversationId,
      assignedOpdId: result.assignedOpdId,
    },
    { status: 201 }
  );
}
