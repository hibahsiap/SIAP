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

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      citizen: {
        include: {
          contacts: { select: { platform: true, handle: true, username: true, profilePicUrl: true } },
        },
      },
      channel: { select: { id: true, platform: true, accountHandle: true } },
      ticket: {
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          priority: true,
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
              opd: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!conv) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
    ticket: conv.ticket,
    messages: conv.messages.map((m) => ({
      id: m.id,
      content: m.content,
      direction: m.direction,
      senderType: m.senderType,
      isInternal: m.isInternal,
      isApproved: m.isApproved,
      at: m.sentAt ?? m.createdAt,
      sender: m.senderUser
        ? {
            id: m.senderUser.id,
            name: m.senderUser.name,
            role: m.senderUser.role,
            opdName: m.senderUser.opd?.name ?? null,
          }
        : null,
    })),
  });
}
