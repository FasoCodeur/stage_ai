"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout, PROF_NAV } from "@/components/app-sidebar"

export default function ProfesseurLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "professeur")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <AppLayout navItems={PROF_NAV} groupLabel="Espace Professeur">
      {children}
    </AppLayout>
  )
}
