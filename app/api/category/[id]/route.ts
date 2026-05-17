import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
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
  if (defaultOpdId !== undefined) data.defaultOpdId = defaultOpdId || null;

  const category = await prisma.category.update({
    where: { id },
    data,
    include: { defaultOpd: { select: { id: true, name: true } } },
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
