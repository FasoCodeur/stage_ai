"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useOffresStore } from "@/lib/stores/offres-store"
import { useCandidaturesStore } from "@/lib/stores/candidatures-store"
import { useAuth } from "@/lib/auth-context"
import { getFriendlyErrorMessage } from "@/lib/api"
import { CheckCircle2, Briefcase, Clock, Loader2, AlertTriangle } from "lucide-react"

const DOMAINE_LABEL: Record<string, { label: string; color: string }> = {
  dev_web: { label: "Dev Web", color: "bg-blue-100 text-blue-700" },
  data_analyst: { label: "Data Analyst", color: "bg-purple-100 text-purple-700" },
  finance: { label: "Finance", color: "bg-emerald-100 text-emerald-700" },
  marketing: { label: "Marketing Digital", color: "bg-orange-100 text-orange-700" },
  design: { label: "Design Graphique", color: "bg-pink-100 text-pink-700" },
}

export default function OffresPage() {
  const { user } = useAuth()
  const { offres, isLoading, fetchOffres, postuler } = useOffresStore()
  const { candidatures, fetchByEtudiant } = useCandidaturesStore()
  const [search, setSearch] = useState("")
  const [domaine, setDomaine] = useState("")
  const [applying, setApplying] = useState<string | null>(null)
  const [applied, setApplied] = useState<string[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    fetchOffres("validee").catch(() => {})
  }, [fetchOffres])

  // Candidatures déjà envoyées par l'étudiant connecté (survit au rechargement)
  useEffect(() => {
    if (!user?.id) return
    fetchByEtudiant(user.id).catch(() => {})
  }, [user?.id, fetchByEtudiant])

  useEffect(() => {
    if (candidatures.length === 0) return
    setApplied((previous) =>
      Array.from(new Set([...previous, ...candidatures.map((c) => c.offreId)]))
    )
  }, [candidatures])

  const filtered = useMemo(() => {
    return offres.filter((o) => {
      const matchSearch = search ? o.titre.toLowerCase().includes(search.toLowerCase()) : true
      const matchDomaine = domaine ? o.domaine === domaine : true
      return matchSearch && matchDomaine
    })
  }, [offres, search, domaine])

  const handlePostuler = async (offreId: string) => {
    setError("")
    if (!user?.id) {
      setError("Connectez-vous avec votre compte étudiant pour postuler à une offre.")
      return
    }
    setApplying(offreId)
    try {
      await postuler(offreId, user.id)
      setApplied((p) => [...p, offreId])
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible de postuler à cette offre."))
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Offres de Stage Virtuel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Postulez en un clic aux missions proposées par nos entreprises partenaires.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Rechercher une offre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          {Object.entries(DOMAINE_LABEL).map(([key, val]) => (
            <Badge
              key={key}
              variant={domaine === key ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setDomaine(domaine === key ? "" : key)}
            >
              {val.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Liste */}
      {isLoading && offres.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Briefcase className="size-10 mx-auto mb-3 opacity-40" />
          <p>Aucune offre disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((offre) => {
            const dom = DOMAINE_LABEL[offre.domaine as string] ?? {
              label: offre.domaine,
              color: "bg-slate-100 text-slate-700",
            }
            const alreadyApplied = applied.includes(offre.id)
            return (
              <Card key={offre.id} className="flex flex-col">
                <CardContent className="pt-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-snug">{offre.titre}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Entreprise partenaire</p>
                    </div>
                    <Badge className={dom.color}>{dom.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{offre.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" /> Durée : {offre.duree} mois
                  </div>
                  <div className="mt-auto">
                    {alreadyApplied ? (
                      <Button className="w-full" variant="outline" disabled>
                        <CheckCircle2 className="size-4" /> Candidature envoyée
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handlePostuler(offre.id)}
                        disabled={applying === offre.id}
                      >
                        {applying === offre.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Postuler en 1 clic"
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}