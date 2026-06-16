import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";
import { Loader2, X, ImageIcon } from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber: string;
  title: string | null;
  description: string;
  status: string;
  urgency: string | null;
  type: string | null;
  location: string | null;
  opdName: string | null;
  opdId: string | null;
  categoryName: string | null;
  categoryId: string | null;
  attachments?: { id: string; url: string }[];
}

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketData: TicketData | null;
  onSaved?: () => void;
}

type OpdItem = { id: string; name: string };
type CatItem = { id: string; name: string; defaultOpd: { id: string; name: string } | null };

export default function EditTicketModal({ isOpen, onClose, ticketData, onSaved }: EditTicketModalProps) {
  const [title, setTitle] = useState("");
  const [opdId, setOpdId] = useState("");
  const [type, setType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [opds, setOpds] = useState<OpdItem[]>([]);
  const [categories, setCategories] = useState<CatItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [existingAttachments, setExistingAttachments] = useState<{ id: string; url: string }[]>([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 5;

  useEffect(() => {
    if (!isOpen) return;
    if (ticketData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(ticketData.title ?? ticketData.ticketNumber);
      setOpdId(ticketData.opdId ?? "");
      setType(ticketData.type ?? "");
      setUrgency(ticketData.urgency ?? "");
      setDescription(ticketData.description ?? "");
      setCategoryId(ticketData.categoryId ?? "");
      setExistingAttachments(ticketData.attachments ?? []);
    }
    setRemovedAttachmentIds([]);
    setSelectedFiles([]);
    setPreviews((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    setError(null);
    Promise.all([
      fetch("/api/opd").then((r) => r.json()),
      fetch("/api/category").then((r) => r.json()),
    ]).then(([opdData, catData]) => {
      setOpds(Array.isArray(opdData) ? opdData : opdData.data ?? []);
      setCategories(Array.isArray(catData) ? catData : catData.data ?? []);
    }).catch(() => {
      setOpds([]);
      setCategories([]);
    });
  }, [isOpen, ticketData]);

  const totalImages = existingAttachments.length + selectedFiles.length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - totalImages;
    const toAdd = files.slice(0, remaining);
    if (toAdd.length < files.length) {
      setError(`Maksimal ${MAX_IMAGES} gambar.`);
    }
    setSelectedFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      setPreviews((prev) => [...prev, URL.createObjectURL(f)]);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewFile = (i: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const removeExisting = (id: string) => {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  };

  const uploadNewFiles = async () => {
    const uploaded: { url: string; fileName: string; mimeType: string; sizeBytes: number }[] = [];
    for (const file of selectedFiles) {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.error ?? "Upload gambar gagal");
      uploaded.push({
        url: upData.url,
        fileName: upData.fileName,
        mimeType: upData.mimeType,
        sizeBytes: upData.sizeBytes,
      });
    }
    return uploaded;
  };

  const submit = async (newStatus: string | undefined, setBusy: (v: boolean) => void) => {
    if (!ticketData) return;
    setBusy(true);
    setError(null);
    try {
      const uploadedAttachments = await uploadNewFiles();
      const body: Record<string, unknown> = {
        title,
        description,
        type: type || null,
        urgency: urgency || null,
        categoryId: categoryId || null,
        assignedOpdId: opdId || null,
      };
      if (newStatus) body.status = newStatus;
      if (uploadedAttachments.length > 0) body.attachments = uploadedAttachments;
      if (removedAttachmentIds.length > 0) body.removedAttachmentIds = removedAttachmentIds;

      const res = await fetch(`/api/tickets/${ticketData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSave = (newStatus?: string) => submit(newStatus, setIsSubmitting);
  const handleApprove = () => submit("TO_DO", setIsApproving);

  if (!ticketData) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Edit Detail Ticket" size="lg">
      <div className="mb-2 space-y-0.5">
        <p className="text-[13px] text-gray-400 font-medium tracking-wide">This box will be used to update the ticket details.</p>
        <p className="text-[13px] text-gray-400 font-medium tracking-wide">Please review ensure it is assigned to the correct department and category.</p>
      </div>

      <div className="space-y-4 font-sans">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title</label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-300 w-full" 
          />
        </div>

        {/* Assigned OPD */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assigned OPD</label>
          <Select value={opdId} onValueChange={(val) => setOpdId(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih OPD" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {opds.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
          <Select value={categoryId} onValueChange={(val) => {
            setCategoryId(val);
            const cat = categories.find((c) => c.id === val);
            if (cat?.defaultOpd) setOpdId(cat.defaultOpd.id);
          }}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</label>
          <Select value={type} onValueChange={(val) => setType(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="COMPLAINT">Aduan</SelectItem>
              <SelectItem value="QUESTION">Pertanyaan</SelectItem>
              <SelectItem value="FEEDBACK">Saran</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Urgency */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</label>
          <Select value={urgency} onValueChange={(val) => setUrgency(val)}>
            <SelectTrigger className="w-full bg-gray-50 border-gray-100 text-[#1a233a] font-medium h-12 rounded-xl focus:ring-0">
              <SelectValue placeholder="Pilih Prioritas" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pesan Aspirasi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Masukkan pesan aspirasi..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[13px] text-[#1a233a] font-medium min-h-[110px] focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Images */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Images ({totalImages}/{MAX_IMAGES})
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
            {existingAttachments.map((a) => (
              <div key={a.id} className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt="Attachment" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeExisting(a.id)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={i} className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {totalImages < MAX_IMAGES && (
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

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex gap-4 mt-8">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 bg-[#EAECEF] hover:bg-[#DCDFE3] border-0 text-[#1a233a] font-bold h-10 rounded-lg transition-colors"
        >
          CANCEL
        </Button>
        <Button
          onClick={() => handleSave()}
          disabled={isSubmitting || isApproving}
          className="flex-1 bg-[#1a233a] hover:bg-[#0f172a] text-white font-bold h-12 rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "EDIT TICKET"}
        </Button>
      </div>

      {ticketData.status === "ON_HOLD" && (
        <div className="mt-3">
          <Button 
            onClick={handleApprove}
            disabled={isSubmitting || isApproving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl transition-colors disabled:opacity-50"
          >
            {isApproving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "APPROVE & SEND TO OPD"}
          </Button>
        </div>
      )}
    </CustomModal>
  );
}