import { create } from "zustand"
import { persist } from "zustand/middleware"
import { USERS, type User } from "@/lib/mock-data"

interface AuthState {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => { success: boolean; role?: string; error?: string }
  logout: () => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,

      login: (email, password) => {
        const found = USERS.find((u) => u.email === email && u.password === password)
        if (found) {
          set({ user: found, isLoading: false })
          return { success: true, role: found.role }
        }
        return { success: false, error: "Email ou mot de passe incorrect." }
      },

      logout: () => {
        set({ user: null, isLoading: false })
        console.log("User logged out")
      },

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "stageia_auth_store",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false)
      },
    }
  )
)
