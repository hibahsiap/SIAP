"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { useUserStore } from "@/store/useUserStore"
import CustomModal from "@/components/CustomModal"
import { toast } from "sonner"

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <Input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border-gray-200 text-gray-900"
    />
  </div>
)

export default function UserModals() {
  const {
    isAddModalOpen, closeAddModal,
    isEditModalOpen, closeEditModal, selectedUser,
    createUser, updateUser,
  } = useUserStore()

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyAdd = { name: "", email: "", phone: "", role: "OPD" as "ADMIN" | "OPD", opdName: "", password: "" }
  const [addForm, setAddForm] = useState(emptyAdd)

  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "OPD" as "ADMIN" | "OPD", opdName: "" })

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone ?? "",
        role: selectedUser.role,
        opdName: selectedUser.opd?.name ?? "",
      })
    }
  }, [selectedUser])

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error("Name, email, and password are required")
      return
    }
    setIsSubmitting(true)
    try {
      await createUser({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        phone: addForm.phone || undefined,
        role: addForm.role,
        opdName: addForm.opdName || undefined,
      })
      toast.success("User created successfully")
      setAddForm(emptyAdd)
      closeAddModal()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      await updateUser(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        role: editForm.role,
        opdName: editForm.opdName || undefined,
      })
      toast.success("User updated successfully")
      closeEditModal()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ADD USER MODAL */}
      <CustomModal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add User Account">
        <div className="space-y-4">
          <FormField label="Full Name" placeholder="Joni Darmawan" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
          <FormField label="Email Address" placeholder="joni.d@siap.com" type="email" value={addForm.email} onChange={(v) => setAddForm({ ...addForm, email: v })} />
          <FormField label="Phone Number" placeholder="+62 812-3456-7890" value={addForm.phone} onChange={(v) => setAddForm({ ...addForm, phone: v })} />
          <FormField label="OPD" placeholder="Dinas Komunikasi dan Informatika" value={addForm.opdName} onChange={(v) => setAddForm({ ...addForm, opdName: v })} />

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
            <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v as "ADMIN" | "OPD" })}>
              <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="OPD">OPD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <Input
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              className="bg-gray-50 border-gray-200 pr-10 text-gray-900"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <Button onClick={closeAddModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold" disabled={isSubmitting}>CANCEL</Button>
          <Button onClick={handleAdd} className="flex-1 bg-[#1a233a] text-white font-bold" disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : "CREATE USER"}
          </Button>
        </div>
      </CustomModal>

      {/* EDIT USER MODAL */}
      <CustomModal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit User Account">
        {selectedUser && (
          <>
            <div className="space-y-4">
              <FormField label="Full Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
              <FormField label="Email Address" type="email" value={editForm.email} onChange={(v) => setEditForm({ ...editForm, email: v })} />
              <FormField label="Phone Number" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
              <FormField label="OPD" value={editForm.opdName} onChange={(v) => setEditForm({ ...editForm, opdName: v })} />

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as "ADMIN" | "OPD" })}>
                  <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="OPD">OPD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <Button onClick={closeEditModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold" disabled={isSubmitting}>CANCEL</Button>
              <Button onClick={handleEdit} className="flex-1 bg-[#1a233a] text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
              </Button>
            </div>
          </>
        )}
      </CustomModal>
    </>
  )
}
