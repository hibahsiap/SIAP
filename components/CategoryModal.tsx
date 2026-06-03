"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type Category = {
    id: string;
    name: string;
    defaultOpdId: string | null;
    defaultOpd: { id: string; name: string } | null;
};

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void | Promise<void>;
    editData: Category | null;
}

type Opd = {
    id: string;
    name: string;
};

export default function CategoryModal({ isOpen, onClose, onSaved, editData }: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [defaultOpdId, setDefaultOpdId] = useState("")
  const [opds, setOpds] = useState<Opd[]>([])

  useEffect(() => {
    fetch("/api/opd")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOpds(data)
      })
      .catch((err) => console.error("Failed to fetch opds:", err))
  }, [])

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name)
        setDefaultOpdId(editData.defaultOpdId || "")
      } else {
        setName("")
        setDefaultOpdId("")
      }
    }
  }, [isOpen, editData])

  const handleSubmit = async () => {
    if (!name) {
      toast.error("Category name is required")
      return
    }

    if (!defaultOpdId) {
      toast.error("Default OPD is required")
      return
    }

    setIsSubmitting(true)
    try {
      const url = editData ? `/api/category/${editData.id}` : "/api/category"
      const method = editData ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          defaultOpdId,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save category")
      }

      toast.success(editData ? "Category updated successfully" : "Category created successfully")
      onSaved()
      onClose()
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={editData ? "Edit Category" : "Add Category"}>
      <div className="space-y-6">
        <FormField 
          label="Category Name" 
          placeholder="Enter category name" 
          value={name} 
          onChange={setName} 
        />

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default OPD</label>
          <Select value={defaultOpdId} onValueChange={setDefaultOpdId}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue placeholder="Pilih Instansi / OPD" />
            </SelectTrigger>
            <SelectContent>
              {opds.map((opd) => (
                <SelectItem key={opd.id} value={opd.id}>{opd.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={onClose} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold" disabled={isSubmitting}>CANCEL</Button>
        <Button onClick={handleSubmit} className="flex-1 bg-[#1a233a] text-white font-bold" disabled={isSubmitting}>
          {isSubmitting ? "SAVING..." : (editData ? "SAVE CHANGES" : "CREATE")}
        </Button>
      </div>
    </CustomModal>
  )
}