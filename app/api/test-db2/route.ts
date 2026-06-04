import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const msgs = await prisma.message.findMany({
    where: { direction: 'OUTBOUND' },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, content: true, externalId: true, senderType: true }
  });
  return NextResponse.json(msgs);
}
