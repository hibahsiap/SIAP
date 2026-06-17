"use client";

import { useEffect, useRef, useState } from "react";
import CustomModal from "@/components/CustomModal";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, ImageIcon } from "lucide-react";

interface AiResult {
  title?: string | null;
  description?: string | null;
  type?: string | null;
  urgency?: string | null;
  location?: string | null;
  category?: string | null;
}

interface Props {
  isOpen: boolean;
  conversationId: string;
  messageId: string;
  messagePreview: string;
  aiResult?: AiResult;
  onClose: () => void;
  onCreated: () => void;
}

type Opd = { id: string; name: string };
type Category = { id: string; name: string; defaultOpd: { id: string; name: string } | null };

export default function CreateTicketFromChatModal({
  isOpen,
  conversationId,
  messageId,
  messagePreview,
  aiResult,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState(aiResult?.title ?? messagePreview.slice(0, 80));
  const [description, setDescription] = useState(aiResult?.description ?? messagePreview);
  const [opdId, setOpdId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState(aiResult?.location ?? "");
  const [urgency, setUrgency] = useState(aiResult?.urgency ?? "");
  const [type, setType] = useState(aiResult?.type ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opds, setOpds] = useState<Opd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form when the modal opens. The synchronous resets are an
  // intentional one-time initialization tied to the modal lifecycle.
  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(aiResult?.title ?? messagePreview.slice(0, 80));
    setDescription(aiResult?.description ?? messagePreview);
    setOpdId("");
    setCategoryId("");
    setLocation(aiResult?.location ?? "");
    setUrgency(aiResult?.urgency ?? "");
    setType(aiResult?.type ?? "");
    setError(null);
    setSelectedFiles([]);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    Promise.all([
      fetch("/api/opd").then((r) => r.json()),
      fetch("/api/category").then((r) => r.json()),
    ]).then(([opdData, catData]) => {
      setOpds(Array.isArray(opdData) ? opdData : opdData.data ?? []);
      const cats: Category[] = Array.isArray(catData) ? catData : catData.data ?? [];
      setCategories(cats);
      if (aiResult?.category) {
        const match = cats.find((c) =>
          c.name.toLowerCase().includes(aiResult.category!.toLowerCase()) ||
          aiResult.category!.toLowerCase().includes(c.name.toLowerCase())
        );
        if (match) {
          setCategoryId(match.id);
          if (match.defaultOpd) setOpdId(match.defaultOpd.id);
        }
      }
    });
  }, [isOpen, messagePreview, aiResult]);

  const MAX_IMAGES = 5;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - selectedFiles.length;
    const toAdd = files.slice(0, remaining);
    if (toAdd.length < files.length) {
      setError(`Maksimal ${MAX_IMAGES} gambar. Hanya ${remaining} yang ditambahkan.`);
    }
    setSelectedFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      setPreviews((prev) => [...prev, URL.createObjectURL(f)]);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      const url = prev[i];
      URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleCreate = async () => {
    if (!opdId) { setError("Please select an OPD first"); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const uploadedAttachments: { url: string; fileName: string; mimeType: string; sizeBytes: number }[] = [];
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const fd = new FormData();
          fd.append("file", file);
          const upRes = await fetch("/api/upload", { method: "POST", body: fd });
          const upData = await upRes.json();
          if (!upRes.ok) throw new Error(upData.error ?? "Upload gambar gagal");
          uploadedAttachments.push({
            url: upData.url,
            fileName: upData.fileName,
            mimeType: upData.mimeType,
            sizeBytes: upData.sizeBytes,
          });
        }
      }

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messageId,
          opdId,
          title,
          description,
          location: location || undefined,
          categoryId: categoryId || undefined,
          urgency: urgency || undefined,
          type: type || undefined,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create ticket");
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Create Ticket from Chat">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 -mt-4">
          A ticket will be created and this message will be automatically forwarded to the selected OPD.
        </p>

        <div>
          {aiResult && (
            <div className="flex justify-end mb-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                ✦ Pre-filled by AI
              </span>
            </div>
          )}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-slate-700 italic break-words">
            &ldquo;{messagePreview.slice(0, 120)}{messagePreview.length > 120 ? "…" : ""}&rdquo;
          </div>
        </div>

        <Field
          title="TICKET TITLE"
          placeholder="Enter ticket title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-[12px] uppercase text-[#546064]">DESCRIPTION</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue..."
            className="min-h-[80px] border-[#D2D2D2] rounded-lg text-sm resize-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-[12px] uppercase text-[#546064]">
            IMAGES ({selectedFiles.length}/{MAX_IMAGES})
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <div key={i} className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {selectedFiles.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-[#1a233a] hover:text-[#1a233a] transition-colors"
              >
                <ImageIcon size={18} />
                <span className="text-[9px] font-medium">Add</span>
              </button>
            )}
          </div>
        </div>

        <Field
          title="LOCATION"
          placeholder="Enter location (optional)"
          value={location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-[12px] uppercase text-[#546064]">CATEGORY</label>
          <Select value={categoryId} onValueChange={(val) => {
            setCategoryId(val);
            const cat = categories.find((c) => c.id === val);
            if (cat?.defaultOpd) setOpdId(cat.defaultOpd.id);
          }}>
            <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] rounded-lg text-sm">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-semibold text-[12px] uppercase text-[#546064]">ASSIGNED OPD *</label>
          <Select value={opdId} onValueChange={setOpdId}>
            <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] rounded-lg text-sm">
              <SelectValue placeholder="Select OPD..." />
            </SelectTrigger>
            <SelectContent>
              {opds.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">URGENCY</label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] rounded-lg text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">TYPE</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full h-[45px] border-[#D2D2D2] rounded-lg text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLAINT">Complaint</SelectItem>
                <SelectItem value="QUESTION">Question</SelectItem>
                <SelectItem value="FEEDBACK">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="w-full sm:flex-1 h-[45px] rounded-lg">
            CANCEL
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !opdId}
            className="w-full sm:flex-1 h-[45px] bg-[#1a233a] rounded-lg text-white"
          >
            {isSubmitting ? "Creating…" : "CREATE TICKET"}
          </Button>
        </div>
      </div>
    </CustomModal>
  );
}
