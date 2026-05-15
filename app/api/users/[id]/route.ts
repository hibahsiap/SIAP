import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

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
  if (phone !== undefined) data.phone = phone || null
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

  return NextResponse.json(user)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (auth.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
