"use client"

import Image from "next/image"
import { LayoutGrid, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  images: string[]
  onAddImage?: () => void
  onImageClick?: (index: number) => void
  canAddImage?: boolean
}

export default function TaskGallery({
  images,
  onAddImage,
  onImageClick,
  canAddImage = true,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Header gallery */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5">
          <LayoutGrid className="size-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">Gallery</span>
        </div>

        {canAddImage && (
          <Button
            onClick={onAddImage}
            className="bg-slate-900 text-white hover:bg-slate-800 w-32 h-8"
          >
            <Plus className="mr-1 size-4" />
            Add Image
          </Button>
        )}
      </div>

      {/* Grid gallery */}
      {images.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
          No images uploaded yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onImageClick?.(i)}
              className="relative aspect-video overflow-hidden rounded-lg border border-gray-200 transition hover:opacity-90"
            >
              <Image
                src={src}
                alt={`Gallery ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}