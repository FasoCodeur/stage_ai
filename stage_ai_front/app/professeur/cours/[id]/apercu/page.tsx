"use client"

import { use, useState, useEffect } from "react"
import { Course, Lesson, ContentBlock, QuizQuestion } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Users,
  Clock,
  Loader2,
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

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

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

function normalizeCourse(course: Course): Course {
  return {
    ...course,
    modules: (course.modules || []).map((m: any) => ({
      ...m,
      lessons: (m.lessons || []).map(normalizeLesson),
    })),
  }
}

// Affichage lecture seule d'un quiz (avec les bonnes réponses)
function QuizPreview({ questions }: { questions: QuizQuestion[] }) {
  return (
    <div className="flex flex-col gap-5">
      {questions.map((q, idx) => (
        <div key={q.id} className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            {idx + 1}. {q.question}
            {q.correctIndexes.length > 1 && (
              <span className="ml-2 text-xs text-muted-foreground font-normal">(Plusieurs réponses possibles)</span>
            )}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, oIdx) => {
              const isCorrect = q.correctIndexes.includes(oIdx)
              return (
                <div
                  key={oIdx}
                  className={cn(
                    "flex items-center gap-2 text-left px-4 py-2.5 rounded-lg border text-sm",
                    isCorrect
                      ? "border-chart-3 bg-chart-3/10 text-foreground"
                      : "border-border opacity-70"
                  )}
                >
                  <CheckCircle2 className={cn("size-4 shrink-0", isCorrect ? "text-chart-3" : "text-transparent")} />
                  {opt}
                  {isCorrect && <Badge variant="outline" className="text-xs ml-auto shrink-0">Bonne réponse</Badge>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Affichage lecture seule d'un sandbox
function SandboxPreview({ code, language = "html" }: { code: string; language?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground font-mono">
          Code — {language.toUpperCase()} (lecture seule)
        </p>
      </div>
      <pre className="w-full h-48 overflow-auto font-mono text-sm bg-muted/50 border rounded-lg p-3 text-foreground whitespace-pre-wrap">
        {code}
      </pre>
      {language === "html" && (
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
            srcDoc={code}
            className="w-full h-48"
            title="Sandbox preview"
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  )
}

function ContentBlockPreview({ block }: { block: ContentBlock }) {
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
          <div className="rounded-lg bg-muted/40 border px-4 py-3">
            <p className="text-xs text-muted-foreground mb-3">Aperçu du quiz — corrigé affiché</p>
            <QuizPreview questions={block.quiz} />
          </div>
        </div>
      )}

      {block.type === "sandbox" && (
        <div className="flex flex-col gap-3">
          {block.content && <p className="text-sm text-foreground">{block.content}</p>}
          <SandboxPreview code={block.sandboxCode ?? ""} language={block.language} />
        </div>
      )}
    </div>
  )
}

export default function CoursePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { fetchCourseById } = useCourseStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchCourseById(id)
        setCourse(normalizeCourse(data))
      } catch (err: any) {
        setError(err.message || "Cours introuvable")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchCourseById])

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  useEffect(() => {
    if (course) {
      setExpandedModules(new Set(course.modules.map((m) => m.id)))
      setSelectedLessonId(course.modules[0]?.lessons[0]?.id ?? null)
    }
  }, [course])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du cours...
      </div>
    )
  }

  if (error && !course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-destructive text-sm">{error}</p>
        <Link href="/professeur/cours" className="text-sm text-primary hover:underline">Retour aux cours</Link>
      </div>
    )
  }

  if (!course) return null

  const allLessons = course.modules.flatMap((m) => m.lessons)
  const selectedLesson = allLessons.find((l) => l.id === selectedLessonId) ?? allLessons[0]

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/professeur/cours" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3.5" />
            Retour
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-sm font-semibold text-foreground truncate max-w-xs">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {course.students?.length || 0}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" />
            {course.duration}h
          </div>
          <Badge variant="outline" className="text-xs">Aperçu</Badge>
          <Link href={`/professeur/cours/${course.id}`}>
            <Button size="sm" variant="outline">Modifier</Button>
          </Link>
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
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-4 py-2 border-t text-left hover:bg-accent transition-colors",
                      isSelected && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <Icon className={cn("size-3.5 shrink-0", BLOCK_COLORS[firstBlockType])} />
                    <span className="text-xs flex-1 truncate">{lesson.title}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto border rounded-xl bg-card p-6 min-w-0">
          {selectedLesson ? (
            <div className="flex flex-col gap-5 max-w-2xl">
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
              </div>

              <div className="flex flex-col gap-6">
                {selectedLesson.blocks.map((block, idx) => (
                  <div key={block.id} className="flex flex-col gap-3">
                    {idx > 0 && <div className="border-t" />}
                    <ContentBlockPreview block={block} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Sélectionnez une leçon dans le menu
            </div>
          )}
        </div>
      </div>
    </div>
  )
}