"use client"

import { use, useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { COURSES, ENROLLMENTS, Lesson, QuizQuestion, hasAccess } from "@/lib/mock-data"
import { OrangeMoneyModal } from "@/components/etudiant/orange-money-modal"
import { useAIChatContext } from "@/lib/ai-chat-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronRight, FileText, Video, CheckSquare, Code2, ArrowLeft, ChevronDown, Lock, Phone } from "lucide-react"
import Link from "next/link"

type LessonType = Lesson["type"]
const LESSON_ICONS: Record<LessonType, React.ElementType> = {
  texte: FileText,
  video: Video,
  quiz: CheckSquare,
  sandbox: Code2,
}
const LESSON_COLORS: Record<LessonType, string> = {
  texte: "text-primary",
  video: "text-chart-2",
  quiz: "text-chart-3",
  sandbox: "text-warning",
}

// ── Quiz player ──────────────────────────────────────────────────────────────
function QuizPlayer({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const score = submitted
    ? questions.filter((q) => answers[q.id] === q.correctIndex).length
    : 0

  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">
            {idx + 1}. {q.question}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, oIdx) => {
              const selected = answers[q.id] === oIdx
              const isCorrect = submitted && oIdx === q.correctIndex
              const isWrong = submitted && selected && oIdx !== q.correctIndex
              return (
                <button
                  key={oIdx}
                  onClick={() => !submitted && setAnswers((a) => ({ ...a, [q.id]: oIdx }))}
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
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {!submitted && (
        <Button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length < questions.length} className="self-start">
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
function SandboxPlayer({ code }: { code: string }) {
  const [userCode, setUserCode] = useState(code)
  const [preview, setPreview] = useState(code)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">Editeur de code</p>
        <Button size="sm" onClick={() => setPreview(userCode)}>Exécuter</Button>
      </div>
      <textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        className="w-full h-48 font-mono text-sm bg-muted/50 border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        spellCheck={false}
      />
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
    </div>
  )
}

// ── Main course viewer ────────────────────────────────────────────────────────
export default function CourseViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { setAIChatContext } = useAIChatContext()
  const course = COURSES.find((c) => c.id === id)
  const enrollment = ENROLLMENTS.find((e) => e.userId === user?.id && e.courseId === id)

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course?.modules.map((m) => m.id) ?? [])
  )
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    course?.modules[0]?.lessons[0]?.id ?? null
  )
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(enrollment?.completedLessons ?? [])
  )
  const [showPurchase, setShowPurchase] = useState(false)

  // Update AI chat context whenever the lesson changes
  useEffect(() => {
    if (course) {
      const allLessons = course.modules.flatMap((m) => m.lessons)
      const currentLesson = allLessons.find((l) => l.id === selectedLessonId)
      setAIChatContext(course.title, currentLesson?.title)
    }
    return () => setAIChatContext(undefined, undefined)
  }, [selectedLessonId, course, setAIChatContext])

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Cours introuvable</p>
        <Link href="/etudiant/cours" className="text-sm text-primary hover:underline">Retour</Link>
      </div>
    )
  }

  const userHasAccess = user ? hasAccess(user.id, course.id) : false

  if (!userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
          <Lock className="size-7 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{course.title}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            Vous n&apos;avez pas encore accès à cette formation. Achetez-la via Orange Money ou abonnez-vous.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowPurchase(true)}
            className="flex items-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/8 px-6 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-500/15 transition-colors"
          >
            <Phone className="size-4" />
            Acheter via Orange Money — {course.price.toLocaleString("fr-FR")} FCFA
          </button>
          <Link
            href="/etudiant/cours"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Retour au catalogue
          </Link>
        </div>
        {showPurchase && (
          <OrangeMoneyModal course={course} open={showPurchase} onClose={() => setShowPurchase(false)} />
        )}
      </div>
    )
  }

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0]
  const progress = allLessons.length > 0 ? Math.round((completed.size / allLessons.length) * 100) : 0

  const toggleCompleted = (lessonId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId)
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
                const Icon = LESSON_ICONS[lesson.type]
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
                      : <Icon className={cn("size-3.5 shrink-0", LESSON_COLORS[lesson.type])} />
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
                    {(() => {
                      const Icon = LESSON_ICONS[selectedLesson.type]
                      return <Icon className={cn("size-4", LESSON_COLORS[selectedLesson.type])} />
                    })()}
                    <Badge variant="outline" className="text-xs capitalize">{selectedLesson.type}</Badge>
                    <span className="text-xs text-muted-foreground">{selectedLesson.duration} min</span>
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

              {/* Content */}
              {selectedLesson.type === "texte" && (
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {selectedLesson.content}
                  </pre>
                </div>
              )}
              {selectedLesson.type === "video" && (
                <div className="flex flex-col gap-3">
                  {selectedLesson.videoUrl && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border">
                      <iframe src={selectedLesson.videoUrl} className="w-full h-full" allowFullScreen title={selectedLesson.title} />
                    </div>
                  )}
                  <p className="text-sm text-foreground">{selectedLesson.content}</p>
                </div>
              )}
              {selectedLesson.type === "quiz" && selectedLesson.quiz && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">{selectedLesson.content}</p>
                  <QuizPlayer questions={selectedLesson.quiz} />
                </div>
              )}
              {selectedLesson.type === "sandbox" && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-foreground">{selectedLesson.content}</p>
                  <SandboxPlayer code={selectedLesson.sandboxCode ?? ""} />
                </div>
              )}

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
