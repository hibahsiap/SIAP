import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WELCOME_TEMPLATE = `Halo! 👋 Selamat datang di layanan aspirasi publik Diskominfo Karanganyar.

Kami siap membantu Anda. Silakan pilih jenis pesan dengan mengetik salah satu perintah berikut:

/pengaduan — Sampaikan keluhan atau masalah
/pertanyaan — Ajukan pertanyaan
/saran — Berikan saran atau masukan

Tim kami akan segera menindaklanjuti pesan Anda. Terima kasih! 🙏`

const COMMAND_TEMPLATES: Record<string, string> = {
  '/pengaduan': `Terima kasih telah memilih Pengaduan 📋

Silakan copy dan isi form berikut, lalu kirimkan kembali:

[FORM PENGADUAN]
Nama lengkap:
NIK:
Alamat:
Uraian pengaduan:
Lokasi kejadian:

Foto/bukti pendukung dapat dikirim setelah mengirim form ini.`,

  '/pertanyaan': `Terima kasih telah memilih Pertanyaan ❓

Silakan copy dan isi form berikut, lalu kirimkan kembali:

[FORM PERTANYAAN]
Nama lengkap:
Topik pertanyaan:
Pertanyaan:`,

  '/saran': `Terima kasih telah memilih Saran 💡

Silakan copy dan isi form berikut, lalu kirimkan kembali:

[FORM SARAN]
Nama lengkap:
Bidang/layanan:
Saran:`,
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const WA_GRAPH_VERSION = Deno.env.get('WHATSAPP_GRAPH_VERSION') ?? 'v25.0'

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false
  const secret = Deno.env.get('WHATSAPP_APP_SECRET')
  if (!secret) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = 'sha256=' + Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return signatureHeader === expected
}

// Sends a free-form text reply via WhatsApp Cloud API. Allowed because an
// inbound message from the citizen (re)opens the 24-hour service window.
async function sendAutoReply(opts: {
  supabase: ReturnType<typeof createClient>
  channel: { id: string; accountId: string | null; accessToken: string | null }
  conversationId: string
  recipientWaId: string
  messageText: string
  now: Date
}) {
  const { supabase, channel, conversationId, recipientWaId, messageText, now } = opts

  if (!channel.accessToken || !channel.accountId) return

  const { data: lastOutbound } = await supabase
    .from('Message')
    .select('createdAt')
    .eq('conversationId', conversationId)
    .eq('direction', 'OUTBOUND')
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastOutboundAt = lastOutbound ? new Date(lastOutbound.createdAt) : null
  const isFirst24h = !lastOutboundAt || (now.getTime() - lastOutboundAt.getTime() > 24 * 60 * 60 * 1000)

  let replyText: string | null = null
  if (isFirst24h) {
    replyText = WELCOME_TEMPLATE
  } else {
    const cmd = messageText.trim().toLowerCase()
    replyText = COMMAND_TEMPLATES[cmd] ?? null
  }

  if (!replyText) return

  const sendRes = await fetch(
    `https://graph.facebook.com/${WA_GRAPH_VERSION}/${channel.accountId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channel.accessToken}`,
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientWaId,
        type: 'text',
        text: { preview_url: false, body: replyText },
      }),
    }
  )

  if (!sendRes.ok) {
    const errText = await sendRes.text()
    console.warn(`[AutoReply] Failed to send: ${sendRes.status} ${errText}`)
    return
  }

  let externalId: string | null = null
  try {
    const sendData = await sendRes.json()
    externalId = sendData?.messages?.[0]?.id ?? null
  } catch (err) {
    console.warn('[AutoReply] Failed to parse send response:', err)
  }

  const { error: replyErr } = await supabase.from('Message').insert({
    id: crypto.randomUUID(),
    content: replyText,
    senderType: 'ADMIN',
    direction: 'OUTBOUND',
    conversationId,
    sentAt: now,
    isInternal: false,
    isApproved: true,
    isRead: true,
    updatedAt: now,
    externalId,
  })

  if (replyErr) {
    console.error('[AutoReply] Failed to save reply to DB:', JSON.stringify(replyErr))
  } else {
    console.log(`[AutoReply] Sent ${isFirst24h ? 'welcome' : messageText.trim()} to ${recipientWaId}`)
  }
}

function detectTemplateType(text: string): "COMPLAINT" | "QUESTION" | "FEEDBACK" | null {
  const t = text.trim();
  if (t.includes("[FORM PENGADUAN]")) return "COMPLAINT";
  if (t.includes("[FORM PERTANYAAN]")) return "QUESTION";
  if (t.includes("[FORM SARAN]")) return "FEEDBACK";
  return null;
}

async function classifyViaGroq(content: string, apiKey: string, categoryList: string) {
  const systemPrompt = `Kamu adalah asisten klasifikasi pengaduan publik untuk pemerintah daerah Indonesia.
Tugasmu: analisis pesan warga dan kembalikan klasifikasi dalam format JSON.

=== ATURAN TYPE ===
- COMPLAINT: keluhan, laporan masalah, pengaduan
- QUESTION: pertanyaan, permintaan informasi atau prosedur
- FEEDBACK: saran, masukan, apresiasi

=== ATURAN URGENCY ===
- CRITICAL: mengancam keselamatan jiwa, bencana aktif, darurat
- HIGH: masalah serius yang mengganggu banyak orang atau perlu ditangani segera
- MEDIUM: masalah umum yang perlu ditangani dalam waktu normal
- LOW: pertanyaan, saran ringan, informasi

=== KATEGORI YANG TERSEDIA ===
Pilih SATU nama kategori yang PALING SESUAI dari daftar berikut. Jangan mengarang nama kategori baru.
WAJIB diisi — selalu pilih yang paling mendekati, jangan pernah null.

${categoryList}

Panduan pemilihan kategori:
- Jalan berlubang, drainase, jembatan, trotoar → "Jalan dan Infrastruktur"
- Sampah, kebersihan lingkungan, TPS → "Sampah dan Kebersihan"
- Banjir, longsor, gempa, bencana alam → "Banjir dan Bencana"
- Sekolah, guru, kurikulum, beasiswa → "Pendidikan"
- Puskesmas, rumah sakit, obat, vaksin → "Kesehatan"
- KTP, KK, akta, dukcapil, dokumen kependudukan → "Kependudukan"
- Bansos, PKH, sembako, BPNT, subsidi → "Bantuan Sosial"
- Angkutan umum, parkir, kemacetan, terminal → "Transportasi"
- Internet, wifi, aplikasi pemerintah, TIK → "Teknologi dan Internet"
- Pasar, UMKM, izin usaha, PKL → "Perdagangan dan UMKM"

=== FORMAT OUTPUT ===
Kembalikan HANYA objek JSON valid, tanpa markdown, tanpa komentar, tanpa teks lain:
{"title":"judul singkat maksimal 80 karakter","description":"ringkasan 1-2 kalimat isi pesan","type":"COMPLAINT|FEEDBACK|QUESTION","urgency":"LOW|MEDIUM|HIGH|CRITICAL","location":"nama lokasi jika disebutkan, atau null","category":"nama kategori persis seperti di daftar (WAJIB diisi)"}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Pesan warga: ${content}` },
      ],
      temperature: 0.2,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  const result = JSON.parse(cleaned);

  return {
    title: (result.title as string) ?? null,
    description: (result.description as string) ?? null,
    type: (result.type as string) ?? null,
    urgency: (result.urgency as string) ?? null,
    location: (result.location as string) ?? null,
    category: (result.category as string) ?? null,
  };
}

async function handleAutoTicket(opts: {
  supabase: ReturnType<typeof createClient>;
  messageId: string;
  conversationId: string;
  messageText: string;
  citizenId: string;
  channelId: string;
  groqApiKey: string;
  now: Date;
}) {
  const { supabase, messageId, conversationId, messageText, citizenId, channelId, groqApiKey, now } = opts;

  const templateType = detectTemplateType(messageText);
  if (!templateType) return;

  console.log(`[AutoTicket] Template detected: ${templateType}`);

  const { data: dbCategories } = await supabase
    .from("Category")
    .select("id, name, defaultOpdId");

  const catMap = new Map<string, { id: string; defaultOpdId: string | null }>();
  for (const c of dbCategories ?? []) {
    catMap.set(c.name.toLowerCase(), { id: c.id, defaultOpdId: c.defaultOpdId });
  }
  const categoryList = dbCategories?.length
    ? dbCategories.map((c) => c.name).join(", ")
    : "Jalan dan Infrastruktur, Sampah dan Kebersihan, Banjir dan Bencana, Pendidikan, Kesehatan, Kependudukan, Bantuan Sosial, Transportasi, Teknologi dan Internet, Perdagangan dan UMKM";

  let aiResult: { title?: string | null; description?: string | null; type?: string | null; urgency?: string | null; location?: string | null; category?: string | null } = {};
  try {
    aiResult = await classifyViaGroq(messageText, groqApiKey, categoryList);
    console.log(`[AutoTicket] AI classified: type=${aiResult.type} category=${aiResult.category}`);
  } catch (err) {
    console.warn(`[AutoTicket] AI classification failed, using defaults:`, err);
  }

  let categoryId: string | null = null;
  let opdId: string | null = null;
  if (aiResult.category) {
    const lower = aiResult.category.toLowerCase();
    const match = catMap.get(lower);
    if (match) {
      categoryId = match.id;
      opdId = match.defaultOpdId ?? null;
    } else {
      for (const [key, val] of catMap) {
        if (key.includes(lower) || lower.includes(key)) {
          categoryId = val.id;
          opdId = val.defaultOpdId ?? null;
          break;
        }
      }
    }
  }

  const { count } = await supabase
    .from("Ticket")
    .select("id", { count: "exact", head: true });
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const ticketNumber = `TKT-${datePart}-${String((count ?? 0) + 1).padStart(5, "0")}`;

  const ticketId = crypto.randomUUID();
  const { error: ticketErr } = await supabase.from("Ticket").insert({
    id: ticketId,
    ticketNumber,
    title: aiResult.title ?? messageText.slice(0, 80),
    description: aiResult.description ?? messageText,
    status: "ON_HOLD",
    urgency: aiResult.urgency ?? null,
    type: templateType,
    citizenId,
    channelId,
    conversationId,
    categoryId,
    assignedOpdId: opdId,
    location: aiResult.location ?? null,
    updatedAt: now,
  });

  if (ticketErr) {
    console.error(`[AutoTicket] Failed to create ticket:`, JSON.stringify(ticketErr));
    return;
  }

  const { error: msgErr } = await supabase
    .from("Message")
    .update({ ticketId, forwardedToTicketId: ticketId })
    .eq("id", messageId);

  if (msgErr) {
    console.error(`[AutoTicket] Failed to link message to ticket:`, JSON.stringify(msgErr));
  }

  console.log(`[AutoTicket] Created ON_HOLD ticket ${ticketNumber} linked to message ${messageId}`);
}

// Two-step media download per WhatsApp Cloud API: resolve the media ID to a
// short-lived URL, then fetch the binary with the Bearer token.
async function downloadWaMedia(
  mediaId: string,
  accessToken: string
): Promise<{ bytes: Uint8Array; mime: string } | null> {
  try {
    const metaRes = await fetch(
      `https://graph.facebook.com/${WA_GRAPH_VERSION}/${mediaId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!metaRes.ok) {
      console.warn(`[Webhook] Media meta fetch failed (${metaRes.status}) for ${mediaId}`)
      return null
    }
    const meta = await metaRes.json()
    const mediaUrl: string | undefined = meta?.url
    if (!mediaUrl) return null

    const fileRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!fileRes.ok) {
      console.warn(`[Webhook] Media binary fetch failed (${fileRes.status}) for ${mediaId}`)
      return null
    }
    const bytes = new Uint8Array(await fileRes.arrayBuffer())
    const mime = fileRes.headers.get('content-type')
      ?? meta?.mime_type
      ?? 'application/octet-stream'
    return { bytes, mime }
  } catch (err) {
    console.warn(`[Webhook] Media download error for ${mediaId}:`, err)
    return null
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // GET — Meta webhook verification challenge
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('WHATSAPP_VERIFY_TOKEN')) {
      return new Response(challenge ?? '', { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  // POST — Terima pesan masuk dari Meta
  if (req.method === 'POST') {
    console.log('[Webhook] Received POST')
    const rawBody = await req.text()

    const valid = await verifySignature(rawBody, req.headers.get('X-Hub-Signature-256'))
    if (!valid) {
      console.warn('[Webhook] Signature mismatch — WHATSAPP_APP_SECRET mungkin belum di-set di Supabase secrets')
    }

    try {
      const body = JSON.parse(rawBody)

      if (body.object !== 'whatsapp_business_account') {
        return new Response('Invalid object', { status: 400 })
      }

      const { data: channel } = await supabase
        .from('Channel')
        .select('id, accessToken, accountId')
        .eq('platform', 'WHATSAPP')
        .single()

      if (!channel) return new Response(JSON.stringify({ status: 'no channel' }), { status: 200 })

      const groqApiKey = Deno.env.get('GROQ_API_KEY') ?? ''

      for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
          if (change.field !== 'messages') continue

          const value = change.value ?? {}
          const messages = value.messages ?? []
          // statuses (delivery/read receipts) arrive without a messages array — skip.
          if (messages.length === 0) {
            console.log('[Webhook] Skip: no messages (likely a status update)')
            continue
          }

          // Build a name lookup from the contacts array (keyed by wa_id).
          const contactNames = new Map<string, string>()
          for (const c of value.contacts ?? []) {
            if (c.wa_id && c.profile?.name) contactNames.set(c.wa_id, c.profile.name)
          }

          for (const msg of messages) {
            const senderWaId: string = msg.from ?? ''
            if (!senderWaId) {
              console.log('[Webhook] Skip: no msg.from')
              continue
            }

            const msgType: string = msg.type ?? 'text'
            const mediaInfo = (msgType !== 'text' && msgType !== 'unsupported')
              ? msg[msgType]
              : null
            const messageText: string =
              msgType === 'text'
                ? (msg.text?.body ?? '')
                : (mediaInfo?.caption ?? '')

            console.log(`[Webhook] ${msgType} from ${senderWaId}: ${messageText.slice(0, 80)}`)

            // Find or create Citizen + CitizenContact by wa_id.
            const { data: contact, error: contactSelErr } = await supabase
              .from('CitizenContact')
              .select('citizenId')
              .eq('platform', 'WHATSAPP')
              .eq('handle', senderWaId)
              .maybeSingle()

            if (contactSelErr) {
              console.error('[Webhook] Failed to query CitizenContact:', JSON.stringify(contactSelErr))
              continue
            }

            const profileName = contactNames.get(senderWaId) ?? null
            let citizenId: string

            if (contact) {
              citizenId = contact.citizenId
              if (profileName) {
                await supabase
                  .from('Citizen')
                  .update({ displayName: profileName, updatedAt: new Date() })
                  .eq('id', citizenId)
              }
            } else {
              const displayName = profileName?.trim() || `+${senderWaId}`
              // Prisma's @default(uuid()) is client-side only; raw inserts must
              // supply the id explicitly or Postgres rejects the null.
              const newCitizenId = crypto.randomUUID()
              const { error: citizenErr } = await supabase
                .from('Citizen')
                .insert({ id: newCitizenId, displayName, updatedAt: new Date() })
              if (citizenErr) {
                console.error('[Webhook] Failed to insert Citizen:', JSON.stringify(citizenErr))
                continue
              }
              citizenId = newCitizenId

              const { error: contactErr } = await supabase.from('CitizenContact').insert({
                id: crypto.randomUUID(),
                platform: 'WHATSAPP',
                handle: senderWaId,
                username: null,
                profilePicUrl: null,
                citizenId,
              })
              if (contactErr) {
                console.error('[Webhook] Failed to insert CitizenContact:', JSON.stringify(contactErr))
                continue
              }
            }

            // Upsert Conversation (citizen × channel).
            const sentAt = msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date()
            const now = new Date()

            const { data: conv, error: convSelErr } = await supabase
              .from('Conversation')
              .select('id')
              .eq('citizenId', citizenId)
              .eq('channelId', channel.id)
              .maybeSingle()

            if (convSelErr) {
              console.error('[Webhook] Failed to query Conversation:', JSON.stringify(convSelErr))
              continue
            }

            let conversationId: string
            if (conv) {
              conversationId = conv.id
              await supabase
                .from('Conversation')
                .update({ lastMessageAt: sentAt, updatedAt: now })
                .eq('id', conversationId)
            } else {
              const { data: newConv, error: convInsErr } = await supabase
                .from('Conversation')
                .insert({
                  id: crypto.randomUUID(),
                  citizenId,
                  channelId: channel.id,
                  lastMessageAt: sentAt,
                  updatedAt: now,
                })
                .select('id')
                .single()
              if (convInsErr || !newConv) {
                console.error('[Webhook] Failed to insert Conversation:', JSON.stringify(convInsErr))
                continue
              }
              conversationId = newConv.id
            }

            // Dedup by WhatsApp message id (wamid).
            const externalId: string | null = msg.id ?? null
            if (externalId) {
              const { data: existingMsg } = await supabase
                .from('Message')
                .select('id')
                .eq('externalId', externalId)
                .maybeSingle()
              if (existingMsg) {
                console.log('[Webhook] Skip: inbound message already exists', externalId)
                continue
              }
            }

            // Download + store media BEFORE inserting the Message so realtime
            // clients never see an empty bubble while the upload is in-flight.
            const messageId = crypto.randomUUID()
            const preparedAttachments: Array<{
              id: string
              url: string
              fileName: string
              mimeType: string
              sizeBytes: number
              messageId: string
              uploadedAt: Date
            }> = []

            if (mediaInfo?.id && channel.accessToken) {
              const downloaded = await downloadWaMedia(mediaInfo.id, channel.accessToken)
              if (downloaded) {
                const ext = downloaded.mime.split('/')[1]?.split(';')[0] ?? 'bin'
                const fileName = mediaInfo.filename ?? `${crypto.randomUUID()}.${ext}`
                const path = `dm/${conversationId}/${crypto.randomUUID()}.${ext}`

                const { error: upErr } = await supabase.storage
                  .from('dm-media')
                  .upload(path, downloaded.bytes, { contentType: downloaded.mime, upsert: false })
                if (upErr) {
                  console.error('[Webhook] Storage upload failed:', JSON.stringify(upErr))
                } else {
                  const { data: pub } = supabase.storage.from('dm-media').getPublicUrl(path)
                  preparedAttachments.push({
                    id: crypto.randomUUID(),
                    url: pub.publicUrl,
                    fileName,
                    mimeType: downloaded.mime,
                    sizeBytes: downloaded.bytes.byteLength,
                    messageId,
                    uploadedAt: now,
                  })
                  console.log(`[Webhook] Prepared ${msgType} attachment ${fileName}`)
                }
              }
            }

            // Reply context (quoted message).
            const replyToWamid: string | null = msg.context?.id ?? null
            let replyToMessageId: string | null = null
            if (replyToWamid) {
              const { data: replyMsg } = await supabase
                .from('Message')
                .select('id')
                .eq('externalId', replyToWamid)
                .maybeSingle()
              if (replyMsg) replyToMessageId = replyMsg.id
            }

            const { error: msgErr } = await supabase.from('Message').insert({
              id: messageId,
              content: messageText,
              senderType: 'WARGA',
              direction: 'INBOUND',
              conversationId,
              sentAt,
              isInternal: false,
              isApproved: true,
              isRead: false,
              updatedAt: now,
              externalId,
              replyToMessageId,
            })
            if (msgErr) {
              console.error('[Webhook] Failed to insert Message:', JSON.stringify(msgErr))
              continue
            }

            if (preparedAttachments.length > 0) {
              const { error: attErr } = await supabase
                .from('Attachment')
                .insert(preparedAttachments)
              if (attErr) {
                console.error('[Webhook] Failed to insert Attachments batch:', JSON.stringify(attErr))
              } else {
                console.log(`[Webhook] Stored ${preparedAttachments.length} attachment(s) for message ${messageId}`)
              }
            }

            if (groqApiKey) {
              handleAutoTicket({
                supabase,
                messageId,
                conversationId,
                messageText: messageText || '',
                citizenId,
                channelId: channel.id,
                groqApiKey,
                now,
              }).catch((err) =>
                console.error('[Webhook] Auto ticket creation error:', err)
              )
            }

            await sendAutoReply({
              supabase,
              channel,
              conversationId,
              recipientWaId: senderWaId,
              messageText: messageText || '',
              now,
            })
          }
        }
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('[Webhook Error]', err)
      return new Response(JSON.stringify({ status: 'error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
