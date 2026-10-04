"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout, TUTEUR_NAV } from "@/components/app-sidebar"

export default function TuteurLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "tuteur")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <AppLayout navItems={TUTEUR_NAV} groupLabel="Espace Entreprise Partenaire">
      {children}
    </AppLayout>
  )
}