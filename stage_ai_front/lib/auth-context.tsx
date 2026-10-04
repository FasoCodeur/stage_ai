"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { apiFetch } from "./api"

interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "professeur" | "etudiant" | "tuteur"
  avatar: string
  phone?: string
  ville?: string
  niveau?: string
  entrepriseId?: string
  objectifMetier?: string
  niveauEvalue?: string
  assessmentDoneAt?: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>
  logout: () => void
  updateUser: (data: Partial<AuthUser>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("stageia_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("stageia_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const data = await apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })

      const found = data.user
      setUser(found)
      localStorage.setItem("stageia_user", JSON.stringify(found))
      localStorage.setItem("stageia_token", data.token)
      return { success: true, role: found.role }
    } catch (err: any) {
      return { success: false, error: err.message || "Email ou mot de passe incorrect." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("stageia_user")
    localStorage.removeItem("stageia_token")
    console.log("User logged out")
  }

  /** Met à jour le profil local (et le stockage) après une modification côté serveur. */
  const updateUser = (data: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...data }
      localStorage.setItem("stageia_user", JSON.stringify(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}