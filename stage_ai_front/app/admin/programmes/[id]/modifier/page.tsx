"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AdminModifierProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { fetchProgramById, updateProgramApi } = useProgramStore()
  const { users, fetchUsers } = useUserStore()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [duration, setDuration] = useState(3)
  const [subscriptionPrice, setSubscriptionPrice] = useState(15000)
  const [mentorId, setMentorId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const [program] = await Promise.all([fetchProgramById(id), fetchUsers()])
        setTitle(program.title || "")
        setDescription(program.description || "")
        setThumbnail(program.thumbnail || "")
        setDuration(program.duration || 3)
        setSubscriptionPrice(program.subscriptionPrice || 15000)
        setMentorId(program.mentorId || "")
        setStartDate(program.startDate || "")
        setEndDate(program.endDate || "")
        setPublished(program.published || false)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, fetchProgramById, fetchUsers])

  const professors = users.filter((u) => u.role === "professeur")

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du programme...
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-sm font-medium text-foreground">Programme non trouvé</p>
        <Link href="/admin/programmes" className={buttonVariants({ size: "sm", variant: "outline" })}>
          <ArrowLeft className="size-3" /> Retour
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      await updateProgramApi(id, {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnail || null,
        duration,
        subscriptionPrice,
        mentorId,
        published,
        startDate,
        endDate,
      })
      router.push(`/admin/programmes/${id}`)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la modification du programme.")
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link
        href={`/admin/programmes/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Retour au programme
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le programme</CardTitle>
          <CardDescription>
            Mettez à jour les informations générales du programme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Impossible de modifier le programme</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <ImageUpload
              value={thumbnail || null}
              onChange={(value) => setThumbnail(value ?? "")}
            />

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

            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="published">Publier le programme</Label>
                <p className="text-xs text-muted-foreground">
                  Rendre le programme visible par les étudiants immédiatement.
                </p>
              </div>
              <Switch id="published" checked={published} onCheckedChange={(v) => setPublished(Boolean(v))} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className={buttonVariants({ className: "flex-1" })}>
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <Link href={`/admin/programmes/${id}`} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                Annuler
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}