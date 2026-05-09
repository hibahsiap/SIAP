import { cn } from "@/lib/utils"

export type IssueType =
  | "health"
  | "infrastructure"
  | "education"
  | "social"
  | "environment"
  | "other"

type Props = {
  type: IssueType
  className?: string
}

const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; className: string }> = {
  health: {
    label: "Health",
    className: "bg-purple-100 text-purple-700",
  },
  infrastructure: {
    label: "Infrastructure",
    className: "bg-orange-100 text-orange-700",
  },
  education: {
    label: "Education",
    className: "bg-cyan-100 text-cyan-700",
  },
  social: {
    label: "Social",
    className: "bg-pink-100 text-pink-700",
  },
  environment: {
    label: "Environment",
    className: "bg-emerald-100 text-emerald-700",
  },
  other: {
    label: "Other",
    className: "bg-gray-100 text-gray-700",
  },
}

export default function IssueBadge({ type, className }: Props) {
  const config = ISSUE_TYPE_CONFIG[type]

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