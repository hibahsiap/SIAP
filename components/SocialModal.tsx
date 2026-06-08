"use client";

import { useEffect, useState } from "react";
import { InteractionStore } from "@/components/InteractionStore";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DeleteModal from "@/components/DeleteModal";

type Opd = { id: string; name: string };
type Category = { id: string; name: string; defaultOpd: { id: string; name: string } | null };

export default function SocialTicketModal({ onSuccess }: { onSuccess?: () => void } = {}) {
  const { isCreateTicketModalOpen, closeCreateTicketModal, isDeleteModalOpen, closeDeleteModal, selectedItem, context, aiResult, classifyingItemId } = InteractionStore();
  const formattedItemName = context === 'comments' ? 'comment' : context === 'mentions' ? 'mentions' : 'message';

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [opdId, setOpdId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState("");
  const [type, setType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [opds, setOpds] = useState<Opd[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!isCreateTicketModalOpen || !selectedItem) return;

    const content = selectedItem.content || "";

    if (aiResult) {
      setTitle(aiResult.title ?? content.slice(0, 80));
      setDescription(aiResult.description ?? content);
      setLocation(aiResult.location ?? "");
      setUrgency(aiResult.urgency ?? "");
      setType(aiResult.type ?? "");
    } else {
      setTitle(content.slice(0, 80));
      setDescription(content);
      setLocation("");
      setUrgency("");
      setType("");
    }
    setOpdId("");
    setCategoryId("");
    setError(null);

    fetch("/api/opd").then((r) => r.json()).then((data) => {
      setOpds(Array.isArray(data) ? data : data.data ?? []);
    });
    fetch("/api/category").then((r) => r.json()).then((data) => {
      const cats: Category[] = Array.isArray(data) ? data : data.data ?? [];
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
  }, [isCreateTicketModalOpen, selectedItem, aiResult]);

  const handleCreate = async () => {
    if (!opdId) { setError("Please select an OPD first"); return; }
    if (!selectedItem) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socialInteractionId: selectedItem.id,
          opdId,
          title,
          description,
          location: location || undefined,
          categoryId: categoryId || undefined,
          urgency: urgency || undefined,
          type: type || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create ticket");
      onSuccess?.();
      closeCreateTicketModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/social-interactions/${selectedItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onSuccess?.();
      } else {
        console.error("Failed to delete interaction");
      }
    } catch (err) {
      console.error(err);
    } finally {
      closeDeleteModal();
    }
  };

  return (
    <>
      <CustomModal 
        isOpen={isCreateTicketModalOpen} 
        onClose={closeCreateTicketModal} 
        title={`Create New Ticket from ${context === 'comments' ? 'Comments' : context === 'mentions' ? 'Mentions' : 'Message'}`}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 -mt-4">
            A ticket will be created from this social media {formattedItemName}.
          </p>

          {selectedItem?.content && (
            <div>
              {aiResult && (
                <div className="flex justify-end mb-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    ✦ Pre-filled by AI
                  </span>
                </div>
              )}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-slate-700 italic break-words">
                &ldquo;{selectedItem.content.slice(0, 120)}{selectedItem.content.length > 120 ? "…" : ""}&rdquo;
              </div>
            </div>
          )}

          {classifyingItemId && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-purple-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Classifying message with AI…
            </div>
          )}

          <div className="w-full flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">TICKET TITLE</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter ticket title"
              className="border-[#D2D2D2] rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">DESCRIPTION</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="min-h-[80px] border-[#D2D2D2] rounded-lg text-sm resize-none"
            />
          </div>

          <div className="w-full flex flex-col gap-1">
            <label className="font-semibold text-[12px] uppercase text-[#546064]">LOCATION</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location (optional)"
              className="border-[#D2D2D2] rounded-lg"
            />
          </div>

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
            <Button onClick={closeCreateTicketModal} variant="outline" className="w-full sm:flex-1 h-[45px] rounded-lg">
              CANCEL
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting || !opdId || !!classifyingItemId}
              className="w-full sm:flex-1 h-[45px] bg-[#1a233a] rounded-lg text-white"
            >
              {isSubmitting ? "Creating…" : "CREATE TICKET"}
            </Button>
          </div>
        </div>
      </CustomModal>

      <DeleteModal 
        isOpen={isDeleteModalOpen} 
        onClose={closeDeleteModal} 
        onConfirm={handleConfirmDelete} 
        itemName={formattedItemName} 
      />
    </>
  );
}
