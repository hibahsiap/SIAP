import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, password, phone, role, opdName } = await request.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
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
      phone: phone || null,
      role: role ?? 'opd',
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

  return NextResponse.json(user, { status: 201 })
}
