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

export default function CategoryModals() {
  const {
    isAddModalOpen, closeAddModal,
    isEditModalOpen, closeEditModal, selectedUser,
    createUser, updateUser,
  } = useUserStore()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const emptyAdd = { category: "", subCategory:"", opdName: "" }
  const [addForm, setAddForm] = useState(emptyAdd)

  const [editForm, setEditForm] = useState({ category: "", subCategory: "", opdName: "" })

  useEffect(() => {
    if (selectedUser) {
      // Handle penangkapan data OPD baik dari flat object maupun nested object
      // ignore ts error kalau storenya belum diupdate tipe datanya
      const userOpd = (selectedUser as any).opdName || selectedUser.opd?.name || "";
      
      // setEditForm({
      //   name: selectedUser.name || "",
      //   email: selectedUser.email || "",
      //   phone: selectedUser.phone ?? "",
      //   role: selectedUser.role || "OPD",
      //   opdName: userOpd,
      // })
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
    if (!addForm.category || !addForm.opdName || !addForm.subCategory) {
      toast.error("Category, sub category, and OPD are required")
      return
    }

    setIsSubmitting(true)
    try {

      // await createUser({
      //   name: addForm.name,
      //   // email: finalEmail,
      //   password: addForm.password,
      //   phone: addForm.phone || undefined,
      //   role: addForm.role,
      //   opdName: addForm.opdName || undefined,
      // })
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
      
      // await updateUser(selectedUser.id, {
      //   name: editForm.name,
      //   email: finalEmail,
      //   phone: editForm.phone || undefined,
      //   role: editForm.role,
      //   opdName: editForm.opdName || undefined,
      // })
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
      {/* ADD CATEGORY MODAL */}
      <CustomModal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add Category">
        <div className="space-y-6">

          <FormField label="Category" placeholder="Category Name" value={addForm.category} onChange={(v) => setAddForm({ ...addForm, category: v })} />

          <FormField label="Sub Category" placeholder="Sub Category" value={addForm.subCategory} onChange={(v) => setAddForm({ ...addForm, subCategory: v })} />
          
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

        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={closeAddModal} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold" disabled={isSubmitting}>CANCEL</Button>
          <Button onClick={handleAdd} className="flex-1 bg-[#1a233a] text-white font-bold" disabled={isSubmitting}>
            {isSubmitting ? "CREATING..." : "CREATE"}
          </Button>
        </div>
      </CustomModal>

      {/* EDIT USER MODAL */}
      <CustomModal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Category">
        {selectedUser && (
          <>
            <div className="space-y-6">
              <FormField label="Category" value={editForm.category} onChange={(v) => setEditForm({ ...editForm, category: v })} />

              <FormField label="Sub Category" placeholder="Sub Category" value={addForm.subCategory} onChange={(v) => setAddForm({ ...addForm, subCategory: v })} />
              
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

            </div>
            <div className="flex gap-3 mt-6">
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