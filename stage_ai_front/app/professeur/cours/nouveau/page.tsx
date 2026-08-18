"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Course } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { CourseEditor } from "@/components/course-editor"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function NewCoursePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { createCourse } = useCourseStore()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const emptyCourse: Course = {
    id: generateId(),
    title: "",
    description: "",
    category: "Développement Web",
    level: "Débutant",
    duration: 10,
    price: 35000,
    professorId: user?.id ?? "",
    published: false,
    thumbnail: "📚",
    modules: [],
    students: [],
    createdAt: new Date().toISOString().split("T")[0],
  }

  const handleSave = async (course: Course) => {
    setSaving(true)
    setError("")
    try {
      await createCourse(course)
      router.push("/professeur/cours")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du cours")
      setSaving(false)
    }
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
          Création du cours en cours...
        </div>
      ) : (
        <CourseEditor initial={emptyCourse} onSave={handleSave} />
      )}
    </div>
  )
}