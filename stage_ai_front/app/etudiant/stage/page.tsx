"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useStageRequestStore } from "@/lib/stores/stage-request-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  validé: { label: "Validé", icon: CheckCircle2, color: "text-chart-3", bg: "bg-chart-3/10", variant: "default" as const },
  en_attente: { label: "En attente", icon: Clock, color: "text-warning", bg: "bg-warning/10", variant: "secondary" as const },
  refusé: { label: "Refusé", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", variant: "destructive" as const },
}

export default function EtudiantStagePage() {
  const { user } = useAuth()
  const { stageRequests, isLoading, fetchStageRequests, createStageRequest } = useStageRequestStore()
  const [applying, setApplying] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStageRequests().catch(() => {})
  }, [fetchStageRequests])

  const myStage = stageRequests.find((s) => s.studentId === user?.id)
  const availableStages = stageRequests.filter((s) => !s.studentId)

  const applyToStage = async (stageId: string, companyName: string, companyLogo: string, title: string, description: string, duration: string, domain: string) => {
    if (!user || applying) return
    setApplying(stageId)
    setError("")
    try {
      await createStageRequest({
        companyName,
        companyLogo,
        title,
        description,
        duration,
        domain,
        studentId: user.id,
        status: "en_attente",
      })
    } catch (err: any) {
      setError(err.message || "Erreur lors de la candidature")
    } finally {
      setApplying(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des stages...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stage Virtuel</h1>
        <p className="text-sm text-muted-foreground mt-1">Découvrez des opportunités de stage et postulez</p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* My current stage */}
      {myStage && (() => {
        const cfg = STATUS_CONFIG[myStage.status]
        return (
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-foreground">Mon stage</h2>
            <Card className="border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className={cn("size-12 rounded-xl flex items-center justify-center text-sm font-bold shrink-0", cfg.bg, cfg.color)}>
                    {myStage.companyLogo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{myStage.title}</p>
                        <p className="text-sm text-muted-foreground">{myStage.companyName} · {myStage.domain} · {myStage.duration}</p>
                        <p className="text-sm text-foreground mt-2">{myStage.description}</p>
                      </div>
                      <Badge variant={cfg.variant} className="shrink-0 flex items-center gap-1">
                        <cfg.icon className="size-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* Available stages */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Stages disponibles</h2>
        {availableStages.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun stage disponible pour le moment.</p>
        )}
        {availableStages.map((stage) => (
          <Card key={stage.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {stage.companyLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{stage.title}</p>
                  <p className="text-sm text-muted-foreground">{stage.companyName} · {stage.domain} · {stage.duration}</p>
                  <p className="text-sm text-foreground mt-1.5 line-clamp-2">{stage.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">{stage.domain}</Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="size-3 mr-1" />
                      {stage.duration}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 mt-1"
                  disabled={!!myStage || applying === stage.id}
                  onClick={() => applyToStage(stage.id, stage.companyName, stage.companyLogo, stage.title, stage.description, stage.duration, stage.domain)}
                >
                  {applying === stage.id ? <Loader2 className="size-3.5 animate-spin" /> : <Briefcase />}
                  {applying === stage.id ? "Candidature..." : "Postuler"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}