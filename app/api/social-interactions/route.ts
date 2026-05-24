import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { InteractionType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type")?.toUpperCase();
  const sort = searchParams.get("sort") === "oldest" ? "asc" : "desc";

  const interactionType =
    typeParam === "COMMENT" || typeParam === "MENTION"
      ? (typeParam as InteractionType)
      : undefined;

  const interactions = await prisma.socialInteraction.findMany({
    where: interactionType ? { interactionType } : undefined,
    include: {
      channel: { select: { id: true, platform: true, accountHandle: true } },
    },
    orderBy: { capturedAt: sort },
    take: 100,
  });

  const result = interactions.map((i) => ({
    id: i.id,
    interactionType: i.interactionType,
    externalId: i.externalId,
    username: i.username,
    content: i.content,
    permalink: i.permalink,
    isTicketCreated: i.isTicketCreated,
    capturedAt: i.capturedAt,
    channel: i.channel,
    convertedTicketId: i.convertedTicketId,
  }));

  return NextResponse.json(result);
}
