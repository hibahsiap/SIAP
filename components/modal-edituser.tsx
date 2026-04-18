"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUserStore } from "@/store/useUserStore"

export default function ModalEditUser() {
  const { isEditModalOpen, closeEditModal, selectedUser } = useUserStore()

  if (!selectedUser) return null;

  return (
    <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => !isOpen && closeEditModal()}>
      <DialogContent className="sm:max-w-112.5 p-6 bg-white rounded-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#1a233a]">Edit User Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
            <Input defaultValue={selectedUser.name} className="bg-gray-50 border-gray-200 text-gray-900" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <Input defaultValue={selectedUser.email} type="email" className="bg-gray-50 border-gray-200 text-gray-900" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OPD</label>
            <Input defaultValue={selectedUser.opd} className="bg-gray-50 border-gray-200 text-gray-900" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
            <Select defaultValue={selectedUser.role.toLowerCase()}>
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button 
            onClick={closeEditModal} 
            variant="outline" 
            className="flex-1 bg-gray-100 hover:bg-gray-200 border-0 text-[#1a233a] font-bold"
          >
            CANCEL
          </Button>
          <Button className="flex-1 bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-bold">
            SAVE CHANGES
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}