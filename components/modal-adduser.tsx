"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"

export default function ModalAddUser() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isAddModalOpen, closeAddModal } = useUserStore()

  return (

    <Dialog open={isAddModalOpen} onOpenChange={(isOpen) => !isOpen && closeAddModal()}>
      <DialogContent className="sm:max-w-[450px] p-6 bg-white rounded-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-[#1a233a]">Add User Account</DialogTitle>
          <DialogDescription className="sr-only">
            Form untuk menambahkan user baru.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Field: Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
            <Input className="bg-gray-50 border-gray-200" />
          </div>

          {/* Field: Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <Input type="email" className="bg-gray-50 border-gray-200" />
          </div>

          {/* Field: OPD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OPD</label>
            <Input className="bg-gray-50 border-gray-200" />
          </div>

          {/* Field: Assigned Role */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
            <Select>
              <SelectTrigger className="bg-gray-50 border-gray-200">
                <SelectValue placeholder="Admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="opd">OPD</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field: Password */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                className="bg-gray-50 border-gray-200 pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Field: Confirm Password */}
          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Your New Password</label>
            <div className="relative">
              <Input  
                type={showConfirmPassword ? "text" : "password"} 
                className="bg-gray-50 border-gray-200 pr-10" 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tombol Action */}
        <div className="flex gap-3 mt-6">
          <Button onClick={closeAddModal} variant="outline" className="flex-1 bg-gray-100 hover:bg-gray-200 border-0 text-[#1a233a] font-bold">
            CANCEL
          </Button>
          <Button onClick={closeAddModal} className="flex-1 bg-[#1a233a] hover:bg-[#1a233a]/90 text-white font-bold">
            CREATE USER
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}