const IG_GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION ?? "v25.0";

type SendResult = { message_id?: string; recipient_id?: string };

async function postToIg(accessToken: string, body: unknown): Promise<SendResult> {
  const res = await fetch(
    `https://graph.instagram.com/${IG_GRAPH_VERSION}/me/messages?access_token=${encodeURIComponent(
      accessToken
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Instagram send failed (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return data as SendResult;
}

export async function sendInstagramDM(opts: {
  accessToken: string;
  recipientPsid: string;
  text: string;
}) {
  return postToIg(opts.accessToken, {
    recipient: { id: opts.recipientPsid },
    message: { text: opts.text },
  });
}

// Instagram only accepts ONE attachment per message and the URL must be publicly
// reachable. Caller is responsible for uploading to Storage first.
export async function sendInstagramAttachment(opts: {
  accessToken: string;
  recipientPsid: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
}) {
  return postToIg(opts.accessToken, {
    recipient: { id: opts.recipientPsid },
    message: {
      attachment: {
        type: opts.type,
        payload: { url: opts.url, is_reusable: false },
      },
    },
  });
}
