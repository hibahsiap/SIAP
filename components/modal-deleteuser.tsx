"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useUserStore } from "@/store/useUserStore"

export default function ModalDeleteUser() {
  const { isDeleteModalOpen, closeDeleteModal, selectedUser } = useUserStore()

  if (!selectedUser) return null;

  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={(isOpen) => !isOpen && closeDeleteModal()}>
      <DialogContent className="sm:max-w-[400px] p-8 bg-white rounded-2xl flex flex-col items-center text-center">
        <DialogHeader className="w-full flex flex-col items-center">
          <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
            Do you want to delete?
          </DialogTitle>
          <DialogDescription className="sr-only">
            Konfirmasi penghapusan data pengguna.
          </DialogDescription>
        </DialogHeader>

        {/* Bagian Teks Sub-judul */}
        <div className="mb-4 mt-1">
          <p className="text-gray-500 text-[15px]">
            This user account <span className="font-semibold text-gray-700">"{selectedUser.name}"</span> will be permanently deleted.
          </p>
        </div>

        {/* Tombol Action */}
        <div className="flex gap-3 w-full mt-4">
          <Button 
            onClick={closeDeleteModal} 
            variant="outline" 
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-0 text-[#1a233a] font-bold py-6 rounded-xl"
          >
            CANCEL
          </Button>
          <Button 
            onClick={closeDeleteModal}
            className="flex-1 bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-bold py-6 rounded-xl shadow-md"
          >
            DELETE
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  )
}