"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout, ETUDIANT_NAV } from "@/components/app-sidebar"
import { AIChatButton } from "@/components/ai-chat-button"
import { AIChatProvider } from "@/lib/ai-chat-context"

export default function EtudiantLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "etudiant")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <AIChatProvider>
      <AppLayout navItems={ETUDIANT_NAV} groupLabel="Espace Etudiant">
        {children}
        <AIChatButton />
      </AppLayout>
    </AIChatProvider>
  )
}
