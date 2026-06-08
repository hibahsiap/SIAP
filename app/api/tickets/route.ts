import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { TicketUrgency, TicketType, ChannelPlatform, Prisma } from "@prisma/client";
import { sendInstagramDM } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "pending";
  const search = searchParams.get("search")?.trim();

  const where: Prisma.TicketWhereInput = {};

  if (tab === "pending") {
    where.status = "ON_HOLD";
  } else if (tab === "aspirations") {
    where.type = "FEEDBACK";
  } else {
    where.status = { not: "ON_HOLD" };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { ticketNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      citizen: { select: { id: true, displayName: true } },
      assignedOpd: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      channel: { select: { id: true, platform: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    tickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      description: t.description,
      status: t.status,
      urgency: t.urgency,
      type: t.type,
      location: t.location,
      startDate: t.startDate,
      dueDate: t.dueDate,
      createdAt: t.createdAt,
      citizenName: t.citizen.displayName,
      opdName: t.assignedOpd?.name ?? null,
      opdId: t.assignedOpd?.id ?? null,
      categoryName: t.category?.name ?? null,
      categoryId: t.category?.id ?? null,
      channelPlatform: t.channel.platform,
    }))
  );
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    conversationId, messageId, opdId, title, description, location, categoryId, urgency, type,
    attachments, socialInteractionId,
  }: {
    conversationId?: string; messageId?: string; opdId: string;
    title?: string; description?: string; location?: string; categoryId?: string;
    urgency?: string; type?: string;
    attachments?: { url: string; fileName: string; mimeType: string; sizeBytes: number }[];
    socialInteractionId?: string;
  } = body;

  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.ticket.count();
  const ticketNumber = `TKT-${datePart}-${String(count + 1).padStart(5, "0")}`;

  // --- TICKET FROM SOCIAL INTERACTION (comments/mentions) ---
  if (socialInteractionId) {
    if (!opdId)
      return NextResponse.json({ error: "opdId is required" }, { status: 400 });

    const interaction = await prisma.socialInteraction.findUnique({
      where: { id: socialInteractionId },
      include: { channel: true },
    });
    if (!interaction)
      return NextResponse.json({ error: "Social interaction not found" }, { status: 404 });

    if (interaction.isTicketCreated)
      return NextResponse.json({ error: "Ticket already created from this interaction" }, { status: 409 });

    const platform = interaction.channel.platform;

    // Find or create citizen
    let citizen = await prisma.citizen.findFirst({
      where: { displayName: interaction.username },
    });

    const result = await prisma.$transaction(async (tx) => {
      if (!citizen) {
        citizen = await tx.citizen.create({
          data: { displayName: interaction.username },
        });
        await tx.citizenContact.create({
          data: {
            platform: platform as ChannelPlatform,
            handle: interaction.username,
            username: interaction.username,
            citizenId: citizen.id,
          },
        });
      } else {
        const existingContact = await tx.citizenContact.findFirst({
          where: { citizenId: citizen.id, platform: platform as ChannelPlatform },
        });
        if (!existingContact) {
          await tx.citizenContact.create({
            data: {
              platform: platform as ChannelPlatform,
              handle: interaction.username,
              username: interaction.username,
              citizenId: citizen.id,
            },
          });
        }
      }

      const ticket = await tx.ticket.create({
        data: {
          ticketNumber,
          title: title ?? interaction.content.slice(0, 80),
          description: description ?? interaction.content,
          status: "TO_DO",
          citizenId: citizen.id,
          channelId: interaction.channelId,
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

      await tx.socialInteraction.update({
        where: { id: socialInteractionId },
        data: { isTicketCreated: true, convertedTicketId: ticket.id },
      });

      return ticket;
    });

    return NextResponse.json(
      {
        id: result.id,
        ticketNumber: result.ticketNumber,
        status: result.status,
        assignedOpdId: result.assignedOpdId,
      },
      { status: 201 }
    );
  }

  // --- TICKET FROM CHAT (existing flow) ---
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
