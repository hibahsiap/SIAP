import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { ChannelPlatform } from '@prisma/client'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const auth = await getAuthUser()
  if (!auth || auth.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { platform } = await params
  const body = await request.json()
  const { isActive, accountHandle, accountId, accessToken } = body

  const platformKey = platform.toUpperCase() as ChannelPlatform

  const channel = await prisma.channel.upsert({
    where: { platform: platformKey },
    update: {
      isActive,
      ...(accountHandle !== undefined && { accountHandle }),
      ...(accountId !== undefined && { accountId }),
      ...(accessToken !== undefined && { accessToken }),
    },
    create: {
      platform: platformKey,
      isActive,
      accountHandle: accountHandle ?? null,
      accountId: accountId ?? null,
      accessToken: accessToken ?? null,
    },
    select: { id: true, platform: true, accountHandle: true, accountId: true, isActive: true },
  })

  return NextResponse.json(channel)
}
