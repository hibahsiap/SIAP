"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"
import CustomModal from "@/components/CustomModal"

// Komponen Reusable khusus untuk Form Input
const FormField = ({ label, placeholder, type = "text", defaultValue = "" }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <Input placeholder={placeholder} type={type} defaultValue={defaultValue} className="bg-gray-50 border-gray-200 text-gray-900" />
  </div>
)

export default function UserModals() {
  const { isAddModalOpen, closeAddModal, isEditModalOpen, closeEditModal, selectedUser } = useUserStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <>
      {/* 1. MODAL ADD USER */}
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

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
            <Input placeholder="Admin123" type={showPassword ? "text" : "password"} className="bg-gray-50 border-gray-200 pr-10 text-gray-900" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Button onClick={closeAddModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold">CANCEL</Button>
          <Button onClick={closeAddModal} className="flex-1 bg-[#1a233a] text-white font-bold">CREATE USER</Button>
        </div>
      </CustomModal>

      {/* 2. MODAL EDIT USER */}
      <CustomModal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit User Account">
        {selectedUser && (
          <>
            <div className="space-y-4">
              <FormField label="Full Name" defaultValue={selectedUser.name} />
              <FormField label="Email Address" defaultValue={selectedUser.email} type="email" />
              <FormField label="OPD" defaultValue={selectedUser.opd} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
                <Select defaultValue={selectedUser.role?.toLowerCase()}>
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
    </>
  )
}