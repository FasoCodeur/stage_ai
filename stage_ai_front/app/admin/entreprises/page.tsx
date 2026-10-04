"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEntreprisesStore, type TuteurEntreprise, type TuteursResponse, type CompteAccesEntreprise } from "@/lib/stores/entreprises-store"
import { useUserStore } from "@/lib/stores/user-store"
import { getFriendlyErrorMessage } from "@/lib/api"
import { type Entreprise } from "@/lib/mock-data"
import {
  Building2,
  Plus,
  Trash2,
  Loader2,
  Users,
  Search,
  Mail,
  Phone,
  Globe,
  MapPin,
  CalendarDays,
  Pencil,
  Ban,
  CheckCircle2,
  Eye,
  X,
  KeyRound,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react"

type StatutFiltre = "toutes" | "actives" | "suspendues"

const EMPTY_FORM = { nom: "", email: "", contact: "", secteur: "", siteWeb: "", adresse: "" }

const FILTRES: { value: StatutFiltre; label: string }[] = [
  { value: "toutes", label: "Toutes" },
  { value: "actives", label: "Actives" },
  { value: "suspendues", label: "Suspendues" },
]

/** Initiales affichées dans la pastille de l'entreprise. */
function initiales(nom: string) {
  const parts = nom.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatDate(value?: string) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

/** Ajoute le protocole manquant pour que le lien soit cliquable. */
function lienExterne(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function AdminEntreprisesPage() {
  const {
    entreprises,
    isLoading,
    fetchEntreprises,
    createEntreprise,
    updateEntreprise,
    deleteEntreprise,
    getTuteurs,
    addTuteur,
    removeTuteur,
  } = useEntreprisesStore()
  const { users, fetchUsers } = useUserStore()

  // Création
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)

  // Modification
  const [editing, setEditing] = useState<Entreprise | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [savingEdit, setSavingEdit] = useState(false)

  // Détails
  const [details, setDetails] = useState<Entreprise | null>(null)

  // Tuteurs
  const [tuteursMap, setTuteursMap] = useState<Record<string, TuteursResponse>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)

  // Liste
  const [search, setSearch] = useState("")
  const [statutFiltre, setStatutFiltre] = useState<StatutFiltre>("toutes")

  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Identifiants du compte d'accès affichés juste après la création d'une entreprise
  const [compteCree, setCompteCree] = useState<CompteAccesEntreprise | null>(null)
  const [copie, setCopie] = useState("")

  useEffect(() => {
    fetchEntreprises().catch(() => {})
    fetchUsers("tuteur").catch(() => {})
  }, [fetchEntreprises, fetchUsers])

  const tuteursDisponibles = users.filter((u) => u.role === "tuteur")
  const tuteurParId = (id: string) => users.find((u) => u.id === id)

  const stats = useMemo(() => ({
    total: entreprises.length,
    actives: entreprises.filter((e) => e.actif).length,
    suspendues: entreprises.filter((e) => !e.actif).length,
  }), [entreprises])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entreprises.filter((ent) => {
      const matchStatut =
        statutFiltre === "toutes" ? true : statutFiltre === "actives" ? ent.actif : !ent.actif
      const matchSearch = !q
        ? true
        : [ent.nom, ent.email, ent.contact, ent.secteur, ent.adresse, ent.siteWeb]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
      return matchStatut && matchSearch
    })
  }, [entreprises, search, statutFiltre])

  const loadTuteurs = async (id: string) => {
    try {
      const data = await getTuteurs(id)
      setTuteursMap((prev) => ({ ...prev, [id]: data }))
      return data
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible de charger les tuteurs de cette entreprise."))
      return null
    }
  }

  const toggleOpen = async (id: string) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    if (!tuteursMap[id]) await loadTuteurs(id)
  }

  const openDetails = async (ent: Entreprise) => {
    setError("")
    setSuccess("")
    setDetails(ent)
    if (!tuteursMap[ent.id]) await loadTuteurs(ent.id)
  }

  const handleCreate = async () => {
    setError("")
    setSuccess("")
    if (!form.nom.trim() || !form.email.trim()) {
      setError("Le nom et l'email sont obligatoires.")
      return
    }
    setCreating(true)
    try {
      const nom = form.nom.trim()
      const { entreprise, compte } = await createEntreprise({
        nom,
        email: form.email.trim(),
        contact: form.contact.trim(),
        secteur: form.secteur.trim() || undefined,
        siteWeb: form.siteWeb.trim() || undefined,
        adresse: form.adresse.trim() || undefined,
        actif: true,
      })
      setForm(EMPTY_FORM)
      setShowCreate(false)
      setCompteCree(compte)
      setSuccess(
        compte.cree
          ? `Entreprise "${entreprise.nom}" créée avec son compte d'accès.`
          : `Entreprise "${entreprise.nom}" créée.`,
      )
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Erreur lors de la création de l'entreprise."))
    } finally {
      setCreating(false)
    }
  }

  /** Copie un texte dans le presse-papier (identifiants du compte d'accès). */
  const copier = async (texte: string, cle: string) => {
    try {
      await navigator.clipboard.writeText(texte)
      setCopie(cle)
      setTimeout(() => setCopie(""), 2000)
    } catch {
      setError("Copie impossible automatiquement : sélectionnez le texte à la main.")
    }
  }

  const openEdit = (ent: Entreprise) => {
    setError("")
    setSuccess("")
    setEditing(ent)
    setEditForm({
      nom: ent.nom ?? "",
      email: ent.email ?? "",
      contact: ent.contact ?? "",
      secteur: ent.secteur ?? "",
      siteWeb: ent.siteWeb ?? "",
      adresse: ent.adresse ?? "",
    })
  }

  const handleUpdate = async () => {
    if (!editing) return
    setError("")
    setSuccess("")
    if (!editForm.nom.trim() || !editForm.email.trim()) {
      setError("Le nom et l'email sont obligatoires.")
      return
    }
    setSavingEdit(true)
    try {
      const updated = await updateEntreprise(editing.id, {
        nom: editForm.nom.trim(),
        email: editForm.email.trim(),
        contact: editForm.contact.trim(),
        secteur: editForm.secteur.trim(),
        siteWeb: editForm.siteWeb.trim(),
        adresse: editForm.adresse.trim(),
      })
      setEditing(null)
      setDetails((prev) => (prev && prev.id === updated.id ? updated : prev))
      setSuccess(`Entreprise "${updated.nom}" mise à jour.`)
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Erreur lors de la modification de l'entreprise."))
    } finally {
      setSavingEdit(false)
    }
  }

  const handleToggleActif = async (ent: Entreprise) => {
    if (ent.actif && !confirm(`Suspendre l'entreprise "${ent.nom}" ? Elle ne pourra plus publier de nouvelles offres.`)) {
      return
    }
    setError("")
    setSuccess("")
    setBusyId(ent.id)
    try {
      const updated = await updateEntreprise(ent.id, { actif: !ent.actif })
      setDetails((prev) => (prev && prev.id === updated.id ? updated : prev))
      setSuccess(updated.actif ? `"${updated.nom}" a été réactivée.` : `"${updated.nom}" a été suspendue.`)
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible de changer le statut de l'entreprise."))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (ent: Entreprise) => {
    if (!confirm(`Supprimer définitivement l'entreprise "${ent.nom}" ?\nLes rattachements tuteur seront supprimés. La suppression échouera si des offres ou des stages y sont rattachés.`)) return
    setError("")
    setSuccess("")
    setBusyId(ent.id)
    try {
      await deleteEntreprise(ent.id)
      setDetails((prev) => (prev && prev.id === ent.id ? null : prev))
      setOpenId((prev) => (prev === ent.id ? null : prev))
      setSuccess(`Entreprise "${ent.nom}" supprimée.`)
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible de supprimer l'entreprise."))
    } finally {
      setBusyId(null)
    }
  }

  const handleAddTuteur = async (entrepriseId: string, tuteurId: string) => {
    setAdding(entrepriseId)
    setError("")
    setSuccess("")
    try {
      await addTuteur(entrepriseId, tuteurId)
      await loadTuteurs(entrepriseId)
      const tuteur = tuteurParId(tuteurId)
      setSuccess(`Tuteur ${tuteur?.name ?? ""} rattaché à l'entreprise.`)
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible d'ajouter le tuteur."))
    } finally {
      setAdding(null)
    }
  }

  const handleRemoveTuteur = async (entrepriseId: string, tuteurId: string) => {
    setError("")
    setSuccess("")
    try {
      await removeTuteur(entrepriseId, tuteurId)
      await loadTuteurs(entrepriseId)
      setSuccess("Tuteur retiré de l'entreprise.")
    } catch (e) {
      setError(getFriendlyErrorMessage(e, "Impossible de retirer le tuteur."))
    }
  }

  if (isLoading && entreprises.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Entreprises partenaires</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consultez les coordonnées, gérez les tuteurs et suspendez ou supprimez une entreprise.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowCreate((v) => !v)
            setError("")
            setSuccess("")
          }}
        >
          {showCreate ? <X className="size-4" /> : <Plus className="size-4" />}
          {showCreate ? "Fermer" : "Nouvelle entreprise"}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Partenaires référencés</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Actives</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.actives}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Suspendues</p>
            <p className="text-2xl font-bold text-amber-600">{stats.suspendues}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-600">
          {success}
        </div>
      )}

      {/* Création */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="size-4" /> Nouvelle entreprise partenaire
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Ex: FasoDigit" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@entreprise.com" />
            </div>
            <div className="space-y-2">
              <Label>Téléphone / contact</Label>
              <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+226 70 00 00 00" />
            </div>
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Input value={form.secteur} onChange={(e) => setForm({ ...form, secteur: e.target.value })} placeholder="Technologie, Finance..." />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input value={form.siteWeb} onChange={(e) => setForm({ ...form, siteWeb: e.target.value })} placeholder="https://entreprise.com" />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="Ouagadougou, Burkina Faso" />
            </div>
            <div className="sm:col-span-2">
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Créer l'entreprise
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Rechercher par nom, email, secteur, adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTRES.map((f) => (
            <Badge
              key={f.value}
              variant={statutFiltre === f.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatutFiltre(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center border rounded-lg bg-muted/20">
          {entreprises.length === 0
            ? "Aucune entreprise partenaire pour le moment."
            : "Aucune entreprise ne correspond à votre recherche."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((ent) => {
            const info = tuteursMap[ent.id]
            return (
              <Card key={ent.id} className={ent.actif ? "" : "border-amber-500/40"}>
                <CardContent className="pt-5 space-y-3">
                  {/* Identité */}
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {initiales(ent.nom)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{ent.nom}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {ent.secteur && <Badge variant="outline" className="text-[10px]">{ent.secteur}</Badge>}
                        <Badge variant={ent.actif ? "default" : "secondary"} className="text-[10px]">
                          {ent.actif ? "Active" : "Suspendue"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Coordonnées */}
                  <div className="space-y-1.5 text-xs">
                    <p className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                      <a href={`mailto:${ent.email}`} className="truncate hover:underline text-foreground">{ent.email}</a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0 text-muted-foreground" />
                      {ent.contact ? (
                        <a href={`tel:${ent.contact}`} className="hover:underline text-foreground">{ent.contact}</a>
                      ) : (
                        <span className="italic text-muted-foreground">Téléphone non renseigné</span>
                      )}
                    </p>
                    {ent.siteWeb && (
                      <p className="flex items-center gap-2">
                        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                        <a href={lienExterne(ent.siteWeb)} target="_blank" rel="noreferrer" className="truncate hover:underline text-foreground">
                          {ent.siteWeb}
                        </a>
                      </p>
                    )}
                    {ent.adresse && (
                      <p className="flex items-center gap-2">
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-foreground">{ent.adresse}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-3.5 shrink-0" />
                      {formatDate(ent.createdAt) ? `Partenaire depuis le ${formatDate(ent.createdAt)}` : "Date de création inconnue"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-1.5 border-t pt-3">
                    <Button size="sm" variant="outline" onClick={() => openDetails(ent)}>
                      <Eye className="size-3.5" /> Détails
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(ent)}>
                      <Pencil className="size-3.5" /> Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={ent.actif ? "text-amber-600 border-amber-500/40" : "text-emerald-600 border-emerald-500/40"}
                      disabled={busyId === ent.id}
                      onClick={() => handleToggleActif(ent)}
                    >
                      {busyId === ent.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : ent.actif ? (
                        <Ban className="size-3.5" />
                      ) : (
                        <CheckCircle2 className="size-3.5" />
                      )}
                      {ent.actif ? "Suspendre" : "Réactiver"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      disabled={busyId === ent.id}
                      onClick={() => handleDelete(ent)}
                    >
                      <Trash2 className="size-3.5" /> Supprimer
                    </Button>
                  </div>

                  {/* Tuteurs */}
                  <Button size="sm" variant="ghost" className="w-full justify-start" onClick={() => toggleOpen(ent.id)}>
                    <Users className="size-3.5" />
                    {openId === ent.id ? "Masquer les tuteurs" : "Gérer les tuteurs"}
                    {info ? ` (${info.count}/${info.max})` : ""}
                  </Button>

                  {openId === ent.id && (
                    <div className="space-y-3 border-t pt-3">
                      {!info && <p className="text-xs text-muted-foreground">Chargement des tuteurs...</p>}
                      {info && (
                        <>
                          {info.tuteurs.length === 0 && (
                            <p className="text-sm text-muted-foreground">Aucun tuteur rattaché.</p>
                          )}
                          {info.tuteurs.map((t: TuteurEntreprise) => {
                            const tut = tuteurParId(t.tuteurId)
                            return (
                              <div key={t.id} className="flex items-center justify-between border rounded-md p-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate flex items-center gap-1.5">
                                    {tut?.name ?? t.tuteurId}
                                    {tut?.email === ent.email && (
                                      <Badge variant="outline" className="text-[10px] shrink-0">Compte principal</Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">{tut?.email ?? "Email inconnu"}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-destructive"
                                  onClick={() => handleRemoveTuteur(ent.id, t.tuteurId)}
                                >
                                  <Trash2 className="size-3" /> Retirer
                                </Button>
                              </div>
                            )
                          })}

                          {!info.limiteAtteinte ? (
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Ajouter un tuteur (rôle tuteur) :</p>
                              <div className="flex gap-2">
                                <select
                                  className="flex h-9 flex-1 rounded-md border bg-transparent px-3 py-1 text-sm"
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) handleAddTuteur(ent.id, e.target.value)
                                  }}
                                  disabled={adding === ent.id}
                                >
                                  <option value="" disabled>Sélectionner un tuteur...</option>
                                  {tuteursDisponibles.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                  ))}
                                </select>
                                {adding === ent.id && <Loader2 className="size-4 animate-spin self-center" />}
                              </div>
                              {tuteursDisponibles.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                  Aucun utilisateur avec le rôle « tuteur ». Créez-en un d'abord.
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Limite de {info.max} tuteurs atteinte pour cette entreprise.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog : identifiants du compte d'accès créé */}
      <Dialog open={!!compteCree} onOpenChange={(open) => { if (!open) setCompteCree(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4" /> Compte d'accès de l'entreprise
            </DialogTitle>
            <DialogDescription>
              {compteCree?.cree
                ? "Transmettez ces identifiants à l'entreprise : elle peut se connecter dès maintenant pour publier des offres et suivre ses stagiaires."
                : "Information sur le compte d'accès de cette entreprise."}
            </DialogDescription>
          </DialogHeader>

          {compteCree?.cree ? (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Email de connexion</p>
                <p className="text-sm font-medium break-all text-foreground">{compteCree.email}</p>
              </div>

              <div className="rounded-lg border bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Mot de passe provisoire</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-mono font-medium text-foreground">{compteCree.motDePasse}</p>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => copier(`${compteCree.email} / ${compteCree.motDePasse}`, "identifiants")}
                  >
                    {copie === "identifiants" ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copie === "identifiants" ? "Copié" : "Copier"}
                  </Button>
                </div>
              </div>

              <p className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs text-amber-600">
                ⚠️ Mot de passe provisoire (il a aussi été envoyé par email à l'entreprise).
                Demandez-lui de le changer dès sa première connexion, via le menu du compte →
                « Changer le mot de passe ».
              </p>

              <p className="text-xs text-muted-foreground">
                L'entreprise pourra ensuite créer d'autres utilisateurs (dans la limite de 3 par
                entreprise) pour suivre ses stagiaires depuis « Mes tuteurs ».
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{compteCree?.message}</p>
          )}

          <DialogFooter>
            <Button onClick={() => setCompteCree(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : détails de l'entreprise */}
      <Dialog open={!!details} onOpenChange={(open) => { if (!open) setDetails(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {details?.nom}
              {details && (
                <Badge variant={details.actif ? "default" : "secondary"}>
                  {details.actif ? "Active" : "Suspendue"}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              Fiche de l'entreprise partenaire et tuteurs rattachés.
            </DialogDescription>
          </DialogHeader>

          {details && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={details.email} href={`mailto:${details.email}`} />
                <InfoRow icon={Phone} label="Téléphone" value={details.contact} href={details.contact} phone />
                <InfoRow icon={Building2} label="Secteur" value={details.secteur} />
                <InfoRow icon={Globe} label="Site web" value={details.siteWeb} href={details.siteWeb ? lienExterne(details.siteWeb) : undefined} />
                <InfoRow icon={MapPin} label="Adresse" value={details.adresse} />
                <InfoRow icon={CalendarDays} label="Partenaire depuis" value={formatDate(details.createdAt)} />
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="size-4" />
                  Tuteurs rattachés
                  {tuteursMap[details.id] ? ` (${tuteursMap[details.id].count}/${tuteursMap[details.id].max})` : ""}
                </p>
                {!tuteursMap[details.id] && (
                  <p className="text-xs text-muted-foreground">Chargement des tuteurs...</p>
                )}
                {tuteursMap[details.id] && tuteursMap[details.id].tuteurs.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun tuteur rattaché à cette entreprise.</p>
                )}
                {tuteursMap[details.id]?.tuteurs.map((t: TuteurEntreprise) => {
                  const tut = tuteurParId(t.tuteurId)
                  return (
                    <div key={t.id} className="flex items-center justify-between border rounded-md p-2 mb-2 last:mb-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate flex items-center gap-1.5">
                          {tut?.name ?? t.tuteurId}
                          {tut?.email === details.email && (
                            <Badge variant="outline" className="text-[10px] shrink-0">Compte principal</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{tut?.email ?? "Email inconnu"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-destructive"
                        onClick={() => handleRemoveTuteur(details.id, t.tuteurId)}
                      >
                        <Trash2 className="size-3" /> Retirer
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetails(null)}>Fermer</Button>
            {details && (
              <Button
                variant="outline"
                className={details.actif ? "text-amber-600 border-amber-500/40" : "text-emerald-600 border-emerald-500/40"}
                disabled={busyId === details.id}
                onClick={() => handleToggleActif(details)}
              >
                {details.actif ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                {details.actif ? "Suspendre" : "Réactiver"}
              </Button>
            )}
            {details && (
              <Button
                onClick={() => {
                  const courant = details
                  setDetails(null)
                  openEdit(courant)
                }}
              >
                <Pencil className="size-3.5" /> Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog : modification */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'entreprise</DialogTitle>
            <DialogDescription>
              Mettez à jour les coordonnées de l'entreprise partenaire.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2 py-2">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone / contact</Label>
              <Input value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} placeholder="+226 70 00 00 00" />
            </div>
            <div className="space-y-2">
              <Label>Secteur</Label>
              <Input value={editForm.secteur} onChange={(e) => setEditForm({ ...editForm, secteur: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Site web</Label>
              <Input value={editForm.siteWeb} onChange={(e) => setEditForm({ ...editForm, siteWeb: e.target.value })} placeholder="https://entreprise.com" />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={editForm.adresse} onChange={(e) => setEditForm({ ...editForm, adresse: e.target.value })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={savingEdit}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={savingEdit}>
              {savingEdit ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Ligne d'information affichée dans la fiche détaillée d'une entreprise. */
function InfoRow({
  icon: Icon,
  label,
  value,
  href,
  phone,
}: {
  icon: LucideIcon
  label: string
  value?: string | null
  href?: string
  phone?: boolean
}) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <Icon className="size-3" /> {label}
      </p>
      {value ? (
        href ? (
          <a
            href={phone ? `tel:${value}` : href}
            target={phone ? undefined : "_blank"}
            rel={phone ? undefined : "noreferrer"}
            className="text-sm font-medium text-foreground hover:underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground break-all">{value}</p>
        )
      ) : (
        <p className="text-sm italic text-muted-foreground">Non renseigné</p>
      )}
    </div>
  )
}
