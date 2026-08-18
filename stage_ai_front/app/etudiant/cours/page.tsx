"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { isCourseNew, Course, Enrollment } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { useEnrollmentStore } from "@/lib/stores/enrollment-store"
import { usePurchaseStore } from "@/lib/stores/purchase-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, Users, Sparkles, Phone, Loader2 } from "lucide-react"
import Link from "next/link"

function CourseCard({
  c,
  isEnrolled,
  enrollment,
  hasAccess: access,
}: {
  c: Course
  isEnrolled: boolean
  enrollment?: Enrollment
  hasAccess: boolean
}) {
  const isNew = isCourseNew(c)

  return (
    <Card className="overflow-hidden flex flex-col relative">
      {isNew && (
        <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-full bg-chart-3 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <Sparkles className="size-2.5" />
          Nouveau
        </span>
      )}
      {!access && (
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
          <Sparkles className="size-2.5" />
          Aperçu gratuit
        </span>
      )}
      <div className="h-28 bg-primary/5 flex items-center justify-center border-b">
        <span className="text-5xl">{c.thumbnail}</span>
      </div>
      <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
            <Badge variant="outline" className="text-xs shrink-0">{c.level}</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</div>
          <div className="flex items-center gap-1"><Users className="size-3" />{c.students?.length || 0} inscrits</div>
          <span className="ml-auto font-semibold text-foreground">{c.price.toLocaleString("fr-FR")} FCFA</span>
        </div>

        {access && isEnrolled && enrollment && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-1.5" />
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {access ? (
            <Link
              href={`/etudiant/cours/${c.id}`}
              className={buttonVariants({ size: "sm", variant: isEnrolled ? "default" : "outline", className: "w-full" })}
            >
              <Play className="size-3" />
              {isEnrolled ? (enrollment && enrollment.progress > 0 ? "Continuer" : "Commencer") : "Commencer"}
            </Link>
          ) : (
            <Link
              href={`/etudiant/cours/${c.id}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/8 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500/15 transition-colors h-8"
            >
              <Phone className="size-3" />
              Voir l'aperçu & acheter
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function EtudiantCoursPage() {
  const { user } = useAuth()
  const { courses, isLoading, fetchCourses } = useCourseStore()
  const { enrollments, fetchEnrollmentsByUser } = useEnrollmentStore()
  const { purchases, fetchPurchasesByUser } = usePurchaseStore()

  useEffect(() => {
    const load = async () => {
      await fetchCourses()
      if (user) {
        await Promise.all([fetchEnrollmentsByUser(user.id), fetchPurchasesByUser(user.id)])
      }
    }
    load()
  }, [user, fetchCourses, fetchEnrollmentsByUser, fetchPurchasesByUser])

  const myEnrollments = enrollments.filter((e) => e.userId === user?.id)
  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))
  const purchasedIds = new Set(purchases.filter((p) => p.userId === user?.id).map((p) => p.courseId))

  const publishedCourses = courses.filter((c) => c.published)
  const newCourses = publishedCourses.filter((c) => isCourseNew(c))
  const otherCourses = publishedCourses.filter((c) => !isCourseNew(c))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des formations...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catalogue des formations</h1>
          <p className="text-sm text-muted-foreground mt-1">{publishedCourses.length} formations disponibles</p>
        </div>
        <Link
          href="/etudiant/programmes"
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/6 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/12 transition-colors"
        >
          Voir les programmes avec abonnement
        </Link>
      </div>

      {/* New courses highlight */}
      {newCourses.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-chart-3" />
            <h2 className="text-base font-semibold text-foreground">Nouvelles formations</h2>
            <Badge className="bg-chart-3 text-white text-xs">{newCourses.length} nouveau{newCourses.length > 1 ? "x" : ""}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {newCourses.map((c) => (
              <CourseCard
                key={c.id}
                c={c}
                isEnrolled={enrolledIds.has(c.id)}
                enrollment={myEnrollments.find((e) => e.courseId === c.id)}
                hasAccess={user ? (enrolledIds.has(c.id) || purchasedIds.has(c.id)) : false}
              />
            ))}
          </div>
        </section>
      )}

      {/* All other courses */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-foreground">Toutes les formations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {otherCourses.map((c) => (
            <CourseCard
              key={c.id}
              c={c}
              isEnrolled={enrolledIds.has(c.id)}
              enrollment={myEnrollments.find((e) => e.courseId === c.id)}
              hasAccess={user ? (enrolledIds.has(c.id) || purchasedIds.has(c.id)) : false}
            />
          ))}
        </div>
      </section>

    </div>
  )
}