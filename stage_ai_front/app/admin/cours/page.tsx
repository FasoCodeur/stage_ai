"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCourseStore } from "@/lib/stores/course-store"
import { useUserStore } from "@/lib/stores/user-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Users,
  Loader2,
  Search,
  PlusCircle,
  MoreHorizontal,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  AlertCircle,
  Tag,
  AlertTriangle,
} from "lucide-react"

type StatusFilter = "all" | "published" | "draft" | "pendingPrice"

/** Un cours est « en attente de prix » tant que l'admin ne lui en a pas attribué. */
function needsPrice(course: { price?: number }): boolean {
  return !course.price || course.price <= 0
}

export default function AdminCoursPage() {
  const router = useRouter()
  const { courses, fetchCourses, updateCourseApi, deleteCourseApi } = useCourseStore()
  const { users, fetchUsers } = useUserStore()
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [priceTarget, setPriceTarget] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState("")
  const [savingPrice, setSavingPrice] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchCourses(), fetchUsers()])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchCourses, fetchUsers])

  // Cours en attente de prix (créés par un professeur, prix non défini)
  const pendingPriceCourses = courses.filter(needsPrice)

  const filtered = courses.filter((c) => {
    const term = search.trim().toLowerCase()
    const matchesSearch =
      !term ||
      c.title.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term)
    if (!matchesSearch) return false

    if (statusFilter === "pendingPrice") return needsPrice(c)
    if (statusFilter === "published") return c.published
    if (statusFilter === "draft") return !c.published
    return true
  })

  const courseToDelete = courses.find((c) => c.id === toDelete)
  const courseToPrice = courses.find((c) => c.id === priceTarget)

  const openPriceDialog = (courseId: string, currentPrice: number) => {
    setError("")
    setPriceTarget(courseId)
    setPriceValue(currentPrice > 0 ? String(currentPrice) : "")
  }

  const handleSavePrice = async () => {
    if (!priceTarget) return
    const price = Number(priceValue)
    if (!priceValue || Number.isNaN(price) || price <= 0) {
      setError("Veuillez saisir un prix valide (supérieur à 0).")
      return
    }

    setSavingPrice(true)
    setError("")
    try {
      await updateCourseApi(priceTarget, { price })
      setPriceTarget(null)
      setPriceValue("")
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement du prix.")
    } finally {
      setSavingPrice(false)
    }
  }

  const runAction = async (id: string, fn: () => void | Promise<unknown>) => {
    setBusyId(id)
    setError("")
    try {
      await fn()
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setBusyId(null)
    }
  }

  const handleTogglePublish = (id: string, published: boolean) =>
    runAction(id, () => updateCourseApi(id, { published: !published }))

  const handleDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    setError("")
    try {
      await deleteCourseApi(toDelete)
      setToDelete(null)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des cours...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cours</h1>
          <p className="text-sm text-muted-foreground mt-1">{courses.length} cours sur la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? "all") as StatusFilter)}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              <SelectItem value="pendingPrice">
                En attente de prix{pendingPriceCourses.length > 0 ? ` (${pendingPriceCourses.length})` : ""}
              </SelectItem>
              <SelectItem value="published">Publiés</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/admin/cours/nouveau" className={buttonVariants({ size: "sm" })}>
            <PlusCircle />
            Nouveau cours
          </Link>
        </div>
      </div>

      {/* Alerte : cours en attente de prix */}
      {pendingPriceCourses.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-warning mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {pendingPriceCourses.length === 1
                  ? "1 cours attend que vous définissiez son prix"
                  : `${pendingPriceCourses.length} cours attendent que vous définissiez leur prix`}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ces cours ont été proposés par des professeurs. Tant qu'aucun prix n'est fixé, ils
                ne sont pas visibles/achetables par les étudiants.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("pendingPrice")}
            className={buttonVariants({ size: "sm", variant: "outline", className: "shrink-0" })}
          >
            <Tag />
            Les afficher
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const prof = users.find((u) => u.id === c.professorId)
          const busy = busyId === c.id
          return (
            <Card key={c.id} className="overflow-hidden flex flex-col">
              <div className="h-24 bg-primary/5 flex items-center justify-center border-b relative">
                <span className="text-4xl">{c.thumbnail}</span>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={busy}
                      className="inline-flex size-8 items-center justify-center rounded-lg bg-background/80 hover:bg-muted transition-colors"
                    >
                      {busy ? <Loader2 className="size-4 animate-spin" /> : <MoreHorizontal className="size-4" />}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {needsPrice(c) && (
                        <>
                          <DropdownMenuItem onClick={() => openPriceDialog(c.id, c.price)}>
                            <Tag />
                            Définir le prix
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => handleTogglePublish(c.id, c.published)}>
                        {c.published ? <EyeOff /> : <Eye />}
                        {c.published ? "Dépublier" : "Publier"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/cours/${c.id}/modifier`)}>
                        <Pencil />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setToDelete(c.id)} className="text-destructive">
                        <Trash2 />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="pt-3 pb-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-foreground text-sm leading-snug">{c.title}</h2>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge variant={c.published ? "default" : "secondary"} className="text-xs">
                      {c.published ? "Publié" : "Brouillon"}
                    </Badge>
                    {needsPrice(c) && (
                      <Badge variant="outline" className="text-[10px] border-warning/50 bg-warning/10 text-warning">
                        <AlertTriangle className="size-2.5 mr-0.5" />
                        Prix à définir
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1"><Users className="size-3" />{(c.students?.length || 0)}</div>
                  <div className="flex items-center gap-1"><Clock className="size-3" />{c.duration}h</div>
                  <Badge variant="outline" className="text-xs ml-auto">{c.level}</Badge>
                </div>
                <div className="flex items-center justify-between border-t pt-2 mt-1">
                  <span className="text-xs text-muted-foreground">Prix</span>
                  {needsPrice(c) ? (
                    <span className="text-xs font-medium text-warning">En attente de l&apos;admin</span>
                  ) : (
                    <span className="text-sm font-semibold text-foreground">
                      {c.price.toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
                </div>
                {prof && <p className="text-xs text-muted-foreground">Professeur : {prof.name}</p>}
                {needsPrice(c) && (
                  <button
                    onClick={() => openPriceDialog(c.id, c.price)}
                    className={buttonVariants({ size: "sm", className: "w-full mt-1" })}
                  >
                    <Tag />
                    Définir le prix
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Aucun cours trouvé</div>
      )}

      {/* Dialog : définir le prix */}
      <Dialog open={!!priceTarget} onOpenChange={(open) => { if (!open) { setPriceTarget(null); setPriceValue(""); setError("") } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="size-4 text-warning" />
              Définir le prix du cours
            </DialogTitle>
            <DialogDescription>
              « {courseToPrice?.title} » a été proposé par un professeur. Indiquez le prix de vente
              en FCFA. Le cours deviendra achetable par les étudiants.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-1">
            <Label htmlFor="price">Prix (FCFA)</Label>
            <Input
              id="price"
              type="number"
              min={0}
              step={500}
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="Ex : 35000"
              autoFocus
            />
            {priceValue && Number(priceValue) > 0 && (
              <p className="text-xs text-muted-foreground">
                Affiché aux étudiants : <span className="font-medium text-foreground">{Number(priceValue).toLocaleString("fr-FR")} FCFA</span>
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setPriceTarget(null); setPriceValue("") }} disabled={savingPrice}>
              Annuler
            </Button>
            <Button onClick={handleSavePrice} disabled={savingPrice}>
              {savingPrice ? <Loader2 className="size-4 animate-spin" /> : <Tag className="size-4" />}
              {savingPrice ? "Enregistrement..." : "Enregistrer le prix"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!toDelete} onOpenChange={() => setToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer ce cours ?</DialogTitle>
            <DialogDescription>
              Le cours « {courseToDelete?.title} » sera définitivement supprimé, ainsi que les
              inscriptions associées. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}