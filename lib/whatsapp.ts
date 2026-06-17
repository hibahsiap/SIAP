// Outbound delivery via Meta WhatsApp Cloud API.
// Mirrors lib/instagram.ts. Endpoint is graph.facebook.com (NOT graph.instagram.com).
// Channel.accountId holds the Phone Number ID; Channel.accessToken holds the token.

const WA_GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v25.0";

type SendResult = { message_id?: string; recipient_id?: string };

async function postToWa(
  phoneNumberId: string,
  accessToken: string,
  message: Record<string, unknown>
): Promise<SendResult> {
  const res = await fetch(
    `https://graph.facebook.com/${WA_GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        ...message,
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`WhatsApp send failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return {
    message_id: data?.messages?.[0]?.id,
    recipient_id: data?.contacts?.[0]?.wa_id,
  };
}

export async function sendWhatsappText(opts: {
  phoneNumberId: string;
  accessToken: string;
  recipientWaId: string;
  text: string;
}) {
  return postToWa(opts.phoneNumberId, opts.accessToken, {
    to: opts.recipientWaId,
    type: "text",
    text: { preview_url: false, body: opts.text },
  });
}

export type WhatsappMediaType = "image" | "video" | "audio" | "document";

// WhatsApp uses "document" for generic files; captions are only valid on
// image/video/document (not audio).
export function waMediaTypeFromMime(mime: string | undefined): WhatsappMediaType {
  if (mime?.startsWith("image/")) return "image";
  if (mime?.startsWith("video/")) return "video";
  if (mime?.startsWith("audio/")) return "audio";
  return "document";
}

// The media URL must be publicly reachable — caller uploads to Storage first.
export async function sendWhatsappMedia(opts: {
  phoneNumberId: string;
  accessToken: string;
  recipientWaId: string;
  type: WhatsappMediaType;
  url: string;
  caption?: string;
  fileName?: string;
}) {
  const mediaObj: Record<string, unknown> = { link: opts.url };
  if (opts.caption && opts.type !== "audio") mediaObj.caption = opts.caption;
  if (opts.type === "document" && opts.fileName) mediaObj.filename = opts.fileName;

  return postToWa(opts.phoneNumberId, opts.accessToken, {
    to: opts.recipientWaId,
    type: opts.type,
    [opts.type]: mediaObj,
  });
}
