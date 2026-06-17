import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { Prisma, TicketType } from "@prisma/client";

function mapStatus(status: string): string {
  switch (status) {
    case "TO_DO": return "To Do";
    case "IN_PROGRESS": return "In Progress";
    case "ON_HOLD": return "On Hold";
    case "DONE": return "Done";
    case "CANCELLED": return "Cancelled";
    default: return "To Do";
  }
}

function mapPriority(urgency: string | null): string {
  switch (urgency) {
    case "MEDIUM": return "Medium";
    case "HIGH": return "High";
    case "CRITICAL": return "High";
    default: return "Low";
  }
}

function mapKanbanStatus(status: string): "todo" | "progress" | "done" | "hold" | "cancel" {
  switch (status) {
    case "IN_PROGRESS": return "progress";
    case "ON_HOLD":     return "hold";
    case "DONE":        return "done";
    case "CANCELLED":   return "cancel";
    default:            return "todo";
  }
}

function mapKanbanPriority(urgency: string | null): "low" | "medium" | "high" {
  switch (urgency) {
    case "MEDIUM":   return "medium";
    case "HIGH":
    case "CRITICAL": return "high";
    default:         return "low";
  }
}

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "OPD")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { opdId: true },
  });

  if (!user?.opdId)
    return NextResponse.json({ error: "OPD not assigned" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") ?? "all";

  const where: Prisma.TicketWhereInput = {
    assignedOpdId: user.opdId,
    status: { not: "ON_HOLD" },
  };
  if (tab === "aspirations") {
    where.type = TicketType.FEEDBACK;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      citizen: { select: { displayName: true } },
      assignedOpd: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (tab === "aspirations") {
    return NextResponse.json(
      tickets.map((t) => ({
        id: t.id,
        pengirim: t.citizen.displayName,
        status: mapStatus(t.status),
        priority: mapPriority(t.urgency),
        message: t.description,
      }))
    );
  }

  if (tab === "kanban") {
    return NextResponse.json(
      tickets.map((t) => ({
        id: t.id,
        taskName: t.title ?? t.description.slice(0, 60),
        message: t.description,
        status: mapKanbanStatus(t.status),
        priority: mapKanbanPriority(t.urgency),
        issueType: t.category?.name ? [t.category.name] : [],
        startDate: t.startDate ? t.startDate.toISOString().split("T")[0] : undefined,
      }))
    );
  }

  return NextResponse.json(
    tickets.map((t) => ({
      id: t.id,
      taskName: t.title ?? t.description.slice(0, 60),
      opd: t.assignedOpd?.name ?? "-",
      status: mapStatus(t.status),
      type: t.type ?? null,
      categoryName: t.category?.name ?? null,
      priority: mapPriority(t.urgency),
      startDate: t.startDate ? t.startDate.toISOString().split("T")[0] : null,
      finishDate: (t.resolvedAt ?? t.closedAt)?.toISOString().split("T")[0] ?? null,
      createdAt: t.createdAt.toISOString(),
      message: t.description,
    }))
  );
}
