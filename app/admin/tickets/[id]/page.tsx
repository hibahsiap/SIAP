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
    case "ON_HOLD":     return "on-hold";
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

export default async function AdminTicketDetailPage({ params }: Props) {
  const { id } = await params;

  const auth = await getAuthUser();
  if (!auth || auth.role !== "ADMIN") redirect("/login");

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      assignedOpd: { select: { name: true } },
      category:    { select: { name: true } },
      attachments: { select: { url: true, uploadedById: true } },
    },
  });

  if (!ticket) notFound();

  // "Image" = gambar dari user (intake, tanpa uploader internal).
  // "Gallery" = bukti progress yang diunggah OPD (uploadedById terisi).
  const userImages = ticket.attachments.filter((a) => !a.uploadedById).map((a) => a.url);
  const galleryImages = ticket.attachments.filter((a) => a.uploadedById).map((a) => a.url);

  const task: Task = {
    id:        ticket.id,
    title:     ticket.title ?? ticket.description.slice(0, 80),
    aspirasi:  ticket.description,
    images:    userImages,
    gallery:   galleryImages,
    status:    mapStatus(ticket.status),
    categoryId:   ticket.categoryId,
    categoryName: ticket.category?.name ?? null,
    opd:       ticket.assignedOpd?.name ?? "-",
    priority:  mapPriority(ticket.urgency),
    startDate: ticket.startDate ? ticket.startDate.toISOString().split("T")[0] : "",
    dueDate:   ticket.dueDate   ? ticket.dueDate.toISOString().split("T")[0]   : "",
    finishDate: (() => {
      const finish = ticket.resolvedAt ?? ticket.closedAt;
      return finish ? finish.toISOString().split("T")[0] : "";
    })(),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-full">
        <TaskDetailContent task={task} apiBase="/api/tickets" />
      </div>
    </div>
  );
}