import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// Route param name is `ticketId` for historical reasons, but it identifies a Conversation now.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId } = await params;
  try {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        citizen: {
          include: {
            contacts: { select: { platform: true, handle: true, username: true, profilePicUrl: true } },
          },
        },
        channel: { select: { id: true, platform: true, accountHandle: true } },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            status: true,
            urgency: true,
            type: true,
            category: { select: { id: true, name: true } },
            assignedOpd: { select: { id: true, name: true } },
          },
        },
        messages: {
          orderBy: [{ sentAt: "asc" }, { createdAt: "asc" }],
          include: {
            senderUser: {
              select: {
                id: true,
                name: true,
                role: true,
                opdId: true,
                opd: { select: { name: true } },
              },
            },
            ticket: {
              select: {
                id: true,
                ticketNumber: true,
                status: true,
                urgency: true,
                type: true,
                assignedOpd: { select: { name: true } },
              },
            },
            forwardedToTicket: {
              select: { id: true, ticketNumber: true, assignedOpdId: true, status: true, assignedOpd: { select: { id: true, name: true } } },
            },
            forwardedToOpd: { select: { id: true, name: true } },
            attachments: {
              select: { id: true, url: true, mimeType: true, fileName: true },
            },
            approval: {
              select: { verdict: true, reason: true },
            },
            replyTo: {
              select: { id: true, content: true, senderType: true, senderUser: { select: { name: true } } },
            },
          },
        },
      },
    });

    if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let messages = conv.messages;

    if (auth.role === "OPD") {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { opdId: true },
      });

      const opdTicketIds = new Set(
        conv.tickets
          .filter((t) => t.assignedOpd?.id === user?.opdId && t.status !== "ON_HOLD")
          .map((t) => t.id)
      );

      const hasForwardedToOpd = conv.messages.some(
        (m) => m.forwardedToTicket?.assignedOpdId === user?.opdId || m.forwardedToOpdId === user?.opdId
      );
      const hasSentMessage = conv.messages.some(
        (m) => m.senderUser?.opdId === user?.opdId
      );

      if (opdTicketIds.size === 0 && !hasForwardedToOpd && !hasSentMessage)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      messages = conv.messages.filter(
        (m) =>
          (m.direction === "OUTBOUND" && m.senderUser?.opdId === user?.opdId) ||
          (m.forwardedToOpdId === user?.opdId) ||
          (m.forwardedToTicketId !== null && (
            opdTicketIds.has(m.forwardedToTicketId) ||
            (m.forwardedToTicket?.assignedOpdId === user?.opdId && m.forwardedToTicket?.status !== "ON_HOLD")
          ))
      );
    }

    return NextResponse.json({
      id: conv.id,
      citizen: {
        id: conv.citizen.id,
        name: conv.citizen.displayName,
        handle: conv.citizen.contacts[0]?.handle ?? null,
        username: conv.citizen.contacts[0]?.username ?? null,
        profilePicUrl: conv.citizen.contacts[0]?.profilePicUrl ?? null,
        platform: conv.citizen.contacts[0]?.platform ?? conv.channel.platform,
      },
      channel: conv.channel,
      tickets: conv.tickets,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content,
        direction: m.direction,
        senderType: m.senderType,
        isInternal: m.isInternal,
        isApproved: m.isApproved,
        isRead: m.isRead,
        forwardedToTicketId: m.forwardedToTicketId,
        forwardedToOpdId: m.forwardedToOpdId,
        forwardedToTicketNumber: m.forwardedToTicket?.ticketNumber ?? null,
        forwardedToOpdName: m.forwardedToOpd?.name ?? m.forwardedToTicket?.assignedOpd?.name ?? null,
        ticket: m.ticket && (auth.role !== "OPD" || m.ticket.status !== "ON_HOLD")
          ? {
            id: m.ticket.id,
            ticketNumber: m.ticket.ticketNumber,
            status: m.ticket.status,
            urgency: m.ticket.urgency,
            type: m.ticket.type,
            assignedOpd: m.ticket.assignedOpd,
          }
          : null,
        at: m.sentAt ?? m.createdAt,
        sender: m.senderUser
          ? {
            id: m.senderUser.id,
            name: m.senderUser.name,
            role: m.senderUser.role,
            opdName: m.senderUser.opd?.name ?? null,
          }
          : null,
        attachments: m.attachments,
        approval: m.approval
          ? { verdict: m.approval.verdict, reason: m.approval.reason }
          : null,
        replyTo: m.replyTo
          ? {
              id: m.replyTo.id,
              content: m.replyTo.content,
              senderName: m.replyTo.senderUser?.name ?? (m.replyTo.senderType === "WARGA" ? conv.citizen.displayName : "System"),
            }
          : null,
      })),
    });
  } catch (err) {
    console.error("[GET /api/inbox/[ticketId]] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
