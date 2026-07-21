"use client"

import { USERS, COURSES, ENROLLMENTS, STAGE_REQUESTS } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const students = USERS.filter((u) => u.role === "etudiant")
const publishedCourses = COURSES.filter((c) => c.published)

// Enrollments per course
const courseStats = COURSES.map((c) => {
  const enrollments = ENROLLMENTS.filter((e) => e.courseId === c.id)
  const avg = enrollments.length > 0
    ? Math.round(enrollments.reduce((a, e) => a + e.progress, 0) / enrollments.length)
    : 0
  return { course: c, enrollments: enrollments.length, avgProgress: avg }
}).sort((a, b) => b.enrollments - a.enrollments)

// Stage stats
const stagesByStatus = {
  validé: STAGE_REQUESTS.filter((s) => s.status === "validé").length,
  en_attente: STAGE_REQUESTS.filter((s) => s.status === "en_attente").length,
  refusé: STAGE_REQUESTS.filter((s) => s.status === "refusé").length,
}

export default function AdminStatsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
        <p className="text-sm text-muted-foreground mt-1">Indicateurs clés de la plateforme</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total étudiants", value: students.length },
          { label: "Cours publiés", value: publishedCourses.length },
          { label: "Inscriptions", value: ENROLLMENTS.length },
          { label: "Stages soumis", value: STAGE_REQUESTS.length },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-4xl font-bold text-foreground">{s.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Course performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance par cours</CardTitle>
            <CardDescription>Inscriptions et progression moyenne</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {courseStats.map(({ course, enrollments, avgProgress }) => (
                <div key={course.id} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{course.thumbnail}</span>
                      <span className="text-sm font-medium text-foreground truncate">{course.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{enrollments} · {avgProgress}%</span>
                  </div>
                  <Progress value={avgProgress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stage status breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Statut des stages</CardTitle>
            <CardDescription>Répartition des demandes de stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {[
                { label: "Validés", value: stagesByStatus.validé, color: "bg-chart-3" },
                { label: "En attente", value: stagesByStatus.en_attente, color: "bg-warning" },
                { label: "Refusés", value: stagesByStatus.refusé, color: "bg-destructive" },
              ].map((item) => {
                const pct = STAGE_REQUESTS.length > 0 ? Math.round((item.value / STAGE_REQUESTS.length) * 100) : 0
                return (
                  <div key={item.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
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
