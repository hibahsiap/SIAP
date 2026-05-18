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

      // Ambil channel Instagram dari DB
      const { data: channel } = await supabase
        .from('Channel')
        .select('id')
        .eq('platform', 'INSTAGRAM')
        .single()

      if (!channel) return new Response(JSON.stringify({ status: 'no channel' }), { status: 200 })

      for (const entry of body.entry ?? []) {
        // --- Direct Message ---
        for (const event of entry.messaging ?? []) {
          if (!event.message || event.message.is_echo) continue

          const senderId: string = event.sender.id
          const messageText: string = event.message.text ?? ''

          // Cari citizen berdasarkan Instagram handle
          const { data: contact } = await supabase
            .from('CitizenContact')
            .select('citizenId')
            .eq('platform', 'INSTAGRAM')
            .eq('handle', senderId)
            .single()

          let citizenId: string

          if (contact) {
            citizenId = contact.citizenId
          } else {
            // Buat citizen baru
            const { data: newCitizen } = await supabase
              .from('Citizen')
              .insert({ displayName: 'Instagram User', createdAt: new Date(), updatedAt: new Date() })
              .select('id')
              .single()

            citizenId = newCitizen!.id

            await supabase
              .from('CitizenContact')
              .insert({ platform: 'INSTAGRAM', handle: senderId, citizenId, createdAt: new Date() })
          }

          // Cari tiket aktif untuk citizen ini
          const { data: ticket } = await supabase
            .from('Ticket')
            .select('id')
            .eq('citizenId', citizenId)
            .eq('channelId', channel.id)
            .in('status', ['TO_DO', 'IN_PROGRESS'])
            .order('createdAt', { ascending: false })
            .limit(1)
            .single()

          let ticketId: string

          if (ticket) {
            ticketId = ticket.id
          } else {
            // Buat tiket baru
            const { count } = await supabase
              .from('Ticket')
              .select('*', { count: 'exact', head: true })

            const ticketNumber = `TKT-${String((count ?? 0) + 1).padStart(5, '0')}`

            const { data: newTicket } = await supabase
              .from('Ticket')
              .insert({
                ticketNumber,
                description: messageText || '[Media attachment]',
                citizenId,
                channelId: channel.id,
                status: 'TO_DO',
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .select('id')
              .single()

            ticketId = newTicket!.id
          }

          // Simpan pesan
          await supabase.from('Message').insert({
            content: messageText || '[Media attachment]',
            senderType: 'WARGA',
            direction: 'INBOUND',
            ticketId,
            sentAt: new Date(event.timestamp),
            isInternal: false,
            isApproved: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
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

          // Deduplikasi — skip jika comment ID sudah ada
          const { data: existing } = await supabase
            .from('SocialInteraction')
            .select('id')
            .eq('channelId', channel.id)
            .eq('externalId', commentId)
            .single()

          if (existing) continue

          const { error: insertError } = await supabase.from('SocialInteraction').insert({
            id: crypto.randomUUID(),
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

      // Meta butuh response 200 dalam 20 detik
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('[Webhook Error]', err)
      // Tetap return 200 agar Meta tidak terus retry
      return new Response(JSON.stringify({ status: 'error' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})
