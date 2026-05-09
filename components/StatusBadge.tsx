import { cn } from "@/lib/utils"

export type TaskStatus = "open" | "in-progress" | "completed" | "cancelled"

type Props = {
  status: TaskStatus
  className?: string
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-gray-100 text-gray-700",
  },
  "in-progress": {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700",
  },
}

export default function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  )
}