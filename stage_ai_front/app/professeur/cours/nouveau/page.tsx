"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Course } from "@/lib/mock-data"
import { CourseEditor } from "@/components/course-editor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function NewCoursePage() {
  const { user } = useAuth()
  const router = useRouter()

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

  const handleSave = (course: Course) => {
    // In a real app, this would call an API. For now, just redirect.
    router.push("/professeur/cours")
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
      <CourseEditor initial={emptyCourse} onSave={handleSave} />
    </div>
  )
}
