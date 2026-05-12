'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Calendar, GripVertical, MessageCircle, Paperclip, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';


interface Task {
  id: string
  taskName: string
  message?: string
  status?: "todo" | "progress" | "done" | "hold"
  priority?: "low" | "medium" | "high"
  issueType?: string[]
  startDate?: string
}

 interface Column {
  id: string
  title: string
  tasks: Task[]
  bg?: string
  text?: string
  dot?: string
  badge?: string
}

const sampleData: Column[] = [
  {
    id: "todo",
    title: "To Do",
    bg: "#FFEBEB",
    text: "#6D3531",
    dot: "#E56458",
    badge: "#F7D9D5",
    tasks: [
      {
        id: "1",
        taskName: "Laporan kemajuan dan keuangan",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "todo",
        issueType: ["Health", "Finance"],
        startDate: "2024-01-15",
        priority: "high",
      },
      {
        id: "2",
        taskName: "Laporan Jalan Rusak",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "todo",
        issueType: ["Infrastructure"],
        startDate: "2024-01-15",
        priority: "low",
      },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    bg: "#E8F6FF",
    text: "#264A72",
    dot: "#2783DE",
    badge: "#C1DEF5",
    tasks: [
      {
        id: "3",
        taskName: "Layanan Pembuatan Akta",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "progress",
        issueType: ["Administration"],
        startDate: "2024-01-15",
        priority: "high",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    bg: "#EAFFF1",
    text: "#2A533C",
    dot: "#46A171",
    badge: "#D7E6DD",
    tasks: [
      {
        id: "4",
        taskName: "Laporan Tukang Parkir Liar",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "done",
        issueType: ["Social"],
        startDate: "2024-01-15",
        priority: "medium",
      },
    ],
  },
  {
    id: "hold",
    title: "On Hold",
    bg: "#FFF7EF",
    text: "#584437",
    dot: "#B68965",
    badge: "#E7D9CF",
    tasks: [
      {
        id: "5",
        taskName: "Marak Kopisop",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "hold",
        issueType: ["Social"],
        startDate: "2024-01-15",
        priority: "medium",
      },
    ],
  },
]

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(sampleData);
  const router = useRouter();

  const handleDragStart = (e: React.DragEvent, task: Task, columnId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ task, sourceColumnId: columnId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { task, sourceColumnId } = data;

    if (sourceColumnId === targetColumnId) return;

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      }),
    );
  };
 
  return (
    <div className="w-240 mb-4 flex flex-col gap-4 -mt-2">
      <div className="flex gap-1 justify-end items-center">
        <p className='font-semibold text-xs'>Scroll</p>
        <ArrowRight size={16}/>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
          
          <div className="flex gap-4 w-300 mb-2">
            {columns.map((column) => (
              <div
                key={column.id}
                className="rounded-[10px] p-4 shrink-0 w-84"
                style={{ backgroundColor: column.bg }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 py-1.5 px-2 rounded-sm" style={{ backgroundColor: column.badge }}>
                    <div className="w-2 h-2 rounded-full " style={{ backgroundColor: column.dot }} />
                    <h3 className="font-semibold text-sm tracking-wider" style={{ color: column.text }}>
                      {column.title}
                    </h3>
                    <Badge className="bg-neutral-100/80 text-neutral-800">
                      {column.tasks.length}
                    </Badge>
                  </div>
                </div>

                <div className="h-0.5 w-full mb-4 rounded-2xl" style={{ backgroundColor: column.badge }}></div>

                <div className="space-y-4">
                  {column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-move transition-all transform duration-400 bg-white hover:bg-white/50 border-2 hover:shadow-md hover:shadow-neutral-600/20"
                      style={{borderColor: column.badge }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                      onClick={() => {
                        router.push(`/opd/dashboard/task/${task.id}`)
                      }}
                    >
                      <CardContent className="px-3 py-1">
                        <div className="space-y-3.5">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-neutral-900 text-sm leading-tight">
                              {task.taskName}
                            </h4>
                          </div>

                          {task.message && (
                            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-2">
                              {task.message}
                            </p>
                          )}

                          {task.issueType && (
                            <div className="flex flex-wrap gap-2">
                              {task.issueType.map((issue) => (
                                <Badge
                                  key={issue}
                                  className="text-[10px] bg-yellow-200 text-neutral-800 border-yellow-400 backdrop-blur-sm"
                                >
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
                              {task.startDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-[10px] font-medium">{task.startDate}</span>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        
      </div>

    </div>
  );
}
