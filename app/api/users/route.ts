import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { logActivity, getClientIp } from '@/lib/activity'
import bcrypt from 'bcryptjs'
import { normalizePhone } from '@/lib/phone'

export async function GET() {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      opd: { select: { id: true, name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, phone, role, opdName } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  let normalizedPhone: string | null = null
  if (phone) {
    normalizedPhone = normalizePhone(phone)
    if (!normalizedPhone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  let opdId: string | undefined
  if (opdName) {
    const opd = await prisma.opd.upsert({
      where: { name: opdName },
      update: {},
      create: { name: opdName },
    })
    opdId = opd.id
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone: normalizedPhone,
      role: role ?? 'OPD',
      opdId: opdId ?? null,
    },
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
    action: 'USER_CREATED',
    entityType: 'User',
    entityId: user.id,
    description: `Created user ${user.name} (${user.email})`,
    ipAddress: getClientIp(request),
  })

  return NextResponse.json(user, { status: 201 })
}
