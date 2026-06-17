"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  images: string[]
  className?: string
  thumbnailSize?: number
  onImageClick?: (index: number) => void
}

export default function ImagePreview({
  images,
  className,
  thumbnailSize = 96,
  onImageClick,
}: Props) {
  const [errored, setErrored] = useState<Record<number, boolean>>({})

  if (!images || images.length === 0) {
    return <span className="text-sm text-gray-400">No images</span>
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {images.map((src, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onImageClick?.(i)}
          className="relative overflow-hidden rounded-lg border border-gray-200 transition hover:opacity-90"
          style={{ width: thumbnailSize, height: thumbnailSize }}
        >
          {errored[i] ? (
            <div className="flex size-full items-center justify-center bg-gray-100 text-xs 2xl:text-sm text-gray-400">
              Failed
            </div>
          ) : (
            <Image
              src={src}
              alt={`Preview ${i + 1}`}
              fill
              sizes={`${thumbnailSize}px`}
              className="object-cover"
              onError={() => setErrored((p) => ({ ...p, [i]: true }))}
            />
          )}
        </button>
      ))}
    </div>
  )
}