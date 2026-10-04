"use client"

import { useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Target,
  Hourglass,
  TrendingUp,
  CalendarDays,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react"
import { useStageStore } from "@/lib/stores/stage-store"
import StageTabs from "@/components/stage/StageTabs"

const TACHE_STATUT = {
  a_faire: { label: "À faire", icon: Circle },
  en_cours: { label: "En cours", icon: Loader2 },
  termine: { label: "Terminé", icon: CheckCircle2 },
}

function formatDuree(dateFin: string) {
  const fin = new Date(dateFin).getTime()
  const diff = fin - Date.now()
  if (diff <= 0) return "Terminé"
  const jours = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return `${jours} j restants`
}

export default function StagePage() {
  const params = useParams()
  const id = params.id as string
  const { currentStage, isLoading, fetchStage, fetchMessages, updateTacheStatut } = useStageStore()

  useEffect(() => {
    if (id) {
      fetchStage(id).then((s) => s && fetchMessages(s.id)).catch(() => {})
    }
  }, [id, fetchStage, fetchMessages])

  const dashboard = useMemo(() => currentStage, [currentStage])

  if (isLoading && !dashboard) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (!dashboard) {
    return <div className="p-6 text-muted-foreground">Stage introuvable.</div>
  }

  const mission = dashboard.missionCourante
  const taches = dashboard.taches ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Espace Stage</h1>
          <p className="text-sm text-muted-foreground">
            {mission?.titre ?? "Mission en cours"} · Début {dashboard.dateDebut} · Fin {dashboard.dateFin}
          </p>
        </div>
        <Badge variant={dashboard.statut === "actif" ? "default" : "secondary"}>
          {dashboard.statut === "actif" ? "Actif" : dashboard.statut}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Progression</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard.progression ?? 0}%</p>
            <Progress value={dashboard.progression ?? 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Délai restant</CardTitle>
            <Hourglass className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatDuree(dashboard.dateFin)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Heures / semaine</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{dashboard.heuresSemaine ?? 0}h</p>
            <p className="text-xs text-muted-foreground mt-1">Score perf : {dashboard.scorePerformance ?? 0}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Mission courante + tâches */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="size-4" /> Mission actuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-semibold">{mission?.titre ?? "Aucune mission"}</p>
            <p className="text-sm text-muted-foreground">{mission?.description ?? "Aucune mission assignée pour l'instant."}</p>
            {mission?.deadline && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CalendarDays className="size-4" /> Échéance : {mission.deadline}
              </p>
            )}
            {mission?.objectif && <p className="text-sm">🎯 {mission.objectif}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tâches du jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {taches.length === 0 && <p className="text-sm text-muted-foreground">Aucune tâche.</p>}
            {taches.map((t: any) => {
              const st = TACHE_STATUT[t.statut as keyof typeof TACHE_STATUT] ?? TACHE_STATUT.a_faire
              const Icon = st.icon
              return (
                <div key={t.id} className="flex items-center gap-3 border rounded-md p-2.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label={t.statut === "termine" ? `Marquer "${t.titre}" comme à faire` : `Marquer "${t.titre}" comme terminé`}
                    onClick={() =>
                      updateTacheStatut(
                        mission?.id ?? "",
                        t.id,
                        t.statut === "termine" ? "a_faire" : "termine"
                      )
                    }
                  >
                    <Icon className={`size-4 ${t.statut === "termine" ? "text-green-600" : "text-muted-foreground"}`} />
                  </Button>
                  <span className={`text-sm flex-1 ${t.statut === "termine" ? "line-through text-muted-foreground" : ""}`}>
                    {t.titre}
                  </span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <StageTabs stage={dashboard} />
    </div>
  )
}