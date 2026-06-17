import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { logActivity, getClientIp } from '@/lib/activity'
import bcrypt from 'bcryptjs'
import { normalizePhone } from '@/lib/phone'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { name, email, phone, role, opdName, password } = await request.json()

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
  if (name !== undefined) data.name = name
  if (email !== undefined) data.email = email
  if (phone !== undefined) {
    if (phone) {
      const np = normalizePhone(phone)
      if (!np) {
        return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
      }
      data.phone = np
    } else {
      data.phone = null
    }
  }
  if (role !== undefined) data.role = role
  if (opdId !== undefined) data.opdId = opdId
  if (password) data.password = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      opd: { select: { id: true, name: true } },
      createdAt: true,
    },
  })

  await logActivity({
    userId: auth.userId,
    action: 'USER_UPDATED',
    entityType: 'User',
    entityId: user.id,
    description: `Updated user ${user.name} (${user.email})`,
    ipAddress: getClientIp(request),
  })

  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const target = await prisma.user.findUnique({
    where: { id },
    select: { name: true, email: true },
  })
  await prisma.user.delete({ where: { id } })

  await logActivity({
    userId: auth.userId,
    action: 'USER_DELETED',
    entityType: 'User',
    entityId: id,
    description: target
      ? `Deleted user ${target.name} (${target.email})`
      : `Deleted user ${id}`,
    ipAddress: getClientIp(request),
  })

  return NextResponse.json({ success: true })
}
