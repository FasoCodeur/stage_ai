"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { useEnrollmentStore } from "@/lib/stores/enrollment-store"
import { useSubscriptionStore } from "@/lib/stores/subscription-store"
import { usePurchaseStore } from "@/lib/stores/purchase-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  CreditCard,
  BookOpen,
  LogIn,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminProgramStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByProgram } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const { courses, fetchCourses } = useCourseStore()
  const { enrollments: courseEnrollments, fetchAllEnrollments } = useEnrollmentStore()
  const { subscriptions, fetchAllSubscriptions } = useSubscriptionStore()
  const { purchases, fetchAllPurchases } = usePurchaseStore()
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchPrograms(),
          fetchUsers(),
          fetchCourses(),
          fetchLevelsByProgram(id),
          fetchEnrollmentsByProgram(id),
          fetchAllEnrollments(),
          fetchAllSubscriptions(),
          fetchAllPurchases(),
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchPrograms, fetchUsers, fetchCourses, fetchLevelsByProgram, fetchEnrollmentsByProgram, fetchAllEnrollments, fetchAllSubscriptions, fetchAllPurchases])

  const program = programs.find((p) => p.id === id)
  const programLevels = levels.filter((l) => l.programId === id).sort((a, b) => a.order - b.order)
  const programEnrollments = enrollments.filter((e) => e.programId === id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des étudiants...
      </div>
    )
  }

  if (!program || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-medium text-foreground">Programme non trouvé</p>
        <Link href="/admin/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  const getPurchaseType = (userId: string): { label: string; color: string } => {
    const hasSub = subscriptions.find((s) => s.userId === userId && s.status === "active")
    if (hasSub) return { label: "Abonnement", color: "bg-blue-100 text-blue-700 border-blue-200" }
    const hasPurchases = purchases.some((p) => p.userId === userId)
    if (hasPurchases) return { label: "Achat direct", color: "bg-green-100 text-green-700 border-green-200" }
    return { label: "Programme", color: "bg-purple-100 text-purple-700 border-purple-200" }
  }

  const getRemainingDays = (userId: string): number | null => {
    const sub = subscriptions.find((s) => s.userId === userId && s.status === "active")
    if (!sub) return null
    const end = new Date(sub.endDate)
    const now = new Date()
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const getStudentCourses = (userId: string) => {
    const studentEnrollments = courseEnrollments.filter((e) => e.userId === userId)
    const programCompletedCourses = enrollments.filter((e) => e.userId === userId)
      .flatMap((e) => e.completedCourses)
    const allCourseIds = [...new Set([...studentEnrollments.map((e) => e.courseId), ...programCompletedCourses])]
    return courses.filter((c) => allCourseIds.includes(c.id))
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Link
        href={`/admin/programmes/${program.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour au programme
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Étudiants — {program.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {programEnrollments.length} étudiant{programEnrollments.length > 1 ? "s" : ""} inscrit{programEnrollments.length > 1 ? "s" : ""}
        </p>
      </div>

      {programEnrollments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border rounded-xl bg-muted/20">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun étudiant inscrit</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {programEnrollments.map((enrollment) => {
            const student = users.find((u) => u.id === enrollment.userId)
            if (!student) return null
            const purchaseType = getPurchaseType(student.id)
            const remainingDays = getRemainingDays(student.id)
            const studentCourses = getStudentCourses(student.id)
            const statusLabel = enrollment.status === "active" ? "Actif" : enrollment.status === "completed" ? "Terminé" : "Expiré"
            const statusColor = enrollment.status === "active" ? "bg-green-100 text-green-700" : enrollment.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"

            return (
              <Card key={enrollment.userId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {student.avatar || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{student.name}</h3>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor}`}>
                          {statusLabel}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${purchaseType.color}`}>
                          <CreditCard className="size-2.5 inline mr-0.5" />
                          {purchaseType.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <LogIn className="size-3" />
                          Dernière connexion : {student.lastLogin || "N/A"}
                        </span>
                        {remainingDays !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            Abonnement : {remainingDays} jours restants
                          </span>
                        )}
                        {remainingDays === null && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="size-3" />
                            {purchaseType.label === "Programme" ? "Accès programme" : "Sans abonnement"}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {studentCourses.length} cours suivis
                        </span>
                      </div>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-sm font-semibold text-foreground">{enrollment.progress}%</p>
                      <Progress value={enrollment.progress} className="h-1.5 mt-1" />
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {enrollment.completedLevels.length}/{programLevels.length} niveaux
                      </p>
                      <button
                        onClick={() => setSelectedStudent(student.id)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        Voir les cours →
                      </button>
                    </div>
                  </div>

                  {/* Level badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {programLevels.map((level, index) => {
                      const isCompleted = enrollment.completedLevels.includes(level.id)
                      const isCurrent = index === enrollment.currentLevelIndex
                      const isLocked = !isCompleted && !isCurrent && index > enrollment.currentLevelIndex
                      return (
                        <Badge key={level.id} variant="outline" className={`text-[10px] gap-1 ${
                          isCompleted ? "border-green-300 bg-green-50 text-green-700" :
                          isCurrent ? "border-primary bg-primary/5 text-primary" :
                          "opacity-50"
                        }`}>
                          {isCompleted ? <CheckCircle2 className="size-2.5" /> :
                           isLocked ? <Lock className="size-2.5" /> :
                           <Circle className="size-2.5" />}
                          N{level.order}: {level.title}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal: Détail des cours suivis */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Cours suivis — {users.find((u) => u.id === selectedStudent)?.name || ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {selectedStudent && getStudentCourses(selectedStudent).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun cours suivi pour le moment.</p>
            ) : selectedStudent && getStudentCourses(selectedStudent).map((course) => {
              const courseEnrollment = courseEnrollments.find((e) => e.userId === selectedStudent && e.courseId === course.id)
              return (
                <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <span className="text-2xl">{course.thumbnail}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{course.duration}h</span>
                      <span>•</span>
                      <span>{course.category}</span>
                      {courseEnrollment && (
                        <>
                          <span>•</span>
                          <span>Progression: {courseEnrollment.progress}%</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}