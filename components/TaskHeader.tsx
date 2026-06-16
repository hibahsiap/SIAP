"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  title: string
  onReturnClick: () => void
  showReturnButton?: boolean
}

export default function TaskHeader({
  title,
  onReturnClick,
  showReturnButton = true,
}: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-2xl 2xl:text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      {showReturnButton && (
        <Button
          variant="ghost"
          onClick={onReturnClick}
          className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800 2xl:text-lg 2xl:h-10"
        >
          Return to Admin
        </Button>
      )}
    </div>
  )
}