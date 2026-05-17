import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:3000'
  const settingsUrl = `${appUrl}/admin/dashboard/settings`

  if (error || !code) {
    return Response.redirect(`${settingsUrl}?error=oauth_denied`, 302)
  }

  const appId = Deno.env.get('INSTAGRAM_APP_ID')!
  const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET')!
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-callback`

  try {
    // Step 1: Tukar code → short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    console.log('[Step1 token exchange]', JSON.stringify(tokenData))
    if (!tokenData.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`)

    const shortLivedToken: string = tokenData.access_token
    const igUserId: string = String(tokenData.user_id)

    // Step 2: Tukar → long-lived token (60 hari)
    const longRes = await fetch(
      `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&access_token=${shortLivedToken}`
    )
    const longData = await longRes.json()
    if (!longData.access_token) throw new Error('No long-lived token')
    const longLivedToken: string = longData.access_token

    // Step 3: Ambil username Instagram
    const profileRes = await fetch(
      `https://graph.instagram.com/v25.0/me?fields=username&access_token=${longLivedToken}`
    )
    const profileData = await profileRes.json()
    const username: string = profileData.username ?? ''

    // Step 4: Subscribe account ke webhook fields
    const subscribeRes = await fetch(
      `https://graph.instagram.com/v25.0/me/subscribed_apps` +
      `?subscribed_fields=messages,messaging_postbacks,messaging_seen,messaging_referral,message_reactions` +
      `&access_token=${longLivedToken}`,
      { method: 'POST' }
    )
    const subscribeData = await subscribeRes.json()
    console.log('[Step4 subscribed_apps]', JSON.stringify(subscribeData))
    if (!subscribeData.success) throw new Error(`Subscribe failed: ${JSON.stringify(subscribeData)}`)

    // Step 5: Simpan ke DB
    const { error: upsertError } = await supabase
      .from('Channel')
      .upsert({
        platform: 'INSTAGRAM',
        isActive: true,
        accountHandle: username ? `@${username}` : null,
        accountId: igUserId,
        accessToken: longLivedToken,
        updatedAt: new Date().toISOString(),
      }, { onConflict: 'platform' })

    if (upsertError) throw upsertError

    return Response.redirect(`${settingsUrl}?success=instagram_connected`, 302)
  } catch (err) {
    console.error('[Instagram OAuth Callback]', err)
    return Response.redirect(`${settingsUrl}?error=oauth_failed`, 302)
  }
})
