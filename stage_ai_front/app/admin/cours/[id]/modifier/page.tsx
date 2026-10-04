"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Course, Lesson, ContentBlock, QuizQuestion } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { useUserStore } from "@/lib/stores/user-store"
import { CourseEditor } from "@/components/course-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
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

export default function AdminModifierCoursPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { fetchCourseById, updateCourseApi } = useCourseStore()
  const { users, fetchUsers } = useUserStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [professorId, setProfessorId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [data] = await Promise.all([fetchCourseById(id), fetchUsers()])
        setCourse(normalizeCourse(data))
        setProfessorId(data.professorId || "")
      } catch (err: any) {
        setError(err.message || "Cours introuvable")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchCourseById, fetchUsers])

  const professors = users.filter((u) => u.role === "professeur")

  const handleSave = async (updated: Course) => {
    const owner = professorId || updated.professorId
    if (!owner) {
      setError("Veuillez sélectionner un professeur responsable du cours.")
      return
    }
    setSaving(true)
    setError("")
    try {
      await updateCourseApi(id, { ...updated, professorId: owner })
      router.push("/admin/cours")
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
        <Link href="/admin/cours" className="text-sm text-primary hover:underline">
          Retour aux cours
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin/cours"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux cours
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le cours</CardTitle>
          <CardDescription>
            Vous pouvez modifier le contenu et réassigner le professeur responsable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>Professeur responsable</Label>
            <Select value={professorId} onValueChange={(v) => setProfessorId(v ?? "")}>
              <SelectTrigger className="h-9 w-full sm:w-72">
                <SelectValue placeholder="Sélectionner un professeur" />
              </SelectTrigger>
              <SelectContent>
                {professors.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {saving ? (
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Sauvegarde du cours...
        </div>
      ) : course && (
        <CourseEditor initial={course} onSave={handleSave} canEditPrice />
      )}
    </div>
  )
}