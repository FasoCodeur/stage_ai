"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

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
              <DropdownMenuContent side="top" align="start" className="w-48">
                <DropdownMenuItem onSelect={handleLogout} onClick={handleLogout} className="text-destructive">
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
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Nav configs for each role
export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Etudiants", href: "/admin/etudiants", icon: GraduationCap },
  { label: "Professeurs", href: "/admin/professeurs", icon: UserCog },
  { label: "Cours", href: "/admin/cours", icon: BookOpen },
  { label: "Stages virtuels", href: "/admin/stages", icon: Briefcase },
  { label: "Dossiers à valider", href: "/admin/dossiers", icon: FileCheck },
  { label: "Statistiques", href: "/admin/stats", icon: BarChart3 },
]

export const PROF_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/professeur", icon: LayoutDashboard },
  { label: "Mes cours", href: "/professeur/cours", icon: BookOpen },
  { label: "Nouveau cours", href: "/professeur/cours/nouveau", icon: PlusCircle },
  { label: "Mes étudiants", href: "/professeur/etudiants", icon: Users },
]

export const ETUDIANT_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/etudiant", icon: LayoutDashboard },
  { label: "Formations", href: "/etudiant/formations", icon: Library },
  { label: "Mes formations", href: "/etudiant/cours", icon: BookOpen },
  { label: "Stage virtuel", href: "/etudiant/stage", icon: Briefcase },
]
