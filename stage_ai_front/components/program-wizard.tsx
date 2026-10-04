"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PlusCircle,
  Rocket,
  Trash2,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { type Program } from "@/lib/mock-data"
import { getFriendlyErrorMessage } from "@/lib/api"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"

/** Clé locale mémorisant le brouillon en cours pour pouvoir le reprendre. */
const DRAFT_STORAGE_KEY = "stageia_program_draft"

const STEP_LABELS = [
  { number: 1, label: "Infos" },
  { number: 2, label: "Parcours" },
  { number: 3, label: "Publication" },
] as const

interface StepDraft {
  id?: string
  title: string
  description: string
  duration: number
  courses: string[]
}

interface DraftInfo {
  id: string
  at: number
}

interface ProgramWizardProps {
  role: "admin" | "professeur"
}

const todayIso = () => new Date().toISOString().split("T")[0]

const addMonths = (months: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() + Math.max(months, 1))
  return date.toISOString().split("T")[0]
}

/**
 * Assistant de création d'un programme en 3 étapes (Infos → Parcours → Publication).
 * Un brouillon est enregistré dès la première étape : quitter la page ne fait
 * rien perdre, la création peut être reprise plus tard.
 */
export function ProgramWizard({ role }: ProgramWizardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const {
    createProgramApi,
    updateProgramApi,
    updateProgramStepsApi,
    fetchProgramById,
    fetchLevelsByProgram,
    deleteProgramApi,
  } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const { courses, fetchCourses } = useCourseStore()

  const listPath = role === "admin" ? "/admin/programmes" : "/professeur/programmes"

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [programId, setProgramId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [mentorId, setMentorId] = useState("")
  const [duration, setDuration] = useState(3)
  const [subscriptionPrice, setSubscriptionPrice] = useState(15000)
  const [autoDates, setAutoDates] = useState(true)
  const [startDate, setStartDate] = useState(todayIso())
  const [endDate, setEndDate] = useState(addMonths(3))
  const [steps, setSteps] = useState<StepDraft[]>([])
  const [courseSearch, setCourseSearch] = useState("")
  const [draft, setDraft] = useState<Program | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  /** Position de l'étape à afficher à l'écran après un ajout. */
  const pendingStepScroll = useRef<number | null>(null)

  const professors = users.filter((u) => u.role === "professeur")

  const visibleCourses = useMemo(() => {
    const term = courseSearch.trim().toLowerCase()
    if (!term) return courses
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        (course.category || "").toLowerCase().includes(term),
    )
  }, [courses, courseSearch])

  const totalCourses = steps.reduce((total, item) => total + item.courses.length, 0)
  const canPublish = steps.length > 0 && totalCourses > 0

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchCourses(), fetchUsers()])

        const stored = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (stored) {
          try {
            const info = JSON.parse(stored) as DraftInfo
            const program = await fetchProgramById(info.id)
            if (program.published) {
              localStorage.removeItem(DRAFT_STORAGE_KEY)
            } else {
              setDraft(program)
            }
          } catch {
            // brouillon supprimé entre-temps
            localStorage.removeItem(DRAFT_STORAGE_KEY)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Après l'ajout d'une étape, on défile jusqu'à la nouvelle carte pour que son
  // formulaire soit directement visible, sans devoir remonter la liste.
  useEffect(() => {
    const index = pendingStepScroll.current
    if (index === null) return
    pendingStepScroll.current = null
    document
      .getElementById(`wizard-step-${index}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [steps.length])

  const resolvedMentorId =
    role === "professeur" ? user?.id ?? "" : mentorId || user?.id || ""

  const buildBasePayload = () => ({
    title: title.trim(),
    description: description.trim(),
    thumbnail,
    duration,
    subscriptionPrice,
    mentorId: resolvedMentorId,
    startDate: autoDates ? todayIso() : startDate,
    endDate: autoDates ? addMonths(duration) : endDate,
  })

  const goToStep = (target: 1 | 2 | 3) => {
    setError("")
    setStep(target)
  }

  /**
   * Ajoute une étape à la fin du parcours et mémorise sa position afin de faire
   * défiler l'écran jusqu'à elle : plus besoin de remonter en haut de la liste.
   */
  const addStep = () => {
    pendingStepScroll.current = steps.length
    setSteps((previous) => [
      ...previous,
      { title: "", description: "", duration: 30, courses: [] },
    ])
  }

  const updateStepDraft = (index: number, data: Partial<StepDraft>) =>
    setSteps((previous) =>
      previous.map((item, i) => (i === index ? { ...item, ...data } : item)),
    )

  const removeStep = (index: number) =>
    setSteps((previous) => previous.filter((_, i) => i !== index))

  const toggleCourse = (index: number, courseId: string, checked: boolean) =>
    setSteps((previous) =>
      previous.map((item, i) => {
        if (i !== index) return item
        return {
          ...item,
          courses: checked
            ? [...item.courses, courseId]
            : item.courses.filter((id) => id !== courseId),
        }
      }),
    )

  /** Étape 1 → crée (ou met à jour) le brouillon puis passe au parcours. */
  const handleStepOne = async () => {
    if (!title.trim() || !description.trim()) {
      setError("Le titre et la description sont obligatoires.")
      return
    }
    if (role === "admin" && !mentorId) {
      setError("Sélectionnez le mentor du programme.")
      return
    }

    setSaving(true)
    setError("")

    try {
      if (programId) {
        await updateProgramApi(programId, {
          title: title.trim(),
          description: description.trim(),
          thumbnail,
        })
      } else {
        const created = await createProgramApi({
          ...buildBasePayload(),
          published: false,
        })
        setProgramId(created.id)
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ id: created.id, at: Date.now() }),
        )
      }
      goToStep(2)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "L'enregistrement du brouillon a échoué."))
    } finally {
      setSaving(false)
    }
  }

  /** Étape 2 → enregistre tout le parcours en un seul appel. */
  const handleStepTwo = async () => {
    if (!programId) return

    if (steps.length === 0) {
      setError("Ajoutez au moins une étape pour continuer.")
      return
    }
    if (steps.some((item) => !item.title.trim())) {
      setError("Chaque étape doit avoir un titre.")
      return
    }

    setSaving(true)
    setError("")

    try {
      await updateProgramStepsApi(
        programId,
        steps.map((item) => ({
          id: item.id,
          title: item.title.trim(),
          description: item.description.trim(),
          duration: item.duration,
          courses: item.courses,
        })),
      )
      goToStep(3)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "L'enregistrement du parcours a échoué."))
    } finally {
      setSaving(false)
    }
  }

  /** Étape 3 → finalise (publication ou conservation en brouillon). */
  const handleFinish = async (published: boolean) => {
    if (!programId) return

    if (published && !canPublish) {
      setError("Ajoutez au moins un cours à une étape avant de publier.")
      return
    }
    if (!autoDates && new Date(startDate) > new Date(endDate)) {
      setError("La date de fin doit être postérieure à la date de début.")
      return
    }

    setSaving(true)
    setError("")

    try {
      await updateProgramApi(programId, { ...buildBasePayload(), published })
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      router.push(listPath)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "L'enregistrement final a échoué."))
      setSaving(false)
    }
  }

  const handleCancel = async () => {
    if (programId) {
      const confirmed = confirm("Supprimer ce brouillon ? Cette action est définitive.")
      if (!confirmed) return
      try {
        await deleteProgramApi(programId)
      } catch {
        // brouillon déjà supprimé : on continue
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
    router.push(listPath)
  }

  const resumeDraft = async (program: Program) => {
    setSaving(true)
    setError("")

    try {
      setProgramId(program.id)
      setTitle(program.title || "")
      setDescription(program.description || "")
      setThumbnail(program.thumbnail ?? null)
      setMentorId(program.mentorId || "")
      setDuration(program.duration || 3)
      setSubscriptionPrice(program.subscriptionPrice ?? 15000)
      setStartDate(program.startDate || todayIso())
      setEndDate(program.endDate || addMonths(program.duration || 3))

      const levels = await fetchLevelsByProgram(program.id)
      setSteps(
        levels.map((level) => ({
          id: level.id,
          title: level.title,
          description: level.description || "",
          duration: level.duration,
          courses: level.courses || [],
        })),
      )
      setDraft(null)
      setStep(levels.length > 0 ? 3 : 2)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "La reprise du brouillon a échoué."))
    } finally {
      setSaving(false)
    }
  }

  const discardDraft = async () => {
    if (!draft) return
    if (!confirm(`Supprimer le brouillon « ${draft.title} » ?`)) return

    setSaving(true)
    try {
      await deleteProgramApi(draft.id)
    } catch {
      // déjà supprimé
    } finally {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      setDraft(null)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Préparation de l'assistant...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        href={listPath}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-3.5" />
        Retour à la liste des programmes
      </Link>

      {draft && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              Création en cours : « {draft.title} »
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Votre brouillon est enregistré — reprenez la création ou abandonnez-le.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => resumeDraft(draft)}
              disabled={saving}
              className={buttonVariants({ size: "sm" })}
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={discardDraft}
              disabled={saving}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Abandonner
            </button>
          </div>
        </div>
      )}

      {/* Progression de l'assistant */}
      <ol className="flex items-center gap-2">
        {STEP_LABELS.map((item, index) => {
          const isDone = step > item.number
          const isCurrent = step === item.number
          const canGoBack = isDone && !saving

          return (
            <li key={item.number} className="flex items-center gap-2 flex-1 last:flex-none">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={() => canGoBack && goToStep(item.number as 1 | 2 | 3)}
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
                <span
                  className={
                    isCurrent ? "text-xs font-medium text-foreground" : "text-xs text-muted-foreground"
                  }
                >
                  {item.label}
                </span>
              </button>
              {index < STEP_LABELS.length - 1 && (
                <span
                  className={`hidden sm:block h-px flex-1 ${step > item.number ? "bg-primary" : "bg-border"}`}
                />
              )}
            </li>
          )
        })}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "1. Informations générales"}
            {step === 2 && "2. Parcours du programme"}
            {step === 3 && "3. Publication"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Titre, description et logo. Un brouillon est enregistré dès cette étape."}
            {step === 2 && "Organisez le programme en étapes et rattachez les cours existants."}
            {step === 3 && "Derniers réglages, puis publication ou conservation en brouillon."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Action impossible</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <ImageUpload value={thumbnail} onChange={setThumbnail} />

              <div>
                <Label htmlFor="wizard-title">Titre *</Label>
                <Input
                  id="wizard-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Développement Web Full-Stack"
                />
              </div>

              <div>
                <Label htmlFor="wizard-description">Description *</Label>
                <Textarea
                  id="wizard-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ce que l'étudiant va apprendre, en quelques phrases..."
                  rows={3}
                />
              </div>

              {role === "admin" ? (
                <div>
                  <Label htmlFor="wizard-mentor">Mentor *</Label>
                  <Select value={mentorId} onValueChange={(value) => setMentorId(value ?? "")}>
                    <SelectTrigger id="wizard-mentor" className="h-9 w-full">
                      <SelectValue placeholder="Sélectionner un mentor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Mentor : <strong className="text-foreground">{user?.name}</strong> (vous)
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {steps.length} étape{steps.length > 1 ? "s" : ""} · {totalCourses} cours sélectionné
                  {totalCourses > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  onClick={addStep}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <PlusCircle className="size-3.5" />
                  Ajouter une étape
                </button>
              </div>

              {steps.length === 0 ? (
                <p className="rounded-lg border bg-muted/20 px-3 py-6 text-center text-xs italic text-muted-foreground">
                  Aucune étape pour le moment. Ajoutez la première étape de votre parcours.
                </p>
              ) : (
                <>
                  <Input
                    type="search"
                    placeholder="Rechercher un cours..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="h-9"
                  />

                  {steps.map((item, index) => (
                    <div
                      key={index}
                      id={`wizard-step-${index}`}
                      className="flex scroll-mt-24 flex-col gap-3 rounded-lg border bg-background p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Étape {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Supprimer l'étape ${index + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <Label htmlFor={`step-title-${index}`}>Titre *</Label>
                          <Input
                            id={`step-title-${index}`}
                            value={item.title}
                            onChange={(e) => updateStepDraft(index, { title: e.target.value })}
                            placeholder="Ex: Les bases du HTML et CSS"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`step-duration-${index}`}>Durée (jours)</Label>
                          <Input
                            id={`step-duration-${index}`}
                            type="number"
                            min={1}
                            value={item.duration}
                            onChange={(e) => updateStepDraft(index, { duration: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`step-description-${index}`}>Description (optionnelle)</Label>
                        <Textarea
                          id={`step-description-${index}`}
                          value={item.description}
                          onChange={(e) => updateStepDraft(index, { description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>Cours rattachés ({item.courses.length})</Label>
                        {visibleCourses.length === 0 ? (
                          <p className="mt-1 text-xs italic text-muted-foreground">
                            {courses.length === 0
                              ? "Aucun cours disponible pour le moment."
                              : "Aucun cours ne correspond à la recherche."}
                          </p>
                        ) : (
                          <div className="mt-1.5 max-h-44 overflow-y-auto rounded-lg border divide-y">
                            {visibleCourses.map((course) => (
                              <label
                                key={course.id}
                                className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs hover:bg-muted/40"
                              >
                                <Checkbox
                                  checked={item.courses.includes(course.id)}
                                  onCheckedChange={(checked) =>
                                    toggleCourse(index, course.id, Boolean(checked))
                                  }
                                />
                                <span className="flex-1 truncate">{course.title}</span>
                                {!course.published && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Brouillon
                                  </Badge>
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Point d'ajout en bas de liste : évite de remonter tout en haut. */}
                  <button
                    type="button"
                    onClick={addStep}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  >
                    <PlusCircle className="size-3.5" />
                    Ajouter une étape
                  </button>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs font-medium text-foreground mb-1.5">Récapitulatif</p>
                <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`size-3.5 ${thumbnail ? "text-green-500" : "text-muted-foreground"}`}
                    />
                    Logo {thumbnail ? "ajouté" : "non ajouté"}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-green-500" />
                    {title.trim() || "Sans titre"}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2
                      className={`size-3.5 ${canPublish ? "text-green-500" : "text-amber-500"}`}
                    />
                    {steps.length} étape{steps.length > 1 ? "s" : ""} · {totalCourses} cours
                    {!canPublish && " — au moins une étape doit contenir un cours pour publier"}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-green-500" />
                    Mentor :{" "}
                    {role === "admin"
                      ? professors.find((professor) => professor.id === mentorId)?.name || "non défini"
                      : user?.name}
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wizard-price">Prix mensuel (FCFA)</Label>
                  <Input
                    id="wizard-price"
                    type="number"
                    min={0}
                    step={1000}
                    value={subscriptionPrice}
                    onChange={(e) => setSubscriptionPrice(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="wizard-duration">Durée du programme (mois)</Label>
                  <Input
                    id="wizard-duration"
                    type="number"
                    min={1}
                    max={24}
                    value={duration}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      setDuration(value)
                      if (autoDates) setEndDate(addMonths(value))
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-lg border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium leading-none">Dates du programme</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {autoDates
                        ? `Automatiques : du ${todayIso()} au ${addMonths(duration)}`
                        : "Personnalisées : choisissez la période d'inscription"}
                    </p>
                  </div>
                  <div className="flex items-center border rounded-lg h-9 p-0.5 bg-muted/30 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAutoDates(true)}
                      className={`flex items-center justify-center rounded-md px-2.5 h-full text-xs transition-colors ${
                        autoDates
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Automatiques
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoDates(false)}
                      className={`flex items-center justify-center rounded-md px-2.5 h-full text-xs transition-colors ${
                        !autoDates
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Personnalisées
                    </button>
                  </div>
                </div>

                {!autoDates && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="wizard-start">Date de début</Label>
                      <Input
                        id="wizard-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="wizard-end">Date de fin</Label>
                      <Input
                        id="wizard-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation entre les étapes */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => goToStep((step - 1) as 1 | 2 | 3)}
                disabled={saving}
                className={buttonVariants({ variant: "outline" })}
              >
                <ChevronLeft className="size-3.5" />
                Retour
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleStepOne}
                disabled={saving}
                className={buttonVariants({ className: "flex-1" })}
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronRight className="size-3.5" />}
                {saving ? "Enregistrement..." : programId ? "Enregistrer et continuer" : "Continuer"}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={handleStepTwo}
                disabled={saving}
                className={buttonVariants({ className: "flex-1" })}
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <ChevronRight className="size-3.5" />}
                {saving ? "Enregistrement..." : "Enregistrer et continuer"}
              </button>
            )}

            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  disabled={saving || !canPublish}
                  className={buttonVariants({ className: "flex-1" })}
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Rocket className="size-3.5" />}
                  Publier le programme
                </button>
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  disabled={saving}
                  className={buttonVariants({ variant: "outline", className: "flex-1" })}
                >
                  Garder en brouillon
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className={buttonVariants({ variant: "ghost" })}
            >
              Annuler
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
