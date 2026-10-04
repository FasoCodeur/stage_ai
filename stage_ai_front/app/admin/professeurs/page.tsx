"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUserStore } from "@/lib/stores/user-store"
import { useCourseStore } from "@/lib/stores/course-store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Plus,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Ban,
  CheckCircle,
  ArrowRightLeft,
  BookOpen,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react"

function generateAvatar(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return name.slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

const niveaux = ["Bac", "Bac+1", "Bac+2", "Bac+3", "Bac+4", "Bac+5", "Doctorat"]

export default function AdminProfesseursPage() {
  const { user: currentUser } = useAuth()
  const users = useUserStore((state) => state.users)
  const fetchUsers = useUserStore((state) => state.fetchUsers)
  const createUser = useUserStore((state) => state.createUser)
  const deleteUser = useUserStore((state) => state.deleteUser)
  const suspendUser = useUserStore((state) => state.suspendUser)
  const reactivateUser = useUserStore((state) => state.reactivateUser)
  const transferCourses = useUserStore((state) => state.transferCourses)
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  useEffect(() => {
    fetchCourses()
    fetchUsers().catch(() => {})
  }, [fetchCourses, fetchUsers])

  // Transfer modal state
  const [transferOpen, setTransferOpen] = useState(false)
  const [fromProfessor, setFromProfessor] = useState<string | null>(null)
  const [toProfessor, setToProfessor] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(true)

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    ville: "",
    niveau: "",
    password: "",
  })

  const professors = useMemo(
    () => users.filter((u) => u.role === "professeur"),
    [users]
  )

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return professors.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        (p.ville ?? "").toLowerCase().includes(term)
    )
  }, [professors, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    const passwordProvided = form.password.trim().length >= 6

    setSaving(true)
    setFeedback(null)
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: "professeur",
        avatar: generateAvatar(form.name),
        phone: form.phone.trim() || undefined,
        ville: form.ville.trim() || undefined,
        niveau: form.niveau.trim() || undefined,
        ...(passwordProvided ? { password: form.password.trim() } : {}),
      })

      setFeedback({
        type: "success",
        message: passwordProvided
          ? `Compte professeur créé pour ${form.email.trim()}.`
          : `Compte créé ! Un email contenant le mot de passe par défaut a été envoyé à ${form.email.trim()}. Le professeur pourra le changer à tout moment.`,
      })
      setForm({ name: "", email: "", phone: "", ville: "", niveau: "", password: "" })
      setOpen(false)
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erreur lors de la création du compte professeur." })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce professeur ?")) {
      deleteUser(id, currentUser ?? undefined)
    }
  }

  const handleSuspend = (id: string) => {
    suspendUser(id, currentUser ?? undefined)
  }

  const handleReactivate = (id: string) => {
    reactivateUser(id, currentUser ?? undefined)
  }

  const openTransfer = (professorId: string) => {
    setFromProfessor(professorId)
    const profCourses = courses.filter((c) => c.professorId === professorId)
    setSelectedCourses(profCourses.map((c) => c.id))
    setSelectAll(true)
    setToProfessor("")
    setTransferOpen(true)
  }

  const handleTransfer = () => {
    if (!fromProfessor || !toProfessor) return
    transferCourses(fromProfessor, toProfessor, selectAll ? undefined : selectedCourses, currentUser ?? undefined)
    setTransferOpen(false)
    setFromProfessor(null)
    setToProfessor("")
    setSelectedCourses([])
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    )
    setSelectAll(false)
  }

  const toggleSelectAll = () => {
    if (!fromProfessor) return
    const profCourses = courses.filter((c) => c.professorId === fromProfessor)
    if (selectAll) {
      setSelectedCourses([])
      setSelectAll(false)
    } else {
      setSelectedCourses(profCourses.map((c) => c.id))
      setSelectAll(true)
    }
  }

  const otherProfessors = fromProfessor
    ? professors.filter((p) => p.id !== fromProfessor)
    : []

  const fromProfCourses = fromProfessor
    ? courses.filter((c) => c.professorId === fromProfessor)
    : []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Professeurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {professors.length} professeur{professors.length > 1 ? "s" : ""} enregistré{professors.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Ajouter
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un professeur</DialogTitle>
                <DialogDescription>
                  Créez un compte professeur. Il pourra ensuite publier des cours.
                </DialogDescription>
              </DialogHeader>
              <form id="add-professor-form" onSubmit={handleSubmit} className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Amadou Diallo" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="prof@stageia.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe (optionnel)</Label>
                  <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Laisser vide → mot de passe par défaut envoyé par email" minLength={6} />
                  <p className="text-xs text-muted-foreground">
                    Si laissé vide, un mot de passe par défaut est généré et envoyé au professeur par email.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+221 ..." />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="ville">Ville</Label>
                    <Input id="ville" value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} placeholder="Dakar" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="niveau">Niveau d'études / Diplôme</Label>
                  <Input id="niveau" value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })} placeholder="Ex : Bac+5" list="niveaux-list" />
                  <datalist id="niveaux-list">
                    {niveaux.map((n) => (<option key={n} value={n} />))}
                  </datalist>
                </div>
              </form>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={saving}>Annuler</Button>
                <Button type="submit" form="add-professor-form" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                  {saving ? "Création..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-4 py-2.5 text-sm ${
            feedback.type === "success"
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="size-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Professeur</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Contact</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Localisation</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Diplôme</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Statut</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{p.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5 text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="size-3.5" />{p.email}</span>
                        {p.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{p.phone}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {p.ville || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs gap-1">
                        <GraduationCap className="size-3" />
                        {p.niveau || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.suspended ? (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 gap-1">
                          <Ban className="size-3" /> Suspendu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 gap-1">
                          <CheckCircle className="size-3" /> Actif
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {p.suspended ? (
                          <Button variant="ghost" size="icon-sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReactivate(p.id)} title="Réactiver">
                            <CheckCircle className="size-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon-sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => handleSuspend(p.id)} title="Suspendre">
                            <Ban className="size-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openTransfer(p.id)} title="Transférer les cours">
                          <ArrowRightLeft className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)} title="Supprimer">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">Aucun professeur trouvé</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transférer les cours</DialogTitle>
            <DialogDescription>
              {fromProfessor && (
                <>Transférer les cours de <strong>{professors.find((p) => p.id === fromProfessor)?.name}</strong> vers un autre professeur.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {/* Sélection des cours */}
            <div>
              <Label className="mb-1.5 block">Cours à transférer</Label>
              {fromProfCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ce professeur n'a aucun cours.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto border rounded-md p-2">
                  <div className="flex items-center gap-2 pb-1 border-b mb-1">
                    <button onClick={toggleSelectAll} className="text-xs text-primary hover:underline flex items-center gap-1">
                      {selectAll ? <CheckSquare className="size-3.5" /> : <Square className="size-3.5" />}
                      {selectAll ? "Tout désélectionner" : "Tout sélectionner"}
                    </button>
                    <span className="text-xs text-muted-foreground">({selectedCourses.length}/{fromProfCourses.length})</span>
                  </div>
                  {fromProfCourses.map((course) => (
                    <div key={course.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className="size-3.5"
                      />
                      <label htmlFor={`course-${course.id}`} className="text-xs text-foreground flex-1 truncate cursor-pointer">
                        {course.title}
                      </label>
                      <Badge variant="outline" className="text-[10px]">{course.published ? "Publié" : "Brouillon"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sélection du destinataire */}
            <div>
              <Label htmlFor="toProfessor">Professeur destinataire</Label>
              <Select value={toProfessor} onValueChange={(value) => setToProfessor(value ?? "")}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Choisir un professeur..." />
                </SelectTrigger>
                <SelectContent>
                  {otherProfessors.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} {p.suspended ? "(Suspendu)" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Annuler</Button>
            <Button onClick={handleTransfer} disabled={!toProfessor || selectedCourses.length === 0}>
              <ArrowRightLeft className="size-3.5 mr-1" />
              Transférer ({selectedCourses.length} cours)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}