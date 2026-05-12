import { create } from 'zustand'

export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'admin' | 'opd'
  opd: { id: string; name: string } | null
  createdAt: string
}

export type CreateUserData = {
  name: string
  email: string
  password: string
  phone?: string
  role: 'admin' | 'opd'
  opdName?: string
}

export type UpdateUserData = {
  name?: string
  email?: string
  phone?: string
  role?: 'admin' | 'opd'
  opdName?: string
}

interface UserState {
  users: User[]
  isLoading: boolean
  error: string | null

  isAddModalOpen: boolean
  openAddModal: () => void
  closeAddModal: () => void

  isEditModalOpen: boolean
  selectedUser: User | null
  openEditModal: (user: User) => void
  closeEditModal: () => void

  isDeleteModalOpen: boolean
  openDeleteModal: (user: User) => void
  closeDeleteModal: () => void

  fetchUsers: () => Promise<void>
  createUser: (data: CreateUserData) => Promise<void>
  updateUser: (id: string, data: UpdateUserData) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  isAddModalOpen: false,
  openAddModal: () => set({ isAddModalOpen: true }),
  closeAddModal: () => set({ isAddModalOpen: false }),

  isEditModalOpen: false,
  selectedUser: null,
  openEditModal: (user) => set({ isEditModalOpen: true, selectedUser: user }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedUser: null }),

  isDeleteModalOpen: false,
  openDeleteModal: (user) => set({ isDeleteModalOpen: true, selectedUser: user }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedUser: null }),

  fetchUsers: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const users: User[] = await res.json()
      set({ users, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  createUser: async (data) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Failed to create user')
    }
    const newUser: User = await res.json()
    set((state) => ({ users: [newUser, ...state.users] }))
  },

  updateUser: async (id, data) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Failed to update user')
    }
    const updated: User = await res.json()
    set((state) => ({ users: state.users.map((u) => (u.id === id ? updated : u)) }))
  },

  deleteUser: async (id) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete user')
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }))
  },
}))
