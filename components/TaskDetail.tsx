"use client"

import { useState } from "react"
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
import StatusBadge from "@/components/StatusBadge"
import IssueTypeBadge from "@/components/IssueBadge"
import PriorityBadge from "@/components/PriorityBadge"
import ReturnAdminModal from "@/components/ReturnAdminModal"

import { useReturnStore } from "@/store/useReturnStore"
import { formatDate } from "@/lib/formatdate"
import type { Task } from "@/types/task"

type Props = {
  task: Task
}

export default function TaskDetailContent({ task }: Props) {
  const openReturnModal = useReturnStore((state) => state.open)

  // 2. Buat state lokal untuk galeri, nilai awalnya dari task.gallery
  const [galleryImages, setGalleryImages] = useState<string[]>(task.gallery || [])

  const handleReturnClick = () => {
    openReturnModal(task.id)
  }

  const handleConfirmReturn = async (ticketId: string, reason: string) => {
    console.log("Return ticket:", { ticketId, reason })
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const handleAddImage = () => {
    // 3. Logika untuk nambah gambar ke UI
    const newDummyImage = "/lubang1.jpg" // Sesuaikan dengan path gambar dummymu
    
    setGalleryImages((prevImages) => [...prevImages, newDummyImage])
    console.log("Image added to gallery!")
  }

  const handleImageClick = (index: number) => {
    console.log("Image clicked:", index)
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

          <TaskInfoRow icon={ImageIcon} label="Image" alignTop>
            <TaskImagePreview
              images={task.images}
              onImageClick={handleImageClick}
            />
          </TaskInfoRow>

          <div className="h-px bg-gray-100" />

          <TaskInfoRow icon={Loader} label="Status">
            <StatusBadge status={task.status} />
          </TaskInfoRow>

          <TaskInfoRow icon={CircleChevronDown} label="Issue Type">
            <IssueTypeBadge type={task.issueType} />
          </TaskInfoRow>

          <TaskInfoRow icon={Building2} label="OPD">
            <span className="text-gray-700">{task.opd}</span>
          </TaskInfoRow>

          <TaskInfoRow icon={CircleChevronDown} label="Priority">
            <PriorityBadge priority={task.priority} />
          </TaskInfoRow>

          <TaskInfoRow icon={Calendar} label="Start Date">
            <span className="text-gray-700">{formatDate(task.startDate)}</span>
          </TaskInfoRow>

          <TaskInfoRow icon={Calendar} label="Due Date">
            <span className="text-gray-700">{formatDate(task.dueDate)}</span>
          </TaskInfoRow>
        </div>

        {/* 4. Gunakan state galleryImages di sini, BUKAN task.gallery */}
        <div className="border-t border-gray-100 pt-6">
          <TaskGallery
            images={galleryImages} 
            onAddImage={handleAddImage}
            onImageClick={handleImageClick}
          />
        </div>
      </div>

      <ReturnAdminModal onConfirm={handleConfirmReturn} />
    </>
  )
}