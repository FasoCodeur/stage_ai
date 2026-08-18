"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Calendar,
  Users,
  Layers,
  UserCheck,
  BookOpen,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
} from "lucide-react"
import Link from "next/link"

export default function ProfessorProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByProgram, updateProgramApi, deleteProgramApi } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const { courses, fetchCourses } = useCourseStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchPrograms(),
          fetchUsers(),
          fetchCourses(),
          fetchLevelsByProgram(id),
          fetchEnrollmentsByProgram(id),
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchPrograms, fetchUsers, fetchCourses, fetchLevelsByProgram, fetchEnrollmentsByProgram])

  const program = programs.find((p) => p.id === id)
  const mentor = program ? users.find((u) => u.id === program.mentorId) : undefined
  const programLevels = levels.filter((l) => l.programId === id).sort((a, b) => a.order - b.order)
  const programEnrollments = enrollments.filter((e) => e.programId === id)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du programme...
      </div>
    )
  }

  if (!program || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-medium text-foreground">Programme non trouvé</p>
        <Link href="/professeur/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  const courseById = (cid: string) => courses.find((c) => c.id === cid)
  const avgProgress = programEnrollments.length > 0
    ? Math.round(programEnrollments.reduce((acc, e) => acc + e.progress, 0) / programEnrollments.length)
    : 0

  const handleTogglePublish = async () => {
    setSaving(true)
    try {
      await updateProgramApi(program.id, { published: !program.published })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Supprimer ce programme ? Cette action est irréversible.")) {
      await deleteProgramApi(program.id)
      router.push("/professeur/programmes")
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Link
        href="/professeur/programmes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour à mes programmes
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="size-20 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
          <span className="text-4xl">{program.thumbnail}</span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-bold text-foreground">{program.title}</h1>
                <Badge variant={program.published ? "default" : "secondary"}>
                  {program.published ? "Publié" : "Brouillon"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{program.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="size-4" />{program.duration} mois</span>
            <span className="flex items-center gap-1.5"><Layers className="size-4" />{programLevels.length} niveaux</span>
            <span className="flex items-center gap-1.5"><Users className="size-4" />{programEnrollments.length} inscrits</span>
            <span className="font-semibold text-foreground">{program.subscriptionPrice.toLocaleString("fr-FR")} FCFA/mois</span>
          </div>

          {mentor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="size-4 text-primary" />
              <span>Mentor: <strong>{mentor.name}</strong></span>
            </div>
          )}

          {programEnrollments.length > 0 && (
            <div className="max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                <span>Progression moyenne</span>
                <span>{avgProgress}%</span>
              </div>
              <Progress value={avgProgress} className="h-1.5" />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/professeur/programmes/${program.id}/modifier`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Edit className="size-3" /> Modifier
        </Link>
        <button onClick={handleTogglePublish} disabled={saving} className={buttonVariants({ size: "sm", variant: "outline" })}>
          {saving ? <Loader2 className="size-3 animate-spin" /> : program.published ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          {saving ? "..." : program.published ? "Dépublier" : "Publier"}
        </button>
        <Link href={`/professeur/programmes/${program.id}/etudiants`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Users className="size-3" /> Étudiants ({programEnrollments.length})
        </Link>
        <button onClick={handleDelete} className={buttonVariants({ size: "sm", variant: "outline", className: "text-destructive" })}>
          <Trash2 className="size-3" /> Supprimer
        </button>
      </div>

      {/* Levels */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Niveaux</h2>
          <span className="text-xs text-muted-foreground">{programLevels.length} niveau{programLevels.length > 1 ? "x" : ""}</span>
        </div>

        {programLevels.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/20">
            Aucun niveau défini. Ajoutez des niveaux pour structurer votre programme.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {programLevels.map((level) => {
              const levelCourses = level.courses.map((cid) => courseById(cid)).filter(Boolean)
              return (
                <Card key={level.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                        {level.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm">{level.title}</h3>
                          <Badge variant="outline" className="text-[10px]">{level.duration} jours</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{level.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="size-3" />
                          <span>{level.courses.length} cours</span>
                        </div>
                        {levelCourses.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {levelCourses.map((course) => (
                              <Badge key={course?.id} variant="secondary" className="text-[10px]">
                                {course?.title}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {level.courses.length === 0 && (
                          <p className="text-xs text-muted-foreground italic mt-1">Aucun cours assigné à ce niveau</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent enrollments */}
      {programEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Étudiants inscrits ({programEnrollments.length})</h2>
          <div className="flex flex-col gap-2">
            {programEnrollments.slice(0, 5).map((enrollment) => {
              const student = users.find((u) => u.id === enrollment.userId)
              return (
                <div key={enrollment.userId} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {student?.avatar || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{student?.name || "Inconnu"}</p>
                    <p className="text-xs text-muted-foreground">Inscrit le {enrollment.enrolledAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{enrollment.progress}%</p>
                    <p className="text-xs text-muted-foreground">{enrollment.completedLevels.length}/{programLevels.length} niveaux</p>
                  </div>
                </div>
              )
            })}
            {programEnrollments.length > 5 && (
              <Link
                href={`/professeur/programmes/${program.id}/etudiants`}
                className="text-xs text-center text-primary hover:underline py-2"
              >
                Voir tous les {programEnrollments.length} étudiants
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}