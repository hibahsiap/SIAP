import { create } from "zustand";

interface InteractionStore {
  isCreateTicketModalOpen: boolean;
  isDeleteModalOpen: boolean;
  selectedItem: any | null;
  context: 'comments' | 'mentions' | 'message' | null;
  openCreateTicketModal: (item: any, context: 'comments' | 'mentions' | 'message') => void;
  closeCreateTicketModal: () => void;
  openDeleteModal: (item: any, context: 'comments' | 'mentions') => void;
  closeDeleteModal: () => void;
}

export const InteractionStore = create<InteractionStore>((set) => ({
  isCreateTicketModalOpen: false,
  isDeleteModalOpen: false,
  selectedItem: null,
  context: null,
  openCreateTicketModal: (item, context) => set({ isCreateTicketModalOpen: true, selectedItem: item, context }),
  closeCreateTicketModal: () => set({ isCreateTicketModalOpen: false, selectedItem: null, context: null }),
  openDeleteModal: (item, context) => set({ isDeleteModalOpen: true, selectedItem: item, context }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedItem: null, context: null }),
}));