"use client"

import { useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { PROGRAMS, PROGRAM_ENROLLMENTS, USERS, LEVELS } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Users,
  BookOpen,
  Layers,
  UserCheck,
  PlusCircle,
  TrendingUp,
  GraduationCap,
  Eye,
  Edit,
} from "lucide-react"
import Link from "next/link"

export default function ProfessorProgrammesPage() {
  const { user } = useAuth()

  const myPrograms = PROGRAMS.filter((p) => p.mentorId === user?.id)

  const totalStudents = useMemo(() => {
    const studentIds = new Set<string>()
    myPrograms.forEach((p) => p.students.forEach((sid) => studentIds.add(sid)))
    return studentIds.size
  }, [myPrograms])

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Programmes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {myPrograms.length} programme{myPrograms.length > 1 ? "s" : ""} — {totalStudents} étudiant{totalStudents > 1 ? "s" : ""} suivi{totalStudents > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/professeur/programmes/nouveau"
          className={buttonVariants({ size: "sm" })}
        >
          <PlusCircle className="size-3.5" />
          Nouveau programme
        </Link>
      </div>

      {myPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border rounded-xl bg-muted/20">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun programme pour le moment</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Créez votre premier programme de formation avec mentor.
            </p>
          </div>
          <Link
            href="/professeur/programmes/nouveau"
            className={buttonVariants({ size: "sm" })}
          >
            <PlusCircle className="size-3.5" />
            Créer un programme
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myPrograms.map((program) => {
            const enrollments = PROGRAM_ENROLLMENTS.filter((e) => e.programId === program.id)
            const mentor = USERS.find((u) => u.id === program.mentorId)
            const levelCount = LEVELS.filter((l) => l.programId === program.id).length

            return (
              <Card key={program.id} className="flex flex-col overflow-hidden">
                <div className="h-24 bg-primary/5 flex items-center justify-center border-b">
                  <span className="text-4xl">{program.thumbnail}</span>
                </div>
                <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="font-semibold text-foreground text-sm leading-snug">{program.title}</h2>
                      <Badge variant={program.published ? "default" : "secondary"} className="text-[10px]">
                        {program.published ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{program.description}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Calendar className="size-3" />{program.duration} mois</div>
                    <div className="flex items-center gap-1"><Layers className="size-3" />{levelCount} niveaux</div>
                    <div className="flex items-center gap-1"><Users className="size-3" />{enrollments.length} inscrits</div>
                  </div>

                  {enrollments.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progression moyenne</span>
                        <span>
                          {Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)}
                        className="h-1.5"
                      />
                    </div>
                  )}

                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/professeur/programmes/${program.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1" })}
                    >
                      <Eye className="size-3" />
                      Voir
                    </Link>
                    <Link
                      href={`/professeur/programmes/${program.id}/modifier`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1" })}
                    >
                      <Edit className="size-3" />
                      Modifier
                    </Link>
                    <Link
                      href={`/professeur/programmes/${program.id}/etudiants`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1" })}
                    >
                      <Users className="size-3" />
                      Étudiants
                    </Link>
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