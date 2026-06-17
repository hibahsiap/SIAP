import type { TaskStatus } from "@/components/StatusBadge"
import type { Priority } from "@/components/PriorityBadge"

export type Task = {
  id: string
  title: string
  aspirasi: string
  images: string[]
  status: TaskStatus
  categoryId: string | null
  categoryName: string | null
  opd: string
  priority: Priority
  startDate: string
  dueDate: string
  finishDate: string
  gallery: string[]
}
