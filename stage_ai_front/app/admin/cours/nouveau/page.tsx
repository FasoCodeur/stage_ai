"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Course } from "@/lib/mock-data"
import { useCourseStore } from "@/lib/stores/course-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseSuggestionStore } from "@/lib/stores/course-suggestion-store"
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
import { ArrowLeft, Loader2, AlertCircle, Lightbulb } from "lucide-react"
import Link from "next/link"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function AdminNouveauCoursContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createCourse } = useCourseStore()
  const { users, fetchUsers } = useUserStore()
  const { acceptSuggestion } = useCourseSuggestionStore()
  const [professorId, setProfessorId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Pré-remplissage lorsqu'on vient d'une suggestion générée par l'IA
  const suggestionId = searchParams.get("suggestion")
  const prefillTitle = searchParams.get("title") ?? ""
  const prefillCategory = searchParams.get("category") ?? "Développement Web"
  const prefillLevel = searchParams.get("level") ?? "Débutant"
  const prefillDescription = searchParams.get("description") ?? ""

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const professors = users.filter((u) => u.role === "professeur")

  const emptyCourse: Course = {
    id: generateId(),
    title: prefillTitle,
    description: prefillDescription,
    category: prefillCategory,
    level: (prefillLevel as Course["level"]) || "Débutant",
    duration: 10,
    price: 0,
    professorId: "",
    published: false,
    thumbnail: "📚",
    modules: [],
    students: [],
    createdAt: new Date().toISOString().split("T")[0],
  }

  const handleSave = async (course: Course) => {
    const owner = professorId || user?.id || ""
    if (!owner) {
      setError("Veuillez sélectionner un professeur responsable du cours.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const created = await createCourse({ ...course, professorId: owner })
      // Lie la suggestion IA au cours créé (marquée comme acceptée)
      if (suggestionId) {
        await acceptSuggestion(suggestionId, created?.id).catch(() => {})
      }
      router.push("/admin/cours")
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du cours")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={suggestionId ? "/admin/suggestions" : "/admin/cours"}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        {suggestionId ? "Retour aux suggestions IA" : "Retour aux cours"}
      </Link>

      {suggestionId && (
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <Lightbulb className="size-4 shrink-0 text-primary mt-0.5" />
          <p className="text-sm text-foreground">
            Fiche pré-remplie à partir d&apos;une <span className="font-medium">suggestion de l&apos;IA</span>.
            Complétez le contenu puis attribuez un professeur : la suggestion sera marquée comme acceptée.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Nouveau cours</CardTitle>
          <CardDescription>
            En tant qu'administrateur, vous pouvez créer un cours et l'assigner à un professeur.
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
          Création du cours en cours...
        </div>
      ) : (
        <CourseEditor initial={emptyCourse} onSave={handleSave} canEditPrice />
      )}
    </div>
  )
}

export default function AdminNouveauCoursPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Chargement...
        </div>
      }
    >
      <AdminNouveauCoursContent />
    </Suspense>
  )
}