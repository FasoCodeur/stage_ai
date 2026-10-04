"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useOffresStore } from "@/lib/stores/offres-store"
import { useUserStore } from "@/lib/stores/user-store"
import { useEntrepriseCourante } from "@/hooks/use-entreprise-courante"
import { getFriendlyErrorMessage } from "@/lib/api"
import { Loader2, Send, AlertTriangle } from "lucide-react"

const DOMAINES = [
  { value: "dev_web", label: "Dev Web" },
  { value: "data_analyst", label: "Data Analyst" },
  { value: "finance", label: "Finance" },
  { value: "marketing", label: "Marketing Digital" },
  { value: "design", label: "Design Graphique" },
]

export default function NouvelleOffrePage() {
  const router = useRouter()
  const { createOffre } = useOffresStore()
  const { users, fetchUsers } = useUserStore()
  const { entreprise, entrepriseId, isLoading: resolvingEntreprise } = useEntrepriseCourante()
  const entrepriseSuspendue = entreprise ? !entreprise.actif : false
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Professeurs disponibles pour suivre le stage en tant que mentor
  useEffect(() => {
    fetchUsers("professeur").catch(() => {})
  }, [fetchUsers])

  const mentors = users.filter((u) => u.role === "professeur")

  const [form, setForm] = useState({
    titre: "",
    description: "",
    missions: "",
    domaine: "dev_web",
    duree: "3",
    mentorId: "",
  })

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async () => {
    setError("")
    if (!form.titre || !form.description || !form.missions) {
      setError("Veuillez remplir tous les champs obligatoires.")
      return
    }
    if (!entrepriseId) {
      setError("Votre compte n'est rattaché à aucune entreprise. Contactez l'administrateur.")
      return
    }
    if (entrepriseSuspendue) {
      setError("Votre entreprise est suspendue : impossible de publier une nouvelle offre.")
      return
    }
    setSubmitting(true)
    try {
      await createOffre({
        titre: form.titre.trim(),
        description: form.description,
        missions: form.missions,
        domaine: form.domaine,
        duree: form.duree,
        entrepriseId,
        ...(form.mentorId ? { mentorId: form.mentorId } : {}),
      })
      router.push("/tuteur/offres")
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Erreur lors de la soumission de l'offre."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Soumettre une offre de stage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Définissez la mission que vous proposez à un stagiaire virtuel.
        </p>
      </div>

      {resolvingEntreprise && (
        <Skeleton className="h-12 w-full" />
      )}

      {!resolvingEntreprise && !entrepriseId && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-600">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Votre compte n'est rattaché à aucune entreprise. Contactez l'administrateur
            pour qu'il vous rattache avant de publier une offre.
          </span>
        </div>
      )}

      {entrepriseSuspendue && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-600">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>
            Votre entreprise partenaire est suspendue : la publication d'offres est bloquée.
            Contactez l'administrateur pour la réactiver.
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails de l'offre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Intitulé du stage *</Label>
            <Input value={form.titre} onChange={(e) => update("titre", e.target.value)} placeholder="Ex: Développeur React" />
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Décrivez le contexte et la mission globale..." />
          </div>
          <div className="space-y-2">
            <Label>Missions *</Label>
            <Textarea value={form.missions} onChange={(e) => update("missions", e.target.value)} placeholder="Listez les missions du stagiaire..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domaine</Label>
              <select
                className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                value={form.domaine}
                onChange={(e) => update("domaine", e.target.value)}
              >
                {DOMAINES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Durée (mois)</Label>
              <Input type="number" min={1} max={12} value={form.duree} onChange={(e) => update("duree", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mentor (professeur)</Label>
            <select
              className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              value={form.mentorId}
              onChange={(e) => update("mentorId", e.target.value)}
            >
              <option value="">À désigner plus tard</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Le mentor suivra le stage du stagiaire retenu (progression, livrables, feedbacks).
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || resolvingEntreprise || !entrepriseId || entrepriseSuspendue}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Soumettre l'offre
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}