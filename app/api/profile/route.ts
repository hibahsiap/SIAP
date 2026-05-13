import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, phone, opdName, password, currentPassword } = await request.json()

  const existing = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (email && email !== existing.email) {
    const taken = await prisma.user.findUnique({ where: { email } })
    if (taken) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  if (password) {
    if (!currentPassword || !(await bcrypt.compare(currentPassword, existing.password))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
  }

  let opdId: string | null | undefined = undefined
  if (opdName !== undefined) {
    if (opdName) {
      const opd = await prisma.opd.upsert({
        where: { name: opdName },
        update: {},
        create: { name: opdName },
      })
      opdId = opd.id
    } else {
      opdId = null
    }
  }

  const data: Record<string, unknown> = {}
  const logs: { action: string; description: string }[] = []

  if (name !== undefined && name !== existing.name) {
    data.name = name
    logs.push({
      action: 'NAME_UPDATED',
      description: `Name updated from "${existing.name ?? '—'}" to "${name}"`,
    })
  }
  if (email !== undefined && email !== existing.email) {
    data.email = email
    logs.push({
      action: 'EMAIL_UPDATED',
      description: `Email updated from ${existing.email ?? '—'} to ${email}`,
    })
  }
  if (phone !== undefined && phone !== existing.phone) {
    data.phone = phone || null
    const before = existing.phone ?? '—'
    const after = phone || '—'
    logs.push({
      action: 'PHONE_UPDATED',
      description: `Phone number updated from ${before} to ${after}`,
    })
  }
  if (opdId !== undefined && opdId !== existing.opdId) {
    data.opdId = opdId
    const beforeOpd = existing.opdId
      ? (await prisma.opd.findUnique({ where: { id: existing.opdId }, select: { name: true } }))?.name ?? '—'
      : '—'
    const afterOpd = opdName || '—'
    logs.push({
      action: 'OPD_UPDATED',
      description: `OPD updated from ${beforeOpd} to ${afterOpd}`,
    })
  }
  if (password) {
    data.password = await bcrypt.hash(password, 10)
    logs.push({ action: 'PASSWORD_UPDATED', description: 'Password changed' })
  }

  if (Object.keys(data).length === 0) {
    const current = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        opd: { select: { id: true, name: true } }, createdAt: true,
      },
    })
    return NextResponse.json(current)
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: auth.userId },
      data,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        opd: { select: { id: true, name: true } }, createdAt: true,
      },
    }),
    prisma.activityLog.createMany({
      data: logs.map((l) => ({
        userId: auth.userId,
        action: l.action,
        entityType: 'User',
        entityId: auth.userId,
        description: l.description,
        ipAddress: ip,
      })),
    }),
  ])

  return NextResponse.json(updated)
}
