"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Users,
  Layers,
  CheckCircle2,
  Circle,
  Lock,
  MessageSquare,
  Loader2,
} from "lucide-react"
import Link from "next/link"

export default function ProgramStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByProgram, updateMentorNotesApi } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [savingNote, setSavingNote] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchPrograms(),
          fetchUsers(),
          fetchLevelsByProgram(id),
          fetchEnrollmentsByProgram(id),
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchPrograms, fetchUsers, fetchLevelsByProgram, fetchEnrollmentsByProgram])

  const program = programs.find((p) => p.id === id)
  const programLevels = levels.filter((l) => l.programId === id).sort((a, b) => a.order - b.order)
  const programEnrollments = enrollments.filter((e) => e.programId === id)

  const saveNote = async (userId: string, note: string) => {
    setSavingNote(userId)
    try {
      await updateMentorNotesApi(id, userId, note)
    } finally {
      setSavingNote(null)
    }
  }

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
        <Link href="/professeur/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Link
        href={`/professeur/programmes/${program.id}`}
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
            <p className="text-xs text-muted-foreground mt-0.5">
              Les étudiants inscrits apparaîtront ici.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {programEnrollments.map((enrollment) => {
            const student = users.find((u) => u.id === enrollment.userId)
            const currentLevel = programLevels[enrollment.currentLevelIndex]
            const statusLabel = enrollment.status === "active" ? "Actif" : enrollment.status === "completed" ? "Terminé" : "Expiré"
            const statusColor = enrollment.status === "active" ? "bg-green-100 text-green-700" : enrollment.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"

            return (
              <Card key={enrollment.userId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Student info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                        {student?.avatar || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-sm truncate">{student?.name || "Inconnu"}</h3>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{student?.email}</p>
                        <p className="text-xs text-muted-foreground">Inscrit le {enrollment.enrolledAt}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progression</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {enrollment.completedLevels.length}/{programLevels.length} niveaux
                      </p>
                    </div>
                  </div>

                  {/* Level progression */}
                  <div className="mt-3 flex flex-col gap-1.5">
                    <p className="text-xs font-medium text-muted-foreground">Niveaux</p>
                    <div className="flex flex-wrap gap-1.5">
                      {programLevels.map((level, index) => {
                        const isCompleted = enrollment.completedLevels.includes(level.id)
                        const isCurrent = index === enrollment.currentLevelIndex
                        const isLocked = !isCompleted && !isCurrent && index > enrollment.currentLevelIndex

                        return (
                          <Badge
                            key={level.id}
                            variant="outline"
                            className={`text-[10px] gap-1 ${
                              isCompleted ? "border-green-300 bg-green-50 text-green-700" :
                              isCurrent ? "border-primary bg-primary/5 text-primary" :
                              "opacity-50"
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="size-2.5" /> :
                             isLocked ? <Lock className="size-2.5" /> :
                             <Circle className="size-2.5" />}
                            N{level.order}
                          </Badge>
                        )
                      })}
                    </div>
                    {currentLevel && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Niveau actuel : <strong>{currentLevel.title}</strong>
                      </p>
                    )}
                  </div>

                  {/* Mentor notes */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <MessageSquare className="size-3" />
                      <span>Note du mentor</span>
                      {savingNote === enrollment.userId && <Loader2 className="size-3 animate-spin" />}
                    </div>
                    <textarea
                      className="w-full text-xs rounded-md border border-input bg-background px-2 py-1.5 resize-none"
                      rows={2}
                      placeholder="Ajouter une note sur cet étudiant..."
                      defaultValue={enrollment.mentorNotes ?? ""}
                      onBlur={(e) => saveNote(enrollment.userId, e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}