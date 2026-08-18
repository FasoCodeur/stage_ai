"use client"

import { useEffect, useState } from "react"
import { useStageRequestStore } from "@/lib/stores/stage-request-store"
import { StageRequest } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"

type Status = StageRequest["status"]
const STATUS_MAP: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  validé: { label: "Validé", variant: "default" },
  en_attente: { label: "En attente", variant: "secondary" },
  refusé: { label: "Refusé", variant: "destructive" },
}

export default function AdminStagesPage() {
  const { stageRequests, isLoading, fetchStageRequests, updateStageRequestStatusApi } = useStageRequestStore()
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchStageRequests().catch(() => {})
  }, [fetchStageRequests])

  const updateStatus = async (id: string, status: Status) => {
    setUpdating(id)
    try {
      await updateStageRequestStatusApi(id, status)
    } finally {
      setUpdating(null)
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
        <h1 className="text-2xl font-bold text-foreground">Stages Virtuels</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestion des demandes de stage</p>
      </div>

      <div className="flex flex-col gap-3">
        {stageRequests.map((req) => {
          const s = STATUS_MAP[req.status]
          return (
            <Card key={req.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-muted border flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                    {req.companyLogo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{req.title}</p>
                    <p className="text-sm text-muted-foreground">{req.companyName} · {req.domain} · {req.duration}</p>
                    <p className="text-sm text-foreground mt-1.5 line-clamp-2">{req.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={s.variant}>{s.label}</Badge>
                    {req.status === "en_attente" && (
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, "refusé")} disabled={updating === req.id} className="h-7 text-xs text-destructive border-destructive/30">
                          {updating === req.id ? <Loader2 className="size-3 animate-spin" /> : <XCircle />}
                          Refuser
                        </Button>
                        <Button size="sm" onClick={() => updateStatus(req.id, "validé")} disabled={updating === req.id} className="h-7 text-xs">
                          {updating === req.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 />}
                          Valider
                        </Button>
                      </div>
                    )}
                    {req.status !== "en_attente" && (
                      <Button size="sm" variant="ghost" onClick={() => updateStatus(req.id, "en_attente")} disabled={updating === req.id} className="h-7 text-xs">
                        {updating === req.id ? <Loader2 className="size-3 animate-spin" /> : <Clock />}
                        Remettre en attente
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}