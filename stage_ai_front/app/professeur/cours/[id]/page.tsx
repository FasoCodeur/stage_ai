"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { COURSES } from "@/lib/mock-data"
import { CourseEditor } from "@/components/course-editor"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const course = COURSES.find((c) => c.id === id)

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Cours introuvable</p>
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
      <CourseEditor
        initial={course}
        onSave={(updated) => {
          // In a real app, persist via API
          router.push("/professeur/cours")
        }}
      />
    </div>
  )
}
