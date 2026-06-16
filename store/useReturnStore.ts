import { create } from "zustand"

export type ReturnTicketOption = { id: string; ticketNumber: string }

type ReturnStore = {
  isOpen: boolean
  ticketId: string | null
  tickets: ReturnTicketOption[]
  isLoading: boolean
  open: (ticketId: string) => void
  openWithTickets: (tickets: ReturnTicketOption[]) => void
  close: () => void
  setLoading: (loading: boolean) => void
}

export const useReturnStore = create<ReturnStore>((set) => ({
  isOpen: false,
  ticketId: null,
  tickets: [],
  isLoading: false,
  open: (ticketId) => set({ isOpen: true, ticketId, tickets: [] }),
  openWithTickets: (tickets) => set({ isOpen: true, tickets, ticketId: null }),
  close: () => set({ isOpen: false, ticketId: null, tickets: [], isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
