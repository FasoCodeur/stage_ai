"use client"

import { use, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Program, type Level, type Course } from "@/lib/mock-data"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { useSubscriptionStore } from "@/lib/stores/subscription-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Layers,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Circle,
  Phone,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByUser, enrollStudentApi } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const { courses, fetchCourses } = useCourseStore()
  const { createSubscription } = useSubscriptionStore()
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchPrograms(),
          fetchUsers(),
          fetchCourses(),
          id ? fetchLevelsByProgram(id) : Promise.resolve(),
          user ? fetchEnrollmentsByUser(user.id) : Promise.resolve(),
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user, fetchPrograms, fetchUsers, fetchCourses, fetchLevelsByProgram, fetchEnrollmentsByUser])

  const program = programs.find((p) => p.id === id)
  const mentor = program ? users.find((u) => u.id === program.mentorId) : undefined
  const programLevels = levels.filter((l) => l.programId === id).sort((a, b) => a.order - b.order)
  const enrollment = program && user
    ? enrollments.find((e) => e.userId === user.id && e.programId === program.id)
    : undefined
  const isEnrolled = !!enrollment
  const isExpired = program ? new Date() > new Date(program.endDate) : false
  const isNotStarted = program ? new Date() < new Date(program.startDate) : false

  const handleSubscribe = async () => {
    if (!user) return
    setSubscribing(true)
    setError("")
    try {
      await createSubscription(user.id, "mensuel")
      await enrollStudentApi(id, user.id)
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'abonnement")
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du programme...
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <Layers className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Programme non trouvé</p>
        <Link href="/etudiant/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" />
          Retour aux programmes
        </Link>
      </div>
    )
  }

  const courseById = (cid: string): Course | undefined => courses.find((c) => c.id === cid)

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/etudiant/programmes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux programmes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="size-24 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
          <span className="text-5xl">{program.thumbnail}</span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">{program.title}</h1>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Layers className="size-3" />
                  {program.duration} mois
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{program.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>{program.startDate} → {program.endDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="size-4" />
              <span>{programLevels.length} niveaux</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>{program.students?.length || 0} inscrits</span>
            </div>
            <div className="font-semibold text-foreground text-lg">
              {program.subscriptionPrice.toLocaleString("fr-FR")} FCFA<span className="text-xs font-normal text-muted-foreground">/mois</span>
            </div>
          </div>

          {mentor && (
            <div className="flex items-center gap-2.5 bg-primary/5 rounded-lg px-3 py-2 w-fit">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mentor</p>
                <p className="text-sm font-semibold text-foreground">{mentor.name}</p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              <AlertTriangle className="size-4" />
              <span>Ce programme est terminé. Les inscriptions sont closes.</span>
            </div>
          )}

          {isNotStarted && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              <Calendar className="size-4" />
              <span>Ce programme commence le {program.startDate}.</span>
            </div>
          )}

          {isEnrolled && enrollment && (
            <div className="flex flex-col gap-1 max-w-sm">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progression globale</span>
                <span>{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {enrollment.completedLevels.length}/{programLevels.length} niveaux complétés
                {enrollment.status === "completed" && " — 🎉 Programme terminé !"}
                {enrollment.status === "expired" && " — ⏰ Programme expiré"}
              </p>
              {enrollment.mentorNotes && (
                <div className="mt-2 p-2 bg-muted/30 rounded-md text-xs text-muted-foreground italic border-l-2 border-primary">
                  <span className="font-medium not-italic">Note du mentor : </span>
                  {enrollment.mentorNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Levels avec progression */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Niveaux du programme</h2>
        {programLevels.length === 0 ? (
          <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/20">
            Aucun niveau défini pour ce programme pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {programLevels.map((level: Level, index: number) => {
              const isCurrentLevel = isEnrolled && enrollment?.currentLevelIndex === index
              const isLevelCompleted = isEnrolled && enrollment?.completedLevels.includes(level.id)
              const isLevelLocked = !isEnrolled || (!isLevelCompleted && !isCurrentLevel && index > (enrollment?.currentLevelIndex ?? -1))
              const levelCourses = level.courses.map((cid) => courseById(cid)).filter(Boolean) as Course[]

              return (
                <Card
                  key={level.id}
                  className={`relative overflow-hidden transition-all ${
                    isLevelCompleted ? "border-green-200 bg-green-50/30" : ""
                  } ${isCurrentLevel ? "border-primary ring-1 ring-primary/20" : ""} ${
                    isLevelLocked ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Status icon */}
                      <div className="mt-0.5">
                        {isLevelCompleted ? (
                          <div className="size-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="size-5 text-green-600" />
                          </div>
                        ) : isLevelLocked ? (
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="size-4 text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Circle className="size-4 text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">
                            Niveau {level.order} : {level.title}
                          </h3>
                          {isLevelCompleted && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                              Validé
                            </Badge>
                          )}
                          {isCurrentLevel && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                              En cours
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{level.description}</p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="size-3" />{level.duration} jours</span>
                          <span className="flex items-center gap-1"><BookOpen className="size-3" />{level.courses.length} cours</span>
                        </div>

                        {/* Courses in this level */}
                        {levelCourses.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {levelCourses.map((course) => {
                              const isCourseCompleted = enrollment?.completedCourses.includes(course.id)
                              return (
                                <div
                                  key={course.id}
                                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
                                    isCourseCompleted ? "bg-green-50" : "bg-muted/30"
                                  }`}
                                >
                                  {isCourseCompleted ? (
                                    <CheckCircle2 className="size-3.5 text-green-500 shrink-0" />
                                  ) : (
                                    <Circle className="size-3.5 text-muted-foreground shrink-0" />
                                  )}
                                  <span className="text-xs text-foreground flex-1 truncate">{course.title}</span>
                                  {!isLevelLocked && isEnrolled && (
                                    <Link
                                      href={`/etudiant/cours/${course.id}`}
                                      className={buttonVariants({
                                        size: "sm",
                                        variant: isCourseCompleted ? "outline" : "default",
                                        className: "h-6 text-[10px] px-2",
                                      })}
                                    >
                                      {isCourseCompleted ? "Revoir" : "Commencer"}
                                    </Link>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>

                  {/* Connection line */}
                  {index < programLevels.length - 1 && (
                    <div className="absolute left-[23px] top-[52px] bottom-0 w-0.5 bg-muted-foreground/20" />
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Enroll CTA */}
      {!isEnrolled && program.published && !isExpired && !isNotStarted && (
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20 flex-col sm:flex-row gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Intéressé par ce programme ?</p>
            <p className="text-xs text-muted-foreground">
              Abonnez-vous pour accéder à tous les niveaux et bénéficier du suivi personnalisé de votre mentor.
            </p>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            {subscribing ? <Loader2 className="size-3.5 animate-spin" /> : <Phone className="size-3.5" />}
            {subscribing ? "Abonnement..." : `S'abonner — ${program.subscriptionPrice.toLocaleString("fr-FR")} FCFA/mois`}
          </button>
        </div>
      )}
    </div>
  )
}