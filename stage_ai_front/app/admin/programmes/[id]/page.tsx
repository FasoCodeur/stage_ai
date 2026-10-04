"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { Card, CardContent } from "@/components/ui/card"
import { ProgramThumbnail } from "@/components/program-thumbnail"
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
import { Checkbox } from "@/components/ui/checkbox"
import { getFriendlyErrorMessage } from "@/lib/api"
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  UserCheck,
  Edit,
  Eye,
  EyeOff,
  Trash2,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const LEVEL_FORM_STEPS = [
  { number: 1, label: "Infos" },
  { number: 2, label: "Cours" },
] as const

export default function AdminProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByProgram, updateProgramApi, deleteProgramApi, createLevelApi, removeLevelApi, assignCourseToLevelApi, removeCourseFromLevelApi } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const { courses, fetchCourses } = useCourseStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // New level form (2 steps: informations then courses)
  const [showLevelForm, setShowLevelForm] = useState(false)
  const [levelStep, setLevelStep] = useState<1 | 2>(1)
  const [levelTitle, setLevelTitle] = useState("")
  const [levelDescription, setLevelDescription] = useState("")
  const [levelDuration, setLevelDuration] = useState(30)
  const [selectedLevelCourseIds, setSelectedLevelCourseIds] = useState<string[]>([])
  const [levelCourseFilter, setLevelCourseFilter] = useState("")
  const [creatingLevel, setCreatingLevel] = useState(false)
  const [levelError, setLevelError] = useState("")

  // Assign course modal
  const [assigningLevelId, setAssigningLevelId] = useState<string | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState("")

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
        <Link href="/admin/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  const availableCourses = courses.filter((c) => c.published)
  const courseById = (cid: string) => courses.find((c) => c.id === cid)
  const unpublishedCoursesCount = courses.length - availableCourses.length
  const levelCourseSearch = levelCourseFilter.trim().toLowerCase()
  const filteredLevelCourses = availableCourses.filter((c) =>
    c.title.toLowerCase().includes(levelCourseSearch)
  )
  const allVisibleCoursesSelected =
    filteredLevelCourses.length > 0 && filteredLevelCourses.every((c) => selectedLevelCourseIds.includes(c.id))
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
      router.push("/admin/programmes")
    }
  }

  const handleCloseLevelForm = () => {
    setShowLevelForm(false)
    setLevelStep(1)
    setLevelTitle("")
    setLevelDescription("")
    setLevelDuration(30)
    setSelectedLevelCourseIds([])
    setLevelCourseFilter("")
    setLevelError("")
  }

  const handleOpenLevelForm = () => {
    setShowLevelForm(true)
    setLevelStep(1)
    setLevelError("")
  }

  const handleToggleLevelForm = () => {
    if (showLevelForm) {
      handleCloseLevelForm()
    } else {
      handleOpenLevelForm()
    }
  }

  const handleGoToLevelCourses = () => {
    if (!levelTitle.trim()) {
      setLevelError("Indiquez un titre pour le niveau avant de continuer.")
      return
    }
    setLevelError("")
    setLevelStep(2)
  }

  const handleToggleLevelCourse = (courseId: string) => {
    setSelectedLevelCourseIds((previous) =>
      previous.includes(courseId) ? previous.filter((id) => id !== courseId) : [...previous, courseId]
    )
  }

  const handleSelectAllLevelCourses = () => {
    const visibleIds = filteredLevelCourses.map((c) => c.id)
    setSelectedLevelCourseIds((previous) =>
      allVisibleCoursesSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...previous, ...visibleIds]))
    )
  }

  const handleCreateLevel = async () => {
    if (!levelTitle.trim() || creatingLevel) return
    setCreatingLevel(true)
    setLevelError("")
    try {
      await createLevelApi(program.id, {
        title: levelTitle.trim(),
        description: levelDescription,
        duration: levelDuration,
        courses: selectedLevelCourseIds,
      })
      handleCloseLevelForm()
    } catch (err) {
      setLevelError(getFriendlyErrorMessage(err, "La création du niveau a échoué. Veuillez réessayer."))
    } finally {
      setCreatingLevel(false)
    }
  }

  const handleRemoveLevel = async (levelId: string) => {
    if (confirm("Supprimer ce niveau ?")) {
      await removeLevelApi(levelId)
    }
  }

  const handleAssignCourse = async () => {
    if (!assigningLevelId || !selectedCourseId) return
    await assignCourseToLevelApi(assigningLevelId, selectedCourseId)
    setAssigningLevelId(null)
    setSelectedCourseId("")
  }

  const handleRemoveCourse = async (levelId: string, courseId: string) => {
    await removeCourseFromLevelApi(levelId, courseId)
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
        <ProgramThumbnail
          value={program.thumbnail}
          alt={program.title}
          className="size-20 rounded-xl bg-primary/5 shrink-0"
          textClassName="text-4xl"
          iconClassName="size-7"
        />
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
            <span className="text-xs text-muted-foreground">{program.startDate} → {program.endDate}</span>
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
        <Link href={`/admin/programmes/${program.id}/modifier`} className={buttonVariants({ size: "sm", variant: "outline" })}>
          <Edit className="size-3" /> Modifier
        </Link>
        <button onClick={handleTogglePublish} disabled={saving} className={buttonVariants({ size: "sm", variant: "outline" })}>
          {saving ? <Loader2 className="size-3 animate-spin" /> : program.published ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          {program.published ? "Suspendre" : "Publier"}
        </button>
        <button onClick={handleDelete} className={buttonVariants({ size: "sm", variant: "outline", className: "text-destructive" })}>
          <Trash2 className="size-3" /> Supprimer
        </button>
      </div>

      {/* Levels Management */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Niveaux</h2>
          <button
            onClick={handleToggleLevelForm}
            className={buttonVariants({ size: "sm" })}
          >
            <PlusCircle className="size-3.5" />
            Ajouter un niveau
          </button>
        </div>

        {/* Add level form : 2 étapes (informations puis cours) */}
        {showLevelForm && (
          <Card className="mb-4 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {levelStep === 1 ? "Nouveau niveau" : `Nouveau niveau : ${levelTitle.trim()}`}
                </h3>
                <span className="text-xs text-muted-foreground">Étape {levelStep}/2</span>
              </div>

              {/* Progression : même langage visuel que l'assistant de création du programme */}
              <ol className="mb-4 flex items-center gap-2">
                {LEVEL_FORM_STEPS.map((item, index) => {
                  const isDone = levelStep > item.number
                  const isCurrent = levelStep === item.number
                  const canGoBack = isDone && !creatingLevel

                  return (
                    <li key={item.number} className="flex items-center gap-2 flex-1 last:flex-none">
                      <button
                        type="button"
                        disabled={!canGoBack}
                        onClick={() => canGoBack && setLevelStep(item.number)}
                        className={`flex items-center gap-2 ${canGoBack ? "cursor-pointer" : "cursor-default"}`}
                      >
                        <span
                          className={`flex size-6 items-center justify-center rounded-full border text-[11px] font-semibold ${
                            isDone
                              ? "border-primary bg-primary text-primary-foreground"
                              : isCurrent
                                ? "border-primary text-primary"
                                : "border-muted-foreground/30 text-muted-foreground"
                          }`}
                        >
                          {isDone ? <Check className="size-3.5" /> : item.number}
                        </span>
                        <span className={isCurrent ? "text-xs font-medium text-foreground" : "text-xs text-muted-foreground"}>
                          {item.label}
                        </span>
                      </button>
                      {index < LEVEL_FORM_STEPS.length - 1 && (
                        <span className={`hidden sm:block h-px flex-1 ${levelStep > item.number ? "bg-primary" : "bg-border"}`} />
                      )}
                    </li>
                  )
                })}
              </ol>

              {levelStep === 1 && (
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
                </div>
              )}
              {levelStep === 2 && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {selectedLevelCourseIds.length} cours sélectionné{selectedLevelCourseIds.length > 1 ? "s" : ""} sur {availableCourses.length} disponible{availableCourses.length > 1 ? "s" : ""}
                    </p>
                    {filteredLevelCourses.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllLevelCourses}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        {allVisibleCoursesSelected ? "Tout désélectionner" : "Tout sélectionner"}
                      </button>
                    )}
                  </div>

                  {availableCourses.length === 0 ? (
                    <p className="rounded-lg border bg-muted/20 px-3 py-6 text-center text-xs italic text-muted-foreground">
                      Aucun cours publié disponible pour le moment. Vous pourrez assigner des cours plus tard depuis la liste des niveaux.
                    </p>
                  ) : (
                    <>
                      <Input
                        type="search"
                        placeholder="Rechercher un cours..."
                        value={levelCourseFilter}
                        onChange={(e) => setLevelCourseFilter(e.target.value)}
                        className="h-9"
                      />

                      {filteredLevelCourses.length === 0 ? (
                        <p className="rounded-lg border bg-muted/20 px-3 py-6 text-center text-xs italic text-muted-foreground">
                          Aucun cours ne correspond à la recherche.
                        </p>
                      ) : (
                        <div className="max-h-64 overflow-y-auto rounded-lg border divide-y">
                          {filteredLevelCourses.map((course) => (
                            <label
                              key={course.id}
                              className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-muted/40"
                            >
                              <Checkbox
                                checked={selectedLevelCourseIds.includes(course.id)}
                                onCheckedChange={() => handleToggleLevelCourse(course.id)}
                              />
                              <span className="flex-1 truncate">{course.title}</span>
                              <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                            </label>
                          ))}
                        </div>
                      )}

                      {unpublishedCoursesCount > 0 && (
                        <p className="text-xs italic text-muted-foreground">
                          {unpublishedCoursesCount} cours non publié{unpublishedCoursesCount > 1 ? "s" : ""} ne peu{unpublishedCoursesCount > 1 ? "vent" : "t"} pas être assigné{unpublishedCoursesCount > 1 ? "s" : ""}.
                        </p>
                      )}
                    </>
                  )}

                  {selectedLevelCourseIds.length === 0 && (
                    <p className="text-xs text-amber-600">
                      Astuce : un niveau sans cours empêche la publication du programme.
                    </p>
                  )}
                </div>
              )}

              {levelError && <p className="mt-3 text-xs text-destructive">{levelError}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                {levelStep === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setLevelError("")
                      setLevelStep(1)
                    }}
                    disabled={creatingLevel}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <ChevronLeft className="size-3" /> Retour
                  </button>
                )}
                {levelStep === 1 ? (
                  <button type="button" onClick={handleGoToLevelCourses} className={buttonVariants({ size: "sm" })}>
                    <ChevronRight className="size-3" /> Suivant
                  </button>
                ) : (
                  <button type="button" onClick={handleCreateLevel} disabled={creatingLevel} className={buttonVariants({ size: "sm" })}>
                    {creatingLevel ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                    {creatingLevel ? "Création..." : "Créer le niveau"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseLevelForm}
                  disabled={creatingLevel}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Annuler
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {programLevels.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border rounded-lg bg-muted/20">
            Aucun niveau défini. Ajoutez des niveaux pour structurer votre programme.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {programLevels.map((level) => {
              const levelCourses = level.courses.map((cid) => courseById(cid)).filter((c): c is NonNullable<typeof c> => c != null)
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
                            onClick={() => handleRemoveLevel(level.id)}
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
                                    onClick={() => handleRemoveCourse(level.id, course.id)}
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
      {programEnrollments.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Étudiants inscrits ({programEnrollments.length})</h2>
          <div className="flex flex-col gap-2">
            {programEnrollments.map((enrollment) => {
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
          </div>
        </div>
      )}
    </div>
  )
}