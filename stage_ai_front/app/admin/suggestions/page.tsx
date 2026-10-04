"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useCourseSuggestionStore } from "@/lib/stores/course-suggestion-store"
import { useUserStore } from "@/lib/stores/user-store"
import { getFriendlyErrorMessage } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Lightbulb,
  Loader2,
  AlertCircle,
  Sparkles,
  PlusCircle,
  X,
  CheckCircle2,
  Clock,
  Trash2,
  Search,
} from "lucide-react"
import type { CourseSuggestion } from "@/lib/mock-data"

type Filter = "en_attente" | "acceptee" | "refusee" | "all"

const STATUT_STYLE: Record<string, string> = {
  en_attente: "border-warning/50 bg-warning/10 text-warning",
  acceptee: "border-emerald-200 bg-emerald-50 text-emerald-700",
  refusee: "border-gray-300 bg-gray-50 text-gray-500",
}

const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
}

function SuggestionsContent() {
  const router = useRouter()
  const { suggestions, fetchSuggestions, rejectSuggestion, deleteSuggestion } = useCourseSuggestionStore()
  const { users, fetchUsers } = useUserStore()

  const [filter, setFilter] = useState<Filter>("en_attente")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [motif, setMotif] = useState("")
  const [rejecting, setRejecting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchSuggestions(), fetchUsers().catch(() => [])])
      } catch (err) {
        setError(getFriendlyErrorMessage(err, "Impossible de charger les suggestions."))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [fetchSuggestions, fetchUsers])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return suggestions.filter((s) => {
      if (filter !== "all" && s.statut !== filter) return false
      if (!term) return true
      return (
        s.titre.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.justification.toLowerCase().includes(term)
      )
    })
  }, [suggestions, filter, search])

  const pendingCount = suggestions.filter((s) => s.statut === "en_attente").length

  const createCourseFrom = (s: CourseSuggestion) => {
    const params = new URLSearchParams({
      suggestion: s.id,
      title: s.titre,
      category: s.category,
      level: s.level,
      description: s.description,
    })
    router.push(`/admin/cours/nouveau?${params.toString()}`)
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setRejecting(true)
    setError("")
    try {
      await rejectSuggestion(rejectTarget, motif || undefined)
      setRejectTarget(null)
      setMotif("")
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible de refuser cette suggestion."))
    } finally {
      setRejecting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusyId(id)
    setError("")
    try {
      await deleteSuggestion(id)
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Impossible de supprimer cette suggestion."))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des suggestions...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Lightbulb className="size-5 text-warning" />
            Suggestions de cours (IA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cours manquants détectés lors de la génération des parcours personnalisés.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter((v ?? "en_attente") as Filter)}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en_attente">En attente{pendingCount > 0 ? ` (${pendingCount})` : ""}</SelectItem>
              <SelectItem value="acceptee">Acceptées</SelectItem>
              <SelectItem value="refusee">Refusées</SelectItem>
              <SelectItem value="all">Toutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3">
          <Lightbulb className="size-4 shrink-0 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {pendingCount === 1
                ? "1 cours manquant a été détecté par l'IA"
                : `${pendingCount} cours manquants ont été détectés par l'IA`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ces cours sont nécessaires pour compléter les parcours personnalisés des étudiants.
              Créez-les (la fiche sera pré-remplie) ou refusez-les.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 flex flex-col items-center gap-3 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Aucune suggestion</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Les suggestions apparaissent automatiquement quand l&apos;IA détecte, dans un parcours
                personnalisé, une compétence qu&apos;aucun cours de la plateforme ne couvre.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const demandeur = s.demandeurId ? users.find((u) => u.id === s.demandeurId) : undefined
            const busy = busyId === s.id
            return (
              <Card key={s.id} className={s.statut === "en_attente" ? "border-warning/40" : undefined}>
                <CardContent className="pt-5 pb-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-foreground">{s.titre}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.category} · {s.level}
                        {s.objectifMetier ? ` · Objectif : ${s.objectifMetier}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUT_STYLE[s.statut]}`}>
                      {STATUT_LABEL[s.statut]}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>

                  {s.competences.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.competences.map((c, i) => (
                        <span key={i} className="text-[10px] rounded-full border bg-background px-2 py-0.5 text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                    <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground leading-relaxed">{s.justification}</p>
                  </div>

                  {demandeur && (
                    <p className="text-[10px] text-muted-foreground">
                      Détecté pour : <span className="font-medium text-foreground">{demandeur.name}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 border-t pt-3 mt-auto">
                    {s.statut === "en_attente" ? (
                      <>
                        <Button size="sm" onClick={() => createCourseFrom(s)}>
                          <PlusCircle className="size-3.5" />
                          Créer ce cours
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectTarget(s.id)}
                          className="text-destructive"
                        >
                          <X className="size-3.5" />
                          Refuser
                        </Button>
                      </>
                    ) : s.statut === "acceptee" ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Cours créé
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        Suggestion refusée
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(s.id)}
                      disabled={busy}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog de refus */}
      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setMotif("") }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser cette suggestion ?</DialogTitle>
            <DialogDescription>
              L&apos;étape correspondante du parcours de l&apos;étudiant restera en attente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5 py-1">
            <Label htmlFor="motif">Motif (optionnel)</Label>
            <Input
              id="motif"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : déjà couvert par un autre cours"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setRejectTarget(null); setMotif("") }} disabled={rejecting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
              {rejecting ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
              {rejecting ? "Refus..." : "Refuser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminSuggestionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          Chargement...
        </div>
      }
    >
      <SuggestionsContent />
    </Suspense>
  )
}
