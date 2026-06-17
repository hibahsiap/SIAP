import { create } from "zustand";

interface AiResult {
  title?: string | null;
  description?: string | null;
  type?: string | null;
  urgency?: string | null;
  location?: string | null;
  category?: string | null;
}

export interface InteractionItem {
  id: string;
  content?: string;
  [key: string]: unknown;
}

interface InteractionStore {
  isCreateTicketModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedItem: InteractionItem | null;
  context: 'comments' | 'mentions' | 'message' | null;
  aiResult: AiResult | null;
  classifyingItemId: string | null;
  openCreateTicketModal: (item: InteractionItem, context: 'comments' | 'mentions' | 'message') => void;
  classifyAndOpenModal: (item: InteractionItem, context: 'comments' | 'mentions' | 'message') => Promise<void>;
  closeCreateTicketModal: () => void;
  openDeleteModal: (item: InteractionItem, context: 'comments' | 'mentions') => void;
  closeDeleteModal: () => void;
}

export const InteractionStore = create<InteractionStore>((set) => ({
  isCreateTicketModalOpen: false,
  isDeleteModalOpen: false,
  selectedItem: null,
  context: null,
  aiResult: null,
  classifyingItemId: null,
  openCreateTicketModal: (item, context) => set({ isCreateTicketModalOpen: true, selectedItem: item, context, aiResult: null }),
  classifyAndOpenModal: async (item, context) => {
    set({ classifyingItemId: item.id, selectedItem: item, context });
    try {
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: item.content || "" }),
      });
      const aiResult = res.ok ? await res.json() : null;
      set({ aiResult, isCreateTicketModalOpen: true });
    } catch {
      set({ aiResult: null, isCreateTicketModalOpen: true });
    } finally {
      set({ classifyingItemId: null });
    }
  },
  closeCreateTicketModal: () => set({ isCreateTicketModalOpen: false, selectedItem: null, context: null, aiResult: null }),
  openDeleteModal: (item, context) => set({ isDeleteModalOpen: true, selectedItem: item, context }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedItem: null, context: null }),
}));
