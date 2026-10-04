"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { apiFetch, getFriendlyErrorMessage } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Sparkles,
  Target,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

const OBJECTIFS = [
  { id: "Développeur Web", emoji: "🌐", desc: "HTML, CSS, JavaScript, React, Node.js" },
  { id: "Data Analyst", emoji: "📊", desc: "Python, Pandas, SQL, visualisation de données" },
  { id: "Designer UI/UX", emoji: "🎨", desc: "Figma, recherche utilisateur, prototypage" },
  { id: "Expert Marketing Digital", emoji: "📈", desc: "SEO, réseaux sociaux, publicité en ligne" },
  { id: "Analyste Cybersécurité", emoji: "🔐", desc: "Réseaux, sécurité offensive et défensive" },
  { id: "Développeur Mobile", emoji: "📱", desc: "Applications Android / iOS, Flutter, React Native" },
]

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  competence?: string
}

interface AssessmentResult {
  score: number
  niveau: string
  pointsForts: string[]
  lacunes: string[]
  resume: string
  justes?: string[]
  ratees?: string[]
}

type Step = "objectif" | "quiz" | "resultat"

export default function OnboardingPage() {
  const { user, isLoading, updateUser } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>("objectif")
  const [objectifMetier, setObjectifMetier] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Étape 1 : lancer le test ──
  const startAssessment = async (objectif: string) => {
    setObjectifMetier(objectif)
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", objectifMetier: objectif }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Erreur de génération du test")
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(-1))
      setCurrent(0)
      setStep("quiz")
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible de générer le test. Veuillez réessayer."))
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 2 : répondre ──
  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => prev.map((a, i) => (i === current ? optionIndex : a)))
  }

  const nextQuestion = () => {
    if (current < questions.length - 1) setCurrent((c) => c + 1)
  }

  const prevQuestion = () => {
    if (current > 0) setCurrent((c) => c - 1)
  }

  const submitAssessment = async () => {
    setLoading(true)
    setError("")
    try {
      const payload = questions.map((q, i) => ({
        question: q.question,
        selectedIndex: answers[i],
        correctIndex: q.correctIndex,
        competence: q.competence,
      }))

      const res = await fetch("/api/ai/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "evaluate", objectifMetier, answers: payload }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Erreur d'évaluation")
      setResult(data)

      // Sauvegarde du profil IA de l'étudiant
      if (user) {
        const doneAt = new Date().toISOString()
        await apiFetch(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify({
            objectifMetier,
            niveauEvalue: data.niveau,
            assessmentDoneAt: doneAt,
          }),
        }).catch(() => {})

        // Met à jour le profil local pour que le tableau de bord en tienne compte
        updateUser({ objectifMetier, niveauEvalue: data.niveau, assessmentDoneAt: doneAt })
      }

      setStep("resultat")
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible d'évaluer vos réponses. Veuillez réessayer."))
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Évaluation de départ par l&apos;IA
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Répondez à un test court : l&apos;IA détermine votre niveau et construira votre parcours personnalisé.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === "objectif" && (
        <ObjectifStep loading={loading} onSelect={startAssessment} />
      )}

      {step === "quiz" && (
        <QuizStep
          questions={questions}
          current={current}
          answers={answers}
          loading={loading}
          onSelect={selectAnswer}
          onNext={nextQuestion}
          onPrev={prevQuestion}
          onSubmit={submitAssessment}
        />
      )}

      {step === "resultat" && result && (
        <ResultStep
          result={result}
          objectifMetier={objectifMetier}
          onGenerate={() => router.push("/etudiant/parcours?generate=1")}
        />
      )}
    </div>
  )
}

// ─── Étape 1 : choix de l'objectif métier ──────────────────────────────────────
function ObjectifStep({ loading, onSelect }: { loading: boolean; onSelect: (o: string) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-5 pb-4 flex items-start gap-3">
          <Target className="size-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Quel métier visez-vous ?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              L&apos;IA adaptera les questions et votre parcours à cet objectif.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OBJECTIFS.map((o) => (
          <button
            key={o.id}
            disabled={loading}
            onClick={() => onSelect(o.id)}
            className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50"
          >
            <span className="text-2xl">{o.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{o.id}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          L&apos;IA prépare votre test de positionnement...
        </div>
      )}
    </div>
  )
}

// ─── Étape 2 : le test ────────────────────────────────────────────────────────
function QuizStep({
  questions,
  current,
  answers,
  loading,
  onSelect,
  onNext,
  onPrev,
  onSubmit,
}: {
  questions: Question[]
  current: number
  answers: number[]
  loading: boolean
  onSelect: (i: number) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
}) {
  const question = questions[current]
  const isLast = current === questions.length - 1
  const answeredCount = answers.filter((a) => a >= 0).length
  const progress = Math.round(((current + 1) / questions.length) * 100)

  if (!question) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {current + 1} / {questions.length}</span>
          <span>{answeredCount} réponse{answeredCount > 1 ? "s" : ""}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-5 pb-5 flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">{question.question}</p>
          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => {
              const selected = answers[current] === i
              return (
                <button
                  key={i}
                  onClick={() => onSelect(i)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    selected ? "border-primary bg-primary/5 text-foreground" : "hover:bg-muted/60"
                  }`}
                >
                  <span className={`size-5 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? "border-primary" : "border-muted-foreground/30"}`}>
                    {selected && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onPrev} disabled={current === 0 || loading}>
          <ArrowLeft className="size-4" />
          Précédent
        </Button>
        {isLast ? (
          <Button onClick={onSubmit} disabled={loading || answeredCount === 0}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Analyse en cours..." : "Terminer et voir mon niveau"}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={loading || answers[current] < 0}>
            Suivant
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Étape 3 : résultat de l'évaluation ───────────────────────────────────────
function ResultStep({
  result,
  objectifMetier,
  onGenerate,
}: {
  result: AssessmentResult
  objectifMetier: string
  onGenerate: () => void
}) {
  const niveauColor =
    result.niveau === "Avancé"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : result.niveau === "Intermédiaire"
        ? "text-blue-600 bg-blue-50 border-blue-200"
        : "text-amber-600 bg-amber-50 border-amber-200"

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6 pb-5 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center size-20 rounded-2xl bg-muted shrink-0">
              <span className="text-3xl font-bold text-foreground leading-none">{result.score}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${niveauColor}`}>
                Niveau {result.niveau}
              </span>
              <p className="text-sm text-muted-foreground">
                Objectif : <span className="font-medium text-foreground">{objectifMetier}</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-muted/50 px-3 py-3">
            <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">{result.resume}</p>
          </div>

          {result.pointsForts.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Vos points forts
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.pointsForts.map((p, i) => (
                  <span key={i} className="text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-1">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.lacunes.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-amber-600" />
                À renforcer en priorité
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.lacunes.map((l, i) => (
                  <span key={i} className="text-xs rounded-full border border-amber-200 bg-amber-50 text-amber-700 px-2.5 py-1">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-5 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Générez votre parcours personnalisé</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              L&apos;IA va organiser les cours adaptés à votre niveau, semaine par semaine.
            </p>
          </div>
          <Button onClick={onGenerate} className="shrink-0">
            <Sparkles className="size-4" />
            Générer mon parcours
          </Button>
        </CardContent>
      </Card>

      <Link href="/etudiant" className={buttonVariants({ variant: "ghost", size: "sm", className: "w-fit" })}>
        <ArrowLeft className="size-3.5" />
        Retour au tableau de bord
      </Link>
    </div>
  )
}

