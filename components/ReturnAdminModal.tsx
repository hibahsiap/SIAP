"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReturnStore } from "@/store/useReturnStore"
import { toast } from "sonner"

const MAX_CHARS = 300

type Props = {
  onConfirm?: (ticketId: string, reason: string) => Promise<void> | void
}

export default function ReturnAdminModal({ onConfirm }: Props) {
  const { isOpen, ticketId, tickets, isLoading, close, setLoading } = useReturnStore()
  const [reason, setReason] = useState("")
  const [selectedTicketId, setSelectedTicketId] = useState("")

  const hasMultiple = tickets.length > 0
  const resolvedTicketId = hasMultiple ? selectedTicketId : (ticketId ?? "")

  const handleClose = () => {
    if (isLoading) return
    setReason("")
    setSelectedTicketId("")
    close()
  }

  const handleConfirm = async () => {
    if (!resolvedTicketId || !reason.trim()) return
    try {
      setLoading(true)
      await onConfirm?.(resolvedTicketId, reason.trim())
      setReason("")
      setSelectedTicketId("")
      close()
      toast.success("Ticket returned successfully")
      setLoading(false)
    } catch (error) {
      console.error("Failed to return ticket:", error)
      toast.error("Failed to return ticket")
      setLoading(false)
    }
  }

  const charCount = reason.length
  const isOverLimit = charCount > MAX_CHARS
  const canSubmit = reason.trim().length > 0 && !isOverLimit && !isLoading && !!resolvedTicketId

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md 2xl:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl 2xl:text-2xl font-bold">
            Return to Admin
          </DialogTitle>
          <DialogDescription className="text-sm 2xl:text-base text-gray-600">
            Send this ticket back to Admin if it cannot be handled by your
            department. Please provide a reason to help Admin take the next
            action.
          </DialogDescription>
        </DialogHeader>

        {hasMultiple && (
          <div className="space-y-2">
            <Label className="text-xs 2xl:text-sm font-semibold uppercase tracking-wide text-gray-500">
              Ticket
            </Label>
            <Select value={selectedTicketId} onValueChange={setSelectedTicketId} disabled={isLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a ticket to return..." />
              </SelectTrigger>
              <SelectContent>
                {tickets.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.ticketNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="reason"
            className="text-xs 2xl:text-sm font-semibold uppercase tracking-wide text-gray-500"
          >
            Reasons
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={MAX_CHARS}
            rows={5}
            placeholder="Explain why this ticket should be returned to admin..."
            className="resize-none"
            disabled={isLoading}
          />
          <div className="flex justify-end">
            <span
              className={`text-xs 2xl:text-sm ${
                isOverLimit ? "text-red-600" : "text-gray-400"
              }`}
            >
              {charCount}/{MAX_CHARS} Characters
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 2xl:h-10"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="bg-slate-900 text-white hover:bg-slate-800 2xl:h-10"
          >
            {isLoading ? "PROCESSING..." : "RETURN TO ADMIN"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}