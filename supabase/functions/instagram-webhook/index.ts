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

async function verifySignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
  if (!signatureHeader) return false
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(Deno.env.get('INSTAGRAM_APP_SECRET')!),
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

async function sendAutoReply(opts: {
  supabase: ReturnType<typeof createClient>
  channel: { id: string; accountId: string | null; accessToken: string | null }
  conversationId: string
  senderId: string
  messageText: string
  igGraphVersion: string
  now: Date
}) {
  const { supabase, channel, conversationId, senderId, messageText, igGraphVersion, now } = opts

  if (!channel.accessToken || !channel.accountId) return

  // Cek last outbound message untuk anti-spam 24 jam
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

  // Kirim via Instagram Messaging API
  const sendRes = await fetch(
    `https://graph.instagram.com/${igGraphVersion}/${channel.accountId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: senderId },
        message: { text: replyText },
        access_token: channel.accessToken,
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
    if (sendData.message_id) {
      externalId = sendData.message_id
    }
  } catch (err) {
    console.warn('[AutoReply] Failed to parse send response:', err)
  }

  // Simpan auto-reply ke DB sebagai OUTBOUND agar terhitung di 24h check berikutnya
  const { error: replyErr } = await supabase.from('Message').insert({
    id: crypto.randomUUID(),
    content: replyText,
    senderType: 'ADMIN',
    direction: 'OUTBOUND',
    conversationId,
    sentAt: now,
    isInternal: false,
    isApproved: true,
    updatedAt: now,
    externalId,
  })

  if (replyErr) {
    console.error('[AutoReply] Failed to save reply to DB:', JSON.stringify(replyErr))
  } else {
    console.log(`[AutoReply] Sent ${isFirst24h ? 'welcome' : messageText.trim()} to ${senderId}`)
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

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)

  // GET — Meta webhook verification challenge
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === Deno.env.get('INSTAGRAM_VERIFY_TOKEN')) {
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
      console.warn('[Webhook] Signature mismatch — INSTAGRAM_APP_SECRET mungkin belum di-set di Supabase secrets')
    }

    try {
      const body = JSON.parse(rawBody)

      if (body.object !== 'instagram') {
        return new Response('Invalid object', { status: 400 })
      }

      const { data: channel } = await supabase
        .from('Channel')
        .select('id, accessToken, accountId')
        .eq('platform', 'INSTAGRAM')
        .single()

      if (!channel) return new Response(JSON.stringify({ status: 'no channel' }), { status: 200 })

      const igGraphVersion = Deno.env.get('INSTAGRAM_GRAPH_VERSION') ?? 'v25.0'

      async function fetchIgProfile(psid: string): Promise<{
        name?: string
        username?: string
        profilePicUrl?: string
      }> {
        if (!channel.accessToken) return {}
        try {
          const profileUrl =
            `https://graph.instagram.com/${igGraphVersion}/${psid}` +
            `?fields=name,username,profile_pic&access_token=${encodeURIComponent(channel.accessToken)}`
          const res = await fetch(profileUrl)
          if (!res.ok) {
            const errText = await res.text()
            console.warn(`[Webhook] Profile fetch failed for ${psid}: ${res.status} ${errText}`)
            return {}
          }
          const data = await res.json()
          return {
            name: data.name,
            username: data.username,
            profilePicUrl: data.profile_pic,
          }
        } catch (err) {
          console.warn(`[Webhook] Profile fetch error for ${psid}:`, err)
          return {}
        }
      }

      console.log(`[Webhook] Processing ${body.entry?.length ?? 0} entries`)

      for (const entry of body.entry ?? []) {
        const messagingEvents = entry.messaging ?? []
        console.log(`[Webhook] Entry ${entry.id} has ${messagingEvents.length} messaging event(s)`)

        // --- Direct Message ---
        for (const event of messagingEvents) {
          if (!event.message) {
            console.log('[Webhook] Skip: no message in event')
            continue
          }
          
          const isEcho = event.message.is_echo === true

          const senderId: string = isEcho ? (event.recipient?.id ?? '') : (event.sender?.id ?? '')
          if (!senderId) {
            console.log(`[Webhook] Skip: no ${isEcho ? 'recipient' : 'sender'}.id`)
            continue
          }
          const messageText: string = event.message.text ?? ''
          console.log(`[Webhook] ${isEcho ? 'Echo' : 'DM'} from ${senderId}: ${messageText.slice(0, 80)}`)

          // Cari CitizenContact berdasarkan PSID. maybeSingle = null saat 0 row, tanpa error palsu.
          const { data: contact, error: contactSelErr } = await supabase
            .from('CitizenContact')
            .select('citizenId, username, profilePicUrl')
            .eq('platform', 'INSTAGRAM')
            .eq('handle', senderId)
            .maybeSingle()

          if (contactSelErr) {
            console.error('[Webhook] Failed to query CitizenContact:', JSON.stringify(contactSelErr))
            continue
          }

          let citizenId: string

          if (contact) {
            citizenId = contact.citizenId

            const profile = await fetchIgProfile(senderId)
            const contactPatch: Record<string, string | null> = {}
            if (profile.username) contactPatch.username = profile.username
            if (profile.profilePicUrl) contactPatch.profilePicUrl = profile.profilePicUrl

            if (Object.keys(contactPatch).length > 0) {
              await supabase
                .from('CitizenContact')
                .update(contactPatch)
                .eq('platform', 'INSTAGRAM')
                .eq('handle', senderId)
            }

            if (profile.name) {
              await supabase
                .from('Citizen')
                .update({ displayName: profile.name, updatedAt: new Date() })
                .eq('id', citizenId)
            }
          } else {
            const profile = await fetchIgProfile(senderId)
            const displayName =
              profile.name?.trim() ||
              (profile.username ? `@${profile.username}` : 'Instagram User')

            const { data: newCitizen, error: citizenErr } = await supabase
              .from('Citizen')
              .insert({ displayName, updatedAt: new Date() })
              .select('id')
              .single()
            if (citizenErr || !newCitizen) {
              console.error('[Webhook] Failed to insert Citizen:', JSON.stringify(citizenErr))
              continue
            }
            citizenId = newCitizen.id

            const { error: contactErr } = await supabase.from('CitizenContact').insert({
              platform: 'INSTAGRAM',
              handle: senderId,
              username: profile.username ?? null,
              profilePicUrl: profile.profilePicUrl ?? null,
              citizenId,
            })
            if (contactErr) {
              console.error('[Webhook] Failed to insert CitizenContact:', JSON.stringify(contactErr))
              continue
            }
          }

          // Upsert Conversation (citizen × channel). Tickets are created manually by admin later.
          const sentAt = event.timestamp ? new Date(event.timestamp) : new Date()
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

          const externalId: string | null = event.message.mid ?? null

          // Handle echo deduplication and ID format mismatch (Project API vs Webhook)
          if (isEcho && externalId) {
            const timeLimit = new Date(sentAt.getTime() - 60000) // Within 60 seconds
            const { data: recentMsg } = await supabase
              .from('Message')
              .select('id, externalId')
              .eq('conversationId', conversationId)
              .eq('direction', 'OUTBOUND')
              .eq('content', messageText)
              .gte('sentAt', timeLimit.toISOString())
              .order('sentAt', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (recentMsg) {
              if (recentMsg.externalId !== externalId) {
                // Update to Webhook format so future reply_to.mid matches
                await supabase.from('Message').update({ externalId }).eq('id', recentMsg.id)
                console.log(`[Webhook] Updated existing OUTBOUND message externalId to match webhook format`)
              }
              console.log('[Webhook] Skip: echo message already handled by project')
              continue
            }
          } else if (externalId) {
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

          // PROSES ATTACHMENT DULU sebelum insert Message, supaya begitu realtime
          // mengirim event Message INSERT ke client, semua row Attachment sudah ada
          // di DB. Tanpa ini, client sempat menampilkan bubble kosong selama
          // beberapa ratus ms sampai second saat IG-fetch + storage-upload berjalan.
          const messageId = crypto.randomUUID()
          const rawAttachments = event.message.attachments ?? []
          const preparedAttachments: Array<{
            id: string
            url: string
            fileName: string
            mimeType: string
            sizeBytes: number
            messageId: string
            uploadedAt: Date
          }> = []

          for (const att of rawAttachments) {
            const igUrl: string | undefined = att.payload?.url
            if (!igUrl) continue
            const kind: string = att.type ?? 'file'
            try {
              const fileRes = await fetch(igUrl)
              if (!fileRes.ok) {
                console.warn(`[Webhook] Attachment fetch failed (${fileRes.status}) for ${igUrl}`)
                continue
              }
              const bytes = new Uint8Array(await fileRes.arrayBuffer())
              const mime = fileRes.headers.get('content-type')
                ?? (kind === 'image' ? 'image/jpeg' : 'application/octet-stream')
              const ext = mime.split('/')[1]?.split(';')[0] ?? 'bin'
              const fileName = `${crypto.randomUUID()}.${ext}`
              const path = `dm/${conversationId}/${fileName}`

              const { error: upErr } = await supabase.storage
                .from('dm-media')
                .upload(path, bytes, { contentType: mime, upsert: false })
              if (upErr) {
                console.error('[Webhook] Storage upload failed:', JSON.stringify(upErr))
                continue
              }

              const { data: pub } = supabase.storage.from('dm-media').getPublicUrl(path)

              preparedAttachments.push({
                id: crypto.randomUUID(),
                url: pub.publicUrl,
                fileName,
                mimeType: mime,
                sizeBytes: bytes.byteLength,
                messageId,
                uploadedAt: now,
              })
              console.log(`[Webhook] Prepared ${kind} attachment ${fileName}`)
            } catch (err) {
              console.warn(`[Webhook] Attachment processing error:`, err)
            }
          }

          // Extract reply_to context
          const replyToMid: string | null = event.message.reply_to?.mid ?? null
          let replyToMessageId: string | null = null

          if (replyToMid) {
            const { data: replyMsg } = await supabase
              .from('Message')
              .select('id')
              .eq('externalId', replyToMid)
              .maybeSingle()
            if (replyMsg) replyToMessageId = replyMsg.id
          }

          // Setelah semua attachment ter-upload ke Storage, insert Message
          // (yang memicu realtime), lalu langsung insert semua Attachment row.
          const { error: msgErr } = await supabase.from('Message').insert({
            id: messageId,
            content: messageText,
            senderType: isEcho ? 'ADMIN' : 'WARGA',
            direction: isEcho ? 'OUTBOUND' : 'INBOUND',
            conversationId,
            sentAt,
            isInternal: false,
            isApproved: true,
            isRead: isEcho ? true : false,
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

          if (!isEcho) {
            const groqApiKey = Deno.env.get("GROQ_API_KEY") ?? "";
            if (groqApiKey) {
              handleAutoTicket({
                supabase,
                messageId,
                conversationId,
                messageText: messageText || "",
                citizenId,
                channelId: channel.id,
                groqApiKey,
                now,
              }).catch((err) =>
                console.error("[Webhook] Auto ticket creation error:", err)
              );
            }

            await sendAutoReply({
              supabase,
              channel,
              conversationId,
              senderId,
              messageText: messageText || '',
              igGraphVersion,
              now,
            })
          }
        }

        // --- Comment & Mention ---
        for (const change of entry.changes ?? []) {
          const field: string = change.field
          if (field !== 'comments' && field !== 'mentions') continue

          const val = change.value
          const commentId: string = val.id
          const username: string = val.from?.username ?? val.from?.id ?? 'unknown'
          const content: string = val.text ?? '[no text]'
          const mediaId: string = val.media?.id ?? ''
          const capturedAt = val.timestamp ? new Date(val.timestamp * 1000) : new Date()
          const interactionType = field === 'mentions' ? 'MENTION' : 'COMMENT'

          const { data: existing } = await supabase
            .from('SocialInteraction')
            .select('id')
            .eq('channelId', channel.id)
            .eq('externalId', commentId)
            .maybeSingle()

          if (existing) continue

          // Fetch permalink dari Graph API karena media.id adalah numeric ID,
          // bukan shortcode yang dipakai di URL publik Instagram
          let permalink: string | null = null
          if (mediaId && channel.accessToken) {
            try {
              const mediaRes = await fetch(
                `https://graph.instagram.com/${igGraphVersion}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(channel.accessToken)}`
              )
              if (mediaRes.ok) {
                const mediaData = await mediaRes.json()
                permalink = mediaData.permalink ?? null
              } else {
                console.warn(`[Webhook] Failed to fetch permalink for media ${mediaId}: ${mediaRes.status}`)
              }
            } catch (err) {
              console.warn(`[Webhook] Error fetching permalink for media ${mediaId}:`, err)
            }
          }

          const { error: insertError } = await supabase.from('SocialInteraction').insert({
            id: crypto.randomUUID(),
            interactionType,
            externalId: commentId,
            username,
            content,
            permalink,
            isTicketCreated: false,
            channelId: channel.id,
            capturedAt,
          })

          if (insertError) {
            console.error(`[Webhook] Failed to insert ${interactionType}:`, JSON.stringify(insertError))
            continue
          }

          console.log(`[Webhook] ${interactionType} saved: ${commentId} from @${username}`)
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
