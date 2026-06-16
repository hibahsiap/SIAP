import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ChannelPlatform, Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const platformParam = searchParams.get("platform");
  const unreadOnly = searchParams.get("unread") === "true";
  const search = searchParams.get("search")?.trim();
  const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";

  let opdFilter: Prisma.ConversationWhereInput = {};
  let opdTicketIds: Set<string> | null = null;
  let opdId: string | null = null;
  if (auth.role === "OPD") {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { opdId: true },
    });
    if (!user?.opdId) return NextResponse.json([], { status: 200 });
    opdId = user.opdId;
    opdFilter = {
      OR: [
        { tickets: { some: { assignedOpdId: user.opdId, status: { not: "ON_HOLD" } } } },
        { messages: { some: { forwardedToOpdId: user.opdId } } }
      ]
    };
    const opdTickets = await prisma.ticket.findMany({
      where: { assignedOpdId: user.opdId, status: { not: "ON_HOLD" } },
      select: { id: true },
    });
    opdTicketIds = new Set(opdTickets.map((t) => t.id));
  }

  const where: Prisma.ConversationWhereInput = { ...opdFilter };

  if (platformParam && platformParam !== "all") {
    const platform = platformParam.toUpperCase() as ChannelPlatform;
    if (["WHATSAPP", "INSTAGRAM", "FACEBOOK"].includes(platform)) {
      where.channel = { platform };
    }
  }

  if (search) {
    where.OR = [
      { citizen: { displayName: { contains: search, mode: "insensitive" } } },
      { messages: { some: { content: { contains: search, mode: "insensitive" } } } },
    ];
  }

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      citizen: {
        select: {
          id: true,
          displayName: true,
          contacts: { select: { platform: true, handle: true, username: true, profilePicUrl: true } },
        },
      },
      channel: { select: { id: true, platform: true, accountHandle: true } },
      _count: {
        select: opdId
          ? { tickets: { where: { assignedOpdId: opdId } } }
          : { tickets: true },
      },
      messages: {
        orderBy: [{ sentAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          content: true,
          direction: true,
          senderType: true,
          createdAt: true,
          sentAt: true,
          forwardedToTicketId: true,
          forwardedToOpdId: true,
          senderUser: { select: { opdId: true } },
          attachments: { select: { mimeType: true } },
          isRead: true,
        },
      },
    },
    orderBy: { lastMessageAt: sort },
    take: 100,
  });

  const result = conversations
    .map((c) => {
      const visibleMessages = opdTicketIds
        ? c.messages.filter(
          (m) =>
            (m.forwardedToTicketId !== null && opdTicketIds!.has(m.forwardedToTicketId)) ||
            (m.forwardedToOpdId === opdId) ||
            (m.direction === "OUTBOUND" && m.senderUser?.opdId === opdId)
        )
        : c.messages;
      const last = visibleMessages[0];
      // For OPD, the conversation's effective recency is the latest message THEY are
      // allowed to see — not the global lastMessageAt, which would surface activity
      // (admin replies, unrelated citizen messages) the OPD never receives.
      const effectiveLastAt = last
        ? (last.sentAt ?? last.createdAt)
        : c.lastMessageAt;

      // Unread count is exactly the number of unread inbound messages they can see
      const unreadCount = visibleMessages.filter((m) => m.direction === "INBOUND" && !m.isRead).length;

      return {
        id: c.id,
        citizen: {
          id: c.citizen.id,
          name: c.citizen.displayName,
          handle: c.citizen.contacts[0]?.handle ?? null,
          username: c.citizen.contacts[0]?.username ?? null,
          profilePicUrl: c.citizen.contacts[0]?.profilePicUrl ?? null,
          platform: c.citizen.contacts[0]?.platform ?? c.channel.platform,
        },
        channel: c.channel,
        ticketCount: c._count.tickets,
        lastMessage: last
          ? {
            content: last.content,
            direction: last.direction,
            senderType: last.senderType,
            at: last.sentAt ?? last.createdAt,
            hasAttachment: last.attachments.length > 0,
          }
          : null,
        unreadCount,
        lastMessageAt: opdTicketIds ? effectiveLastAt : c.lastMessageAt,
      };
    })
    .filter((c) => {
      // OPD: drop conversations with nothing they're allowed to see.
      if (opdTicketIds && !c.lastMessage) return false;
      return unreadOnly ? c.unreadCount > 0 : true;
    })
    .sort((a, b) => {
      if (!opdTicketIds) return 0; // Prisma already sorted for admin
      const at = new Date(a.lastMessageAt).getTime();
      const bt = new Date(b.lastMessageAt).getTime();
      return sort === "asc" ? at - bt : bt - at;
    });

  return NextResponse.json(result);
}
