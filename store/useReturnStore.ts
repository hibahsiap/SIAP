import { create } from "zustand"

type ReturnStore = {
  isOpen: boolean
  ticketId: string | null
  isLoading: boolean
  open: (ticketId: string) => void
  close: () => void
  setLoading: (loading: boolean) => void
}

export const useReturnStore = create<ReturnStore>((set) => ({
  isOpen: false,
  ticketId: null,
  isLoading: false,
  open: (ticketId) => set({ isOpen: true, ticketId }),
  close: () => set({ isOpen: false, ticketId: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))