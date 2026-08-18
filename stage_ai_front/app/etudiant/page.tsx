"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { isCourseNew } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { useEnrollmentStore } from "@/lib/stores/enrollment-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, Clock, ArrowRight, Play, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { AIProgressCard } from "@/components/etudiant/ai-progress-card"

export default function EtudiantPage() {
  const { user } = useAuth()
  const { courses, fetchCourses } = useCourseStore()
  const { enrollments, fetchEnrollmentsByUser } = useEnrollmentStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (user) {
        await Promise.all([fetchCourses(), fetchEnrollmentsByUser(user.id)])
      }
      setLoading(false)
    }
    load()
  }, [user, fetchCourses, fetchEnrollmentsByUser])

  const myEnrollments = enrollments.filter((e) => e.userId === user?.id)
  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))
  const myCourses = myEnrollments.map((e) => ({
    enrollment: e,
    course: courses.find((c) => c.id === e.courseId)!,
  })).filter((x) => x.course)

  const avgProgress = myEnrollments.length > 0
    ? Math.round(myEnrollments.reduce((a, e) => a + e.progress, 0) / myEnrollments.length)
    : 0

  const completed = myEnrollments.filter((e) => e.progress === 100).length

  const newCourses = courses.filter((c) => c.published && isCourseNew(c) && !enrolledIds.has(c.id))

  const STATS = [
    { label: "Formations suivies", value: myEnrollments.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Progression moyenne", value: `${avgProgress}%`, icon: Trophy, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Terminées", value: completed, icon: Clock, color: "text-chart-2", bg: "bg-chart-2/10" },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bonjour, {user?.name?.split(" ")[0]} !</h1>
        <p className="text-sm text-muted-foreground mt-1">Continuez votre apprentissage là où vous vous êtes arrêté</p>
      </div>

      {/* New courses notification banner */}
      {newCourses.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-chart-3/30 bg-chart-3/5 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-chart-3/15 flex items-center justify-center shrink-0">
              <Sparkles className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {newCourses.length === 1
                  ? `1 nouvelle formation disponible`
                  : `${newCourses.length} nouvelles formations disponibles`}
              </p>
              <p className="text-xs text-muted-foreground">
                {newCourses.map((c) => c.title).join(", ")}
              </p>
            </div>
          </div>
          <Link
            href="/etudiant/cours"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Voir <ArrowRight />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* AI progress analysis */}
      <AIProgressCard
        enrollments={myCourses.map(({ enrollment, course }) => ({
          courseTitle: course.title,
          progress: enrollment.progress,
          completedLessons: enrollment.completedLessons.length,
          totalLessons: course.modules.reduce((a, m) => a + m.lessons.length, 0),
        }))}
        availableCourses={courses.filter((c) => c.published && !enrolledIds.has(c.id)).map((c) => ({
          title: c.title,
          category: c.category,
          level: c.level,
        }))}
      />

      {/* In-progress courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Mes formations en cours</h2>
          <Link href="/etudiant/cours" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Voir tout <ArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myCourses.map(({ enrollment, course }) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="pt-4 pb-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-xl bg-primary/5 border flex items-center justify-center text-2xl shrink-0">
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm leading-snug">{course.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{course.category} · {course.level}</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{enrollment.progress}%</Badge>
                </div>
                <div className="flex flex-col gap-1">
                  <Progress value={enrollment.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{enrollment.completedLessons.length} leçon{enrollment.completedLessons.length > 1 ? "s" : ""} complétée{enrollment.completedLessons.length > 1 ? "s" : ""}</span>
                    <span>{course.duration}h au total</span>
                  </div>
                </div>
                <Link href={`/etudiant/cours/${course.id}`} className={buttonVariants({ size: "sm", className: "w-full" })}>
                  <Play />
                  {enrollment.progress > 0 ? "Continuer" : "Commencer"}
                </Link>
              </CardContent>
            </Card>
          ))}

          {myCourses.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">
              Vous n'êtes inscrit à aucune formation. Explorez le catalogue !
            </div>
          )}
        </div>
      </div>
    </div>
  )
}