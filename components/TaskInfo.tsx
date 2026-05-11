import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  icon: LucideIcon
  label: string
  children: React.ReactNode
  className?: string
  alignTop?: boolean
}

export default function TaskInfo({
  icon: Icon,
  label,
  children,
  className,
  alignTop = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex gap-4",
        alignTop ? "items-start" : "items-center",
        className
      )}
    >
      <div
        className={cn(
          "flex w-40 shrink-0 items-center gap-2 text-sm text-gray-600",
          alignTop && "pt-0.5"
        )}
      >
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <div className="flex-1 text-sm text-gray-900">{children}</div>
    </div>
  )
}