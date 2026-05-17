import TaskDetailContent from "@/components/TaskDetail"
import { DUMMY_TASK } from "@/constants/taskDummy"

type Props = {
  params: Promise<{ id: string }>
}

export default async function TaskDetailPage({ params }: Props) {
  const { id } = await params

  // TODO: ganti dengan fetch dari API
  // const task = await fetchTaskById(id)
  // if (!task) notFound()

  // Untuk sekarang pakai data dummy
  const task = { ...DUMMY_TASK, id }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-full">
        <TaskDetailContent task={task} />
      </div>
    </div>
  )
}