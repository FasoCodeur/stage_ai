import { create } from "zustand"
import { USERS, type User } from "@/lib/mock-data"

interface UserFilters {
  role?: string
  search?: string
}

interface UserState {
  users: User[]
  filters: UserFilters
  selectedUser: User | null
  isLoading: boolean

  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  setFilters: (filters: Partial<UserFilters>) => void
  setSelectedUser: (user: User | null) => void
  setLoading: (loading: boolean) => void

  getFilteredUsers: () => User[]
  getUserById: (id: string) => User | undefined
  getUsersByRole: (role: string) => User[]
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: USERS,
  filters: {},
  selectedUser: null,
  isLoading: false,

  setUsers: (users) => set({ users }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setLoading: (isLoading) => set({ isLoading }),

  getFilteredUsers: () => {
    const { users, filters } = get()
    return users.filter((user) => {
      const matchesRole = filters.role ? user.role === filters.role : true
      const matchesSearch = filters.search
        ? user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          user.email.toLowerCase().includes(filters.search.toLowerCase())
        : true
      return matchesRole && matchesSearch
    })
  },

  getUserById: (id) => get().users.find((u) => u.id === id),

  getUsersByRole: (role) => get().users.filter((u) => u.role === role),
}))
