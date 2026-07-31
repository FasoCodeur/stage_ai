"use client"

import { useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { PROGRAMS, PROGRAM_ENROLLMENTS, USERS, COURSES, LEVELS, type Program } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
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
  Clock,
  Users,
  Sparkles,
  Search,
  SlidersHorizontal,
  BookOpen,
  LayoutGrid,
  List,
  Star,
  Layers,
  TrendingUp,
  X,
  UserCheck,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"

const ALL = "all"

type ViewMode = "grid" | "list"

function getLevelCount(program: Program) {
  return LEVELS.filter((l) => l.programId === program.id).length
}

function ProgramCard({
  p,
  viewMode,
}: {
  p: Program
  viewMode: ViewMode
}) {
  const mentor = USERS.find((u) => u.id === p.mentorId)
  const levelCount = getLevelCount(p)
  const programEnrollments = PROGRAM_ENROLLMENTS.filter((e) => e.programId === p.id)
  const enrolledStudents = programEnrollments.length

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden flex flex-col sm:flex-row relative">
        <div className="sm:w-48 h-28 sm:h-auto bg-primary/5 flex items-center justify-center border-b sm:border-b-0 sm:border-r shrink-0">
          <span className="text-5xl">{p.thumbnail}</span>
        </div>
        <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="font-semibold text-foreground text-sm leading-snug">{p.title}</h2>
                <Badge className="bg-primary/10 text-primary text-[10px] gap-1 px-1.5 border-primary/20">
                  <Layers className="size-2.5" />
                  {p.duration} mois
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl">{p.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Calendar className="size-3" />{p.startDate} → {p.endDate}</div>
            <div className="flex items-center gap-1"><Layers className="size-3" />{levelCount} niveaux</div>
            <div className="flex items-center gap-1"><Users className="size-3" />{enrolledStudents} inscrits</div>
            {mentor && <div className="flex items-center gap-1"><UserCheck className="size-3" />Mentor: {mentor.name}</div>}
            <span className="font-semibold text-foreground ml-auto">{p.subscriptionPrice.toLocaleString("fr-FR")} FCFA<span className="text-[10px] font-normal text-muted-foreground">/mois</span></span>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-2">
            <Link
              href={`/etudiant/programmes/${p.id}`}
              className={buttonVariants({ size: "sm", className: "w-full sm:w-fit" })}
            >
              <Layers className="size-3" />
              Voir le programme
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden flex flex-col relative">
      <div className="h-28 bg-primary/5 flex items-center justify-center border-b">
        <span className="text-5xl">{p.thumbnail}</span>
      </div>
      <CardContent className="pt-4 pb-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-semibold text-foreground text-sm leading-snug">{p.title}</h2>
            <Badge variant="outline" className="text-xs shrink-0">{p.duration} mois</Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1"><Calendar className="size-3" />{p.startDate}</div>
          <div className="flex items-center gap-1"><Layers className="size-3" />{LEVELS.filter(l => l.programId === p.id).length} niveaux</div>
          <div className="flex items-center gap-1"><Users className="size-3" />{enrolledStudents} inscrits</div>
        </div>

        {mentor && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5">
            <UserCheck className="size-3.5 text-primary" />
            <span>Mentor: <strong>{mentor.name}</strong></span>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          <Link
            href={`/etudiant/programmes/${p.id}`}
            className={buttonVariants({ size: "sm", className: "w-full" })}
          >
            <Layers className="size-3" />
            Voir le programme
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ProgrammesPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const publishedPrograms = PROGRAMS.filter((p) => p.published)

  const filteredPrograms = useMemo(() => {
    const term = search.trim().toLowerCase()
    return publishedPrograms.filter((p) => {
      const matchesSearch =
        !term ||
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      return matchesSearch
    })
  }, [publishedPrograms, search])

  const hasFilters = search.trim() !== ""

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Programmes avec Mentor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredPrograms.length} programme{filteredPrograms.length > 1 ? "s" : ""} disponible{filteredPrograms.length > 1 ? "s" : ""}
            — Suivez une formation complète sur plusieurs mois avec un mentor dédié
          </p>
        </div>
      </div>

      {/* Search & view toggle */}
      <div className="flex flex-col xl:flex-row gap-3">
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
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center border rounded-lg h-9 p-0.5 bg-muted/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center rounded-md px-2.5 h-full transition-colors ${
                viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Grille"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center rounded-md px-2.5 h-full transition-colors ${
                viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Liste"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border rounded-xl bg-muted/20">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Aucun programme trouvé</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Essayez un autre mot-clé.
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={() => setSearch("")}
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
          {filteredPrograms.map((p) => (
            <ProgramCard
              key={p.id}
              p={p}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}