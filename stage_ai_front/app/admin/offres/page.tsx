"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOffresStore } from "@/lib/stores/offres-store"
import { CheckCircle2, XCircle, Loader2, Clock } from "lucide-react"

const STATUT_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  validee: { label: "Validée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
}

export default function AdminOffresPage() {
  const { offres, isLoading, fetchOffres, validateOffre, refuseOffre } = useOffresStore()
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchOffres().catch(() => {})
  }, [fetchOffres])

  const handleValidate = async (id: string) => {
    setUpdating(id)
    try {
      await validateOffre(id)
    } finally {
      setUpdating(null)
    }
  }

  const handleRefuse = async (id: string) => {
    setUpdating(id)
    try {
      await refuseOffre(id)
    } finally {
      setUpdating(null)
    }
  }

  if (isLoading && offres.length === 0) {
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
        <h1 className="text-2xl font-bold">Offres des entreprises</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Validez ou refusez les offres soumises par les entreprises partenaires.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {offres.length === 0 && (
          <p className="text-muted-foreground text-sm">Aucune offre soumise.</p>
        )}
        {offres.map((offre) => {
          const s = STATUT_MAP[offre.statut] ?? STATUT_MAP.en_attente
          return (
            <Card key={offre.id}>
              <CardContent className="pt-4 pb-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{offre.titre}</p>
                  <p className="text-sm text-muted-foreground">
                    Domaine : {offre.domaine} · Durée : {offre.duree} mois
                  </p>
                  <p className="text-sm text-foreground mt-1.5 line-clamp-2">{offre.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant={s.variant}>{s.label}</Badge>
                  {offre.statut === "en_attente" && (
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-destructive border-destructive/30"
                        onClick={() => handleRefuse(offre.id)}
                        disabled={updating === offre.id}
                      >
                        {updating === offre.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle />}
                        Refuser
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleValidate(offre.id)}
                        disabled={updating === offre.id}
                      >
                        {updating === offre.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 />}
                        Valider
                      </Button>
                    </div>
                  )}
                  {offre.statut !== "en_attente" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleValidate(offre.id)}>
                      <Clock className="size-3" /> Remettre validée
                    </Button>
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