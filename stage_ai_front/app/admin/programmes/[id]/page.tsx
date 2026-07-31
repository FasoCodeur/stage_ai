"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PROGRAMS, PROGRAM_ENROLLMENTS, USERS, LEVELS, COURSES } from "@/lib/mock-data"
import { useProgramStore } from "@/lib/stores/program-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  PlusCircle,
  X,
  CheckCircle2,
  Lock,
  Circle,
} from "lucide-react"
import Link from "next/link"

export default function AdminProgramDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const { publishProgram, deleteProgram, addLevel, removeLevel, assignCourseToLevel, removeCourseFromLevel } = useProgramStore()

  const program = PROGRAMS.find((p) => p.id === id)
  const mentor = program ? USERS.find((u) => u.id === program.mentorId) : null
  const levels = program ? LEVELS.filter((l) => l.programId === program.id).sort((a, b) => a.order - b.order) : []
  const enrollments = program ? PROGRAM_ENROLLMENTS.filter((e) => e.programId === program.id) : []

  // New level form
  const [showLevelForm, setShowLevelForm] = useState(false)
  const [levelTitle, setLevelTitle] = useState("")
  const [levelDescription, setLevelDescription] = useState("")
  const [levelDuration, setLevelDuration] = useState(30)

  // Assign course modal
  const [assigningLevelId, setAssigningLevelId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState("")

  // Available courses not already in the level
  const availableCourses = COURSES.filter((c) => c.published)

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

  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0

  const handleTogglePublish = () => {
    publishProgram(program.id, !program.published)
  }

  const handleDelete = () => {
    if (confirm("Supprimer ce programme ? Cette action est irréversible.")) {
      deleteProgram(program.id)
      router.push("/admin/programmes")
    }
  }

  const handleAddLevel = () => {
    if (!levelTitle.trim()) return
    const nextOrder = levels.length > 0 ? levels[levels.length - 1].order + 1 : 1
    addLevel({
      id: `l${Date.now()}`,
      programId: program.id,
      title: levelTitle,
      description: levelDescription,
      duration: levelDuration,
      order: nextOrder,
      courses: [],
    })
    setLevelTitle("")
    setLevelDescription("")
    setLevelDuration(30)
    setShowLevelForm(false)
  }

  const handleAssignCourse = () => {
    if (!assigningLevelId || !selectedCourseId) return
    assignCourseToLevel(assigningLevelId, selectedCourseId)
    setAssigningLevelId(null)
    setSelectedCourseId("")
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Link
        href="/admin/programmes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour à la gestion des programmes
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
            <span className="flex items-center gap-1.5"><Layers className="size-4" />{levels.length} niveaux</span>
            <span className="flex items-center gap-1.5"><Users className="size-4" />{enrollments.length} inscrits</span>
            <span className="font-semibold text-foreground">{program.subscriptionPrice.toLocaleString("fr-FR")} FCFA/mois</span>
            <span className="text-xs text-muted-foreground">{program.startDate} → {program.endDate}</span>
          </div>

          {mentor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="size-4 text-primary" />
              <span>Mentor: <strong>{mentor.name}</strong></span>
            </div>
          )}

          {enrollments.length > 0 && (
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
        <Link href={`/admin/programmes/${program.id}/modifier`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Edit className="size-3" /> Modifier
        </Link>
        <button onClick={handleTogglePublish} className={buttonVariants({ size: "sm", variant: "outline" })}>
          {program.published ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          {program.published ? "Suspendre" : "Publier"}
        </button>
        <Link href={`/admin/programmes/${program.id}/etudiants`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Users className="size-3" /> Étudiants ({enrollments.length})
        </Link>
        <button onClick={handleDelete} className={buttonVariants({ size: "sm", variant: "outline", className: "text-destructive" })}>
          <Trash2 className="size-3" /> Supprimer
        </button>
      </div>

      {/* Levels Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Niveaux</h2>
          <button
            onClick={() => setShowLevelForm(!showLevelForm)}
            className={buttonVariants({ size: "sm" })}
          >
            <PlusCircle className="size-3.5" />
            Ajouter un niveau
          </button>
        </div>

        {/* Add level form */}
        {showLevelForm && (
          <Card className="mb-4 border-primary/30">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Nouveau niveau</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <Label htmlFor="levelTitle">Titre du niveau</Label>
                  <Input id="levelTitle" value={levelTitle} onChange={(e) => setLevelTitle(e.target.value)} placeholder="Ex: Fondamentaux du Web" />
                </div>
                <div>
                  <Label htmlFor="levelDesc">Description</Label>
                  <Textarea id="levelDesc" value={levelDescription} onChange={(e) => setLevelDescription(e.target.value)} rows={2} />
                </div>
                <div>
                  <Label htmlFor="levelDuration">Durée (jours)</Label>
                  <Input id="levelDuration" type="number" min={1} value={levelDuration} onChange={(e) => setLevelDuration(Number(e.target.value))} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddLevel} className={buttonVariants({ size: "sm" })}>
                    <PlusCircle className="size-3" /> Ajouter
                  </button>
                  <button onClick={() => setShowLevelForm(false)} className={buttonVariants({ size: "sm", variant: "outline" })}>
                    Annuler
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {levels.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/20">
            Aucun niveau défini. Ajoutez des niveaux pour structurer votre programme.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {levels.map((level, index) => {
              const levelCourses = level.courses.map((cid) => COURSES.find((c) => c.id === cid)).filter((c): c is NonNullable<typeof c> => c != null)
              const coursesNotInLevel = availableCourses.filter((c) => !level.courses.includes(c.id))

              return (
                <Card key={level.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-semibold text-primary">
                        {level.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-sm">{level.title}</h3>
                            <Badge variant="outline" className="text-[10px]">{level.duration} jours</Badge>
                          </div>
                          <button
                            onClick={() => removeLevel(level.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Supprimer ce niveau"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{level.description}</p>

                        {/* Assigned courses */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-muted-foreground">Cours assignés ({level.courses.length})</span>
                            {coursesNotInLevel.length > 0 && (
                              <button
                                onClick={() => setAssigningLevelId(level.id)}
                                className="text-xs text-primary hover:underline"
                              >
                                + Assigner un cours
                              </button>
                            )}
                          </div>

                          {assigningLevelId === level.id && (
                            <div className="flex items-center gap-2 mb-2">
                              <Select value={selectedCourseId} onValueChange={(value) => setSelectedCourseId(value ?? "")}>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue placeholder="Choisir un cours..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {coursesNotInLevel.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className="text-xs">
                                      {c.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <button onClick={handleAssignCourse} className={buttonVariants({ size: "sm", className: "h-8 text-xs" })}>
                                Assigner
                              </button>
                              <button onClick={() => setAssigningLevelId(null)} className={buttonVariants({ size: "sm", variant: "outline", className: "h-8 text-xs" })}>
                                Annuler
                              </button>
                            </div>
                          )}

                          {levelCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {levelCourses.map((course) => (
                                <Badge key={course?.id} variant="secondary" className="text-[10px] gap-1 pr-1">
                                  {course?.title}
                                  <button
                                    onClick={() => removeCourseFromLevel(level.id, course.id)}
                                    className="ml-0.5 hover:text-destructive"
                                  >
                                    <X className="size-2.5" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">Aucun cours assigné</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Enrollments */}
      {enrollments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Étudiants inscrits ({enrollments.length})</h2>
          <div className="flex flex-col gap-2">
            {enrollments.map((enrollment) => {
              const student = USERS.find((u) => u.id === enrollment.userId)
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
                    <p className="text-xs text-muted-foreground">{enrollment.completedLevels.length}/{levels.length} niveaux</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}