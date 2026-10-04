"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TravailTab from "./travail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Database,
  LineChart,
  FileText,
  Video,
  MessageSquare,
  Upload,
  ExternalLink,
} from "lucide-react"
import { useState, useRef } from "react"
import { useStageStore } from "@/lib/stores/stage-store"

const LIVRABLE_STATUT: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  a_rendre: { label: "À rendre", variant: "secondary" },
  rendu: { label: "Rendu", variant: "outline" },
  valide: { label: "Validé", variant: "default" },
  rejete: { label: "Rejeté", variant: "destructive" },
}

interface StageTabsProps {
  stage: any
}

export default function StageTabs({ stage }: StageTabsProps) {
  const [onglet, setOnglet] = useState("travail")
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploaded, setUploaded] = useState(false)
  const { messages, envoyerMessage } = useStageStore()
  const [message, setMessage] = useState("")

  const envoyer = async () => {
    if (!message.trim()) return
    try {
      await envoyerMessage(stage.id, "etudiant-demo", message)
      setMessage("")
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Tabs value={onglet} onValueChange={setOnglet} className="w-full">
      <TabsList className="w-full justify-start flex-wrap h-auto">
        <TabsTrigger value="travail"><Briefcase className="size-4" /> Travail</TabsTrigger>
        <TabsTrigger value="donnees"><Database className="size-4" /> Données</TabsTrigger>
        <TabsTrigger value="resultats"><LineChart className="size-4" /> Résultats</TabsTrigger>
        <TabsTrigger value="documentation"><FileText className="size-4" /> Documentation</TabsTrigger>
        <TabsTrigger value="reunions"><Video className="size-4" /> Réunions</TabsTrigger>
        <TabsTrigger value="chat"><MessageSquare className="size-4" /> Chat</TabsTrigger>
      </TabsList>

      <TabsContent value="travail" className="mt-4">
        <TravailTab stage={stage} />
      </TabsContent>

      <TabsContent value="donnees" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Données & Ressources</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Fichiers mis à disposition par l'entreprise (la liste s'affichera ici).
            </div>
            <Button variant="outline" size="sm">
              <Upload className="size-4" /> Importer un fichier
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resultats" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Résultats & Indicateurs</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Score de performance : <Badge variant="secondary">{stage.scorePerformance ?? 0}%</Badge></div>
            <div>Progression : <Badge variant="secondary">{stage.progression ?? 0}%</Badge></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documentation" className="mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Livrables</CardTitle>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={() => setUploaded(true)}
            />
            <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploaded}>
              {uploaded ? "Fichier ajouté ✓" : "Déposer un livrable"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stage.livrables ?? []).length === 0 && (
              <div className="text-sm text-muted-foreground">Aucun livrable demandé pour l'instant.</div>
            )}
            {(stage.livrables ?? []).map((liv: any) => {
              const s = LIVRABLE_STATUT[liv.statut] ?? LIVRABLE_STATUT.a_rendre
              return (
                <div key={liv.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium text-sm">{liv.titre}</p>
                    {liv.fichierUrl && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{liv.fichierUrl}</p>}
                  </div>
                  <Badge variant={s.variant}>{s.label}</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reunions" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Réunions à venir</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(stage.reunions ?? []).length === 0 && (
              <div className="text-sm text-muted-foreground">Aucune réunion planifiée.</div>
            )}
            {(stage.reunions ?? []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <p className="font-medium text-sm">{r.titre}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.dateReunion).toLocaleString("fr-FR")} · {r.type === "cohorte" ? "Session de cohorte" : "Réunion de stage"}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  <ExternalLink className="size-4" /> Rejoindre
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="chat" className="mt-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Messagerie</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-64 overflow-y-auto border rounded-md p-3 space-y-2 bg-muted/20">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center mt-20">Aucun message. Démarrez la conversation !</p>
              )}
              {messages.map((m: any) => (
                <div key={m.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${m.expediteurId === "etudiant-demo" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}>
                  {m.contenu}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && envoyer()}
                className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
                placeholder="Écrivez un message..."
              />
              <Button size="sm" onClick={envoyer} disabled={!message.trim()}>Envoyer</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}