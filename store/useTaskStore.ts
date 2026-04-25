import { create } from 'zustand';
interface TaskState {
  isAddTaskModalOpen: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
}
export const useTaskStore = create<TaskState>((set) => ({
  isAddTaskModalOpen: false,
  openAddTaskModal: () => set({ isAddTaskModalOpen: true }),
  closeAddTaskModal: () => set({ isAddTaskModalOpen: false }),
}));