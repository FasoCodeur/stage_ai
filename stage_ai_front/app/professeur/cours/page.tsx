"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useCourseStore } from "@/lib/stores/course-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Users, Clock, Loader2, Eye, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ProfCourseListPage() {
  const { user } = useAuth()
  const { courses, isLoading, fetchCoursesByProfessor, deleteCourseApi } = useCourseStore()
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCoursesByProfessor(user.id)
    }
  }, [user, fetchCoursesByProfessor])

  const handleDelete = async () => {
    if (!courseToDelete) return
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteCourseApi(courseToDelete.id)
      setCourseToDelete(null)
      setConfirmOpen(false)
    } catch (err: any) {
      setDeleteError(err.message || "Erreur lors de la suppression du cours")
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des cours...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes cours</h1>
          <p className="text-sm text-muted-foreground mt-1">{courses.length} cours créés</p>
        </div>
        <Link href="/professeur/cours/nouveau" className={buttonVariants({ variant: "default" })}>
          <PlusCircle />
          Nouveau cours
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="h-28 bg-primary/5 flex items-center justify-center border-b">
              <span className="text-5xl">{c.thumbnail}</span>
            </div>
            <CardContent className="pt-4 pb-4 flex flex-col gap-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
                  <Badge variant={c.published ? "default" : "secondary"} className="text-xs shrink-0">
                    {c.published ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="size-3" />
                  {c.students?.length || 0} étudiant{(c.students?.length || 0) > 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {c.duration}h
                </div>
                <Badge variant="outline" className="text-xs ml-auto">{c.level}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/professeur/cours/${c.id}/apercu`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                >
                  <Eye />
                  Afficher
                </Link>
                <Link
                  href={`/professeur/cours/${c.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1" })}
                >
                  <Edit />
                  Modifier
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    setCourseToDelete({ id: c.id, title: c.title })
                    setDeleteError("")
                    setConfirmOpen(true)
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New course card */}
        <Link href="/professeur/cours/nouveau">
          <div className="rounded-xl border-2 border-dashed border-border h-full min-h-60 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer p-6">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <PlusCircle className="size-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">Créer un nouveau cours</p>
            <p className="text-xs text-muted-foreground text-center">Modules, leçons, quiz et sandbox intégrés</p>
          </div>
        </Link>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce cours ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Le cours « {courseToDelete?.title ?? ""} » et tout son contenu seront définitivement supprimés.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" disabled={deleting} onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full sm:w-auto">
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 />}
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}