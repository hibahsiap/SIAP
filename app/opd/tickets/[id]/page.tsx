import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import TaskDetailContent from "@/components/TaskDetail";
import type { Task } from "@/types/task";
import type { TaskStatus } from "@/components/StatusBadge";
import type { Priority } from "@/components/PriorityBadge";

type Props = {
  params: Promise<{ id: string }>;
};

function mapStatus(status: string): TaskStatus {
  switch (status) {
    case "IN_PROGRESS": return "in-progress";
    case "DONE":        return "completed";
    case "CANCELLED":   return "cancelled";
    default:            return "open";
  }
}

function mapPriority(urgency: string | null): Priority {
  switch (urgency) {
    case "MEDIUM":   return "medium";
    case "HIGH":     return "high";
    case "CRITICAL": return "urgent";
    default:         return "low";
  }
}


export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params;

  const auth = await getAuthUser();
  if (!auth || auth.role !== "OPD") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { opdId: true },
  });

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedOpd: { select: { name: true } },
      category:    { select: { name: true } },
      attachments: { select: { url: true } },
    },
  });

  if (!ticket || ticket.assignedOpdId !== user?.opdId) notFound();

  const attachmentUrls = ticket.attachments.map((a) => a.url);

  const task: Task = {
    id:        ticket.id,
    title:     ticket.title ?? ticket.description.slice(0, 80),
    aspirasi:  ticket.description,
    images:    attachmentUrls,
    gallery:   attachmentUrls,
    status:    mapStatus(ticket.status),
    categoryId:   ticket.categoryId,
    categoryName: ticket.category?.name ?? null,
    opd:       ticket.assignedOpd?.name ?? "-",
    priority:  mapPriority(ticket.urgency),
    startDate: ticket.startDate ? ticket.startDate.toISOString().split("T")[0] : "",
    dueDate:   ticket.dueDate   ? ticket.dueDate.toISOString().split("T")[0]   : "",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-full">
        <TaskDetailContent task={task} />
      </div>
    </div>
  );
}
