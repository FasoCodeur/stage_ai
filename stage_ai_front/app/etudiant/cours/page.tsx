"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { COURSES, ENROLLMENTS, PURCHASES, isCourseNew, hasAccess, getSubscription, Course, Enrollment } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Clock, Users, Sparkles, Lock, Phone, Crown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { OrangeMoneyModal } from "@/components/etudiant/orange-money-modal"

function CourseCard({
  c,
  isEnrolled,
  enrollment,
  hasAccess: access,
  onPurchase,
}: {
  c: Course
  isEnrolled: boolean
  enrollment?: Enrollment
  hasAccess: boolean
  onPurchase: (course: Course) => void
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
        <div className="absolute inset-0 z-10 rounded-[inherit] bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Lock className="size-6 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">Accès restreint</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Abonnez-vous ou achetez ce cours</p>
          </div>
        </div>
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
          <div className="flex items-center gap-1"><Users className="size-3" />{c.students.length} inscrits</div>
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
            <button
              onClick={() => onPurchase(c)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-orange-500/40 bg-orange-500/8 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-500/15 transition-colors h-8"
            >
              <Phone className="size-3" />
              Acheter via Orange Money
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function EtudiantCoursPage() {
  const { user } = useAuth()
  const [purchaseCourse, setPurchaseCourse] = useState<Course | null>(null)

  const myEnrollments = ENROLLMENTS.filter((e) => e.userId === user?.id)
  const enrolledIds = new Set(myEnrollments.map((e) => e.courseId))

  const subscription = user ? getSubscription(user.id) : null
  const publishedCourses = COURSES.filter((c) => c.published)
  const newCourses = publishedCourses.filter((c) => isCourseNew(c))
  const otherCourses = publishedCourses.filter((c) => !isCourseNew(c))

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catalogue des formations</h1>
          <p className="text-sm text-muted-foreground mt-1">{publishedCourses.length} formations disponibles</p>
        </div>
        {/* Subscription badge */}
        {subscription ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/6 px-4 py-2 text-sm">
            <Crown className="size-4 text-primary" />
            <div>
              <span className="font-semibold text-foreground text-xs">Abonnement actif</span>
              <span className="block text-[11px] text-muted-foreground">{daysLeft} jours restants</span>
            </div>
          </div>
        ) : (
          <Link
            href="/etudiant/abonnement"
            className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/6 px-4 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-500/12 transition-colors"
          >
            <Phone className="size-3.5" />
            S&apos;abonner — 35 000 FCFA/mois
            <ChevronRight className="size-3" />
          </Link>
        )}
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
                hasAccess={user ? hasAccess(user.id, c.id) : false}
                onPurchase={setPurchaseCourse}
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
              hasAccess={user ? hasAccess(user.id, c.id) : false}
              onPurchase={setPurchaseCourse}
            />
          ))}
        </div>
      </section>

      {/* Orange Money purchase modal */}
      {purchaseCourse && (
        <OrangeMoneyModal
          course={purchaseCourse}
          open={!!purchaseCourse}
          onClose={() => setPurchaseCourse(null)}
        />
      )}
    </div>
  )
}
