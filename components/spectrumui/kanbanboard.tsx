'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Calendar, GripVertical, MessageCircle, Paperclip, Plus } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import UpdateProgressModal from '../UpdateProgressModal';
import ToastFrame from '../ToastFrame';
import { toast } from 'sonner';
import SearchEmptyState from '../SearchEmpty';
import { FilterState } from '../Filter';
// import ToastFrame from './ToastFrame';


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
    bg: "#FDF6F6",
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
    bg: "#F3F9FD",
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
    bg: "#F6F9F7",
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
    bg: "#FAF8F6",
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
  {
    id: "cancel",
    title: "Canceled",
    bg: "#F9F8F7",
    text: "#494846",
    dot: "#8E8B86",
    badge: "#E1DFDC",
    tasks: [
      {
        id: "6",
        taskName: "Marak Penipuan",
        message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        status: "hold",
        issueType: ["Social"],
        startDate: "2024-01-15",
        priority: "medium",
      },
    ],
  },
]

const priorityColors = {
  low: "border-green-400 bg-green-50 text-green-700",
  medium: "border-amber-400 bg-amber-50 text-amber-700",
  high: "border-red-400 bg-red-50 text-red-700",
};

export default function KanbanBoard({ searchQuery = "", filters, }: { searchQuery?: string, filters?: FilterState;}) {

  const [columns, setColumns] = useState<Column[]>(sampleData);

  // const filteredColumns = useMemo(() => {
  //   const q = searchQuery.toLowerCase();

  //   return columns.map((col) => ({
  //     ...col,
  //     tasks: col.tasks.filter((task) =>
  //       task.taskName.toLowerCase().includes(q) ||
  //       task.message?.toLowerCase().includes(q)
  //     ),
  //   }))
  //   .filter(col => col.tasks.length > 0);
  // }, [searchQuery, columns]);

  const filteredColumns = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => {
        // Filter search query (tidak berubah)
        const matchSearch =
          task.taskName.toLowerCase().includes(q) ||
          task.message?.toLowerCase().includes(q);
        if (!matchSearch) return false;

        // ✅ TAMBAH: Filter Priority
        if (filters?.priorities && filters.priorities.length > 0) {
          const taskPriority = task.priority
            ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) // "high" → "High"
            : "";
          if (!filters.priorities.includes(taskPriority)) return false;
        }

        // ✅ TAMBAH: Filter Issue Type
        // task.issueType adalah array, cocok jika ada irisan dengan filter
        if (filters?.issues && filters.issues.length > 0) {
          const hasMatchingIssue = task.issueType?.some((issue) =>
            filters.issues.includes(issue)
          );
          if (!hasMatchingIssue) return false;
        }

        // ✅ TAMBAH: Filter Classification/Status
        // Mapping dari column.id ke label Classification
        const statusMap: Record<string, string> = {
          todo: "To Do",
          progress: "In Progress",
          done: "Done",
          hold: "On Hold",
          cancel: "Canceled",
        };
        if (filters?.classifications && filters.classifications.length > 0) {
          const colLabel = statusMap[col.id] ?? "";
          if (!filters.classifications.includes(colLabel)) return false;
        }

        return true;
      }),
    }))
    .filter((col) => col.tasks.length > 0);
  }, [searchQuery, columns, filters]);

  const router = useRouter();

  // Menyimpan data perpindahan yang akan dieksekusi setelah modal di-save
  const [pendingMove, setPendingMove] = useState<{
    task: Task;
    sourceColumnId: string;
    targetColumnId: string;
  } | null>(null);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  // STATE BARU: Untuk mentrigger Toast di level KanbanBoard
  // const [toastData, setToastData] = useState<{ id: string; name: string } | null>(null);

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

    // Langsung simpan data perpindahan & buka UpdateProgressModal
    setPendingMove({ task, sourceColumnId, targetColumnId });
    setIsProgressModalOpen(true);
  };

  // Fungsi penanganan akhir saat tombol "Save Changes" diklik di dalam modal
  const handleFinalProgressSave = (data: { files: File[]; description: string }) => {
    if (!pendingMove) return;

    const { task, sourceColumnId, targetColumnId } = pendingMove;

    setColumns((prev) =>
      prev.map((col) => {
        // 1. Bersihkan dari bodi kolom asal
        if (col.id === sourceColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        
        // 2. Tambah ke bodi kolom baru dan perbarui isi pesan teksnya
        if (col.id === targetColumnId) { 
          return {
            ...col,
            tasks: [...col.tasks, { ...task, description: data.description, status: targetColumnId as any }]
          };
        }
        return col;
      })
    );

    // Kirim data gabungan berkas gambar bukti & deskripsi teks baru ke Backend
    console.log("Files ready to API upload:", data.files);
    console.log("New description updated:", data.description);

    // 3. SET DATA TOAST DI LEVEL KANBANBOARD SEBELUM MODAL RE-SET
    // setToastData({ id: task.id, name: task.taskName });
    
    // toast.success("Task Updated", {
    //   description: `"${task.id}-${task.taskName}" updated successfully`,
    // });

    // Reset total seluruh state modal (Modal menutup dengan aman)
    setIsProgressModalOpen(false);
    setPendingMove(null);

    // Otomatis hilangkan toast setelah beberapa detik (misal 4 detik)
    // setTimeout(() => {
    //   setToastData(null);
    // }, 4000);
  };
 
  return (
    <div className="mb-4 flex flex-col -mt-2 relative">

      {filteredColumns.length === 0 ? (
        <SearchEmptyState type={"all"} />
      ) : (

        <div className="w-full overflow-x-auto custom-scrollbar">
            
            <div className="flex gap-4 w-250 mb-2">
              {filteredColumns.map((column) => (
                <div
                  key={column.id}
                  className="rounded-[10px] p-4 shrink-0 w-84 min-h-100"
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
                          router.push(`/opd/task/${task.id}`)
                        }}
                      >
                        <CardContent className="px-3 py-1">
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-semibold text-neutral-900 text-sm leading-tight">
                                {task.taskName}
                              </h4>
                              <p className={`border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  task.priority ? priorityColors[task.priority] : 'border-neutral-300 bg-neutral-50 text-neutral-600'
                                }`}>
                                  {task.priority}
                              </p>
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
                                    className="text-[10px] bg-[#F0DFAC] text-[#655121] border-[#655121] backdrop-blur-sm"
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
      )}


      {/* SINGLE UPDATE PROGRESS MODAL */}
      {pendingMove && (
        <UpdateProgressModal
          isOpen={isProgressModalOpen}
          onClose={() => {
            setIsProgressModalOpen(false);
            setPendingMove(null);
          }}
          task={pendingMove.task}
          onSave={handleFinalProgressSave}
        />
      )}

      {/* RENDER TOAST DI LEVEL KANBANBOARD (Aman dari unmount modal) */}
      {/* {toastData && (
        <ToastFrame 
          isSuccess={true} 
          id={toastData.id} 
          name={toastData.name}
          process="updated" 
        />
      )} */}
      
    </div>
  );
}