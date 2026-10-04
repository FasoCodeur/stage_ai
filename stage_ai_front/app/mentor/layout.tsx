"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout, MENTOR_NAV } from "@/components/app-sidebar"

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "professeur" && user.role !== "admin"))) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <AppLayout navItems={MENTOR_NAV} groupLabel="Espace Mentor">
      {children}
    </AppLayout>
  )
}