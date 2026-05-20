const IG_GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION ?? "v25.0";

export async function sendInstagramDM(opts: {
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
