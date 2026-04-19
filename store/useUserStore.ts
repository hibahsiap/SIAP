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
  // --- TAMBAHAN BARU: State untuk Add Modal ---
  isAddModalOpen: boolean;
  openAddModal: () => void;
  closeAddModal: () => void;

  // State Edit
  isEditModalOpen: boolean;
  selectedUser: User | null;
  openEditModal: (user: User) => void;
  closeEditModal: () => void;

  // State Delete
  isDeleteModalOpen: boolean;
  openDeleteModal: (user: User) => void;
  closeDeleteModal: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  // --- TAMBAHAN BARU: Fungsi Add ---
  isAddModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  // State Edit
  isEditModalOpen: false,
  selectedUser: null,
  openEditModal: (user) => set({ isEditModalOpen: true, selectedUser: user }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedUser: null }),

  // State Delete
  isDeleteModalOpen: false,
  openDeleteModal: (user) => set({ isDeleteModalOpen: true, selectedUser: user }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedUser: null }),
}))