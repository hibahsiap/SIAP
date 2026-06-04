import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const msgs = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { replyTo: true },
  });
  return NextResponse.json(msgs);
}
