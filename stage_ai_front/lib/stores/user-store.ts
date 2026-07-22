import { create } from "zustand"
import { USERS, type User } from "@/lib/mock-data"
import { useAuditStore } from "./audit-store"

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
  addUser: (
    user: User,
    actor?: { id: string; name: string; role: string }
  ) => void
  updateUser: (
    id: string,
    data: Partial<User>,
    actor?: { id: string; name: string; role: string }
  ) => void
  deleteUser: (
    id: string,
    actor?: { id: string; name: string; role: string }
  ) => void
  setFilters: (filters: Partial<UserFilters>) => void
  setSelectedUser: (user: User | null) => void
  setLoading: (loading: boolean) => void

  getFilteredUsers: () => User[]
  getUserById: (id: string) => User | undefined
  getUsersByRole: (role: string) => User[]
  getProfessors: () => User[]
  getStudents: () => User[]
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: USERS,
  filters: {},
  selectedUser: null,
  isLoading: false,

  setUsers: (users) => set({ users }),

  addUser: (user, actor) => {
    set((state) => ({
      users: [...state.users, user],
    }))
    useAuditStore.getState().addLog({
      action: "create",
      entity: "user",
      entityId: user.id,
      description: `Création de l'utilisateur ${user.name} (${user.email}) avec le rôle ${user.role}`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

  updateUser: (id, data, actor) => {
    const previousName = get().users.find((u) => u.id === id)?.name || id
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }))
    useAuditStore.getState().addLog({
      action: "update",
      entity: "user",
      entityId: id,
      description: `Mise à jour de l'utilisateur ${previousName}`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

  deleteUser: (id, actor) => {
    let deletedName = ""
    set((state) => {
      const user = state.users.find((u) => u.id === id)
      deletedName = user?.name || id
      return {
        users: state.users.filter((u) => u.id !== id),
      }
    })
    useAuditStore.getState().addLog({
      action: "delete",
      entity: "user",
      entityId: id,
      description: `Suppression de l'utilisateur ${deletedName}`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  getProfessors: () => get().users.filter((u) => u.role === "professeur"),

  getStudents: () => get().users.filter((u) => u.role === "etudiant"),

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
