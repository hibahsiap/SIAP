import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

const PLATFORMS = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK'] as const

export async function GET() {
  try {
    const auth = await getAuthUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Pastikan semua platform ada di DB
    for (const platform of PLATFORMS) {
      await prisma.channel.upsert({
        where: { platform },
        update: {},
        create: { platform, isActive: false },
      })
    }

    const channels = await prisma.channel.findMany({
      select: {
        id: true,
        platform: true,
        accountHandle: true,
        accountId: true,
        isActive: true,
      },
      orderBy: { platform: 'asc' },
    })

    return NextResponse.json(channels)
  } catch (err) {
    console.error('[GET /api/channel]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
