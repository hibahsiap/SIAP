import { create } from 'zustand'

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  opd: string;
}

interface UserState {
  // State untuk Edit Modal
  isEditModalOpen: boolean;
  selectedUser: User | null;
  openEditModal: (user: User) => void;
  closeEditModal: () => void;

  // --- TAMBAHAN BARU: State untuk Delete Modal ---
  isDeleteModalOpen: boolean;
  openDeleteModal: (user: User) => void;
  closeDeleteModal: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // State Edit
  isEditModalOpen: false,
  selectedUser: null,
  openEditModal: (user) => set({ isEditModalOpen: true, selectedUser: user }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedUser: null }),

  // --- TAMBAHAN BARU: Fungsi Delete ---
  isDeleteModalOpen: false,
  openDeleteModal: (user) => set({ isDeleteModalOpen: true, selectedUser: user }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedUser: null }),
}))