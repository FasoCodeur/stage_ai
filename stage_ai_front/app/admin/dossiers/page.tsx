"use client"

import { useState } from "react"
import { STAGE_REQUESTS, StageRequest } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react"

type Status = StageRequest["status"]

const statusMap: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  validé: { label: "Validé", variant: "default" },
  en_attente: { label: "En attente", variant: "secondary" },
  refusé: { label: "Refusé", variant: "destructive" },
}

export default function AdminDossiersPage() {
  const [requests, setRequests] = useState(STAGE_REQUESTS)
  const [selected, setSelected] = useState<StageRequest | null>(null)

  const updateStatus = (id: string, status: Status) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    setSelected(null)
  }

  const pending = requests.filter((r) => r.status === "en_attente")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dossiers à valider</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pending.length} demande{pending.length > 1 ? "s" : ""} en attente de validation
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {requests.map((req) => {
          const s = statusMap[req.status]
          return (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-xl bg-muted border flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-foreground">{req.companyLogo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-foreground">{req.title}</p>
                        <p className="text-sm text-muted-foreground">{req.companyName} · {req.domain} · {req.duration}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Soumis le {req.submittedAt}</p>
                      </div>
                      <Badge variant={s.variant} className="shrink-0">{s.label}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(req)}>
                    <Eye />
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détail de la demande</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-muted border flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{selected.companyLogo}</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.title}</p>
                  <p className="text-sm text-muted-foreground">{selected.companyName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Domaine</p>
                  <p className="font-medium text-foreground mt-0.5">{selected.domain}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Durée</p>
                  <p className="font-medium text-foreground mt-0.5">{selected.duration}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{selected.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Statut actuel :</span>
                <Badge variant={statusMap[selected.status].variant}>{statusMap[selected.status].label}</Badge>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-row">
            {selected?.status === "en_attente" && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => updateStatus(selected.id, "refusé")}
                  className="flex-1"
                >
                  <XCircle />
                  Refuser
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatus(selected.id, "validé")}
                  className="flex-1"
                >
                  <CheckCircle2 />
                  Valider
                </Button>
              </>
            )}
            {selected?.status !== "en_attente" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateStatus(selected!.id, "en_attente")}
              >
                <Clock />
                Remettre en attente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
