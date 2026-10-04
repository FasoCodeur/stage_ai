"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStageStore } from "@/lib/stores/stage-store"
import { useEntrepriseCourante } from "@/hooks/use-entreprise-courante"
import { ArrowRight, Building2, AlertTriangle } from "lucide-react"

export default function TuteurStagesPage() {
  const { stages, isLoading, fetchStages } = useStageStore()
  const { entrepriseId, isLoading: resolvingEntreprise } = useEntrepriseCourante()

  useEffect(() => {
    if (!entrepriseId) return
    fetchStages(`entrepriseId=${entrepriseId}`).catch(() => {})
  }, [entrepriseId, fetchStages])

  if (resolvingEntreprise || (isLoading && stages.length === 0)) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mes stagiaires</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez vos stagiaires, évaluez les livrables et gérez les missions.
        </p>
      </div>

      {!resolvingEntreprise && !entrepriseId && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-600">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Votre compte n'est rattaché à aucune entreprise. Contactez l'administrateur
            pour accéder à vos stagiaires.
          </span>
        </div>
      )}

      {entrepriseId && stages.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="size-10 mx-auto mb-3 opacity-40" />
          <p>Aucun stage pour votre entreprise pour le moment.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">Stage · {stage.domainData?.domaine ?? "Virtuel"}</p>
                  <p className="text-xs text-muted-foreground">Étudiant : {stage.etudiantId}</p>
                </div>
                <Badge variant={stage.statut === "actif" ? "default" : "secondary"}>{stage.statut}</Badge>
              </div>
              <Link href={`/stages/${stage.id}`} className="block">
                <Button size="sm" className="w-full">
                  Gérer le stage <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}