import type { TaskStatus } from "@/components/StatusBadge"
import type { IssueType } from "@/components/IssueBadge"
import type { Priority } from "@/components/PriorityBadge"

export type Task = {
  id: string
  title: string
  aspirasi: string
  images: string[]
  status: TaskStatus
  issueType: IssueType
  opd: string
  priority: Priority
  startDate: string // ISO date string
  dueDate: string // ISO date string
  gallery: string[]
}