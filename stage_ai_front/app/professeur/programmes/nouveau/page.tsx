"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NouveauProgrammePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { createProgramApi } = useProgramStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [duration, setDuration] = useState(3)
  const [subscriptionPrice, setSubscriptionPrice] = useState(15000)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    await createProgramApi({
      title,
      description,
      thumbnail,
      duration,
      subscriptionPrice,
      mentorId: user.id,
      published,
      startDate,
      endDate,
    })
    setSaving(false)
    router.push("/professeur/programmes")
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link
        href="/professeur/programmes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour à mes programmes
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Nouveau programme</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Thumbnail */}
            <div>
              <Label htmlFor="thumbnail">Image / Icône du programme</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="size-12 rounded-lg bg-primary/5 border flex items-center justify-center text-2xl shrink-0">
                  {thumbnail || "?"}
                </div>
                <Input
                  id="thumbnail"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="Titre court, symbole ou URL d'image"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Titre du programme</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Développement Web Full-Stack" required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez le programme en quelques phrases..." rows={3} required />
              </div>
              <div>
                <Label htmlFor="duration">Durée (mois)</Label>
                <Input id="duration" type="number" min={1} max={24} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
              </div>
              <div>
                <Label htmlFor="price">Prix abonnement (FCFA/mois)</Label>
                <Input id="price" type="number" min={0} step={1000} value={subscriptionPrice} onChange={(e) => setSubscriptionPrice(Number(e.target.value))} required />
              </div>
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  published ? "border-green-300 bg-green-50 text-green-700" : "border-border text-muted-foreground"
                }`}
              >
                {published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {published ? "Publié" : "Brouillon"}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className={buttonVariants({ className: "flex-1" })}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                {saving ? "Création..." : "Créer le programme"}
              </button>
              <Link href="/professeur/programmes" className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                Annuler
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}