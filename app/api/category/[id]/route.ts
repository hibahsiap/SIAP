import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { logActivity, getClientIp } from "@/lib/activity";
import { generateSlug } from "@/app/api/category/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, defaultOpdId } = await req.json();

  const data: Record<string, unknown> = {};
  if (name) {
    data.name = name;
    data.slug = generateSlug(name);
  }
  if (defaultOpdId) {
    data.defaultOpdId = defaultOpdId;
  }

  const category = await prisma.category.update({
    where: { id },
    data,
    include: { defaultOpd: { select: { id: true, name: true } } },
  });

  await logActivity({
    userId: auth.userId,
    action: "CATEGORY_UPDATED",
    entityType: "Category",
    entityId: category.id,
    description: `Updated category "${category.name}"`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const target = await prisma.category.findUnique({
    where: { id },
    select: { name: true },
  });
  await prisma.category.delete({ where: { id } });

  await logActivity({
    userId: auth.userId,
    action: "CATEGORY_DELETED",
    entityType: "Category",
    entityId: id,
    description: target ? `Deleted category "${target.name}"` : `Deleted category ${id}`,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
}
