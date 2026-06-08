import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomModal from "@/components/CustomModal";
import { Loader2 } from "lucide-react";

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
    }
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

  const handleSave = async (newStatus?: string) => {
    if (!ticketData) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title,
        description,
        type: type || null,
        urgency: urgency || null,
        categoryId: categoryId || null,
        assignedOpdId: opdId || null,
      };
      if (newStatus) body.status = newStatus;

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
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!ticketData) return;
    setIsApproving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title,
        description,
        type: type || null,
        urgency: urgency || null,
        categoryId: categoryId || null,
        assignedOpdId: opdId || null,
        status: "TO_DO",
      };
      const res = await fetch(`/api/tickets/${ticketData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to approve");
      onSaved?.();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsApproving(false);
    }
  };

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

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="flex gap-4 mt-8">
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="flex-1 bg-[#EAECEF] hover:bg-[#DCDFE3] border-0 text-[#1a233a] font-bold h-12 rounded-xl transition-colors"
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