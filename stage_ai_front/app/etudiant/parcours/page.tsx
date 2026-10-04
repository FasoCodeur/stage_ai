"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useCourseStore } from "@/lib/stores/course-store"
import { useLearningPathStore, type GeneratedPath } from "@/lib/stores/learning-path-store"
import { getFriendlyErrorMessage } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Route,
  CheckCircle2,
  Circle,
  Clock,
  CalendarDays,
  Target,
  Play,
  Hourglass,
  BookOpen,
} from "lucide-react"
import type { LearningPathWithSteps, LearningPathStep, Course } from "@/lib/mock-data"

function ParcoursContent() {
  const { user, isLoading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const { courses, fetchCourses } = useCourseStore()
  const { paths, fetchUserPaths, savePath, enrollStep } = useLearningPathStore()

  const [generating, setGenerating] = useState(false)
  const [busyStep, setBusyStep] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [loadingData, setLoadingData] = useState(true)

  const shouldGenerate = searchParams.get("generate") === "1"

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoadingData(false)
        return
      }
      try {
        await Promise.all([fetchCourses(), fetchUserPaths(user.id)])
      } catch (err) {
        setError(getFriendlyErrorMessage(err, "Impossible de charger votre parcours."))
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [user, fetchCourses, fetchUserPaths])

  const generateParcours = async () => {
    if (!user) return
    setGenerating(true)
    setError("")
    try {
      const catalogue = courses
        .filter((c) => c.published)
        .map((c) => ({ id: c.id, title: c.title, category: c.category, level: c.level }))

      const res = await fetch("/api/ai/pathway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectifMetier: user.objectifMetier ?? "Développeur Web",
          niveauEvalue: user.niveauEvalue ?? "Débutant",
          lacunes: [],
          dureeSemaines: 12,
          catalogue,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Erreur de génération")

      await savePath(user.id, data as GeneratedPath)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible de générer votre parcours. Veuillez réessayer."))
    } finally {
      setGenerating(false)
    }
  }

  const handleEnroll = async (path: LearningPathWithSteps, stepId: string) => {
    if (!user) return
    setBusyStep(stepId)
    setError("")
    try {
      await enrollStep(path.path.id, stepId, user.id)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible de démarrer cette étape."))
    } finally {
      setBusyStep(null)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement de votre parcours...
      </div>
    )
  }

  const currentPath: LearningPathWithSteps | undefined = paths[0]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Route className="size-5 text-primary" />
            Mon parcours personnalisé
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.objectifMetier
              ? `Objectif : ${user.objectifMetier} · Niveau évalué : ${user.niveauEvalue ?? "non évalué"}`
              : "Évaluez votre niveau pour que l'IA construise votre parcours."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/etudiant/onboarding" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Sparkles />
            {user?.assessmentDoneAt ? "Refaire l'évaluation" : "Évaluer mon niveau"}
          </Link>
          <Button size="sm" onClick={generateParcours} disabled={generating}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? "Génération..." : currentPath ? "Régénérer" : "Générer mon parcours"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {shouldGenerate && !currentPath && !generating && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <Sparkles className="size-4 text-primary shrink-0" />
          Cliquez sur « Générer mon parcours » pour que l&apos;IA crée votre plan de formation.
        </div>
      )}

      {!currentPath && !generating && (
        <Card className="border-dashed">
          <CardContent className="py-14 flex flex-col items-center gap-3 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Route className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Aucun parcours pour le moment</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                L&apos;IA analyse votre niveau et votre objectif, puis organise les cours de la plateforme
                semaine par semaine. Si un cours nécessaire manque, elle le signale à l&apos;administration.
              </p>
            </div>
            <Button onClick={generateParcours}>
              <Sparkles className="size-4" />
              Générer mon parcours
            </Button>
          </CardContent>
        </Card>
      )}

      {currentPath && (
        <PathTimeline
          data={currentPath}
          courses={courses}
          busyStep={busyStep}
          onEnroll={(stepId) => handleEnroll(currentPath, stepId)}
        />
      )}
    </div>
  )
}

export default function ParcoursPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Chargement...
        </div>
      }
    >
      <ParcoursContent />
    </Suspense>
  )
}

// ─── Timeline du parcours ─────────────────────────────────────────────────────
const STATUT_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  a_faire: { label: "À faire", color: "text-muted-foreground bg-muted border-border", icon: Circle },
  en_cours: { label: "En cours", color: "text-primary bg-primary/10 border-primary/30", icon: Clock },
  termine: { label: "Terminé", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
}

function PathTimeline({
  data,
  courses,
  busyStep,
  onEnroll,
}: {
  data: LearningPathWithSteps
  courses: Course[]
  busyStep: string | null
  onEnroll: (stepId: string) => void
}) {
  const { path, steps } = data
  const done = steps.filter((s) => s.statut === "termine").length
  const progression = steps.length > 0 ? Math.round((done / steps.length) * 100) : 0

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-5 pb-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">{path.titre}</h2>
              <p className="text-sm text-muted-foreground mt-1">{path.resume}</p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {steps.length} étape{steps.length > 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progression du parcours</span>
              <span className="font-medium text-foreground">{progression}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progression}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <PathStepCard
            key={step.id}
            step={step}
            courses={courses}
            busy={busyStep === step.id}
            onEnroll={() => onEnroll(step.id)}
          />
        ))}
      </div>
    </div>
  )
}

function PathStepCard({
  step,
  courses,
  busy,
  onEnroll,
}: {
  step: LearningPathStep
  courses: Course[]
  busy: boolean
  onEnroll: () => void
}) {
  const config = STATUT_CONFIG[step.statut] ?? STATUT_CONFIG.a_faire
  const StatusIcon = config.icon
  const course = step.courseId ? courses.find((c) => c.id === step.courseId) : undefined
  const missing = !step.courseId

  return (
    <Card className={missing ? "border-warning/40 bg-warning/5" : undefined}>
      <CardContent className="pt-4 pb-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className={`size-8 rounded-full border flex items-center justify-center text-xs font-bold ${config.color}`}>
              {step.ordre}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">{step.titre}</h3>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${config.color}`}>
                <StatusIcon className="size-2.5" />
                {config.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3" />
                Semaine {step.semaineDebut}
              </span>
              {step.dureeHeures > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {step.dureeHeures}h estimées
                </span>
              )}
              {step.objectif && (
                <span className="flex items-center gap-1">
                  <Target className="size-3" />
                  {step.objectif}
                </span>
              )}
            </div>

            {step.competences.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {step.competences.map((c, i) => (
                  <span key={i} className="text-[10px] rounded-full border bg-background px-2 py-0.5 text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
            )}

            {missing ? (
              <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 mt-1">
                <Hourglass className="size-3.5 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  Ce cours n&apos;existe pas encore sur la plateforme. L&apos;IA a{" "}
                  <span className="font-medium">suggéré sa création à l&apos;administrateur</span> — vous serez
                  notifié dès qu&apos;il sera disponible.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {course && (
                  <Link
                    href={`/etudiant/cours/${course.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    <BookOpen />
                    Ouvrir le cours
                  </Link>
                )}
                {step.statut !== "termine" && (
                  <Button size="sm" onClick={onEnroll} disabled={busy}>
                    {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                    {step.statut === "en_cours" ? "Continuer" : "Démarrer cette étape"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
