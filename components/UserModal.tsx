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
      className="bg-gray-50 border-gray-200 text-gray-900 w-full"
    />
  </div>
)

// List Contoh OPD disesuaikan dengan gambar tabel
const OPD_LIST = [
  "Dinas Sosial",
  "Dinas Komunikasi Dan Informatika",
  "Dinas Pendidikan",
  "Dinas Kesehatan",
  "Dinas Pekerjaan Umum Dan Penataan Ruang",
  "Dinas Kependudukan Dan Pencatatan Sipil",
  "Dinas Lingkungan Hidup",
  "Dinas Perhubungan",
  "Dinas Pariwisata",
  "Badan Perencanaan Pembangunan Daerah",
  "Badan Penanggulangan Bencana Daerah",
  "Dinas Perdagangan"
];

export default function UserModals() {
  const {
    isAddModalOpen, closeAddModal,
    isEditModalOpen, closeEditModal, selectedUser,
    createUser, updateUser,
  } = useUserStore()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyAdd = { name: "", email: "", phone: "", role: "OPD" as "ADMIN" | "OPD", opdName: "", password: "", confirmPassword: "" }
  const [addForm, setAddForm] = useState(emptyAdd)

  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "OPD" as "ADMIN" | "OPD", opdName: "" })

  useEffect(() => {
    if (selectedUser) {
      // Handle penangkapan data OPD baik dari flat object maupun nested object
      // ignore ts error kalau storenya belum diupdate tipe datanya
      const userOpd = (selectedUser as any).opdName || selectedUser.opd?.name || "";
      
      setEditForm({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone ?? "",
        role: selectedUser.role || "OPD",
        opdName: userOpd,
      })
    }
  }, [selectedUser])

  useEffect(() => {
    if (!isAddModalOpen) {
      setAddForm(emptyAdd)
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddModalOpen])

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) {
      toast.error("Name, email, and password are required")
      return
    }
    if (addForm.password !== addForm.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    setIsSubmitting(true)
    try {
      const finalEmail = addForm.email.includes("@") ? addForm.email : `${addForm.email}@hibah.go.id`

      await createUser({
        name: addForm.name,
        email: finalEmail,
        password: addForm.password,
        phone: addForm.phone || undefined,
        role: addForm.role,
        opdName: addForm.opdName || undefined,
      })
      toast.success("User created successfully")
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
      const finalEmail = editForm.email.includes("@") ? editForm.email : `${editForm.email}@hibah.go.id`
      
      await updateUser(selectedUser.id, {
        name: editForm.name,
        email: finalEmail,
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

  // Fungsi helper untuk merender opsi OPD secara dinamis di form edit
  const renderEditOpdOptions = () => {
    const options = [...OPD_LIST];
    // Kalau OPD dari database belum ada di list default, tambahin otomatis
    if (editForm.opdName && !options.includes(editForm.opdName)) {
      options.push(editForm.opdName);
    }
    return options.map((opd) => (
      <SelectItem key={opd} value={opd}>{opd}</SelectItem>
    ));
  }

  return (
    <>
      {/* ADD USER MODAL */}
      <CustomModal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add User Account">
        <div className="space-y-4">
          <FormField label="Full Name" placeholder="Joni Darmawan" value={addForm.name} onChange={(v) => setAddForm({ ...addForm, name: v })} />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="flex">
              <Input
                placeholder="nama.opd"
                value={addForm.email.replace('@hibah.go.id', '')}
                onChange={(e) => setAddForm({ ...addForm, email: `${e.target.value}@hibah.go.id` })}
                className="bg-gray-50 border-gray-200 text-gray-900 rounded-r-none focus-visible:ring-1 focus-visible:ring-ring w-full"
              />
              <div className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-md px-3 flex items-center text-gray-500 text-sm whitespace-nowrap">
                @hibah.go.id
              </div>
            </div>
          </div>

          <FormField label="Phone Number" placeholder="0812-0000-0000" value={addForm.phone} onChange={(v) => setAddForm({ ...addForm, phone: v })} />
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OPD</label>
            <Select value={addForm.opdName} onValueChange={(v) => setAddForm({ ...addForm, opdName: v })}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Pilih Instansi / OPD" />
              </SelectTrigger>
              <SelectContent>
                {OPD_LIST.map((opd) => (
                  <SelectItem key={opd} value={opd}>{opd}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
            <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v as "ADMIN" | "OPD" })}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
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
              className="bg-gray-50 border-gray-200 pr-10 text-gray-900 w-full"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
            <Input
              placeholder="••••••••"
              type={showConfirmPassword ? "text" : "password"}
              value={addForm.confirmPassword}
              onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
              className={`bg-gray-50 border-gray-200 pr-10 text-gray-900 w-full ${addForm.confirmPassword && addForm.password !== addForm.confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[26px] text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="flex">
                  <Input
                    placeholder="nama.opd"
                    value={editForm.email.replace('@hibah.go.id', '')}
                    onChange={(e) => setEditForm({ ...editForm, email: `${e.target.value}@hibah.go.id` })}
                    className="bg-gray-50 border-gray-200 text-gray-900 rounded-r-none focus-visible:ring-1 focus-visible:ring-ring w-full"
                  />
                  <div className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-md px-3 flex items-center text-gray-500 text-sm whitespace-nowrap">
                    @hibah.go.id
                  </div>
                </div>
              </div>

              <FormField label="Phone Number" placeholder="0812-0000-0000" value={editForm.phone} onChange={(v) => setEditForm({ ...editForm, phone: v })} />
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">OPD</label>
                <Select value={editForm.opdName} onValueChange={(v) => setEditForm({ ...editForm, opdName: v })}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Pilih Instansi / OPD" />
                  </SelectTrigger>
                  <SelectContent>
                    {renderEditOpdOptions()}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Role</label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as "ADMIN" | "OPD" })}>
                  <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
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