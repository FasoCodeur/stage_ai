"use client"

import { use, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Lesson, QuizQuestion, ContentBlock, Course } from "@/lib/mock-data"
import { API_URL, NETWORK_ERROR_MESSAGE, extractErrorMessage, getFriendlyErrorMessage } from "@/lib/api"
import { useCourseStore } from "@/lib/stores/course-store"
import { useEnrollmentStore } from "@/lib/stores/enrollment-store"
import { usePurchaseStore } from "@/lib/stores/purchase-store"
import { OrangeMoneyModal } from "@/components/etudiant/orange-money-modal"
import { useAIChatContext } from "@/lib/ai-chat-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Video,
  CheckSquare,
  Code2,
  ArrowLeft,
  ChevronDown,
  Lock,
  Phone,
  Users, Clock, Loader2
} from "lucide-react"
import Link from "next/link"

type BlockType = ContentBlock["type"]
const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  texte: FileText,
  video: Video,
  quiz: CheckSquare,
  sandbox: Code2,
}
const BLOCK_COLORS: Record<BlockType, string> = {
  texte: "text-primary",
  video: "text-chart-2",
  quiz: "text-chart-3",
  sandbox: "text-warning",
}

// Convertit une question de quiz de l'ancien format (correctIndex) vers le nouveau (correctIndexes)
function normalizeQuizQuestion(q: any): QuizQuestion {
  if (q.correctIndexes && Array.isArray(q.correctIndexes)) {
    return q as QuizQuestion
  }
  return {
    id: q.id,
    question: q.question,
    options: q.options || [],
    correctIndexes: q.correctIndex !== undefined ? [q.correctIndex] : [0],
  }
}

// Convertit une leçon de l'ancien format (type unique) vers le nouveau format (blocks)
function normalizeLesson(lesson: any): Lesson {
  if (lesson.blocks && Array.isArray(lesson.blocks)) {
    return {
      ...lesson,
      blocks: lesson.blocks.map((b: any) => ({
        ...b,
        quiz: b.quiz ? b.quiz.map(normalizeQuizQuestion) : b.quiz,
      })),
    } as Lesson
  }
  // Ancien format : type unique
  const block: ContentBlock = {
    id: `b-${lesson.id}`,
    type: lesson.type || "texte",
    content: lesson.content || "",
    videoUrl: lesson.videoUrl,
    quiz: lesson.quiz ? lesson.quiz.map(normalizeQuizQuestion) : lesson.quiz,
    sandboxCode: lesson.sandboxCode,
    language: lesson.language,
  }
  return {
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration || 15,
    blocks: [block],
  }
}

// Normalise un cours complet
function normalizeCourse(course: Course): Course {
  return {
    ...course,
    modules: (course.modules || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).map(normalizeLesson),
    })),
  }
}

// ── Quiz player ──────────────────────────────────────────────────────────────
function QuizPlayer({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = submitted
    ? questions.filter((q) => {
        const userAnswers = answers[q.id] || []
        const correct = q.correctIndexes
        return userAnswers.length === correct.length && correct.every((idx) => userAnswers.includes(idx))
      }).length
    : 0

  const toggleAnswer = (qId: string, oIdx: number) => {
    setAnswers((prev) => {
      const current = prev[qId] || []
      const next = current.includes(oIdx)
        ? current.filter((idx) => idx !== oIdx)
        : [...current, oIdx]
      return { ...prev, [qId]: next }
    })
  }

  const allAnswered = questions.every((q) => (answers[q.id] || []).length > 0)

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            {idx + 1}. {q.question}
            {q.correctIndexes.length > 1 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                (Plusieurs réponses possibles)
              </span>
            )}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, oIdx) => {
              const selected = (answers[q.id] || []).includes(oIdx)
              const isCorrect = submitted && q.correctIndexes.includes(oIdx)
              const isWrong = submitted && selected && !q.correctIndexes.includes(oIdx)
              return (
                <button
                  key={oIdx}
                  onClick={() => !submitted && toggleAnswer(q.id, oIdx)}
                  className={cn(
                    "text-left px-4 py-2.5 rounded-lg border text-sm transition-colors",
                    !submitted && selected && "border-primary bg-primary/5 text-primary",
                    !submitted && !selected && "border-border hover:bg-muted",
                    isCorrect && "border-chart-3 bg-chart-3/10 text-foreground",
                    isWrong && "border-destructive bg-destructive/5 text-destructive",
                    submitted && !selected && !isCorrect && "opacity-50"
                  )}
                  disabled={submitted}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "size-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                      selected ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {selected && <CheckCircle2 className="size-3 text-white" />}
                    </div>
                    {opt}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <Button onClick={() => setSubmitted(true)} disabled={!allAnswered} className="self-start">
          Soumettre mes réponses
        </Button>
      )}
      {submitted && (
        <div className={cn(
          "flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium",
          score === questions.length ? "bg-chart-3/10 text-foreground" : "bg-warning/10 text-foreground"
        )}>
          <CheckCircle2 className={cn("size-4", score === questions.length ? "text-chart-3" : "text-warning")} />
          {score}/{questions.length} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}

// ── Sandbox player ────────────────────────────────────────────────────────────
function SandboxPlayer({ code, language = "html" }: { code: string; language?: string }) {
  const [userCode, setUserCode] = useState(code)
  const [preview, setPreview] = useState(code)
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [running, setRunning] = useState(false)

  const isHtml = language === "html"

  const runCode = async () => {
    if (isHtml) {
      setPreview(userCode)
      return
    }

    setRunning(true)
    setOutput("")
    setError("")

    try {
      let res: Response
      try {
        res = await fetch(`${API_URL}/sandbox/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code: userCode }),
        })
      } catch {
        throw new Error(NETWORK_ERROR_MESSAGE)
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(extractErrorMessage(payload, res.status))
      }

      const result = await res.json()
      setOutput(result.output || "")
      if (result.stderr) setError(result.stderr)
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, "L'exécution du code a échoué. Veuillez réessayer."))
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">
          Editeur de code — {language.toUpperCase()}
        </p>
        <Button size="sm" onClick={runCode} disabled={running}>
          {running ? "Exécution..." : "Exécuter"}
        </Button>
      </div>
      <textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        className="w-full h-48 font-mono text-sm bg-muted/50 border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        spellCheck={false}
      />

      {isHtml ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-1.5 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-destructive/50" />
              <div className="size-2.5 rounded-full bg-warning/50" />
              <div className="size-2.5 rounded-full bg-chart-3/50" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">Aperçu</p>
          </div>
          <iframe
            key={preview}
            srcDoc={preview}
            className="w-full h-48"
            title="Sandbox preview"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-1.5 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-destructive/50" />
              <div className="size-2.5 rounded-full bg-warning/50" />
              <div className="size-2.5 rounded-full bg-chart-3/50" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">Sortie</p>
          </div>
          <pre className="p-3 text-sm font-mono text-foreground whitespace-pre-wrap min-h-24 max-h-48 overflow-y-auto">
            {output || (error ? "" : "Cliquez sur Exécuter pour voir la sortie...")}
          </pre>
          {error && (
            <pre className="p-3 text-sm font-mono text-destructive whitespace-pre-wrap border-t border-border">
              {error}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

// ── Content Block Renderer ────────────────────────────────────────────────────
function ContentBlockView({ block }: { block: ContentBlock }) {
  const Icon = BLOCK_ICONS[block.type]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", BLOCK_COLORS[block.type])} />
        <Badge variant="outline" className="text-xs capitalize">{block.type}</Badge>
      </div>

      {block.type === "texte" && (
        <div
          className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: block.content || "" }}
        />
      )}

      {block.type === "video" && (
        <div className="flex flex-col gap-3">
          {block.videoUrl && (
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
              <iframe src={block.videoUrl} className="w-full h-full" allowFullScreen title="Vidéo" />
            </div>
          )}
          {block.content && <p className="text-sm text-foreground">{block.content}</p>}
        </div>
      )}

      {block.type === "quiz" && block.quiz && (
        <div className="flex flex-col gap-3">
          {block.content && <p className="text-sm text-muted-foreground">{block.content}</p>}
          <QuizPlayer questions={block.quiz} />
        </div>
      )}

      {block.type === "sandbox" && (
        <div className="flex flex-col gap-3">
          {block.content && <p className="text-sm text-foreground">{block.content}</p>}
          <SandboxPlayer code={block.sandboxCode ?? ""} language={block.language} />
        </div>
      )}
    </div>
  )
}

// ── Main course viewer ────────────────────────────────────────────────────────
export default function CourseViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { setAIChatContext } = useAIChatContext()
  const { fetchCourseById } = useCourseStore()
  const { enrollments, fetchEnrollmentsByUser, updateProgressApi } = useEnrollmentStore()
  const { purchases, fetchPurchasesByUser, hasPurchased } = usePurchaseStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseById(id)
        setCourse(normalizeCourse(data))
        if (user) {
          await Promise.all([fetchEnrollmentsByUser(user.id), fetchPurchasesByUser(user.id)])
        }
      } catch (err: any) {
        setLoadError(err.message || "Cours introuvable")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user, fetchCourseById, fetchEnrollmentsByUser, fetchPurchasesByUser])

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [showPurchase, setShowPurchase] = useState(false)

  const myEnrollment = user
    ? enrollments.find((e) => e.userId === user.id && e.courseId === id)
    : undefined

  // Update expanded modules when course loads
  useEffect(() => {
    if (course) {
      setExpandedModules(new Set(course.modules.map((m) => m.id)))
      setSelectedLessonId(course.modules[0]?.lessons[0]?.id ?? null)
      if (myEnrollment) {
        setCompleted(new Set(myEnrollment.completedLessons))
      }
    }
  }, [course]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update AI chat context whenever the lesson changes
  useEffect(() => {
    if (course) {
      const allLessons = course.modules.flatMap((m) => m.lessons)
      const currentLesson = allLessons.find((l) => l.id === selectedLessonId)
      setAIChatContext(course.title, currentLesson?.title)
    }
    return () => setAIChatContext(undefined, undefined)
  }, [selectedLessonId, course, setAIChatContext])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du cours...
      </div>
    )
  }

  if (!course || loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">{loadError || "Cours introuvable"}</p>
        <Link href="/etudiant/cours" className="text-sm text-primary hover:underline">Retour</Link>
      </div>
    )
  }

  const userHasAccess = user ? (Boolean(myEnrollment) || hasPurchased(user.id, course.id)) : false

  if (!userHasAccess) {
    // Nombre de leçons d'aperçu gratuites
    const previewLessonCount = 2
    const allLessonsPreview = course.modules.flatMap((m) => m.lessons)
    const previewLessons = allLessonsPreview.slice(0, previewLessonCount)
    const lockedLessons = allLessonsPreview.slice(previewLessonCount)

    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/etudiant/cours" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" />
            Retour au catalogue
          </Link>
        </div>

        {/* Course info */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="h-40 bg-primary/5 flex items-center justify-center border-b">
            <span className="text-7xl">{course.thumbnail}</span>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{course.category}</Badge>
              <Badge variant="outline" className="text-xs">{course.level}</Badge>
              <Badge variant="outline" className="text-xs">{course.duration}h</Badge>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{course.description}</p>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                {course.students?.length || 0} étudiants
                <span className="mx-2">·</span>
                <Clock className="size-4" />
                {course.duration}h de formation
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{course.price.toLocaleString("fr-FR")} FCFA</p>
                <p className="text-xs text-muted-foreground">Achat unique — accès à vie</p>
              </div>
            </div>
            <button
              onClick={() => setShowPurchase(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Phone className="size-4" />
              Acheter ce cours — {course.price.toLocaleString("fr-FR")} FCFA
            </button>
          </div>
        </div>

        {/* Preview lessons */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Aperçu gratuit</h2>
          <p className="text-sm text-muted-foreground">
            Découvrez les {previewLessonCount} premières leçons gratuitement avant d'acheter.
          </p>
          <div className="flex flex-col gap-2">
            {previewLessons.map((lesson, idx) => (
              <div key={lesson.id} className="rounded-lg border bg-card p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/30">
                    Gratuit
                  </Badge>
                  <span className="text-xs text-muted-foreground">Leçon {idx + 1}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{lesson.duration} min</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{lesson.title}</h3>
                {lesson.blocks[0]?.type === "texte" && (
                  <div
                    className="text-xs text-muted-foreground line-clamp-3 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: lesson.blocks[0].content || "" }}
                  />
                )}
                {lesson.blocks[0]?.type === "video" && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
                    <iframe src={lesson.blocks[0].videoUrl} className="w-full h-full" allowFullScreen title={lesson.title} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Locked lessons */}
        {lockedLessons.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-foreground">Contenu complet</h2>
            <div className="flex flex-col gap-2">
              {lockedLessons.map((lesson, idx) => (
                <div key={lesson.id} className="rounded-lg border bg-card/50 p-4 flex items-center gap-3 opacity-70">
                  <Lock className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground">{lesson.title}</h3>
                    <p className="text-xs text-muted-foreground">Leçon {previewLessonCount + idx + 1} · {lesson.duration} min</p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">Verrouillé</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Purchase CTA */}
        <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-base font-bold text-foreground">Accédez à tout le contenu</p>
            <p className="text-sm text-muted-foreground mt-1">
              {course.modules.length} modules · {allLessonsPreview.length} leçons · accès à vie
            </p>
          </div>
          <button
            onClick={() => setShowPurchase(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shrink-0"
          >
            <Phone className="size-4" />
            Acheter — {course.price.toLocaleString("fr-FR")} FCFA
          </button>
        </div>

        {showPurchase && (
          <OrangeMoneyModal course={course} open={showPurchase} onClose={() => setShowPurchase(false)} />
        )}
      </div>
    )
  }

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0]
  const progress = myEnrollment?.progress ?? (allLessons.length > 0 ? Math.round((completed.size / allLessons.length) * 100) : 0)

  const toggleCompleted = async (lessonId: string) => {
    if (!user) return
    setCompleted((prev) => {
      const next = new Set(prev)
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId)

      // Sauvegarde la progression côté backend
      const newProgress = allLessons.length > 0 ? Math.round((next.size / allLessons.length) * 100) : 0
      updateProgressApi(user.id, course.id, newProgress, Array.from(next))
      return next
    })
  }

  const goNext = () => {
    const idx = allLessons.findIndex((l) => l.id === selectedLesson?.id)
    if (idx < allLessons.length - 1) setSelectedLessonId(allLessons[idx + 1].id)
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/etudiant/cours" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" />
            Retour
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-sm font-semibold text-foreground truncate max-w-xs">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-28 h-2" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Sidebar — modules & lessons */}
        <div className="w-64 shrink-0 overflow-y-auto flex flex-col gap-2">
          {course.modules.map((module) => (
            <div key={module.id} className="rounded-lg border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedModules((prev) => {
                  const next = new Set(prev)
                  next.has(module.id) ? next.delete(module.id) : next.add(module.id)
                  return next
                })}
                className="flex items-center gap-2 w-full px-3 py-2.5 bg-muted/50 hover:bg-muted transition-colors text-left"
              >
                {expandedModules.has(module.id) ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
                <span className="text-xs font-semibold text-foreground truncate">{module.title}</span>
              </button>
              {expandedModules.has(module.id) && module.lessons.map((lesson) => {
                const firstBlockType = lesson.blocks[0]?.type ?? "texte"
                const Icon = BLOCK_ICONS[firstBlockType]
                const isSelected = selectedLessonId === lesson.id
                const isDone = completed.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-4 py-2 border-t text-left hover:bg-accent transition-colors",
                      isSelected && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    {isDone
                      ? <CheckCircle2 className="size-3.5 text-chart-3 shrink-0" />
                      : <Icon className={cn("size-3.5 shrink-0", BLOCK_COLORS[firstBlockType])} />
                    }
                    <span className={cn("text-xs flex-1 truncate", isDone && "line-through text-muted-foreground")}>
                      {lesson.title}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto border rounded-xl bg-card p-6 min-w-0">
          {selectedLesson && (
            <div className="flex flex-col gap-5 max-w-2xl">
              {/* Lesson header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{selectedLesson.duration} min</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedLesson.blocks.length} contenu{selectedLesson.blocks.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedLesson.title}</h2>
                </div>
                <Button
                  size="sm"
                  variant={completed.has(selectedLesson.id) ? "outline" : "default"}
                  onClick={() => toggleCompleted(selectedLesson.id)}
                  className="shrink-0"
                >
                  <CheckCircle2 />
                  {completed.has(selectedLesson.id) ? "Terminé" : "Marquer terminé"}
                </Button>
              </div>

              {/* Content blocks */}
              <div className="flex flex-col gap-6">
                {selectedLesson.blocks.map((block, idx) => (
                  <div key={block.id} className="flex flex-col gap-3">
                    {idx > 0 && <div className="border-t" />}
                    <ContentBlockView block={block} />
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={goNext} variant="outline">
                  Leçon suivante
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}