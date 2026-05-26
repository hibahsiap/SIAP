"use client"

import { useRef } from "react"
import { FileText, Image as ImageIcon } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File, type: "document" | "photo") => void
}

export default function FileAttachment({ isOpen, onClose, onFileSelect }: Props) {
  // Referensi untuk input file tersembunyi
  const documentInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Fungsi untuk memicu klik pada input file
  const handleDocumentClick = () => {
    documentInputRef.current?.click()
  }

  const handlePhotoClick = () => {
    photoInputRef.current?.click()
  }

  // Fungsi untuk menangani file yang dipilih
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "document" | "photo"
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, type)
    }
    // Reset value input agar bisa memilih file yang sama lagi jika dibutuhkan
    e.target.value = ""
    onClose() // Tutup pop-up setelah memilih
  }

  if (!isOpen) return null

  return (
    // Wrapper pop-up dengan absolute positioning
    <div className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      
      {/* Tombol Document */}
      <button
        onClick={handleDocumentClick}
        className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        <div className="text-gray-700">
          <FileText size={24} strokeWidth={2} />
        </div>
        <span className="text-[16px] font-medium tracking-wide text-gray-800">
          Document
        </span>
      </button>

      {/* Tombol Photo */}
      <button
        onClick={handlePhotoClick}
        className="flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        <div className="text-gray-700">
          <ImageIcon size={24} strokeWidth={2} />
        </div>
        <span className="text-[16px] font-medium tracking-wide text-gray-800">
          Photo
        </span>
      </button>

      {/* Input File Tersembunyi */}
      <input
        type="file"
        ref={documentInputRef}
        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
        className="hidden"
        onChange={(e) => handleFileChange(e, "document")}
      />
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "photo")}
      />
    </div>
  )
}