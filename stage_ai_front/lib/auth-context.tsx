"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, USERS } from "./mock-data"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; role?: string; error?: string }
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
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

  const login = (email: string, password: string): { success: boolean; role?: string; error?: string } => {
    const found = USERS.find(
      (u) => u.email === email && u.password === password
    )
    if (found) {
      setUser(found)
      localStorage.setItem("stageia_user", JSON.stringify(found))
      return { success: true, role: found.role }
    }
    return { success: false, error: "Email ou mot de passe incorrect." }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("stageia_user")
    console.log("User logged out")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
