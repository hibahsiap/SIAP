"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"
import { useTaskStore } from "@/store/useTaskStore"
import CustomModal from "@/components/CustomModal"

const FormField = ({ label, placeholder, type = "text", defaultValue = "" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <Input placeholder={placeholder} type={type} defaultValue={defaultValue} className="bg-gray-50 border-gray-200 text-gray-900" />
  </div>
)

export default function UserModals() {
  const {
    isAddModalOpen, closeAddModal,
    isEditModalOpen, closeEditModal,
    isDeleteModalOpen, closeDeleteModal,
    selectedUser
  } = useUserStore()

  const { isAddTaskModalOpen, closeAddTaskModal } = useTaskStore();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <>
      {/* MODAL ADD USER */}
      <CustomModal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add User Account">
        <div className="space-y-4">
          <FormField label="Full Name" placeholder="Joni Darmawan" />
          <FormField label="Email Address" placeholder="joni.d@siap.com" type="email" />
          <FormField label="OPD" placeholder="Dinas Komunikasi dan Informatika" />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
            <Select>
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue placeholder="Admin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
            <Input placeholder="Admin123" type={showPassword ? "text" : "password"} className="bg-gray-50 border-gray-200 pr-10 text-gray-900" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Your New Password</label>
            <Input placeholder="••••••••" type={showConfirmPassword ? "text" : "password"} className="bg-gray-50 border-gray-200 pr-10 text-gray-900" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Button onClick={closeAddModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold">CANCEL</Button>
          <Button onClick={closeAddModal} className="flex-1 bg-[#1a233a] text-white font-bold">CREATE USER</Button>
        </div>
      </CustomModal>

      {/* MODAL EDIT USER */}
      <CustomModal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit User Account">
        {selectedUser && (
          <>
            <div className="space-y-4">
              <FormField label="Full Name" defaultValue={selectedUser.name} />
              <FormField label="Email Address" defaultValue={selectedUser.email} type="email" />
              <FormField label="OPD" defaultValue={selectedUser.opd} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
                <Select defaultValue={selectedUser.role.toLowerCase()}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="opd">OPD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button onClick={closeEditModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold">CANCEL</Button>
              <Button onClick={closeEditModal} className="flex-1 bg-[#1a233a] text-white font-bold">SAVE CHANGES</Button>
            </div>
          </>
        )}
      </CustomModal>

      {/* MODAL DELETE USER */}
      <CustomModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Do you want to delete?" isAlert>
        {selectedUser && (
          <>
            <div className="mb-4 mt-1">
              <p className="text-gray-500 text-[15px]">
                This user account <span className="font-semibold text-gray-700">"{selectedUser.name}"</span> will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 w-full mt-4">
              <Button onClick={closeDeleteModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold py-6 rounded-xl">CANCEL</Button>
              <Button onClick={closeDeleteModal} className="flex-1 bg-[#1a233a] text-white font-bold py-6 rounded-xl">DELETE</Button>
            </div>
          </>
        )}
      </CustomModal>

      {/* MODAL ADD NEW TASK */}
      <CustomModal isOpen={isAddTaskModalOpen} onClose={closeAddTaskModal} title="Add New Task">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <FormField label="Task Name" placeholder="Laporan Kemajuan..." />
          <FormField label="OPD" placeholder="Dinas Sosial" />
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue placeholder="On Hold" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Priority</label>
              <Select>
                <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue placeholder="Low" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" type="date" />
            <FormField label="Due Date" type="date" />
          </div>

          <FormField label="Pesan Aspirasi" placeholder="Tulis deskripsi tugas..." isTextarea={true} />
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button onClick={closeAddTaskModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold">CANCEL</Button>
          <Button onClick={closeAddTaskModal} className="flex-1 bg-[#1D2F58] hover:bg-[#041942] text-white font-bold">CREATE TASK</Button>
        </div>
      </CustomModal>
    </>
  )
}