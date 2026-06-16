import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { sendInstagramDM, sendInstagramAttachment } from "@/lib/instagram";
import { sendWhatsappText, sendWhatsappMedia, waMediaTypeFromMime } from "@/lib/whatsapp";

// Route param is `ticketId` historically; it identifies a Conversation.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ticketId: conversationId } = await params;
  try {
    const body = await req.json().catch(() => ({}));
  const content: string = (body?.content ?? "").toString().trim();
  const isInternal: boolean = Boolean(body?.isInternal);
  const attachment: {
    url?: string;
    mimeType?: string;
    fileName?: string;
    sizeBytes?: number;
  } | null = body?.attachment && typeof body.attachment === "object" ? body.attachment : null;

  if (!content && !attachment?.url) {
    return NextResponse.json({ error: "Content or attachment is required" }, { status: 400 });
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

  // Helper: persist Attachment row tied to the freshly-created message.
  const linkAttachment = async (messageId: string) => {
    if (!attachment?.url) return;
    await prisma.attachment.create({
      data: {
        url: attachment.url,
        fileName: attachment.fileName ?? "upload",
        mimeType: attachment.mimeType ?? "application/octet-stream",
        sizeBytes: attachment.sizeBytes ?? 0,
        messageId,
        uploadedById: auth.userId,
      },
    });
  };

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
    await linkAttachment(msg.id);
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: now },
    });
    return NextResponse.json(msg, { status: 201 });
  }

  // OPD messages need admin approval before delivery to citizen
  if (senderType === "OPD") {
    const msg = await prisma.message.create({
      data: {
        content,
        senderType,
        direction: "OUTBOUND",
        isInternal: false,
        isApproved: false,
        conversationId: conv.id,
        senderUserId: auth.userId,
        sentAt: now,
      },
    });
    await linkAttachment(msg.id);
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: now },
    });
    return NextResponse.json(msg, { status: 201 });
  }

  let deliveryError: string | null = null;
  let externalId: string | null = null;

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
      // Instagram requires one API call per attachment, separate from the text.
      // Send the image first (if any) so the citizen sees it above the caption.
      if (attachment?.url) {
        const igType = attachment.mimeType?.startsWith("image/")
          ? "image"
          : attachment.mimeType?.startsWith("video/")
          ? "video"
          : attachment.mimeType?.startsWith("audio/")
          ? "audio"
          : "file";
        await sendInstagramAttachment({
          accessToken: conv.channel.accessToken,
          recipientPsid: recipient.handle,
          type: igType,
          url: attachment.url,
        });
      }
      if (content) {
        const res = await sendInstagramDM({
          accessToken: conv.channel.accessToken,
          recipientPsid: recipient.handle,
          text: content,
        });
        if (res.message_id) {
          externalId = res.message_id;
        }
      }
    } catch (err) {
      console.error("[Instagram DM send]", err);
      deliveryError = err instanceof Error ? err.message : "Unknown error";
    }
  } else if (conv.channel.platform === "WHATSAPP") {
    const recipient = conv.citizen.contacts.find((c) => c.platform === "WHATSAPP");
    if (!conv.channel.accessToken || !conv.channel.accountId) {
      return NextResponse.json(
        { error: "WhatsApp channel is not connected (missing access token or phone number ID)" },
        { status: 400 }
      );
    }
    if (!recipient) {
      return NextResponse.json(
        { error: "Citizen has no WhatsApp number on record" },
        { status: 400 }
      );
    }

    try {
      if (attachment?.url) {
        // WhatsApp media (image/video/document) can carry the text as a caption,
        // so we avoid a second message. Audio has no caption → send text after.
        const waType = waMediaTypeFromMime(attachment.mimeType);
        const captionSupported = waType !== "audio";
        const mediaRes = await sendWhatsappMedia({
          phoneNumberId: conv.channel.accountId,
          accessToken: conv.channel.accessToken,
          recipientWaId: recipient.handle,
          type: waType,
          url: attachment.url,
          caption: captionSupported && content ? content : undefined,
          fileName: attachment.fileName,
        });
        externalId = mediaRes.message_id ?? null;
        if (content && !captionSupported) {
          const textRes = await sendWhatsappText({
            phoneNumberId: conv.channel.accountId,
            accessToken: conv.channel.accessToken,
            recipientWaId: recipient.handle,
            text: content,
          });
          externalId = textRes.message_id ?? externalId;
        }
      } else if (content) {
        const textRes = await sendWhatsappText({
          phoneNumberId: conv.channel.accountId,
          accessToken: conv.channel.accessToken,
          recipientWaId: recipient.handle,
          text: content,
        });
        externalId = textRes.message_id ?? null;
      }
    } catch (err) {
      console.error("[WhatsApp send]", err);
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
      externalId,
    },
  });

  await linkAttachment(msg.id);

  await prisma.conversation.update({
    where: { id: conv.id },
    data: { lastMessageAt: now },
  });

  return NextResponse.json(
    { ...msg, deliveryError },
    { status: deliveryError ? 207 : 201 }
  );
  } catch (err) {
    console.error("[POST /api/inbox/[ticketId]/messages] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
