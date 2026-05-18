import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
          if (event.message.is_echo) {
            console.log('[Webhook] Skip: echo')
            continue
          }

          const senderId: string = event.sender?.id ?? ''
          if (!senderId) {
            console.log('[Webhook] Skip: no sender.id')
            continue
          }
          const messageText: string = event.message.text ?? ''
          console.log(`[Webhook] DM from ${senderId}: ${messageText.slice(0, 80)}`)

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

            // Backfill username/profilePicUrl/displayName if missing
            if (!contact.username || !contact.profilePicUrl) {
              const profile = await fetchIgProfile(senderId)
              const contactPatch: Record<string, string | null> = {}
              if (!contact.username && profile.username) contactPatch.username = profile.username
              if (!contact.profilePicUrl && profile.profilePicUrl) contactPatch.profilePicUrl = profile.profilePicUrl

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

          // Simpan pesan ke conversation
          const { error: msgErr } = await supabase.from('Message').insert({
            id: crypto.randomUUID(),
            content: messageText || '[Media attachment]',
            senderType: 'WARGA',
            direction: 'INBOUND',
            conversationId,
            sentAt,
            isInternal: false,
            isApproved: true,
            updatedAt: now,
          })
          if (msgErr) {
            console.error('[Webhook] Failed to insert Message:', JSON.stringify(msgErr))
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

          const { error: insertError } = await supabase.from('SocialInteraction').insert({
            interactionType,
            externalId: commentId,
            username,
            content,
            permalink: mediaId ? `https://www.instagram.com/p/${mediaId}/` : null,
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
