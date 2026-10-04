"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { ChangePasswordModal } from "@/components/auth/change-password-modal"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Briefcase,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Library,
  FileCheck,
  BarChart3,
  PlusCircle,
  UserCog,
  Layers,
  FilePlus2,
  Inbox,
  ClipboardCheck,
  KeyRound,
  Lightbulb,
  Route,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface AppSidebarProps {
  navItems: NavItem[]
  groupLabel: string
  children: React.ReactNode
}

export function AppLayout({ navItems, groupLabel, children }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showChangePassword, setShowChangePassword] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const currentNavLabel = navItems.find((item) => pathname === item.href)?.label

  const roleLabels: Record<string, string> = {
    admin: "Administrateur",
    professeur: "Professeur",
    etudiant: "Étudiant",
    tuteur: "Tuteur",
    mentor: "Mentor",
  }
  const roleLabel = user ? (roleLabels[user.role] ?? user.role) : ""

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-sidebar-primary-foreground">S</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">StageIA</span>
                <span className="text-xs text-sidebar-foreground/60">Plateforme EdTech</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href} render={<Link href={item.href} />}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors text-left">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                    {user?.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-xs font-medium text-sidebar-foreground truncate w-full">{user?.name}</span>
                  <span className="text-xs text-sidebar-foreground/60 truncate w-full">{user?.email}</span>
                </div>
                <ChevronDown className="size-3.5 text-sidebar-foreground/60 flex-shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-52">
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  <KeyRound />
                  Changer le mot de passe
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-14 border-b bg-card flex items-center px-4 gap-3">
            <SidebarTrigger />
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">
                {currentNavLabel ?? groupLabel}
              </span>
            </div>
            <Badge variant="secondary" className="hidden sm:inline-flex capitalize">
              {roleLabel}
            </Badge>
            <Avatar className="size-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {user?.avatar ?? "U"}
              </AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>

      <ChangePasswordModal open={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </SidebarProvider>
  )
}

// Nav configs for each role
export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Etudiants", href: "/admin/etudiants", icon: GraduationCap },
  { label: "Professeurs", href: "/admin/professeurs", icon: UserCog },
  { label: "Cours", href: "/admin/cours", icon: BookOpen },
  { label: "Nouveau cours", href: "/admin/cours/nouveau", icon: PlusCircle },
  { label: "Suggestions IA", href: "/admin/suggestions", icon: Lightbulb },
  { label: "Programmes", href: "/admin/programmes", icon: Layers },
  { label: "Entreprises partenaires", href: "/admin/entreprises", icon: Users },
  { label: "Stages virtuels", href: "/admin/stages", icon: Briefcase },
  { label: "Offres entreprise", href: "/admin/offres", icon: FilePlus2 },
  { label: "Candidatures", href: "/admin/candidatures", icon: Inbox },
  { label: "Dossiers à valider", href: "/admin/dossiers", icon: FileCheck },
  { label: "Statistiques", href: "/admin/stats", icon: BarChart3 },
]

export const PROF_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/professeur", icon: LayoutDashboard },
  { label: "Mes cours", href: "/professeur/cours", icon: BookOpen },
  { label: "Nouveau cours", href: "/professeur/cours/nouveau", icon: PlusCircle },
  { label: "Mes programmes", href: "/professeur/programmes", icon: Layers },
  { label: "Mes étudiants", href: "/professeur/etudiants", icon: Users },
]

export const ETUDIANT_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/etudiant", icon: LayoutDashboard },
  { label: "Mon parcours IA", href: "/etudiant/parcours", icon: Route },
  { label: "Évaluation IA", href: "/etudiant/onboarding", icon: Sparkles },
  { label: "Formations", href: "/etudiant/formations", icon: Library },
  { label: "Mes formations", href: "/etudiant/cours", icon: BookOpen },
  { label: "Programmes", href: "/etudiant/programmes", icon: Layers },
  { label: "Offres de stage", href: "/offres", icon: Briefcase },
  { label: "Mon stage", href: "/etudiant/stage", icon: ClipboardCheck },
]

export const TUTEUR_NAV: NavItem[] = [
  { label: "Mes offres", href: "/tuteur/offres", icon: FilePlus2 },
  { label: "Nouvelle offre", href: "/tuteur/offres/nouvelle", icon: PlusCircle },
  { label: "Mes stagiaires", href: "/tuteur/stages", icon: Users },
  { label: "Mes tuteurs", href: "/tuteur/tuteurs", icon: UserCog },
]

export const MENTOR_NAV: NavItem[] = [
  { label: "Mes stagiaires", href: "/mentor/stages", icon: Users },
]
