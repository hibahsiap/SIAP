import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.activityLog.findMany({
    // Login/logout are no longer recorded; exclude any legacy rows from the feed too.
    where: { userId: auth.userId, action: { notIn: ['LOGIN', 'LOGOUT'] } },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      description: true,
      ipAddress: true,
      createdAt: true,
    },
  })

  return NextResponse.json(logs)
}
