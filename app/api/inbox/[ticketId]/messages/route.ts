import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const IG_GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION ?? "v25.0";

async function sendInstagramDM(opts: {
  accessToken: string;
  recipientPsid: string;
  text: string;
}) {
  const res = await fetch(
    `https://graph.instagram.com/${IG_GRAPH_VERSION}/me/messages?access_token=${encodeURIComponent(
      opts.accessToken
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: opts.recipientPsid },
        message: { text: opts.text },
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Instagram send failed (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return data as { message_id?: string; recipient_id?: string };
}

// Route param is `ticketId` historically; it identifies a Conversation.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId } = await params;
  const body = await req.json().catch(() => ({}));
  const content: string = (body?.content ?? "").toString().trim();
  const isInternal: boolean = Boolean(body?.isInternal);

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      channel: true,
      citizen: { include: { contacts: true } },
    },
  });
  if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const senderType = auth.role === "ADMIN" ? "ADMIN" : "OPD";
  const now = new Date();

  if (isInternal) {
    const msg = await prisma.message.create({
      data: {
        content,
        senderType,
        direction: "OUTBOUND",
        isInternal: true,
        isApproved: true,
        conversationId: conv.id,
        senderUserId: auth.userId,
        sentAt: now,
      },
    });
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: now },
    });
    return NextResponse.json(msg, { status: 201 });
  }

  let deliveryError: string | null = null;

  if (conv.channel.platform === "INSTAGRAM") {
    const recipient = conv.citizen.contacts.find((c) => c.platform === "INSTAGRAM");
    if (!conv.channel.accessToken) {
      return NextResponse.json(
        { error: "Instagram channel is not connected (no access token)" },
        { status: 400 }
      );
    }
    if (!recipient) {
      return NextResponse.json(
        { error: "Citizen has no Instagram handle on record" },
        { status: 400 }
      );
    }

    try {
      await sendInstagramDM({
        accessToken: conv.channel.accessToken,
        recipientPsid: recipient.handle,
        text: content,
      });
    } catch (err) {
      console.error("[Instagram DM send]", err);
      deliveryError = err instanceof Error ? err.message : "Unknown error";
    }
  } else {
    deliveryError = `Outbound delivery for ${conv.channel.platform} is not implemented yet`;
  }

  const msg = await prisma.message.create({
    data: {
      content,
      senderType,
      direction: "OUTBOUND",
      isInternal: false,
      isApproved: true,
      conversationId: conv.id,
      senderUserId: auth.userId,
      sentAt: now,
    },
  });

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: now },
  });

  return NextResponse.json(
    { ...msg, deliveryError },
    { status: deliveryError ? 207 : 201 }
  );
}
