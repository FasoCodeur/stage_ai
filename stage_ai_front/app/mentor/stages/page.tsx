"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useStageStore } from "@/lib/stores/stage-store"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, User, Loader2 } from "lucide-react"

export default function MentorStagesPage() {
  const { user } = useAuth()
  const { stages, isLoading, fetchStages } = useStageStore()

  useEffect(() => {
    if (!user?.id) return
    fetchStages(`mentorId=${user.id}`).catch(() => {})
  }, [user?.id, fetchStages])

  if (isLoading && stages.length === 0) {
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
          Accédez aux espaces stage de vos stagiaires pour valider la progression et donner des feedbacks.
        </p>
      </div>

      {stages.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <User className="size-10 mx-auto mb-3 opacity-40" />
          <p>Aucun stage assigné pour le moment.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {stages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">Stage · {stage.domainData?.domaine ?? "Virtuel"}</p>
                  <p className="text-xs text-muted-foreground">
                    Étudiant : {stage.etudiantId} · Fin : {stage.dateFin}
                  </p>
                </div>
                <Badge variant={stage.statut === "actif" ? "default" : "secondary"}>
                  {stage.statut}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{stage.progression ?? 0}%</span>
              </div>
              <Link href={`/stages/${stage.id}`} className="block">
                <Button size="sm" className="w-full">
                  Accéder à l'espace <ArrowRight className="size-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}