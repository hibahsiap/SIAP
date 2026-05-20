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
  if (auth.role === "OPD") {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { opdId: true },
    });
    if (!user?.opdId) return NextResponse.json([], { status: 200 });
    opdFilter = { tickets: { some: { assignedOpdId: user.opdId } } };
    const opdTickets = await prisma.ticket.findMany({
      where: { assignedOpdId: user.opdId },
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
      _count: { select: { tickets: true } },
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
            (m) => m.forwardedToTicketId !== null && opdTicketIds!.has(m.forwardedToTicketId)
          )
        : c.messages;
      const last = visibleMessages[0];
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
            }
          : null,
        unread: last?.direction === "INBOUND",
        lastMessageAt: c.lastMessageAt,
      };
    })
    .filter((c) => (unreadOnly ? c.unread : true));

  return NextResponse.json(result);
}
