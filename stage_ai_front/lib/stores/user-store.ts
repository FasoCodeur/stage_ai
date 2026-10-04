import { create } from "zustand"
import { type User } from "@/lib/mock-data"
import { apiFetch } from "@/lib/api"
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

  // Actions API
  fetchUsers: (role?: string) => Promise<void>
  createUser: (user: Partial<User> & { password?: string }) => Promise<User>
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

  suspendUser: (
    id: string,
    actor?: { id: string; name: string; role: string }
  ) => void
  reactivateUser: (
    id: string,
    actor?: { id: string; name: string; role: string }
  ) => void
  transferCourses: (
    fromProfessorId: string,
    toProfessorId: string,
    courseIds?: string[],
    actor?: { id: string; name: string; role: string }
  ) => void
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  filters: {},
  selectedUser: null,
  isLoading: false,

  setUsers: (users) => set({ users }),

  // ── Actions API ──
  fetchUsers: async (role) => {
    set({ isLoading: true })
    try {
      const data = await apiFetch<User[]>(role ? `/users/role/${role}` : "/users")
      set({ users: data, isLoading: false })
    } catch (e) {
      set({ isLoading: false })
      throw e
    }
  },

  createUser: async (user) => {
    const created = await apiFetch<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    })
    set((state) => ({ users: [...state.users, created] }))
    return created
  },

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

  suspendUser: (id: string, actor?: { id: string; name: string; role: string }) => {
    const user = get().users.find((u) => u.id === id)
    if (!user) return
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, suspended: true } : u)),
    }))
    useAuditStore.getState().addLog({
      action: "update",
      entity: "user",
      entityId: id,
      description: `Suspension du compte de ${user.name} (${user.role})`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

  reactivateUser: (id: string, actor?: { id: string; name: string; role: string }) => {
    const user = get().users.find((u) => u.id === id)
    if (!user) return
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, suspended: false } : u)),
    }))
    useAuditStore.getState().addLog({
      action: "update",
      entity: "user",
      entityId: id,
      description: `Réactivation du compte de ${user.name} (${user.role})`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

  transferCourses: (fromProfessorId: string, toProfessorId: string, courseIds?: string[], actor?: { id: string; name: string; role: string }) => {
    const fromProf = get().users.find((u) => u.id === fromProfessorId)
    const toProf = get().users.find((u) => u.id === toProfessorId)
    if (!fromProf || !toProf) return

    useAuditStore.getState().addLog({
      action: "update",
      entity: "course",
      entityId: "multiple",
      description: `Transfert des cours de ${fromProf.name} vers ${toProf.name}${courseIds ? ` (${courseIds.length} cours)` : " (tous les cours)"}`,
      performedBy: actor ?? { id: "system", name: "Système", role: "system" },
    })
  },

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
