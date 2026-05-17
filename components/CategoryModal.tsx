"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";
import { toast } from "sonner";

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
  const [defaultOpdId, setDefaultOpdId] = useState("");
  const [opds, setOpds] = useState<Opd[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/opd").then((r) => r.json()).then((d) => setOpds(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDefaultOpdId(editData.defaultOpdId ?? "");
    } else {
      setName("");
      setDefaultOpdId("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error("Category name is required");
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/category/${editData!.id}` : "/api/category";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), defaultOpdId: defaultOpdId || null }),
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
      <div className="flex flex-col gap-4 mt-2">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
          <Input
            placeholder="e.g. Jalan dan Infrastruktur"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border-gray-200 text-gray-900"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Default OPD</label>
          <Select value={defaultOpdId} onValueChange={setDefaultOpdId}>
            <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900">
              <SelectValue placeholder="Select OPD" />
            </SelectTrigger>
            <SelectContent>
              {opds.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 mt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 h-[45px] bg-[#F1F3F5] hover:bg-[#E5E7EB] border-0 text-[#1a233a] font-bold rounded-lg"
          >
            CANCEL
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 h-[45px] bg-[#1a233a] hover:bg-[#0f172a] text-white font-bold rounded-lg"
          >
            {submitting ? "Saving..." : isEdit ? "SAVE" : "ADD"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
