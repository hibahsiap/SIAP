"use client";

import { useReturnStore, ReturnTicketOption } from "@/store/useReturnStore"
import { Button } from "@/components/ui/button"
import ReturnAdminModal from "./ReturnAdminModal"

const ReturnAdminButton = ({ tickets }: { tickets: ReturnTicketOption[] }) => {
    const openWithTickets = useReturnStore((state) => state.openWithTickets)

    const handleReturnClick = () => {
        openWithTickets(tickets)
    }

    const handleConfirmReturn = async (ticketId: string, reason: string) => {
        const res = await fetch(`/api/opd/tickets/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ON_HOLD", note: reason }),
        })
        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error ?? "Failed to return ticket")
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                onClick={handleReturnClick}
                className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
            >
                Return to Admin
            </Button>
            <ReturnAdminModal onConfirm={handleConfirmReturn} />
        </>
    )
}

export default ReturnAdminButton
