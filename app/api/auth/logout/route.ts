import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (auth) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null
    await prisma.activityLog.create({
      data: {
        userId: auth.userId,
        action: 'LOGOUT',
        description: 'Signed out',
        ipAddress: ip,
      },
    }).catch(() => {})
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete('token')
  return response
}
