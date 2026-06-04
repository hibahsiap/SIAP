import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const msgs = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      content: true,
      externalId: true,
      replyToMessageId: true,
    }
  });
  return NextResponse.json(msgs);
}
