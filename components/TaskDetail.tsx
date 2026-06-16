"use client"

import { useState, useEffect } from "react"
import {
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Loader,
  CircleChevronDown,
  Calendar,
  Building2,
} from "lucide-react"

import TaskHeader from "@/components/TaskHeader"
import TaskInfoRow from "@/components/TaskInfo"
import TaskImagePreview from "@/components/ImagePreview"
import TaskGallery from "@/components/TaskGallery"
import ReturnAdminModal from "@/components/ReturnAdminModal"
import CustomModal from "@/components/CustomModal"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useReturnStore } from "@/store/useReturnStore"
import { formatDate } from "@/lib/formatdate"
import type { Task } from "@/types/task"
import type { TaskStatus } from "@/components/StatusBadge"
import type { Priority } from "@/components/PriorityBadge"
import UpdateProgressModal from "./UpdateProgressModal"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type CategoryItem = { id: string; name: string }

// UI status/priority → enum database
const STATUS_TO_ENUM: Record<TaskStatus, string> = {
  "open": "TO_DO",
  "in-progress": "IN_PROGRESS",
  "completed": "DONE",
  "cancelled": "CANCELLED",
}
const PRIORITY_TO_ENUM: Record<Priority, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  urgent: "CRITICAL",
}

type Props = {
  task: Task
  /** Endpoint dasar untuk persist perubahan. OPD pakai default; admin meneruskan "/api/tickets". */
  apiBase?: string
}

export default function TaskDetailContent({ task, apiBase = "/api/opd/tickets" }: Props) {
  const openReturnModal = useReturnStore((state) => state.open)
  const router = useRouter()

  // 1. State Edit Properties (Status, Category, Priority)
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [categoryId, setCategoryId] = useState<string>(task.categoryId ?? "")
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [categories, setCategories] = useState<CategoryItem[]>([])

  useEffect(() => {
    fetch("/api/category")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => setCategories([]))
  }, [])
  
  // 2. Finish Date State (terisi saat tiket Done/Cancelled — diambil dari resolvedAt/closedAt)
  const [finishDate, setFinishDate] = useState<string>(task.finishDate ?? "")

  // 3. Gallery State (bukti progress OPD — bersumber dari server)
  const [galleryImages, setGalleryImages] = useState<string[]>(task.gallery || [])

  // Sinkronkan gallery dengan data server setelah router.refresh() (mis. usai simpan progress)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGalleryImages(task.gallery || [])
  }, [task.gallery])

  // 4. Modals State
  const [isAddImageOpen, setIsAddImageOpen] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)


  // Di dalam komponen TaskDetailContent
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Tambahkan state untuk melacak perubahan (Dirty Checking)
  const hasChanges =
    status !== task.status ||
    categoryId !== (task.categoryId ?? "") ||
    priority !== task.priority ||
    galleryImages.length !== (task.gallery?.length || 0);

  // -- LOGIC --

  // Automatis isi End Date ke 'hari ini' kalau status Completed (Done) atau Cancelled
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus)
    if (newStatus === "completed" || newStatus === "cancelled") {
      // Preview tanggal selesai = hari ini (nilai final di-stamp server saat disimpan)
      const today = new Date().toISOString().split("T")[0]
      setFinishDate(today)
    } else {
      setFinishDate("")
    }
  }

  const handleReturnClick = () => {
    openReturnModal(task.id)
  }

  const handleConfirmReturn = async (ticketId: string, reason: string) => {
    console.log("Return ticket:", { ticketId, reason })
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  // Modal Add Image Logic
  const handleAddImage = () => {
    setIsAddImageOpen(true)
  }

  const submitNewImage = () => {
    if (newImageUrl.trim()) {
      setGalleryImages((prev) => [...prev, newImageUrl])
      setNewImageUrl("")
      setIsAddImageOpen(false)
    }
  }

  // Logic membesarkan foto (Preview Lightbox)
  const handleImageClick = (src: string) => {
    setPreviewImage(src)
  }

  // Persist perubahan (status, kategori, prioritas) + bukti progress ke database
  const handleProgressSave = async (data: { files: File[]; description: string }) => {
    setIsUpdateModalOpen(false)
    try {
      const uploaded: { url: string; fileName: string; mimeType: string; sizeBytes: number }[] = []
      for (const file of data.files) {
        const fd = new FormData()
        fd.append("file", file)
        const upRes = await fetch("/api/upload", { method: "POST", body: fd })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error ?? "Upload bukti progress gagal")
        uploaded.push({
          url: upData.url,
          fileName: upData.fileName,
          mimeType: upData.mimeType,
          sizeBytes: upData.sizeBytes,
        })
      }

      const res = await fetch(`${apiBase}/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: STATUS_TO_ENUM[status],
          categoryId: categoryId || null,
          urgency: PRIORITY_TO_ENUM[priority],
          note: data.description,
          attachments: uploaded.length > 0 ? uploaded : undefined,
        }),
      })
      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error ?? "Gagal menyimpan perubahan")

      toast.success("Perubahan tersimpan")
      // Re-render server component agar Start/Finish date & data lain ter-update dari DB
      router.refresh()
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  return (
    <>
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
        {/* Header */}
        <TaskHeader title={task.title} onReturnClick={handleReturnClick} />

        {/* Info Section */}
        <div className="space-y-4 pl-11">
          <TaskInfoRow icon={ClipboardList} label="ID Ticket">
            <span className="font-mono text-gray-700">{task.id}</span>
          </TaskInfoRow>

          <TaskInfoRow icon={FileText} label="Aspirasi" alignTop>
            <p className="leading-relaxed text-gray-700">{task.aspirasi}</p>
          </TaskInfoRow>

          {/* Menambahkan aksi klik pada TaskImagePreview */}
          <TaskInfoRow icon={ImageIcon} label="Image" alignTop>
            <TaskImagePreview
              images={task.images}
              onImageClick={(idx: number) => handleImageClick(task.images[idx])}
            />
          </TaskInfoRow>

          <div className="h-px bg-gray-100" />

          <div className="grid grid-cols-2 gap-4">
            {/* Edit Status */}
            <TaskInfoRow icon={Loader} label="Status">
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed / Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </TaskInfoRow>

            {/* Edit Category */}
            <TaskInfoRow icon={CircleChevronDown} label="Category">
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Pilih Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TaskInfoRow>

            {/* OPD (Tetap statis sesuai desain) */}
            <TaskInfoRow icon={Building2} label="OPD">
              <span className="text-gray-700 font-medium">{task.opd}</span>
            </TaskInfoRow>

            {/* Edit Priority */}
            <TaskInfoRow icon={CircleChevronDown} label="Priority">
              <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
                <SelectTrigger className="w-full bg-gray-50/50 border-gray-200">
                  <SelectValue placeholder="Pilih Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </TaskInfoRow>

            <TaskInfoRow icon={Calendar} label="Start Date">
              <span className="text-gray-700">{formatDate(task.startDate)}</span>
            </TaskInfoRow>

            <TaskInfoRow icon={Calendar} label="Finish Date">
              <span className="text-gray-700 font-medium">
                {finishDate ? formatDate(finishDate) : "-"}
              </span>
            </TaskInfoRow>
          </div>

          <div className="flex justify-end mt-4">
            <Button 
              // disabled={!hasChanges} // Tombol disabled jika tidak ada perubahan
              onClick={() => !hasChanges ? null: setIsUpdateModalOpen(true)}
              className={`w-32 h-8 2xl:h-10 2xl:w-40 text-white ${!hasChanges ? "bg-gray-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"}`}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <TaskGallery
            images={galleryImages} 
            onAddImage={handleAddImage}
            onImageClick={(idx: number) => handleImageClick(galleryImages[idx])}
          />
        </div>
      </div>

      <ReturnAdminModal onConfirm={handleConfirmReturn} />

      {/* --- MODAL ADD IMAGE --- */}
      {/* <CustomModal isOpen={isAddImageOpen} onClose={() => setIsAddImageOpen(false)} title="Add Image">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
            <Input 
              placeholder="Paste URL gambar (misal: https://...)" 
              value={newImageUrl} 
              onChange={(e) => setNewImageUrl(e.target.value)} 
            />
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <Button variant="outline" onClick={() => setIsAddImageOpen(false)} className="bg-gray-100 border-0">Cancel</Button>
            <Button onClick={submitNewImage} className="bg-[#1a233a] text-white">Upload</Button>
          </div>
        </div>
      </CustomModal> */}

      {/* --- MODAL PREVIEW IMAGE (FOTO MENJADI BESAR) --- */}
      <CustomModal isOpen={!!previewImage} onClose={() => setPreviewImage(null)} title="Image Preview" size="lg">
        <div className="flex items-center justify-center p-2">
          {previewImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-sm" 
            />
          )}
        </div>
      </CustomModal>

      {/* MODAL UNTUK UPDATE PROGRESS */}
      <UpdateProgressModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        task={{ id: task.id, taskName: task.title }} // Sesuaikan dengan interface modal
        onSave={handleProgressSave}
      />

    </>
  )
}