"use client";

import { useReturnStore } from "@/store/useReturnStore"
import { Button } from "@/components/ui/button"
import { Task } from "@/types/task"
import ReturnAdminModal from "./ReturnAdminModal"

const ReturnAdminButton = ({task} : {task: Task}) => {

    const openReturnModal = useReturnStore((state) => state.open)

    const handleReturnClick = () => {
        openReturnModal(task.id)
    }

    const handleConfirmReturn = async (ticketId: string, reason: string) => {
        console.log("Return ticket:", { ticketId, reason })
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return(
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