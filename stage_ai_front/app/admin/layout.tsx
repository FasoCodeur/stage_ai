"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AppLayout, ADMIN_NAV } from "@/components/app-sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <AppLayout navItems={ADMIN_NAV} groupLabel="Administration">
      {children}
    </AppLayout>
  )
}
