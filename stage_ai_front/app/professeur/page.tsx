"use client"

import { useAuth } from "@/lib/auth-context"
import { COURSES, ENROLLMENTS, USERS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { buttonVariants } from "@/components/ui/button"
import { BookOpen, Users, TrendingUp, GraduationCap, PlusCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ProfesseurPage() {
  const { user } = useAuth()

  const myCourses = COURSES.filter((c) => c.professorId === user?.id)
  const totalStudents = new Set(myCourses.flatMap((c) => c.students)).size
  const allEnrollments = ENROLLMENTS.filter((e) =>
    myCourses.some((c) => c.id === e.courseId)
  )
  const avgProgress =
    allEnrollments.length > 0
      ? Math.round(allEnrollments.reduce((a, e) => a + e.progress, 0) / allEnrollments.length)
      : 0

  const STATS = [
    { label: "Mes cours", value: myCourses.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Cours publiés", value: myCourses.filter((c) => c.published).length, icon: TrendingUp, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Etudiants actifs", value: totalStudents, icon: Users, color: "text-chart-2", bg: "bg-chart-2/10" },
    { label: "Progression moy.", value: `${avgProgress}%`, icon: GraduationCap, color: "text-warning", bg: "bg-warning/10" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bonjour, {user?.name?.split(" ")[0]} !</h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez vos cours et suivez la progression de vos étudiants</p>
        </div>
        <Link href="/professeur/cours/nouveau" className={buttonVariants({ variant: "default" })}>
          <PlusCircle />
          Nouveau cours
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <span className="text-3xl font-bold text-foreground">{s.value}</span>
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
        {/* My courses */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Mes cours</CardTitle>
              <Link href="/professeur/cours" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Voir tout <ArrowRight />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {myCourses.map((c) => (
                <Link key={c.id} href={`/professeur/cours/${c.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="size-10 rounded-lg bg-background border flex items-center justify-center text-lg shrink-0">
                      {c.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.students.length} étudiant{c.students.length > 1 ? "s" : ""} · {c.modules.length} modules</p>
                    </div>
                    <Badge variant={c.published ? "default" : "secondary"} className="text-xs shrink-0">
                      {c.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Progression des étudiants</CardTitle>
            <CardDescription>Suivi en temps réel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {allEnrollments.slice(0, 5).map((enrollment) => {
                const student = USERS.find((u) => u.id === enrollment.userId)
                const course = COURSES.find((c) => c.id === enrollment.courseId)
                if (!student || !course) return null
                return (
                  <div key={`${enrollment.userId}-${enrollment.courseId}`} className="flex items-center gap-3">
                    <Avatar className="size-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{student.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground truncate">{student.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{course.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
