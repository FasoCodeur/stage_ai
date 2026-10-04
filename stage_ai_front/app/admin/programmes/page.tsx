"use client"

import { useEffect, useMemo, useState } from "react"
import { useProgramStore } from "@/lib/stores/program-store"
import { useUserStore } from "@/lib/stores/user-store"
import { Card, CardContent } from "@/components/ui/card"
import { ProgramThumbnail } from "@/components/program-thumbnail"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Users,
  Layers,
  Search,
  X,
  Eye,
  Edit,
  PlusCircle,
  Loader2,
} from "lucide-react"
import Link from "next/link"

const ALL = "all"

export default function AdminProgrammesPage() {
  const { programs, enrollments, levels, fetchPrograms, fetchLevelsByProgram, fetchEnrollmentsByProgram } = useProgramStore()
  const { users, fetchUsers } = useUserStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>(ALL)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([fetchPrograms(), fetchUsers()])
        // Charge niveaux et inscriptions pour chaque programme
        await Promise.all(programs.map((p) => Promise.all([fetchLevelsByProgram(p.id), fetchEnrollmentsByProgram(p.id)])))
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPrograms, fetchUsers])

  const filteredPrograms = useMemo(() => {
    const term = search.trim().toLowerCase()
    return programs.filter((p) => {
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      const matchesStatus =
        statusFilter === ALL ||
        (statusFilter === "published" && p.published) ||
        (statusFilter === "draft" && !p.published)
      return matchesSearch && matchesStatus
    })
  }, [programs, search, statusFilter])

  const totalStudents = useMemo(() => {
    const studentIds = new Set<string>()
    programs.forEach((p) => (p.students || []).forEach((sid) => studentIds.add(sid)))
    return studentIds.size
  }, [programs])

  const hasFilters = search.trim() || statusFilter !== ALL

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement des programmes...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Programmes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {programs.length} programme{programs.length > 1 ? "s" : ""} — {totalStudents} étudiant{totalStudents > 1 ? "s" : ""} inscrit{totalStudents > 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/programmes/nouveau"
          className={buttonVariants({ size: "sm" })}
        >
          <PlusCircle className="size-3.5" />
          Nouveau programme
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un programme..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? ALL)}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tous les statuts</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border rounded-xl bg-muted/20">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun programme trouvé</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasFilters ? "Essayez de modifier les filtres." : "Aucun programme n'a encore été créé."}
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("")
                setStatusFilter(ALL)
              }}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredPrograms.map((program) => {
            const mentor = users.find((u) => u.id === program.mentorId)
            const programEnrollments = enrollments.filter((e) => e.programId === program.id)
            const levelCount = levels.filter((l) => l.programId === program.id).length
            const avgProgress = programEnrollments.length > 0
              ? Math.round(programEnrollments.reduce((acc, e) => acc + e.progress, 0) / programEnrollments.length)
              : 0

            return (
              <Card key={program.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                  <ProgramThumbnail
                    value={program.thumbnail}
                    alt={program.title}
                    className="size-16 rounded-lg bg-primary/5 shrink-0"
                    textClassName="text-3xl"
                    iconClassName="size-6"
                  />
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-semibold text-foreground text-sm">{program.title}</h2>
                          <Badge variant={program.published ? "default" : "secondary"} className="text-[10px]">
                            {program.published ? "Publié" : "Brouillon"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{program.description}</p>
                      </div>
                      <span className="font-semibold text-foreground text-sm shrink-0">
                        {program.subscriptionPrice.toLocaleString("fr-FR")} FCFA<span className="text-[10px] font-normal text-muted-foreground">/mois</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="size-3" />{program.duration} mois</div>
                      <div className="flex items-center gap-1"><Layers className="size-3" />{levelCount} niveaux</div>
                      <div className="flex items-center gap-1"><Users className="size-3" />{programEnrollments.length} inscrits</div>
                      {mentor && <span>Mentor: {mentor.name}</span>}
                    </div>

                    {programEnrollments.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-xs">
                          <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                            <span>Progression moyenne</span>
                            <span>{avgProgress}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-1.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Link
                      href={`/admin/programmes/${program.id}`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1 sm:flex-none" })}
                    >
                      <Eye className="size-3" />
                      <span className="hidden sm:inline">Détail</span>
                    </Link>
                    <Link
                      href={`/admin/programmes/${program.id}/modifier`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1 sm:flex-none" })}
                    >
                      <Edit className="size-3" />
                      <span className="hidden sm:inline">Modifier</span>
                    </Link>
                    <Link
                      href={`/admin/programmes/${program.id}/etudiants`}
                      className={buttonVariants({ size: "sm", variant: "outline", className: "flex-1 sm:flex-none" })}
                    >
                      <Users className="size-3" />
                      <span className="hidden sm:inline">Étudiants</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}