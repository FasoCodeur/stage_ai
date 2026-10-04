"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useOffresStore } from "@/lib/stores/offres-store"
import { PlusCircle, FilePlus2, Loader2 } from "lucide-react"

const STATUT_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  en_attente: { label: "En attente de validation", variant: "secondary" },
  validee: { label: "Validée", variant: "default" },
  refusee: { label: "Refusée", variant: "destructive" },
}

export default function TuteurOffresPage() {
  const { offres, isLoading, fetchOffres } = useOffresStore()

  useEffect(() => {
    // entrepriseId démo (tuteur) — à remplacer par l'id réel de l'entreprise connectée
    fetchOffres().catch(() => {})
  }, [fetchOffres])

  const mesOffres = offres

  if (isLoading && offres.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes offres de stage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publiez des offres et suivez leur statut de validation.
          </p>
        </div>
        <Link href="/tuteur/offres/nouvelle">
          <Button>
            <PlusCircle className="size-4" /> Publier une offre
          </Button>
        </Link>
      </div>

      {mesOffres.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FilePlus2 className="size-10 mx-auto mb-3 opacity-40" />
          <p>Aucune offre publiée pour le moment.</p>
          <p className="text-sm mt-1">Cliquez sur « Publier une offre » pour recruter un stagiaire virtuel.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {mesOffres.map((offre) => {
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
                <Badge variant={s.variant}>{s.label}</Badge>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}