"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Course, Lesson, ContentBlock, QuizQuestion } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { CourseEditor } from "@/components/course-editor"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
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
  const block: ContentBlock = {
    id: generateId(),
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

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { fetchCourseById, updateCourseApi } = useCourseStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  const handleSave = async (updated: Course) => {
    setSaving(true)
    setError("")
    try {
      await updateCourseApi(id, updated)
      router.push("/professeur/cours")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du cours")
      setSaving(false)
    }
  }

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
        <Link href="/professeur/cours" className="text-sm text-primary hover:underline">
          Retour aux cours
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/professeur/cours"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux cours
      </Link>
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {saving ? (
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Sauvegarde du cours...
        </div>
      ) : course && (
        <CourseEditor
          initial={course}
          onSave={handleSave}
        />
      )}
    </div>
  )
}