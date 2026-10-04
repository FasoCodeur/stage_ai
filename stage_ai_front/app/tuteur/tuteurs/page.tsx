"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUserStore } from "@/lib/stores/user-store"
import { useEntreprisesStore } from "@/lib/stores/entreprises-store"
import { useEntrepriseCourante } from "@/hooks/use-entreprise-courante"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Plus, Trash2, Users, UserPlus } from "lucide-react"

function generateAvatar(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return name.slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export default function TuteurTuteursPage() {
  const { user } = useAuth()
  const { users, fetchUsers, createUser } = useUserStore()
  const { getTuteurs, addTuteur, removeTuteur } = useEntreprisesStore()
  const { entrepriseId, entreprise, isLoading: resolvingEntreprise } = useEntrepriseCourante()

  const [tuteursRattaches, setTuteursRattaches] = useState<any[]>([])
  const [infoTuteurs, setInfoTuteurs] = useState<any>(null)
  const [loadingTuteurs, setLoadingTuteurs] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchUsers("tuteur").catch(() => {})
  }, [fetchUsers])

  useEffect(() => {
    if (!entrepriseId) return
    setLoadingTuteurs(true)
    getTuteurs(entrepriseId)
      .then((info) => {
        setInfoTuteurs(info)
        setTuteursRattaches(info.tuteurs)
      })
      .catch(() => setError("Impossible de charger les tuteurs rattachés."))
      .finally(() => setLoadingTuteurs(false))
  }, [entrepriseId, getTuteurs])

  const handleCreateAndAttach = async () => {
    setError("")
    setSuccess("")
    if (!form.name || !form.email || !form.password) {
      setError("Nom, email et mot de passe sont obligatoires.")
      return
    }
    setCreating(true)
    try {
      const nouveauTuteur = await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "tuteur",
        avatar: generateAvatar(form.name),
        phone: form.phone.trim() || undefined,
        entrepriseId: entrepriseId ?? undefined,
      })

      if (entrepriseId) {
        await addTuteur(entrepriseId, nouveauTuteur.id)
        const info = await getTuteurs(entrepriseId)
        setInfoTuteurs(info)
        setTuteursRattaches(info.tuteurs)
      }

      setForm({ name: "", email: "", phone: "", password: "" })
      setSuccess(`Tuteur "${nouveauTuteur.name}" créé et rattaché à l'entreprise.`)
    } catch (e: any) {
      setError(e.message || "Erreur lors de la création du tuteur.")
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveTuteur = async (tuteurId: string) => {
    if (!entrepriseId) return
    setError("")
    setSuccess("")
    try {
      await removeTuteur(entrepriseId, tuteurId)
      const info = await getTuteurs(entrepriseId)
      setInfoTuteurs(info)
      setTuteursRattaches(info.tuteurs)
    } catch (e: any) {
      setError(e.message || "Impossible de retirer le tuteur.")
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Mes tuteurs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Créez des comptes tuteur et rattachez-les à votre entreprise partenaire.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-2 text-sm text-green-600">
          {success}
        </div>
      )}

      {!resolvingEntreprise && !entrepriseId && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-600">
          Votre compte n'est pas rattaché à une entreprise. Contactez l'administrateur
          pour qu'il vous rattache à votre entreprise partenaire.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="size-4" /> Créer et rattacher un tuteur
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nom complet *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Aminata Fall" />
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tuteur@entreprise.com" />
          </div>
          <div className="space-y-2">
            <Label>Téléphone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 ..." />
          </div>
          <div className="space-y-2">
            <Label>Mot de passe *</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength={6} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={handleCreateAndAttach} disabled={creating || resolvingEntreprise || !entrepriseId}>
              {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {creating ? "Création en cours..." : "Créer et rattacher le tuteur"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" /> Tuteurs rattachés à {entreprise?.nom ?? "mon entreprise"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingTuteurs ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : infoTuteurs ? (
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="font-medium">{infoTuteurs.count}/{infoTuteurs.max} tuteurs</span>
              {infoTuteurs.limiteAtteinte && <Badge variant="secondary">Limite atteinte</Badge>}
            </div>
          ) : null}

          {tuteursRattaches.length === 0 && !loadingTuteurs && (
            <p className="text-sm text-muted-foreground">Aucun tuteur rattaché à votre entreprise.</p>
          )}

          {tuteursRattaches.map((t: any) => {
            const tut = users.find((u) => u.id === t.tuteurId)
            return (
              <div key={t.id} className="flex items-center justify-between border rounded-md p-2.5">
                <div>
                  <p className="text-sm font-medium">{tut?.name ?? t.tuteurId}</p>
                  <p className="text-xs text-muted-foreground">{tut?.email ?? "—"}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive"
                  onClick={() => handleRemoveTuteur(t.tuteurId)}
                >
                  <Trash2 className="size-3" /> Retirer
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}