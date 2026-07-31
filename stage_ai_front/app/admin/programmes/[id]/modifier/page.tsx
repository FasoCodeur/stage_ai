"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { PROGRAMS, USERS } from "@/lib/mock-data"
import { useProgramStore } from "@/lib/stores/program-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function AdminModifierProgrammePage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const { updateProgram } = useProgramStore()

  const program = PROGRAMS.find((p) => p.id === id)

  const [title, setTitle] = useState(program?.title || "")
  const [description, setDescription] = useState(program?.description || "")
  const [thumbnail, setThumbnail] = useState(program?.thumbnail || "🚀")
  const [duration, setDuration] = useState(program?.duration || 3)
  const [subscriptionPrice, setSubscriptionPrice] = useState(program?.subscriptionPrice || 15000)
  const [mentorId, setMentorId] = useState(program?.mentorId || "")
  const [startDate, setStartDate] = useState(program?.startDate || "")
  const [endDate, setEndDate] = useState(program?.endDate || "")
  const [published, setPublished] = useState(program?.published || false)
  const [saving, setSaving] = useState(false)

  const professors = [
    { id: "u2", name: "Fatou Ndiaye" },
    { id: "u1", name: "Amadou Diallo" },
  ]

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-medium text-foreground">Programme non trouvé</p>
        <Link href="/admin/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    updateProgram(program.id, {
      title,
      description,
      thumbnail,
      duration,
      subscriptionPrice,
      mentorId,
      published,
      startDate,
      endDate,
    })
    router.push(`/admin/programmes/${program.id}`)
  }

  const emojis = ["🚀", "🤖", "🎨", "📊", "💻", "🌐", "📱", "🔒", "🧠", "🎯", "⚡", "🔥"]

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link
        href={`/admin/programmes/${program.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour au programme
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le programme</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label>Icône du programme</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setThumbnail(emoji)}
                    className={`size-10 rounded-lg border flex items-center justify-center text-xl transition-all ${
                      thumbnail === emoji ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-muted"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
              </div>
              <div>
                <Label htmlFor="duration">Durée (mois)</Label>
                <Input id="duration" type="number" min={1} max={24} value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
              </div>
              <div>
                <Label htmlFor="price">Prix (FCFA/mois)</Label>
                <Input id="price" type="number" min={0} step={1000} value={subscriptionPrice} onChange={(e) => setSubscriptionPrice(Number(e.target.value))} required />
              </div>
              <div>
                <Label htmlFor="mentor">Mentor</Label>
                <Select value={mentorId} onValueChange={(value) => setMentorId(value ?? "")}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professors.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
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
                <Save className="size-3.5" />
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <Link href={`/admin/programmes/${program.id}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                Annuler
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}