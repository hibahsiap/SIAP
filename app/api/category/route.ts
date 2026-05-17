import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const STOPWORDS = new Set(["dan", "atau", "yang", "di", "ke", "dari", "untuk", "dengan", "pada", "oleh", "dalam"]);

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => !STOPWORDS.has(word))
    .join("-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { defaultOpd: { select: { id: true, name: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, defaultOpdId } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const slug = generateSlug(name);

  const category = await prisma.category.create({
    data: { name, slug, defaultOpdId: defaultOpdId || null },
    include: { defaultOpd: { select: { id: true, name: true } } },
  });
  return NextResponse.json(category, { status: 201 });
}
