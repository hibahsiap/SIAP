import { create } from 'zustand';

export type Task = any; 

interface TaskState {
  // State Edit
  isEditModalOpen: boolean;
  selectedTask: Task | null;
  openEditModal: (task: Task) => void;
  closeEditModal: () => void;

  // State Delete
  isDeleteModalOpen: boolean;
  openDeleteModal: (task: Task) => void;
  closeDeleteModal: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  isEditModalOpen: false,
  selectedTask: null,
  openEditModal: (task) => set({ isEditModalOpen: true, selectedTask: task }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedTask: null }),

  isDeleteModalOpen: false,
  openDeleteModal: (task) => set({ isDeleteModalOpen: true, selectedTask: task }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedTask: null }),
}));