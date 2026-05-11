import { cn } from "@/lib/utils"

export type Priority = "low" | "medium" | "high" | "urgent"

type Props = {
  priority: Priority
  className?: string
}

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-green-100 text-green-700",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-100 text-yellow-700",
  },
  high: {
    label: "High",
    className: "bg-red-100 text-red-700",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-200 text-red-800",
  },
}

export default function PriorityBadge({ priority, className }: Props) {
  const config = PRIORITY_CONFIG[priority]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}