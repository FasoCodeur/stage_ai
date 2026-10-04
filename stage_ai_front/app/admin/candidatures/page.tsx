"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCandidaturesStore } from "@/lib/stores/candidatures-store"
import { useOffresStore } from "@/lib/stores/offres-store"
import { CheckCircle2, XCircle, Loader2, User } from "lucide-react"

const STATUT_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  validee: { label: "Validée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
}

export default function AdminCandidaturesPage() {
  const { candidatures, isLoading, fetchCandidatures, validerCandidature, refuserCandidature } = useCandidaturesStore()
  const { offres, fetchOffres } = useOffresStore()
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchCandidatures().catch(() => {})
    fetchOffres().catch(() => {})
  }, [fetchCandidatures, fetchOffres])

  const offreById = (id: string) => offres.find((o) => o.id === id)

  const handleValider = async (id: string) => {
    setUpdating(id)
    try {
      // mentorId optionnel : on ne le passe pas pour l'instant
      await validerCandidature(id)
      alert("Candidature validée : le stage a été créé et les acteurs notifiés.")
    } catch (e) {
      alert("Erreur lors de la validation.")
    } finally {
      setUpdating(null)
    }
  }

  const handleRefuser = async (id: string) => {
    setUpdating(id)
    try {
      await refuserCandidature(id)
    } finally {
      setUpdating(null)
    }
  }

  if (isLoading && candidatures.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Candidatures aux stages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validez une candidature pour créer automatiquement le stage et notifier les 3 acteurs.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {candidatures.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucune candidature pour l'instant.</p>
        )}
        {candidatures.map((cand) => {
          const s = STATUT_MAP[cand.statut] ?? STATUT_MAP.en_attente
          const offre = offreById(cand.offreId)
          return (
            <Card key={cand.id}>
              <CardContent className="pt-4 pb-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{offre?.titre ?? "Offre inconnue"}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="size-3" /> Étudiant : {cand.etudiantId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Soumise le {new Date(cand.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={s.variant}>{s.label}</Badge>
                  {cand.statut === "en_attente" && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-destructive border-destructive/30"
                        onClick={() => handleRefuser(cand.id)}
                        disabled={updating === cand.id}
                      >
                        {updating === cand.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle />}
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleValider(cand.id)}
                        disabled={updating === cand.id}
                      >
                        {updating === cand.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 />}
                        Valider & créer le stage
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}