import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const logs = await prisma.activityLog.findMany({
    where: { userId: auth.userId },
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
