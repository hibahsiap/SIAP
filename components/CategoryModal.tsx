"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";
import { toast } from "sonner";

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] 2xl:text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <Input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border-gray-200 text-gray-900 w-full 2xl:text-base 2xl:mt-2"
    />
  </div>
);

type Opd = { id: string; name: string };

interface Category {
  id: string;
  name: string;
  defaultOpdId: string | null;
  defaultOpd: { id: string; name: string } | null;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: Category | null;
}

export default function CategoryModal({ isOpen, onClose, onSaved, editData }: CategoryModalProps) {
  const isEdit = !!editData;
  const [name, setName] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [defaultOpdId, setDefaultOpdId] = useState("");
  const [opds, setOpds] = useState<Opd[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/opd").then((r) => r.json()).then((d) => setOpds(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setSubCategory((editData as any).subCategory ?? "");
      setDefaultOpdId(editData.defaultOpdId ?? "");
    } else {
      setName("");
      setSubCategory("");
      setDefaultOpdId("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Category name is required");
    if (!subCategory.trim()) return toast.error("Sub Category is required");
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/category/${editData!.id}` : "/api/category";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subCategory: subCategory.trim(), defaultOpdId: defaultOpdId || null }),
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Category updated" : "Category added");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={isEdit ? "Edit Category" : "Add Category"}>
      <div className="space-y-6 mt-2">
        <FormField label="Category" placeholder="Category Name" value={name} onChange={setName} />
        
        {/* <FormField label="Sub Category" placeholder="Sub Category" value={subCategory} onChange={setSubCategory} /> */}

        <div className="space-y-1.5">
          <label className="text-[10px] 2xl:text-xs font-bold text-gray-500 uppercase tracking-wider">OPD</label>
          <Select value={defaultOpdId} onValueChange={setDefaultOpdId}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-200 text-gray-900 2xl:text-base 2xl:mt-2">
              <SelectValue placeholder="Pilih Instansi / OPD" />
            </SelectTrigger>
            <SelectContent>
              {opds.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold 2xl:h-10"
            disabled={submitting}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-[#1a233a] text-white font-bold 2xl:h-10"
          >
            {submitting ? (isEdit ? "SAVING..." : "CREATING...") : (isEdit ? "SAVE CHANGES" : "CREATE")}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
