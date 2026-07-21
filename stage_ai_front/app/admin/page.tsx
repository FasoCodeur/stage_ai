"use client"

import { USERS, COURSES, ENROLLMENTS, STAGE_REQUESTS } from "@/lib/mock-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"

const students = USERS.filter((u) => u.role === "etudiant")
const publishedCourses = COURSES.filter((c) => c.published)
const pendingStages = STAGE_REQUESTS.filter((s) => s.status === "en_attente")

const STAT_CARDS = [
  {
    label: "Etudiants inscrits",
    value: students.length,
    sub: "+2 ce mois",
    icon: GraduationCap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Cours publiés",
    value: publishedCourses.length,
    sub: `${COURSES.length} au total`,
    icon: BookOpen,
    color: "text-chart-2",
    bg: "bg-chart-2/10",
  },
  {
    label: "Stages en attente",
    value: pendingStages.length,
    sub: "À valider",
    icon: Briefcase,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Inscriptions totales",
    value: ENROLLMENTS.length,
    sub: "Toutes formations",
    icon: TrendingUp,
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
]

const statusMap = {
  validé: { label: "Validé", variant: "default" as const, icon: CheckCircle2, color: "text-chart-3" },
  en_attente: { label: "En attente", variant: "secondary" as const, icon: Clock, color: "text-warning" },
  refusé: { label: "Refusé", variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
}

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground mt-1">Vue d&apos;ensemble de la plateforme StageIA</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-3xl font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.sub}</span>
                </div>
                <div className={`size-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`size-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent students */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Derniers étudiants inscrits</CardTitle>
            <CardDescription>Etudiants récemment ajoutés à la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {students.map((s) => {
                const myEnrollments = ENROLLMENTS.filter((e) => e.userId === s.id)
                const avgProgress =
                  myEnrollments.length > 0
                    ? Math.round(myEnrollments.reduce((a, e) => a + e.progress, 0) / myEnrollments.length)
                    : 0
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground truncate">{s.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{avgProgress}%</span>
                      </div>
                      <Progress value={avgProgress} className="h-1.5" />
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">{myEnrollments.length} cours</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stage requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Demandes de stage</CardTitle>
                <CardDescription>Statut des stages virtuels soumis</CardDescription>
              </div>
              {pendingStages.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <FileCheck className="size-3" />
                  {pendingStages.length} en attente
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {STAGE_REQUESTS.map((req) => {
                const s = statusMap[req.status]
                return (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="size-9 rounded-lg bg-background border flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-foreground">{req.companyLogo}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.companyName} · {req.duration}</p>
                    </div>
                    <Badge variant={s.variant} className="text-xs shrink-0">{s.label}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aperçu des cours</CardTitle>
          <CardDescription>Tous les cours créés sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {COURSES.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="size-10 rounded-lg bg-background border flex items-center justify-center text-xl shrink-0">
                  {c.thumbnail}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.category} · {c.duration}h · {c.students.length} étudiant{c.students.length > 1 ? "s" : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">{c.level}</Badge>
                  <Badge variant={c.published ? "default" : "secondary"} className="text-xs">
                    {c.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
